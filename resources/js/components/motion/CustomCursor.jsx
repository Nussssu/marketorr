import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
            if (t.closest?.('[data-cursor="view"]')) return setState('view');
            if (t.closest?.('[data-cursor="explore"]')) return setState('explore');
            if (t.closest?.('[data-cursor="cta"]')) return setState('cta');
            if (t.closest?.('a,button,[role=button]')) return setState('hover');
            setState('default');
        };
        window.addEventListener('mouseover', over, { passive: true });
        return () => window.removeEventListener('mouseover', over);
    }, [enabled]);

    if (!enabled) return null;

    const isView = state === 'view';
    const isExplore = state === 'explore';
    const isLabel = isView || isExplore;
    // EXPLORE is a compact gradient pill; every other state stays circular.
    const width = isExplore ? 132 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;
    const height = isExplore ? 44 : isView ? 88 : state === 'hover' ? 52 : state === 'cta' ? 64 : 36;

    return (
        <>
            {/* dot — theme ink so it stays visible on paper + void */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[200] h-1.5 w-1.5 rounded-full bg-[var(--ink)]"
                style={{ x, y, translateX: '-50%', translateY: '-50%' }}
            />
            {/* ring */}
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[199] flex items-center justify-center rounded-full"
                style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
                animate={{
                    width,
                    height,
                    backgroundColor: isView ? 'var(--ink)' : 'rgba(255,255,255,0)',
                    borderColor: isView ? 'var(--ink)' : state === 'default' ? 'var(--ink-faint)' : '#891FFB',
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
                {isExplore && (
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
                <span
                    className={`relative flex items-center gap-1.5 font-display text-[10px] font-bold tracking-[0.12em] ${isExplore ? 'text-white' : 'text-[var(--bg)]'}`}
                    style={{ opacity: isLabel ? 1 : 0 }}
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
                </span>
                {!isLabel && (
                    <span className="absolute inset-[3px] rounded-full border border-[var(--ink-faint)]" />
                )}
            </motion.div>
        </>
    );
}
