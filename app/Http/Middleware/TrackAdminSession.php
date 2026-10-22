<?php

namespace App\Http\Middleware;

use App\Models\AdminSession;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps a record of each signed-in admin session so it can be listed and
 * revoked, and ends any session that was revoked or whose account is no
 * longer active (suspended or back to invited), whatever session driver the
 * site uses. Activity is written at most once a minute.
 */
class TrackAdminSession
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $request->hasSession()) {
            return $next($request);
        }

        $hash = AdminSession::hashFor($request->session()->getId());
        $session = AdminSession::query()->where('session_hash', $hash)->first();

        if (! $user->isActive() || ($session !== null && ($session->revoked_at !== null || $session->user_id !== $user->id))) {
            return $this->signOut($request, $user->isActive() ? 'This session was signed out from another device.' : 'Your account is not active.');
        }

        if ($session === null) {
            AdminSession::query()->create([
                'user_id' => $user->id,
                'session_hash' => $hash,
                'ip_address' => $request->ip(),
                'user_agent' => mb_substr((string) $request->userAgent(), 0, 500),
                'last_active_at' => now(),
            ]);
        } elseif ($session->last_active_at === null || $session->last_active_at->lt(now()->subMinute())) {
            $session->update(['last_active_at' => now(), 'ip_address' => $request->ip()]);
        }

        return $next($request);
    }

    private function signOut(Request $request, string $message): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            abort(401, $message);
        }

        return redirect()->route('admin.login')->withErrors(['email' => $message]);
    }
}
