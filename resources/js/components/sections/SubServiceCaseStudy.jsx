import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/motion';

/**
 * About / case-study narrative for a dedicated sub-service page.
 *
 * Each block pairs one idea (eyebrow, heading, body) with the exact Behance
 * visuals that document it — every image appears once, in its natural aspect
 * ratio, lazy-loaded below the fold. Headings stay a single solid colour, in
 * line with the Services pages. Purely presentational motion: fade and rise
 * on entry, parked under reduced motion.
 *
 * @param {{ study: { meta?: string, sections: Array<{ eyebrow: string, heading: string, body: string, images: Array<{ src: string, alt: string }> }> } }} props
 */
export default function SubServiceCaseStudy({ study }) {
    const reduce = useReducedMotion();
    const sections = study?.sections ?? [];

    if (sections.length === 0) return null;

    return (
        <section className="container-x pb-24 pt-4 lg:pb-32" aria-label="Case study">
            {study.meta && (
                <p className="border-t border-[var(--line)] pt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                    {study.meta}
                </p>
            )}
            <div className="mt-4 flex flex-col gap-16 sm:gap-20">
                {sections.map((section, sectionIndex) => (
                    <motion.article
                        key={`${section.eyebrow}-${sectionIndex}`}
                        initial={reduce ? false : { opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-8% 0px' }}
                        transition={{ duration: reduce ? 0 : 0.7, ease: [...EASE] }}
                    >
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                            {section.eyebrow}
                        </p>
                        <h2 className="font-display mt-3 max-w-3xl text-[clamp(1.6rem,4.5vw,2.75rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[var(--ink-strong)]">
                            {section.heading}
                        </h2>
                        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--mute)] sm:text-base">
                            {section.body}
                        </p>
                        {(section.images ?? []).length > 0 && (
                            <div
                                className={
                                    section.images.length > 2
                                        ? 'mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                                        : 'mt-8 grid gap-4 sm:grid-cols-2'
                                }
                            >
                                {section.images.map((image, imageIndex) => (
                                    <img
                                        key={image.src}
                                        src={image.src}
                                        alt={image.alt}
                                        loading={sectionIndex === 0 && imageIndex === 0 ? 'eager' : 'lazy'}
                                        decoding="async"
                                        draggable={false}
                                        className="h-auto w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
                                    />
                                ))}
                            </div>
                        )}
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
