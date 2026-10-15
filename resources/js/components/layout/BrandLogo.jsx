import { usePage } from '@inertiajs/react';
import { assetUrl } from '../../lib/asset';

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
 * @param {{ className?: string, height?: number, draggable?: boolean }} props
 *   `height` is the rendered height in px; the width follows the artwork's
 *   own aspect ratio. `priority` marks the header instance, which is often
 *   the first image on screen, for an early high-priority fetch. `draggable`
 *   false stops the browser lifting a ghost copy of the logo on drag.
 */
export default function BrandLogo({ className = '', height = 26, priority = false, draggable }) {
    const { settings } = usePage().props;
    const style = { height, width: 'auto' };

    const uploadedLight = settings?.logo ?? settings?.logoDark ?? null;
    const uploadedDark = settings?.logoDark ?? settings?.logo ?? null;
    const onLight = uploadedLight ?? assetUrl(ON_LIGHT);
    const onDark = uploadedDark ?? assetUrl(ON_DARK);
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
                draggable={draggable}
                data-variant="dark"
                fetchPriority={priority ? 'high' : undefined}
                aria-hidden
            />
            <img
                src={onLight}
                alt=""
                {...intrinsic}
                style={style}
                className="brand-logo__img"
                draggable={draggable}
                data-variant="light"
                fetchPriority={priority ? 'high' : undefined}
                aria-hidden
            />
            <span className="sr-only">{siteName}</span>
        </span>
    );
}
