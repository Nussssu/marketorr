<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminSession;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Services\AdminLogin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Auth/Login');
    }

    public function store(Request $request, AdminLogin $login): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if ($user === null || ! Hash::check($credentials['password'], (string) $user->password)) {
            if ($user !== null) {
                UserActivityLog::record($request, 'login_failed', $user, [], null);
            }

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if (($refusal = $login->refusal($user)) !== null) {
            throw ValidationException::withMessages(['email' => $refusal]);
        }

        // With two-factor on, the password only opens the code step: the
        // account is not signed in until the code checks out.
        if ($user->hasTwoFactor()) {
            $request->session()->put(AdminLogin::PENDING_KEY, [
                'id' => $user->id,
                'remember' => $request->boolean('remember'),
                'expires' => now()->addSeconds(AdminLogin::PENDING_SECONDS)->getTimestamp(),
            ]);

            return redirect()->route('admin.two-factor');
        }

        $login->complete($request, $user, $request->boolean('remember'));

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        if ($user = $request->user()) {
            UserActivityLog::record($request, 'logout', $user);
            AdminSession::query()->where('session_hash', AdminSession::hashFor($request->session()->getId()))->delete();
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
