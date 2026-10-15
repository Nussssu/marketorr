import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

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

const DESKTOP_CURSOR_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';
const TOUCH_POINTER_QUERY = '(any-pointer: coarse)';

/**
 * The hover layer over the native pointer. The pointer itself is the logo
 * mark (see `--cursor-default` in app.css) and nothing follows it around the
 * page; this only appears over something interactive: a gradient ring on
 * links and buttons, a larger one on calls to action, a VIEW disc on work
 * cards, an EXPLORE pill, and the platform's icon on social links. While a
 * labelled disc or pill is showing, the native pointer steps aside so it
 * never sits on top of the label.
 */
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
                document.documentElement.classList.remove('has-hover-cursor', 'cursor-bubble');
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
            document.documentElement.classList.remove('has-hover-cursor', 'cursor-bubble');
        };
    }, [reduce, x, y]);

    useEffect(() => {
        if (!enabled) return undefined;

        document.documentElement.classList.add('has-hover-cursor');

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
            document.documentElement.classList.remove('has-hover-cursor', 'cursor-bubble');
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
                if (kind === 'view' || kind === 'explore') return kind;
            }

            // Plain links, buttons and calls to action get no ring.
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

    const isView = state === 'view';
    const isExplore = state === 'explore';
    const socialPlatform = state.startsWith('social:') ? state.slice(7) : null;
    const isSocial = Boolean(socialPlatform);
    const isLabel = isView || isExplore;
    const active = state !== 'default';
    const covering = isLabel || isSocial;

    // The native pointer steps aside only while a label or icon fills the disc.
    useEffect(() => {
        if (!enabled) return undefined;
        document.documentElement.classList.toggle('cursor-bubble', covering);

        return () => document.documentElement.classList.remove('cursor-bubble');
    }, [enabled, covering]);

    if (!enabled) return null;

    const auraOpacity = !active ? 0 : isLabel ? 0.32 : state === 'cta' ? 0.8 : state === 'hover' ? 0.65 : 0.4;
    const auraScale = isLabel ? 1.15 : state === 'cta' ? 1.4 : state === 'hover' ? 1.25 : isSocial ? 1.3 : 1.05;

    // EXPLORE is a compact gradient pill; every other state stays circular.
    const width = isSocial ? 52 : isExplore ? 132 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;
    const height = isSocial ? 52 : isExplore ? 44 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;

    return (
        <>
            {/* soft brand glow behind the ring, only while hovering something */}
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
            {/* ring */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[10020] flex items-center justify-center rounded-full"
                style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
                animate={{
                    opacity: active ? 1 : 0,
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
