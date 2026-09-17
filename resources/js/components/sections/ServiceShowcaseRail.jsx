import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { showcaseFor } from './ServiceShowcaseMockups';

/** Tight gap between screens — the strip stays continuous with no air in it. */
const GAP = 8;

/** Seconds for one screen to travel its own height — slow premium reel. */
const SECONDS_PER_SCREEN = 4.5;
const FRAME_INTERVAL = 1000 / 30;

/**
 * One screen in the rail: a premium mockup of the actual deliverable, in a
 * frame that is a white card in the light theme and dark glass in the dark one.
 *
 * `--svc-accent` carries the sub-service's brand colour into the frame's
 * highlight hairline and its caption dot — the only places the brand trio
 * appears at this level.
 */
function ShowcaseScreen({ item, Mockup }) {
    return (
        <figure className="m-0" data-screen>
            <div className="svc-screen relative aspect-[4/5] w-full overflow-hidden rounded-2xl" style={{ '--svc-accent': item.accent }}>
                <Mockup />
                <figcaption className="svc-screen__caption absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-2.5 pb-2.5 pt-5 sm:px-3 sm:pb-3">
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: item.accent }} aria-hidden />
                    <span className="truncate font-display text-[7.5px] font-bold uppercase leading-tight tracking-[0.12em] text-[var(--ink)] sm:text-[8.5px]">
                        {item.name}
                    </span>
                </figcaption>
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
 *   category: { slug: string, name: string, items: Array<{ slug: string, name: string, accent: string }> },
 *   onActive?: (index: number) => void,
 * }} props
 */
export default function ServiceShowcaseRail({ category, onActive = () => {} }) {
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
            travelled.current += dt / SECONDS_PER_SCREEN;
            y.set(-(travelled.current * stepRef.current));
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
    }, [reduce, count, visible, onActive, y]);

    if (count === 0) {
        return null;
    }

    if (reduce) {
        const Mockup = showcaseFor(category.slug, items[0].slug, 0);

        return (
            <div className="pointer-events-none relative w-[96px] shrink-0 self-stretch overflow-hidden sm:w-[124px] lg:w-[136px] xl:w-[172px]" aria-hidden>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                    <ShowcaseScreen item={items[0]} Mockup={Mockup} />
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
                        Mockup={showcaseFor(category.slug, item.slug, i % count)}
                    />
                ))}
            </motion.div>
        </div>
    );
}
