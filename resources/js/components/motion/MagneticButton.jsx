import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useCallback } from 'react';
import { matchesCached, useBoxPointer } from '../../lib/pointer';

const COARSE_QUERY = '(max-width: 1023px), (pointer: coarse)';

/**
 * Button that leans toward the cursor.
 *
 * The offset lives in motion values rather than state: the pull is a transform
 * on one element, so pushing it through React would re-render the button and
 * everything inside it on every mouse move for a result the compositor can
 * handle on its own.
 */
export default function MagneticButton({ children, strength = 10, className = '', onClick }) {
    const reduce = useReducedMotion();
    const limit = Math.min(strength, 6);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const pullX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.4 });
    const pullY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.4 });

    const apply = useCallback((fx, fy) => {
        if (matchesCached(COARSE_QUERY)) return;

        x.set(Math.max(-limit, Math.min(limit, (fx - 0.5) * 2 * limit)));
        y.set(Math.max(-limit, Math.min(limit, (fy - 0.5) * 2 * limit)));
    }, [limit, x, y]);

    const pointer = useBoxPointer(apply, { enabled: !reduce });

    const release = (event) => {
        pointer.onPointerLeave(event);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={`inline-block ${className}`}
            style={{ x: pullX, y: pullY }}
            onPointerEnter={pointer.onPointerEnter}
            onPointerMove={pointer.onPointerMove}
            onPointerLeave={release}
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
        >
            {children}
        </motion.div>
    );
}
