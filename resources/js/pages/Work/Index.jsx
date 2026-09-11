import { Head, Link } from '@inertiajs/react';
import { PROJECTS } from '../../lib/projects';
import { SectionLabel, Tag } from '../../components/ui/primitives';

export default function WorkIndex() {
    return (
        <>
            <Head title="Our Work — Marketorr" />
            <div className="bg-[var(--bg)] pb-24 pt-32">
                <div className="container-x">
                    <SectionLabel index="03" name="OUR WORK" />
                    <h1 className="display-lg mt-8 uppercase text-[var(--ink-strong)]">Work that <span className="text-gradient">creates impact.</span></h1>
                    <div className="mt-12 grid gap-10 md:grid-cols-2">
                        {PROJECTS.map((p) => (
                            <Link key={p.slug} href={`/work/${p.slug}`} data-cursor="view" className="group btn-press block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]" style={{ background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}33, transparent 55%), linear-gradient(160deg,#18181F,#08080A)` }} aria-hidden />
                                    <div className="absolute bottom-0 left-6 flex items-end gap-2" aria-hidden>
                                        {[70, 120, 180].map((h, i) => (
                                            <span key={i} className="w-10 rounded-t-md" style={{ height: h, background: `linear-gradient(180deg, ${[p.accent, '#507AF4', '#1BE2EB'][i]}, transparent)` }} />
                                        ))}
                                    </div>
                                    <p className="absolute right-6 top-6 font-display text-4xl font-extrabold text-white">{p.metric}</p>
                                </div>
                                <div className="p-6">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">{p.client} · {p.year}</p>
                                    <h2 className="mt-1 font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)]">{p.title}</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">{p.tags.map((t) => <Tag key={t} accent={p.accent}>{t}</Tag>)}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
