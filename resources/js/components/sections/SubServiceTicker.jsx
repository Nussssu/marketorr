import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE } from '../../lib/motion';

const ROW_H = 28;
const FLIGHT_MS = 0.6;

/**
 * Vertical 3D sub-service ticker that lives inside a Branding / UI-UX gateway
 * card, beneath the dominant title. It shows the gateway's shared active
 * index — the same tick that steps the showcase rail on the card's right —
 * so the name and the image always change together: the active row sits
 * close and bright while the previous/next rows recede upward into depth
 * (translateZ + slight rotateX inside a perspective stage). The ticker is
 * presentational only: every row is `pointer-events-none`, so hovering it,
 * moving across it, or pressing a row can never start a page visit.
 * Navigation on this card belongs to the arrow and the "Explore …" CTA alone.
 *
 * The stepping rhythm (dwell, hover pause, off-screen pause) is owned by the
 * gateway card and passed in as `index`. Phones get the same upward step as
 * a light slide/fade with no 3D depth. Reduced motion renders a static
 * active row.
 *
 * @param {{
 *   category: { slug: string, items: Array<{ slug: string, name: string, accent: string }> },
 *   index?: number,
 * }} props
 */
export default function SubServiceTicker({ category, index = 0 }) {
    const reduce = useReducedMotion();
    const [rich, setRich] = useState(false);

    const items = category.items ?? [];
    const count = items.length;
    const safe = count > 0 ? ((index % count) + count) % count : 0;

    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px)');
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    if (count === 0) return null;

    const full = rich && !reduce;

    return (
        <div
            className="relative mt-5 h-[84px] overflow-hidden"
            style={full ? { perspective: '520px' } : undefined}
            aria-label={`${category.name} sub-services`}
        >
            {items.map((item, i) => {
                let off = (((i - safe) % count) + count) % count;
                if (off > count / 2) off -= count;
                if (Math.abs(off) > 1) return null;

                const active = off === 0;
                const row = (
                    <>
                        <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: item.accent, boxShadow: active ? `0 0 10px ${item.accent}` : undefined }}
                            aria-hidden
                        />
                        <span className="truncate">{item.name}</span>
                    </>
                );

                return (
                    <motion.div
                        key={item.slug}
                        initial={false}
                        animate={
                            full
                                ? {
                                    y: off * ROW_H,
                                    z: active ? 34 : -52,
                                    rotateX: off * 16,
                                    opacity: active ? 1 : 0.38,
                                    scale: active ? 1 : 0.86,
                                }
                                : { y: off * ROW_H, opacity: active ? 1 : 0.35, scale: active ? 1 : 0.94 }
                        }
                        transition={{ duration: reduce ? 0 : FLIGHT_MS, ease: [...EASE] }}
                        className="pointer-events-none absolute inset-x-0 top-[28px] flex h-[28px] items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={full ? { transformStyle: 'preserve-3d' } : undefined}
                        aria-hidden={!active}
                    >
                        <span
                            className={`pointer-events-none flex min-w-0 items-center gap-2.5 ${active ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]'}`}
                        >
                            {row}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}
