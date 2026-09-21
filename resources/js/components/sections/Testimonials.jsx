import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/motion';
import { BRAND_SEQUENCE } from '../../lib/tokens';
import { SectionLabel } from '../ui/primitives';

/**
 * @param {{ content?: { heading?: string, items?: Array<{ quote?: string, author?: string, role?: string }> } }} props
 */
export default function Testimonials({ content }) {
    const reduce = useReducedMotion();
    const items = content?.items ?? [];

    if (items.length === 0) return null;

    return (
        <section className="bg-[var(--bg-soft)] section-pad">
            <div className="container-x">
                <SectionLabel index="§" name={content?.heading || 'Testimonials'} />
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                    {items.map((item, index) => (
                        <motion.figure
                            key={`${item.author}-${index}`}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-10% 0px' }}
                            transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
                            className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
                        >
                            <span
                                className="font-display text-[32px] leading-none"
                                style={{ color: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] }}
                                aria-hidden
                            >
                                “
                            </span>
                            <blockquote className="mt-3 flex-1 text-[15px] leading-[1.75] text-[var(--mute)]">
                                {item.quote}
                            </blockquote>
                            <figcaption className="mt-6 border-t border-[var(--line)] pt-4">
                                <p className="font-display text-[14px] font-bold text-[var(--ink-strong)]">{item.author}</p>
                                {item.role && <p className="mt-0.5 text-[12px] text-[var(--ink-faint)]">{item.role}</p>}
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
