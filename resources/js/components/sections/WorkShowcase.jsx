import { Link } from '@inertiajs/react';
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Tag } from '../ui/primitives';

const EASE = [0.22, 1, 0.36, 1];
const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';
const RICH_QUERY = '(min-width: 1024px)';

/**
 * The band, as a fraction of the viewport, that decides which project the
 * fixed panel is describing: an item counts as the one being read while its
 * box crosses the middle tenth of the screen.
 */
const FOCUS_BAND = '-45% 0px -45% 0px';

/**
 * A visual's journey through the viewport, sampled at four points of its own
 * pass: entering from below, arriving, holding, and leaving past the top.
 * Phones use the flat set — same drift and fade, no perspective or depth.
 *
 * @type {Record<'rich'|'light', { stops: number[], y: string[], scale: number[], opacity: number[], tilt: number[], z: number[] }>}
 */
const FLOW = {
    rich: {
        stops: [0, 0.3, 0.7, 1],
        y: ['13%', '0%', '0%', '-13%'],
        scale: [0.9, 1, 1, 0.94],
        opacity: [0.15, 1, 1, 0.2],
        tilt: [7.5, 0, 0, -5.5],
        z: [-190, 0, 0, -150],
    },
    light: {
        stops: [0, 0.3, 0.7, 1],
        y: ['7%', '0%', '0%', '-7%'],
        scale: [0.95, 1, 1, 0.97],
        opacity: [0.3, 1, 1, 0.35],
        tilt: [0, 0, 0, 0],
        z: [0, 0, 0, 0],
    },
};

/**
 * One project passing through the viewport.
 *
 * The whole appearance is derived from the item's own scroll progress, so the
 * pass reverses exactly when the reader scrolls back up — there are no
 * one-shot triggers to get stuck in the played state. The cursor adds a tilt
 * on top of that, never instead of it.
 *
 * The item carries its own `perspective()` rather than inheriting a stage: the
 * page clips horizontally, and a clipping ancestor forces `transform-style`
 * back to flat, which would throw the depth away.
 *
 * @param {{
 *   project: import('../../lib/projects').Project,
 *   index: number,
 *   rich: boolean,
 *   reduce: boolean,
 *   onFocus: (index: number) => void,
 * }} props
 */
function FlowItem({ project, index, rich, reduce, onFocus }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const frames = rich ? FLOW.rich : FLOW.light;

    const y = useTransform(scrollYProgress, frames.stops, frames.y);
    const scale = useTransform(scrollYProgress, frames.stops, frames.scale);
    const opacity = useTransform(scrollYProgress, frames.stops, frames.opacity);
    const flowTilt = useTransform(scrollYProgress, frames.stops, frames.tilt);
    const z = useTransform(scrollYProgress, frames.stops, frames.z);

    // Cursor tilt, sprung so it trails the pointer instead of tracking it rigidly.
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const turnY = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.4 });
    const turnX = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.4 });
    const rotateX = useTransform([flowTilt, turnX], ([flow, hover]) => flow + hover);

    // Report the item that currently sits in the reading band, so the fixed
    // panel can follow along without every item re-rendering on scroll.
    useEffect(() => {
        const box = ref.current;
        if (!box || typeof IntersectionObserver === 'undefined') return undefined;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) onFocus(index);
        }, { rootMargin: FOCUS_BAND, threshold: 0 });
        observer.observe(box);

        return () => observer.disconnect();
    }, [index, onFocus]);

    const onPointerMove = (event) => {
        if (!rich || reduce || event.pointerType !== 'mouse') return;
        const box = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 13);
        pointerY.set(((event.clientY - box.top) / box.height - 0.5) * -9);
    };

    const onPointerLeave = () => {
        pointerX.set(0);
        pointerY.set(0);
    };

    const motionStyle = reduce
        ? undefined
        : {
            y,
            scale,
            opacity,
            rotateX,
            ...(rich ? { z, rotateY: turnY, transformPerspective: 1500 } : {}),
        };

    return (
        <motion.article
            ref={ref}
            style={motionStyle}
            className="work-flow__item"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
        >
            <Link
                href={`/work/${project.slug}`}
                data-cursor="view"
                aria-label={`View ${project.title} case study`}
                className="group block"
            >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--line)] bg-[#111116] min-[769px]:aspect-[16/10]">
                    <img
                        src={project.image}
                        alt={project.imageAlt}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 transition-opacity duration-500 group-hover:opacity-70"
                        style={{ background: `radial-gradient(120% 100% at 20% 10%, ${project.accent}2e, transparent 55%), linear-gradient(160deg, rgba(24,24,31,0.5), rgba(8,8,10,0.8))` }}
                        aria-hidden
                    />
                    {project.metric && (
                        <p className="absolute right-2 top-2 font-display text-[13px] font-extrabold text-white min-[769px]:right-6 min-[769px]:top-6 min-[769px]:text-4xl">
                            {project.metric}
                        </p>
                    )}
                    <span
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                        style={{ background: BRAND_GRADIENT }}
                        aria-hidden
                    />
                </div>

                {/* Below the large screens the fixed panel is not on screen, so each
                    visual carries its own caption exactly as it did before. */}
                <div className="min-w-0 pt-3 lg:hidden">
                    <p className="truncate text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)] min-[769px]:text-[11px] min-[769px]:tracking-[0.2em]">
                        {project.client} · {project.year}
                    </p>
                    <h2 className="mt-1 overflow-hidden font-display text-[13px] font-extrabold uppercase leading-[1.05] text-[var(--ink-strong)] min-[769px]:text-2xl min-[769px]:leading-normal">
                        {project.title}
                    </h2>
                    {project.tags.length > 0 && (
                        <div className="mt-2 flex min-w-0 items-center gap-1 min-[769px]:hidden">
                            <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--chip)] px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                                <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: project.accent }} aria-hidden />
                                <span className="truncate">{project.tags[0]}</span>
                            </span>
                            {project.tags.length > 1 && (
                                <span className="shrink-0 text-[7px] font-bold text-[var(--ink-faint)]">+{project.tags.length - 1}</span>
                            )}
                        </div>
                    )}
                    <div className="mt-3 hidden flex-wrap gap-2 min-[769px]:flex">
                        {project.tags.map((t) => <Tag key={t} accent={project.accent}>{t}</Tag>)}
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}

/**
 * The fixed half of the page: it stays put while the visuals travel past it,
 * and swaps its copy to whichever project is currently crossing the reading
 * band. Its title is a link to the same case study as the visual, so the
 * written half is never a dead end.
 *
 * @param {{ project: import('../../lib/projects').Project, count: number, index: number, reduce: boolean }} props
 */
function FixedPanel({ project, count, index, reduce }) {
    // The column is deliberately full height: a grid item sized to its content
    // gives `position: sticky` no room to travel, and the panel would scroll
    // away with the visuals instead of holding still.
    return (
        <div className="hidden h-full lg:block">
            <div className="sticky top-32">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                    <span style={{ color: project.accent }}>{String(index + 1).padStart(2, '0')}</span>
                    <span aria-hidden> / {String(count).padStart(2, '0')}</span>
                </p>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={project.slug}
                        initial={reduce ? false : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: -14 }}
                        transition={{ duration: reduce ? 0 : 0.38, ease: [...EASE] }}
                    >
                        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                            {project.client} · {project.year}
                        </p>
                        <h2 className="mt-3 font-display text-[clamp(2rem,3.2vw,3.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[var(--ink-strong)]">
                            <Link href={`/work/${project.slug}`} data-cursor="view" className="link-underline">
                                {project.title}
                            </Link>
                        </h2>
                        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--mute)]">
                            {project.description}
                        </p>
                        {project.tags.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {project.tags.map((t) => <Tag key={t} accent={project.accent}>{t}</Tag>)}
                            </div>
                        )}
                        {project.metric && (
                            <p className="mt-7">
                                <span className="font-display text-3xl font-extrabold" style={{ color: project.accent }}>{project.metric}</span>
                                <span className="ml-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{project.metricLabel}</span>
                            </p>
                        )}
                        <Link
                            href={`/work/${project.slug}`}
                            data-cursor="cta"
                            className="btn-press group/link mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--field-line)] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.17em] text-[var(--ink)] hover:border-transparent hover:text-white"
                            style={{ backgroundImage: `linear-gradient(var(--bg), var(--bg)), ${BRAND_GRADIENT}`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
                        >
                            View case study
                            <span data-arrow aria-hidden>↗</span>
                        </Link>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * Editorial portfolio showcase for the Our Work page, replacing the static
 * grid: the written half holds still while the visuals float up through the
 * screen, each one arriving from below with depth, settling as it is read, and
 * receding as it leaves.
 *
 * Every visual and every title remains a link to the project's existing case
 * study route — the animation is layered on top of the same navigation, never
 * in place of it.
 *
 * Large screens get the fixed panel, the 3D pass and the cursor tilt. Below
 * that the visuals keep their own captions and run the same pass flattened,
 * and reduced motion renders the list plainly with no transforms at all.
 *
 * @param {{ projects: Array<import('../../lib/projects').Project> }} props
 */
export default function WorkShowcase({ projects = [] }) {
    const reduce = useReducedMotion();
    const [rich, setRich] = useState(false);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const query = window.matchMedia(RICH_QUERY);
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    if (projects.length === 0) {
        return null;
    }

    const focused = projects[Math.min(active, projects.length - 1)];

    return (
        <div className="work-flow mt-8 min-[769px]:mt-12 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16 xl:gap-24">
            <FixedPanel project={focused} count={projects.length} index={active} reduce={reduce} />

            <div className="work-flow__track">
                {projects.map((project, index) => (
                    <FlowItem
                        key={project.slug}
                        project={project}
                        index={index}
                        rich={rich && !reduce}
                        reduce={reduce}
                        onFocus={setActive}
                    />
                ))}
            </div>
        </div>
    );
}
