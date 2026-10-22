<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Services\AdminLogin;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The second sign-in step for accounts with two-factor authentication: an
 * authenticator code or a single-use recovery code.
 */
class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        return $this->pendingUser($request) === null
            ? redirect()->route('admin.login')
            : Inertia::render('Admin/Auth/TwoFactorChallenge');
    }

    public function store(Request $request, TwoFactorAuthenticator $twoFactor, AdminLogin $login): RedirectResponse
    {
        $validated = $request->validate(['code' => ['required', 'string', 'max:20']]);
        $user = $this->pendingUser($request);

        if ($user === null) {
            return redirect()->route('admin.login')->withErrors(['email' => 'Your sign-in expired. Enter your password again.']);
        }

        if (($refusal = $login->refusal($user)) !== null) {
            $request->session()->forget(AdminLogin::PENDING_KEY);

            return redirect()->route('admin.login')->withErrors(['email' => $refusal]);
        }

        if (! $twoFactor->attempt($user, $validated['code'])) {
            UserActivityLog::record($request, 'login_failed', $user, ['step' => 'two-factor code'], null);

            throw ValidationException::withMessages(['code' => 'That code is not valid. Try the current code from your app, or a recovery code.']);
        }

        $login->complete($request, $user, (bool) ($request->session()->get(AdminLogin::PENDING_KEY)['remember'] ?? false));

        return redirect()->intended(route('admin.dashboard'));
    }

    private function pendingUser(Request $request): ?User
    {
        $pending = $request->session()->get(AdminLogin::PENDING_KEY);

        if (! is_array($pending) || ($pending['expires'] ?? 0) < now()->getTimestamp()) {
            return null;
        }

        return User::query()->find($pending['id'] ?? null);
    }
}
