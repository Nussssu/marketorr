import { Link } from '@inertiajs/react';
import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { consumeShowcaseArrival } from '../motion/ShowcaseTransition';
import { enter } from '../../lib/motion';
import ServiceScene from '../decor/ServiceScene';

/**
 * Hero for every sub-service page (Brand Strategy … Design System).
 *
 * The copy sits on the left — breadcrumb, place in the practice, title,
 * standfirst and deliverables — and the right shows the service itself: an
 * animated scene built for that service (`ServiceScene`), held in a framed
 * stage. When a sub-service has its own photograph, the frame shows that
 * instead.
 *
 * Nothing moves on scroll and nothing lies over the visual; the page simply
 * scrolls on. The only motion is the entrance and the scene's own loop, and
 * reduced motion renders both settled.
 *
 * @param {{ item: { slug: string, name: string, short: string, image: string|null, imageAlt?: string, accent: string, deliverables: string[], position: number, total: number, category: { slug: string, name: string } }, parentHref: string }} props
 */
export default function SubServiceHero({ item, parentHref }) {
    const reduce = useReducedMotion();

    /**
     * Arrived by clicking this sub-service's photograph in the category
     * showcase: that picture is already in flight to the frame, so the frame
     * appears in place instead of playing its own entrance.
     */
    const [arrived] = useState(consumeShowcaseArrival);

    const frameClass = 'relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--bg-soft)]';
    const words = item.name.toUpperCase().split(' ');
    let charIndex = 0;

    const rise = (delay, className, y = 18) => enter('fade-up', { dur: 0.8, delay, y, className });

    return (
        <section className="relative overflow-hidden bg-[var(--bg)] pb-12 pt-28 md:pb-16 md:pt-32 lg:min-h-svh lg:pb-20">
            <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
            <div
                className="pointer-events-none absolute right-[-10%] top-[10%] h-[620px] w-[620px] rounded-full"
                style={{ background: `radial-gradient(closest-side, ${item.accent}26, transparent)` }}
                aria-hidden
            />

            <div className="container-x relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
                <div>
                    <nav
                        {...rise(0.1, 'flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]', -10)}
                        aria-label="Breadcrumb"
                    >
                        <Link href="/services" className="tap-area transition-colors duration-200 hover:text-[var(--ink)]">Services</Link>
                        <span aria-hidden>/</span>
                        <Link href={parentHref} className="tap-area transition-colors duration-200 hover:text-[var(--ink)]">{item.category.name}</Link>
                        <span aria-hidden>/</span>
                        <span className="truncate text-[var(--ink)]">{item.name}</span>
                    </nav>

                    <p {...rise(0.2, 'mt-10 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--ink-faint)] md:mt-14')}>
                        {String(item.position).padStart(2, '0')} / {String(item.total).padStart(2, '0')} · {item.category.name}
                    </p>

                    <h1
                        className="mt-6 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-[var(--ink-strong)]"
                        style={{ fontSize: 'clamp(2.6rem, 6.4vw, 6.25rem)' }}
                        aria-label={item.name}
                    >
                        {words.map((word, w) => (
                            <span key={w} className="mr-[0.24em] inline-block whitespace-nowrap last:mr-0" aria-hidden>
                                {word.split('').map((char) => {
                                    const i = charIndex++;

                                    return (
                                        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                                            <span {...enter('mask-up', { dur: 1, delay: 0.3 + Math.min(i, 14) * 0.045, y: '115%', className: 'inline-block will-change-transform' })}>
                                                {char}
                                            </span>
                                        </span>
                                    );
                                })}
                            </span>
                        ))}
                    </h1>

                    <p {...rise(0.75, 'mt-6 max-w-md text-[17px] leading-relaxed text-[var(--mute)] md:text-lg')}>
                        {item.short}
                    </p>

                    {item.deliverables?.length > 0 && (
                        <ul {...rise(0.9, 'mt-8 flex flex-wrap gap-2')}>
                            {item.deliverables.map((deliverable) => (
                                <li
                                    key={deliverable}
                                    className="rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]"
                                >
                                    {deliverable}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div
                    {...(arrived
                        ? { className: frameClass }
                        : enter('lift', { dur: 1, delay: 0.35, y: 48, scale: 0.96, className: frameClass }))}
                >
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.imageAlt ?? `${item.name} featured visual`}
                            fetchPriority="high"
                            decoding="async"
                            draggable={false}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <>
                            <div className="grid-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden />
                            <ServiceScene slug={item.slug} still={Boolean(reduce)} className="absolute inset-0" />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
