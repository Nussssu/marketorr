import {
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion';
import { useCallback, useRef } from 'react';
import { useTapIntent } from '../../lib/tapIntent';
import MediaPlaceholder from '../media/MediaPlaceholder';
import { expandTo } from '../motion/ShowcaseTransition';

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/** Pads a position for display: 1 -> "01". */
const pad = (n) => String(n).padStart(2, '0');

/**
 * Hands a sub-service visual to the transition layer.
 *
 * Measures the visual at the moment of the click, so the flight starts from
 * exactly where the reader is looking — mid-scroll, mid-scene, wherever it
 * happens to be. Only this showcase calls `expandTo`, so the cinematic
 * flight is scoped to the Branding / UI-UX showcase and never fires globally.
 */
function useOpenSubService(category, item) {
    const visualRef = useRef(null);
    const tapIntent = useTapIntent();
    const href = `/services/${category.slug}/${item.slug}`;

    const open = useCallback((event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;

        tapIntent.onClick(event);
        if (event.defaultPrevented) return;

        const node = visualRef.current;
        if (!node) return;

        event.preventDefault();
        const rect = node.getBoundingClientRect();
        const radius = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
        expandTo(href, {
            src: item.image,
            alt: item.imageAlt ?? item.name,
            rect,
            radius,
            accent: item.accent,
        });
    }, [href, item.image, item.imageAlt, item.name, item.accent, tapIntent]);

    return { visualRef, tapIntent, href, open };
}

/**
 * One sub-service as a single cinematic scene.
 *
 * Picture and copy are driven by ONE progress value, so they arrive as one
 * move rather than as two effects that happen to overlap. That progress is
 * read over a long window — from the row touching the bottom of the viewport
 * until it sits 40% up the screen, roughly six tenths of a viewport of travel
 * — and then smoothed through a spring, which is what removes the sense of
 * the composition being dragged frame by frame with the wheel.
 *
 * Nothing snaps and nothing blinks: every layer moves on a soft curve from
 * far to near — a gentle fade, defocus resolving to sharp, a small scale
 * settling down, a short drift in from the side the layer belongs to, and a
 * soft clip opening the frame. All of it completes while the row is still
 * arriving, so by the time the reader is actually reading, the scene is
 * settled and completely still.
 *
 * Sides alternate down the page (odd rows text-left, even rows text-right)
 * and each layer drifts in from its own side, so the alternation is
 * something you feel in the motion rather than only see in the layout.
 */
function DesktopScene({ category, item, index, count, reduce }) {
    const rowRef = useRef(null);
    const { visualRef, tapIntent, href, open } = useOpenSubService(category, item);
    // Odd rows (01, 03, 05) read text-left / image-right; even rows mirror.
    const textFirst = index % 2 === 0;
    const side = textFirst ? 1 : -1;

    // Progress is read from the row, never from the sticky frame inside it:
    // a pinned element stops moving with the page, so measuring it would
    // freeze its own timeline halfway through.
    const { scrollYProgress } = useScroll({ target: rowRef, offset: ['start end', 'start 40%'] });
    const p = useSpring(scrollYProgress, { stiffness: 58, damping: 26, mass: 0.6 });

    // Picture: fade, focus, scale, drift and a soft frame opening. The clip
    // is deliberately shallow — enough to feel like a frame opening, never a
    // shutter snapping.
    const imageOpacity = useTransform(p, [0, 0.45], [0, 1]);
    const imageBlurPx = useTransform(p, [0, 0.78], [10, 0]);
    const imageFilter = useTransform(imageBlurPx, (v) => (v < 0.15 ? 'none' : `blur(${v.toFixed(2)}px)`));
    const imageScale = useTransform(p, [0, 1], [1.09, 1]);
    const imageY = useTransform(p, [0, 1], [64, 0]);
    const imageX = useTransform(p, [0, 1], [26 * side, 0]);
    const imageInset = useTransform(p, [0, 0.72], [16, 0]);
    const imageClip = useTransform(imageInset, (v) => `inset(${v.toFixed(2)}% round 28px)`);

    // Copy: the same journey, a beat behind and at a smaller amplitude, so
    // the two halves of the scene are clearly one thing. The three lines are
    // staggered against each other by shifting their windows, never by
    // timers, so the whole block still scrubs in both directions.
    const copyX = useTransform(p, [0, 1], [-22 * side, 0]);
    const copyBlurPx = useTransform(p, [0.1, 0.8], [5, 0]);
    const copyFilter = useTransform(copyBlurPx, (v) => (v < 0.12 ? 'none' : `blur(${v.toFixed(2)}px)`));
    const titleY = useTransform(p, [0, 0.92], [52, 0]);
    const titleOpacity = useTransform(p, [0.08, 0.52], [0, 1]);
    const descY = useTransform(p, [0.06, 1], [46, 0]);
    const descOpacity = useTransform(p, [0.16, 0.62], [0, 1]);
    const ctaY = useTransform(p, [0.12, 1], [40, 0]);
    const ctaOpacity = useTransform(p, [0.24, 0.72], [0, 1]);

    const gridSides = textFirst
        ? 'lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]'
        : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]';

    return (
        <article
            ref={rowRef}
            className={`grid grid-cols-1 items-center gap-10 xl:gap-14 ${gridSides}`}
            aria-label={`${item.name} — ${pad(index + 1)} of ${pad(count)}`}
        >
            {/* Copy */}
            <motion.div
                style={reduce ? undefined : { x: copyX, filter: copyFilter }}
                className={`order-2 ${textFirst ? 'lg:order-1' : 'lg:order-2'}`}
            >
                <motion.h3
                    style={reduce ? undefined : { y: titleY, opacity: titleOpacity }}
                    className="font-display text-[clamp(2.2rem,3.4vw,3.9rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] text-[var(--ink-strong)]"
                >
                    {item.name}
                </motion.h3>
                <motion.p
                    style={reduce ? undefined : { y: descY, opacity: descOpacity }}
                    className="mt-5 text-[15px] leading-relaxed text-[var(--mute)]"
                >
                    {item.short}
                </motion.p>
                <motion.a
                    style={reduce ? undefined : { y: ctaY, opacity: ctaOpacity }}
                    href={href}
                    data-cursor="cta"
                    onPointerDown={tapIntent.onPointerDown}
                    onPointerMove={tapIntent.onPointerMove}
                    onPointerCancel={tapIntent.onPointerCancel}
                    onClick={open}
                    className="group/cta mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--line)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-[var(--field-line)]"
                >
                    View service
                    <span aria-hidden className="transition-transform duration-300 group-hover/cta:translate-x-1">→</span>
                </motion.a>
            </motion.div>

            {/* Visual: the same 16:10 frame, badges and gradient edge as
                before — only how it arrives has changed. */}
            <div className={`order-1 min-w-0 ${textFirst ? 'lg:order-2' : 'lg:order-1'}`}>
                <motion.a
                    href={href}
                    ref={visualRef}
                    data-cursor="view"
                    onPointerDown={tapIntent.onPointerDown}
                    onPointerMove={tapIntent.onPointerMove}
                    onPointerCancel={tapIntent.onPointerCancel}
                    onClick={open}
                    aria-label={`Open ${item.name}`}
                    style={reduce ? undefined : {
                        opacity: imageOpacity,
                        filter: imageFilter,
                        scale: imageScale,
                        y: imageY,
                        x: imageX,
                        clipPath: imageClip,
                    }}
                    className={`group sticky top-[100px] block aspect-[16/10] w-full overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#08080B] ${textFirst ? 'ml-auto' : 'mr-auto'}`}
                >
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.imageAlt ?? `${item.name} project visual`}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <MediaPlaceholder label={`${item.name} - image placeholder`} />
                    )}
                    <span
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, transparent 0%, transparent 48%, rgba(6,6,10,0.28) 74%, rgba(6,6,10,0.62) 100%)' }}
                    />
                    <span
                        aria-hidden
                        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: `radial-gradient(120% 90% at 50% 100%, ${item.accent}38, transparent 62%)` }}
                    />
                    <span className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/70" aria-hidden>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 backdrop-blur-sm">
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: item.accent }} />
                            {pad(index + 1)} — {category.name}
                        </span>
                        <span className="hidden rounded-full border border-white/20 bg-black/35 px-4 py-2 backdrop-blur-sm sm:inline-block">
                            {pad(count)} scenes
                        </span>
                    </span>
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 pb-6" aria-hidden>
                        <span className="max-w-sm text-[13px] font-medium leading-relaxed text-white/85">
                            {item.short}
                        </span>
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg text-black transition-transform duration-500 group-hover:rotate-45">
                            ↗
                        </span>
                    </span>
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: BRAND_GRADIENT }} />
                </motion.a>
            </div>
        </article>
    );
}

/**
 * The six rows as one editorial run down the page.
 *
 * There is no pinned stage and no single slot the scenes take turns in: each
 * sub-service occupies its own place in the flow and reveals there, which is
 * what makes the sequence read as an article rather than as a deck being
 * clicked through. Scroll position is the only input to the picture reveals,
 * so they scrub in both directions.
 */
function DesktopShowcase({ category }) {
    const reduce = useReducedMotion();
    const count = category.items.length;

    return (
        <div className="relative hidden lg:block">
            {/* Spatial backdrop: faint rhythm plus soft brand light. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
                    backgroundSize: '140px 100%',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(46% 34% at 10% 8%, rgba(137,31,251,0.10), transparent 70%), radial-gradient(40% 32% at 90% 92%, rgba(27,226,235,0.08), transparent 70%)',
                }}
            />

            <div className="relative z-10 px-6 py-24 md:px-8 xl:px-12 xl:py-32 2xl:px-16">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ink-faint)]">
                    {category.name} — the practice
                </p>

                <div className="mt-16 flex flex-col gap-28 xl:mt-20 xl:gap-36">
                    {category.items.map((item, index) => (
                        <DesktopScene
                            key={item.slug}
                            category={category}
                            item={item}
                            index={index}
                            count={count}
                            reduce={reduce}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * One row on a small screen: the same scene, stacked.
 *
 * The two columns become one and the card simply takes its place in the
 * flow — no pinning, no stacking, nothing overlapping. The motion is the
 * desktop scene at phone amplitude and driven the same way: one spring
 * smoothed progress feeding picture and copy together, so they still arrive
 * as a single move. Only the distances shrink; there is no sideways drift to
 * make in a single column, and the defocus is lighter because a phone is
 * holding a smaller, denser frame.
 */
function CompactScene({ category, item, index, count, reduce, innerRef }) {
    const ref = useRef(null);
    const { visualRef, tapIntent, href, open } = useOpenSubService(category, item);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 45%'] });
    const p = useSpring(scrollYProgress, { stiffness: 58, damping: 26, mass: 0.6 });

    const mediaOpacity = useTransform(p, [0, 0.45], [0, 1]);
    const mediaBlurPx = useTransform(p, [0, 0.78], [7, 0]);
    const mediaFilter = useTransform(mediaBlurPx, (v) => (v < 0.15 ? 'none' : `blur(${v.toFixed(2)}px)`));
    const mediaScale = useTransform(p, [0, 1], [1.07, 1]);
    const mediaY = useTransform(p, [0, 1], [42, 0]);
    const mediaInset = useTransform(p, [0, 0.72], [14, 0]);
    const mediaClip = useTransform(mediaInset, (v) => `inset(${v.toFixed(2)}% round 16px)`);

    const copyY = useTransform(p, [0.1, 1], [30, 0]);
    const copyOpacity = useTransform(p, [0.2, 0.68], [0, 1]);
    const ctaY = useTransform(p, [0.18, 1], [26, 0]);
    const ctaOpacity = useTransform(p, [0.3, 0.78], [0, 1]);

    return (
        <div ref={(node) => {
            ref.current = node;
            if (typeof innerRef === 'function') innerRef(node, index);
        }} className="relative">
            <article
                className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-3"
                aria-label={`${item.name} — ${pad(index + 1)} of ${pad(count)}`}
            >
                <motion.a
                    href={href}
                    ref={visualRef}
                    data-cursor="view"
                    onPointerDown={tapIntent.onPointerDown}
                    onPointerMove={tapIntent.onPointerMove}
                    onPointerCancel={tapIntent.onPointerCancel}
                    onClick={open}
                    aria-label={`Open ${item.name}`}
                    style={reduce ? undefined : {
                        opacity: mediaOpacity,
                        filter: mediaFilter,
                        scale: mediaScale,
                        y: mediaY,
                        clipPath: mediaClip,
                    }}
                    className="relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#08080B]"
                >
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.imageAlt ?? `${item.name} project visual`}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <MediaPlaceholder label={`${item.name} - image placeholder`} />
                    )}
                    <span
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, transparent 0%, transparent 42%, rgba(6,6,10,0.40) 70%, rgba(6,6,10,0.78) 100%)' }}
                    />
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: BRAND_GRADIENT }} />
                    <h3 className="absolute inset-x-5 bottom-5 font-display text-[clamp(1.6rem,7.4vw,2.6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-white">
                        {item.name}
                    </h3>
                </motion.a>

                <div className="px-3 pb-3 pt-5">
                    <motion.p
                        style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
                        className="mt-3 max-w-prose text-[14px] leading-relaxed text-[var(--mute)]"
                    >
                        {item.short}
                    </motion.p>
                    <motion.a
                        style={reduce ? undefined : { y: ctaY, opacity: ctaOpacity }}
                        href={href}
                        data-cursor="cta"
                        onPointerDown={tapIntent.onPointerDown}
                        onPointerMove={tapIntent.onPointerMove}
                        onPointerCancel={tapIntent.onPointerCancel}
                        onClick={open}
                        className="mt-5 inline-flex items-center gap-3 rounded-full border border-[var(--line)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]"
                    >
                        View service <span aria-hidden>→</span>
                    </motion.a>
                </div>
            </article>
        </div>
    );
}

function CompactShowcase({ category, always = false }) {
    const reduce = useReducedMotion();
    const cardRefs = useRef([]);
    const count = category.items.length;

    const collectRef = useCallback((node, index) => {
        cardRefs.current[index] = node;
    }, []);



    return (
        <div className={`${always ? '' : 'lg:hidden'}`}>
            <div className="container-x relative flex flex-col gap-10 py-16 sm:gap-14">
            {category.items.map((item, index) => (
                <CompactScene
                    key={item.slug}
                    category={category}
                    item={item}
                    index={index}
                    count={category.items.length}
                    reduce={reduce}
                    innerRef={collectRef}
                />
            ))}
            </div>
        </div>
    );
}

/**
 * The sub-services of one discipline as one editorial run down the page.
 *
 * Every row works the same way at every width: the picture is scrubbed open
 * by scroll — clip parting from the centre line, tilt unwinding, oversized
 * crop settling — while the copy beside it plays a short one-shot reveal as
 * the row comes into view. Two columns on desktop with a sticky picture, one
 * column below it. Clicking a row hands its visual to the transition layer,
 * which carries it into that sub-service's own page. This component mounts
 * only on the Branding and UI/UX category pages, so the sequence — and its
 * flight transition — never affects Home, About, Work or Contact.
 */
export default function SubServiceShowcase({ category }) {
    const reduce = useReducedMotion();

    if (!category?.items?.length) {
        return null;
    }

    return (
        <section className="relative bg-[var(--bg)]" aria-label={`${category.name} sub-services`}>
            {reduce ? (
                <CompactShowcase category={category} always />
            ) : (
                <>
                    <DesktopShowcase category={category} />
                    <CompactShowcase category={category} />
                </>
            )}
        </section>
    );
}
