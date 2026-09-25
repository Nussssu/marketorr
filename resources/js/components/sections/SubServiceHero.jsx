import { Link } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { consumeShowcaseArrival } from '../motion/ShowcaseTransition';
import { EASE } from '../../lib/motion';
import MediaPlaceholder from '../media/MediaPlaceholder';


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
 * Cinematic 3D hero for every sub-service page (Brand Strategy … Design System).
 *
 * Same architecture as the discipline hero: one large topic visual with an
 * oversized title layered over it, split across depth planes (visual / title /
 * foreground chrome). Each plane travels on scroll at its own speed while the
 * scene compresses (scale) and hands off to the deliverables section.
 *
 * Motion is transform/translate3d/scale/rotate/opacity only — no blur, no
 * layout animation, and no layer of any kind above the visual itself.
 *
 * Nothing in this hero reacts to the pointer. Depth is scroll-driven only.
 *
 * @param {{ item: { slug: string, name: string, short: string, image: string, accent: string, position: number, total: number, category: { slug: string, name: string } }, parentHref: string }} props
 */
export default function SubServiceHero({ item, parentHref }) {
    const wrapRef = useRef(null);
    const reduce = useReducedMotion();
    const rich = useRichScene();
    const full = rich && !reduce;

    /**
     * Arrived by clicking this sub-service in the category showcase, which
     * means its photograph is already full-bleed on screen. Playing the usual
     * push-in from nothing would throw that away and flash an empty stage, so
     * the visual starts settled and only the copy over it is revealed.
     */
    const [arrived] = useState(consumeShowcaseArrival);

    const words = item.name.toUpperCase().split(' ');
    let charIndex = 0;

    // Scroll journey across the tall wrapper; the stage is sticky.
    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

    // Scroll journey: the visual pushes in slowly, the title rushes up faster,
    // and foreground chrome exits first as the stage compresses.
    const stageScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.93 : 0.97]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, full ? 1.14 : 1.06]);
    const bgShiftY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
    const titleShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-38%' : '-16%']);
    const titleScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.9 : 0.96]);
    const titleFade = useTransform(scrollYProgress, [0.35, 0.8], [1, 0]);
    const foreShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-70%' : '-30%']);
    const foreFade = useTransform(scrollYProgress, [0.2, 0.55], [1, 0]);

    return (
        <div ref={wrapRef} className="relative" style={{ height: full ? '175svh' : '150svh' }}>
            <div className="sticky top-0 h-svh overflow-hidden bg-[#06060a]">
                {/* compress on scroll */}
                <motion.div style={reduce ? undefined : { scale: stageScale }} className="absolute inset-0">
                    {/* PLANE 1 — topic visual */}
                    <motion.div style={reduce ? undefined : { y: bgShiftY, scale: bgScale }} className="absolute inset-0">
                            {item.image ? (
                                <motion.img
                                    src={item.image}
                                    alt={`${item.name} featured visual`}
                                    fetchPriority="high"
                                    decoding="async"
                                    draggable={false}
                                    initial={reduce || arrived ? false : { scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1.12, opacity: 1 }}
                                    transition={{ duration: reduce || arrived ? 0 : 1.8, ease: [...EASE] }}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <MediaPlaceholder label={`${item.name} - hero image placeholder`} />
                            )}
                    </motion.div>

                    {/* Theme-aware scrim: sits over the media, under the type. */}
                    <div className="hero-scrim" aria-hidden />

                    {/* Depth stage. It keeps its perspective — the planes' z
                        values are what set their scale — but never tilts:
                        a tilt rotates every plane, type included, and nothing
                        here may react to the pointer. */}
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
                                <h1 className="max-w-6xl font-display font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-white" style={{ fontSize: 'clamp(2.6rem, 10vw, 8.5rem)' }} aria-label={item.name}>
                                    {words.map((word, w) => (
                                        <span key={w} className="mr-[0.24em] inline-block whitespace-nowrap last:mr-0" aria-hidden={w > 0}>
                                            {word.split('').map((char) => {
                                                const i = charIndex++;
                                                return (
                                                    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                                                        <motion.span
                                                            className="inline-block will-change-transform"
                                                            initial={reduce ? false : { y: '115%' }}
                                                            animate={{ y: '0%' }}
                                                            transition={{ duration: reduce ? 0 : 1, delay: 0.35 + Math.min(i, 14) * 0.045, ease: [...EASE] }}
                                                        >
                                                            {char}
                                                        </motion.span>
                                                    </span>
                                                );
                                            })}
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
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                        <Link href="/services" className="tap-area transition-colors duration-200 hover:text-white">Services</Link>
                                        <span aria-hidden>/</span>
                                        <Link href={parentHref} className="tap-area transition-colors duration-200 hover:text-white">{item.category.name}</Link>
                                        <span aria-hidden>/</span>
                                        <span className="truncate text-white">{item.name}</span>
                                    </div>
                                </motion.nav>

                                <motion.div
                                    initial={reduce ? false : { opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: reduce ? 0 : 0.8, delay: 1.1, ease: [...EASE] }}
                                    className="container-x absolute inset-x-0 bottom-0 flex items-end pb-10 md:pb-12"
                                >
                                    <p className="max-w-md text-[15px] leading-relaxed text-white/75 md:text-base">{item.short}</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
