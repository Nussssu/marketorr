import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Seconds for one full cycle of the column. Phones run slower — less travel per frame. */
const RICH_SECONDS = 44;
const LIGHT_SECONDS = 58;
// Phones run the same cycle as desktop; motion preference still lightens it.
const RICH_QUERY = '(prefers-reduced-motion: no-preference)';

/**
 * Opening guess at how many lines one set needs. The real figure is measured
 * once the type has laid out — see the fitting effect below — because it
 * depends on the frame's height and the rendered line height, neither of which
 * is knowable up front. Starting near the answer just avoids a visible reflow
 * on the common case.
 */
const MIN_LINES = 8;

/** Ceiling on the repeat count, so a pathological measurement cannot flood the DOM. */
const MAX_REPEATS = 40;

/**
 * Continuously rising column of oversized typography, sized to sit behind a
 * hero's title as a moving backdrop.
 *
 * The words travel bottom-to-top forever on a clock of their own: nothing here
 * reads the pointer, so the type never shakes, follows or otherwise reacts to
 * the cursor, and nothing starts or stops on hover. The loop is seamless
 * because the word set is rendered twice and the track travels exactly -50% —
 * the end frame is pixel-identical to the start.
 *
 * The travel is a CSS animation rather than a JS one, matching the sub-service
 * image stack: it runs on the compositor, and `animation-play-state` then parks
 * it for free whenever the hero is off screen or the tab is in the background
 * instead of burning frames behind a page the user cannot see.
 *
 * The track is absolutely positioned, so its full length never sets the box's
 * height — the column only ever fills the frame it is given, and
 * `overflow: hidden` on that frame clips it hard to the visual area.
 *
 * Purely decorative: the whole column is `pointer-events-none` and
 * `aria-hidden`, so it never intercepts a tap and never reaches a screen
 * reader — the words it cycles are always real content already published
 * elsewhere on the same page.
 *
 * @param {{
 *   words: Array<string>,
 *   seconds?: number,
 *   compactSeconds?: number,
 *   className?: string,
 * }} props
 *   `seconds` / `compactSeconds` override the desktop and phone cycle lengths
 *   for a hero that wants a faster or slower reel.
 */
export default function RisingTypeLoop({
    words,
    seconds = RICH_SECONDS,
    compactSeconds = LIGHT_SECONDS,
    className = '',
}) {
    const reduce = useReducedMotion();
    const boxRef = useRef(null);
    const setRef = useRef(null);
    const [rich, setRich] = useState(false);
    const [running, setRunning] = useState(false);

    const lines = (words ?? []).filter(Boolean);
    const baseCount = lines.length;

    const [repeats, setRepeats] = useState(
        () => Math.max(1, Math.ceil(MIN_LINES / Math.max(1, baseCount))),
    );

    useEffect(() => {
        const query = window.matchMedia(RICH_QUERY);
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    // One set has to be at least as tall as the frame, or the seam between the
    // two copies opens a bald gap mid-cycle. How many repeats that takes
    // depends on the viewport and the rendered line height — a phone in
    // portrait needs several times what a desktop does — so it is measured
    // rather than assumed, and re-measured on resize and orientation change.
    //
    // The count only ever grows. Letting it shrink again would let a frame
    // sitting exactly on the boundary oscillate between two counts forever,
    // and a few unused lines cost nothing.
    useEffect(() => {
        const box = boxRef.current;
        const first = setRef.current;
        if (!box || !first || baseCount === 0) return undefined;

        const fit = () => {
            const frame = box.getBoundingClientRect().height;
            const setHeight = first.getBoundingClientRect().height;
            if (!frame || !setHeight) return;

            const lineHeight = setHeight / (baseCount * repeats);
            if (!lineHeight) return;

            // One spare line past the frame keeps the seam out of view.
            const needed = Math.ceil((frame / lineHeight + 1) / baseCount);
            if (needed > repeats) setRepeats(Math.min(MAX_REPEATS, needed));
        };
        fit();

        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(fit);
        observer.observe(box);

        return () => observer.disconnect();
    }, [baseCount, repeats]);

    // Only animate while the hero is actually on screen and the tab is visible.
    useEffect(() => {
        const box = boxRef.current;
        if (!box || typeof IntersectionObserver === 'undefined') return undefined;

        let onScreen = false;
        const sync = () => setRunning(onScreen && !document.hidden);
        const observer = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
        }, { rootMargin: '15% 0px' });
        observer.observe(box);
        document.addEventListener('visibilitychange', sync);

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', sync);
        };
    }, []);

    if (baseCount === 0) return null;

    const set = Array.from({ length: repeats }, () => lines).flat();
    const copies = [0, 1];

    return (
        <div
            ref={boxRef}
            className={`rising-type pointer-events-none absolute inset-0 overflow-hidden ${className}`.trimEnd()}
            aria-hidden
        >
            <div
                className={`rising-type__track ${reduce ? 'rising-type__track--still' : ''}`.trimEnd()}
                style={
                    reduce
                        ? undefined
                        : {
                            animationDuration: `${rich ? seconds : compactSeconds}s`,
                            animationPlayState: running ? 'running' : 'paused',
                        }
                }
            >
                {copies.map((copy) => (
                    <div key={copy} ref={copy === 0 ? setRef : undefined} className="rising-type__set">
                        {set.map((word, i) => (
                            <span key={`${copy}-${i}`} className="rising-type__line">
                                {word}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
