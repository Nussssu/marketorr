import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

/** Scroll-scrubbed rise + settle for section openers: drifts with the pass, never snaps. */
export default function ScrubRise({ children, className = '' }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 38%'] });
    const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
    const y = useTransform(eased, [0, 1], [reduce ? 0 : 46, 0]);
    const opacity = useTransform(eased, [0, 1], [0.15, 1]);

    if (reduce) return <div className={className}>{children}</div>;

    return (
        <motion.div ref={ref} style={{ y, opacity }} className={className}>
            {children}
        </motion.div>
    );
}
