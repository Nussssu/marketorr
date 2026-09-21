import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/motion';
import { BRAND_SEQUENCE } from '../../lib/tokens';
import { SectionLabel } from '../ui/primitives';

/**
 * @param {{ content?: { heading?: string, items?: Array<{ title?: string, body?: string, accent?: string }> } }} props
 */
export default function Features({ content }) {
    const reduce = useReducedMotion();
    const items = content?.items ?? [];

    if (items.length === 0) return null;

    return (
        <section className="bg-[var(--bg)] section-pad">
            <div className="container-x">
                <SectionLabel index="§" name={content?.heading || 'Features'} />
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, index) => (
                        <motion.article
                            key={`${item.title}-${index}`}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-10% 0px' }}
                            transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
                            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
                        >
                            <span
                                className="block h-1 w-10 rounded-full"
                                style={{ background: item.accent || BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] }}
                                aria-hidden
                            />
                            <h3 className="mt-5 font-display text-[18px] font-bold text-[var(--ink-strong)]">{item.title}</h3>
                            <p className="mt-2.5 text-[15px] leading-[1.7] text-[var(--mute)]">{item.body}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
