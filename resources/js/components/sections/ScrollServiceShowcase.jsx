import { Link } from '@inertiajs/react';
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion';
import { useRef, useState } from 'react';
import { transitionTo } from '../motion/PageTransition';
import { useTapIntent } from '../../lib/tapIntent';

const BRAND_GRADIENT = 'linear-gradient(90deg, #891FFB, #507AF4, #1BE2EB)';
const EASE = [0.22, 1, 0.36, 1];

function serviceUrl(category, item) {
    return `/services/${category.slug}/${item.slug}`;
}

/**
 * Intentional primary click/tap plays the full-screen 3-color transition
 * first, then completes the route change. Modifier clicks and non-primary
 * buttons fall through to the browser; scrolls/drags are swallowed by the
 * tap-intent guard. Hover and scrolling never navigate.
 */
function ViewServiceLink({ href, label, className, style, children }) {
    const tapIntent = useTapIntent();

    const onClick = (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo(href);
    };

    return (
        <Link
            href={href}
            prefetch
            data-cursor="cta"
            aria-label={label}
            onPointerDown={tapIntent.onPointerDown}
            onPointerCancel={tapIntent.onPointerCancel}
            onClick={onClick}
            className={className}
            style={style}
        >
            {children}
        </Link>
    );
}

// Visibility is driven by ONE active index derived from scroll progress, so
// only a single text block (and visual) is ever mounted visible at a time.
// Per-layer multi-stop opacity transforms are deliberately avoided here:
// overlapping ranges made several items render on top of each other.

function DesktopVisual({ item }) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [...EASE] }}
            className="absolute inset-0 overflow-hidden bg-[#0B0B10]"
        >
            <img
                src={item.image}
                alt=""
                width="800"
                height="600"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:rotate-[0.4deg] group-hover:scale-[1.06]"
            />
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(180deg, transparent 45%, rgba(8,8,10,.58)), radial-gradient(80% 70% at 75% 20%, ${item.accent}32, transparent 72%)`,
                }}
            />
            <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: BRAND_GRADIENT }} />
        </motion.div>
    );
}

function DesktopCopy({ category, item, index, count }) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 42 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -38 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [...EASE] }}
            className="absolute inset-0 flex flex-col justify-center"
        >
            <div>
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: item.accent }}>
                    {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </p>
                <h3 className="mt-4 max-w-xl font-display text-[clamp(2.35rem,4.2vw,5rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.04em] text-[var(--ink-strong)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1.5">
                    {item.name}
                </h3>
            </div>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--mute)] xl:text-base">
                {item.short}
            </p>
            <div>
                <ViewServiceLink
                    href={serviceUrl(category, item)}
                    label={`Open ${item.name}`}
                    className="btn-press group/link mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--field-line)] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.17em] text-[var(--ink)] hover:border-transparent hover:text-white"
                    style={{ backgroundImage: `linear-gradient(var(--bg), var(--bg)), ${BRAND_GRADIENT}`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
                >
                    View Service
                <span data-arrow aria-hidden className="inline-block transition-transform duration-300 ease-out group-hover/link:-translate-y-1 group-hover/link:translate-x-1">↗</span>
                </ViewServiceLink>
            </div>
        </motion.div>
    );
}

/**
 * One large image panel in the scroll-driven stack. `rel` is 0 when the panel
 * is active, +1 while it waits below, -1 once it has exited upward. Each
 * panel slides through 3D space on scroll: the outgoing panel tilts/skews up
 * and out while the incoming panel enters from below with perspective,
 * rotation and scale — like large physical panels moving past the viewer.
 * Only transform/opacity move; only the near-active panel takes pointer input.
 *
 * @param {{ item: object, index: number, activeFloat: import('framer-motion').MotionValue<number>, href: string, dimensional: boolean }} props
 */
function ShowcasePanel({ item, index, activeFloat, href, dimensional }) {
    const rel = useTransform(activeFloat, [index - 1, index, index + 1], [1, 0, -1]);
    const y = useTransform(rel, [-1.15, 1.15], ['-115%', '115%']);
    const rotateX = useTransform(rel, [-1, 0, 1], dimensional ? [14, 0, -14] : [0, 0, 0]);
    const skewY = useTransform(rel, [-1, 0, 1], dimensional ? [-5, 0, 5] : [0, 0, 0]);
    const scale = useTransform(rel, [-1, 0, 1], dimensional ? [0.94, 1, 0.9] : [0.94, 1, 0.96]);
    const opacity = useTransform(rel, [-0.85, 0, 0.85], [0, 1, 0]);
    const zIndex = useTransform(rel, [-1, 0, 1], [1, 10, 1]);
    const pointerEvents = useTransform(rel, (v) => (Math.abs(v) < 0.5 ? 'auto' : 'none'));

    return (
        <motion.div
            style={{ y, rotateX, skewY, scale, opacity, zIndex, pointerEvents }}
            className="absolute inset-0 overflow-hidden bg-[#0B0B10]"
        >
            <ViewServiceLink href={href} label={`Open ${item.name}`} className="block h-full w-full">
                <img
                    src={item.image}
                    alt=""
                    width="800"
                    height="600"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: `linear-gradient(180deg, transparent 45%, rgba(8,8,10,.58)), radial-gradient(80% 70% at 75% 20%, ${item.accent}32, transparent 72%)`,
                    }}
                    aria-hidden
                />
                <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: BRAND_GRADIENT }} aria-hidden />
            </ViewServiceLink>
        </motion.div>
    );
}

function DesktopScene({ category }) {
    const scene = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: scene,
        offset: ['start start', 'end end'],
    });
    const count = category.items.length;
    // Rests exactly on the last panel at the end of the journey so it never
    // fades out; copy mounting follows the same slot.
    const activeFloat = useTransform(scrollYProgress, [0, 1], [0, count - 1]);
    const [active, setActive] = useState(0);

    useMotionValueEvent(activeFloat, 'change', (value) => {
        const next = Math.min(count - 1, Math.max(0, Math.floor(value + 0.5)));
        setActive((previous) => (previous === next ? previous : next));
    });

    const item = category.items[active];

    // Reduced motion keeps the simple crossfading pair, fully static.
    if (reduce) {
        return (
            <div className="relative hidden lg:block">
                <div className="container-x grid grid-cols-[minmax(300px,.78fr)_minmax(0,1.22fr)] items-center gap-12 py-24 xl:gap-20">
                    <div className="relative h-[430px] overflow-hidden xl:h-[470px]">
                        <AnimatePresence initial={false}>
                            <DesktopCopy
                                key={item.slug}
                                category={category}
                                item={item}
                                index={active}
                                count={count}
                            />
                        </AnimatePresence>
                    </div>
                    <div className="relative h-[68vh] min-h-[520px] overflow-hidden rounded-3xl border border-white/10">
                        <AnimatePresence initial={false}>
                            <DesktopVisual key={item.slug} item={item} />
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={scene}
            className="relative hidden lg:block"
            style={{ height: `${Math.max(count * 82, 420)}vh` }}
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <div className="container-x group grid h-full grid-cols-[minmax(300px,.78fr)_minmax(0,1.22fr)] items-center gap-12 pt-20 xl:gap-20">
                    <div className="relative h-[430px] overflow-hidden xl:h-[470px]">
                        <AnimatePresence initial={false}>
                            <DesktopCopy
                                key={item.slug}
                                category={category}
                                item={item}
                                index={active}
                                count={count}
                            />
                        </AnimatePresence>
                    </div>

                    <div className="relative h-[68vh] min-h-[520px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_100px_-45px_rgba(80,122,244,.65)] [perspective:1400px]">
                        {category.items.map((entry, i) => (
                            <ShowcasePanel
                                key={entry.slug}
                                item={entry}
                                index={i}
                                activeFloat={activeFloat}
                                href={serviceUrl(category, entry)}
                                dimensional
                            />
                        ))}
                    </div>

                    <div className="absolute bottom-8 left-1/2 h-px w-[min(680px,46vw)] -translate-x-1/2 overflow-hidden bg-[var(--line)]">
                        <motion.div className="h-full origin-left" style={{ scaleX: scrollYProgress, background: BRAND_GRADIENT }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MobilePinnedCopy({ category, item, index, count }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.4, ease: [...EASE] }}
            className="absolute inset-x-0 bottom-0 pb-10"
        >
            <div className="container-x">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                    <span style={{ color: item.accent }}>{String(index + 1).padStart(2, '0')}</span>
                    <span aria-hidden> / {String(count).padStart(2, '0')}</span>
                </p>
                <h3 className="mt-3 max-w-xl font-display text-[clamp(2rem,9vw,3.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-white">
                    {item.name}
                </h3>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/70">{item.short}</p>
                <ViewServiceLink
                    href={serviceUrl(category, item)}
                    label={`Open ${item.name}`}
                    className="btn-press group/link mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.17em] text-white transition-colors duration-300 active:border-transparent active:bg-[#507AF4]"
                >
                    View Service
                    <span aria-hidden className="inline-block transition-transform duration-300 ease-out group-active/link:-translate-y-0.5 group-active/link:translate-x-0.5">↗</span>
                </ViewServiceLink>
            </div>
        </motion.div>
    );
}

/**
 * Pinned mobile journey: the same image-to-image panel transition as desktop
 * but flattened — slide, scale and fade only, no rotateX/skew/tilt — with the
 * copy synchronized to the active panel at the bottom of the stage.
 */
function MobilePinnedScene({ category }) {
    const stage = useRef(null);
    const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
    const count = category.items.length;
    const activeFloat = useTransform(scrollYProgress, [0, 1], [0, count - 1]);
    const [active, setActive] = useState(0);

    useMotionValueEvent(activeFloat, 'change', (value) => {
        const next = Math.min(count - 1, Math.max(0, Math.floor(value + 0.5)));
        setActive((previous) => (previous === next ? previous : next));
    });

    const item = category.items[active];

    return (
        <div ref={stage} className="relative lg:hidden" style={{ height: `${count * 105}vh` }}>
            <div className="sticky top-0 h-svh overflow-hidden bg-[#06060a]">
                {category.items.map((entry, i) => (
                    <ShowcasePanel
                        key={entry.slug}
                        item={entry}
                        index={i}
                        activeFloat={activeFloat}
                        href={serviceUrl(category, entry)}
                        dimensional={false}
                    />
                ))}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(5,5,10,0.35) 0%, transparent 28%, rgba(5,5,10,0.55) 52%, rgba(5,5,10,0.94) 82%)' }}
                    aria-hidden
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60" aria-hidden>
                    <span>{category.name}</span>
                    <span>{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
                </div>
                <AnimatePresence initial={false}>
                    <MobilePinnedCopy key={item.slug} category={category} item={item} index={active} count={count} />
                </AnimatePresence>
            </div>
        </div>
    );
}

function MobileScene({ category, forceDesktop = false }) {
    const reduce = useReducedMotion();

    return (
        <div className={`container-x flex flex-col gap-16 pb-24 ${forceDesktop ? '' : 'lg:hidden'}`}>
            {category.items.map((item, index) => (
                <article key={item.slug} className="group grid gap-6">
                    <motion.div
                        initial={{ clipPath: 'inset(14% 8% 14% 8% round 999px)', opacity: 0.45 }}
                        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 20px)', opacity: 1 }}
                        viewport={{ once: false, amount: 0.32 }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        className="relative aspect-[4/3] overflow-hidden bg-[#0B0B10]"
                    >
                        <motion.img
                            src={item.image}
                            alt={`${item.name} featured visual`}
                            width="800"
                            height="600"
                            initial={{ scale: 1.1 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full w-full object-cover"
                        />
                        <div
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-active:opacity-100"
                            style={{ background: `radial-gradient(80% 70% at 50% 100%, ${item.accent}40, transparent 70%)` }}
                            aria-hidden
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: BRAND_GRADIENT }} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: item.accent }}>
                            {String(index + 1).padStart(2, '0')} / {String(category.items.length).padStart(2, '0')}
                        </p>
                        <h3 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[.98] tracking-tight text-[var(--ink-strong)] transition-transform duration-300 ease-out group-active:-translate-y-1 sm:text-4xl">
                            {item.name}
                        </h3>
                        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--mute)]">{item.short}</p>
                        <ViewServiceLink href={serviceUrl(category, item)} label={`Open ${item.name}`} className="link-underline group/link mt-5 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
                            View Service <span aria-hidden className="inline-block transition-transform duration-300 ease-out group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-active/link:-translate-y-0.5 group-active/link:translate-x-0.5">↗</span>
                        </ViewServiceLink>
                    </motion.div>
                </article>
            ))}
        </div>
    );
}

export default function ScrollServiceShowcase({ category, showHeading = true }) {
    const reduceMotion = useReducedMotion();

    if (!category?.items?.length) {
        return null;
    }

    return (
        <section className="relative bg-[var(--bg)]">
            {showHeading && (
                <div className="container-x border-t border-[var(--line)] pb-12 pt-20 lg:pb-0 lg:pt-28">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: category.accent }}>
                                {category.slug === 'branding' ? '01' : '02'} / Discipline
                            </p>
                            <h2 className="display-lg mt-5 uppercase text-[var(--ink-strong)]">{category.name}<span className="text-gradient">.</span></h2>
                        </div>
                        <p className="max-w-md text-[15px] leading-relaxed text-[var(--mute)]">{category.tagline}</p>
                    </div>
                </div>
            )}

            {reduceMotion ? <MobileScene category={category} forceDesktop /> : (
                <>
                    <DesktopScene category={category} />
                    <MobilePinnedScene category={category} />
                </>
            )}
        </section>
    );
}
