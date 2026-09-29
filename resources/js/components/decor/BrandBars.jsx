import { motion, useReducedMotion } from 'framer-motion';
import { useThemeMotion } from '../../lib/theme';

/** The three bars of the Marketorr mark: colour and height (px). */
const BARS = [
    ['#891FFB', 140],
    ['#507AF4', 210],
    ['#1BE2EB', 300],
];

/**
 * The Marketorr mark's three bars, rising from the bottom edge and drifting
 * slowly — the background that closes the landing page just above the footer.
 *
 * Positioned absolutely against its nearest positioned ancestor and purely
 * decorative. Motion follows the theme's float strength and stops under
 * reduced motion. `className` adds to the wrapper, e.g. to layer it.
 *
 * @param {{ className?: string }} props
 */
export default function BrandBars({ className = '' }) {
    const reduce = useReducedMotion();
    const fx = useThemeMotion();

    return (
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-6 opacity-30 ${className}`.trimEnd()} aria-hidden>
            {BARS.map(([color, height], index) => (
                <motion.span
                    key={color}
                    animate={reduce ? undefined : { y: [20 * fx.float, -10 * fx.float, 20 * fx.float] }}
                    transition={{ duration: 7 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-24 rounded-t-xl border md:w-36"
                    style={{ height, background: `linear-gradient(180deg, ${color}44, transparent)`, borderColor: `${color}33` }}
                />
            ))}
        </div>
    );
}
