import { Link } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE } from '../../lib/motion';
import { useTapIntent } from '../../lib/tapIntent';

const AUTOPLAY_MS = 5000;
const GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

const subUrl = (catSlug, subSlug) => `/services/${catSlug}/${subSlug}`;

/**
 * Featured showcase slider: the active sub-service's visual crossfades,
 * slides and settles while its copy swaps beside it. Auto-advances every
 * few seconds; arrows, category tabs and the progress segments all navigate
 * on hover or click.
 */
export default function ServicesSlider({ categories = [] }) {
    const reduce = useReducedMotion();
    const tapIntent = useTapIntent();
    const [catIndex, setCatIndex] = useState(0);
    const [index, setIndex] = useState(0);
    const [hoverPaused, setHoverPaused] = useState(false);
    const [hiddenPaused, setHiddenPaused] = useState(false);

    const cat = categories[catIndex] ?? null;
    const items = cat?.items ?? [];
    const current = items.length ? items[index % items.length] : null;
    const paused = hoverPaused || hiddenPaused;

    useEffect(() => {
        const onVis = () => setHiddenPaused(document.hidden);
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    useEffect(() => {
        if (reduce || paused || items.length < 2) return undefined;
        const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), AUTOPLAY_MS);
        return () => clearTimeout(t);
    }, [reduce, paused, items.length, index, catIndex]);

    if (!cat || !current) return null;

    const go = (next) => setIndex(((next % items.length) + items.length) % items.length);
    const selectCategory = (i) => {
        setCatIndex(i);
        setIndex(0);
    };

    return (
        <div className="mt-14">
            <div className="flex flex-wrap gap-3" role="tablist" aria-label="Service categories">
                {categories.map((c, i) => {
                    const isActive = i === catIndex;
                    return (
                        <button
                            key={c.slug}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => selectCategory(i)}
                            className={`btn-press rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                                isActive ? 'text-white' : 'border border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]'
                            }`}
                            style={isActive ? { background: GRADIENT } : undefined}
                        >
                            {c.name}
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
                <div
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0B0B10]"
                    onMouseEnter={() => setHoverPaused(true)}
                    onMouseLeave={() => setHoverPaused(false)}
                >
                    <AnimatePresence initial={false}>
                        <motion.img
                            key={current.slug}
                            src={current.image}
                            alt={`${current.name} featured visual`}
                            decoding="async"
                            initial={{ opacity: 0, scale: reduce ? 1 : 1.07, x: reduce ? 0 : 48 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: reduce ? 1 : 1.03 }}
                            transition={{ duration: reduce ? 0 : 0.65, ease: [...EASE] }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </AnimatePresence>
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: `linear-gradient(200deg, transparent 55%, rgba(8,8,10,0.55)), radial-gradient(90% 60% at 80% 100%, ${current.accent}26, transparent 70%)` }}
                        aria-hidden
                    />
                    <p className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm">
                        {cat.name} — {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                    </p>
                </div>

                <div className="flex flex-col justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current.slug}
                            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                            transition={{ duration: reduce ? 0 : 0.32, ease: [...EASE] }}
                        >
                            <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: current.accent }}>
                                {cat.name}
                            </p>
                            <h3 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-[var(--ink-strong)] md:text-4xl">
                                {current.name}
                            </h3>
                            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--mute)]">
                                {current.short}
                            </p>
                            <Link
                                href={subUrl(cat.slug, current.slug)}
                                data-cursor="cta"
                                {...tapIntent}
                                className="btn-press mt-7 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white"
                                style={{ background: GRADIENT }}
                            >
                                View Service <span aria-hidden>↗</span>
                            </Link>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-9 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => go(index - 1)}
                            aria-label="Previous sub-service"
                            className="btn-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--field-line)] hover:text-[var(--ink-strong)]"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={() => go(index + 1)}
                            aria-label="Next sub-service"
                            className="btn-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--field-line)] hover:text-[var(--ink-strong)]"
                        >
                            →
                        </button>
                        <div className="ml-2 flex flex-1 items-center gap-2">
                            {items.map((s, i) => (
                                <button
                                    key={s.slug}
                                    type="button"
                                    onClick={() => go(i)}
                                    onMouseEnter={() => go(i)}
                                    aria-label={`Show ${s.name}`}
                                    aria-current={i === index}
                                    className="group flex h-11 flex-1 items-center md:h-6"
                                >
                                    <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-[var(--line)]">
                                        {i === index && !reduce && (
                                            <span
                                                key={`${cat.slug}-${index}`}
                                                className="animate-slider-fill block h-full w-full origin-left"
                                                style={{ background: GRADIENT, animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                                            />
                                        )}
                                        {i === index && reduce && (
                                            <span className="block h-full w-full" style={{ background: GRADIENT }} />
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
