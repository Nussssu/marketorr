import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';

const BRAND_RULE = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/** Full-screen cinematic hero per discipline — dark photographic work, never SVG. */
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
 * One large background image with oversized type layered over it. Depth comes
 * from four separated planes (image / ghost numeral / title / foreground
 * chrome): each drifts on the pointer at its own rate inside a perspective
 * stage, and each travels on scroll at its own speed while the whole scene
 * compresses (scale + dim veil) and hands off to the next section.
 *
 * Motion is transform/opacity/scale only — no blur, no layout animation.
 * Brand colors appear only as subtle lighting accents over the photo.
 *
 * @param {{ category: { slug: string, name: string, tagline: string, accent: string, items: Array<object> } }} props
 */
export default function CategoryHero({ category }) {
    const wrapRef = useRef(null);
    const pointerFrame = useRef(0);
    const nextPointer = useRef({ x: 0, y: 0 });
    const reduce = useReducedMotion();
    const rich = useRichScene();
    const full = rich && !reduce;

    const image = HERO_IMAGE[category.slug] ?? HERO_IMAGE.branding;
    const alt = HERO_ALT[category.slug] ?? `${category.name} featured work`;
    const index = category.slug === 'ui-ux' ? '02' : '01';
    const title = category.name.toUpperCase();
    const chars = title.split('');

    // Scroll journey across the tall wrapper; the stage is sticky.
    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

    // Pointer depth, spring-smoothed so the planes glide, never jump.
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const depthX = useSpring(pointerX, { stiffness: 55, damping: 18, mass: 0.6 });
    const depthY = useSpring(pointerY, { stiffness: 55, damping: 18, mass: 0.6 });

    // Stage tilt — the whole scene leans into the cursor in 3D.
    const tiltX = useTransform(depthY, [-1, 1], full ? [4.5, -4.5] : [0, 0]);
    const tiltY = useTransform(depthX, [-1, 1], full ? [-5.5, 5.5] : [0, 0]);

    // Per-plane pointer drift: deeper planes barely move, front planes travel.
    const bgX = useTransform(depthX, [-1, 1], full ? [-16, 16] : [0, 0]);
    const bgY = useTransform(depthY, [-1, 1], full ? [-12, 12] : [0, 0]);
    const ghostX = useTransform(depthX, [-1, 1], full ? [-44, 44] : [0, 0]);
    const ghostY = useTransform(depthY, [-1, 1], full ? [-30, 30] : [0, 0]);
    const titleX = useTransform(depthX, [-1, 1], full ? [-30, 30] : [0, 0]);
    const titleY = useTransform(depthY, [-1, 1], full ? [-22, 22] : [0, 0]);
    const foreX = useTransform(depthX, [-1, 1], full ? [-58, 58] : [0, 0]);
    const foreY = useTransform(depthY, [-1, 1], full ? [-42, 42] : [0, 0]);

    // Scroll journey: the image pushes in slowly, then dissolves away late so
    // the typography is left floating; title, ghost and chrome exit at
    // staggered speeds (chrome first, title sweeping furthest) for the
    // layered hand-off into the next section. Transform + opacity only.
    const stageScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.9 : 0.96]);
    const veilOpacity = useTransform(scrollYProgress, [0.55, 1], [0, full ? 0.62 : 0.45]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, full ? 1.14 : 1.06]);
    const bgShiftY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
    const bgFade = useTransform(scrollYProgress, [0.5, 0.92], [1, 0]);
    const ghostShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-52%' : '-24%']);
    const ghostFade = useTransform(scrollYProgress, [0.3, 0.75], [1, 0]);
    const titleShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-56%' : '-24%']);
    const titleScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.88 : 0.95]);
    const titleFade = useTransform(scrollYProgress, [0.3, 0.68], [1, 0]);
    const foreShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-70%' : '-30%']);
    const foreFade = useTransform(scrollYProgress, [0.2, 0.55], [1, 0]);

    const onPointerMove = (event) => {
        if (!full || event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        nextPointer.current = {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
        };
        if (pointerFrame.current) return;

        pointerFrame.current = requestAnimationFrame(() => {
            pointerFrame.current = 0;
            pointerX.set(nextPointer.current.x);
            pointerY.set(nextPointer.current.y);
        });
    };
    const onPointerLeave = () => {
        cancelAnimationFrame(pointerFrame.current);
        pointerFrame.current = 0;
        pointerX.set(0);
        pointerY.set(0);
    };

    useEffect(() => () => cancelAnimationFrame(pointerFrame.current), []);

    return (
        <div ref={wrapRef} className="relative" style={{ height: full ? '165svh' : '125svh' }}>
            <div
                className="sticky top-0 h-svh overflow-hidden bg-[#06060a]"
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
            >
                {/* compress on scroll */}
                <motion.div style={reduce ? undefined : { scale: stageScale }} className="absolute inset-0">
                    {/* 3D stage */}
                    <motion.div
                        style={
                            full
                                ? { rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d', perspective: 1200 }
                                : undefined
                        }
                        className="absolute inset-0"
                    >
                        {/* PLANE 1 — background image (pushes in, then dissolves away) */}
                        <motion.div style={reduce ? undefined : { y: bgShiftY, scale: bgScale, opacity: bgFade }} className="absolute inset-0">
                            <motion.div style={full ? { x: bgX, y: bgY, z: 0 } : undefined} className="absolute inset-0">
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
                            </motion.div>
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

                        {/* PLANE 2 — ghost index numeral */}
                        <motion.div
                            style={reduce ? undefined : { y: ghostShiftY, opacity: ghostFade }}
                            className="absolute inset-0"
                            aria-hidden
                        >
                            <motion.div style={full ? { x: ghostX, y: ghostY, z: 40 } : undefined} className="absolute inset-0">
                                <motion.span
                                    initial={reduce ? false : { opacity: 0, scale: 1.08 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: reduce ? 0 : 1.4, delay: 0.8, ease: [...EASE] }}
                                    className="absolute right-[2%] top-[16%] select-none font-display font-extrabold leading-none text-transparent md:top-[12%]"
                                    style={{ fontSize: 'clamp(10rem, 30vw, 26rem)', WebkitTextStroke: '1px rgba(255,255,255,0.22)' }}
                                >
                                    {index}
                                </motion.span>
                            </motion.div>
                        </motion.div>

                        {/* PLANE 3 — oversized title */}
                        <motion.div
                            style={reduce ? undefined : { y: titleShiftY, scale: titleScale, opacity: titleFade }}
                            className="absolute inset-0 flex items-center"
                        >
                            <motion.div style={full ? { x: titleX, y: titleY, z: 90 } : undefined} className="container-x w-full">
                                <p
                                    className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white/60 md:text-[12px]"
                                >
                                    <span className="inline-block h-[2px] w-10" style={{ background: BRAND_RULE }} aria-hidden />
                                    {index} / Discipline
                                </p>
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

                        {/* PLANE 4 — foreground chrome */}
                        <motion.div
                            style={reduce ? undefined : { y: foreShiftY, opacity: foreFade }}
                            className="absolute inset-0"
                        >
                            <motion.div style={full ? { x: foreX, y: foreY, z: 150 } : undefined} className="absolute inset-0">
                                <motion.nav
                                    initial={reduce ? false : { opacity: 0, y: -12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: reduce ? 0 : 0.7, delay: 0.9, ease: [...EASE] }}
                                    className="container-x absolute inset-x-0 top-0 flex items-center justify-between pt-24 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 md:pt-28"
                                    aria-label="Breadcrumb"
                                >
                                    <div className="flex items-center gap-2">
                                        <Link href="/services" className="tap-area transition-colors duration-200 hover:text-white">Services</Link>
                                        <span aria-hidden>/</span>
                                        <span className="text-white">{category.name}</span>
                                    </div>
                                    <span className="flex items-center gap-2" aria-hidden>
                                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: category.accent }} />
                                        {String(category.items.length).padStart(2, '0')} services
                                    </span>
                                </motion.nav>

                                <motion.div
                                    initial={reduce ? false : { opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: reduce ? 0 : 0.8, delay: 1.1, ease: [...EASE] }}
                                    className="container-x absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-10 md:pb-12"
                                >
                                    <p className="max-w-md text-[15px] leading-relaxed text-white/75 md:text-base">{category.tagline}</p>
                                    <p className="hidden flex-col items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white/60 sm:flex" aria-hidden>
                                        Scroll to explore
                                        <motion.span
                                            animate={reduce ? undefined : { scaleY: [0.2, 1, 0.2], opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                                            className="block h-12 w-[2px] origin-top"
                                            style={{ background: BRAND_RULE }}
                                        />
                                    </p>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* dim veil for the scroll hand-off */}
                        <motion.div style={reduce ? undefined : { opacity: veilOpacity }} className="pointer-events-none absolute inset-0 bg-black" aria-hidden />

                        {/* thin brand rule anchoring the scene */}
                        <motion.div
                            initial={reduce ? false : { scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: reduce ? 0 : 1.1, delay: 1.25, ease: [...EASE] }}
                            className="absolute inset-x-0 bottom-0 h-[3px] origin-left"
                            style={{ background: BRAND_RULE }}
                            aria-hidden
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
