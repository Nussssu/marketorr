import { motion, useReducedMotion } from 'framer-motion';

/**
 * Fewest plates in one half of the loop. A short list is repeated until it
 * reaches this, so a half is always wider than even a very wide screen and
 * the row never runs out before it wraps (about 224px per plate at desktop,
 * so 16 covers screens beyond 3,500px).
 */
const MIN_PLATES_PER_HALF = 16;

/**
 * An endless row of logo plates. Two identical halves travel exactly one
 * half-width, so the wrap is invisible; `reverse` runs it the other way.
 * `duration` is the time one pass of `items` takes, so repeating a short
 * list to fill the row keeps the same speed.
 *
 * @param {{
 *   items: Array<{ name: string, image: string }>,
 *   duration?: number,
 *   reverse?: boolean,
 * }} props
 */
export default function RecognitionStrip({ items, duration = 58, reverse = false }) {
    const reduce = useReducedMotion();
    const repeats = Math.max(1, Math.ceil(MIN_PLATES_PER_HALF / Math.max(1, items.length)));
    const plates = Array.from({ length: repeats }, (_, round) => items.map((item) => ({ ...item, round }))).flat();

    return (
        <div className="overflow-hidden py-4 md:py-6">
            <motion.div
                className="flex w-max"
                animate={reduce ? undefined : { x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
                transition={reduce ? undefined : { duration: duration * repeats, ease: 'linear', repeat: Infinity }}
            >
                {[false, true].map((duplicate) => (
                    <ul
                        key={duplicate ? 'duplicate' : 'primary'}
                        className="flex shrink-0 gap-4 pr-4 sm:gap-6 sm:pr-6 md:gap-8 md:pr-8"
                        aria-hidden={duplicate || undefined}
                    >
                        {plates.map((item) => (
                            <li
                                key={`${duplicate ? 'duplicate-' : ''}${item.round}-${item.name}`}
                                className="award-plate flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl px-5 sm:h-24 sm:w-44 md:w-48 md:px-6"
                            >
                                <img
                                    src={item.image}
                                    alt={duplicate || item.round > 0 ? '' : item.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="max-h-9 w-full max-w-[124px] object-contain sm:max-h-11 sm:max-w-[140px] md:max-w-[150px]"
                                />
                            </li>
                        ))}
                    </ul>
                ))}
            </motion.div>
        </div>
    );
}
