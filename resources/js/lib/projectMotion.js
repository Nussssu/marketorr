/**
 * Projects whose cover has a moving version.
 *
 * The static cover in the database stays the source of truth — it is what
 * renders first, what shows while the motion file is still downloading, and
 * what a reader on reduced motion keeps. The entry here is an optional layer
 * laid over it, nothing more, so a project without one behaves exactly as
 * before and a broken path costs a fade-in rather than a blank card.
 *
 * Keyed by project slug, so adding one is a single line and needs no
 * migration or admin field.
 *
 * @type {Record<string, { src: string, alt: string, fit?: 'cover'|'contain', background?: string }>}
 */
export const PROJECT_MOTION = {
    // Virgin Trend: the logo animation is not published as a downloadable
    // file anywhere reachable - the Behance gallery exposes four still
    // modules and no animated one. Drop the exported .gif (or .mp4, which
    // needs the <video> branch) at the path below and uncomment; the layer is
    // already wired into Our Work, the work listing and the project page.
    // 'virgin-trend': {
    //     src: '/images/work/virgin-trend-logo.gif',
    //     alt: 'Virgin Trend logo animation',
    //     background: '#F4FAFD',
    // },
};

/**
 * @param {string|undefined} slug
 * @return {{ src: string, alt: string, fit?: string, background?: string }|null}
 */
export function projectMotion(slug) {
    return (slug && PROJECT_MOTION[slug]) || null;
}
