import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import { MARK, markBarStyle, markGap } from '../../lib/tokens';
import RichContent from '../ui/RichContent';

/** Height of the pinned frame's mark (its tallest bar); it keeps the logo's proportions. */
const PINNED_MARK_SIZE = 'min(46svh, 22rem, 27vw)';

/** Height of the tallest bar beside each stage on phones. */
const STACKED_MARK_SIZE = '3.25rem';

/** Scroll distance each stage holds the pinned frame for, in viewport heights. */
const STAGE_SVH = 90;

/** Stages take the logo's bar colours in turn. */
const stageColor = (index) => MARK.colors[index % MARK.colors.length];

/**
 * One bar of the growing mark, in the logo's shape: fills over its own
 * stage's slice of the scroll.
 */
function StageBar({ index, total, progress }) {
    const scaleY = useTransform(progress, [index / total, (index + 1) / total], [0.06, 1]);

    return (
        <span className="relative block overflow-hidden bg-[var(--line)]" style={markBarStyle(PINNED_MARK_SIZE, index)}>
            <motion.span
                className="absolute inset-0 origin-bottom"
                style={{ scaleY, background: stageColor(index) }}
            />
        </span>
    );
}

/**
 * Desktop: the section pins for one stretch of scroll per stage. The stage
 * word swaps through a mask, the logo's bars grow one after another, and the
 * light behind the frame shifts into each stage's colour.
 */
function PinnedProcess({ heading, items }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    const total = items.length;

    useMotionValueEvent(scrollYProgress, 'change', (value) => {
        const next = Math.min(total - 1, Math.max(0, Math.floor(value * total)));
        setActive((current) => (current === next ? current : next));
    });

    const item = items[active];
    const color = stageColor(active);
    const swap = reduce
        ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
        : {
            initial: { y: '105%' },
            animate: { y: '0%' },
            exit: { y: '-105%' },
            transition: { duration: 0.7, ease: [...EASE] },
        };

    return (
        <div ref={ref} className="relative hidden lg:block" style={{ height: `${total * STAGE_SVH + 100}svh` }}>
            <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 top-1/2 h-[48rem] w-[48rem] -translate-y-1/2 rounded-full blur-[160px]"
                    animate={{ backgroundColor: color, opacity: 0.22 }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: [...EASE] }}
                />

                <div className="container-x relative grid w-full grid-cols-12 items-center gap-10">
                    <div className="col-span-7">
                        <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                            {heading}
                        </h2>

                        <div className="relative mt-10 h-[clamp(4rem,7.8vw,8rem)] overflow-hidden">
                            <AnimatePresence initial={false}>
                                <motion.p
                                    key={active}
                                    {...swap}
                                    className="absolute inset-0 whitespace-nowrap font-display text-[calc(clamp(3.5rem,7.2vw,7.25rem)*var(--heading-scale,1))] font-extrabold uppercase leading-[1] tracking-[-0.045em]"
                                    style={{ color }}
                                >
                                    {item.stage}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <div className="relative mt-10 min-h-[9rem] max-w-xl">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={active}
                                    initial={reduce ? false : { opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={reduce ? undefined : { opacity: 0, y: -12 }}
                                    transition={{ duration: 0.45, ease: [...EASE] }}
                                >
                                    <p className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-strong)]">
                                        {item.title}
                                    </p>
                                    <RichContent value={item.body} className="mt-4 text-[16px] leading-relaxed text-[var(--mute)]" />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="col-span-5 flex justify-end">
                        {/* Each stage's label sits directly under its own bar. */}
                        <ol className="flex items-start" style={{ gap: markGap(PINNED_MARK_SIZE) }}>
                            {items.map((stage, index) => (
                                <li
                                    key={index}
                                    aria-current={index === active ? 'step' : undefined}
                                    className="flex flex-col items-center"
                                >
                                    <span className="flex items-end" style={{ height: PINNED_MARK_SIZE }} aria-hidden>
                                        <StageBar index={index} total={total} progress={scrollYProgress} />
                                    </span>
                                    <span
                                        className="mt-6 whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-500"
                                        style={{ color: index <= active ? stageColor(index) : 'var(--ink-faint)' }}
                                    >
                                        {stage.stage}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Phones and tablets: the same stages as a plain column, each arriving in turn. */
function StackedProcess({ heading, items }) {
    const reduce = useReducedMotion();

    return (
        <div className="section-pad lg:hidden">
            <div className="container-x">
                <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                    {heading}
                </h2>
                <ol className="mt-10 flex flex-col">
                    {items.map((item, index) => (
                        <motion.li
                            key={index}
                            className="border-t border-[var(--line)] py-10"
                            initial={reduce ? false : { opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-10% 0px' }}
                            transition={{ duration: 0.7, ease: [...EASE] }}
                        >
                            <div className="flex items-end gap-4">
                                <span
                                    aria-hidden
                                    className="block shrink-0"
                                    style={{ ...markBarStyle(STACKED_MARK_SIZE, index), background: stageColor(index) }}
                                />
                                <p
                                    className="min-w-0 whitespace-nowrap font-display text-[calc(clamp(2.25rem,11.5vw,5.5rem)*var(--heading-scale,1))] font-extrabold uppercase leading-[0.85] tracking-[-0.045em]"
                                    style={{ color: stageColor(index) }}
                                >
                                    {item.stage}
                                </p>
                            </div>
                            <p className="mt-6 font-display text-[1.5rem] font-bold leading-[1.15] text-[var(--ink-strong)]">{item.title}</p>
                            <RichContent value={item.body} className="mt-3 text-[15px] leading-relaxed text-[var(--mute)]" />
                        </motion.li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

/**
 * The landing page's Idea -> Experience -> Result story.
 *
 * @param {{ content?: { heading?: string, items?: Array<{ stage?: string, title?: string, body?: string }> } }} props
 */
export default function Process({ content }) {
    const items = (content?.items ?? []).filter((item) => item?.stage);
    const heading = content?.heading ?? '';

    if (items.length === 0) return null;

    return (
        <section id="process" className="noise relative bg-[var(--bg)]">
            <PinnedProcess heading={heading} items={items} />
            <StackedProcess heading={heading} items={items} />
        </section>
    );
}
