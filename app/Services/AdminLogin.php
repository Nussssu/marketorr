<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Finishes an admin sign-in once the password (and, when it is on, the
 * two-factor code) has been checked: a fresh session, the last-login
 * details, and an entry in the activity log.
 */
class AdminLogin
{
    /** Session key holding a sign-in waiting for its two-factor code. */
    public const PENDING_KEY = 'admin.login.two_factor';

    /** How long a password check stays valid while the code is entered. */
    public const PENDING_SECONDS = 600;

    public function complete(Request $request, User $user, bool $remember): void
    {
        Auth::login($user, $remember);
        $request->session()->forget(self::PENDING_KEY);
        $request->session()->regenerate();

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        UserActivityLog::record($request, 'login', $user, $user->hasTwoFactor() ? ['method' => 'password + two-factor'] : [], $user);
    }

    /**
     * Why an account with the right password still may not sign in, or null.
     */
    public function refusal(User $user): ?string
    {
        if (! $user->isAdmin()) {
            return __('auth.failed');
        }

        return match ($user->status?->value) {
            'suspended' => 'This account is suspended. Ask a Super Admin to reactivate it.',
            'invited' => 'This account has not accepted its invitation yet. Use the link in the invitation email.',
            default => null,
        };
    }
}
