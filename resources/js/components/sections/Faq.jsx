import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { EASE } from '../../lib/motion';
import { SectionLabel } from '../ui/primitives';

/**
 * Expandable question list. One answer is open at a time; clicking the open
 * question closes it.
 *
 * @param {{ content?: { heading?: string, items?: Array<{ question?: string, answer?: string }> } }} props
 */
export default function Faq({ content }) {
    const reduce = useReducedMotion();
    const [openIndex, setOpenIndex] = useState(null);
    const items = content?.items ?? [];

    if (items.length === 0) return null;

    return (
        <section className="bg-[var(--bg)] section-pad">
            <div className="container-x max-w-3xl">
                <SectionLabel index="§" name={content?.heading || 'FAQ'} />
                <dl className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                    {items.map((item, index) => {
                        const open = openIndex === index;

                        return (
                            <div key={`${item.question}-${index}`}>
                                <dt>
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(open ? null : index)}
                                        aria-expanded={open}
                                        className="flex w-full items-center justify-between gap-6 py-5 text-left"
                                    >
                                        <span className="font-display text-[16px] font-bold text-[var(--ink-strong)]">
                                            {item.question}
                                        </span>
                                        <span
                                            aria-hidden
                                            className={`shrink-0 text-[18px] leading-none text-[var(--ink-faint)] transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
                                        >
                                            +
                                        </span>
                                    </button>
                                </dt>
                                <AnimatePresence initial={false}>
                                    {open && (
                                        <motion.dd
                                            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                                            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                                            transition={{ duration: 0.32, ease: EASE }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-6 text-[15px] leading-[1.75] text-[var(--mute)]">
                                                {item.answer}
                                            </p>
                                        </motion.dd>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </dl>
            </div>
        </section>
    );
}
