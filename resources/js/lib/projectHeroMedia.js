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
 * `kind: 'video'` plays a file served from `public/` — muted, looped and
 * posterless-safe, so it can autoplay as a hero backdrop.
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
        src: '/images/work/imperial-jute-logo.webp',
        alt: 'Imperial Jute 3D logo animation',
        fit: 'contain',
        background: '#000000',
    },
    'imperial-jute-brand-design': {
        kind: 'image',
        src: '/images/work/imperial-jute-logo.webp',
        alt: 'Imperial Jute 3D logo animation',
        fit: 'contain',
        background: '#000000',
    },
    'city-online-brand-design': {
        kind: 'video',
        src: '/videos/city-online-hero.mp4',
        // The brand film's own first frame, so the stage is never empty while
        // the file buffers and reduced-motion readers still see the piece.
        poster: '/images/work/city-online-hero-poster.jpg',
        background: '#191919',
    },
    'microters-web': {
        kind: 'vimeo',
        id: '900435156',
        // Unlisted-video token: without it the player refuses the embed.
        hash: 'a7411ba746',
        title: 'Microters case study film',
        ratio: 640 / 360,
        background: '#10131c',
    },
    'un-point-brand-design': {
        kind: 'image',
        src: '/images/work/un-point-logo.webp',
        alt: 'Un Point 5 logo animation',
        fit: 'cover',
        background: '#0b0b0e',
        // Hero only: the card keeps the project's own cover.
        card: false,
    },
    'shuddhomart-branding': {
        kind: 'image',
        src: '/images/work/shuddhomart-hero.webp',
        alt: 'ShuddhoMart brand identity',
        fit: 'cover',
        background: '#0b0b0e',
        // Hero only: the card carries the second frame instead.
        card: false,
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

    if (heroMedia?.kind === 'image' && heroMedia.card !== false) {
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
