import { MARK, markBarStyle, markGap } from '../../lib/tokens';

/**
 * The logo's three-bar mark on its own, drawn in the logo's exact shape and
 * colours. `size` is the height of the tallest bar, as any CSS length.
 *
 * @param {{ size?: string, className?: string }} props
 */
export default function BrandMark({ size = '1.25rem', className = '' }) {
    return (
        <span className={`inline-flex shrink-0 items-end ${className}`.trimEnd()} style={{ height: size, gap: markGap(size) }} aria-hidden>
            {MARK.colors.map((color, index) => (
                <span key={color} className="block" style={{ ...markBarStyle(size, index), background: color }} />
            ))}
        </span>
    );
}
