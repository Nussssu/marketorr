import { Head, Link } from '@inertiajs/react';
import { SectionLabel, Tag } from '../../components/ui/primitives';
import MagneticButton from '../../components/motion/MagneticButton';

export default function ServicePage({ service: s, services }) {
    const grad = s.accentTo ? `linear-gradient(90deg, ${s.accent}, ${s.accentTo})` : s.accent;

    return (
        <>
            <Head title={`${s.name} — Marketorr`} />
            <article className="bg-[var(--bg)] pb-24 pt-32">
                <div className="container-x">
                    <SectionLabel index={s.index} name={s.name.toUpperCase()} />
                    <h1 className="display-lg mt-8 uppercase text-[var(--ink-strong)]">{s.name}</h1>
                    <p className="mt-6 max-w-2xl text-lg text-[var(--mute)]">{s.description}</p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <MagneticButton>
                            <Link href="/#contact" data-cursor="cta" className="btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                                Start a project ↗
                            </Link>
                        </MagneticButton>
                        <Link href="/work" className="btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]">
                            View work →
                        </Link>
                    </div>

                    {/* progression visual */}
                    <div className="mt-14 flex items-end gap-4" aria-hidden>
                        {[s.accent, s.accentTo ?? '#507AF4', '#1BE2EB'].map((c, i) => (
                            <span key={i} className="w-20 rounded-t-xl border md:w-28" style={{ height: 70 + i * 60, background: `linear-gradient(180deg, ${c}66, transparent)`, borderColor: `${c}44` }} />
                        ))}
                        <span className="mb-2 ml-2 h-[3px] flex-1" style={{ background: grad }} />
                    </div>

                    <div className="mt-14 grid gap-10 lg:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8">
                            <h2 className="font-display text-xl font-bold uppercase text-[var(--ink-strong)]">Capabilities</h2>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {s.capabilities.map((c) => (
                                    <Tag key={c} accent={s.accent}>{c}</Tag>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8">
                            <h2 className="font-display text-xl font-bold uppercase text-[var(--ink-strong)]">What you get</h2>
                            <ul className="mt-5 space-y-3 text-[15px] text-[var(--mute)]">
                                {s.deliverables.map((d) => (
                                    <li key={d} className="flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full" style={{ background: grad }} aria-hidden /> {d}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-7 grid grid-cols-2 gap-4">
                                {s.outcomes.map((o) => (
                                    <div key={o.label} className="rounded-xl bg-[var(--surface-2)] p-4">
                                        <p className="font-display text-2xl font-extrabold text-[var(--ink-strong)]">{o.value}</p>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{o.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <nav className="mt-14 flex flex-wrap gap-3" aria-label="Other services">
                        {services.filter((x) => x.slug !== s.slug).map((o) => (
                            <Link key={o.slug} href={`/services/${o.slug}`} data-cursor="explore" className="btn-press inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:text-[var(--ink)]">
                                {o.name} →
                            </Link>
                        ))}
                    </nav>
                </div>
            </article>
        </>
    );
}
