export const COLORS = {
    grape: '#891FFB',
    iris: '#507AF4',
    frost: '#1BE2EB',
    gradient: 'linear-gradient(90deg, #891FFB 0%, #507AF4 50%, #1BE2EB 100%)',
};

/**
 * A colour at a given two-digit hex alpha (`'88'` = 53%), for brand colours
 * and plain hex colours alike: `withAlpha(COLORS.iris, '88')`.
 *
 * @param {string} color
 * @param {string} alphaHex
 * @return {string}
 */
export function withAlpha(color, alphaHex) {
    return `${color}${alphaHex}`;
}

export const STAGES = [
    { key: 'idea', label: 'IDEA', color: COLORS.grape, index: '01' },
    { key: 'experience', label: 'EXPERIENCE', color: COLORS.iris, index: '02' },
    { key: 'result', label: 'RESULT', color: COLORS.frost, index: '03' },
];

/** The brand colours in order, for cycling accents across a variable list. */
export const BRAND_SEQUENCE = [COLORS.grape, COLORS.iris, COLORS.frost];

/**
 * The logo's three-bar mark, measured off the artwork itself
 * (`marketorr-logo-on-*.png`, 1000x118): bars 38 / 75 / 112 tall, 35 wide,
 * 19 apart, in exactly these colours. Every size is a fraction of the
 * tallest bar, so the mark keeps its proportions at any size.
 *
 * Each bar is square except its top-left corner, which curves through the
 * bar's full width - the shortest bar is very nearly a quarter circle.
 */
export const MARK = {
    colors: ['#830DFD', '#4A76F8', '#10E2F1'],
    heights: [0.34, 0.67, 1],
    width: 0.3125,
    gap: 0.17,
};

/**
 * Size and shape of one mark bar, for a mark whose tallest bar is `tallest`
 * (any CSS length).
 *
 * @param {string} tallest
 * @param {number} index
 * @return {{ width: string, height: string, borderRadius: string }}
 */
export function markBarStyle(tallest, index) {
    const width = `calc(${tallest} * ${MARK.width})`;

    return {
        width,
        height: `calc(${tallest} * ${MARK.heights[index % MARK.heights.length]})`,
        borderRadius: `${width} 0 0 0`,
    };
}

/**
 * The gap between mark bars, for a mark whose tallest bar is `tallest`.
 *
 * @param {string} tallest
 * @return {string}
 */
export const markGap = (tallest) => `calc(${tallest} * ${MARK.gap})`;
