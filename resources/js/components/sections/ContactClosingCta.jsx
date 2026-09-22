import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/motion';

const SERVICES = ['Brand strategy', 'UI/UX design', 'Digital marketing', 'Web development'];
const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';
const HEADLINE_LINES = [
    { words: ['Turn', 'a', 'clear', 'idea', 'into', 'a'] },
    { words: ['measurable'], gradient: true },
    { words: ['result.'], gradient: true },
];

const entrance = {
    hidden: {},
    show: { transition: { delayChildren: 0.08 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.72, delay, ease: [...EASE] },
    }),
};

const headlineWord = {
    hidden: { opacity: 0, y: '108%' },
    show: (index) => ({
        opacity: 1,
        y: '0%',
        transition: { duration: 0.82, delay: 0.14 + index * 0.055, ease: [...EASE] },
    }),
};

const serviceCard = {
    hidden: { opacity: 0, y: 28 },
    show: (index) => ({
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 82,
            damping: 18,
            mass: 0.78,
            delay: 0.4 + index * 0.11,
        },
    }),
};

export default function ContactClosingCta() {
    const reduce = useReducedMotion();

    return (
        <section aria-labelledby="contact-closing-title" className="relative overflow-hidden border-t border-[var(--line)] bg-[var(--bg)]">
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    background:
                        'radial-gradient(52% 110% at 0% 100%, rgba(137,31,251,0.18), transparent 68%), radial-gradient(48% 100% at 100% 10%, rgba(80,122,244,0.15), transparent 66%), radial-gradient(38% 75% at 62% 100%, rgba(27,226,235,0.12), transparent 70%)',
                }}
                aria-hidden
            />

            <motion.div
                variants={reduce ? undefined : entrance}
                initial={reduce ? false : 'hidden'}
                whileInView="show"
                viewport={{ once: true, amount: 0.2, margin: '-8% 0px' }}
                className="container-x relative py-20 sm:py-24 lg:py-32"
            >
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:items-end lg:gap-16">
                    <div>
                        <motion.p
                            variants={reduce ? undefined : fadeUp}
                            custom={0}
                            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]"
                        >
                            <span className="h-px w-12" style={{ background: BRAND_GRADIENT }} aria-hidden />
                            Build what moves business
                        </motion.p>
                        <motion.h2
                            id="contact-closing-title"
                            className="display-lg mt-7 max-w-5xl uppercase text-[var(--ink-strong)]"
                            aria-label="Turn a clear idea into a measurable result."
                        >
                            {HEADLINE_LINES.map((line, lineIndex) => {
                                const precedingWords = HEADLINE_LINES
                                    .slice(0, lineIndex)
                                    .reduce((total, entry) => total + entry.words.length, 0);

                                return (
                                    <span
                                        key={line.words.join('-')}
                                        className="block overflow-hidden pb-[0.07em] last:pb-0"
                                        aria-hidden
                                    >
                                        {line.words.map((word, wordIndex) => (
                                            <motion.span
                                                key={`${word}-${wordIndex}`}
                                                variants={reduce ? undefined : headlineWord}
                                                custom={precedingWords + wordIndex}
                                                className={`mr-[0.24em] inline-block will-change-transform last:mr-0 ${line.gradient ? 'text-gradient' : ''}`}
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </span>
                                );
                            })}
                        </motion.h2>
                        <motion.p
                            variants={reduce ? undefined : fadeUp}
                            custom={0.52}
                            className="mt-7 max-w-2xl text-[15px] leading-[1.8] text-[var(--mute)] sm:text-[17px]"
                        >
                            From brand identity and UI/UX to websites, campaigns, and connected digital experiences,
                            Marketorr brings strategy, creativity, and execution together around the growth that matters.
                        </motion.p>
                        <motion.div
                            variants={reduce ? undefined : fadeUp}
                            custom={0.7}
                            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                        >
                            <Link
                                href="/contact#project-inquiry"
                                data-cursor="cta"
                                className="btn-press group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white sm:w-auto"
                                style={{ background: BRAND_GRADIENT }}
                            >
                                <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/15" aria-hidden />
                                <span className="relative">Start the conversation</span>
                                <span className="relative transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                            </Link>
                            <Link
                                href="/work"
                                data-cursor="explore"
                                className="btn-press group inline-flex items-center justify-center gap-3 rounded-full border border-[var(--field-line)] px-7 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-[border-color,background-color,color] duration-300 hover:border-transparent hover:bg-[var(--ink-strong)] hover:text-[var(--bg)] sm:w-auto"
                            >
                                See measurable work
                                <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" aria-hidden>↗</span>
                            </Link>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1">
                        {SERVICES.map((service, index) => (
                            <motion.div
                                key={service}
                                variants={reduce ? undefined : serviceCard}
                                custom={index}
                            >
                                <motion.div
                                    animate={reduce ? undefined : { y: [0, -4, 0], x: [0, index % 2 === 0 ? 1.5 : -1.5, 0] }}
                                    whileHover={reduce ? undefined : { y: -5, transition: { duration: 0.3, ease: [...EASE] } }}
                                    transition={{
                                        duration: 7.2 + index * 0.65,
                                        delay: 1.2 + index * 0.35,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="group flex min-h-24 will-change-transform items-end justify-between rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] p-4 backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-[#507AF4]/50 hover:shadow-[0_18px_50px_-28px_rgba(137,31,251,0.65)] sm:min-h-28 sm:p-5 lg:min-h-0 lg:items-center"
                                >
                                    <span className="max-w-28 font-display text-[13px] font-bold uppercase leading-tight text-[var(--ink-strong)] sm:max-w-none sm:text-[14px]">
                                        {service}
                                    </span>
                                    <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--ink-faint)] transition-colors duration-300 group-hover:text-[#507AF4]">
                                        0{index + 1}
                                    </span>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
