<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AdminSection;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\AdminRole;
use App\Models\AdminSession;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Services\AdminAccountMailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin user management (Super Admins only): invitations, roles, status,
 * password resets, sessions, two-factor resets and the activity history.
 *
 * The primary Super Admin is protected: only that account may change itself,
 * and it can never be suspended, demoted or deleted. Nobody can suspend,
 * demote or delete themselves, and the last Super Admin always remains.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()->with(['adminRole', 'inviter:id,name'])->orderBy('name')->get();
        $activeSessions = AdminSession::query()
            ->whereNull('revoked_at')
            ->where('last_active_at', '>=', now()->subDays(30))
            ->selectRaw('user_id, count(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        return Inertia::render('Admin/Users/Index', [
            'users' => $users->map(fn (User $user): array => $this->toAdminArray($user, (int) ($activeSessions[$user->id] ?? 0), $request->user())),
            'roles' => AdminRole::query()->withCount('users')->orderByDesc('is_system')->orderBy('id')->get()
                ->map(fn (AdminRole $role): array => [...$role->toAdminArray(), 'value' => $role->slug, 'label' => $role->name]),
            'sections' => AdminSection::matrix(),
            'stats' => [
                'total' => $users->count(),
                'active' => $users->filter(fn (User $user): bool => $user->status === UserStatus::Active)->count(),
                'invited' => $users->filter(fn (User $user): bool => $user->status === UserStatus::Invited)->count(),
                'suspended' => $users->filter(fn (User $user): bool => $user->status === UserStatus::Suspended)->count(),
                'twoFactor' => $users->filter(fn (User $user): bool => $user->hasTwoFactor())->count(),
                'superAdmins' => $users->filter(fn (User $user): bool => $user->isSuperAdmin())->count(),
            ],
        ]);
    }

    /**
     * Invite a new admin by email. The account stays "invited", with no
     * usable password, until the invitation link is accepted.
     */
    public function store(StoreUserRequest $request, AdminAccountMailer $mailer): RedirectResponse
    {
        $validated = $request->validated();
        $role = AdminRole::forSlug($validated['role']);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Str::password(40),
            ...$this->roleAttributes($role),
            'status' => UserStatus::Invited,
            'invited_at' => now(),
            'invited_by' => $request->user()->id,
        ]);

        UserActivityLog::record($request, 'invited', $user, ['email' => $user->email, 'role' => $role->name]);
        $sent = $mailer->sendInvitation($user, InvitationController::url($user), $request->user());

        return back()->with('success', $sent
            ? "Invitation sent to {$user->email}."
            : "{$user->name} was added, but the invitation email could not be sent. Check Email & SMTP, then resend it.");
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->guardPrimary($request, $user);
        $validated = $request->validated();
        $role = AdminRole::forSlug($validated['role']);

        if ($user->is($request->user()) && $role->id !== $user->effectiveRole()?->id) {
            throw ValidationException::withMessages(['role' => 'You cannot change your own role.']);
        }

        if ($user->isPrimary() && ! $role->isSuperAdmin()) {
            throw ValidationException::withMessages(['role' => 'The primary Super Admin always stays a Super Admin.']);
        }

        $this->guardLastSuperAdmin($user, $role->isSuperAdmin() ? UserRole::SuperAdmin : UserRole::Editor);

        $before = ['name' => $user->name, 'email' => $user->email, 'role' => $user->effectiveRole()?->name];
        $user->update(['name' => $validated['name'], 'email' => $validated['email'], ...$this->roleAttributes($role)]);
        $after = ['name' => $user->name, 'email' => $user->email, 'role' => $role->name];

        $changes = collect($after)
            ->filter(fn ($value, string $key): bool => $before[$key] !== $value)
            ->map(fn ($value, string $key): array => ['from' => $before[$key], 'to' => $value])
            ->all();

        if ($changes !== []) {
            UserActivityLog::record($request, isset($changes['role']) && count($changes) === 1 ? 'role_changed' : 'updated', $user, $changes);
        }

        return back()->with('success', 'Admin updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'user' => 'You cannot delete your own account.',
            ]);
        }

        $this->guardPrimary($request, $user, 'The primary Super Admin cannot be deleted.');
        $this->guardLastSuperAdmin($user, UserRole::Editor);

        UserActivityLog::record($request, 'deleted', $user, ['email' => $user->email]);
        $user->delete();

        return back()->with('success', 'Admin deleted.');
    }

    public function suspend(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            throw ValidationException::withMessages(['user' => 'You cannot suspend your own account.']);
        }

        $this->guardPrimary($request, $user, 'The primary Super Admin cannot be suspended.');
        $this->guardLastSuperAdmin($user, UserRole::Editor);

        DB::transaction(function () use ($request, $user): void {
            $user->update(['status' => UserStatus::Suspended]);
            $this->revokeAll($user);
            UserActivityLog::record($request, 'suspended', $user);
        });

        return back()->with('success', "{$user->name} is suspended and signed out everywhere.");
    }

    public function reactivate(Request $request, User $user): RedirectResponse
    {
        if ($user->status !== UserStatus::Suspended) {
            return back();
        }

        $user->update(['status' => UserStatus::Active]);
        UserActivityLog::record($request, 'reactivated', $user);

        return back()->with('success', "{$user->name} can sign in again.");
    }

    public function resendInvitation(Request $request, User $user, AdminAccountMailer $mailer): RedirectResponse
    {
        if ($user->status !== UserStatus::Invited) {
            throw ValidationException::withMessages(['user' => 'This account has already accepted its invitation.']);
        }

        // A new invitation time retires every earlier link.
        $user->update(['invited_at' => now(), 'invited_by' => $request->user()->id]);
        UserActivityLog::record($request, 'invitation_resent', $user);

        return back()->with('success', $mailer->sendInvitation($user, InvitationController::url($user), $request->user())
            ? "Invitation resent to {$user->email}."
            : 'The invitation email could not be sent. Check Email & SMTP.');
    }

    public function sendPasswordReset(Request $request, User $user, AdminAccountMailer $mailer): RedirectResponse
    {
        $this->guardPrimary($request, $user);

        if ($user->status === UserStatus::Invited) {
            throw ValidationException::withMessages(['user' => 'This account has not set a password yet. Resend the invitation instead.']);
        }

        UserActivityLog::record($request, 'password_reset_sent', $user);

        return back()->with('success', $mailer->sendPasswordReset($user, PasswordResetController::url($user))
            ? "Password reset link sent to {$user->email}."
            : 'The password reset email could not be sent. Check Email & SMTP.');
    }

    public function resetTwoFactor(Request $request, User $user): RedirectResponse
    {
        $this->guardPrimary($request, $user);

        $user->forceFill(['two_factor_secret' => null, 'two_factor_recovery_codes' => null, 'two_factor_confirmed_at' => null])->save();
        UserActivityLog::record($request, 'two_factor_reset', $user);

        return back()->with('success', "Two-factor authentication is reset for {$user->name}.");
    }

    public function sessions(Request $request, User $user): JsonResponse
    {
        $current = AdminSession::hashFor($request->session()->getId());

        return response()->json([
            'sessions' => $user->adminSessions()
                ->whereNull('revoked_at')
                ->latest('last_active_at')
                ->get()
                ->map(fn (AdminSession $session): array => $session->toAdminArray($current)),
        ]);
    }

    public function revokeSession(Request $request, User $user, AdminSession $session): RedirectResponse
    {
        abort_unless($session->user_id === $user->id, 404);
        $this->guardPrimary($request, $user);

        $session->update(['revoked_at' => now()]);
        UserActivityLog::record($request, 'session_revoked', $user, ['device' => $session->device(), 'ip' => $session->ip_address]);

        return back()->with('success', 'Session signed out.');
    }

    public function revokeSessions(Request $request, User $user): RedirectResponse
    {
        $this->guardPrimary($request, $user);

        // Your own current session stays, so revoking "all" never locks you out.
        $keep = $user->is($request->user()) ? AdminSession::hashFor($request->session()->getId()) : null;
        $count = $this->revokeAll($user, $keep);
        UserActivityLog::record($request, 'sessions_revoked', $user, ['sessions' => $count]);

        return back()->with('success', $count === 1 ? '1 session signed out.' : "{$count} sessions signed out.");
    }

    public function activity(User $user): JsonResponse
    {
        return response()->json([
            'activity' => UserActivityLog::query()
                ->with('actor:id,name')
                ->where(fn ($query) => $query->where('user_id', $user->id)->orWhere('actor_id', $user->id))
                ->latest('id')
                ->limit(50)
                ->get()
                ->map(fn (UserActivityLog $entry): array => $entry->toAdminArray()),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(User $user, int $sessions, User $viewer): array
    {
        $role = $user->effectiveRole();
        $protected = $user->isPrimary() && ! $user->is($viewer);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role?->slug ?? $user->role->value,
            'roleLabel' => $role?->name ?? $user->role->label(),
            'isSuperAdmin' => $user->isSuperAdmin(),
            'status' => ($user->status ?? UserStatus::Active)->value,
            'statusLabel' => ($user->status ?? UserStatus::Active)->label(),
            'isPrimary' => $user->isPrimary(),
            'isSelf' => $user->is($viewer),
            'protected' => $protected,
            'twoFactor' => $user->hasTwoFactor(),
            'lastLogin' => $user->last_login_at?->diffForHumans(),
            'lastLoginAt' => $user->last_login_at?->format('d M Y, h:i A'),
            'lastLoginIp' => $user->last_login_ip,
            'invitedAt' => $user->invited_at?->format('d M Y'),
            'invitedBy' => $user->inviter?->name,
            'sessions' => $sessions,
            'createdAt' => $user->created_at?->format('j M Y'),
        ];
    }

    /**
     * The account's base role and assigned role for a role from the roles list.
     *
     * @return array{role: UserRole, admin_role_id: int}
     */
    private function roleAttributes(AdminRole $role): array
    {
        return [
            'role' => $role->isSuperAdmin() ? UserRole::SuperAdmin : UserRole::Editor,
            'admin_role_id' => $role->id,
        ];
    }

    private function revokeAll(User $user, ?string $keepHash = null): int
    {
        return AdminSession::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->when($keepHash, fn ($query, string $hash) => $query->where('session_hash', '!=', $hash))
            ->update(['revoked_at' => now()]);
    }

    /**
     * Only the primary Super Admin may change the primary account.
     */
    private function guardPrimary(Request $request, User $user, string $message = 'Only the primary Super Admin can change the primary account.'): void
    {
        if ($user->isPrimary() && ! $user->is($request->user())) {
            throw ValidationException::withMessages(['user' => $message]);
        }
    }

    /**
     * Refuse any change that would leave the panel without a super admin.
     */
    private function guardLastSuperAdmin(User $user, UserRole $newRole): void
    {
        if (! $user->isSuperAdmin() || $newRole === UserRole::SuperAdmin) {
            return;
        }

        $remaining = User::query()
            ->where('role', UserRole::SuperAdmin)
            ->where(fn ($query) => $query->whereNull('status')->orWhere('status', UserStatus::Active))
            ->whereKeyNot($user->getKey())
            ->count();

        if ($remaining === 0) {
            throw ValidationException::withMessages([
                'role' => 'At least one super admin must remain.',
            ]);
        }
    }
}
