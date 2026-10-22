<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Services\AdminLogin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Accepting an emailed admin invitation: the signed, expiring link opens a
 * form to set a password, which activates the account and signs it in.
 */
class InvitationController extends Controller
{
    /** How long an invitation link stays valid. */
    public const VALID_DAYS = 7;

    /**
     * The signed link for an invitation. It carries a fingerprint of the
     * invitation time, so resending an invitation retires the older link.
     */
    public static function url(User $user): string
    {
        return URL::temporarySignedRoute('admin.invitation.show', now()->addDays(self::VALID_DAYS), [
            'user' => $user->id,
            'invite' => self::fingerprint($user),
        ]);
    }

    public static function fingerprint(User $user): string
    {
        return substr(hash_hmac('sha256', $user->id.'|'.$user->email.'|'.$user->invited_at?->getTimestamp(), (string) config('app.key')), 0, 32);
    }

    public function show(Request $request, User $user): Response|RedirectResponse
    {
        if (($error = $this->problem($request, $user)) !== null) {
            return redirect()->route('admin.login')->withErrors(['email' => $error]);
        }

        Auth::logout();

        return Inertia::render('Admin/Auth/AcceptInvitation', [
            'name' => $user->name,
            'email' => $user->email,
            'action' => $request->fullUrl(),
        ]);
    }

    public function store(Request $request, User $user, AdminLogin $login): RedirectResponse
    {
        if (($error = $this->problem($request, $user)) !== null) {
            return redirect()->route('admin.login')->withErrors(['email' => $error]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'password' => ['required', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);

        $user->forceFill([
            'name' => $validated['name'],
            'password' => $validated['password'],
            'status' => UserStatus::Active,
            'email_verified_at' => now(),
        ])->save();

        UserActivityLog::record($request, 'invitation_accepted', $user, [], $user);
        $login->complete($request, $user, false);

        return redirect()->route('admin.dashboard')->with('success', 'Welcome! Your account is ready.');
    }

    private function problem(Request $request, User $user): ?string
    {
        if (! $request->hasValidSignature()) {
            return 'This invitation link has expired or is not valid. Ask for a new invitation.';
        }

        if ($user->status !== UserStatus::Invited || ! hash_equals(self::fingerprint($user), (string) $request->query('invite'))) {
            return 'This invitation has already been used or was replaced by a newer one.';
        }

        return null;
    }
}
