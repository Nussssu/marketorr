import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import CountUp from '../motion/CountUp';
import RevealText from '../motion/RevealText';
import { SectionLabel } from '../ui/primitives';
import ScrollHeading from '../motion/ScrollHeading';
import Stage from '../decor/Stage';
import { gradientLines } from '../../lib/headingLines';

/** Tagline phrase colours, in order: purple, blue, cyan. */
const TAGLINE_COLORS = ['#891FFB', '#507AF4', '#1BE2EB'];

/** Accent bar under each stat block, repeating if more metrics are configured. */
const METRIC_ACCENTS = ['#891FFB', '#891FFB', '#507AF4', '#1BE2EB'];

function MetricsGrid({ metrics }) {
    return (
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
            {metrics.map((m, i) => (
                <div key={m.label} className="bg-[var(--surface)] p-7 md:p-9">
                    <p className="font-display text-4xl font-extrabold text-[var(--ink-strong)] md:text-5xl">
                        <CountUp to={Number(m.value)} suffix={m.suffix ?? ''} />
                    </p>
                    <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">{m.label}</p>
                    <span
                        className="mt-4 block h-[2px] w-10"
                        style={{ background: METRIC_ACCENTS[i % METRIC_ACCENTS.length] }}
                        aria-hidden
                    />
                </div>
            ))}
        </div>
    );
}

/** How many closing words of the manifesto take the brand gradient once lit. */
const MANIFESTO_ACCENT_WORDS = 4;

/**
 * One word of the manifesto. It owns its slice of the scroll range, so the
 * statement lights up word by word as the reader moves through it rather than
 * all at once.
 */
function ManifestoWord({ word, progress, start, end, accent }) {
    const opacity = useTransform(progress, [start, end], [0.16, 1]);

    return (
        <motion.span style={{ opacity }} className={accent ? 'text-gradient' : undefined}>
            {word}{' '}
        </motion.span>
    );
}

/**
 * The landing page's About: the agency statement itself, set large and lit
 * word by word on scroll. The About page opens with the headline version
 * instead, so the two no longer repeat each other.
 */
function ManifestoAbout({ label, text, metrics, tagline, compactTop }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
    const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
    const accentFrom = words.length - MANIFESTO_ACCENT_WORDS;

    return (
        <section
            id="about"
            className={`noise relative overflow-hidden bg-[var(--bg-soft)] ${compactTop ? 'pb-[clamp(5rem,9vw,9rem)] pt-16 sm:pt-[clamp(5rem,9vw,9rem)]' : 'section-pad'}`}
        >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <Stage variant="about" />
            </div>

            <div className="container-x relative">
                {label && <SectionLabel name={label.toUpperCase()} />}
                <h2 className="sr-only">{label}</h2>

                <p className="sr-only">{text}</p>
                <p
                    ref={ref}
                    aria-hidden
                    className="mt-10 max-w-[68rem] font-display text-[clamp(1.6rem,3.4vw,3.1rem)] font-bold leading-[1.14] tracking-[-0.025em] text-[var(--ink-strong)]"
                >
                    {words.map((word, i) =>
                        reduce ? (
                            <span key={i} className={i >= accentFrom ? 'text-gradient' : undefined}>
                                {word}{' '}
                            </span>
                        ) : (
                            <ManifestoWord
                                key={i}
                                word={word}
                                progress={scrollYProgress}
                                start={i / words.length}
                                end={(i + 1) / words.length}
                                accent={i >= accentFrom}
                            />
                        ),
                    )}
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                    {tagline.length > 0 && (
                        <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em]">
                            {tagline.map((phrase, index) => (
                                <span key={`${phrase}-${index}`} style={{ color: TAGLINE_COLORS[index % TAGLINE_COLORS.length] }}>
                                    {phrase}{index < tagline.length - 1 ? ' ' : ''}
                                </span>
                            ))}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-8">
                        <Link href="/about" data-cursor="explore" className="link-underline btn-press inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                            Our story →
                        </Link>
                        <Link href="/services" data-cursor="explore" className="link-underline btn-press inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                            Explore our services →
                        </Link>
                    </div>
                </div>

                <MetricsGrid metrics={metrics} />
            </div>
        </section>
    );
}

/**
 * @param {{
 *   variant?: 'hero'|'manifesto',
 *   heroHeading?: boolean,
 *   compactTop?: boolean,
 *   content?: { text?: string, metrics?: Array<object> },
 * }} props
 *   Content from the page's About section, falling back to Settings.
 *   `manifesto` is the landing page's scroll-lit statement; `hero` is the
 *   headline version the About page opens with.
 */
export default function About({ variant = 'hero', heroHeading = false, compactTop = false, content }) {
    const { settings } = usePage().props;
    const text = content?.text || settings.about.text;
    const metrics = content?.metrics?.length ? content.metrics : settings.about.metrics;
    const tagline = (content?.tagline ?? []).filter(Boolean);

    if (variant === 'manifesto') {
        return <ManifestoAbout label={content?.heading} text={text} metrics={metrics} tagline={tagline} compactTop={compactTop} />;
    }

    return (
        <section
            id="about"
            className={`noise relative overflow-hidden bg-[var(--bg-soft)] ${compactTop ? 'pb-[clamp(5rem,9vw,9rem)] pt-16 sm:pt-[clamp(5rem,9vw,9rem)]' : 'section-pad'}`}
        >
            {/* cursor-reactive stage — clean single orb + motif, stays dark */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
            >
                <Stage variant="about" />
            </div>

            <div className="container-x relative">
                {content?.heading && <SectionLabel name={content.heading.toUpperCase()} />}
                <div className="mt-10 grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <ScrollHeading enabled={heroHeading}>
                            <RevealText
                                as="h2"
                                className="display-lg uppercase text-[var(--ink-strong)]"
                                lines={content?.titleLines ?? []}
                                highlightedLines={gradientLines(content?.titleLines, content?.titleHighlight)}
                            />
                        </ScrollHeading>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-8 h-[3px] w-48 origin-left"
                            style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                            aria-hidden
                        />
                    </div>
                    <div className="lg:col-span-5 lg:pt-4">
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[16px] leading-relaxed text-[var(--mute)]"
                        >
                            {text}
                        </motion.p>
                        {tagline.length > 0 && (
                            <p className="mt-5 font-display text-[12px] font-bold uppercase tracking-[0.22em]">
                                {tagline.map((phrase, index) => (
                                    <span key={`${phrase}-${index}`} style={{ color: TAGLINE_COLORS[index % TAGLINE_COLORS.length] }}>
                                        {phrase}{index < tagline.length - 1 ? ' ' : ''}
                                    </span>
                                ))}
                            </p>
                        )}
                        {content?.linkLabel && (
                            <Link href={content.linkUrl || '/services'} data-cursor="explore" className="link-underline btn-press mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                                {content.linkLabel}
                            </Link>
                        )}
                    </div>
                </div>

                <MetricsGrid metrics={metrics} />
            </div>
        </section>
    );
}
