import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import MediaPlaceholder from '../media/MediaPlaceholder';
import { useEffect, useRef, useState } from 'react';
import { GradientTitle } from '../ui/primitives';

/** Tight gap between screens — the strip stays continuous with no air in it. */
const GAP = 8;

/** Seconds for one screen to travel its own height — slow premium reel. */
const SECONDS_PER_SCREEN = 4.5;
const FRAME_INTERVAL = 1000 / 30;

/**
 * One compact version of the real dedicated-page sub-service card. Its image,
 * name and short copy come from the same catalogue item rendered by the
 * category page, so this rail cannot carry placeholder or stale content.
 *
 * `--svc-accent` carries the sub-service's brand colour into the frame's
 * highlight hairline and caption dot. The image crop and content stack echo
 * the dedicated cards at a scale that stays readable inside the narrow rail.
 */
function ShowcaseScreen({ item, solidTitle = false }) {
    return (
        <figure className="m-0" data-screen>
            <div
                className="svc-screen relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]"
                style={{ '--svc-accent': item.accent }}
            >
                <div className="absolute inset-x-0 top-0 h-[48%] overflow-hidden bg-[#08080B]">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <MediaPlaceholder label={`${item.name} - image placeholder`} />
                    )}
                    <span
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, transparent 46%, rgba(6,6,10,0.62) 100%)' }}
                        aria-hidden
                    />
                </div>

                <figcaption className="absolute inset-x-0 bottom-0 top-[48%] flex flex-col px-2 py-2 sm:px-2.5 sm:py-2.5">
                    <span className="mb-1.5 flex items-center gap-1.5" aria-hidden>
                        <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: item.accent }} />
                        <span className="text-[6px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] sm:text-[7px]">Service</span>
                    </span>
                    <h3 className="overflow-hidden font-display text-[clamp(7px,0.7vw,10px)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-[var(--ink-strong)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                        {solidTitle ? item.name : <GradientTitle text={item.name} />}
                    </h3>
                    <p className="mt-1.5 overflow-hidden text-[clamp(6px,0.56vw,8px)] leading-[1.3] text-[var(--mute)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                        {item.short}
                    </p>
                </figcaption>
                <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: item.accent }} aria-hidden />
            </div>
        </figure>
    );
}

/**
 * The moving showcase that occupies the right side of a Branding or UI/UX
 * gateway card.
 *
 * One continuous strip of screens rising inside a tight clipped frame — a
 * slow infinite reel where new visuals keep entering from the bottom and
 * drifting upward. A single rAF clock advances the strip and reports the
 * screen at the frame's top edge through `onActive`, which is the same tick
 * that moves the sub-service ticker below the title — image and name always
 * change together, with no drift possible. Parking off-screen or hiding
 * the tab freezes both at once and resumes seamlessly — hover never
 * pauses the reel; it only drives the card's CSS hover effects.
 *
 * No second plane, no blur, no pointer tilt, no edge fade masks and no
 * glow: the frame is always full, edges cut hard by `overflow-hidden`, and
 * only one transform is written per frame. The doubled strip keeps the
 * frame full at every offset.
 *
 * The whole rail is decorative: `pointer-events-none` and `aria-hidden`, so
 * it can never intercept a tap or start a visit — the card's arrow and its
 * "Explore …" CTA remain the only navigation.
 *
 * @param {{
 *   category: { slug: string, name: string, items: Array<{ slug: string, name: string, short: string, image: string, accent: string }> },
 *   onActive?: (index: number) => void,
 *   progress?: import('framer-motion').MotionValue<number> | null,
 *   solidTitle?: boolean,
 * }} props
 *   `progress` receives the reel's continuous position in screens — a float
 *   wrapped into [0, count) — every frame. The sub-service ticker beneath the
 *   title rides that same value, so the name rises in lockstep with the image
 *   instead of stepping between them, and neither can drift from the other.
 */
export default function ServiceShowcaseRail({ category, onActive = () => {}, progress = null, solidTitle = false }) {
    const reduce = useReducedMotion();
    const frameRef = useRef(null);
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    const items = category.items ?? [];
    const count = items.length;

    const y = useMotionValue(0);
    const stepRef = useRef(0);
    const travelled = useRef(0);
    const lastActive = useRef(0);

    // One screen height (+ gap) calibrates the reel; re-measured on resize
    // so every breakpoint stays exact.
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame || typeof ResizeObserver === 'undefined') return undefined;

        const measure = () => {
            const first = frame.querySelector('[data-screen]');
            if (!first) return;
            const next = first.getBoundingClientRect().height + GAP;
            stepRef.current = next;
            setStep(next);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(frame);

        return () => observer.disconnect();
    }, []);

    // Off-screen cards park the reel entirely.
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame || typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '25% 0px' });
        observer.observe(frame);

        return () => observer.disconnect();
    }, []);

    // The single clock: advances the strip and announces the top screen.
    // Restarting (pause, resize, tab switch) resumes from the kept position
    // with the clock reset, so motion never jumps.
    useEffect(() => {
        if (reduce || count === 0 || !visible) return undefined;

        let raf = 0;
        let last = performance.now();
        let hidden = document.hidden;
        const onVisibility = () => {
            hidden = document.hidden;
            last = performance.now();
        };
        document.addEventListener('visibilitychange', onVisibility);

        const frame = (now) => {
            raf = requestAnimationFrame(frame);
            const elapsed = now - last;
            if (elapsed < FRAME_INTERVAL) return;

            const dt = Math.min(64, elapsed) / 1000;
            last = now;
            if (hidden) return;
            // Wrap into a single cycle. The strip holds the screens twice, so
            // the frame at `count` screens travelled is pixel-identical to the
            // frame at 0 — wrapping there is invisible, and without it the
            // offset grows without bound and the reel eventually scrolls past
            // the end of the doubled strip, leaving the frame empty.
            travelled.current = (travelled.current + dt / SECONDS_PER_SCREEN) % count;
            y.set(-(travelled.current * stepRef.current));
            if (progress) progress.set(travelled.current);
            const active = Math.floor(travelled.current) % count;
            if (active !== lastActive.current) {
                lastActive.current = active;
                onActive(active);
            }
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [reduce, count, visible, onActive, progress, y]);

    if (count === 0) {
        return null;
    }

    if (reduce) {
        return (
            <div className="pointer-events-none relative w-[96px] shrink-0 self-stretch overflow-hidden sm:w-[124px] lg:w-[136px] xl:w-[172px]" aria-hidden>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                    <ShowcaseScreen item={items[0]} solidTitle={solidTitle} />
                </div>
            </div>
        );
    }

    const copies = [...items, ...items];

    return (
        <div
            ref={frameRef}
            className="pointer-events-none relative w-[96px] shrink-0 self-stretch overflow-hidden sm:w-[124px] lg:w-[136px] xl:w-[172px]"
            aria-hidden
        >
            <motion.div
                className="absolute inset-x-0 top-0 flex flex-col"
                style={{ gap: GAP, y }}
            >
                {copies.map((item, i) => (
                    <ShowcaseScreen
                        key={`${Math.floor(i / count)}-${item.slug}`}
                        item={item}
                        solidTitle={solidTitle}
                    />
                ))}
            </motion.div>
        </div>
    );
}
