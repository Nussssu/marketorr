import { Link } from '@inertiajs/react';
import { useReducedMotion } from 'framer-motion';
import { transitionTo } from '../motion/PageTransition';
import { enter } from '../../lib/motion';
import { useTapIntent } from '../../lib/tapIntent';
import ServiceScene from '../decor/ServiceScene';
import { withAlpha } from '../../lib/tokens';

/**
 * Column spans of the six tiles on the desktop bento: two rows of twelve,
 * with the wide tile moving from the left of the first row to the middle of
 * the second so the grid never reads as a plain table.
 */
const SPANS = ['lg:col-span-5', 'lg:col-span-4', 'lg:col-span-3', 'lg:col-span-3', 'lg:col-span-5', 'lg:col-span-4'];

/**
 * One service in the bento: its live scene above, its number and name below,
 * and the whole tile a link to that service's page.
 */
function ServiceTile({ item, index, href, span, reduce, onOpen, tapIntent }) {
    return (
        <li {...enter('fade-up', { dur: 0.8, delay: 0.45 + index * 0.08, y: 36, className: span })}>
            <Link
                href={href}
                data-cursor="explore"
                onPointerDown={tapIntent.onPointerDown}
                onPointerCancel={tapIntent.onPointerCancel}
                onClick={(event) => onOpen(event, href)}
                className="category-tile group flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] transition-colors duration-300"
                style={{ '--tile-accent': item.accent }}
            >
                <div className="relative min-h-0 flex-1">
                    <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
                    <div className="absolute inset-y-0 left-1/2 aspect-square h-full -translate-x-1/2 transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.04]">
                        <ServiceScene slug={item.slug} still={Boolean(reduce)} className="absolute inset-0" />
                    </div>
                </div>
                <div className="flex min-h-[52px] items-center gap-3 border-t border-[var(--line)] px-3.5 py-2.5 sm:px-5 sm:py-4">
                    <span className="hidden text-[10px] font-bold tracking-[0.2em] text-[var(--ink-faint)] sm:inline">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-2 min-w-0 flex-1 font-display text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[var(--ink)] sm:text-[14px] sm:tracking-[0.08em]">
                        {item.name}
                    </span>
                    <span className="text-[var(--ink-faint)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--ink)]" aria-hidden>→</span>
                </div>
            </Link>
        </li>
    );
}

/**
 * Hero for the Branding and UI/UX discipline pages: the discipline at a
 * glance.
 *
 * The name and tagline open the page, and beneath them a bento of the
 * discipline's services — each tile playing a small version of that service's
 * own animated scene (`ServiceScene`, the same one its page opens with) and
 * linking straight to it. The detailed showcase follows below.
 *
 * Nothing moves on scroll and nothing lies over the scenes; the only motion is
 * the entrance and the scenes' own loops, each parked while off screen.
 * Reduced motion renders it all settled.
 *
 * `blendTop` fades the accent glow in from the section's top edge, so a hero
 * stacked under another one joins it without a visible seam.
 *
 * @param {{ category: { slug: string, name: string, tagline: string, accent: string, items: Array<{ slug: string, name: string, accent: string }> }, blendTop?: boolean }} props
 */
export default function CategoryHero({ category, blendTop = false }) {
    const reduce = useReducedMotion();
    const tapIntent = useTapIntent();
    const title = category.name.toUpperCase();
    const items = category.items ?? [];

    const open = (event, href) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== undefined && event.button !== 0) return;
        tapIntent.onClick(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        transitionTo(href);
    };

    // A hero stacked under another (`blendTop`) needs no header clearance, so
    // on phones it keeps just a standard section gap above it.
    return (
        <section className={`relative overflow-hidden bg-[var(--bg)] pb-12 md:pt-32 lg:pb-16 ${blendTop ? 'pt-8' : 'pt-28'}`}>
            <div
                className="pointer-events-none absolute left-1/2 top-[-260px] h-[560px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-full"
                style={{
                    background: `radial-gradient(closest-side, ${withAlpha(category.accent, '2e')}, transparent)`,
                    ...(blendTop ? { maskImage: 'linear-gradient(to bottom, transparent 46%, black 78%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 46%, black 78%)' } : {}),
                }}
                aria-hidden
            />

            <div className="container-x relative">
                <nav
                    {...enter('fade-up', { dur: 0.7, delay: 0.1, y: -10, className: 'flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]' })}
                    aria-label="Breadcrumb"
                >
                    <Link href="/services" className="tap-area transition-colors duration-200 hover:text-[var(--ink)]">Services</Link>
                    <span aria-hidden>/</span>
                    <span className="text-[var(--ink)]">{category.name}</span>
                </nav>

                <div className="mt-8 flex flex-col gap-6 md:mt-10 lg:flex-row lg:items-end lg:justify-between">
                    <h1
                        className="heading-hero-size font-display font-extrabold uppercase leading-[0.85] tracking-[-0.04em] text-[var(--ink-strong)]"
                        aria-label={category.name}
                    >
                        {title.split('').map((char, i) => (
                            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom" aria-hidden>
                                <span {...enter('mask-up', { dur: 1, delay: 0.2 + i * 0.05, y: '115%', className: 'inline-block will-change-transform' })}>
                                    {char}
                                </span>
                            </span>
                        ))}
                    </h1>
                </div>

                {items.length > 0 && (
                    <ul className="mt-10 grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[240px] sm:gap-4 lg:mt-12 lg:auto-rows-[clamp(230px,30svh,320px)] lg:grid-cols-12">
                        {items.map((item, index) => (
                            <ServiceTile
                                key={item.slug}
                                item={item}
                                index={index}
                                href={`/services/${category.slug}/${item.slug}`}
                                span={SPANS[index % SPANS.length]}
                                reduce={reduce}
                                onOpen={open}
                                tapIntent={tapIntent}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
