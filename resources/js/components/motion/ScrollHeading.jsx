import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Viewport tier for the scroll-linked heading treatment.
 * Mobile drops blur/skew/gradient-drift and softens the travel for performance.
 *
 * @return {{ compact: boolean, rich: boolean }}
 */
function useHeadingTier() {
    // Starts plain: the rich tier is opted into after measuring, so small screens never touch filter.
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
 * slight lift, small scale reduction, tighter tracking, soft fade — plus a
 * separate gradient drift for `.text-gradient` words so the brand colors stay
 * livelier than the solid text.
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
    const letterSpacing = useTransform(scrollYProgress, [0, 1], ['0em', `${(-0.014 * k).toFixed(4)}em`]);
    const skew = useTransform(scrollYProgress, [0, 1], [0, rich ? -0.6 * k : 0]);
    const blur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', `blur(${rich ? (1.2 * k).toFixed(2) : 0}px)`]);

    // Gradient words drift a touch further and slide their gradient ramp.
    const gradientShift = useTransform(scrollYProgress, [0, 1], ['50%', '100%']);
    const gradientX = useTransform(scrollYProgress, [0, 1], ['0px', `${rich ? (10 * k).toFixed(2) : 0}px`]);

    const active = enabled && !reduce;

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
                          skewY: skew,
                          filter: rich ? blur : undefined,
                          willChange: 'transform, opacity',
                          '--sh-ls': letterSpacing,
                          '--sh-grad': gradientShift,
                          '--sh-grad-x': gradientX,
                      }
                    : undefined
            }
        >
            {children}
        </motion.div>
    );
}
