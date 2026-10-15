<?php

namespace App\Services;

/**
 * Public URLs for the site's images and files, built on the env base URL:
 * `ASSET_URL` in full when it is set (a CDN, say), otherwise the path of
 * `APP_URL` — `/images/...` at a domain root, `/site/images/...` under a
 * sub-path. Without a host the URL is always same-origin, so the site works on
 * every hostname it is reached by (www or bare domain, localhost or 127.0.0.1).
 *
 * It also swaps a shipped image for its optimized copy when one exists. Heavy
 * originals under `public/images/` keep their paths — the seeders, the
 * database and the admin all still point at them — and a WebP re-encode of
 * each sits beside the tree in `public/images/opt/`, named after the original
 * including its extension (`work/foo.png` becomes `opt/work/foo.png.webp`). A
 * grid-sized version of each project cover sits in `public/images/opt/thumbs/`
 * (900px) and `public/images/opt/thumbs-sm/` (480px).
 * Only originals that compressed meaningfully have a copy; anything without
 * one is served as it is. Uploads live on the public disk under hashed names
 * and are never matched.
 */
class PublicAsset
{
    /**
     * The base every public URL is built on: `ASSET_URL` when set, otherwise
     * the path part of `APP_URL` (empty at a domain root).
     */
    public static function base(): string
    {
        $assetUrl = config('app.asset_url');

        if (filled($assetUrl)) {
            return rtrim((string) $assetUrl, '/');
        }

        return rtrim((string) (parse_url((string) config('app.url'), PHP_URL_PATH) ?: ''), '/');
    }

    /**
     * A path under `public/` as a URL on the base.
     */
    public static function to(string $path): string
    {
        return self::base().'/'.ltrim($path, '/');
    }

    /**
     * The public URL of a stored path: absolute URLs pass through, root-relative
     * paths (`/images/...`) resolve against the asset base — to their optimized
     * copy when there is one — and bare paths are files on the public disk.
     */
    public static function url(?string $path): ?string
    {
        if (blank($path)) {
            return $path;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '//')) {
            return $path;
        }

        if (str_starts_with($path, '/')) {
            return self::to(self::variant($path, 'opt') ?? $path);
        }

        return self::disk($path);
    }

    /**
     * A grid-sized copy of a root-relative cover, falling back to its optimized
     * copy and then to the original.
     */
    public static function thumb(?string $path): ?string
    {
        $variant = self::variant($path, 'opt/thumbs');

        return $variant !== null ? self::to($variant) : self::url($path);
    }

    /**
     * A phone-grid-sized (480px) copy of a root-relative cover, falling back
     * like `thumb()`.
     */
    public static function thumbSmall(?string $path): ?string
    {
        $variant = self::variant($path, 'opt/thumbs-sm');

        return $variant !== null ? self::to($variant) : self::thumb($path);
    }

    /**
     * Whether a root-relative image has an optimized copy.
     */
    public static function hasOptimized(?string $path): bool
    {
        return self::variant($path, 'opt') !== null;
    }

    /**
     * The public URL of a file on the public disk.
     */
    public static function disk(string $path): string
    {
        return self::to('storage/'.ltrim($path, '/'));
    }

    /**
     * Whether a root-relative path has an optimized copy of the given kind.
     */
    private static function variant(?string $path, string $directory): ?string
    {
        if (blank($path) || ! str_starts_with($path, '/images/') || str_starts_with($path, '/images/opt/')) {
            return null;
        }

        $clean = parse_url($path, PHP_URL_PATH);

        if (! is_string($clean)) {
            return null;
        }

        $candidate = '/images/'.$directory.'/'.substr($clean, strlen('/images/')).'.webp';

        return is_file(public_path(ltrim($candidate, '/'))) ? $candidate : null;
    }
}
