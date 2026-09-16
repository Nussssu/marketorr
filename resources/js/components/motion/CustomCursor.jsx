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
        const fine = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
        const touch = window.matchMedia('(pointer: coarse)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!fine || touch || reduced || reduce) return;
        // Intentional one-time client capability gate (no SSR value available)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEnabled(true);
        document.documentElement.classList.add('cursor-none-desktop');

        const move = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        const down = () => setRipple((r) => r + 1);
        window.addEventListener('mousemove', move, { passive: true });
        window.addEventListener('mousedown', down);
        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mousedown', down);
            document.documentElement.classList.remove('cursor-none-desktop');
        };
    }, [x, y, reduce]);

    // Auto-detect interactive hover -> cursor state
    useEffect(() => {
        if (!enabled) return;
        const over = (e) => {
            const t = e.target;
            const social = t.closest?.('[data-social-platform]');
            if (social) return setState(`social:${social.dataset.socialPlatform}`);
            if (t.closest?.('[data-cursor="view"]')) return setState('view');
            if (t.closest?.('[data-cursor="cta"]')) return setState('cta');
            if (t.closest?.('[data-cursor="explore"]')) return setState('explore');
            if (t.closest?.('a,button,[role=button]')) return setState('hover');
            setState('default');
        };
        window.addEventListener('mouseover', over, { passive: true });
        return () => window.removeEventListener('mouseover', over);
    }, [enabled]);

    if (!enabled) return null;

    const isView = state === 'view';
    const isExplore = state === 'explore';
    const socialPlatform = state.startsWith('social:') ? state.slice(7) : null;
    const isSocial = Boolean(socialPlatform);
    const isLabel = isView || isExplore;
    // EXPLORE is a compact gradient pill; every other state stays circular.
    const width = isSocial ? 52 : isExplore ? 132 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;
    const height = isSocial ? 52 : isExplore ? 44 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;

    return (
        <>
            {/* dot — theme ink so it stays visible on paper + void */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[10021] h-1.5 w-1.5 rounded-full bg-[var(--ink)]"
                style={{ x, y, translateX: '-50%', translateY: '-50%' }}
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
                        opacity: state === 'default' || isLabel ? 0 : 0.55,
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
