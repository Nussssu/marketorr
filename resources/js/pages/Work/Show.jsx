import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { SectionLabel, Tag } from '../../components/ui/primitives';

/** Entrance for each progression step — lifts in, staggered by the parent. */
const STEP_ITEM = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function CaseStudy({ project: p }) {

    return (
        <>
            <Head title={`${p.title} — Marketorr Case Study`} />
            <article className="bg-[var(--bg)] pb-24 pt-32">
                <div className="container-x">
                    <SectionLabel index="03" name="CASE STUDY" />
                    <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">{p.client} · {p.category} · {p.year}</p>
                    <h1 className="display-lg mt-4 uppercase text-[var(--ink-strong)]">{p.title}</h1>
                    <p className="mt-5 max-w-2xl text-lg text-[var(--mute)]">{p.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{p.tags.map((t) => <Tag key={t} accent={p.accent}>{t}</Tag>)}</div>

                    <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-2xl border border-[var(--line)]" aria-hidden>
                        <img src={p.image} alt={p.imageAlt} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}33, transparent 55%), linear-gradient(160deg, rgba(24,24,31,0.45), rgba(8,8,10,0.78))` }} />
                        {p.metric && (
                            <div className="absolute right-10 top-10 text-right">
                                <p className="font-display text-6xl font-extrabold text-white md:text-8xl">{p.metric}</p>
                                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60">{p.metricLabel}</p>
                            </div>
                        )}
                    </div>

                    <motion.div
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } }}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-12% 0px' }}
                        className="mt-10 grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch"
                    >
                        {[
                            { index: '01', label: 'Idea', copy: 'Positioning, strategy and creative direction rooted in research.', accent: '#891FFB' },
                            { index: '02', label: 'Experience', copy: 'Identity, interface, motion and content crafted as one system.', accent: '#507AF4' },
                            {
                                index: '03',
                                label: 'Result',
                                copy: p.metric
                                    ? `${p.metric} ${p.metricLabel} — measured, reported, compounded.`
                                    : 'Shipped, measured and handed over as a system the brand can keep building on.',
                                accent: '#1BE2EB',
                            },
                        ].flatMap((step, i) => {
                            const card = (
                                // Entrance lives on the motion wrapper so its inline transform
                                // never overrides the card's CSS hover lift.
                                <motion.div key={step.label} variants={STEP_ITEM} className="h-full">
                                    <div
                                        className="step-card h-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8"
                                        style={{ '--accent': step.accent }}
                                    >
                                        <span className="step-card__glow" aria-hidden />
                                        <span className="step-card__rule" aria-hidden />
                                        <h2 className="step-card__title mt-6 font-display text-xl font-extrabold uppercase tracking-[-0.01em] text-[var(--ink-strong)]">
                                            <span className="mr-1.5 text-[13px] font-bold tracking-[0.18em]" style={{ color: step.accent }}>
                                                {step.index} /
                                            </span>{' '}
                                            {step.label}
                                        </h2>
                                        <p className="step-card__copy mt-3 text-[15px] leading-[1.7] text-[var(--mute)]">{step.copy}</p>
                                    </div>
                                </motion.div>
                            );

                            if (i === 2) return [card];
                            return [
                                card,
                                <motion.span
                                    key={`${step.label}-link`}
                                    variants={STEP_ITEM}
                                    aria-hidden
                                    className="hidden self-center font-display text-lg text-[var(--ink-faint)] md:block"
                                >
                                    →
                                </motion.span>,
                            ];
                        })}
                    </motion.div>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link href="/#contact" data-cursor="cta" className="btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                            Get results like this ↗
                        </Link>
                        <Link href="/work" className="btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]">
                            ← All work
                        </Link>
                    </div>
                </div>
            </article>
        </>
    );
}
