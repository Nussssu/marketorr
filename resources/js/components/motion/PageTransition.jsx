import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const PANELS = ['#891FFB', '#507AF4', '#1BE2EB'];

/**
 * Whether a visit is a reader actually going to another page.
 *
 * Only safe to ask at `start`. Inertia hands `start` and `finish` the same
 * visit object and clears `prefetch` on it once the response is cached, so a
 * prefetch that looked like a prefetch on the way out looks like a real
 * navigation on the way back. Prefetches and polls are also always `async`,
 * which a click never is.
 */
function isPageNavigation(visit) {
    return visit.method === 'get' && !visit.prefetch && !visit.async;
}

function scrollAfterNav() {
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);

        if (element) {
            if (window.__lenis) window.__lenis.scrollTo(element, { offset: -72, immediate: true });
            else element.scrollIntoView();

            return;
        }
    }

    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
}

/** Seconds for one panel's rise-hold-fall. */
const PANEL_SECONDS = 0.7;
/** Seconds each panel starts after the one before it. */
const PANEL_STAGGER = 0.04;
/**
 * Delay before the route change so the 3 panels fully cover the screen first.
 * The last panel is fully up at (2 * stagger + 0.4 * duration) seconds, so this
 * stays just past that and no further.
 */
const COVER_BEFORE_NAV_MS = Math.round((2 * PANEL_STAGGER + 0.4 * PANEL_SECONDS) * 1000);
/** How long the panels keep running after the route has changed. */
const COVER_AFTER_NAV_MS = Math.round(PANEL_SECONDS * 1000);

/**
 * Set when another layer is already carrying the reader across, so the cover
 * would hide the thing they are watching. Consumed by the next visit only.
 */
let coverSuppressed = false;

/**
 * Let the next visit run without the colour cover.
 *
 * Used by the showcase transition, which flies the clicked visual into the
 * next page's hero and needs that visual to stay visible throughout.
 */
export function skipCoverForNextVisit() {
    coverSuppressed = true;
}

/**
 * Ask the PageTransition layer to play the full-screen 3-color cover first
 * and only then complete the route change. Resolves new-tab/modifier clicks
 * by doing nothing — callers must let those fall through to the browser.
 * Hover, mousemove and scroll must never call this; wire it to click only.
 *
 * @param {string} href
 */
export function transitionTo(href) {
    if (!href || typeof href !== 'string') return;
    window.dispatchEvent(new CustomEvent('marketorr:transition-to', { detail: { href } }));
}

export default function PageTransition({ children }) {
    const [cover, setCover] = useState(false);
    const [cycle, setCycle] = useState(0);
    const coverRef = useRef(false);
    const timers = useRef([]);
    /**
     * Visits this layer decided to animate, judged at `start` while the visit
     * still says what it is. `finish` acts only on a visit in here, so a
     * prefetch can never reach the cover or the scroll reset.
     */
    const navigating = useRef(new WeakSet());

    /**
     * Raise the cover. `restart` replays it from the top even if one is already
     * on screen, so a reader clicking through quickly still gets the full
     * animation rather than a bare route change.
     */
    const showCover = (restart = false) => {
        if (coverRef.current && !restart) return;

        coverRef.current = true;
        setCycle((current) => current + 1);
        setCover(true);
    };

    useEffect(() => {
        coverRef.current = cover;
    }, [cover]);

    useEffect(() => {
        const clear = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
        const hideCover = () => {
            coverRef.current = false;
            setCover(false);
        };
        // Navigation itself stays 100% native (Inertia links): every click
        // lands exactly where its href points. This layer only plays the
        // cinematic cover around real page visits.
        const offStart = router.on('start', (event) => {
            const { visit } = event.detail;

            if (!isPageNavigation(visit)) return;

            if (coverSuppressed) {
                coverSuppressed = false;

                return;
            }

            navigating.current.add(visit);
            clear();
            showCover();
        });
        const offFinish = router.on('finish', (event) => {
            const { visit } = event.detail;

            if (!navigating.current.has(visit)) return;

            navigating.current.delete(visit);

            if (!visit.completed || visit.cancelled || visit.interrupted) {
                clear();
                hideCover();

                return;
            }

            timers.current.push(setTimeout(scrollAfterNav, Math.round(COVER_AFTER_NAV_MS * 0.45)));
            timers.current.push(setTimeout(hideCover, COVER_AFTER_NAV_MS));
        });

        return () => {
            offStart();
            offFinish();
            clear();
        };
    }, []);

    useEffect(() => {
        const clearNavTimer = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };

        // Click-initiated navigation: raise the cover first, swap the route
        // while the screen is covered, then let the finish handler lower it.
        const onRequest = (event) => {
            const href = event?.detail?.href;
            if (!href || typeof href !== 'string') return;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                router.visit(href);
                return;
            }

            clearNavTimer();
            showCover(true);
            timers.current.push(setTimeout(() => {
                router.visit(href);
            }, COVER_BEFORE_NAV_MS));
        };

        window.addEventListener('marketorr:transition-to', onRequest);
        return () => {
            window.removeEventListener('marketorr:transition-to', onRequest);
        };
    }, []);

    return (
        <>
            <AnimatePresence>
                {cover && (
                    <motion.div
                        key={cycle}
                        className="pointer-events-none fixed inset-0 z-[10010] flex"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {PANELS.map((color, index) => (
                            <motion.div
                                key={color}
                                className="h-full flex-1 origin-top"
                                style={{ background: color }}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: [0, 1, 1, 0] }}
                                transition={{ duration: PANEL_SECONDS, times: [0, 0.4, 0.6, 1], delay: index * PANEL_STAGGER, ease: [0.22, 1, 0.36, 1] }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
}
