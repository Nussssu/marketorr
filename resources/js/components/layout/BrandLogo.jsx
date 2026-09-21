import { usePage } from '@inertiajs/react';

/** Shipped lockups, used until an editor uploads their own in Settings. */
const ON_LIGHT = '/images/logo/marketorr-logo-on-light.png';
const ON_DARK = '/images/logo/marketorr-logo-on-dark.png';

/** Intrinsic size of both files, so the box never reflows while they load. */
const NATURAL_WIDTH = 1000;
const NATURAL_HEIGHT = 118;

/**
 * The Marketorr wordmark, swapped between the two supplied files by the active
 * theme.
 *
 * Both variants are rendered and CSS picks one off `data-theme` on the root
 * element — that attribute is set by the blocking script in `app.blade.php`
 * before first paint, so the correct lockup is on screen immediately. Choosing
 * in JS from `useTheme()` would instead swap after hydration and flash the
 * wrong lockup on a light-theme load.
 *
 * Both files are decorative here — the lockup's text is repeated as a
 * screen-reader-only label, so the name is announced once whichever variant is
 * on screen.
 *
 * An uploaded logo replaces the shipped artwork. When only one variant has
 * been uploaded it is used for both themes, so a half-finished upload never
 * leaves one theme with no logo at all.
 *
 * @param {{ className?: string, height?: number }} props
 *   `height` is the rendered height in px; the width follows the artwork's
 *   own aspect ratio.
 */
export default function BrandLogo({ className = '', height = 26 }) {
    const { settings } = usePage().props;
    const style = { height, width: 'auto' };

    const uploadedLight = settings?.logo ?? settings?.logoDark ?? null;
    const uploadedDark = settings?.logoDark ?? settings?.logo ?? null;
    const onLight = uploadedLight ?? ON_LIGHT;
    const onDark = uploadedDark ?? ON_DARK;
    const siteName = settings?.siteName ?? 'Marketorr';

    // An uploaded file has its own proportions, so the intrinsic size of the
    // shipped artwork must not be imposed on it.
    const intrinsic = uploadedLight
        ? {}
        : { width: NATURAL_WIDTH, height: NATURAL_HEIGHT };

    return (
        <span className={`brand-logo inline-flex items-center ${className}`.trimEnd()}>
            <img
                src={onDark}
                alt=""
                {...intrinsic}
                style={style}
                className="brand-logo__img"
                data-variant="dark"
                aria-hidden
            />
            <img
                src={onLight}
                alt=""
                {...intrinsic}
                style={style}
                className="brand-logo__img"
                data-variant="light"
                aria-hidden
            />
            <span className="sr-only">{siteName}</span>
        </span>
    );
}
