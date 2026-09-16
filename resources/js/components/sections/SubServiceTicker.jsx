import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';

const ROW_H = 28;
const DWELL_MS = 2600;
const FLIGHT_MS = 0.6;

/**
 * Vertical 3D sub-service ticker that lives inside a Branding / UI-UX gateway
 * card, beneath the dominant title. Cycles the category's sub-services upward
 * one by one: the active row sits close and bright while the previous/next
 * rows recede upward into depth (translateZ + slight rotateX inside a
 * perspective stage). The ticker is presentational only: every row is
 * `pointer-events-none`, so hovering it, moving across it, or pressing a row
 * as it cycles can never start a page visit. Navigation on this card belongs
 * to the arrow and the "Explore …" CTA alone.
 *
 * Phones get the same upward cycle as a light slide/fade with no 3D depth.
 * Reduced motion renders a static active row.
 *
 * @param {{ category: { slug: string, items: Array<{ slug: string, name: string, accent: string }> } }} props
 */
export default function SubServiceTicker({ category }) {
    const reduce = useReducedMotion();
    const boxRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [rich, setRich] = useState(false);

    const items = category.items ?? [];
    const count = items.length;

    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px)');
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const box = boxRef.current;
        if (!box || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
        io.observe(box);

        return () => io.disconnect();
    }, []);

    useEffect(() => {
        if (reduce || count < 2 || !visible || hovered) return undefined;
        const id = setInterval(() => {
            if (!document.hidden) setIndex((i) => (i + 1) % count);
        }, DWELL_MS);

        return () => clearInterval(id);
    }, [reduce, count, visible, hovered]);

    if (count === 0) return null;

    const full = rich && !reduce;

    return (
        <div
            ref={boxRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative mt-5 h-[84px] overflow-hidden"
            style={full ? { perspective: '520px' } : undefined}
            aria-label={`${category.name} sub-services`}
        >
            {items.map((item, i) => {
                let off = (((i - index) % count) + count) % count;
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
