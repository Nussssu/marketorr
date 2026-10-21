<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Content Security Policy for the site.
 *
 * The admin panel runs only its own scripts: the app bundle (from this site,
 * the asset URL or the Vite dev server) and the inline scripts the root view
 * marks with this request's nonce. Anything else — custom code included,
 * should it ever reach an admin page — is refused by the browser. Eval stays
 * allowed because the custom code editor compiles JavaScript, without running
 * it, to check its syntax. The admin cannot be framed by another site.
 *
 * Public pages only pin the document's base URL, so custom code (analytics,
 * pixels, embeds from any provider) keeps working exactly as written.
 */
class ContentSecurityPolicy
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isAdmin = $request->is('admin', 'admin/*');

        if ($isAdmin) {
            Vite::useCspNonce();
        }

        $response = $next($request);

        if ($response->headers->has('Content-Security-Policy')) {
            return $response;
        }

        if (! $isAdmin) {
            $response->headers->set('Content-Security-Policy', "base-uri 'self'");

            return $response;
        }

        $scriptSources = collect(["'self'", "'nonce-".Vite::cspNonce()."'", "'unsafe-eval'"])
            ->merge($this->assetOrigins())
            ->unique()
            ->implode(' ');

        $response->headers->set('Content-Security-Policy', implode('; ', [
            "script-src {$scriptSources}",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'self'",
            "form-action 'self'",
        ]));
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }

    /**
     * Other origins the admin's own bundle may load from: the configured
     * asset URL (a CDN) and, in development, the Vite dev server.
     *
     * @return array<int, string>
     */
    private function assetOrigins(): array
    {
        $urls = [(string) config('app.asset_url')];

        if (File::exists(Vite::hotFile())) {
            $urls[] = trim((string) File::get(Vite::hotFile()));
        }

        return collect($urls)
            ->filter(fn (string $url): bool => Str::startsWith($url, ['http://', 'https://']))
            ->map(function (string $url): string {
                $parts = parse_url($url);

                return $parts['scheme'].'://'.$parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '');
            })
            ->values()
            ->all();
    }
}
