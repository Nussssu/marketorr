import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import { useThemeMotion } from '../../lib/theme';
import MagneticButton from '../motion/MagneticButton';
import ScrollHeading from '../motion/ScrollHeading';
import PrismObject from '../decor/PrismObject';
import Stage from '../decor/Stage';

/**
 * The bar cluster is the logo's own mark, so its geometry is taken straight
 * from the artwork rather than chosen by eye. Measured off
 * `marketorr-logo-on-light.png` (1000x118): the three bars are 38 / 75 / 112
 * tall, 35 wide, set 19 apart — every one of those expressed below as a
 * fraction of the tallest bar, which is the single number `--bar-h`.
 *
 * Sizing it this way keeps the hero mark in the logo's proportions at any
 * viewport: change `BAR_HEIGHT` and the widths, gaps and corner radius follow.
 */
const BAR_STEPS = [0.34, 0.67, 1];
const BAR_WIDTH = 0.3125;
const BAR_GAP = 0.17;

/**
 * Height of the tallest bar. A background brand mark, not a centrepiece: about
 * a third of what it was, and it now stays clear of the headline block on
 * every width instead of filling the lower hero.
 */
const BAR_HEIGHT = 'clamp(4.5rem, 10vw, 8.25rem)';

function BarColumn({ bar, glow }) {
    return (
        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
            <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.52, delay: bar.delay, ease: [...EASE] }}
                style={{
                    originY: 1,
                    height: `calc(var(--bar-h) * ${bar.height})`,
                    width: `calc(var(--bar-h) * ${BAR_WIDTH})`,
                    borderRadius: 'calc(var(--bar-h) * 0.055)',
                    background: `linear-gradient(180deg, ${bar.color}, ${bar.color}55)`,
                    boxShadow: `${glow(bar.color, 42)}, ${glow(bar.color, 90)}`.replace(/, $/, ''),
                    border: `1px solid ${bar.color}66`,
                }}
            />
            <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.75, y: 0 }}
                transition={{ delay: bar.delay + 0.28, duration: 0.2 }}
                className="font-display text-[7px] font-bold tracking-[0.14em] text-[var(--ink-faint)] sm:text-[8px] sm:tracking-[0.18em]"
            >
                {bar.label}
            </motion.span>
        </div>
    );
}

function Bars({ glow, progress, rich, reduce }) {
    const bars = [
        { color: '#891FFB', height: BAR_STEPS[0], label: 'IDEA', delay: 0.82 },
        { color: '#507AF4', height: BAR_STEPS[1], label: 'EXPERIENCE', delay: 0.9 },
        { color: '#1BE2EB', height: BAR_STEPS[2], label: 'RESULT', delay: 0.98 },
    ];

    // One continuous scroll journey, front-loaded into the first ~40% of the
    // hero: the cluster opens as slim, translucent light columns parked right
    // of the headline, then quickly shrinks and glides into its settled row
    // with a soft landing at progress 0.4 — fixed and stable from there on.
    // Scale carries size, spacing and glow together, so the bars read as the
    // same elements traveling — never swapped out.
    const scale = useTransform(progress, [0, 0.32, 0.4], rich ? [2.0, 1.04, 1] : [1.5, 1.02, 1]);
    const scaleX = useTransform(progress, [0, 0.32, 0.4], rich ? [0.55, 0.96, 1] : [0.7, 0.97, 1]);
    const x = useTransform(progress, [0, 0.32, 0.4], rich ? ['38%', '2%', '0%'] : ['18%', '1%', '0%']);
    const y = useTransform(progress, [0, 0.32, 0.4], rich ? ['-18%', '-1%', '0%'] : ['-10%', '-1%', '0%']);
    const opacity = useTransform(progress, [0, 0.28, 0.4], rich ? [0.22, 0.85, 1] : [0.25, 0.9, 1]);

    return (
        <motion.div
            style={{
                ...(reduce ? {} : { scale, scaleX, x, y, opacity }),
                '--bar-h': BAR_HEIGHT,
            }}
            className="relative origin-bottom"
            aria-hidden
        >
            <div
                className="relative flex items-end"
                style={{ gap: `calc(var(--bar-h) * ${BAR_GAP})` }}
            >
                {bars.map((bar) => (
                    <BarColumn key={bar.label} bar={bar} glow={glow} />
                ))}
            </div>
        </motion.div>
    );
}

/**
 * @param {{ content?: { eyebrow?: string, headingLines?: string[], subtext?: string } }} props
 *   Content from the page's Hero section. Falls back to the site-wide hero in
 *   Settings, so the component still renders on a page with no Hero widget.
 */
export default function Hero({ content }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const fx = useThemeMotion();
    const [desktopMotion, setDesktopMotion] = useState(false);
    // Full travel on tablet/desktop; simplified (smaller range) on phones.
    const [richMotion, setRichMotion] = useState(false);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const contentY = useTransform(scrollYProgress, [0, 1], [0, -72]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.84]);
    const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);
    // The bar row settles back slightly as the hero scrolls away — a dim,
    // never a disappearance, so the transition point stays on screen.
    const barsDim = useTransform(scrollYProgress, [0.05, 0.4], [1, 0.35]);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const update = () => setDesktopMotion(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px)');
        const update = () => setRichMotion(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    const { settings } = usePage().props;
    const hero = {
        ...settings.hero,
        ...(content?.eyebrow ? { eyebrow: content.eyebrow } : {}),
        ...(content?.headingLines?.length ? { headingLines: content.headingLines } : {}),
        ...(content?.subtext ? { subtext: content.subtext } : {}),
    };
    // The closing line always carries the brand gradient.
    const headingLines = hero.headingLines.map((line, index) => [
        line,
        index === hero.headingLines.length - 1 ? 'text-gradient' : '',
    ]);

    const exitMotion = desktopMotion && !reduce
        ? { y: contentY, opacity: contentOpacity, scale: contentScale }
        : undefined;

    return (
        <section ref={ref} id="home" className="noise relative flex min-h-svh flex-col overflow-hidden bg-[var(--bg)]">
            <motion.div
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, ease: [...EASE] }}
                className="pointer-events-none absolute inset-0"
                aria-hidden
            >
                <Stage variant="hero" />
                <div className="grid-bg absolute inset-0" />
                <PrismObject progress={scrollYProgress} />
            </motion.div>

            <motion.div style={exitMotion} className="container-x relative z-10 flex flex-1 flex-col justify-center pb-4 pt-28 sm:pt-32">
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.12, ease: [...EASE] }}
                    className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] sm:mb-6 sm:text-[12px] sm:tracking-[0.28em]"
                >
                    <span className="inline-block h-[2px] w-8 bg-brand sm:w-10" aria-hidden />
                    {hero.eyebrow}
                </motion.p>

                {/* intensity trimmed: the hero container already carries its own scroll exit */}
                <ScrollHeading intensity={0.55}>
                    <h1 className="display-xl uppercase text-[var(--ink-strong)]">
                        {headingLines.map(([line, className], index) => (
                            <span key={line} className="mask-line">
                                <motion.span
                                    className={`mask-inner ${className}`}
                                    initial={{ y: '110%' }}
                                    animate={{ y: '0%' }}
                                    transition={{ duration: 0.52, delay: 0.2 + index * 0.08, ease: [...EASE] }}
                                >
                                    {line}
                                </motion.span>
                            </span>
                        ))}
                    </h1>
                </ScrollHeading>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.42, delay: 0.48, ease: [...EASE] }}
                    className="mt-6 h-[3px] w-full max-w-xl origin-left sm:mt-8"
                    style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                    aria-hidden
                />

                <div className="mt-6 flex flex-col gap-7 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.38, delay: 0.6, ease: [...EASE] }}
                        className="max-w-md text-[15px] leading-relaxed text-[var(--mute)] sm:text-[16px]"
                    >
                        {hero.subtext}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.38, delay: 0.7, ease: [...EASE] }}
                        className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4"
                    >
                        <MagneticButton className="w-full sm:w-auto">
                            <Link href="/work" data-cursor="cta" className="btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white sm:w-auto" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                                View our work <span data-arrow aria-hidden>↗</span>
                            </Link>
                        </MagneticButton>
                        <MagneticButton className="w-full sm:w-auto">
                            <Link href="/contact" data-cursor="cta" className="btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)] sm:w-auto">
                                Start a project <span data-arrow="horizontal" aria-hidden>→</span>
                            </Link>
                        </MagneticButton>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bars sit behind the headline block so the opening state reads as backdrop. */}
            <motion.div
                style={reduce ? undefined : { opacity: barsDim }}
                className="container-x relative z-0 mt-8 flex items-end justify-center pb-8 sm:mt-10 sm:pb-10 md:justify-between"
            >
                <div className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] md:flex" aria-hidden>
                    <span>Idea <span className="text-[#891FFB]">●</span></span>
                    <span>Experience <span className="text-[#507AF4]">●</span></span>
                    <span>Result <span className="text-[#1BE2EB]">●</span></span>
                </div>
                <Bars glow={fx.barGlow} progress={scrollYProgress} rich={richMotion} reduce={reduce} />
                <Link
                    href="/about"
                    className="btn-press hidden flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)] hover:text-[var(--ink)] md:flex"
                >
                    Scroll to explore
                    <span className="block h-10 w-[1px] bg-gradient-to-b from-[#891FFB] via-[#507AF4] to-[#1BE2EB]" aria-hidden />
                </Link>
            </motion.div>
        </section>
    );
}
