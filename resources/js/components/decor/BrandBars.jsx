import { motion, useReducedMotion } from 'framer-motion';
import { useThemeMotion } from '../../lib/theme';
import { MARK, markBarStyle, markGap, withAlpha } from '../../lib/tokens';

/** Height of the tallest bar: the logo's proportions set the rest. */
const MARK_SIZE = 'clamp(200px, 26vw, 300px)';

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
        <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center opacity-30 ${className}`.trimEnd()}
            style={{ gap: markGap(MARK_SIZE) }}
            aria-hidden
        >
            {MARK.colors.map((color, index) => (
                <motion.span
                    key={color}
                    animate={reduce ? undefined : { y: [20 * fx.float, -10 * fx.float, 20 * fx.float] }}
                    transition={{ duration: 7 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="border"
                    style={{
                        ...markBarStyle(MARK_SIZE, index),
                        background: `linear-gradient(180deg, ${withAlpha(color, '44')}, transparent)`,
                        borderColor: `${withAlpha(color, '33')}`,
                    }}
                />
            ))}
        </div>
    );
}
