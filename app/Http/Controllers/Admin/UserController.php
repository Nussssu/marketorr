<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::query()
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'roleLabel' => $user->role->label(),
                    'createdAt' => $user->created_at?->format('j M Y'),
                ]),
            'roles' => collect(UserRole::cases())
                ->map(fn (UserRole $role) => ['value' => $role->value, 'label' => $role->label()])
                ->all(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $password = Str::password(16, symbols: false);

        User::query()->create([
            ...$request->validated(),
            'password' => Hash::make($password),
            'email_verified_at' => now(),
        ]);

        return back()->with('success', "Admin created. Temporary password: {$password}");
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $this->guardLastSuperAdmin($user, UserRole::from($validated['role']));

        $user->update($validated);

        return back()->with('success', 'Admin updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->is(request()->user())) {
            throw ValidationException::withMessages([
                'user' => 'You cannot delete your own account.',
            ]);
        }

        $this->guardLastSuperAdmin($user, UserRole::Editor);

        $user->delete();

        return back()->with('success', 'Admin deleted.');
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
            ->whereKeyNot($user->getKey())
            ->count();

        if ($remaining === 0) {
            throw ValidationException::withMessages([
                'role' => 'At least one super admin must remain.',
            ]);
        }
    }
}
