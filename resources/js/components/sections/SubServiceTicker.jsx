import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

const ROW_H = 28;

/** Distance, in rows, at which a name has fully dissolved. */
const FADE_OUT = 1.35;

/**
 * Signed distance of row `index` from the reel's current position, wrapped into
 * [-count/2, count/2] so a row leaving the top re-enters from the bottom.
 *
 * @param {number} index
 * @param {number} position
 * @param {number} count
 * @return {number}
 */
function rowOffset(index, position, count) {
    let off = (((index - position) % count) + count) % count;
    if (off > count / 2) off -= count;

    return off;
}

/**
 * One name in the ticker.
 *
 * Every visual property is a continuous function of the reel position, so the
 * row rises, brightens, comes forward and recedes in one unbroken motion rather
 * than snapping between an active and an inactive state. Each curve is written
 * to land on the old step values at their old moments — dead centre reads
 * exactly as the previous active row did, and one full row away reads exactly
 * as the previous neighbour did — so the ticker's resting appearance is
 * unchanged; only the travel between those points is now smooth.
 *
 * Rows live in their own component because each one needs its own hooks. All of
 * them stay mounted and are driven entirely by `useTransform`, so a frame costs
 * a compositor write per row and never a React render.
 *
 * @param {{
 *   item: { slug: string, name: string, accent: string },
 *   index: number,
 *   count: number,
 *   position: import('framer-motion').MotionValue<number>,
 *   full: boolean,
 * }} props
 */
function TickerRow({ item, index, count, position, full }) {
    const offset = useTransform(position, (p) => rowOffset(index, p, count));

    const y = useTransform(offset, (off) => off * ROW_H);
    const opacity = useTransform(offset, (off) => {
        const distance = Math.abs(off);
        if (distance >= FADE_OUT) return 0;
        // 1 at centre → 0.38 one row out (the old inactive value) → 0 at the
        // frame edge, with no discontinuity anywhere along the way.
        if (distance <= 1) return 1 - distance * 0.62;

        return 0.38 * (1 - (distance - 1) / (FADE_OUT - 1));
    });
    const scale = useTransform(offset, (off) => 1 - Math.min(Math.abs(off), FADE_OUT) * 0.14);
    const z = useTransform(offset, (off) => 34 - Math.min(Math.abs(off), FADE_OUT) * 86);
    const rotateX = useTransform(offset, (off) => off * 16);

    return (
        <motion.div
            style={
                full
                    ? { y, z, rotateX, opacity, scale, transformStyle: 'preserve-3d' }
                    : { y, opacity, scale }
            }
            className="pointer-events-none absolute inset-x-0 top-[28px] flex h-[28px] items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]"
        >
            <span className="pointer-events-none flex min-w-0 items-center gap-2.5">
                {/* The glow rides the row's own opacity — no separate active
                    state to keep in sync with the reel. */}
                <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: item.accent, boxShadow: `0 0 10px ${item.accent}` }}
                    aria-hidden
                />
                <span className="truncate">{item.name}</span>
            </span>
        </motion.div>
    );
}

/**
 * Vertical 3D sub-service ticker that lives inside a Branding / UI-UX gateway
 * card, beneath the dominant title.
 *
 * It rides the showcase rail's own clock — `position` is the reel's continuous
 * offset in screens — so the names rise at exactly the speed the images beside
 * them do, and the two can never drift apart. The motion is continuous and
 * automatic: it is driven by time alone, never by the pointer, so the names
 * neither shake nor follow the cursor, and hovering the card does not start,
 * stop or steer them. Rows nearest the centre sit close and bright while those
 * above and below recede into depth (translateZ + slight rotateX inside a
 * perspective stage).
 *
 * The ticker is presentational only: every row is `pointer-events-none` and the
 * moving stage is `aria-hidden`, so hovering it, moving across it, or pressing
 * a row can never start a page visit. Navigation on this card belongs to the
 * arrow and the "Explore …" CTA alone. A static list carries the same names to
 * assistive technology, which is both more useful and more stable than
 * announcing whichever row happens to be centred.
 *
 * Phones get the same upward rise without the 3D depth. Reduced motion leaves
 * the column parked on its first name.
 *
 * @param {{
 *   category: { slug: string, name: string, items: Array<{ slug: string, name: string, accent: string }> },
 *   position: import('framer-motion').MotionValue<number>,
 * }} props
 */
export default function SubServiceTicker({ category, position }) {
    const reduce = useReducedMotion();
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

    if (count === 0) return null;

    const full = rich && !reduce;

    return (
        <div className="relative mt-5 h-[84px]">
            <ul className="sr-only">
                {items.map((item) => (
                    <li key={item.slug}>{item.name}</li>
                ))}
            </ul>
            <div
                className="absolute inset-0 overflow-hidden"
                style={full ? { perspective: '520px' } : undefined}
                aria-hidden
            >
                {items.map((item, i) => (
                    <TickerRow
                        key={item.slug}
                        item={item}
                        index={i}
                        count={count}
                        position={position}
                        full={full}
                    />
                ))}
            </div>
        </div>
    );
}
