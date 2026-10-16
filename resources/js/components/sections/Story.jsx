import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import ScrubRise from '../motion/ScrubRise';
import { GradientTitle, SectionLabel } from '../ui/primitives';
import { BRAND_SEQUENCE } from '../../lib/tokens';

const BRAND_GRADIENT = 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))';

/** Where the first timeline entry starts revealing, and how far apart the rest are spread. */
const REVEAL_FIRST = 0.03;
const REVEAL_SPREAD = 0.56;
const REVEAL_LENGTH = 0.15;

function StoryPoint({ stop, index, total, progress, reduce }) {
    const revealStart = REVEAL_FIRST + (total > 1 ? (index * REVEAL_SPREAD) / (total - 1) : 0);
    const revealEnd = revealStart + REVEAL_LENGTH;
    const opacity = useTransform(progress, [revealStart, revealEnd], [0, 1]);
    const y = useTransform(progress, [revealStart, revealEnd], [28, 0]);
    const rotateX = useTransform(progress, [revealStart, revealEnd], [8, 0]);
    const scale = useTransform(progress, [revealStart, revealEnd], [0.97, 1]);

    return (
        <motion.li
            className="relative"
            style={reduce ? undefined : { opacity, y, rotateX, scale, transformPerspective: 900, transformOrigin: '50% 100%' }}
        >
            <span
                className="absolute top-1.5 left-[calc(-2rem+0.5px)] h-2.5 w-2.5 -translate-x-1/2 rounded-full md:left-[calc(-2.5rem+0.5px)]"
                style={{ background: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] }}
                aria-hidden
            />
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                {stop.year}
            </p>
            <h3 className="mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-2xl">
                {stop.title}
            </h3>
            <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-[var(--mute)]">{stop.copy}</p>
        </motion.li>
    );
}

/**
 * A pull quote whose last word carries the brand gradient, e.g. "Just Results."
 *
 * @param {{ text: string }} props
 */
function PullQuote({ text }) {
    const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;
    const last = words.pop();

    return (
        <p className="mt-6 border-l-2 pl-5 font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-3xl" style={{ borderImage: `${BRAND_GRADIENT} 1` }}>
            {words.length > 0 && `${words.join(' ')} `}
            <span className="text-gradient">{last}</span>
        </p>
    );
}

/**
 * The pinned "Our story" section: label, heading, intro and pull quote on the
 * left; a timeline on the right whose entries arrive, and whose rail fills,
 * as the reader scrolls through it.
 *
 * @param {{ content?: { label?: string, heading?: string, highlight?: number, intro?: string, quote?: string, items?: Array<{ year?: string, title?: string, copy?: string }> } }} props
 */
export default function Story({ content = {} }) {
    const sectionRef = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const progress = useSpring(scrollYProgress, { stiffness: 92, damping: 28, mass: 0.55 });
    const scaleY = useTransform(progress, [0.04, 0.78], [0, 1]);
    const items = (content.items ?? []).filter((item) => item?.title);

    return (
        <section
            ref={sectionRef}
            aria-labelledby="story-title"
            className={`${reduce ? 'section-pad' : 'h-[260svh]'} relative border-t border-[var(--line)] bg-[var(--bg-soft)]`}
        >
            <div
                className={`container-x grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 ${
                    reduce
                        ? ''
                        : 'section-pad sticky top-16 min-h-[calc(100svh-4rem)] content-center lg:top-[72px] lg:min-h-[calc(100svh-72px)]'
                }`}
            >
                <div className="lg:sticky lg:top-32 lg:self-start">
                    <ScrubRise>
                        {content.label && <SectionLabel name={content.label} />}
                        <h2 id="story-title" className="display-md mt-6 uppercase text-[var(--ink-strong)]">
                            <GradientTitle text={content.heading ?? ''} highlightWords={Number(content.highlight ?? 0)} />
                        </h2>
                        {content.intro && (
                            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--mute)]">{content.intro}</p>
                        )}
                        <PullQuote text={content.quote} />
                    </ScrubRise>
                </div>

                <div className="relative pl-8 md:pl-10">
                    {/* Scroll-scrubbed progress rail — fills as the journey is read. */}
                    <span className="absolute inset-y-1 left-0 w-px bg-[var(--line)]" aria-hidden />
                    {!reduce && (
                        <motion.span
                            className="absolute inset-y-1 left-0 w-px origin-top"
                            style={{ scaleY, background: BRAND_GRADIENT }}
                            aria-hidden
                        />
                    )}
                    <ol className="flex flex-col gap-10">
                        {items.map((stop, i) => (
                            <StoryPoint
                                key={`${stop.title}-${i}`}
                                stop={stop}
                                index={i}
                                total={items.length}
                                progress={progress}
                                reduce={reduce}
                            />
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
