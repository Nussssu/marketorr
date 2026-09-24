import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionLabel } from '../../components/ui/primitives';
import ScrollHeading from '../../components/motion/ScrollHeading';
import { transitionTo } from '../../components/motion/PageTransition';
import { useTapIntent } from '../../lib/tapIntent';
import { EASE } from '../../lib/motion';

/**
 * The All Work landing page.
 *
 * Two doors, nothing else: the practices are the choice here, and the projects
 * themselves live one level down inside whichever portfolio the reader picks.
 * Each door previews its own work as covers rather than describing it, so the
 * page stays visual and the reader knows what is behind it before clicking.
 */

/** One full pass of a door's strip, in seconds; matched to the header menu. */
const STRIP_SECONDS = 42;

function PortfolioDoor({ group, index, reduce }) {
    const tapIntent = useTapIntent();
    const previews = (group.items ?? []).filter((item) => item.image);
    const count = (group.items ?? []).length;

    const go = (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo(group.href);
    };

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : index * 0.1, ease: [...EASE] }}
        >
            <Link
                href={group.href}
                prefetch
                data-cursor="explore"
                onPointerDown={tapIntent.onPointerDown}
                onPointerCancel={tapIntent.onPointerCancel}
                onClick={go}
                aria-label={`${group.name}, ${count} projects`}
                className="group/door block overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-7 transition-colors duration-500 hover:border-[var(--field-line)] focus-visible:outline-none md:p-10"
            >
                <span className="flex items-center gap-3">
                    <span className="font-display text-[11px] font-bold tracking-[0.22em] text-[var(--ink-faint)]" aria-hidden>
                        0{index + 1}
                    </span>
                    <span
                        className="h-px w-8 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/door:w-16"
                        style={{ background: group.accent }}
                        aria-hidden
                    />
                </span>

                <span className="mt-6 flex items-baseline gap-4">
                    <span className="font-display text-[clamp(1.9rem,4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[var(--ink-strong)]">
                        {group.name}
                    </span>
                    <span
                        aria-hidden
                        className="shrink-0 -translate-x-1 text-[16px] leading-none text-[var(--ink-faint)] opacity-0 transition-all duration-300 group-hover/door:translate-x-0 group-hover/door:opacity-100"
                    >
                        &#8599;
                    </span>
                </span>

                <span className="mt-3 block text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                    {count} {count === 1 ? 'project' : 'projects'}
                </span>

                {previews.length > 0 && (
                    /* Same strip as the header menu: two identical halves travelling
                       exactly one half-width, so the wrap is invisible. No edge fade —
                       the covers run clean to both sides. */
                    <span className="mt-8 block overflow-hidden" aria-hidden>
                        <motion.span
                            className="flex w-max"
                            animate={reduce ? undefined : { x: ['0%', '-50%'] }}
                            transition={reduce ? undefined : { duration: STRIP_SECONDS, ease: 'linear', repeat: Infinity }}
                        >
                            {[false, true].map((duplicate) => (
                                <span key={duplicate ? 'duplicate' : 'primary'} className="flex shrink-0 gap-3 pr-3">
                                    {previews.map((item) => (
                                        <span
                                            key={`${duplicate ? 'duplicate-' : ''}${item.slug}`}
                                            className="block h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-[var(--line-soft)] bg-[var(--bg-soft)]"
                                        >
                                            <img
                                                src={item.image}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                draggable={false}
                                                className="h-full w-full object-cover"
                                            />
                                        </span>
                                    ))}
                                </span>
                            ))}
                        </motion.span>
                    </span>
                )}
            </Link>
        </motion.div>
    );
}

export default function WorkIndex({ groups = [] }) {
    const reduce = useReducedMotion();

    return (
        <>
            <Head title="Our Work — Marketorr" />
            <div className="bg-[var(--bg)] pb-28 pt-32">
                <div className="container-x">
                    <SectionLabel index="03" name="OUR WORK" />
                    <ScrollHeading className="mt-8">
                        <h1 className="display-lg uppercase text-[var(--ink-strong)]">
                            Work that <span className="text-gradient">creates impact.</span>
                        </h1>
                    </ScrollHeading>

                    <div className="mt-14 grid gap-6 md:mt-20 md:gap-8 lg:grid-cols-2">
                        {groups.map((group, index) => (
                            <PortfolioDoor key={group.slug} group={group} index={index} reduce={reduce} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
