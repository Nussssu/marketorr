import { Link } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import MediaPlaceholder from '../media/MediaPlaceholder';


/** Full-screen cinematic hero per discipline — dark photographic work, never SVG. */
/**
 * Background clip for the discipline heroes - one file per discipline.
 *
 * Both are null while the real discipline films are being produced, so each
 * hero renders the video placeholder plate instead. Point a slug at an .mp4
 * and that hero plays it; nothing else has to change.
 *
 * Upload target: 16:9, 1920x1080, H.264 .mp4, muted, seamless loop.
 */
const HERO_VIDEO = {
    branding: null,
    'ui-ux': null,
};

/**
 * The poster frame for each clip, and what a phone shows in its place.
 *
 * Null for the same reason: a poster taken from a film that does not exist
 * yet would only be a stand-in for a stand-in. Upload target: 16:9, 1920x1080.
 *
 * Previously '/images/work/imperial-jute-brand.jpg' (branding) and
 * '/images/work/city-online-web.jpg' (ui-ux).
 */
const HERO_IMAGE = {
    branding: null,
    'ui-ux': null,
};

const HERO_ALT = {
    branding: 'Imperial Jute minimal logo and brand cover artwork',
    'ui-ux': 'City Online website UI design case study cover',
};

/** Rich scene only on pointer-fine tablet/desktop; phones get reduced travel. */
function useRichScene() {
    const [rich, setRich] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px) and (pointer: fine)');
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return rich;
}

/**
 * Cinematic 3D hero for the Branding and UI/UX discipline pages.
 *
 * One large background clip with oversized type layered over it — muted,
 * looping and purely decorative, with the still used as its poster and as the
 * small-screen substitute.
 *
 * The clip keeps `preload="auto"` on purpose. With `metadata` the browser
 * asks for the head of the file and then asks again in order to play it, and
 * a server without byte-range support answers both with the whole clip — two
 * full downloads instead of one, which measured as 8.0 MB on this page rather
 * than 4.6 MB. Depth comes
 * from three separated planes (visual / title / foreground chrome): each
 * drifts on the pointer at its own rate inside a perspective stage, and each
 * travels on scroll at its own speed while the whole scene compresses (scale)
 * and hands off to the next section.
 *
 * Motion is transform/opacity/scale only — no blur, no layout animation, and
 * no layer of any kind above the clip itself.
 *
 * The title remains the single sharp primary layer. Behind it runs
 * a continuously rising column of this discipline's sub-service names, outlined
 * rather than filled so it reads as depth in the clip instead of as a second
 * headline. This is the one place duplicated background type is wanted — it
 * supersedes the earlier "no translucent background type" rule, which predates
 * the rising-typography treatment.
 *
 * Nothing in this hero reacts to the pointer. The visual never did, and the
 * stage tilt and per-plane drift are gone, so the title and chrome cannot
 * shake or follow the cursor. Depth is now scroll-driven only.
 *
 * @param {{ category: { slug: string, name: string, tagline: string, accent: string, items: Array<object> } }} props
 */
export default function CategoryHero({ category }) {
    const wrapRef = useRef(null);
    const reduce = useReducedMotion();
    const rich = useRichScene();
    const full = rich && !reduce;

    /**
     * The clip plays on pointer-fine screens that have not asked for reduced
     * motion. A phone gets the poster frame instead: same hero, same crop,
     * same bare visual, none of the download or decode cost, which is what
     * "optimised treatment" has to mean on a metered connection.
     */
    const video = rich && !reduce ? HERO_VIDEO[category.slug] : null;
    const image = HERO_IMAGE[category.slug];
    const alt = HERO_ALT[category.slug] ?? `${category.name} featured work`;
    const title = category.name.toUpperCase();
    const chars = title.split('');

    // Scroll journey across the tall wrapper; the stage is sticky.
    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

    // Scroll journey: the image pushes in slowly and stays fully visible for
    // the whole sticky pass; title and chrome exit at staggered speeds for
    // the layered hand-off into the next section. Transform + opacity only.
    const stageScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.9 : 0.96]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, full ? 1.14 : 1.06]);
    const bgShiftY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
    const titleShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-56%' : '-24%']);
    const titleScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.88 : 0.95]);
    const titleFade = useTransform(scrollYProgress, [0.3, 0.68], [1, 0]);
    const foreShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-70%' : '-30%']);
    const foreFade = useTransform(scrollYProgress, [0.2, 0.55], [1, 0]);

    // The rising column travels more slowly than the title and fades sooner, so
    // it stays read as the layer behind it through the whole scroll hand-off.

    // The column cycles this discipline's own sub-service names — the same
    // content the showcase below the hero lists — falling back to the
    // discipline name when a category has no sub-services yet.

    return (
        <div ref={wrapRef} className="relative" style={{ height: full ? '165svh' : '125svh' }}>
            <div className="sticky top-0 h-svh overflow-hidden bg-[#06060a]">
                {/* compress on scroll */}
                <motion.div style={reduce ? undefined : { scale: stageScale }} className="absolute inset-0">
                    {/* PLANE 1 — background clip (pushes in, then dissolves away).
                        The clip is background only: `pointer-events-none`
                        means it cannot take a wheel, drag or touch, so the
                        page keeps the only scroll on the page. No controls,
                        so it has no scrollable or draggable UI of its own.
                        The poster is the frame it starts on, so the hero is
                        never empty while the first frames decode. */}
                    <motion.div style={reduce ? undefined : { y: bgShiftY, scale: bgScale }} className="absolute inset-0">
                            {video ? (
                                <motion.video
                                    key={video}
                                    src={video}
                                    poster={image}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="auto"
                                    aria-hidden
                                    tabIndex={-1}
                                    disablePictureInPicture
                                    controlsList="nodownload noplaybackrate"
                                    draggable={false}
                                    initial={reduce ? false : { scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1.12, opacity: 1 }}
                                    transition={{ duration: reduce ? 0 : 1.8, ease: [...EASE] }}
                                    className="pointer-events-none h-full w-full select-none object-cover"
                                />
                            ) : image ? (
                                <motion.img
                                    src={image}
                                    alt={alt}
                                    fetchPriority="high"
                                    decoding="async"
                                    draggable={false}
                                    initial={reduce ? false : { scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1.12, opacity: 1 }}
                                    transition={{ duration: reduce ? 0 : 1.8, ease: [...EASE] }}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <MediaPlaceholder kind="video" label={`${category.name} - hero video placeholder`} />
                            )}
                    </motion.div>

                    {/* Theme-aware scrim: sits over the media, under the type. */}
                    <div className="hero-scrim" aria-hidden />

                    {/* Depth stage. It keeps its perspective — the planes' z
                        values are what set their scale — but no longer tilts,
                        because a tilt rotates every plane, type included. */}
                    <motion.div
                        style={full ? { transformStyle: 'preserve-3d', perspective: 1200 } : undefined}
                        className="absolute inset-0"
                    >
                        {/* PLANE 2 — oversized title (single sharp primary layer) */}
                        <motion.div
                            style={reduce ? undefined : { y: titleShiftY, scale: titleScale, opacity: titleFade }}
                            className="absolute inset-0 flex items-center"
                        >
                            <motion.div style={full ? { z: 90 } : undefined} className="container-x w-full">
                                <h1 className="font-display font-extrabold uppercase leading-[0.85] tracking-[-0.04em] text-white" style={{ fontSize: 'clamp(3.4rem, 15.5vw, 12rem)' }} aria-label={category.name}>
                                    {chars.map((char, i) => (
                                        <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom" aria-hidden={i > 0}>
                                            <motion.span
                                                className="inline-block will-change-transform"
                                                initial={reduce ? false : { y: '115%' }}
                                                animate={{ y: '0%' }}
                                                transition={{ duration: reduce ? 0 : 1, delay: 0.35 + i * 0.05, ease: [...EASE] }}
                                            >
                                                {char}
                                            </motion.span>
                                        </span>
                                    ))}
                                </h1>
                            </motion.div>
                        </motion.div>

                        {/* PLANE 3 — foreground chrome */}
                        <motion.div
                            style={reduce ? undefined : { y: foreShiftY, opacity: foreFade }}
                            className="absolute inset-0"
                        >
                            <motion.div style={full ? { z: 150 } : undefined} className="absolute inset-0">
                                <motion.nav
                                    initial={reduce ? false : { opacity: 0, y: -12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: reduce ? 0 : 0.7, delay: 0.9, ease: [...EASE] }}
                                    className="container-x absolute inset-x-0 top-0 flex items-center pt-24 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 md:pt-28"
                                    aria-label="Breadcrumb"
                                >
                                    <div className="flex items-center gap-2">
                                        <Link href="/services" className="tap-area transition-colors duration-200 hover:text-white">Services</Link>
                                        <span aria-hidden>/</span>
                                        <span className="text-white">{category.name}</span>
                                    </div>
                                </motion.nav>

                                <motion.div
                                    initial={reduce ? false : { opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: reduce ? 0 : 0.8, delay: 1.1, ease: [...EASE] }}
                                    className="container-x absolute inset-x-0 bottom-0 flex items-end pb-10 md:pb-12"
                                >
                                    <p className="max-w-md text-[15px] leading-relaxed text-white/75 md:text-base">{category.tagline}</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
