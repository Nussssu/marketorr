import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import { useTapIntent } from '../../lib/tapIntent';
import { SectionLabel, Tag } from '../ui/primitives';
import RevealText from '../motion/RevealText';

/** Every project card shares this ratio, so the strip is one set of equal objects. */
const CARD_RATIO = 16 / 10;

/** Parallax + cover-reveal are desktop/tablet only; phones keep a plain fade. */
function useRichMotion() {
    const [rich, setRich] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px)');
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return rich;
}

/** Sticky scroll runways are desktop mouse/trackpad interactions only. */
function useDesktopScrollStage() {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const update = () => setEnabled(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return enabled;
}

/**
 * Real project cover: masked reveal on entry, slow scroll parallax, fast hover.
 *
 * @param {{ p: import('../../lib/projects').Project, glow: (color: string, size: number) => string, rich: boolean, progress: import('framer-motion').MotionValue<number> }} props
 */
function ProjectCover({ p, glow, rich, progress }) {
    const reduce = useReducedMotion();
    const parallax = rich && !reduce;
    // Small, GPU-only drift: transform + opacity only, no blur, no layout work.
    const y = useTransform(progress, [0, 1], parallax ? ['-3%', '3%'] : ['0%', '0%']);

    return (
        <div className="relative h-full w-full overflow-hidden bg-[#111116]" style={{ containerType: 'inline-size' }}>
            <motion.div
                className="absolute inset-x-0 -top-[3%] h-[106%]"
                style={{ y, willChange: parallax ? 'transform' : undefined }}
                initial={{ scale: reduce ? 1 : 1.06 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.9, ease: [...EASE] }}
            >
                <img
                    src={p.image}
                    alt={p.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.035]"
                />
            </motion.div>

            {/* accent wash — keeps covers cinematic in both themes, lifts on hover */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-200 group-hover:opacity-40"
                style={{ background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}2e, transparent 55%), linear-gradient(160deg, rgba(24,24,31,0.55), rgba(8,8,10,0.82))` }}
                aria-hidden
            />

            {/* curtain wipe on first entry only — transform-only, never re-runs on scroll */}
            {!reduce && (
                <motion.span
                    className="absolute inset-0 origin-bottom bg-[var(--bg-soft)]"
                    initial={{ scaleY: 1 }}
                    whileInView={{ scaleY: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 0.6, ease: [...EASE] }}
                    aria-hidden
                />
            )}

            {p.metric && (
                <motion.div
                    className="absolute right-4 top-4 text-right md:right-8 md:top-8"
                    initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 0.5, delay: 0.5, ease: [...EASE] }}
                    aria-hidden
                >
                    <p
                        className="font-display font-extrabold leading-none text-white/95"
                        style={{ fontSize: 'clamp(1.35rem, 9cqw, 3.5rem)', textShadow: `0 2px 24px ${p.accent}55` }}
                    >
                        {p.metric}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 md:text-[11px] md:tracking-[0.2em]">{p.metricLabel}</p>
                </motion.div>
            )}

            <div
                className="absolute bottom-4 left-4 flex max-w-[calc(100%-5rem)] items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 md:bottom-6 md:left-6 md:max-w-[calc(100%-6rem)]"
                style={{ boxShadow: glow ? glow(p.accent, 26) : undefined }}
                aria-hidden
            >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
                <span className="truncate font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">{p.category}</span>
            </div>

            <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black transition-transform duration-200 group-hover:scale-105 md:bottom-6 md:right-6 md:h-14 md:w-14" aria-hidden>
                <span data-arrow>↗</span>
            </div>

            <span className="absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-200 group-hover:border-white/20" aria-hidden />
            <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }} aria-hidden />
        </div>
    );
}

/**
 * One carousel slide. Every card now shares the same ratio and the same row
 * height (`--mq-h`), so the strip reads as one set of equal objects — the
 * per-card ratios and the vertical drift that used to stagger them are gone,
 * since both are exactly what made the row look misaligned.
 *
 * The card keeps its pointer tilt: the carousel slot around it owns the
 * travel, depth and focus, this owns the hover response.
 *
 * @param {{ p: import('../../lib/projects').Project, glow?: (color: string, size: number) => string, className?: string, ratio?: number }} props
 */
function Card({ p, glow, className = '', ratio = CARD_RATIO, focus }) {
    const ref = useRef(null);
    const rich = useRichMotion();
    const reduce = useReducedMotion();
    const tapIntent = useTapIntent();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const tiltable = rich && !reduce;

    // Pointer tilt: the card turns toward the cursor and springs back on exit.
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const tiltY = useSpring(pointerX, { stiffness: 150, damping: 20, mass: 0.4 });
    const tiltX = useSpring(pointerY, { stiffness: 150, damping: 20, mass: 0.4 });

    const onPointerMove = (event) => {
        if (!tiltable || event.pointerType !== 'mouse') return;
        const box = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 11);
        pointerY.set(((event.clientY - box.top) / box.height - 0.5) * -8);
    };

    const onPointerLeave = () => {
        pointerX.set(0);
        pointerY.set(0);
    };

    const meta = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
    };
    const metaItem = {
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [...EASE] } },
    };

    return (
        <motion.div
            ref={ref}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.18 }}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className={`w-full ${className}`.trimEnd()}
            style={{
                rotateX: tiltable ? tiltX : 0,
                rotateY: tiltable ? tiltY : 0,
                transformPerspective: 1100,
            }}
        >
            <Link href={`/work/${p.slug}`} data-cursor="view" {...tapIntent} className="group block" aria-label={`View ${p.title} case study`}>
                <div
                    className="w-full overflow-hidden rounded-2xl border border-[var(--line)]"
                    style={{ height: 'var(--mq-h)', aspectRatio: ratio }}
                >
                    <ProjectCover p={p} glow={glow} rich={rich} progress={scrollYProgress} />
                </div>
                <motion.div style={focus ? { opacity: focus } : undefined}>
                <motion.div
                    variants={meta}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-12% 0px' }}
                    className="mt-5 flex flex-wrap items-start justify-between gap-4"
                >
                    <div>
                        <motion.p variants={metaItem} className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">{p.client} · {p.year}</motion.p>
                        <motion.h3 variants={metaItem} className="mt-1 font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)] md:text-3xl">
                            <span className="bg-[linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)] bg-[length:0%_100%] bg-no-repeat bg-clip-text transition-[background-size,color] duration-200 group-hover:bg-[length:100%_100%] group-hover:text-transparent">
                                {p.title}
                            </span>
                        </motion.h3>
                        <motion.p variants={metaItem} className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--mute)]">{p.description}</motion.p>
                        <motion.div variants={metaItem} className="mt-3 flex flex-wrap gap-2">
                            {p.tags.map((t) => (
                                <Tag key={t} accent={p.accent}>{t}</Tag>
                            ))}
                        </motion.div>
                    </div>
                    {p.metric && (
                        <motion.div variants={metaItem} className="text-right">
                            <p className="font-display text-2xl font-extrabold" style={{ color: p.accent }}>{p.metric}</p>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{p.metricLabel}</p>
                        </motion.div>
                    )}
                </motion.div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

/** Compact two-column card used only below the tablet breakpoint. */
function MobileCard({ p, focus }) {
    const reduce = useReducedMotion();
    const tapIntent = useTapIntent();

    return (
        <motion.article
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.985 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [...EASE] }}
            className="w-full"
        >
            <Link
                href={`/work/${p.slug}`}
                data-cursor="view"
                {...tapIntent}
                className="group block h-full min-w-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2"
                aria-label={`View ${p.title} case study`}
            >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#111116]">
                    <img
                        src={p.image}
                        alt={p.imageAlt}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.035]"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(24,24,31,0.28),rgba(8,8,10,0.62))] transition-opacity duration-200 group-hover:opacity-75"
                        aria-hidden
                    />
                    {p.metric && (
                        <p className="absolute right-2 top-2 font-display text-[13px] font-extrabold leading-none text-white/95" aria-hidden>
                            {p.metric}
                        </p>
                    )}
                    <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-black transition-transform duration-200 group-hover:scale-105" aria-hidden>
                        <span data-arrow>↗</span>
                    </div>
                </div>

                <motion.div className="min-w-0 px-0.5 pb-0.5 pt-2" style={focus ? { opacity: focus } : undefined}>
                    <p className="truncate text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                        {p.client} · {p.year}
                    </p>
                    <h3 className="mt-1 min-h-[2.25rem] overflow-hidden font-display text-[13px] font-extrabold uppercase leading-[1.05] text-[var(--ink-strong)]">
                        <span className="bg-[linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)] bg-[length:0%_100%] bg-no-repeat bg-clip-text transition-[background-size,color] duration-200 group-hover:bg-[length:100%_100%] group-hover:text-transparent">
                            {p.title}
                        </span>
                    </h3>
                    <p className="mt-1.5 overflow-hidden text-[9px] leading-[1.35] text-[var(--mute)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                        {p.description}
                    </p>
                    {p.tags.length > 0 && (
                        <div className="mt-2 flex min-w-0 items-center gap-1">
                            <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--chip)] px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                                <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: p.accent }} aria-hidden />
                                <span className="truncate">{p.tags[0]}</span>
                            </span>
                            {p.tags.length > 1 && (
                                <span className="shrink-0 text-[7px] font-bold text-[var(--ink-faint)]">+{p.tags.length - 1}</span>
                            )}
                        </div>
                    )}
                </motion.div>
            </Link>
        </motion.article>
    );
}

/** Image-free final slide linking the showcase to the complete work archive. */
function SeeAllWorkCard({ focus }) {
    const tapIntent = useTapIntent();

    return (
        <motion.div className="w-full" style={focus ? { opacity: focus } : undefined}>
            <Link
                href="/work"
                prefetch
                data-cursor="cta"
                {...tapIntent}
                className="group relative flex h-[var(--mq-h)] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-[transform,border-color] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-[#507AF4]/50 focus-visible:-translate-y-1 sm:p-8"
                aria-label="See all work"
            >
                <span
                    className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-[0.18] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                    aria-hidden
                />

                <span className="flex items-center justify-between">
                    <span className="font-display text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] sm:text-[11px]">
                        Project archive
                    </span>
                    <span className="flex gap-1.5" aria-hidden>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#891FFB]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#507AF4]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1BE2EB]" />
                    </span>
                </span>

                <span className="max-w-[15rem] text-[10px] leading-relaxed text-[var(--mute)] sm:text-[13px]">
                    Explore the complete collection of brands and digital products.
                </span>

                <span className="flex items-end justify-between gap-5">
                    <span className="inline-flex items-center gap-2 font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-strong)] sm:text-[13px]">
                        See all work
                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                    <span className="see-all-work__arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-base text-[var(--ink)] transition-[opacity,transform,background-color,color,border-color] duration-300 group-hover:border-transparent group-hover:bg-[#507AF4] group-hover:text-white group-focus-visible:border-transparent group-focus-visible:bg-[#507AF4] group-focus-visible:text-white sm:h-12 sm:w-12 sm:text-lg" aria-hidden>
                        ↗
                    </span>
                </span>
            </Link>
        </motion.div>
    );
}

/**
 * How far a slide is allowed to recede before the effect stops deepening —
 * past this many places from the focus it is already fully back and dim.
 */
const DEPTH_SPAN = 3;

/**
 * Per-place cues. Phones get the flattened set: wider travel so slides clear
 * each other without depth, and no rotation or Z at all — on a phone those buy
 * a 3D rendering path and a repaint, not a sense of space.
 */
const CAROUSEL = {
    rich: { travel: 66, depth: 190, turn: 21, shrink: 0.085, fade: 0.3 },
    light: { travel: 84, depth: 0, turn: 0, shrink: 0.06, fade: 0.26 },
};

/** Seconds of projected travel granted to a flick after release. */
const INERTIA_SECONDS = 0.19;

/** A flick can carry at most this many places, so it never rockets past. */
const INERTIA_MAX = 2;

/** Pointer travel (px) after which a gesture counts as a drag, not a tap. */
const DRAG_SLOP = 6;

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

/**
 * One slide in the 3D stack. Its whole appearance is a function of how many
 * places it sits from the focus, so nothing here has to know about drags,
 * wheels or springs.
 *
 * Each slide carries its own perspective rather than inheriting one from a
 * shared stage: the viewport has to clip, and an ancestor that clips forces
 * `transform-style` back to flat, which would throw the depth away.
 *
 * @param {{
 *   children: import('react').ReactNode,
 *   index: number,
 *   position: import('framer-motion').MotionValue<number>,
 *   stage: { travel: number, depth: number, turn: number, shrink: number, fade: number },
 *   flat: boolean,
 * }} props
 */
function CarouselSlide({ render, index, position, stage, flat }) {
    const distance = useTransform(position, (value) => clamp(index - value, -DEPTH_SPAN, DEPTH_SPAN));

    const x = useTransform(distance, (value) => `${value * stage.travel}%`);
    const z = useTransform(distance, (value) => -Math.abs(value) * stage.depth);
    const rotateY = useTransform(distance, (value) => -value * stage.turn);
    const scale = useTransform(distance, (value) => 1 - Math.abs(value) * stage.shrink);
    const opacity = useTransform(distance, (value) => Math.max(0.08, 1 - Math.abs(value) * stage.fade));
    const zIndex = useTransform(distance, (value) => 100 - Math.round(Math.abs(value) * 10));

    // Covers may overlap in depth, but their captions must not: the written
    // block belongs to whichever project currently holds the focus.
    const focus = useTransform(distance, (value) => clamp(1 - Math.abs(value) / 0.7, 0, 1));
    // Only the focused slide takes clicks — the recessed ones sit underneath it.
    const pointerEvents = useTransform(distance, (value) => (Math.abs(value) < 0.5 ? 'auto' : 'none'));

    // The flat path omits the 3D properties outright rather than zeroing them:
    // a `z` or a perspective still promotes the slide to a 3D matrix, which is
    // the cost this branch exists to avoid.
    const depth = flat ? {} : { z, rotateY, transformPerspective: 1400 };

    return (
        <motion.li
            className="work-carousel__slide"
            style={{ x, scale, opacity, zIndex, pointerEvents, ...depth }}
        >
            {render(focus)}
        </motion.li>
    );
}

/**
 * User-driven 3D project carousel — nothing advances on its own.
 *
 * One motion value, `position`, is the carousel's whole state: the fractional
 * place currently in focus. Every input writes to it and every slide reads
 * from it, so the gestures compose instead of competing:
 *
 * - **Drag** (mouse or touch) moves it 1:1 with the gesture, then releases into
 *   inertia: the flick's velocity is projected forward, capped, and snapped to
 *   the nearest place, which the spring glides into.
 * - **Wheel / trackpad** accumulates the dominant axis until it crosses a
 *   slide, then steps. The event is never prevented, so vertical page scrolling
 *   remains native while a wheel pass also moves the showcase.
 * - **Moving the mouse** across the strip steers it: the outer thirds pull the
 *   neighbouring project forward, while a dead zone in the middle leaves the
 *   focused card still enough to click.
 * - **Arrow keys** step it, which is what replaces the removed timer for
 *   keyboard users.
 *
 * Travel is expressed as a percentage of a slide's own width, so the geometry
 * needs no measurement and stays correct through every breakpoint; the one
 * measured number is the slide's pixel width, used solely to convert pointer
 * distance into places.
 *
 * Reduced motion gets a plain snap-scrolling row instead — no transforms, no
 * gesture handling.
 *
 * @param {{ projects: Array<import('../../lib/projects').Project>, glow?: (color: string, size: number) => string }} props
 */
function WorkCarousel({ projects, glow, controlledPosition }) {
    const rich = useRichMotion();
    const reduce = useReducedMotion();
    const slideRef = useRef(null);
    const [active, setActive] = useState(0);

    const count = projects.length + 1;
    const last = Math.max(0, count - 1);
    const stage = rich ? CAROUSEL.rich : CAROUSEL.light;

    // Committed place and live gesture offsets are kept apart, so a release can
    // hand the drag over to the committed value in one frame with no jump.
    const settled = useMotionValue(0);
    const dragged = useMotionValue(0);
    const steered = useMotionValue(0);
    const steerSpring = useSpring(steered, { stiffness: 90, damping: 22, mass: 0.5 });
    const target = useTransform(
        [settled, dragged, steerSpring],
        ([base, drag, steer]) => clamp(base + drag + steer, 0, last),
    );
    const position = useSpring(target, { stiffness: 260, damping: 34, mass: 0.5 });

    useMotionValueEvent(position, 'change', (value) => {
        const next = clamp(Math.round(value), 0, last);
        setActive((previous) => (previous === next ? previous : next));
    });

    // The only measurement in the carousel: how many pixels of pointer travel
    // make one place. Slides are spaced by a percentage of their own width, so
    // the pitch is that percentage of the measured slide — not the full width.
    const pitch = useRef(1);
    useEffect(() => {
        const slide = slideRef.current;
        if (!slide || typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(([entry]) => {
            pitch.current = Math.max(1, (entry.contentRect.width * stage.travel) / 100);
        });
        observer.observe(slide);

        return () => observer.disconnect();
    }, [stage.travel]);

    const gesture = useRef({ id: null, startX: 0, lastX: 0, lastAt: 0, velocity: 0, moved: false });
    const dragging = useRef(false);

    useEffect(() => {
        if (!controlledPosition) return undefined;

        const sync = (value) => {
            if (dragging.current) return;
            settled.set(value);
        };
        sync(controlledPosition.get());

        return controlledPosition.on('change', sync);
    }, [controlledPosition, settled]);

    const stepTo = (place) => {
        settled.set(clamp(place, 0, last));
    };

    const onPointerDown = (event) => {
        if (reduce || count < 2) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        gesture.current = {
            id: event.pointerId,
            startX: event.clientX,
            lastX: event.clientX,
            lastAt: event.timeStamp,
            velocity: 0,
            moved: false,
        };
        dragging.current = true;
        steered.set(0);
        // Deliberately NOT capturing the pointer yet. Capturing here would
        // retarget the click to this element, and every card would stop
        // opening its case study. Capture is taken only once the gesture has
        // passed the slop and is unambiguously a drag.
    };

    const onPointerMove = (event) => {
        if (reduce || count < 2) return;

        // Hover steering: only while no gesture is in flight, and only for a
        // real mouse — a finger resting on the strip must not move it.
        if (!dragging.current) {
            if (event.pointerType !== 'mouse' || !rich) return;
            const box = event.currentTarget.getBoundingClientRect();
            const fromCentre = (event.clientX - box.left) / box.width - 0.5;
            const DEAD_ZONE = 0.2;
            const past = Math.max(0, Math.abs(fromCentre) - DEAD_ZONE) / (0.5 - DEAD_ZONE);
            steered.set(Math.sign(fromCentre) * past * 0.75);

            return;
        }

        const state = gesture.current;
        if (state.id !== event.pointerId) return;

        const dx = event.clientX - state.lastX;
        const dt = Math.max(1, event.timeStamp - state.lastAt);
        state.velocity = dx / dt;
        state.lastX = event.clientX;
        state.lastAt = event.timeStamp;

        if (!state.moved && Math.abs(event.clientX - state.startX) > DRAG_SLOP) {
            state.moved = true;
            event.currentTarget.setPointerCapture?.(event.pointerId);
        }

        if (!state.moved) return;

        dragged.set(-(event.clientX - state.startX) / pitch.current);
    };

    const endDrag = (event) => {
        if (!dragging.current) return;
        const state = gesture.current;
        dragging.current = false;
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        // A press that never passed the slop is a click, not a flick: leave the
        // carousel exactly where it is and let the link do its job.
        if (!state.moved) return;

        // Project the flick forward, cap it, snap it — then hand the whole
        // offset over to the committed value in the same frame.
        const thrown = (-state.velocity * 1000 * INERTIA_SECONDS) / pitch.current;
        const landing = Math.round(
            settled.get() + dragged.get() + clamp(thrown, -INERTIA_MAX, INERTIA_MAX),
        );
        dragged.set(0);
        stepTo(landing);
    };

    const onPointerLeave = () => {
        steered.set(0);
    };

    // A drag that ends over a card must not also open that card.
    const onClickCapture = (event) => {
        if (!gesture.current.moved) return;
        event.preventDefault();
        event.stopPropagation();
        gesture.current.moved = false;
    };

    const onKeyDown = (event) => {
        if (count < 2) return;
        if (event.key === 'ArrowRight') stepTo(settled.get() + 1);
        else if (event.key === 'ArrowLeft') stepTo(settled.get() - 1);
        else return;
        event.preventDefault();
    };

    const card = (project, focus) => (rich
        ? <Card p={project} glow={glow} focus={focus} />
        : <MobileCard p={project} focus={focus} />);

    if (reduce) {
        return (
            <div className="work-carousel work-carousel--plain" role="group" aria-label="Featured projects">
                <ul className="work-carousel__track work-carousel__track--plain">
                    {projects.map((project) => (
                        <li key={project.slug} className="work-carousel__slide">
                            {card(project)}
                        </li>
                    ))}
                    <li className="work-carousel__slide">
                        <SeeAllWorkCard />
                    </li>
                </ul>
            </div>
        );
    }

    return (
        <div
            className="work-carousel"
            role="group"
            aria-roledescription="carousel"
            aria-label="Featured projects"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={onPointerLeave}
            onClickCapture={onClickCapture}
            onKeyDown={onKeyDown}
        >
            <ul className="work-carousel__track">
                {projects.map((project, index) => (
                    <CarouselSlide
                        key={project.slug}
                        index={index}
                        position={position}
                        stage={stage}
                        flat={!rich}
                        render={(focus) => (
                            <div
                                ref={index === 0 ? slideRef : undefined}
                                aria-current={index === active ? 'true' : undefined}
                            >
                                {card(project, focus)}
                            </div>
                        )}
                    />
                ))}
                <CarouselSlide
                    index={projects.length}
                    position={position}
                    stage={stage}
                    flat={!rich}
                    render={(focus) => (
                        <div aria-current={projects.length === active ? 'true' : undefined}>
                            <SeeAllWorkCard focus={focus} />
                        </div>
                    )}
                />
            </ul>
        </div>
    );
}

export default function OurWork({ glow, projects = [] }) {
    const stageRef = useRef(null);
    const desktopStage = useDesktopScrollStage();
    const lastSlide = projects.length;
    const { scrollYProgress: stageProgress } = useScroll({
        target: stageRef,
        offset: ['start 72px', 'end end'],
    });
    const controlledPosition = useTransform(stageProgress, [0, 1], [0, lastSlide], { clamp: true });

    return (
        <section id="work" className="relative overflow-x-clip bg-[var(--bg-soft)] section-pad">
            <div className="container-x relative">
                <SectionLabel index="03" name="OUR WORK" />
                {/* intro */}
                <div className="lg:py-6">
                    <RevealText as="h2" className="display-lg uppercase text-[var(--ink-strong)]" lines={['Work that', 'creates impact.']} />
                    <p className="mt-4 max-w-lg text-[15px] text-[var(--mute)]">
                        Selected work across branding, digital products, UI/UX, campaigns, and growth-focused experiences.
                    </p>
                </div>
            </div>

            {projects.length > 0 && (
                <div
                    ref={stageRef}
                    className="work-scroll-stage mt-10 md:mt-12"
                    data-pinned={desktopStage ? 'true' : undefined}
                    style={{ '--work-stage-height': `calc(100svh + ${lastSlide * 52}svh)` }}
                >
                    <div className="work-scroll-stage__sticky">
                        <div className="work-marquee w-full">
                            <WorkCarousel
                                projects={projects}
                                glow={glow}
                                controlledPosition={desktopStage ? controlledPosition : undefined}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="container-x relative">
                <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-14">
                    <div className="flex flex-col justify-center">
                        <p className="font-display text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">Progression</p>
                        <p className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-[var(--ink-strong)] md:text-4xl">
                            Idea <span className="text-[#891FFB]">→</span> Experience <span className="text-[#507AF4]">→</span> Result <span className="text-[#1BE2EB]">→</span>
                        </p>
                        <div className="mt-6 h-[3px] w-full" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }} aria-hidden />
                        <p className="mt-6 max-w-md text-[14px] text-[var(--mute)]">Every engagement moves through the same operating system — sharp idea, crafted experience, measured result.</p>
                    </div>
                    <div className="flex flex-col justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 md:p-12">
                        <p className="font-display text-4xl font-extrabold uppercase leading-none text-[var(--ink-strong)]">Your brand<br /><span className="text-gradient">could be next.</span></p>
                        <Link href="/#contact" data-cursor="cta" className="btn-press mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                            Start a project ↗
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Link href="/work" className="btn-press link-underline text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
                        View all work →
                    </Link>
                </div>
            </div>
        </section>
    );
}
