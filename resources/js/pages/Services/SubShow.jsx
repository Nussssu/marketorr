import { Head, Link } from '@inertiajs/react';
import SubServiceHero from '../../components/sections/SubServiceHero';
import SubServiceCaseStudy from '../../components/sections/SubServiceCaseStudy';
import { transitionTo } from '../../components/motion/PageTransition';
import { useTapIntent } from '../../lib/tapIntent';
import MagneticButton from '../../components/motion/MagneticButton';

export default function SubServicePage({ item, siblings, parentHref, parentName }) {
    const tapIntent = useTapIntent();

    const goSibling = (event, url) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo(url);
    };

    return (
        <>
            <Head title={`${item.name} — Marketorr`} />
            <article className="bg-[var(--bg)] pb-24">
                <SubServiceHero item={item} parentHref={parentHref} />

                <div className="container-x">
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--mute)]">{item.description}</p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <MagneticButton>
                            <Link href="/#contact" data-cursor="cta" className="btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                                Start a project ↗
                            </Link>
                        </MagneticButton>
                        <Link href={parentHref} className="btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]">
                            ← {parentName}
                        </Link>
                    </div>

                    <div className="mt-14 grid gap-10 lg:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8">
                            <h2 className="font-display text-xl font-bold uppercase text-[var(--ink-strong)]">What you get</h2>
                            <ul className="mt-5 space-y-3 text-[15px] text-[var(--mute)]">
                                {item.deliverables.map((d) => (
                                    <li key={d} className="flex items-center gap-3">
                                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.accent }} aria-hidden /> {d}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8">
                            <div>
                                <h2 className="font-display text-xl font-bold uppercase text-[var(--ink-strong)]">Part of {item.category.name}</h2>
                                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--mute)]">
                                    {item.short} Combined with the rest of the {item.category.name} practice, it ships as one coherent system — not a pile of deliverables.
                                </p>
                            </div>
                            <Link href="/contact" data-cursor="cta" className="btn-press mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                                Discuss this service ↗
                            </Link>
                        </div>
                    </div>

                    {item.case_study && <SubServiceCaseStudy study={item.case_study} />}

                    {siblings.length > 0 && (
                        <nav className="mt-14 flex flex-wrap gap-3" aria-label="Related sub-services">
                            {siblings.map((s) => (
                                <Link
                                    key={s.slug}
                                    href={s.url}
                                    data-cursor="explore"
                                    onPointerDown={tapIntent.onPointerDown}
                                    onPointerCancel={tapIntent.onPointerCancel}
                                    onClick={(event) => goSibling(event, s.url)}
                                    className="btn-press inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:text-[var(--ink)]"
                                >
                                    {s.name} →
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
            </article>
        </>
    );
}
