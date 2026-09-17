import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const RICH_QUERY = '(min-width: 1024px) and (pointer: fine)';

/**
 * Travel applied while a scene is arriving (`in`) and while it is falling back
 * behind the next one (`out`). Phones run the same choreography flattened:
 * shorter travel, no perspective rotation, no depth.
 *
 * @type {Record<'rich'|'light', { yIn: number, yOut: number, scaleIn: number, scaleOut: number, opacityIn: number, opacityOut: number, rotateIn: number, rotateOut: number, zIn: number, zOut: number }>}
 */
const STAGE = {
    rich: {
        yIn: 110, yOut: -56,
        scaleIn: 0.9, scaleOut: 0.94,
        opacityIn: 0.2, opacityOut: 0.32,
        rotateIn: 7.5, rotateOut: -4.5,
        zIn: -210, zOut: -170,
    },
    light: {
        yIn: 54, yOut: -24,
        scaleIn: 0.96, scaleOut: 0.985,
        opacityIn: 0.45, opacityOut: 0.6,
        rotateIn: 0, rotateOut: 0,
        zIn: 0, zOut: 0,
    },
};

/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @return {number}
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Ease-out so a scene decelerates into its resting frame instead of arriving
 * linearly with the scroll wheel.
 *
 * @param {number} t
 * @return {number}
 */
function ease(t) {
    const clamped = t < 0 ? 0 : t > 1 ? 1 : t;

    return 1 - Math.pow(1 - clamped, 3);
}

/**
 * True on tablet/desktop widths, read synchronously so the first painted frame
 * already uses the right stage rather than committing the heavy one on a phone.
 *
 * @return {boolean}
 */
function useRichStage() {
    const [rich, setRich] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(RICH_QUERY).matches,
    );

    useEffect(() => {
        const query = window.matchMedia(RICH_QUERY);
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return rich;
}

/**
 * Wraps one home-page section so it reads as its own scene in a 3D stage: it
 * comes forward out of depth as the viewer scrolls to it, rests perfectly flat
 * and untransformed while it is being read, then falls back and dims as the
 * next scene arrives.
 *
 * Two scroll ranges drive it instead of one progress over the whole section,
 * so arrival and departure each take a fixed slice of viewport travel no
 * matter how tall the section is — a short section and a very long one land
 * with the same weight:
 *
 * - `enter`: the section's top travelling from the viewport bottom to 28% down
 *   the viewport.
 * - `leave`: the section's bottom travelling from 72% down the viewport to the
 *   viewport top.
 *
 * The two are combined per property, so the resting state is genuinely
 * identity — no residual fractional scale sitting under the text, which is
 * what makes type look soft on scaled layers.
 *
 * The measured element never moves: the scroll ranges are read from the static
 * outer wrapper and the transform is applied to the inner layer, so the effect
 * can never feed back into its own progress.
 *
 * @param {{
 *   children: import('react').ReactNode,
 *   depth?: boolean,
 *   className?: string,
 * }} props
 *   `depth` false keeps the scene's travel flat (no perspective rotation or
 *   translateZ) for content that does not survive a 3D ancestor — an embedded
 *   map, for example — while still moving with the rest of the page.
 */
export default function CinematicScene({ children, depth = true, className = '' }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const rich = useRichStage();
    const active = useInView(ref, { margin: '40% 0px' });

    const { scrollYProgress: enter } = useScroll({
        target: ref,
        offset: ['start end', 'start 28%'],
    });
    const { scrollYProgress: leave } = useScroll({
        target: ref,
        offset: ['end 72%', 'end start'],
    });

    const stage = rich ? STAGE.rich : STAGE.light;
    const dimensional = rich && depth;

    const y = useTransform([enter, leave], ([i, o]) =>
        lerp(lerp(stage.yIn, 0, ease(i)), stage.yOut, ease(o)));
    const scale = useTransform([enter, leave], ([i, o]) =>
        lerp(lerp(stage.scaleIn, 1, ease(i)), stage.scaleOut, ease(o)));
    const opacity = useTransform([enter, leave], ([i, o]) =>
        lerp(lerp(stage.opacityIn, 1, ease(i)), stage.opacityOut, ease(o)));
    const rotateX = useTransform([enter, leave], ([i, o]) => (dimensional
        ? lerp(lerp(stage.rotateIn, 0, ease(i)), stage.rotateOut, ease(o))
        : 0));
    const z = useTransform([enter, leave], ([i, o]) => (dimensional
        ? lerp(lerp(stage.zIn, 0, ease(i)), stage.zOut, ease(o))
        : 0));

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={ref}
            className={`cine-scene ${className}`.trimEnd()}
            data-active={active ? 'true' : undefined}
            style={dimensional ? { perspective: '1600px' } : undefined}
        >
            <motion.div
                className="cine-scene__layer"
                style={{
                    y,
                    z,
                    rotateX,
                    scale,
                    opacity,
                    transformOrigin: '50% 0%',
                    transformStyle: dimensional ? 'preserve-3d' : undefined,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
