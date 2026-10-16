import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { useRef, useState } from 'react';
import { GradientTitle, SectionLabel } from '../ui/primitives';
import { assetUrl } from '../../lib/asset';

/** How far into the pinned section one scroll carries the reader to the next card. */
const FIRST_SWAP = 0.01;
const SCENE_EASE = [0.22, 1, 0.36, 1];

/**
 * Which card the scroll position shows: the first until one scroll past the
 * pin point, then the rest spread evenly over the remaining pinned travel.
 *
 * @param {number} value scroll progress, 0–1
 * @param {number} count number of cards
 */
function cardAt(value, count) {
    if (count < 2 || value <= FIRST_SWAP) return 0;

    const step = (1 - FIRST_SWAP) / (count - 1);

    return Math.min(count - 1, 1 + Math.floor((value - FIRST_SWAP) / step));
}

/**
 * Cards (e.g. Vision, then Mission) in one pinned frame. Scroll only decides
 * WHICH card shows — one scroll down brings the next, scrolling back up
 * returns the previous — and the swap itself plays as a short timed
 * animation: the outgoing card leaves first, then the incoming one settles
 * in. Nothing is scrubbed by the wheel, so two cards never sit half-overlapped
 * while the reader reads.
 *
 * @param {{ content?: { highlight?: number, items?: Array<{ label?: string, title?: string, copy?: string, image?: string, imageAlt?: string }> } }} props
 */
export default function MissionVision({ content = {} }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    const [active, setActive] = useState(0);
    const items = (content.items ?? []).filter((item) => item?.title);
    const highlight = Number(content.highlight ?? 0);

    useMotionValueEvent(scrollYProgress, 'change', (value) => {
        const next = cardAt(value, items.length);
        setActive((current) => (current === next ? current : next));
    });

    if (items.length === 0) return null;

    const sceneMotion = (index) => {
        const isActive = index === active;
        // A card that is not showing waits off to the side it left from:
        // earlier cards above, later cards below.
        const offset = index < active ? -28 : 28;

        return {
            initial: false,
            animate: { opacity: isActive ? 1 : 0, y: isActive || reduce ? 0 : offset },
            transition: reduce
                ? { duration: 0 }
                : { duration: isActive ? 0.6 : 0.35, delay: isActive ? 0.22 : 0, ease: SCENE_EASE },
            style: { pointerEvents: isActive ? 'auto' : 'none' },
            'aria-hidden': !isActive,
        };
    };

    return (
        <section ref={ref} aria-label="Mission and vision" className="relative h-[200svh] overflow-clip bg-[var(--bg-soft)]">
            <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden lg:top-[72px] lg:h-[calc(100svh-72px)]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                        background:
                            'radial-gradient(40% 70% at 8% 100%, rgba(var(--brand-1-rgb),0.14), transparent 68%), radial-gradient(36% 65% at 95% 0%, rgba(var(--brand-3-rgb),0.1), transparent 66%)',
                    }}
                    aria-hidden
                />
                <div className="container-x relative h-full">
                    <div className="grid h-full">
                        {items.map((card, sceneIndex) => (
                            <motion.article
                                key={`${card.title}-${sceneIndex}`}
                                {...sceneMotion(sceneIndex)}
                                className="relative col-start-1 row-start-1 grid h-full w-full content-center gap-6 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.78fr)] sm:items-center sm:gap-10 md:gap-14"
                            >
                                <div>
                                    {card.label && <SectionLabel name={card.label} />}
                                    <h3 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-5xl">
                                        <GradientTitle text={card.title} highlightWords={highlight} />
                                    </h3>
                                    <p className="mt-4 max-w-lg text-[15px] leading-[1.75] text-[var(--mute)] md:text-base">
                                        {card.copy}
                                    </p>
                                </div>
                                {card.image && (
                                    <img
                                        src={assetUrl(card.image)}
                                        alt={card.imageAlt ?? ''}
                                        loading="lazy"
                                        decoding="async"
                                        className="mx-auto max-h-[34svh] w-full max-w-[300px] object-contain sm:max-h-[58svh] sm:max-w-[520px]"
                                    />
                                )}
                            </motion.article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
