import { Link, usePage } from '@inertiajs/react';
import { motion, transform, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MARK, withAlpha } from '../../lib/tokens';
import { useThemeMotion } from '../../lib/theme';
import MagneticButton from '../motion/MagneticButton';
import ScrollHeading from '../motion/ScrollHeading';
import HeroOrb from '../decor/HeroOrb';
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
const BAR_STEPS = MARK.heights;
const BAR_WIDTH = MARK.width;
const BAR_GAP = MARK.gap;

/**
 * Height of the tallest bar. A background brand mark, not a centrepiece: about
 * a third of what it was, and it now stays clear of the headline block on
 * every width instead of filling the lower hero.
 */
const BAR_HEIGHT = 'clamp(4.5rem, 10vw, 8.25rem)';

function BarColumn({ bar, glow }) {
    return (
        <div className="flex flex-col items-center gap-2 sm:gap-2.5">
            <div
                className="enter enter--grow-y"
                style={{
                    '--enter-dur': '0.52s',
                    '--enter-delay': `${bar.delay}s`,
                    transformOrigin: '50% 100%',
                    height: `calc(var(--bar-h) * ${bar.height})`,
                    width: `calc(var(--bar-h) * ${BAR_WIDTH})`,
                    // Square but for the top-left corner, which curves through
                    // the bar's full width - the logo's own bar shape.
                    borderRadius: `calc(var(--bar-h) * ${BAR_WIDTH}) 0 0 0`,
                    background: `linear-gradient(180deg, ${bar.color}, ${bar.color}55)`,
                    boxShadow: `${glow(bar.color, 42)}, ${glow(bar.color, 90)}`.replace(/, $/, ''),
                    border: `1px solid ${withAlpha(bar.color, '66')}`,
                }}
            />
            <span
                style={{ '--enter-dur': '0.2s', '--enter-delay': `${bar.delay + 0.28}s`, '--enter-y': '6px', '--enter-to': 0.75, '--enter-ease': 'ease-out' }}
                className="enter enter--fade-up font-display text-[7px] font-bold tracking-[0.14em] text-[var(--ink-faint)] sm:text-[8px] sm:tracking-[0.18em]"
            >
                {bar.label}
            </span>
        </div>
    );
}

function Bars({ glow, progress, rich, reduce }) {
    const bars = [
        { color: MARK.colors[0], height: BAR_STEPS[0], label: 'IDEA', delay: 0.82 },
        { color: MARK.colors[1], height: BAR_STEPS[1], label: 'EXPERIENCE', delay: 0.9 },
        { color: MARK.colors[2], height: BAR_STEPS[2], label: 'RESULT', delay: 0.98 },
    ];

    const ref = useRef(null);
    // The cluster settles at the left of its row, but opens from where the
    // centre of the row would be. `centreShift` is that distance in px, and
    // `width` the cluster's own width, so the start can sit right of centre.
    const centreShift = useMotionValue(0);
    const width = useMotionValue(0);

    useEffect(() => {
        const element = ref.current;
        const row = element?.parentElement;
        if (!element || !row) return undefined;

        const measure = () => {
            const style = window.getComputedStyle(row);
            const rowWidth = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            centreShift.set(Math.max(0, (rowWidth - element.offsetWidth) / 2));
            width.set(element.offsetWidth);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(row);

        return () => observer.disconnect();
    }, [centreShift, width]);

    // One continuous scroll journey, front-loaded into the first ~40% of the
    // hero: the cluster opens as large, translucent light columns parked right
    // of the headline, then quickly shrinks and glides left into its settled
    // place with a soft landing at progress 0.4, fixed and stable from there on.
    // Scale carries size, spacing and glow together, so the bars read as the
    // same elements traveling — never swapped out. It is uniform, so the bars
    // keep the logo's proportions and corner curve at every point of the trip.
    const scale = useTransform(progress, [0, 0.32, 0.4], rich ? [2.0, 1.04, 1] : [1.5, 1.02, 1]);
    const x = useTransform(() => {
        const [start, near] = rich ? [0.38, 0.02] : [0.18, 0.01];
        const w = width.get();

        return transform(progress.get(), [0, 0.32, 0.4], [centreShift.get() + w * start, w * near, 0]);
    });
    const y = useTransform(progress, [0, 0.32, 0.4], rich ? ['-18%', '-1%', '0%'] : ['-10%', '-1%', '0%']);
    const opacity = useTransform(progress, [0, 0.28, 0.4], rich ? [0.22, 0.85, 1] : [0.25, 0.9, 1]);

    return (
        <motion.div
            ref={ref}
            style={{
                ...(reduce ? {} : { scale, x, y, opacity }),
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
        <section ref={ref} id="home" className="noise relative flex min-h-0 flex-col overflow-hidden bg-[var(--bg)] sm:min-h-svh">
            <div
                style={{ '--enter-dur': '0.32s' }}
                className="enter enter--settle pointer-events-none absolute inset-0"
                aria-hidden
            >
                <Stage variant="hero" />
                <div className="grid-bg absolute inset-0" />
                <HeroOrb progress={scrollYProgress} />
            </div>

            <motion.div style={exitMotion} className="container-x relative z-10 flex flex-none flex-col justify-start pb-4 pt-24 sm:flex-1 sm:justify-center sm:pt-32">
                <p
                    style={{ '--enter-dur': '0.3s', '--enter-delay': '0.12s', '--enter-y': '14px' }}
                    className="enter enter--fade-up mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] sm:mb-6 sm:text-[12px] sm:tracking-[0.28em]"
                >
                    {hero.eyebrow}
                </p>

                {/* intensity trimmed: the hero container already carries its own scroll exit */}
                <ScrollHeading intensity={0.55}>
                    <h1 className="display-xl uppercase text-[var(--ink-strong)]">
                        {headingLines.map(([line, className], index) => (
                            <span key={line} className="mask-line">
                                <span
                                    className={`mask-inner enter enter--mask-up ${className}`}
                                    style={{ '--enter-dur': '0.52s', '--enter-delay': `${0.2 + index * 0.08}s` }}
                                >
                                    {line}
                                </span>
                            </span>
                        ))}
                    </h1>
                </ScrollHeading>

                <div
                    className="enter enter--scale-x mt-6 h-[3px] w-full max-w-xl origin-left sm:mt-8"
                    style={{ '--enter-dur': '0.42s', '--enter-delay': '0.48s', background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' }}
                    aria-hidden
                />

                <div className="mt-6 flex flex-col gap-7 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                    <p
                        style={{ '--enter-dur': '0.38s', '--enter-delay': '0.6s' }}
                        className="enter enter--fade-up max-w-md text-[15px] leading-relaxed text-[var(--mute)] sm:text-[16px]"
                    >
                        {hero.subtext}
                    </p>
                    <div
                        style={{ '--enter-dur': '0.38s', '--enter-delay': '0.7s' }}
                        className="enter enter--fade-up flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4"
                    >
                        <MagneticButton className="w-full sm:w-auto">
                            <Link href="/work" data-cursor="cta" className="btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white sm:w-auto" style={{ background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' }}>
                                View our work <span data-arrow aria-hidden>↗</span>
                            </Link>
                        </MagneticButton>
                        <MagneticButton className="w-full sm:w-auto">
                            <Link href="/contact" data-cursor="cta" className="btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)] sm:w-auto">
                                Start a project <span data-arrow="horizontal" aria-hidden>→</span>
                            </Link>
                        </MagneticButton>
                    </div>
                </div>
            </motion.div>

            {/* Bars sit behind the headline block so the opening state reads as backdrop. */}
            <motion.div
                style={reduce ? undefined : { opacity: barsDim }}
                className="container-x relative z-0 mt-24 flex items-end justify-start pb-8 sm:mt-10 sm:pb-10"
            >
                <Bars glow={fx.barGlow} progress={scrollYProgress} rich={richMotion} reduce={reduce} />
            </motion.div>
        </section>
    );
}
