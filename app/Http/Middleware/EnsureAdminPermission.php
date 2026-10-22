<?php

namespace App\Http\Middleware;

use App\Enums\AdminSection;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Server-side check of an admin section permission, e.g. `permission:projects`.
 * Reading (GET/HEAD) needs "{section}.view"; any change needs
 * "{section}.manage". Super Admins pass every check.
 */
class EnsureAdminPermission
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $section): Response
    {
        $section = AdminSection::from($section);
        $action = $request->isMethodSafe() || ! $section->hasManage() ? 'view' : 'manage';

        if (! $request->user()?->hasPermission("{$section->value}.{$action}")) {
            abort(403);
        }

        return $next($request);
    }
}
