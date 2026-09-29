import { motion, useReducedMotion } from 'framer-motion';

/** The brand gradient's three stops: purple, blue, cyan. */
const STOPS = [
    [0x89, 0x1f, 0xfb],
    [0x50, 0x7a, 0xf4],
    [0x1b, 0xe2, 0xeb],
];

/**
 * The brand gradient's colour at `t` (0–1).
 *
 * Each letter bounces on its own, so the gradient is sampled per letter rather
 * than clipped across the word — a clipped gradient would not follow letters
 * that are mid-bounce.
 *
 * @param {number} t
 */
function brandColor(t) {
    const scaled = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
    const index = Math.min(STOPS.length - 2, Math.floor(scaled));
    const local = scaled - index;
    const [a, b] = [STOPS[index], STOPS[index + 1]];
    const channel = (k) => Math.round(a[k] + (b[k] - a[k]) * local);

    return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/**
 * A page title whose letters drop in one by one and bounce into place.
 *
 * The leading words keep the surrounding text colour, so they follow the
 * theme; the last `highlightWords` words run through the brand's purple, blue
 * and cyan, the same colouring as every other gradient title on the site.
 * `highlightWords={0}` keeps every word in the text colour.
 *
 * With `onScroll` the letters wait until the title scrolls into view, then
 * bounce in once; otherwise they bounce in as the page opens.
 *
 * @param {{ text: string, highlightWords?: number, delay?: number, uppercase?: boolean, onScroll?: boolean }} props
 */
export default function BounceTitle({ text, highlightWords = 1, delay = 0.3, uppercase = false, onScroll = false }) {
    const reduce = useReducedMotion();
    const words = String(text ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => (uppercase ? word.toUpperCase() : word));
    const highlightFrom = highlightWords <= 0 ? words.length : Math.max(0, words.length - highlightWords);
    const highlightLength = words.slice(highlightFrom).join('').length;
    let charIndex = 0;
    let highlightIndex = 0;

    const settled = { y: 0, opacity: 1, scaleY: 1 };
    const trigger = onScroll
        ? { whileInView: settled, viewport: { once: true, amount: 0.6 } }
        : { animate: settled };

    return (
        <span aria-label={text}>
            {words.map((word, w) => (
                <span key={w} aria-hidden className="mr-[0.24em] inline-block whitespace-nowrap last:mr-0">
                    {word.split('').map((char) => {
                        const i = charIndex++;
                        const highlighted = w >= highlightFrom;
                        const color = highlighted
                            ? brandColor(highlightLength > 1 ? highlightIndex++ / (highlightLength - 1) : 0)
                            : undefined;

                        return (
                            <motion.span
                                key={i}
                                className="inline-block will-change-transform"
                                style={color ? { color } : undefined}
                                initial={reduce ? false : { y: '-0.9em', opacity: 0, scaleY: 1.15 }}
                                {...trigger}
                                transition={
                                    reduce
                                        ? { duration: 0 }
                                        : {
                                              y: { type: 'spring', stiffness: 520, damping: 11, mass: 0.8, delay: delay + Math.min(i, 18) * 0.045 },
                                              scaleY: { type: 'spring', stiffness: 520, damping: 14, delay: delay + Math.min(i, 18) * 0.045 },
                                              opacity: { duration: 0.2, delay: delay + Math.min(i, 18) * 0.045 },
                                          }
                                }
                            >
                                {char}
                            </motion.span>
                        );
                    })}
                </span>
            ))}
        </span>
    );
}
