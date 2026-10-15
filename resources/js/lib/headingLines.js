/**
 * Indexes of the last `count` lines of a multi-line heading — the lines that
 * carry the brand gradient, as an editor sets them in the admin.
 *
 * @param {string[]|undefined|null} lines
 * @param {number|string|undefined|null} count
 * @return {number[]}
 */
export function gradientLines(lines = [], count = 0) {
    const total = (lines ?? []).length;

    return Array.from({ length: Math.min(total, Number(count || 0)) }, (_, i) => total - 1 - i);
}
