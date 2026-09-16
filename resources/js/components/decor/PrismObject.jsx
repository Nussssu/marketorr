import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const PURPLE = '#891FFB';
const BLUE = '#507AF4';
const CYAN = '#1BE2EB';

const RICH_QUERY = '(min-width: 1024px)';
const COARSE_QUERY = '(pointer: coarse)';

/**
 * The rings, described once so the markup stays a flat list. `tilt`/`turn`
 * fix each ring's own plane inside the shared 3D stage; `depth` pushes it
 * along the stage's Z axis so they never sit in one flat plate.
 *
 * @type {Array<{ color: string, size: number, tilt: number, turn: number, depth: number, spin: number }>}
 */
const RINGS = [
    { color: PURPLE, size: 100, tilt: 72, turn: -18, depth: -60, spin: 26 },
    { color: BLUE, size: 78, tilt: 58, turn: 26, depth: 10, spin: 19 },
    { color: CYAN, size: 54, tilt: 34, turn: -8, depth: 70, spin: 14 },
];

/**
 * Loose shards orbiting the rings, kept to three so the whole object stays a
 * handful of composited layers.
 *
 * @type {Array<{ color: string, x: number, y: number, depth: number, size: number, drift: number }>}
 */
const SHARDS = [
    { color: CYAN, x: 30, y: -32, depth: 120, size: 12, drift: 9 },
    { color: PURPLE, x: -34, y: 24, depth: -40, size: 18, drift: 13 },
    { color: BLUE, x: 26, y: 34, depth: 50, size: 9, drift: 11 },
];

/**
 * Abstract brand object for the hero: concentric rings in Marketorr purple,
 * blue and cyan suspended at different depths in one perspective stage, with
 * loose shards orbiting them.
 *
 * Three inputs move it, and they stay separated so none of them fights the
 * others:
 *
 * - **Pointer** turns the whole stage (spring-damped rotateX/rotateY), so the
 *   object appears to face the cursor.
 * - **Scroll** — the hero's own progress, passed in — rolls it, pushes it back
 *   and fades it as the hero leaves.
 * - **Ambient** CSS animations spin each ring and drift each shard on the
 *   compositor, so the object is alive while the page is still.
 *
 * Everything is transform and opacity on a fixed set of nodes: no canvas, no
 * WebGL, no per-frame React state. Coarse pointers and phones drop the pointer
 * tracking and the ambient spin and keep only the scroll response; reduced
 * motion renders it static.
 *
 * @param {{ progress?: import('framer-motion').MotionValue<number> }} props
 *   `progress` is the hero's scroll progress (0 at rest, 1 once the hero has
 *   scrolled away).
 */
export default function PrismObject({ progress }) {
    const reduce = useReducedMotion();
    const hostRef = useRef(null);
    const [rich, setRich] = useState(false);
    const [running, setRunning] = useState(true);

    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const tiltY = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
    const tiltX = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });

    useEffect(() => {
        const rq = window.matchMedia(RICH_QUERY);
        const cq = window.matchMedia(COARSE_QUERY);
        const update = () => setRich(rq.matches && !cq.matches);
        update();
        rq.addEventListener('change', update);
        cq.addEventListener('change', update);

        return () => {
            rq.removeEventListener('change', update);
            cq.removeEventListener('change', update);
        };
    }, []);

    // Pointer drives motion values directly — no React state, so moving the
    // mouse never re-renders the tree behind the hero copy.
    useEffect(() => {
        if (!rich || reduce) return undefined;

        const onMove = (event) => {
            const nx = (event.clientX / window.innerWidth) * 2 - 1;
            const ny = (event.clientY / window.innerHeight) * 2 - 1;
            pointerX.set(nx * 16);
            pointerY.set(ny * -12);
        };

        window.addEventListener('pointermove', onMove, { passive: true });

        return () => window.removeEventListener('pointermove', onMove);
    }, [rich, reduce, pointerX, pointerY]);

    // The ambient spin is the only continuously running thing here, so park it
    // whenever the hero is off screen or the tab is in the background.
    useEffect(() => {
        const host = hostRef.current;
        if (!host || typeof IntersectionObserver === 'undefined') return undefined;

        let onScreen = true;
        const sync = () => setRunning(onScreen && !document.hidden);
        const io = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
        }, { rootMargin: '10% 0px' });
        io.observe(host);
        document.addEventListener('visibilitychange', sync);

        return () => {
            io.disconnect();
            document.removeEventListener('visibilitychange', sync);
        };
    }, []);

    const fallback = useMotionValue(0);
    const scroll = progress ?? fallback;
    const scrollRoll = useTransform(scroll, [0, 1], [0, 26]);
    const scrollY = useTransform(scroll, [0, 1], [0, -90]);
    const scrollZ = useTransform(scroll, [0, 1], [0, -260]);
    const scrollFade = useTransform(scroll, [0, 0.75], [1, 0]);

    const animated = !reduce;
    const playState = running ? 'running' : 'paused';

    return (
        <div
            ref={hostRef}
            /* Phones park it in the empty pocket right of the bar cluster, clear
               of the headline and the CTAs; from `sm` up it takes its place
               beside the copy. */
            className="prism pointer-events-none absolute right-[-18%] top-[56%] h-[min(56vw,240px)] w-[min(56vw,240px)] sm:right-[-6%] sm:top-[30%] sm:h-[min(58vw,430px)] sm:w-[min(58vw,430px)] lg:right-[4%] lg:top-[26%]"
            style={{ perspective: '900px' }}
            aria-hidden
        >
            <motion.div
                className="relative h-full w-full"
                style={{
                    transformStyle: 'preserve-3d',
                    rotateX: animated && rich ? tiltX : 0,
                    rotateY: animated && rich ? tiltY : 0,
                    rotateZ: animated ? scrollRoll : 0,
                    y: animated ? scrollY : 0,
                    z: animated ? scrollZ : 0,
                    opacity: animated ? scrollFade : 1,
                }}
            >
                {RINGS.map((ring) => (
                    <div
                        key={ring.color}
                        className="absolute left-1/2 top-1/2"
                        style={{
                            width: `${ring.size}%`,
                            height: `${ring.size}%`,
                            transformStyle: 'preserve-3d',
                            transform: `translate3d(-50%, -50%, ${ring.depth}px) rotateX(${ring.tilt}deg) rotateY(${ring.turn}deg)`,
                        }}
                    >
                        <div
                            className={`prism__ring h-full w-full rounded-full ${animated && rich ? 'prism__ring--spin' : ''}`.trimEnd()}
                            style={{
                                border: `1.5px solid ${ring.color}`,
                                boxShadow: `0 0 34px ${ring.color}40, inset 0 0 34px ${ring.color}26`,
                                animationDuration: `${ring.spin}s`,
                                animationPlayState: playState,
                            }}
                        />
                    </div>
                ))}

                {SHARDS.map((shard) => (
                    <div
                        key={`${shard.color}-${shard.x}`}
                        className={`prism__shard absolute left-1/2 top-1/2 rounded-[4px] ${animated && rich ? 'prism__shard--drift' : ''}`.trimEnd()}
                        style={{
                            width: shard.size,
                            height: shard.size,
                            background: shard.color,
                            boxShadow: `0 0 22px ${shard.color}`,
                            transform: `translate3d(calc(-50% + ${shard.x}%), calc(-50% + ${shard.y}%), ${shard.depth}px) rotate(45deg)`,
                            animationDuration: `${shard.drift}s`,
                            animationPlayState: playState,
                        }}
                    />
                ))}

                <div
                    className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${BLUE}55, ${PURPLE}22 45%, transparent 70%)`,
                        filter: 'blur(14px)',
                    }}
                />
            </motion.div>
        </div>
    );
}
