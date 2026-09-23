/**
 * Projects whose dedicated page opens on something other than the flat cover.
 *
 * The cover in the database stays the source of truth: it is what the card,
 * the work listing and the page's own fallback use, it is what shows while
 * this loads, and it is what a reader on `prefers-reduced-motion` keeps. An
 * Image entries are also reused by project cards so the card and hero never
 * disagree or visibly swap assets during navigation. A project without one
 * behaves exactly as before.
 *
 * Keyed by project slug, so adding one is a few lines and needs no migration
 * or admin field.
 *
 * `kind: 'image'` is any still or animated file served from `public/`.
 * `kind: 'vimeo'` embeds the official player in Vimeo's chromeless background
 * mode — the film itself stays hosted by Vimeo and is never copied into the
 * repository.
 *
 * @type {Record<string, (
 *   { kind: 'image', src: string, alt: string, fit?: 'cover'|'contain', background?: string }
 *   | { kind: 'vimeo', id: string, title: string, ratio: number, background?: string }
 * )>}
 */
export const PROJECT_HERO_MEDIA = {
    'imperial-jute-b2b-seo': {
        kind: 'image',
        src: '/images/work/imperial-jute-logo.gif',
        alt: 'Imperial Jute 3D logo animation',
        fit: 'contain',
        background: '#000000',
    },
    'imperial-jute-brand-design': {
        kind: 'image',
        src: '/images/work/imperial-jute-logo.gif',
        alt: 'Imperial Jute 3D logo animation',
        fit: 'contain',
        background: '#000000',
    },
    'virgin-trend': {
        kind: 'vimeo',
        id: '848291117',
        title: 'Virgin Trend brand intro',
        // Source file is 426x240; the player is scaled to cover from this.
        ratio: 426 / 240,
        background: '#050507',
    },
};

/**
 * @param {string|undefined} slug
 * @return {object|null}
 */
export function projectHeroMedia(slug) {
    return (slug && PROJECT_HERO_MEDIA[slug]) || null;
}

/**
 * Use an image-based hero as the matching card cover. Video heroes retain the
 * project's still cover so cards never embed or autoplay a remote player.
 *
 * @param {{ slug?: string, image?: string, imageAlt?: string }|undefined} project
 * @return {{ src: string|undefined, alt: string, fit: 'cover'|'contain' }}
 */
export function projectCardMedia(project) {
    const heroMedia = projectHeroMedia(project?.slug);

    if (heroMedia?.kind === 'image') {
        return {
            src: heroMedia.src,
            alt: heroMedia.alt,
            fit: heroMedia.fit ?? 'cover',
        };
    }

    return {
        src: project?.image,
        alt: project?.imageAlt ?? '',
        fit: 'cover',
    };
}
