import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/motion';

/**
 * How a section arrives on the landing page.
 *
 * The alternative to `CinematicScene`: instead of a section flying forward
 * out of 3D depth and then dimming and falling back as the next one arrives,
 * it simply lifts into place once — a short rise, a soft fade, and then it is
 * finished and completely still for as long as the reader is there.
 *
 * Two things matter about that:
 *
 * - It plays ONCE. Nothing re-animates on the way back up and nothing dims
 *   while it is still on screen, so scrolling the page never feels like it is
 *   taking the content away from you.
 * - It never transforms the section in 3D. No perspective, no rotation, no
 *   resting scale, which is what keeps type genuinely sharp rather than
 *   resampled, and leaves the section free to hold `position: sticky`
 *   children of its own.
 *
 * Each widget keeps its own internal motion exactly as it was — this only
 * governs the arrival of the block as a whole.
 */
export default function SectionAppear({ children, className = '' }) {
    const reduce = useReducedMotion();

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12, margin: '0px 0px -6% 0px' }}
            transition={{ duration: 0.8, ease: [...EASE] }}
        >
            {children}
        </motion.div>
    );
}
