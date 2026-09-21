import { Link } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import RisingTypeLoop from '../motion/RisingTypeLoop';


/** Full-screen cinematic hero per discipline — dark photographic work, never SVG. */
/**
 * Background clip for the discipline heroes.
 *
 * One file per discipline, keyed by slug, so a second clip can be dropped in
 * for UI/UX without touching this component. Falls back to the shared clip.
 */
const HERO_VIDEO = {
    branding: '/videos/hero-discipline.mp4',
    'ui-ux': '/videos/hero-discipline.mp4',
};

const HERO_IMAGE = {
    branding: '/images/work/imperial-jute-brand.jpg',
    'ui-ux': '/images/work/city-online-web.jpg',
};

const HERO_ALT = {
    branding: 'Imperial Jute brand identity system — signage, stationery and logo construction',
    'ui-ux': 'City Online website interface presented on a dark laptop mockup',
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
 * small-screen substitute. Depth comes
 * from three separated planes (visual / title / foreground chrome): each
 * drifts on the pointer at its own rate inside a perspective stage, and each
 * travels on scroll at its own speed while the whole scene compresses (scale
 * + dim veil) and hands off to the next section.
 *
 * Motion is transform/opacity/scale only — no blur, no layout animation.
 * Brand colors appear only as subtle lighting accents over the photo.
 *
 * The title remains the single sharp primary layer. Behind it, PLANE 1.5 runs
 * a continuously rising column of this discipline's sub-service names, outlined
 * rather than filled so it reads as depth in the clip instead of as a second
 * headline. This is the one place duplicated background type is wanted — it
 * supersedes the earlier "no translucent background type" rule, which predates
 * the rising-typography treatment.
 *
 * Nothing in this hero reacts to the pointer. The visual never did, and the
 * type no longer does: the stage tilt and the per-plane drift are gone, so the
 * title and chrome cannot shake or follow the cursor. Depth is now scroll and
 * time only.
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
     * same overlays, none of the download or decode cost, which is what
     * "optimised treatment" has to mean on a metered connection.
     */
    const video = rich && !reduce ? (HERO_VIDEO[category.slug] ?? HERO_VIDEO.branding) : null;
    const image = HERO_IMAGE[category.slug] ?? HERO_IMAGE.branding;
    const alt = HERO_ALT[category.slug] ?? `${category.name} featured work`;
    const title = category.name.toUpperCase();
    const chars = title.split('');

    // Scroll journey across the tall wrapper; the stage is sticky.
    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

    // Scroll journey: the image pushes in slowly, then dissolves away late so
    // the typography is left floating; title and chrome exit at staggered
    // speeds (chrome first, title sweeping furthest) for the layered hand-off
    // into the next section. Transform + opacity only.
    const stageScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.9 : 0.96]);
    const veilOpacity = useTransform(scrollYProgress, [0.55, 1], [0, full ? 0.62 : 0.45]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, full ? 1.14 : 1.06]);
    const bgShiftY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
    const bgFade = useTransform(scrollYProgress, [0.5, 0.92], [1, 0]);
    const titleShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-56%' : '-24%']);
    const titleScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.88 : 0.95]);
    const titleFade = useTransform(scrollYProgress, [0.3, 0.68], [1, 0]);
    const foreShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-70%' : '-30%']);
    const foreFade = useTransform(scrollYProgress, [0.2, 0.55], [1, 0]);

    // The rising column travels more slowly than the title and fades sooner, so
    // it stays read as the layer behind it through the whole scroll hand-off.
    const loopShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-30%' : '-14%']);
    const loopFade = useTransform(scrollYProgress, [0.32, 0.72], [1, 0]);

    // The column cycles this discipline's own sub-service names — the same
    // content the showcase below the hero lists — falling back to the
    // discipline name when a category has no sub-services yet.
    const subServiceNames = (category.items ?? []).map((sub) => sub.name).filter(Boolean);
    const heroLoopWords = subServiceNames.length > 0 ? subServiceNames : [category.name];

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
                    <motion.div style={reduce ? undefined : { y: bgShiftY, scale: bgScale, opacity: bgFade }} className="absolute inset-0">
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
                            ) : (
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
                            )}
                        {/* legibility scrims + subtle brand lighting dissolve with the photo */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    'linear-gradient(180deg, rgba(5,5,10,0.68) 0%, rgba(5,5,10,0.38) 32%, rgba(5,5,10,0.42) 62%, rgba(5,5,10,0.84) 100%)',
                            }}
                            aria-hidden
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `radial-gradient(55% 40% at 12% 6%, ${category.accent}45, transparent 70%), radial-gradient(45% 38% at 88% 96%, rgba(27,226,235,0.20), transparent 70%), radial-gradient(40% 32% at 82% 8%, rgba(80,122,244,0.16), transparent 70%)`,
                            }}
                            aria-hidden
                        />
                    </motion.div>

                    {/* Depth stage. It keeps its perspective — the planes' z
                        values are what set their scale — but no longer tilts,
                        because a tilt rotates every plane, type included. */}
                    <motion.div
                        style={full ? { transformStyle: 'preserve-3d', perspective: 1200 } : undefined}
                        className="absolute inset-0"
                    >
                        {/* PLANE 1.5 — continuously rising discipline typography */}
                        <motion.div
                            style={reduce ? undefined : { y: loopShiftY, opacity: loopFade }}
                            className="absolute inset-0"
                            aria-hidden
                        >
                            <motion.div style={full ? { z: 20 } : undefined} className="absolute inset-0">
                                <RisingTypeLoop words={heroLoopWords} />
                            </motion.div>
                        </motion.div>

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

                        {/* dim veil for the scroll hand-off */}
                        <motion.div style={reduce ? undefined : { opacity: veilOpacity }} className="pointer-events-none absolute inset-0 bg-black" aria-hidden />

                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
