import { Link, router } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import PageMeta from '../../components/PageMeta';
import SectionRenderer from '../../components/sections/SectionRenderer';
import { GradientTitle, SectionLabel } from '../../components/ui/primitives';
import ScrollHeading from '../../components/motion/ScrollHeading';
import { transitionTo } from '../../components/motion/PageTransition';
import { useTapIntent } from '../../lib/tapIntent';
import { EASE, enter } from '../../lib/motion';

/**
 * The All Work landing page.
 *
 * Two doors, nothing else: the practices are the choice here, and the projects
 * themselves live one level down inside whichever portfolio the reader picks.
 * Each door is a full-width panel that pins while the next one slides over it,
 * and previews its own work as a drifting cover mosaic rather than describing
 * it, so the reader knows what is behind it before clicking.
 */

/** How many covers a door's mosaic shows, split across its two columns. */
const MOSAIC_COVERS = 8;

/** Stacked doors pin below the header, each a step lower than the last. */
const PIN_TOP_PX = 104;
const PIN_STEP_PX = 20;

function MosaicColumn({ items, y, offset = false }) {
    return (
        <motion.div style={{ y }} className={`flex flex-col gap-3 md:gap-4 ${offset ? 'pt-16' : ''}`.trimEnd()}>
            {/* listed twice so the column still fills its frame at either end of the drift */}
            {[...items, ...items].map((item, i) => (
                <span
                    key={`${item.slug}-${i}`}
                    className="block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-[var(--line-soft)] bg-[var(--bg-soft)] md:rounded-2xl"
                >
                    <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/door:scale-[1.04]"
                    />
                </span>
            ))}
        </motion.div>
    );
}

/**
 * @param {{ progress: import('framer-motion').MotionValue<number> }} props
 *   `progress` runs 0 -> 1 across the whole stack of doors. Each door owns an
 *   equal slice of it: over that slice its mosaic drifts and, once the next
 *   door starts sliding over it, it sinks back and dims underneath.
 */
function PortfolioDoor({ group, index, total, reduce, progress, content = {} }) {
    const tapIntent = useTapIntent();
    const destinationPreloaded = useRef(false);
    const previews = (group.items ?? []).filter((item) => item.image).slice(0, MOSAIC_COVERS);
    const count = (group.items ?? []).length;
    // Edited under Admin > Pages > Our Work; each falls back to the copy the page always had.
    const title = content[`${group.slug}Title`] || group.name;
    const countText = String((count === 1 ? content.countLabelOne : content.countLabel) || (count === 1 ? '{count} project' : '{count} projects'))
        .replaceAll('{count}', String(count));
    const openLabel = content.openLabel || 'Open portfolio';
    const isLast = index === total - 1;

    const sliceStart = index / total;
    const sliceEnd = (index + 1) / total;
    const columnUp = useTransform(progress, [sliceStart - 0.5 / total, sliceEnd], reduce ? [0, 0] : [60, -160]);
    const columnDown = useTransform(progress, [sliceStart - 0.5 / total, sliceEnd], reduce ? [0, 0] : [-140, 40]);
    const sink = useTransform(progress, [sliceStart, sliceEnd], reduce || isLast ? [1, 1] : [1, 0.92]);
    const dim = useTransform(progress, [sliceStart, sliceEnd], reduce || isLast ? [0, 0] : [0, 0.6]);

    const preloadDestination = () => {
        if (destinationPreloaded.current) return;

        destinationPreloaded.current = true;
        router.prefetch(group.href, {}, { cacheFor: '1m' });
        import('./Portfolio.jsx').catch((error) => {
            destinationPreloaded.current = false;
            console.error('Unable to preload the work portfolio page.', error);
        });
    };

    const go = (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo(group.href);
    };

    const left = previews.filter((_, i) => i % 2 === 0);
    const right = previews.filter((_, i) => i % 2 === 1);

    return (
        <motion.div
            className="lg:sticky"
            style={{ top: PIN_TOP_PX + index * PIN_STEP_PX, scale: sink, transformOrigin: '50% 0%' }}
            initial={reduce ? false : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [...EASE] }}
        >
            <Link
                href={group.href}
                data-cursor="explore"
                onPointerEnter={preloadDestination}
                onFocus={preloadDestination}
                onPointerDown={(event) => {
                    preloadDestination();
                    tapIntent.onPointerDown(event);
                }}
                onPointerCancel={tapIntent.onPointerCancel}
                onClick={go}
                aria-label={`${title}, ${countText}`}
                className="group/door relative grid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] transition-colors duration-500 hover:border-[var(--field-line)] focus-visible:outline-none lg:h-[min(76svh,720px)] lg:grid-cols-12"
            >
                {/* the practice's own colour, pooled behind its title */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-25 blur-[120px] transition-opacity duration-700 group-hover/door:opacity-45"
                    style={{ background: group.accent }}
                />

                <span className="relative flex flex-col justify-between gap-10 p-8 md:p-12 lg:col-span-5">
                    <span className="flex items-center gap-3">
                        <span
                            className="h-px w-8 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/door:w-16"
                            style={{ background: group.accent }}
                            aria-hidden
                        />
                    </span>

                    <span className="block">
                        <span className="block font-display text-[clamp(2.4rem,5.2vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-[var(--ink-strong)]">
                            <GradientTitle text={title} />
                        </span>
                        <span className="mt-5 block text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                            {countText}
                        </span>
                    </span>

                    <span className="inline-flex w-max items-center gap-3 rounded-full border border-[var(--field-line)] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 group-hover/door:border-transparent group-hover/door:bg-[var(--invert-btn-hover)] group-hover/door:text-[var(--bg)]">
                        {openLabel}
                        <span aria-hidden className="transition-transform duration-300 group-hover/door:-translate-y-0.5 group-hover/door:translate-x-0.5">
                            &#8599;
                        </span>
                    </span>
                </span>

                {previews.length > 0 && (
                    <span
                        aria-hidden
                        className="relative block h-[22rem] overflow-hidden border-t border-[var(--line-soft)] md:h-[28rem] lg:col-span-7 lg:h-auto lg:border-l lg:border-t-0"
                    >
                        <span className="absolute inset-x-5 -top-10 grid grid-cols-2 gap-3 md:inset-x-8 md:gap-4">
                            <MosaicColumn items={left} y={columnUp} />
                            <MosaicColumn items={right} y={columnDown} offset />
                        </span>
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--surface)] to-transparent" />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--surface)] to-transparent" />
                    </span>
                )}

                {/* darkens this door as the next one slides over it */}
                <motion.span aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--bg)]" style={{ opacity: dim }} />
            </Link>
        </motion.div>
    );
}

/** The page title, set as one oversized word whose letters rise in turn. */
function WorkTitle({ reduce, text }) {
    const letters = [...text];

    return (
        <h1 className="heading-hero-size mt-8 font-display font-extrabold uppercase leading-[0.8] tracking-[-0.055em] text-[var(--ink-strong)]">
            <span className="sr-only">{text}</span>
            <span aria-hidden className="flex overflow-hidden pb-[0.04em]">
                {[...letters, '.'].map((letter, i) => (
                    <span
                        key={i}
                        {...enter('mask-up', { dur: 1, delay: 0.12 + i * 0.07, y: '105%', className: `inline-block ${letter === '.' ? 'text-gradient' : ''}` })}
                    >
                        {letter}
                    </span>
                ))}
            </span>
        </h1>
    );
}

function WorkDirectory({ groups = [], content = {} }) {
    const reduce = useReducedMotion();
    const stackRef = useRef(null);
    const { scrollYProgress: stackProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] });
    const totalProjects = groups.reduce((sum, group) => sum + (group.items ?? []).length, 0);
    const intro = String(content.intro ?? '')
        .replaceAll('{projects}', String(totalProjects))
        .replaceAll('{practices}', String(groups.length));

    return (
        <div className="bg-[var(--bg)] pb-28 pt-32">
                <div className="container-x">
                    {content.heading && <SectionLabel name={content.heading.toUpperCase()} />}
                    <ScrollHeading>
                        <WorkTitle reduce={reduce} text={content.title || content.heading || ''} />
                    </ScrollHeading>
                    <div {...enter('fade-up', { dur: 0.8, delay: 0.5, className: 'mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-[var(--line)] pt-6' })}>
                        <p className="max-w-md text-[16px] leading-relaxed text-[var(--mute)]">
                            {intro}
                        </p>
                        {content.scrollHint && (
                            <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                                {content.scrollHint}
                            </p>
                        )}
                    </div>

                    {/* One shared parent, so every door stays pinned until the stack ends
                        and each later door slides over the one before it. */}
                    <div ref={stackRef} className="relative mt-16 flex flex-col gap-6 md:mt-24 lg:gap-[34svh]">
                        {groups.map((group, index) => (
                            <PortfolioDoor
                                key={group.slug}
                                group={group}
                                index={index}
                                total={groups.length}
                                reduce={reduce}
                                progress={stackProgress}
                                content={content}
                            />
                        ))}
                    </div>
                </div>
        </div>
    );
}

export default function WorkIndex({ groups = [], page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="Our Work | Marketorr" />
            {(page?.sections ?? []).map((section) => (
                section.type === 'work' ? (
                    <WorkDirectory key={section.id} groups={groups} content={section.content} />
                ) : (
                    <SectionRenderer key={section.id} sections={[section]} />
                )
            ))}
        </>
    );
}
