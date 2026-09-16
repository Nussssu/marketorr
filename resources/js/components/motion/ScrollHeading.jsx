import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Viewport tier for the scroll-linked heading treatment.
 * Mobile softens the travel while desktop keeps a restrained skew.
 *
 * @return {{ compact: boolean, rich: boolean }}
 */
function useHeadingTier() {
    // Starts plain so the first mobile frame never receives the richer transform.
    const [tier, setTier] = useState({ compact: false, rich: false });

    useEffect(() => {
        const compactQuery = window.matchMedia('(max-width: 767px)');
        const richQuery = window.matchMedia('(min-width: 768px)');
        const update = () => setTier({ compact: compactQuery.matches, rich: richQuery.matches });
        update();
        compactQuery.addEventListener('change', update);
        richQuery.addEventListener('change', update);

        return () => {
            compactQuery.removeEventListener('change', update);
            richQuery.removeEventListener('change', update);
        };
    }, []);

    return tier;
}

/**
 * Wraps a page's large first heading and drives a restrained, scroll-linked
 * exit on top of whatever entrance animation the heading already runs:
 * slight lift, small scale reduction and soft fade. The effect stays on
 * compositor-friendly transform and opacity properties while scrolling.
 *
 * @param {{
 *   children: import('react').ReactNode,
 *   className?: string,
 *   enabled?: boolean,
 *   intensity?: number,
 * }} props
 */
export default function ScrollHeading({ children, className = '', enabled = true, intensity = 1 }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { compact, rich } = useHeadingTier();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 15%', 'end start'] });

    const k = intensity * (compact ? 0.5 : 1);
    const y = useTransform(scrollYProgress, [0, 1], [0, -60 * k]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - 0.04 * k]);
    const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 1 - 0.45 * k]);
    const skew = useTransform(scrollYProgress, [0, 1], [0, rich ? -0.6 * k : 0]);

    const active = enabled && !reduce;

    // Skew remains desktop-only; every tier otherwise uses transform + opacity.
    const rest = rich ? { skewY: skew } : {};

    return (
        <motion.div
            ref={ref}
            className={`scroll-heading ${className}`.trim()}
            style={
                active
                    ? {
                          y,
                          scale,
                          opacity,
                          willChange: 'transform, opacity',
                          ...rest,
                      }
                    : undefined
            }
        >
            {children}
        </motion.div>
    );
}
