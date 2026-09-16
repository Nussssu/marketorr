import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { faceFor } from './ServiceDeckFaces';

const RICH_QUERY = '(min-width: 768px)';

/** Places behind the front layer that still render; deeper ones are cut. */
const VISIBLE_BEHIND = 4;

/**
 * The deck's geometry, keyed to a layer's distance from the front: -1 has just
 * passed the viewer, 0 holds the front, 1..3 wait behind. Desktop layers come
 * forward through real depth; phones keep the same stacking order and timing
 * with the perspective removed.
 *
 * @type {Record<'rich'|'light', Record<string, number[]>>}
 */
const FRAMES = {
    rich: {
        stops: [-1, 0, 1, 2, 3, 4],
        y: [-132, 0, 54, 94, 124, 148],
        x: [-18, 0, 10, 18, 25, 31],
        z: [130, 0, -120, -225, -315, -390],
        scale: [1.07, 1, 0.92, 0.85, 0.79, 0.74],
        opacity: [0, 1, 0.78, 0.52, 0.3, 0.14],
        tiltX: [-9, 0, 4, 7, 9, 11],
        roll: [-4, 0, 1.8, 3.2, 4.4, 5.4],
    },
    light: {
        stops: [-1, 0, 1, 2, 3, 4],
        y: [-88, 0, 42, 74, 100, 120],
        x: [0, 0, 5, 9, 12, 15],
        z: [0, 0, 0, 0, 0, 0],
        scale: [1.04, 1, 0.93, 0.87, 0.82, 0.78],
        opacity: [0, 1, 0.72, 0.46, 0.25, 0.12],
        tiltX: [0, 0, 0, 0, 0, 0],
        roll: [0, 0, 0, 0, 0, 0],
    },
};

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

/**
 * One physical layer in the deck. Its whole appearance is a function of
 * `offset` — its place relative to the front — so the layer knows nothing
 * about the loop that drives the composition.
 *
 * The layer carries its own `perspective()` rather than inheriting a stage:
 * the card clips its contents, and a clipping ancestor forces `transform-style`
 * back to flat, which would throw the depth away.
 *
 * @param {{
 *   item: { slug: string, name: string, accent: string },
 *   Face: () => import('react').ReactElement,
 *   index: number,
 *   active: import('framer-motion').MotionValue<number>,
 *   pointerX: import('framer-motion').MotionValue<number>,
 *   pointerY: import('framer-motion').MotionValue<number>,
 *   frames: typeof FRAMES.rich,
 *   rich: boolean,
 *   direction: number,
 * }} props
 */
function DeckLayer({ item, Face, index, active, pointerX, pointerY, frames, rich, direction }) {
    const rawOffset = useTransform(active, (value) => index - value);
    const offset = useTransform(rawOffset, (value) => clamp(value, -1, VISIBLE_BEHIND));

    const lift = useTransform(offset, frames.stops, frames.y);
    const slide = useTransform(offset, frames.stops, frames.x);
    const depth = useTransform(offset, frames.stops, frames.z);
    const scale = useTransform(offset, frames.stops, frames.scale);
    const opacity = useTransform(
        rawOffset,
        [...frames.stops, VISIBLE_BEHIND + 1],
        [...frames.opacity, 0],
    );
    const tiltX = useTransform(offset, frames.stops, frames.tiltX);
    const rollZ = useTransform(offset, frames.stops, frames.roll);
    const zIndex = useTransform(offset, (value) => 100 - Math.round(value * 10));

    // Layers further back travel further under the cursor, which is what reads
    // as looking into the deck rather than at a picture of one.
    const parallaxX = useTransform(
        [pointerX, offset],
        ([px, place]) => px * (1 + Math.abs(place) * 0.5) * 10,
    );
    const parallaxY = useTransform(
        [pointerY, offset],
        ([py, place]) => py * (1 + Math.abs(place) * 0.5) * 7,
    );

    const x = useTransform([slide, parallaxX], ([base, extra]) => base * direction + (rich ? extra * direction : 0));
    const y = useTransform([lift, parallaxY], ([base, extra]) => base + (rich ? extra : 0));
    const rotateZ = useTransform(rollZ, (value) => value * direction);

    const depthStyle = rich
        ? { z: depth, rotateX: tiltX, rotateZ, transformPerspective: 1150 }
        : {};

    return (
        <motion.figure
            className="service-deck__layer absolute inset-x-0 top-1/2 m-0"
            style={{ translate: '0 -50%', x, y, scale, opacity, zIndex, willChange: 'transform, opacity', ...depthStyle }}
        >
            <div
                className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
                style={{
                    border: `1px solid ${item.accent}4d`,
                }}
            >
                <Face />
                <span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: `linear-gradient(180deg, transparent 52%, ${item.accent}14 78%, var(--surface) 100%)` }}
                    aria-hidden
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-2.5 pb-2.5 pt-1 sm:px-3 sm:pb-3">
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: item.accent }} aria-hidden />
                    <span className="truncate font-display text-[7.5px] font-bold uppercase leading-tight tracking-[0.12em] text-[var(--ink)] sm:text-[8.5px]">
                        {item.name}
                    </span>
                </figcaption>
            </div>
        </motion.figure>
    );
}

/**
 * The layered visual system that occupies the right side of a Branding or
 * UI/UX gateway card.
 *
 * Each sub-service is a physical layer with its own purpose-drawn face — marks
 * and construction for Branding, frames and components for UI/UX — and the
 * composition continuously moves them from below and behind, through a flat,
 * bright resting frame, and out above the widget. Three repeated sets make the
 * loop seamless without duplicating any visible label or changing card size.
 *
 * The cursor adds parallax on top without ever changing which layer is in
 * front: the deck turns toward the pointer and each layer shifts by an amount
 * scaled to its own depth.
 *
 * Phones keep the stacking, order and timing but drop the perspective,
 * translateZ, rotation and pointer tracking. Reduced motion renders the front
 * layer alone, static. The whole deck is decorative: `pointer-events-none` and
 * `aria-hidden`, so it can never intercept a tap or start a visit — the card's
 * arrow and its "Explore …" CTA remain the only navigation.
 *
 * @param {{
 *   category: { slug: string, name: string, items: Array<{ slug: string, name: string, accent: string }> },
 *   mirrored?: boolean,
 * }} props
 *   `mirrored` reverses the lean and the parallax so the two decks in the
 *   section never read as one composition duplicated.
 */
export default function ServiceLayerDeck({ category, mirrored = false }) {
    const reduce = useReducedMotion();
    const boxRef = useRef(null);
    const [rich, setRich] = useState(false);

    const items = category.items ?? [];
    const count = items.length;
    const direction = mirrored ? -1 : 1;
    const active = useMotionValue(count);

    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const smoothX = useSpring(pointerX, { stiffness: 70, damping: 20, mass: 0.5 });
    const smoothY = useSpring(pointerY, { stiffness: 70, damping: 20, mass: 0.5 });
    const turnY = useTransform(smoothX, (value) => value * 12 * direction);
    const turnX = useTransform(smoothY, (value) => value * -8);

    useEffect(() => {
        const query = window.matchMedia(RICH_QUERY);
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (reduce || count <= 1) {
            return undefined;
        }

        active.set(count);
        const controls = animate(active, count * 2, {
            duration: count * 2.6,
            ease: 'linear',
            repeat: Infinity,
        });

        return () => controls.stop();
    }, [active, count, reduce]);

    // The pointer is read from the whole card, not the deck: the deck is narrow,
    // and tracking only within it would make the parallax snap on and off at its
    // edges. Motion values are written directly, so moving the mouse never
    // re-renders the card.
    useEffect(() => {
        const box = boxRef.current;
        const card = box?.closest('article') ?? box;
        if (!card || !rich || reduce) return undefined;

        const onMove = (event) => {
            const rect = card.getBoundingClientRect();
            pointerX.set(clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * 2);
            pointerY.set(clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * 2);
        };
        const onLeave = () => {
            pointerX.set(0);
            pointerY.set(0);
        };

        card.addEventListener('pointermove', onMove, { passive: true });
        card.addEventListener('pointerleave', onLeave);

        return () => {
            card.removeEventListener('pointermove', onMove);
            card.removeEventListener('pointerleave', onLeave);
        };
    }, [rich, reduce, pointerX, pointerY]);

    if (count === 0) {
        return null;
    }

    const frames = rich ? FRAMES.rich : FRAMES.light;
    const width = 'pointer-events-none relative w-[96px] shrink-0 self-stretch sm:w-[124px] lg:w-[136px] xl:w-[172px]';
    const loopItems = [...items, ...items, ...items];

    if (reduce) {
        const Face = faceFor(category.slug, items[0].slug, 0);

        return (
            <div className={width} aria-hidden>
                <figure className="absolute inset-x-0 top-1/2 m-0 -translate-y-1/2">
                    <div
                        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
                        style={{ border: `1px solid ${items[0].accent}4d` }}
                    >
                        <Face />
                    </div>
                </figure>
            </div>
        );
    }

    return (
        <div ref={boxRef} className={`service-deck ${width}`} aria-hidden>
            <motion.div
                className="absolute inset-0"
                style={rich ? { rotateX: turnX, rotateY: turnY, transformPerspective: 1400 } : undefined}
            >
                {loopItems.map((item, index) => (
                    <DeckLayer
                        key={`${Math.floor(index / count)}-${item.slug}`}
                        item={item}
                        Face={faceFor(category.slug, item.slug, index % count)}
                        index={index}
                        active={active}
                        pointerX={smoothX}
                        pointerY={smoothY}
                        frames={frames}
                        rich={rich}
                        direction={direction}
                    />
                ))}
            </motion.div>
        </div>
    );
}
