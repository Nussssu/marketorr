import { Link } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { SERVICES } from '../../lib/services';
import { SectionLabel, Tag } from '../ui/primitives';
import RevealText from '../motion/RevealText';

export default function Services() {
    const [active, setActive] = useState(null);
    const [hover, setHover] = useState(null);
    const reduce = useReducedMotion();

    return (
        <section id="services" className="relative bg-[var(--bg)] py-24 md:py-36">
            <div className="container-x">
                <SectionLabel index="02" name="SERVICES" />
                <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <RevealText as="h2" className="display-lg uppercase text-[var(--ink-strong)]" lines={['Branding', '& UI/UX']} />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="max-w-md text-[15px] leading-relaxed text-[var(--mute)]"
                    >
                        We create brands and digital experiences that are clear, memorable, intuitive, and built for growth.
                    </motion.p>
                </div>

                <div className="mt-14 border-t border-[var(--line)]">
                    {SERVICES.map((s) => {
                        const isOpen = active === s.slug;
                        const isHover = hover === s.slug;
                        const grad = s.accentTo
                            ? `linear-gradient(90deg, ${s.accent}, ${s.accentTo})`
                            : s.accent;
                        return (
                            <div key={s.slug} className="group relative border-b border-[var(--line)]">
                                <Link
                                    href={`/services/${s.slug}`}
                                    data-cursor="explore"
                                    onMouseEnter={() => setHover(s.slug)}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => setActive(s.slug)}
                                    className="btn-press relative grid gap-3 px-1 py-8 transition-all duration-500 md:grid-cols-[64px_1fr_auto] md:items-center md:gap-8 md:px-4 md:py-10 md:hover:px-7"
                                    aria-expanded={isOpen}
                                >
                                    {/* accent edge */}
                                    <span
                                        className="absolute left-0 top-0 h-full w-[3px] origin-top transition-transform duration-500"
                                        style={{ background: grad, transform: isHover || isOpen ? 'scaleY(1)' : 'scaleY(0)' }}
                                        aria-hidden
                                    />
                                    <span className="font-display text-sm font-bold text-[var(--ink-faint)]">{s.index}</span>
                                    <span>
                                        <span className="flex items-center gap-4">
                                            <span className="font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] transition-colors duration-300 md:text-5xl">
                                                {s.name}
                                            </span>
                                            <span
                                                className={`hidden h-2.5 w-2.5 rounded-full md:block ${reduce ? '' : 'animate-pulse'}`}
                                                style={{ background: s.accent, boxShadow: `0 0 16px ${s.accent}` }}
                                                aria-hidden
                                            />
                                        </span>
                                        <span className="mt-2 block max-w-xl text-[14px] text-[var(--mute)]">{s.short}</span>
                                        <AnimatePresence initial={false}>
                                            {(isHover || isOpen) && (
                                                <motion.span
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                                    className="block overflow-hidden"
                                                >
                                                    <span className="mt-4 block text-[14px] leading-relaxed text-[var(--mute)]">{s.description}</span>
                                                    <span className="mt-4 flex flex-wrap gap-2">
                                                        {s.capabilities.slice(0, 6).map((c) => (
                                                            <Tag key={c} accent={s.accent}>{c}</Tag>
                                                        ))}
                                                    </span>
                                                    {/* desktop preview bar */}
                                                    <span className="mt-5 hidden items-end gap-2 md:flex" aria-hidden>
                                                        {[38, 62, 92].map((h, i) => (
                                                            <span
                                                                key={i}
                                                                className="w-10 rounded-t-md"
                                                                style={{
                                                                    height: h,
                                                                    background: `linear-gradient(180deg, ${[s.accent, s.accentTo ?? s.accent, '#1BE2EB'][i] ?? s.accent}, transparent)`,
                                                                    opacity: 0.85,
                                                                }}
                                                            />
                                                        ))}
                                                        <span className="ml-3 font-display text-[11px] font-bold tracking-[0.2em] text-[var(--ink-faint)]">
                                                            IDEA → EXPERIENCE → RESULT
                                                        </span>
                                                    </span>
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </span>
                                    <span className="flex items-center gap-4">
                                        <span className="hidden text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)] group-hover:text-[var(--ink)] md:block">
                                            {isOpen ? 'Open' : 'Explore'}
                                        </span>
                                        <span
                                            className="btn-press flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] text-lg text-[var(--ink)] transition-all duration-500 group-hover:border-transparent group-hover:text-white"
                                            style={isHover ? { background: grad } : undefined}
                                            aria-hidden
                                        >
                                            <span className={`block transition-transform duration-500 ${isHover ? 'rotate-45' : ''}`}>↗</span>
                                        </span>
                                    </span>
                                </Link>
                                {/* mobile tap expand */}
                                <button
                                    className="btn-press mb-4 ml-1 rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] md:hidden"
                                    onClick={() => setActive(isOpen ? null : s.slug)}
                                    aria-expanded={isOpen}
                                >
                                    {isOpen ? 'Hide details' : 'Tap for details'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
