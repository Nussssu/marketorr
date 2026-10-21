import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { transitionTo } from '../motion/PageTransition';
import { EASE } from '../../lib/motion';
import { fillPageText } from '../../lib/subServicePage';
import { useTapIntent } from '../../lib/tapIntent';

/**
 * One piece of related work: its cover, name and discipline, linking to the
 * project (a Branding project page, or the UI/UX portfolio opened on it).
 */
function WorkCard({ work, index, reduce, onOpen, tapIntent }) {
    return (
        <motion.li
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : index * 0.08, ease: [...EASE] }}
        >
            <Link
                href={work.href}
                data-cursor="view"
                onPointerDown={tapIntent.onPointerDown}
                onPointerCancel={tapIntent.onPointerCancel}
                onClick={(event) => onOpen(event, work.href)}
                className="group block"
            >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)]">
                    <img
                        src={work.image}
                        alt={work.imageAlt}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.04]"
                    />
                </div>
                <div className="mt-2.5 flex items-start justify-between gap-2 sm:mt-4 sm:gap-3">
                    <div className="min-w-0">
                        <h3 className="font-display text-[12px] font-bold uppercase leading-tight tracking-[0.03em] text-[var(--ink-strong)] sm:text-[15px] sm:leading-normal sm:tracking-[0.04em]">{work.title}</h3>
                        {work.meta && (
                            <p className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)] sm:text-[11px] sm:tracking-[0.16em]">{work.meta}</p>
                        )}
                    </div>
                    <span className="mt-0.5 text-[12px] text-[var(--ink-faint)] transition-transform sm:text-base duration-300 group-hover:translate-x-1 group-hover:text-[var(--ink)]" aria-hidden>→</span>
                </div>
            </Link>
        </motion.li>
    );
}

/**
 * Real Marketorr work related to this sub-service, picked on the server by
 * `App\Services\SubServiceRelatedWork` from the portfolio that presents the
 * discipline — Branding projects for Branding services, the UI/UX showcase
 * for UI/UX services. Each card opens the project.
 *
 * @param {{ item: { name: string, category: { slug: string, name: string }, relatedWork?: Array<{ slug: string, title: string, meta: string, image: string, imageAlt: string, href: string }> } }} props
 */
export default function SubServiceWork({ item }) {
    const reduce = useReducedMotion();
    const tapIntent = useTapIntent();
    const work = item.relatedWork ?? [];

    if (work.length === 0) {
        return null;
    }

    const portfolioHref = `/work/portfolio/${item.category.slug === 'ui-ux' ? 'uiux' : 'branding'}`;

    const open = (event, href) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo(href);
    };

    return (
        <section className="mt-14" aria-labelledby="related-work-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">{fillPageText(item.page?.work_label, item)}</p>
                    <h2 id="related-work-heading" className="mt-3 font-display text-2xl font-bold uppercase text-[var(--ink-strong)] md:text-3xl">
                        {fillPageText(item.page?.work_heading, item)}
                    </h2>
                </div>
                <Link
                    href={portfolioHref}
                    data-cursor="explore"
                    onPointerDown={tapIntent.onPointerDown}
                    onPointerCancel={tapIntent.onPointerCancel}
                    onClick={(event) => open(event, portfolioHref)}
                    className="btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]"
                >
                    {fillPageText(item.page?.portfolio_label, item)} →
                </Link>
            </div>

            {/* Two cards per row on phones and tablets, four on desktop. */}
            <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
                {work.map((entry, index) => (
                    <WorkCard key={entry.slug} work={entry} index={index} reduce={reduce} onOpen={open} tapIntent={tapIntent} />
                ))}
            </ul>
        </section>
    );
}
