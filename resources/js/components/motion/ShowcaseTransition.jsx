import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { skipCoverForNextVisit } from './PageTransition';

const EASE = [0.22, 1, 0.36, 1];

/** Flight length, and how far into it the route swaps underneath the visual. */
const FLIGHT_MS = 780;
const NAV_AT_MS = 400;
/** Never strand the overlay if a visit stalls or never finishes. */
const SAFETY_MS = 3200;

/**
 * The scale the sub-service hero holds its photograph at once it has settled.
 * The flying copy finishes on this exact value, so handing over is a fade
 * between two identical frames rather than a jump in crop.
 */
const HERO_RESTING_SCALE = 1.12;

/**
 * True when the visit now in flight was started by a showcase click, so the
 * hero about to mount knows to appear already in place instead of playing its
 * own entrance into a picture that is on screen.
 */
let arrivingFromShowcase = false;

/** Read once by the hero that mounts next; clears itself. */
export function consumeShowcaseArrival() {
    const value = arrivingFromShowcase;
    arrivingFromShowcase = false;

    return value;
}

/**
 * Send a sub-service visual to its own page.
 *
 * Scoped to the Branding / UI-UX showcase: only `SubServiceShowcase` scenes
 * call this, so no other page (Home, About, Work, Contact) ever triggers the
 * flight — those keep the standard cover transition untouched.
 *
 * The visual the reader clicked is lifted out of the page, flown forward to
 * the shape the hero will occupy, and held there while the route changes
 * underneath it. Because the showcase and the hero render the same
 * photograph, letting go of the copy reveals the real hero already in
 * position — the picture appears to have travelled rather than the page to
 * have swapped.
 *
 * @param {string} href
 * @param {{src: string, alt?: string, rect: DOMRect, radius?: number, accent?: string}} visual
 */
export function expandTo(href, visual) {
    if (!href || !visual?.src || !visual?.rect) return;

    window.dispatchEvent(new CustomEvent('marketorr:showcase-expand', {
        detail: {
            href,
            src: visual.src,
            alt: visual.alt ?? '',
            radius: visual.radius ?? 24,
            accent: visual.accent ?? '#891FFB',
            rect: {
                top: visual.rect.top,
                left: visual.rect.left,
                width: visual.rect.width,
                height: visual.rect.height,
            },
        },
    }));
}

/**
 * The layer that performs the flight. Mounted once, beside the page.
 *
 * Nothing here navigates on its own: it only ever runs in response to
 * `expandTo`, which is wired to click.
 */
export default function ShowcaseTransition() {
    const [flight, setFlight] = useState(null);
    const [landed, setLanded] = useState(false);
    const timers = useRef([]);
    const frames = useRef([]);
    /**
     * Whether a flight is already under way. Held in a ref, not in state: the
     * listener below must be installed exactly once, because its cleanup
     * cancels the pending timers — including the one that performs the visit.
     */
    const inFlight = useRef(false);

    useEffect(() => {
        const clearTimers = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
            frames.current.forEach(cancelAnimationFrame);
            frames.current = [];
        };

        const onExpand = (event) => {
            const detail = event.detail;
            if (!detail) return;

            // A second click mid-flight would strand the first copy.
            if (inFlight.current) return;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                router.visit(detail.href);

                return;
            }

            inFlight.current = true;
            clearTimers();
            setLanded(false);
            setFlight(detail);
            // Hold the page behind the flight so a wheel/touch mid-flight
            // can't scroll the outgoing showcase out from under the visual.
            document.documentElement.style.overflow = 'hidden';

            timers.current.push(setTimeout(() => {
                // The cover would hide the very thing that is flying.
                skipCoverForNextVisit();
                arrivingFromShowcase = true;
                router.visit(detail.href, {
                    onFinish: () => {
                        // The reader is looking at the visual, not the page, so
                        // put the new page at its top while it is hidden. This
                        // is the landing half of the click they made.
                        if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
                        else window.scrollTo(0, 0);

                        // Two frames: one for React to commit the new hero, one
                        // for the browser to paint it, before uncovering it.
                        frames.current.push(requestAnimationFrame(() => {
                            frames.current.push(requestAnimationFrame(() => setLanded(true)));
                        }));
                    },
                });
            }, NAV_AT_MS));

            timers.current.push(setTimeout(() => {
                inFlight.current = false;
                setFlight(null);
                setLanded(false);
                document.documentElement.style.overflow = '';
            }, SAFETY_MS));
        };

        window.addEventListener('marketorr:showcase-expand', onExpand);

        return () => {
            window.removeEventListener('marketorr:showcase-expand', onExpand);
            clearTimers();
        };
    }, []);

    // Once the hero underneath is painted, the copy has nothing left to do.
    useEffect(() => {
        if (!landed) return undefined;

        const done = setTimeout(() => {
            inFlight.current = false;
            setFlight(null);
            setLanded(false);
            document.documentElement.style.overflow = '';
        }, 420);

        return () => clearTimeout(done);
    }, [landed]);

    return (
        <AnimatePresence>
            {flight && (
                <motion.div
                    key="showcase-flight"
                    className="pointer-events-none fixed z-[10015] overflow-hidden"
                    initial={{
                        top: flight.rect.top,
                        left: flight.rect.left,
                        width: flight.rect.width,
                        height: flight.rect.height,
                        borderRadius: flight.radius,
                    }}
                    animate={{
                        top: 0,
                        left: 0,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        borderRadius: 0,
                        transition: { duration: FLIGHT_MS / 1000, ease: [...EASE] },
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.34, ease: [...EASE] } }}
                >
                    <motion.img
                        src={flight.src}
                        alt=""
                        aria-hidden
                        draggable={false}
                        className="h-full w-full object-cover"
                        initial={{ scale: 1.04 }}
                        animate={{ scale: HERO_RESTING_SCALE, transition: { duration: FLIGHT_MS / 1000, ease: [...EASE] } }}
                    />
                    {/* The hero reads its title off a darkened plate. The copy
                        takes on that exact scrim during the flight, so what the
                        reader sees at the handover is already the hero. */}
                    <motion.span
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(5,5,10,0.68) 0%, rgba(5,5,10,0.38) 32%, rgba(5,5,10,0.42) 62%, rgba(5,5,10,0.84) 100%)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: FLIGHT_MS / 1000, ease: [...EASE] } }}
                    />
                    {/* Forward-motion accents in the scene's own colour. */}
                    <motion.span
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(90% 55% at 50% 108%, ${flight.accent ?? '#891FFB'}55, transparent 65%)` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: FLIGHT_MS / 1000, ease: [...EASE] } }}
                    />
                    <motion.span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-[4px]"
                        style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1, transition: { duration: FLIGHT_MS / 1000, ease: [...EASE] } }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
