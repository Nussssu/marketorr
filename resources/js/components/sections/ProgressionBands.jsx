import { useEffect, useRef } from 'react';

/**
 * Full-width scroll-driven typography band under Our Work: what Marketorr
 * designs, and who for.
 *
 * Two oversized rows set in the site's heavy display face - disciplines in
 * solid ink, industries as a dim ghost of them - each with its own small caption, framed
 * by hairlines and fading out at both edges. A small four-point star in
 * the brand gradient separates the words. The rows drift slowly in opposite directions at a steady pace;
 * scrolling the page does not move, speed up or reveal them. One word per
 * row carries the brand gradient.
 *
 * Performance contract: a single requestAnimationFrame loop per mount,
 * transform writes only, cached row widths (remeasured on resize and font
 * load), IntersectionObserver gating so the loop idles off-screen, and full
 * cleanup on unmount. Reduced-motion users get the same rows rendered
 * statically.
 */

const ROWS = [
    {
        caption: 'Disciplines',
        items: ['Branding', 'UI/UX', 'Web Design', 'Mobile Apps', 'SaaS Product', 'Packaging', 'Motion', 'Design Systems'],
        highlight: 'UI/UX',
        ghost: false,
    },
    {
        caption: 'Industries',
        items: ['E-Commerce', 'Fintech', 'Healthcare', 'Real Estate', 'Fashion', 'Hospitality', 'Startups', 'Enterprise'],
        highlight: 'Startups',
        ghost: true,
    },
];

/** Steady drift speed, in px per second. */
const DRIFT_SPEED = 27;

/** The separator between words: a four-point star in the brand gradient. */
function Spark() {
    return (
        <svg viewBox="0 0 24 24" className="mx-[0.5em] h-[0.34em] w-[0.34em] shrink-0" aria-hidden>
            <defs>
                <linearGradient id="progression-spark" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#830DFD" />
                    <stop offset="0.5" stopColor="#4A76F8" />
                    <stop offset="1" stopColor="#10E2F1" />
                </linearGradient>
            </defs>
            <path d="M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z" fill="url(#progression-spark)" />
        </svg>
    );
}

function RowContent({ items, highlight }) {
    // One half of the seamless loop; the row renders it twice.
    return (
        <>
            {items.map((word, i) => (
                <span key={i} className="flex shrink-0 items-center">
                    <span className={word === highlight ? 'progression-highlight inline-block' : undefined}>{word}</span>
                    <Spark />
                </span>
            ))}
        </>
    );
}

export default function ProgressionBands() {
    const bandRef = useRef(null);
    const rowRefs = useRef([]);
    const reduceRef = useRef(false);

    useEffect(() => {
        reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const band = bandRef.current;
        if (!band || reduceRef.current) return undefined;

        const rows = rowRefs.current.filter(Boolean);
        if (rows.length === 0) return undefined;

        const count = rows.length;
        const positions = new Array(count).fill(0);
        const halves = new Array(count).fill(0);
        const directions = rows.map((_, i) => (i % 2 === 0 ? -1 : 1));

        const measure = () => {
            rows.forEach((row, i) => {
                halves[i] = row.scrollWidth / 2 || 1;
            });
        };
        measure();
        if (document.fonts?.ready) {
            document.fonts.ready.then(measure).catch(() => {});
        }

        let rafId = 0;
        let running = false;
        let lastTime = 0;

        const frame = (time) => {
            if (!running) return;
            // Time-based, so the pace is the same at any refresh rate; a long
            // gap (a background tab) is capped rather than jumped across.
            const seconds = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 0;
            lastTime = time;

            for (let i = 0; i < count; i += 1) {
                positions[i] += directions[i] * DRIFT_SPEED * seconds;
                const half = halves[i] || 1;
                const wrapped = -((((positions[i] % half) + half) % half));
                const el = rows[i];
                if (el) el.style.transform = `translate3d(${wrapped.toFixed(2)}px,0,0)`;
            }

            rafId = requestAnimationFrame(frame);
        };

        const start = () => {
            if (running) return;
            running = true;
            lastTime = 0;
            rafId = requestAnimationFrame(frame);
        };
        const stop = () => {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) start();
                else stop();
            },
            { rootMargin: '20% 0px' },
        );
        observer.observe(band);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
            stop();
        };
    }, []);

    return (
        <section aria-label="What Marketorr designs, and who for" className="relative overflow-hidden pb-12 pt-6 md:pb-16 md:pt-8">
            <div ref={bandRef} className="border-y border-[var(--line)]" aria-hidden>
                {ROWS.map((row, i) => (
                    <div key={row.caption} className={i > 0 ? 'border-t border-[var(--line)]' : undefined}>
                        <p className="container-x pt-5 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] md:pt-6">
                            {row.caption}
                        </p>
                        <div className="progression-row overflow-hidden py-3 md:py-5">
                            <div
                                ref={(node) => {
                                    rowRefs.current[i] = node;
                                }}
                                className={`flex w-max whitespace-nowrap font-display text-[clamp(2.4rem,7vw,6.25rem)] font-extrabold uppercase leading-[1] tracking-[-0.035em] will-change-transform ${
                                    row.ghost ? 'progression-ghost' : 'text-[var(--ink-strong)]'
                                }`}
                            >
                                <div className="flex shrink-0 items-center">
                                    <RowContent items={row.items} highlight={row.highlight} />
                                </div>
                                <div className="flex shrink-0 items-center">
                                    <RowContent items={row.items} highlight={row.highlight} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
