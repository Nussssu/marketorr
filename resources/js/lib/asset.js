/**
 * Base URL for files under `public/` — the server's `asset()` base
 * (`ASSET_URL`, otherwise the app URL), shared as the `assetBase` prop and set
 * once when the app boots.
 */
let base = '';

/** @param {string|null|undefined} value */
export function setAssetBase(value) {
    base = (value ?? '').replace(/\/+$/, '');
}

/**
 * A root-relative public path (`/images/...`) on the configured asset base.
 * Absolute and data URLs pass through untouched.
 *
 * @param {string|null|undefined} path
 * @return {string|null|undefined}
 */
export function assetUrl(path) {
    if (!path || !path.startsWith('/') || path.startsWith('//')) {
        return path;
    }

    return `${base}${path}`;
}
