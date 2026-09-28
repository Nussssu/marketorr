import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const PANELS = ['#891FFB', '#507AF4', '#1BE2EB'];

/**
 * Whether a visit is a reader actually going to another page.
 *
 * Prefetches and polls are always async, which a reader-initiated page visit
 * is not. These visits are the only ones that should raise the curtain.
 */
function isPageNavigation(visit) {
    return visit.method === 'get' && !visit.prefetch && !visit.async;
}

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollAfterNav() {
    try {
        let element = null;

        if (window.location.hash) {
            try {
                element = document.querySelector(window.location.hash);
            } catch {
                element = null;
            }

            if (element) {
                if (window.__lenis) window.__lenis.scrollTo(element, { offset: -72, immediate: true });
                else element.scrollIntoView();

                return;
            }
        }

        if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
    } catch {
        try {
            window.scrollTo(0, 0);
        } catch {
            /* Last resort: never let a scroll failure strand the curtain. */
        }
    }
}

/** Seconds for panels to cover and uncover the viewport. */
const PANEL_COVER_SECONDS = 0.16;
const PANEL_REVEAL_SECONDS = 0.18;
/** Seconds each panel starts after the one before it. */
const PANEL_STAGGER = 0.018;
/** Finish the entrance before revealing a destination that loaded immediately. */
const COVER_ENTRANCE_MS = Math.round((PANEL_COVER_SECONDS + (PANELS.length - 1) * PANEL_STAGGER) * 1000);
const REVEAL_AFTER_NAV_MS = Math.round((2 * PANEL_STAGGER + PANEL_REVEAL_SECONDS) * 1000);
/** Absolute backstop: frozen full-screen panels are never acceptable. */
const CURTAIN_SAFETY_MS = 6000;

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
 * Ask the PageTransition layer to animate a full-screen 3-color cover while
 * the destination loads. Resolves new-tab/modifier clicks by doing nothing —
 * callers must let those fall through to the browser. Hover, mousemove and
 * scroll must never call this; wire it to click only.
 *
 * @param {string} href
 */
export function transitionTo(href) {
    if (!href || typeof href !== 'string') return;
    window.dispatchEvent(new CustomEvent('marketorr:transition-to', { detail: { href } }));
}

export default function PageTransition({ children }) {
    const [cover, setCover] = useState(false);
    const [phase, setPhase] = useState('idle');
    const [cycle, setCycle] = useState(0);
    const coverRef = useRef(false);
    const cycleRef = useRef(0);
    const timers = useRef([]);
    const suppressedVisits = useRef(new WeakSet());
    const coverStartedAt = useRef(0);
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
        cycleRef.current += 1;
        const id = cycleRef.current;
        coverStartedAt.current = performance.now();
        setCycle(id);
        setPhase('covering');
        setCover(true);
        // Backstop: if the visit stalls or any step below throws, the panels
        // must still come down on their own — never freeze full-screen.
        timers.current.push(setTimeout(() => {
            if (cycleRef.current === id) hideCover();
        }, CURTAIN_SAFETY_MS));
    };

    useEffect(() => {
        coverRef.current = cover;
    }, [cover]);

    /**
     * Component scope (refs + stable setters only) so both the safety timer
     * and the router handlers share one teardown with no stale closures.
     */
    const hideCover = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        coverRef.current = false;
        setPhase('idle');
        setCover(false);
    };

    useEffect(() => {
        const clear = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
        const revealCover = () => {
            const id = cycleRef.current;
            const reveal = () => {
                if (cycleRef.current !== id) return;

                setPhase('revealing');
                // Cycle-guarded: a newer navigation's teardown wins, so a stale
                // finish can never drop the curtain on the wrong page.
                timers.current.push(setTimeout(() => {
                    if (cycleRef.current === id) hideCover();
                }, REVEAL_AFTER_NAV_MS));
            };
            const entranceRemaining = Math.max(0, COVER_ENTRANCE_MS - (performance.now() - coverStartedAt.current));

            if (entranceRemaining === 0) {
                reveal();
            } else {
                timers.current.push(setTimeout(reveal, entranceRemaining));
            }
        };
        const offBefore = router.on('before', (event) => {
            const { visit } = event.detail;

            if (!isPageNavigation(visit)) return;

            if (coverSuppressed) {
                coverSuppressed = false;
                suppressedVisits.current.add(visit);

                return;
            }
        });
        const offStart = router.on('start', (event) => {
            const { visit } = event.detail;

            if (!isPageNavigation(visit)) return;

            if (suppressedVisits.current.has(visit)) {
                suppressedVisits.current.delete(visit);

                return;
            }

            if (prefersReducedMotion()) return;

            navigating.current.add(visit);
            clear();
            showCover();
            // Re-arm the backstop: `clear()` above wiped the one from
            // `showCover`, and a hung request must still release the page.
            const id = cycleRef.current;
            timers.current.push(setTimeout(() => {
                if (cycleRef.current === id) hideCover();
            }, CURTAIN_SAFETY_MS));
        });
        const offFinish = router.on('finish', (event) => {
            const { visit } = event.detail;

            if (!navigating.current.has(visit)) return;

            navigating.current.delete(visit);

            if (!visit.completed || visit.cancelled || visit.interrupted) {
                clear();
                revealCover();

                return;
            }

            // The reveal must run even if the scroll reset throws — a frozen
            // full-screen curtain is never an acceptable failure mode.
            clear();
            try {
                scrollAfterNav();
            } finally {
                revealCover();
            }
        });

        return () => {
            offBefore();
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

        // Start covering immediately and let Inertia fetch the destination
        // underneath. The finish handler reveals once the page is ready.
        const onRequest = (event) => {
            const href = event?.detail?.href;
            if (!href || typeof href !== 'string') return;

            if (prefersReducedMotion()) {
                router.visit(href);
                return;
            }

            clearNavTimer();
            showCover(true);
            try {
                router.visit(href);
            } catch {
                hideCover();
            }
        };

        window.addEventListener('marketorr:transition-to', onRequest);
        return () => {
            window.removeEventListener('marketorr:transition-to', onRequest);
        };
    }, []);

    return (
        <>
            {cover && (
                <div key={cycle} className="pointer-events-auto fixed inset-0 z-[10010] flex" aria-hidden>
                    {PANELS.map((color, index) => (
                        <motion.div
                            key={color}
                            className="h-full flex-1 origin-top"
                            style={{ background: color }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: phase === 'revealing' ? 0 : 1 }}
                            transition={{
                                duration: phase === 'revealing' ? PANEL_REVEAL_SECONDS : PANEL_COVER_SECONDS,
                                delay: phase === 'revealing'
                                    ? (PANELS.length - 1 - index) * PANEL_STAGGER
                                    : index * PANEL_STAGGER,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        />
                    ))}
                </div>
            )}
            {children}
        </>
    );
}
