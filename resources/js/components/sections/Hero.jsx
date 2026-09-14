import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import { useThemeMotion } from '../../lib/theme';
import MagneticButton from '../motion/MagneticButton';
import ScrollHeading from '../motion/ScrollHeading';
import CursorGlow from '../decor/CursorGlow';
import Stage from '../decor/Stage';

function BarColumn({ bar, glow }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.52, delay: bar.delay, ease: [...EASE] }}
                style={{
                    originY: 1,
                    height: bar.height,
                    background: `linear-gradient(180deg, ${bar.color}, ${bar.color}55)`,
                    boxShadow: `${glow(bar.color, 42)}, ${glow(bar.color, 90)}`.replace(/, $/, ''),
                    border: `1px solid ${bar.color}66`,
                }}
                className="w-10 rounded-lg sm:w-14 sm:rounded-[10px]"
            />
            <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 0.75, y: 0 }}
                transition={{ delay: bar.delay + 0.28, duration: 0.2 }}
                className="font-display text-[9px] font-bold tracking-[0.18em] text-[var(--ink-faint)] sm:text-[10px] sm:tracking-[0.24em]"
            >
                {bar.label}
            </motion.span>
        </div>
    );
}

function Bars({ glow }) {
    const bars = [
        { color: '#891FFB', height: 'clamp(7.5rem, 18vw, 11.875rem)', label: 'IDEA', delay: 0.82 },
        { color: '#507AF4', height: 'clamp(10.5rem, 25vw, 17.5rem)', label: 'EXPERIENCE', delay: 0.9 },
        { color: '#1BE2EB', height: 'clamp(13rem, 32vw, 23.75rem)', label: 'RESULT', delay: 0.98 },
    ];

    return (
        <div className="relative flex items-end gap-4 sm:gap-6" aria-hidden>
            {bars.map((bar) => (
                <BarColumn key={bar.label} bar={bar} glow={glow} />
            ))}
        </div>
    );
}

export default function Hero() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const fx = useThemeMotion();
    const [desktopMotion, setDesktopMotion] = useState(false);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const contentY = useTransform(scrollYProgress, [0, 1], [0, -72]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.84]);
    const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const update = () => setDesktopMotion(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    const { settings } = usePage().props;
    const hero = settings.hero;
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
                <CursorGlow />
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

            <div className="container-x relative z-10 mt-8 flex items-end justify-center pb-8 sm:mt-10 sm:pb-10 md:justify-between">
                <div className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] md:flex" aria-hidden>
                    <span>Idea <span className="text-[#891FFB]">●</span></span>
                    <span>Experience <span className="text-[#507AF4]">●</span></span>
                    <span>Result <span className="text-[#1BE2EB]">●</span></span>
                </div>
                <Bars glow={fx.barGlow} />
                <Link
                    href="/about"
                    className="btn-press hidden flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)] hover:text-[var(--ink)] md:flex"
                >
                    Scroll to explore
                    <span className="block h-10 w-[1px] bg-gradient-to-b from-[#891FFB] via-[#507AF4] to-[#1BE2EB]" aria-hidden />
                </Link>
            </div>
        </section>
    );
}
