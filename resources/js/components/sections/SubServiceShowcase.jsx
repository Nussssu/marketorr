import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion';
import { useCallback, useRef } from 'react';
import { EASE } from '../../lib/motion';
import { useTapIntent } from '../../lib/tapIntent';
import RisingTypeLoop from '../motion/RisingTypeLoop';
import { expandTo } from '../motion/ShowcaseTransition';

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/**
 * Share of a scene's scroll window where the composition sits settled.
 *
 * Every timeline curve below plateaus across `rel` [-HOLD, HOLD]: a scene
 * arrives, holds readable through the middle of its window, and only travels
 * at the edges. Without the plateau the reader chases the composition.
 */
const HOLD = 0.34;

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
 * One sub-service as a single locked composition.
 *
 * The photograph, title, description and call to action are one timeline:
 * every layer derives from the same `rel` (this scene's distance from the
 * active one), so text and visual travel through 3D space together and the
 * transition reads as one scene becoming the next — never as one card fading
 * out while another fades in.
 *
 * Depth comes from two things at once: the whole composition moves in
 * perspective (y / scale / rotate / z), and inside it the photo drifts
 * against the title in opposite directions, so the crop and the type breathe
 * at different rates while staying locked to the same scroll input.
 * Everything is a pure function of scroll: scrolling back runs it backwards.
 * Type stays a single sharp primary layer throughout — no ghost numerals, no
 * blur, no heavy shadows. The one exception lives inside the photograph: a
 * continuously rising column of this scene's own name drifts bottom-to-top on
 * its own CSS clock, clipped hard by the visual frame. It is time-driven
 * only — nothing here reads the pointer — so it never shakes, follows or
 * reacts to the cursor, and the scrims above it keep the sharp title primary.
 */
function DesktopScene({ category, item, index, count, activeFloat, dimensional }) {
    const { visualRef, tapIntent, href, open } = useOpenSubService(category, item);
    const side = index % 2 === 0 ? 1 : -1;
    const loopWords = (item.name ?? '').toUpperCase().split(' ').filter(Boolean);

    const rel = useTransform(activeFloat, (v) => v - index);

    // The WHOLE composition travels as one: rises out of depth, settles,
    // then carries on past the reader. Crisp at every point — depth comes
    // from perspective, scale and rotation, never from defocus. Travel is
    // deliberately wide so the handoff between scenes reads as spatial motion
    // rather than two compositions dissolving on top of each other.
    const sceneY = useTransform(rel, [-1.15, -HOLD, HOLD, 1.15], ['26%', '0%', '0%', '-22%']);
    const sceneScale = useTransform(rel, [-1.15, -HOLD, HOLD, 1.15], [0.8, 1, 1, 1.12]);
    const sceneZ = useTransform(rel, [-1.15, -HOLD, HOLD, 1.15], dimensional ? [-700, 0, 0, 340] : [0, 0, 0, 0]);
    const sceneRotateX = useTransform(rel, [-1.15, -HOLD, HOLD, 1.15], dimensional ? [12, 0, 0, -9] : [0, 0, 0, 0]);
    const sceneRotateY = useTransform(rel, [-1.15, -HOLD, HOLD, 1.15], dimensional ? [12 * side, 0, 0, -10 * side] : [0, 0, 0, 0]);

    // The visual plane may cross-dissolve in depth — that overlap IS the 3D
    // handoff. It stays dim mid-travel so it never reads as a second card.
    const opacity = useTransform(rel, [-1, -0.55, -HOLD, HOLD, 0.55, 1], [0, 0.35, 1, 1, 0.35, 0]);
    const zIndex = useTransform(rel, (v) => 30 - Math.min(29, Math.round(Math.abs(v) * 12)));
    const pointerEvents = useTransform(rel, (v) => (Math.abs(v) < 0.4 ? 'auto' : 'none'));

    // The text plane follows a STRICTER curve than the visual: it is fully
    // gone before the neighbour's text appears, so two titles, descriptions
    // or CTAs are never legible on top of each other — no overlapping,
    // ghosting or leftover text mid-transition. The CTA rides inside this
    // plane, so it shares the exact same visibility window.
    const textOpacity = useTransform(rel, [-0.46, -0.32, 0.32, 0.46], [0, 1, 1, 0]);
    const textVisibility = useTransform(textOpacity, (v) => (v <= 0.001 ? 'hidden' : 'visible'));

    // Inner parallax: small pixel drifts in opposite directions, so the
    // layers separate in space while the composition stays locked.
    const photoY = useTransform(rel, [-1.15, 0, 1.15], dimensional ? [-34, 0, 30] : [0, 0, 0]);
    const titleY = useTransform(rel, [-1.15, 0, 1.15], dimensional ? [46, 0, -40] : [0, 0, 0]);

    // The photograph keeps reframing itself as the scene passes.
    const imageY = useTransform(rel, [-1.15, 0, 1.15], ['-8%', '0%', '8%']);
    const imageScale = useTransform(rel, [-1.15, 0, 1.15], [1.2, 1.05, 1.2]);

    return (
        <motion.article
            style={{ opacity, zIndex, pointerEvents }}
            className="absolute inset-0"
            aria-label={`${item.name} — ${pad(index + 1)} of ${pad(count)}`}
        >
            <motion.div
                style={
                    dimensional
                        ? {
                            y: sceneY,
                            scale: sceneScale,
                            z: sceneZ,
                            rotateX: sceneRotateX,
                            rotateY: sceneRotateY,
                            transformPerspective: 1800,
                        }
                        : { y: sceneY, scale: sceneScale }
                }
                className="h-full [transform-style:preserve-3d]"
            >
                {/* The split the Work pages use: copy in the left content
                    area, the visual holding the right half and ending on the
                    gutter. Measured against /work at 1440 - card 51vw at 16:10,
                    flush right - so the two sections read at the same scale.
                    The copy is then brought in off the gutter by a share of the
                    viewport, which spends the dead space between the two
                    columns instead of leaving the title against the edge. The
                    card does not move: only the margin ahead of the text does,
                    and it collapses to nothing on narrow screens. */}
                <div className="flex h-full w-full items-center justify-between gap-5 px-6 md:px-8 xl:gap-6 xl:px-12 2xl:px-16">
                    {/* Text plane. Its opacity + visibility window is tighter
                        than the visual's, so this copy is fully removed before
                        the next scene's copy appears. */}
                    <motion.div
                        style={dimensional
                            ? { y: titleY, opacity: textOpacity, visibility: textVisibility }
                            : { opacity: textOpacity, visibility: textVisibility }}
                        className="relative z-20 ml-[clamp(0px,4vw,64px)] w-[min(27vw,470px)] shrink-0"
                    >
                        <h3 className="font-display text-[clamp(2.2rem,3.4vw,3.9rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] text-[var(--ink-strong)]">
                            {item.name}
                        </h3>
                        <p className="mt-5 text-[15px] leading-relaxed text-[var(--mute)]">{item.short}</p>
                        <a
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
                        </a>
                    </motion.div>

                    {/* Visual plane, matched to the Work card: same 16:10
                        frame, same flat border, same gutter on its right.
                        It takes whatever width the row has left rather than a
                        fixed size, so it grows with the page instead of
                        stopping at a pixel cap and leaving a dead strip beside
                        it on a wide monitor. The cap is only a ceiling: 53vw,
                        or the width that would make it taller than the pinned
                        stage allows, whichever is smaller. Width drives height
                        through the ratio, so the ratio never breaks. */}
                    <motion.div style={dimensional ? { y: photoY } : undefined} className="relative z-10 min-w-0 flex-1">
                        <motion.a
                            href={href}
                            ref={visualRef}
                            data-cursor="view"
                            onPointerDown={tapIntent.onPointerDown}
                            onPointerMove={tapIntent.onPointerMove}
                            onPointerCancel={tapIntent.onPointerCancel}
                            onClick={open}
                            aria-label={`Open ${item.name}`}
                            className="group relative ml-auto block aspect-[16/10] h-auto w-full max-w-[min(72vw,calc(68vh*1.6))] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#08080B]"
                        >
                            <motion.img
                                src={item.image}
                                alt={item.imageAlt ?? `${item.name} project visual`}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                draggable={false}
                                style={{ y: imageY, scale: imageScale }}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <RisingTypeLoop words={loopWords} className="rising-type--in-visual" />
                            <span
                                aria-hidden
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(180deg, rgba(6,6,10,0.10) 0%, rgba(6,6,10,0.34) 62%, rgba(6,6,10,0.66) 100%)' }}
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
                    </motion.div>
                </div>
            </motion.div>
        </motion.article>
    );
}

/**
 * The pinned stage. The viewport holds still while scroll walks the scenes
 * through it — one continuous journey from the first sub-service to the last.
 * Scroll position is the only input, so the sequence is fully scrubbable in
 * both directions: the page never jumps, reloads, or resets while inside.
 */
function DesktopShowcase({ category }) {
    const stage = useRef(null);
    const reduce = useReducedMotion();
    const count = category.items.length;
    const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
    const activeFloat = useTransform(scrollYProgress, [0, 1], [0, count - 1]);


    // Direct navigation scrolls to the scroll position that centres the
    // requested scene — the scenes themselves only ever read scroll position,
    // so buttons, dots and the wheel all drive the identical transition.

    return (
        <div ref={stage} className="relative hidden lg:block" style={{ height: `${Math.max(count * 130, 560)}vh` }}>
            <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
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

                {/* The section's own label. Deliberately the only thing above
                    the stage: nothing here reacts to scroll, so there is no
                    counter, rail, dot or arrow to read against the scenes. */}
                <div className="relative z-10 mb-6 w-full px-6 md:px-8 xl:px-12 2xl:px-16">
                    <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ink-faint)]">
                        {category.name} — the practice
                    </p>
                </div>

                <div className="relative z-10 h-[78vh] min-h-[540px] [perspective:1800px] [transform-style:preserve-3d]">
                    {category.items.map((item, index) => (
                        <DesktopScene
                            key={item.slug}
                            category={category}
                            item={item}
                            index={index}
                            count={count}
                            activeFloat={activeFloat}
                            dimensional={!reduce}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * One scene on a small screen: the same story as a sticky stacking journal.
 *
 * Cards pin in turn and the next slides over the last while the covered one
 * settles back — the sequence stays continuous without asking a phone to
 * hold the full 3D stage. Nothing is captured and there are no timers: each
 * card's resting transform is a pure function of its own scroll progress.
 */
function CompactScene({ category, item, index, count, reduce, innerRef }) {
    const ref = useRef(null);
    const { visualRef, tapIntent, href, open } = useOpenSubService(category, item);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
    const loopWords = (item.name ?? '').toUpperCase().split(' ').filter(Boolean);
    // Settle transform only — entrance opacity lives on the inner article so
    // the two never write to the same motion value.
    const settle = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.94, 1]);
    const imageY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-7%', '7%']);

    return (
        <div ref={(node) => {
            ref.current = node;
            if (typeof innerRef === 'function') innerRef(node, index);
        }} className="sticky" style={{ top: `calc(9vh + ${index * 14}px)` }}>
            <motion.div
                style={reduce ? undefined : { scale: settle }}
                className="relative origin-bottom"
            >
            <motion.article
                initial={reduce ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduce ? 0 : 0.65, ease: [...EASE] }}
                className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-3"
                aria-label={`${item.name} — ${pad(index + 1)} of ${pad(count)}`}
            >
                <a
                    href={href}
                    ref={visualRef}
                    data-cursor="view"
                    onPointerDown={tapIntent.onPointerDown}
                    onPointerMove={tapIntent.onPointerMove}
                    onPointerCancel={tapIntent.onPointerCancel}
                    onClick={open}
                    aria-label={`Open ${item.name}`}
                    className="relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#08080B]"
                >
                    <motion.img
                        src={item.image}
                        alt={item.imageAlt ?? `${item.name} project visual`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        style={reduce ? undefined : { y: imageY, scale: 1.1 }}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <RisingTypeLoop words={loopWords} className="rising-type--in-visual" />
                    <span
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(6,6,10,0.08) 0%, rgba(6,6,10,0.42) 55%, rgba(6,6,10,0.84) 100%)' }}
                    />
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: BRAND_GRADIENT }} />
                    <h3 className="absolute inset-x-5 bottom-5 font-display text-[clamp(1.6rem,7.4vw,2.6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-white">
                        {item.name}
                    </h3>
                </a>

                <div className="px-3 pb-3 pt-5">
                    <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-[var(--mute)]">{item.short}</p>
                    <a
                        href={href}
                        data-cursor="cta"
                        onPointerDown={tapIntent.onPointerDown}
                        onPointerMove={tapIntent.onPointerMove}
                        onPointerCancel={tapIntent.onPointerCancel}
                        onClick={open}
                        className="mt-5 inline-flex items-center gap-3 rounded-full border border-[var(--line)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]"
                    >
                        View service <span aria-hidden>→</span>
                    </a>
                </div>
            </motion.article>
            </motion.div>
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
            {/* Breathing room so the last sticky card can release. */}
            <div className="h-[12vh]" aria-hidden />
            </div>
        </div>
    );
}

/**
 * The sub-services of one discipline as one continuous cinematic journey.
 *
 * Desktop pins a perspective stage and walks each locked text+visual
 * composition through it in depth; small screens get the same story as a
 * sticky stacking journal with the 3D simplified to settle/scale. Clicking a
 * scene hands its visual to the transition layer, which carries it into that
 * sub-service's own page. This component mounts only on the Branding and
 * UI/UX category pages, so the journey — and its flight transition — never
 * affects Home, About, Work or Contact.
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
