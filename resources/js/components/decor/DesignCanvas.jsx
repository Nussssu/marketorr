import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import { COLORS } from '../../lib/tokens';

const RICH_QUERY = '(min-width: 1024px)';
const COARSE_QUERY = '(pointer: coarse)';

const SWATCHES = [COLORS.grape, COLORS.iris, COLORS.frost];

/** Wireframe copy lines inside the app window, as a fraction of its width. */
const COPY_LINES = [0.78, 0.56, 0.66];

/**
 * One layer of the canvas, set at its own depth so the pointer tilt gives
 * the stack parallax. Lengths inside are `cqw` of the canvas, so the whole
 * piece scales with its box.
 */
function Layer({ depth, className = '', style, children }) {
    return (
        <div
            className={`absolute ${className}`.trimEnd()}
            style={{ ...style, transform: `translateZ(${depth}px)`, transformStyle: 'preserve-3d' }}
        >
            {children}
        </div>
    );
}

/**
 * The hero's design object: a working canvas caught mid-session. An app
 * window wireframe builds itself (UI/UX), a brand card holds the type and
 * the three brand colours (branding), a pen-tool curve draws in with its
 * anchors and handles (the craft), a selection frame breathes around the
 * brand card, and a named collaborator cursor moves between them.
 *
 * Three inputs move it, kept apart so none fights the others:
 *
 * - **Pointer** tilts the whole stage (spring-damped rotateX/rotateY), and
 *   the layers' different depths give it parallax.
 * - **Scroll** — the hero's own progress, passed in — rolls it, pushes it back
 *   and fades it as the hero leaves.
 * - **Ambient** CSS animations build the wireframe, draw the curve, pop the
 *   swatches and move the cursor, all transform/opacity or a stroke offset,
 *   so the canvas is alive while the page is still.
 *
 * No canvas, no WebGL, no per-frame React state. It is shown from desktop
 * width up; there, coarse pointers drop the pointer tracking and the ambient
 * motion and keep only the scroll response, and reduced motion renders it
 * static.
 *
 * @param {{ progress?: import('framer-motion').MotionValue<number> }} props
 *   `progress` is the hero's scroll progress (0 at rest, 1 once the hero has
 *   scrolled away).
 */
export default function DesignCanvas({ progress }) {
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

    // The ambient motion is the only continuously running thing here, so park
    // it whenever the hero is off screen or the tab is in the background.
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
    const scrollRoll = useTransform(scroll, [0, 1], [0, 18]);
    const scrollY = useTransform(scroll, [0, 1], [0, -90]);
    const scrollZ = useTransform(scroll, [0, 1], [0, -260]);
    const scrollFade = useTransform(scroll, [0, 0.75], [1, 0]);

    const animated = !reduce;
    const ambient = animated && rich;
    const live = (name) => (ambient ? name : '');
    const play = { animationPlayState: running ? 'running' : 'paused' };

    return (
        <div
            ref={hostRef}
            /* Below desktop the headline runs the full width, leaving no clear
               pocket for a scene this detailed — it would sit on the copy and
               the CTAs — so it only appears beside the copy from `lg` up. */
            className="design-canvas pointer-events-none absolute right-[4%] top-[26%] hidden h-[min(32vw,430px)] w-[min(32vw,430px)] lg:block"
            style={{ perspective: '900px', containerType: 'size' }}
            aria-hidden
        >
            <motion.div
                className="relative h-full w-full"
                style={{
                    transformStyle: 'preserve-3d',
                    rotateX: ambient ? tiltX : 0,
                    rotateY: ambient ? tiltY : 0,
                    rotateZ: animated ? scrollRoll : 0,
                    y: animated ? scrollY : 0,
                    z: animated ? scrollZ : 0,
                    opacity: animated ? scrollFade : 1,
                }}
            >
                <motion.div
                    className="absolute inset-0"
                    style={{ transformStyle: 'preserve-3d', rotateX: 8, rotateY: -14 }}
                    initial={animated ? { opacity: 0, y: 24 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.35, ease: [...EASE] }}
                >
                    {/* UI/UX: an app window whose wireframe builds itself. */}
                    <Layer depth={-40} className="design-canvas__panel left-[2cqw] top-[6cqw] w-[66cqw] p-[3cqw]">
                        <div className="mb-[3cqw] flex gap-[1.2cqw]">
                            {SWATCHES.map((color) => (
                                <span key={color} className="h-[1.6cqw] w-[1.6cqw] rounded-full" style={{ background: `${color}aa` }} />
                            ))}
                        </div>
                        <div
                            className={`design-canvas__build h-[15cqw] rounded-[1.4cqw] ${live('design-canvas__build--run')}`.trimEnd()}
                            style={{ ...play, background: `linear-gradient(120deg, ${COLORS.grape}55, ${COLORS.iris}44 55%, ${COLORS.frost}33)` }}
                        />
                        <div className="mt-[3cqw] space-y-[1.6cqw]">
                            {COPY_LINES.map((width, index) => (
                                <div
                                    key={width}
                                    className={`design-canvas__build design-canvas__line h-[1.5cqw] rounded-full ${live('design-canvas__build--run')}`.trimEnd()}
                                    style={{ ...play, width: `${width * 100}%`, animationDelay: `${0.25 + index * 0.2}s` }}
                                />
                            ))}
                        </div>
                        <div
                            className={`design-canvas__build mt-[3.2cqw] h-[4.4cqw] w-[20cqw] rounded-full ${live('design-canvas__build--run')}`.trimEnd()}
                            style={{ ...play, background: COLORS.gradient, animationDelay: '0.9s' }}
                        />
                    </Layer>

                    {/* Branding: type and colour, held in a selection frame. */}
                    <Layer depth={40} className="left-[42cqw] top-[40cqw] w-[50cqw]">
                        <div
                            className={`design-canvas__select absolute inset-[-1.6cqw] ${live('design-canvas__select--run')}`.trimEnd()}
                            style={play}
                        >
                            {['left-0 top-0', 'right-0 top-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((corner) => (
                                <span key={corner} className={`design-canvas__handle absolute ${corner}`} />
                            ))}
                            <span className="design-canvas__size absolute left-1/2 top-full mt-[1.4cqw] -translate-x-1/2">
                                480 × 300
                            </span>
                        </div>
                        <div className="design-canvas__panel p-[3.2cqw]">
                            <div className="flex items-end justify-between">
                                <span className="font-display text-[12cqw] font-bold leading-[0.9] text-[var(--ink-strong)]">Aa</span>
                                <span className="pb-[0.8cqw] text-right text-[2.2cqw] font-bold uppercase leading-[1.5] tracking-[0.16em] text-[var(--ink-faint)]">
                                    Display<br />Bold
                                </span>
                            </div>
                            <div className="mt-[3cqw] flex gap-[1.8cqw]">
                                {SWATCHES.map((color, index) => (
                                    <span
                                        key={color}
                                        className={`design-canvas__swatch h-[7cqw] flex-1 rounded-[1.2cqw] ${live('design-canvas__swatch--run')}`.trimEnd()}
                                        style={{ ...play, background: color, boxShadow: `0 0 3cqw ${color}66`, animationDelay: `${index * 0.22}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </Layer>

                    {/* The craft: a pen-tool curve with its anchors and handles, in the
                        free corner above the brand card so it stays clear of the CTAs. */}
                    <Layer depth={70} className="inset-0">
                        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                            <defs>
                                <linearGradient id="design-canvas-pen" x1="0" x2="1" y1="0" y2="0">
                                    <stop offset="0" stopColor={COLORS.grape} />
                                    <stop offset="0.5" stopColor={COLORS.iris} />
                                    <stop offset="1" stopColor={COLORS.frost} />
                                </linearGradient>
                            </defs>
                            <path
                                d="M70 34 C70 20 80 30 87 21 S94 6 97 8"
                                pathLength="1"
                                fill="none"
                                stroke="url(#design-canvas-pen)"
                                strokeWidth="0.7"
                                strokeLinecap="round"
                                className={`design-canvas__pen ${live('design-canvas__pen--run')}`.trimEnd()}
                                style={play}
                            />
                            <line x1="80" y1="30" x2="94" y2="12" className="design-canvas__guide" />
                            {[[80, 30], [94, 12]].map(([cx, cy]) => (
                                <circle key={cx} cx={cx} cy={cy} r="0.9" className="design-canvas__knob" />
                            ))}
                            {[[70, 34], [87, 21], [97, 8]].map(([x, y]) => (
                                <rect key={x} x={x - 1.3} y={y - 1.3} width="2.6" height="2.6" className="design-canvas__anchor" />
                            ))}
                        </svg>
                    </Layer>

                    {/* A collaborator's cursor, moving from piece to piece. */}
                    <Layer depth={100} className="left-0 top-0">
                        <div
                            className={`design-canvas__cursor ${live('design-canvas__cursor--run')}`.trimEnd()}
                            style={play}
                        >
                            <svg viewBox="0 0 24 24" className="h-[5cqw] w-[5cqw]">
                                <path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill={COLORS.grape} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
                            </svg>
                            <span className="ml-[3.6cqw] mt-[-0.6cqw] block w-max rounded-full px-[1.8cqw] py-[0.6cqw] text-[2.2cqw] font-bold uppercase tracking-[0.12em] text-white" style={{ background: COLORS.grape }}>
                                UI / UX
                            </span>
                        </div>
                    </Layer>
                </motion.div>
            </motion.div>
        </div>
    );
}
