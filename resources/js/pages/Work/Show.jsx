import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import WorkHero from '../../components/sections/WorkHero';
import { transitionTo } from '../../components/motion/PageTransition';
import MagneticButton from '../../components/motion/MagneticButton';
import { useTapIntent } from '../../lib/tapIntent';
import { EASE } from '../../lib/motion';
import { Tag } from '../../components/ui/primitives';

/**
 * Dedicated project page.
 *
 * Opens exactly like a sub-service page: the same colour-panel page cover on
 * click, then `WorkHero` — the sub-service hero scene, same planes, same
 * timings, same per-character title rise — carrying only the project's name.
 *
 * Once the hero hands off, the written detail sits in the left column and the
 * project's own photographs run down the right. Everything in that detail is
 * transcribed from the project's published page on marketorr.com.bd (see
 * `Project::publicBrief()`); a project with no transcribed entry renders fewer
 * blocks rather than inventing copy for them.
 */

/** One titled block of transcribed detail; renders nothing when it has no content. */
function DetailBlock({ title, children }) {
    if (!children) return null;

    return (
        <section>
            <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

/** Every gallery frame shares one reveal, so the column reads as a single sequence. */
function GalleryFigure({ image, index, reduce }) {
    return (
        <motion.figure
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : Math.min(index, 3) * 0.06, ease: [...EASE] }}
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)]"
        >
            <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block w-full"
            />
        </motion.figure>
    );
}

export default function CaseStudy({ project: p }) {
    const reduce = useReducedMotion();
    const tapIntent = useTapIntent();
    const brief = p.brief ?? null;

    const gallery = (p.caseStudy ?? []).flatMap((section) => section.images ?? []);

    const goTo = (event, url) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo(url);
    };

    const hasDetails = Boolean(
        brief && (brief.overview || brief.workedOn.length || brief.services.length || brief.highlights.length),
    );

    const details = (
        <div className="space-y-12">
            <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                    {[p.client, p.category, p.year].filter(Boolean).join(' · ')}
                </p>
                {p.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                            <Tag key={t} accent={p.accent}>{t}</Tag>
                        ))}
                    </div>
                )}
            </div>

            {hasDetails ? (
                <>
                    <DetailBlock title="Overview">
                        {brief.overview ? (
                            <p className="text-[16px] leading-[1.8] text-[var(--mute)]">{brief.overview}</p>
                        ) : null}
                    </DetailBlock>

                    <DetailBlock title="What Marketorr worked on">
                        {brief.workedOn.length > 0 ? (
                            <ul className="space-y-3 text-[15px] leading-relaxed text-[var(--mute)]">
                                {brief.workedOn.map((row) => (
                                    <li key={row} className="flex gap-3">
                                        <span
                                            className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full"
                                            style={{ background: p.accent }}
                                            aria-hidden
                                        />
                                        {row}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </DetailBlock>

                    <DetailBlock title="Services delivered">
                        {brief.services.length > 0 ? (
                            <ul className="flex flex-wrap gap-2">
                                {brief.services.map((service) => (
                                    <li key={service}>
                                        <Tag accent={p.accent}>{service}</Tag>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </DetailBlock>

                    <DetailBlock title="Highlights">
                        {brief.highlights.length > 0 ? (
                            <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                                {brief.highlights.map((row) => (
                                    <div key={row.label} className="py-4">
                                        <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                                            {row.label}
                                        </dt>
                                        <dd className="mt-1 text-[15px] leading-relaxed text-[var(--ink)]">{row.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : null}
                    </DetailBlock>

                    <DetailBlock title="Client">
                        {brief.client ? (
                            <p className="text-[15px] leading-relaxed text-[var(--ink)]">
                                {brief.client}
                                {brief.website && (
                                    <>
                                        <br />
                                        <a
                                            href={brief.website}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="mt-1 inline-block text-[var(--mute)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--ink-strong)]"
                                        >
                                            {brief.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
                                        </a>
                                    </>
                                )}
                            </p>
                        ) : null}
                    </DetailBlock>

                    {brief.behanceUrl && (
                        <DetailBlock title="Full project">
                            <a
                                href={brief.behanceUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[15px] leading-relaxed text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--ink-strong)]"
                            >
                                See every piece on Behance ↗
                            </a>
                        </DetailBlock>
                    )}

                    {brief.sourceUrl && (
                        <DetailBlock title="Source">
                            <a
                                href={brief.sourceUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[13px] leading-relaxed text-[var(--mute)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--ink-strong)]"
                            >
                                Published project entry on marketorr.com.bd ↗
                            </a>
                        </DetailBlock>
                    )}
                </>
            ) : (
                p.description && <p className="text-[16px] leading-[1.8] text-[var(--mute)]">{p.description}</p>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
                <MagneticButton>
                    <Link
                        href="/#contact"
                        data-cursor="cta"
                        className="btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white"
                        style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                    >
                        Start a project ↗
                    </Link>
                </MagneticButton>
                <Link
                    href="/work"
                    data-cursor="explore"
                    onPointerDown={tapIntent.onPointerDown}
                    onPointerCancel={tapIntent.onPointerCancel}
                    onClick={(event) => goTo(event, '/work')}
                    className="btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]"
                >
                    ← All work
                </Link>
            </div>
        </div>
    );

    return (
        <>
            <Head title={`${p.title} — Marketorr`} />
            <article className="bg-[var(--bg)] pb-28">
                <WorkHero project={p} />

                <div className="container-x pt-16 md:pt-20">
                    {gallery.length > 0 ? (
                        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-16">
                            <div className="lg:sticky lg:top-28 lg:self-start">{details}</div>
                            <div className="space-y-6 md:space-y-8">
                                {gallery.map((image, index) => (
                                    <GalleryFigure key={image.src} image={image} index={index} reduce={reduce} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl">{details}</div>
                    )}
                </div>
            </article>
        </>
    );
}
