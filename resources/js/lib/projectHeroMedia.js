import { assetUrl } from './asset';
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
 *   { kind: 'image', src: string, alt: string, fit?: 'cover'|'contain', background?: string, card?: boolean, cardSrcSet?: string }
 *   | { kind: 'vimeo', id: string, title: string, ratio: number, background?: string }
 * )>}
 */
export const PROJECT_HERO_MEDIA = {
    'imperial-jute-b2b-seo': {
        kind: 'image',
        src: assetUrl('/images/work/imperial-jute-logo.webp'),
        // Card-sized copies of the same animation (every frame, same timing).
        cardSrcSet: `${assetUrl('/images/opt/thumbs-sm/work/imperial-jute-logo.webp.webp')} 480w, ${assetUrl('/images/opt/thumbs/work/imperial-jute-logo.webp.webp')} 900w, ${assetUrl('/images/work/imperial-jute-logo.webp')} 1400w`,
        alt: 'Imperial Jute 3D logo animation',
        fit: 'contain',
        background: '#000000',
    },
    'imperial-jute-brand-design': {
        kind: 'image',
        src: assetUrl('/images/work/imperial-jute-logo.webp'),
        // Card-sized copies of the same animation (every frame, same timing).
        cardSrcSet: `${assetUrl('/images/opt/thumbs-sm/work/imperial-jute-logo.webp.webp')} 480w, ${assetUrl('/images/opt/thumbs/work/imperial-jute-logo.webp.webp')} 900w, ${assetUrl('/images/work/imperial-jute-logo.webp')} 1400w`,
        alt: 'Imperial Jute 3D logo animation',
        fit: 'contain',
        background: '#000000',
    },
    'city-online-brand-design': {
        kind: 'video',
        src: assetUrl('/videos/city-online-hero.mp4'),
        // The brand film's own first frame, so the stage is never empty while
        // the file buffers and reduced-motion readers still see the piece.
        poster: assetUrl('/images/opt/work/city-online-hero-poster.jpg.webp'),
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
        src: assetUrl('/images/work/un-point-logo.webp'),
        alt: 'Un Point 5 logo animation',
        fit: 'cover',
        background: '#0b0b0e',
        // Hero only: the card keeps the project's own cover.
        card: false,
    },
    'shuddhomart-branding': {
        kind: 'image',
        src: assetUrl('/images/work/shuddhomart-hero.webp'),
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
    'amanah-global-network': {
        kind: 'vimeo',
        id: '1223960078',
        title: 'Amanah brand film',
        ratio: 16 / 9,
        background: '#0a2426',
    },
    'medica-lifecare-brand-identity': {
        kind: 'vimeo',
        id: '1230249552',
        title: 'Medica Lifecare PLC brand identity film',
        ratio: 16 / 9,
        background: '#062d43',
    },
    'smilez-logo-design': {
        kind: 'image',
        src: assetUrl('/images/work/gallery/smilez-logo-design/03.webp'),
        alt: 'Smilez silver foil emboss on dark paper',
        fit: 'cover',
        background: '#0b0b0e',
        // Hero only: the card carries the logo-on-white frame instead.
        card: false,
    },
    'tapmad-media-ads': {
        kind: 'image',
        src: assetUrl('/images/work/gallery/tapmad-media-ads/02.webp'),
        alt: 'Tapmad All in 1 press ad on newspaper',
        fit: 'cover',
        background: '#0b0b0e',
        // Hero only: the card carries the billboard frame instead.
        card: false,
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
 * @param {{ slug?: string, image?: string, thumb?: string, thumbSmall?: string, imageAlt?: string }|undefined} project
 * @param {string} [sizes] The card's rendered width, as an `<img sizes>` value.
 * @return {{ src: string|undefined, srcSet?: string, sizes?: string, alt: string, fit: 'cover'|'contain' }}
 */
export function projectCardMedia(project, sizes = '(max-width: 768px) 92vw, 50vw') {
    const heroMedia = projectHeroMedia(project?.slug);

    if (heroMedia?.kind === 'image' && heroMedia.card !== false) {
        return {
            src: heroMedia.src,
            srcSet: heroMedia.cardSrcSet,
            sizes: heroMedia.cardSrcSet ? sizes : undefined,
            alt: heroMedia.alt,
            fit: heroMedia.fit ?? 'cover',
        };
    }

    const thumb = project?.thumb && project.thumb !== project?.image ? project.thumb : null;
    const small = thumb && project?.thumbSmall && project.thumbSmall !== thumb ? project.thumbSmall : null;

    return {
        // Grid copies (480px and 900px) when the server has them, with the full
        // cover offered for slots and screens that need more pixels. `sizes`
        // is the card's rendered width, so the browser picks the smallest
        // copy that stays sharp.
        src: thumb ?? project?.image,
        srcSet: thumb ? [small && `${small} 480w`, `${thumb} 900w`, `${project.image} 1800w`].filter(Boolean).join(', ') : undefined,
        sizes: thumb ? sizes : undefined,
        alt: project?.imageAlt ?? '',
        fit: 'cover',
    };
}
