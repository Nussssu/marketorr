import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import MediaPlaceholder from '../media/MediaPlaceholder';

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/**
 * One project slot.
 *
 * Empty, it shows the standard placeholder plate, so the slot is visibly
 * waiting for a file rather than looking like an intentional blank panel.
 * Nothing inside it has to be deleted later - dropping a `src` into the
 * sub-service's `work` entry replaces the plate outright.
 *
 * Filled, the same frame renders the photograph and gives it a quiet
 * cinematic arrival: it opens from a soft clip, resolves out of a shallow
 * defocus and settles from a slightly oversized crop, all scrubbed by scroll
 * and smoothed through a spring. The frame, its ratio and its position on the
 * page are identical either way, so dropping an image in shifts nothing.
 *
 * @param {{ slot: { src: string|null, alt: string, title?: string } }} props
 */
function WorkSlot({ slot }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const filled = Boolean(slot.src);

    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 62%'] });
    const p = useSpring(scrollYProgress, { stiffness: 60, damping: 26, mass: 0.6 });
    const opacity = useTransform(p, [0, 0.5], [0, 1]);
    const blurPx = useTransform(p, [0, 0.82], [9, 0]);
    // `none` rather than `blur(0px)`, so a settled image stops paying for its
    // own composited layer.
    const filter = useTransform(blurPx, (v) => (v < 0.15 ? 'none' : `blur(${v.toFixed(2)}px)`));
    const scale = useTransform(p, [0, 1], [1.07, 1]);
    const inset = useTransform(p, [0, 0.78], [12, 0]);
    const clipPath = useTransform(inset, (v) => `inset(${v.toFixed(2)}% round 16px)`);

    return (
        <figure
            ref={ref}
            className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
                    >
            <div className="relative aspect-video w-full overflow-hidden">
                {filled ? (
                    <>
                        <motion.img
                            src={slot.src}
                            alt={slot.alt}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            style={reduce ? undefined : { opacity, filter, scale, clipPath }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: BRAND_GRADIENT }} />
                    </>
                ) : (
                    <MediaPlaceholder label={`${slot.title ?? 'Project'} - image placeholder`} />
                )}
            </div>
        </figure>
    );
}

/**
 * The two real-project slots on a sub-service page.
 *
 * Each sub-service reserves its own pair in `config/subservices.php`, so a
 * Packaging Design page can only ever show packaging work and a UX Research
 * page can only ever show research work — there is no shared pool of generic
 * covers to fall back to. A small side-by-side pair from the `sm` breakpoint
 * up, stacked below it, and capped well short of the container so it stays a
 * pair of plates under the hero rather than a full-width gallery.
 *
 * @param {{ item: { name: string, accent: string, work?: Array<{src: string|null, alt: string}> } }} props
 */
export default function SubServiceWork({ item }) {
    const slots = item.work ?? [];

    if (slots.length === 0) {
        return null;
    }

    return (
        <section className="mt-10" aria-label={`${item.name} work`}>
            {/* A small label rather than a section heading: it names what the
                pair below is without competing with the hero title above it,
                and uses the same eyebrow treatment as the rest of the site. */}
            <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                Selected {item.name} work
            </h2>

            {/* A standard 16:9 pair: wide enough to read as real work under
                the hero, still capped short of the container so it never
                becomes a full-width gallery. */}
            <div className="mt-4 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
                {slots.map((slot, index) => (
                    <WorkSlot key={slot.alt ?? index} slot={slot} />
                ))}
            </div>
        </section>
    );
}
