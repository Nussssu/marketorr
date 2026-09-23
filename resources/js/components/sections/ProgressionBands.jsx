import { useEffect, useRef } from 'react';

/**
 * Full-width scroll-driven horizontal typography band.
 *
 * Replaces the old PROGRESSION block (Idea → Experience → Result + CTA card).
 * 3–4 oversized editorial rows of MarketoRR services/industries separated by
 * "—", each drifting horizontally with alternating base directions. Vertical
 * scroll velocity steers every row: fast scrolling speeds them up, slow
 * scrolling slows them down, and scrolling upward smoothly reverses them.
 * At rest the rows keep a slow cinematic drift — never a one-time marquee.
 * One word per row carries the purple-to-blue-to-cyan brand gradient;
 * everything else stays flat ink-strong for readability. A gentle
 * viewport-synced reveal (opacity, rise, scale on the wrapper) plays in the
 * same loop while the rows scroll horizontally.
 *
 * Performance contract: a single requestAnimationFrame loop per mount,
 * transform: translate3d() writes only, no React state updates on scroll,
 * cached row widths (remeasured on resize + font load), IntersectionObserver
 * gating so the loop idles off-screen, and full cleanup on unmount.
 * Reduced-motion users get the same rows rendered statically.
 */

const ROWS = [
    ['Branding', 'UI/UX', 'Web Design', 'Mobile Apps'],
    ['SaaS Product', 'Packaging', 'Motion', 'Design Systems'],
    ['E-Commerce', 'Fintech', 'Healthcare', 'Real Estate'],
    ['Fashion', 'Hospitality', 'Startups', 'Enterprise'],
];

/** One gradient-highlighted word per row — everything else stays ink-strong. */
const HIGHLIGHTS = ['UI/UX', 'Design Systems', 'Fintech', 'Startups'];

/** px/frame idle drift at 60fps; scroll velocity adds on top (clamped). */
const BASE_DRIFT = 0.5;
const VELOCITY_GAIN = 0.55;
const MAX_VELOCITY = 60;
const VELOCITY_SMOOTHING = 0.12;

function RowContent({ items, highlight }) {
    // One half of the seamless loop; the row renders it twice.
    // Doubled again so a single half always exceeds the viewport width.
    const half = [...items, ...items];
    return (
        <>
            {half.map((word, i) => (
                <span key={i} className="flex shrink-0 items-center">
                    <span className={word === highlight ? 'progression-highlight inline-block' : undefined}>{word}</span>
                    <span aria-hidden className="mx-6 text-[var(--scroll-sep)] md:mx-10">—</span>
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
        let lastY = window.scrollY;
        let velocity = 0;

        const frame = () => {
            if (!running) return;
            const y = window.scrollY;
            const target = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, y - lastY));
            lastY = y;
            velocity += (target - velocity) * VELOCITY_SMOOTHING;

            for (let i = 0; i < count; i += 1) {
                positions[i] += directions[i] * BASE_DRIFT + velocity * VELOCITY_GAIN;
                const half = halves[i] || 1;
                const wrapped = -((((positions[i] % half) + half) % half));
                const el = rows[i];
                if (el) el.style.transform = `translate3d(${wrapped.toFixed(2)}px,0,0)`;
            }

            // Cinematic reveal, same scroll source: the band gently settles
            // (opacity, rise, scale) as it travels through the viewport centre.
            // Written on the wrapper only — never on the row movers above.
            const rect = band.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const dist = Math.abs(rect.top + rect.height / 2 - vh / 2) / vh;
            const vis = Math.max(0, Math.min(1, 1 - dist * 1.15));
            const eased = vis * vis * (3 - 2 * vis);
            band.style.opacity = (0.25 + 0.75 * eased).toFixed(3);
            band.style.transform = `translate3d(0,${((1 - eased) * 28).toFixed(2)}px,0) scale(${(0.985 + 0.015 * eased).toFixed(4)})`;

            rafId = requestAnimationFrame(frame);
        };

        const start = () => {
            if (running) return;
            running = true;
            lastY = window.scrollY;
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
        <section aria-label="What MarketoRR designs" className="relative overflow-hidden pb-12 pt-6 md:pb-16 md:pt-8">
            <div ref={bandRef} className="flex flex-col gap-3 md:gap-4" aria-hidden>
                {ROWS.map((items, i) => (
                    <div key={items[0]} className={`overflow-hidden ${i === ROWS.length - 1 ? 'hidden md:block' : ''}`}>
                        <div
                            ref={(node) => {
                                rowRefs.current[i] = node;
                            }}
                            className="flex w-max whitespace-nowrap font-display text-[clamp(1.75rem,4.5vw,3.25rem)] font-light uppercase leading-[0.95] tracking-[-0.02em] text-[var(--scroll-ink)] will-change-transform"
                        >
                            <div className="flex shrink-0 items-center">
                                <RowContent items={items} highlight={HIGHLIGHTS[i]} />
                            </div>
                            <div className="flex shrink-0 items-center">
                                <RowContent items={items} highlight={HIGHLIGHTS[i]} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
