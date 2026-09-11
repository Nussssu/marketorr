import { Head, Link } from '@inertiajs/react';
import { PROJECTS } from '../../lib/projects';
import { SectionLabel, Tag } from '../../components/ui/primitives';
import ScrollHeading from '../../components/motion/ScrollHeading';

export default function WorkIndex() {
    return (
        <>
            <Head title="Our Work — Marketorr" />
            <div className="bg-[var(--bg)] pb-24 pt-32">
                <div className="container-x">
                    <SectionLabel index="03" name="OUR WORK" />
                    <ScrollHeading className="mt-8">
                        <h1 className="display-lg uppercase text-[var(--ink-strong)]">Work that <span className="text-gradient">creates impact.</span></h1>
                    </ScrollHeading>
                    <div className="mt-12 grid gap-10 md:grid-cols-2">
                        {PROJECTS.map((p) => (
                            <Link key={p.slug} href={`/work/${p.slug}`} data-cursor="view" className="group btn-press block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                                <div className="relative aspect-[16/10] overflow-hidden bg-[#111116]">
                                    <img src={p.image} alt={p.imageAlt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                                    <div className="absolute inset-0" style={{ background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}2e, transparent 55%), linear-gradient(160deg, rgba(24,24,31,0.5), rgba(8,8,10,0.8))` }} aria-hidden />
                                    {p.metric && <p className="absolute right-6 top-6 font-display text-4xl font-extrabold text-white">{p.metric}</p>}
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
