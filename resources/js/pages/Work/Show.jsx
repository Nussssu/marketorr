import { Head, Link } from '@inertiajs/react';
import { PROJECTS } from '../../lib/projects';
import { SectionLabel, Tag } from '../../components/ui/primitives';

export default function CaseStudy({ slug }) {
    const p = PROJECTS.find((x) => x.slug === slug) ?? PROJECTS[0];

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
                        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}40, transparent 55%), linear-gradient(160deg,#18181F,#08080A)` }} />
                        <div className="absolute bottom-0 left-10 flex items-end gap-3">
                            {[110, 190, 280].map((h, i) => (
                                <span key={i} className="w-16 rounded-t-xl border md:w-24" style={{ height: h, background: `linear-gradient(180deg, ${[p.accent, '#507AF4', '#1BE2EB'][i]}, transparent)`, borderColor: `${[p.accent, '#507AF4', '#1BE2EB'][i]}55` }} />
                            ))}
                        </div>
                        <div className="absolute right-10 top-10 text-right">
                            <p className="font-display text-6xl font-extrabold text-white md:text-8xl">{p.metric}</p>
                            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60">{p.metricLabel}</p>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {[
                            ['01 / Idea', 'Positioning, strategy and creative direction rooted in research.', '#891FFB'],
                            ['02 / Experience', 'Identity, interface, motion and content crafted as one system.', '#507AF4'],
                            ['03 / Result', `${p.metric} ${p.metricLabel} — measured, reported, compounded.`, '#1BE2EB'],
                        ].map(([t, d, c]) => (
                            <div key={t} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
                                <span className="block h-[3px] w-12" style={{ background: c }} aria-hidden />
                                <h2 className="mt-4 font-display text-lg font-bold uppercase text-[var(--ink-strong)]">{t}</h2>
                                <p className="mt-2 text-[14px] leading-relaxed text-[var(--mute)]">{d}</p>
                            </div>
                        ))}
                    </div>

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
