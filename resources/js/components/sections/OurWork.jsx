import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../../lib/projects';
import { SectionLabel, Tag } from '../ui/primitives';
import RevealText from '../motion/RevealText';
import Stage from '../decor/Stage';

/* Abstract premium visual per project — artwork stays cinematic in both themes */
function ProjectVisual({ p, glow }) {
    return (
        <div className="relative h-full w-full overflow-hidden bg-[#111116]">
            <div
                className="absolute inset-0 transition-transform duration-200 ease-out group-hover:scale-[1.025]"
                style={{
                    background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}33, transparent 55%), linear-gradient(160deg, #18181F, #08080A)`,
                }}
                aria-hidden
            />
            <div className="absolute inset-0 grid grid-cols-6 gap-px opacity-20" aria-hidden>
                {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} className="border-r border-white/10" />
                ))}
            </div>
            {/* rising bars composition */}
            <div className="absolute bottom-0 left-4 flex origin-bottom-left scale-75 items-end gap-3 md:left-8 md:scale-100" aria-hidden>
                {[90, 150, 220].map((h, i) => (
                    <span
                        key={i}
                        className="w-12 rounded-t-lg border md:w-16"
                        style={{
                            height: h,
                            background: `linear-gradient(180deg, ${[p.accent, '#507AF4', '#1BE2EB'][i]}, transparent)`,
                            borderColor: `${[p.accent, '#507AF4', '#1BE2EB'][i]}55`,
                            boxShadow: glow([p.accent, '#507AF4', '#1BE2EB'][i], 40),
                            opacity: 0.9,
                        }}
                    />
                ))}
            </div>
            <div className="absolute right-4 top-4 text-right md:right-8 md:top-8" aria-hidden>
                <p className="font-display text-[clamp(2rem,8vw,4.5rem)] font-extrabold text-white/90">{p.metric}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">{p.metricLabel}</p>
            </div>
            <div className="group absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black md:bottom-6 md:right-6 md:h-14 md:w-14" aria-hidden>
                <span data-arrow>↗</span>
            </div>
            <span className="absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-200 group-hover:border-white/15" aria-hidden />
            <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }} aria-hidden />
        </div>
    );
}

function Card({ p, glow, className = '', ratio = 'aspect-[16/10]' }) {
    return (
        <motion.div whileTap={{ scale: 0.985 }} transition={{ duration: 0.18 }} className={className}>
            <Link href={`/work/${p.slug}`} data-cursor="view" className="group block" aria-label={`View ${p.title} case study`}>
                <div className={`${ratio} overflow-hidden rounded-2xl border border-[var(--line)]`}>
                    <ProjectVisual p={p} glow={glow} />
                </div>
                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">{p.client} · {p.year}</p>
                        <h3 className="mt-1 font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)] md:text-3xl">
                            <span className="bg-[linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)] bg-[length:0%_100%] bg-no-repeat bg-clip-text transition-[background-size,color] duration-200 group-hover:bg-[length:100%_100%] group-hover:text-transparent">
                                {p.title}
                            </span>
                        </h3>
                        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--mute)]">{p.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {p.tags.map((t) => (
                                <Tag key={t} accent={p.accent}>{t}</Tag>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-display text-2xl font-extrabold" style={{ color: p.accent }}>{p.metric}</p>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{p.metricLabel}</p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function OurWork({ glow }) {
    return (
        <section id="work" className="relative overflow-hidden bg-[var(--bg-soft)] section-pad">
            <Stage variant="work" />
            <div className="container-x relative">
                <SectionLabel index="03" name="OUR WORK" />
                {/* sticky intro */}
                <div className="relative">
                    <div className="lg:sticky lg:top-24 lg:z-10 lg:py-6">
                        <RevealText as="h2" className="display-lg uppercase text-[var(--ink-strong)]" lines={['Work that', 'creates impact.']} />
                        <p className="mt-4 max-w-lg text-[15px] text-[var(--mute)]">
                            Selected work across branding, digital products, UI/UX, campaigns, and growth-focused experiences.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-12 lg:gap-14">
                        <Card p={PROJECTS[0]} glow={glow} ratio="aspect-[16/9]" />
                        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
                            <Card p={PROJECTS[1]} glow={glow} className="lg:col-span-5" ratio="aspect-[3/4]" />
                            <div className="flex flex-col justify-center lg:col-span-7">
                                <p className="font-display text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">Progression</p>
                                <p className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-[var(--ink-strong)] md:text-4xl">
                                    Idea <span className="text-[#891FFB]">→</span> Experience <span className="text-[#507AF4]">→</span> Result <span className="text-[#1BE2EB]">→</span>
                                </p>
                                <div className="mt-6 h-[3px] w-full" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }} aria-hidden />
                                <p className="mt-6 max-w-md text-[14px] text-[var(--mute)]">Every engagement moves through the same operating system — sharp idea, crafted experience, measured result.</p>
                            </div>
                        </div>
                        <Card p={PROJECTS[2]} glow={glow} ratio="aspect-[21/10]" />
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
                            <Card p={PROJECTS[3]} glow={glow} ratio="aspect-[4/3]" />
                            <div className="flex flex-col justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 md:p-12">
                                <p className="font-display text-4xl font-extrabold uppercase leading-none text-[var(--ink-strong)]">Your brand<br /><span className="text-gradient">could be next.</span></p>
                                <Link href="/#contact" data-cursor="cta" className="btn-press mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                                    Start a project ↗
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Link href="/work" className="btn-press link-underline text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
                        View all work →
                    </Link>
                </div>
            </div>
        </section>
    );
}
