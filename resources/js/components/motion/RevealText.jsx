import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/motion';

/**
 * Masked line-by-line reveal. `duration` and `stagger` are exposed so a
 * section can run a punchier version without changing the default cadence
 * every other heading on the site already uses.
 */
export default function RevealText({
    lines,
    className = '',
    lineClassName = '',
    delay = 0,
    stagger = 0.08,
    duration = 0.9,
    as: Tag = 'span',
}) {
    const reduce = useReducedMotion();
    const MTag = motion[Tag] ?? motion.span;
    return (
        <MTag
            className={className}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-10% 0px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
        >
            {lines.map((line, i) => (
                <span key={i} className={`mask-line ${lineClassName}`}>
                    <motion.span
                        className="mask-inner"
                        variants={{
                            hidden: { y: reduce ? '0%' : '110%' },
                            show: { y: '0%', transition: { duration, ease: [...EASE] } },
                        }}
                    >
                        {line}
                    </motion.span>
                </span>
            ))}
        </MTag>
    );
}
