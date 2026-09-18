import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../lib/theme';

function SocialIcon({ platform }) {
    const commonProps = {
        className: 'h-full w-full',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
    };

    if (platform === 'LinkedIn') {
        return (
            <svg {...commonProps}>
                <rect x="3" y="3" width="18" height="18" rx="2.5" />
                <path d="M7.5 10v7M7.5 7.25v.1M11.5 17v-4a3 3 0 0 1 6 0v4M11.5 10v7" />
            </svg>
        );
    }

    if (platform === 'Facebook') {
        return (
            <svg {...commonProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M13.5 20.8v-7h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.7-.1-1.4-.2-2.1-.2-2.1 0-3.6 1.3-3.6 3.8V11H8.3v2.8h2.4v7" />
            </svg>
        );
    }

    if (platform === 'Behance') {
        return (
            <svg {...commonProps}>
                <path d="M3.5 6.5h5a3 3 0 0 1 0 6h-5zM3.5 12.5h5.75a3.25 3.25 0 0 1 0 6.5H3.5zM14.5 7h5" />
                <path d="M20.5 15.5h-7a3.5 3.5 0 1 0 6.35 2" />
            </svg>
        );
    }

    if (platform === 'Dribbble') {
        return (
            <svg {...commonProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M7.2 4.4c3.1 3.8 5.8 8.2 7.5 14.8M3.2 10.4c4.7.1 9.2-1.2 12.5-4.1M5.4 17.8c2.5-3.6 6.7-5.4 15.4-4.4" />
            </svg>
        );
    }

    return (
        <svg {...commonProps}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.4" cy="6.7" r=".8" fill="currentColor" stroke="none" />
        </svg>
    );
}

/**
 * Trail palette, purple first.
 *
 * The purple is Marketorr's #891FFB eased toward white just far enough to stay
 * soft under additive blending - it still reads as the brand purple, which the
 * fully pastel version did not. Blue and cyan are pulled further still, so
 * they support the purple rather than competing with it.
 */
const TRAIL_RGB = ['168,85,251', '150,180,250', '150,225,240'];

/**
 * Which colour each successive mote takes, as indices into `TRAIL_RGB`.
 *
 * Purple is five of every eight, so it stays the colour of the trail whatever
 * speed the cursor moves at, while blue and cyan keep appearing often enough
 * to read as accents rather than as stray dots. A fixed pattern rather than a
 * weighted random: randomness clumps, and a clump of cyan would break it.
 */
const TRAIL_SEQUENCE = [0, 0, 1, 0, 0, 2, 0, 1];

/** How far each mote's core is lifted toward white, for an airy centre. */
const CORE_WHITEN = 0.42;
const TRAIL_MAX = 120;
/**
 * Share of the gap between cursor and trail head closed per 60fps frame.
 *
 * High enough that the trail never feels like lag, low enough that it reads as
 * something following the cursor rather than glued to it.
 */
const FOLLOW = 0.3;
const DESKTOP_CURSOR_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';
const TOUCH_POINTER_QUERY = '(any-pointer: coarse)';

/**
 * Pre-rendered radial glow sprite — stamping these with drawImage is far
 * cheaper than shadowBlur per particle, so the trail stays at 60fps.
 *
 * The falloff carries a wide, faint outer shoulder as well as a bright core,
 * so each mote reads as a soft glow instead of a disc with a hard edge. That
 * shoulder is why the trail stays visible against both themes without any
 * shadow, filter or second pass.
 *
 * The core is mixed toward white before the hue takes over, which is what
 * gives the trail its soft white-blue centre rather than a dot of flat colour.
 */
function makeGlowSprite(rgb) {
    const size = 64;
    const [r, g, b] = rgb.split(',').map(Number);
    const toward = (channel) => Math.round(channel + (255 - channel) * CORE_WHITEN);
    const core = `${toward(r)},${toward(g)},${toward(b)}`;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${core},0.98)`);
    gradient.addColorStop(0.18, `rgba(${rgb},0.86)`);
    gradient.addColorStop(0.42, `rgba(${rgb},0.54)`);
    gradient.addColorStop(0.68, `rgba(${rgb},0.26)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return canvas;
}

/**
 * Brand particle trail: a fixed, pointer-transparent canvas that releases
 * soft fading glow motes as the pointer travels - mostly brand purple, with
 * blue and cyan threaded through it. Additive blending in dark theme lets overlapping motes bloom
 * toward white; light theme composites normally and carries a little less
 * alpha, so the trail stays airy on pale surfaces rather than turning milky. One rAF loop, capped DPR and particle pool, paused when the tab
 * hides — scrolling, layout and existing animations are never touched.
 */
function CursorTrail() {
    const canvasRef = useRef(null);
    const themeRef = useRef('dark');
    const { theme } = useTheme();

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        const sprites = TRAIL_RGB.map(makeGlowSprite);
        const dpr = Math.min(1.5, window.devicePixelRatio || 1);
        const particles = [];
        let raf = 0;
        let running = false;
        let startTrail = () => {};
        // `pending` is where the cursor actually is; `head` is where the trail
        // is being drawn from, easing toward it a fraction of the gap each
        // frame. That easing is what makes the ribbon follow the cursor rather
        // than being stamped underneath it, and it absorbs the jitter of a
        // high-polling mouse. `last` is the head a frame ago, so motes can be
        // laid along the path travelled instead of at a single point.
        let lastX = -1;
        let lastY = -1;
        let headX = -1;
        let headY = -1;
        let pendingX = -1;
        let pendingY = -1;
        let colorIndex = 0;

        const resize = () => {
            canvas.width = Math.round(window.innerWidth * dpr);
            canvas.height = Math.round(window.innerHeight * dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };
        resize();
        window.addEventListener('resize', resize);

        const resetPointer = () => {
            lastX = -1;
            lastY = -1;
            headX = -1;
            headY = -1;
            pendingX = -1;
            pendingY = -1;
        };
        // The pointer reports far more often than the screen repaints, so the
        // handler only records where the cursor is. Spawning happens once per
        // frame, from the travel since the frame before — the trail looks the
        // same and the input thread stays free.
        const onMove = (event) => {
            if (event.pointerType !== 'mouse') {
                resetPointer();
                particles.length = 0;

                return;
            }

            pendingX = event.clientX;
            pendingY = event.clientY;
            startTrail();
        };

        const spawn = (dt) => {
            if (pendingX < 0) return;

            // First sight of the cursor: start the head under it, so the trail
            // never sweeps in from wherever it was left.
            if (headX < 0) {
                headX = pendingX;
                headY = pendingY;
                lastX = headX;
                lastY = headY;

                return;
            }

            // Frame-rate independent easing: the same fraction of the gap is
            // closed per unit of time whatever the refresh rate.
            const ease = 1 - Math.pow(1 - FOLLOW, dt);
            headX += (pendingX - headX) * ease;
            headY += (pendingY - headY) * ease;

            const x = headX;
            const y = headY;

            if (lastX >= 0) {
                const dx = x - lastX;
                const dy = y - lastY;
                const travel = Math.hypot(dx, dy);
                if (travel > 1.1) {
                    // Spread spawns along the frame's travel segment so fast
                    // flicks leave a continuous ribbon instead of dotted gaps.
                    const count = travel > 30 ? 5 : travel > 12 ? 4 : 3;
                    for (let i = 0; i < count && particles.length < TRAIL_MAX; i++) {
                        colorIndex = (colorIndex + 1) % TRAIL_SEQUENCE.length;
                        const t = (i + 1) / count;
                        particles.push({
                            x: lastX + dx * t + (Math.random() - 0.5) * 3,
                            y: lastY + dy * t + (Math.random() - 0.5) * 3,
                            vx: -dx * 0.03 + (Math.random() - 0.5) * 0.4,
                            vy: -dy * 0.03 + (Math.random() - 0.5) * 0.4,
                            life: 1,
                            decay: 0.011 + Math.random() * 0.01,
                            size: 16 + Math.random() * 17,
                            sprite: sprites[TRAIL_SEQUENCE[colorIndex]],
                        });
                    }
                }
            }

            lastX = x;
            lastY = y;
        };
        const onPointerDown = (event) => {
            if (event.pointerType === 'mouse') return;

            resetPointer();
            particles.length = 0;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });
        window.addEventListener('pointercancel', resetPointer, { passive: true });
        document.documentElement.addEventListener('mouseleave', resetPointer);

        let lastTime = performance.now();
        let idleFrames = 0;
        const frame = (time) => {
            if (!running) return;
            const dt = Math.min(50, time - lastTime) / 16.667;
            lastTime = time;
            spawn(dt);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            if (particles.length > 0) {
                const dark = themeRef.current !== 'light';
                ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.life -= p.decay * dt;
                    if (p.life <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.vx *= 0.985;
                    p.vy *= 0.985;
                    const size = p.size * (0.42 + 0.58 * p.life);
                    // Smoothstep rather than the raw life: the curve flattens
                    // at both ends, so a mote eases in and, more importantly,
                    // thins away to nothing instead of winking out.
                    const fade = p.life * p.life * (3 - 2 * p.life);
                    ctx.globalAlpha = fade * (dark ? 0.78 : 0.58);
                    ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size);
                }
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
            }
            const settling = headX >= 0 && Math.hypot(pendingX - headX, pendingY - headY) > 0.5;

            if (particles.length > 0 || settling) {
                idleFrames = 0;
                raf = requestAnimationFrame(frame);
            } else if (idleFrames < 12) {
                // Keep the loop alive briefly so the next move spawns on the
                // very next frame instead of waiting for a restart.
                idleFrames += 1;
                raf = requestAnimationFrame(frame);
            } else {
                running = false;
            }
        };
        startTrail = () => {
            idleFrames = 0;
            if (running || document.hidden) return;

            running = true;
            lastTime = performance.now();
            raf = requestAnimationFrame(frame);
        };
        const onVisibility = () => {
            if (document.hidden) {
                running = false;
                cancelAnimationFrame(raf);
                particles.length = 0;
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            running = false;
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointercancel', resetPointer);
            document.documentElement.removeEventListener('mouseleave', resetPointer);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[10019]" aria-hidden />
    );
}

export default function CustomCursor() {
    const reduce = useReducedMotion();
    const [enabled, setEnabled] = useState(false);
    const [state, setState] = useState('default');
    const [ripple, setRipple] = useState(0);
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const rx = useSpring(x, { stiffness: 420, damping: 38, mass: 0.6 });
    const ry = useSpring(y, { stiffness: 420, damping: 38, mass: 0.6 });

    useEffect(() => {
        const desktopCursor = window.matchMedia(DESKTOP_CURSOR_QUERY);
        const touchPointer = window.matchMedia(TOUCH_POINTER_QUERY);

        const updateCapability = () => {
            const hasTouchInput = navigator.maxTouchPoints > 0;
            const shouldEnable = desktopCursor.matches && !touchPointer.matches && !hasTouchInput && !reduce;
            setEnabled(shouldEnable);

            if (!shouldEnable) {
                document.documentElement.classList.remove('cursor-none-desktop');
                x.set(-100);
                y.set(-100);
                setState('default');
            }
        };

        updateCapability();
        desktopCursor.addEventListener('change', updateCapability);
        touchPointer.addEventListener('change', updateCapability);

        return () => {
            desktopCursor.removeEventListener('change', updateCapability);
            touchPointer.removeEventListener('change', updateCapability);
            document.documentElement.classList.remove('cursor-none-desktop');
        };
    }, [reduce, x, y]);

    useEffect(() => {
        if (!enabled) return undefined;

        document.documentElement.classList.add('cursor-none-desktop');

        const hide = () => {
            x.set(-100);
            y.set(-100);
            setState('default');
        };
        const move = (event) => {
            if (event.pointerType !== 'mouse') {
                hide();

                return;
            }

            x.set(event.clientX);
            y.set(event.clientY);
        };
        const down = (event) => {
            if (event.pointerType !== 'mouse') {
                hide();

                return;
            }

            setRipple((current) => current + 1);
        };
        const onVisibilityChange = () => {
            if (document.hidden) hide();
        };

        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerdown', down, { passive: true });
        window.addEventListener('pointercancel', hide, { passive: true });
        window.addEventListener('blur', hide);
        document.documentElement.addEventListener('mouseleave', hide);
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerdown', down);
            window.removeEventListener('pointercancel', hide);
            window.removeEventListener('blur', hide);
            document.documentElement.removeEventListener('mouseleave', hide);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            document.documentElement.classList.remove('cursor-none-desktop');
            hide();
        };
    }, [enabled, x, y]);

    // Auto-detect interactive hover -> cursor state
    useEffect(() => {
        if (!enabled) return undefined;

        // One walk up the tree, and a write only when the answer changed:
        // `mouseover` fires for every element the pointer crosses, and most
        // of those crossings resolve to the state the cursor is already in.
        const resolve = (target) => {
            const social = target.closest?.('[data-social-platform]');
            if (social) return `social:${social.dataset.socialPlatform}`;

            const marked = target.closest?.('[data-cursor]');
            if (marked) {
                const kind = marked.dataset.cursor;
                if (kind === 'view' || kind === 'cta' || kind === 'explore') return kind;
            }

            if (target.closest?.('a,button,[role=button]')) return 'hover';

            return 'default';
        };

        let frame = 0;
        let pending = null;
        const over = (event) => {
            pending = event.target;
            if (frame) return;

            frame = requestAnimationFrame(() => {
                frame = 0;
                const next = resolve(pending);
                setState((current) => (current === next ? current : next));
            });
        };

        window.addEventListener('mouseover', over, { passive: true });

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('mouseover', over);
        };
    }, [enabled]);

    if (!enabled) return null;

    const isView = state === 'view';
    const isExplore = state === 'explore';
    const socialPlatform = state.startsWith('social:') ? state.slice(7) : null;
    const isSocial = Boolean(socialPlatform);
    const isLabel = isView || isExplore;
    const auraOpacity = isLabel ? 0.32 : state === 'cta' ? 0.8 : state === 'hover' ? 0.65 : isSocial ? 0.4 : 0.45;
    const auraScale = isLabel ? 1.15 : state === 'cta' ? 1.4 : state === 'hover' ? 1.25 : isSocial ? 1.3 : 1.05;

    // EXPLORE is a compact gradient pill; every other state stays circular.
    const width = isSocial ? 52 : isExplore ? 132 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;
    const height = isSocial ? 52 : isExplore ? 44 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;

    return (
        <>
            <CursorTrail />
            {/* ambient aura — soft brand glow trailing the cursor */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[10018] h-28 w-28 rounded-full blur-2xl"
                style={{
                    x: rx,
                    y: ry,
                    translateX: '-50%',
                    translateY: '-50%',
                    background: 'linear-gradient(135deg, rgba(137,31,251,0.5), rgba(80,122,244,0.4), rgba(27,226,235,0.4))',
                }}
                animate={{ opacity: auraOpacity, scale: auraScale }}
                transition={{ duration: 0.25 }}
            />
            {/* dot — gradient orb so the point itself carries the brand */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[10021] h-2.5 w-2.5 rounded-full"
                style={{
                    x,
                    y,
                    translateX: '-50%',
                    translateY: '-50%',
                    background: 'linear-gradient(135deg,#891FFB,#507AF4 55%,#1BE2EB)',
                    boxShadow: '0 0 14px rgba(137,31,251,0.95), 0 0 34px rgba(80,122,244,0.6), 0 0 60px rgba(27,226,235,0.35)',
                }}
                animate={{ opacity: isSocial ? 0 : 1 }}
                transition={{ duration: 0.2 }}
            />
            {/* ring */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[10020] flex items-center justify-center rounded-full"
                style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
                animate={{
                    width,
                    height,
                    backgroundColor: isView ? 'var(--ink)' : 'rgba(255,255,255,0)',
                    borderColor: isSocial ? 'rgba(255,255,255,0)' : isView ? 'var(--ink)' : state === 'default' ? 'var(--ink-faint)' : '#891FFB',
                    scale: ripple ? [1, 1.35, 1] : 1,
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
                <span
                    className="absolute inset-0 rounded-full"
                    style={{
                        background:
                            state === 'hover' || state === 'cta'
                                ? 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)'
                                : 'transparent',
                        filter: 'blur(10px)',
                        opacity: state === 'default' || isLabel ? 0 : 0.7,
                    }}
                />
                {(isExplore || isSocial) && (
                    <motion.span
                        className="absolute inset-0 rounded-full"
                        initial={{ opacity: 0, backgroundPositionX: '0%' }}
                        animate={{ opacity: 1, backgroundPositionX: '100%' }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            backgroundImage: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)',
                            backgroundSize: '160% 100%',
                            boxShadow: '0 10px 30px -10px rgba(137,31,251,0.55), 0 6px 20px -8px rgba(27,226,235,0.45)',
                        }}
                    />
                )}
                <motion.span
                    className={`absolute inset-0 flex items-center justify-center gap-1.5 font-display text-[10px] font-bold tracking-[0.12em] ${isExplore ? 'text-white' : 'text-[var(--bg)]'}`}
                    animate={{ opacity: isLabel ? 1 : 0, scale: isLabel ? 1 : 0.75 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    {isView ? 'VIEW' : isExplore ? 'EXPLORE' : ''}
                    {isExplore && (
                        <motion.span
                            aria-hidden
                            className="text-[11px] leading-none"
                            initial={{ x: 0 }}
                            animate={{ x: 5 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            ↗
                        </motion.span>
                    )}
                </motion.span>
                {isSocial && (
                    <motion.span
                        key={socialPlatform}
                        className="absolute h-5 w-5 text-white"
                        initial={{ opacity: 0, scale: 0.65 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <SocialIcon platform={socialPlatform} />
                    </motion.span>
                )}
                {!isLabel && !isSocial && (
                    <span className="absolute inset-[3px] rounded-full border border-[var(--ink-faint)]" />
                )}
            </motion.div>
        </>
    );
}
