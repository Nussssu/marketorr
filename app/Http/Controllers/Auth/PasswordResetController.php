<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminSession;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Choosing a new admin password from an emailed reset link. A successful
 * reset ends every existing session of the account.
 */
class PasswordResetController extends Controller
{
    public static function url(User $user): string
    {
        return route('admin.password.reset', [
            'token' => Password::broker()->createToken($user),
            'email' => $user->email,
        ]);
    }

    public function create(Request $request, string $token): Response
    {
        return Inertia::render('Admin/Auth/ResetPassword', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(10)->letters()->numbers()],
        ]);

        $status = Password::broker()->reset($validated, function (User $user, string $password) use ($request): void {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            AdminSession::query()->where('user_id', $user->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
            UserActivityLog::record($request, 'password_reset', $user, [], $user);
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return redirect()->route('admin.login')->with('success', 'Password changed. Sign in with your new password.');
    }
}
