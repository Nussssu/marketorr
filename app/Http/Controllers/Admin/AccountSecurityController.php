<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminSession;
use App\Models\UserActivityLog;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Every admin's own security page: password, two-factor authentication
 * (with recovery codes) and the browsers they are signed in on.
 */
class AccountSecurityController extends Controller
{
    /** Session key for a two-factor secret shown but not yet confirmed. */
    private const PENDING_SECRET = 'admin.two_factor.pending_secret';

    public function show(Request $request, TwoFactorAuthenticator $twoFactor): Response
    {
        $user = $request->user();
        $pending = $request->session()->get(self::PENDING_SECRET);
        $current = AdminSession::hashFor($request->session()->getId());

        return Inertia::render('Admin/Account/Security', [
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->effectiveRole()?->name ?? $user->role->label(),
                'lastLoginAt' => $user->last_login_at?->format('d M Y, h:i A'),
                'lastLoginIp' => $user->last_login_ip,
            ],
            'twoFactor' => [
                'enabled' => $user->hasTwoFactor(),
                'recoveryCodesLeft' => count($user->two_factor_recovery_codes ?? []),
                'pending' => $pending ? [
                    'secret' => trim(chunk_split($pending, 4, ' ')),
                    'uri' => $twoFactor->provisioningUri(config('app.name', 'Marketorr').' Admin', $user->email, $pending),
                ] : null,
            ],
            'recoveryCodes' => $request->session()->get('recoveryCodes'),
            'sessions' => $user->adminSessions()
                ->whereNull('revoked_at')
                ->latest('last_active_at')
                ->get()
                ->map(fn (AdminSession $session): array => $session->toAdminArray($current)),
        ]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);

        $request->user()->update(['password' => $validated['password']]);
        UserActivityLog::record($request, 'password_reset', $request->user(), ['method' => 'changed from My security']);

        return back()->with('success', 'Password changed.');
    }

    public function startTwoFactor(Request $request, TwoFactorAuthenticator $twoFactor): RedirectResponse
    {
        if ($request->user()->hasTwoFactor()) {
            return back();
        }

        $request->session()->put(self::PENDING_SECRET, $twoFactor->generateSecret());

        return back();
    }

    public function confirmTwoFactor(Request $request, TwoFactorAuthenticator $twoFactor): RedirectResponse
    {
        $validated = $request->validate(['code' => ['required', 'string', 'max:10']]);
        $secret = $request->session()->get(self::PENDING_SECRET);

        if (! $secret || ! $twoFactor->verify($secret, $validated['code'])) {
            throw ValidationException::withMessages(['code' => 'That code did not match. Check the time on your phone and try the newest code.']);
        }

        $codes = $twoFactor->generateRecoveryCodes();
        $request->user()->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => $codes,
            'two_factor_confirmed_at' => now(),
        ])->save();

        $request->session()->forget(self::PENDING_SECRET);
        UserActivityLog::record($request, 'two_factor_enabled', $request->user());

        return back()->with('success', 'Two-factor authentication is on.')->with('recoveryCodes', $codes);
    }

    public function cancelTwoFactor(Request $request): RedirectResponse
    {
        $request->session()->forget(self::PENDING_SECRET);

        return back();
    }

    public function disableTwoFactor(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $request->user()->forceFill(['two_factor_secret' => null, 'two_factor_recovery_codes' => null, 'two_factor_confirmed_at' => null])->save();
        UserActivityLog::record($request, 'two_factor_disabled', $request->user());

        return back()->with('success', 'Two-factor authentication is off.');
    }

    public function regenerateRecoveryCodes(Request $request, TwoFactorAuthenticator $twoFactor): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        abort_unless($request->user()->hasTwoFactor(), 404);

        $codes = $twoFactor->generateRecoveryCodes();
        $request->user()->forceFill(['two_factor_recovery_codes' => $codes])->save();
        UserActivityLog::record($request, 'recovery_codes_regenerated', $request->user());

        return back()->with('success', 'New recovery codes created. The old ones no longer work.')->with('recoveryCodes', $codes);
    }

    public function revokeSession(Request $request, AdminSession $session): RedirectResponse
    {
        abort_unless($session->user_id === $request->user()->id, 404);

        if ($session->session_hash === AdminSession::hashFor($request->session()->getId())) {
            throw ValidationException::withMessages(['session' => 'Use Sign out to end the session you are using now.']);
        }

        $session->update(['revoked_at' => now()]);
        UserActivityLog::record($request, 'session_revoked', $request->user(), ['device' => $session->device(), 'ip' => $session->ip_address]);

        return back()->with('success', 'Session signed out.');
    }

    public function revokeOtherSessions(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $count = AdminSession::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('revoked_at')
            ->where('session_hash', '!=', AdminSession::hashFor($request->session()->getId()))
            ->update(['revoked_at' => now()]);

        UserActivityLog::record($request, 'sessions_revoked', $request->user(), ['sessions' => $count]);

        return back()->with('success', $count === 1 ? '1 other session signed out.' : "{$count} other sessions signed out.");
    }

}
