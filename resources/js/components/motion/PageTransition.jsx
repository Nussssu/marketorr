import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const PANELS = ['#891FFB', '#507AF4', '#1BE2EB'];

function isPageNavigation(visit) {
    return visit.method === 'get' && !visit.prefetch;
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

/** Delay before the route change so the 3 panels fully cover the screen first. */
const COVER_BEFORE_NAV_MS = 500;

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
    const coverRef = useRef(false);
    const timers = useRef([]);

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
            if (!isPageNavigation(event.detail.visit)) return;

            clear();

            if (!coverRef.current) {
                coverRef.current = true;
                setCover(true);
            }
        });
        const offFinish = router.on('finish', (event) => {
            const { visit } = event.detail;

            if (!isPageNavigation(visit)) return;

            if (!visit.completed || visit.cancelled || visit.interrupted) {
                clear();
                hideCover();

                return;
            }

            timers.current.push(setTimeout(scrollAfterNav, 450));
            timers.current.push(setTimeout(hideCover, 1050));
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

            if (coverRef.current) {
                router.visit(href);
                return;
            }

            clearNavTimer();
            coverRef.current = true;
            setCover(true);
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
                                transition={{ duration: 1, times: [0, 0.4, 0.6, 1], delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
}
