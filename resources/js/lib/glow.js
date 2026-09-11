/**
 * Shared cursor-glow tuning.
 *
 * Every cursor-reactive background in the site reads these numbers, so the
 * glow's size, falloff and weight stay identical in every section and can be
 * retuned from one place.
 */

/** Marketorr pigments as raw channels, so alpha can be mixed per layer. */
export const PIGMENTS = [
    [137, 31, 251], // #891FFB
    [80, 122, 244], // #507AF4
    [27, 226, 235], // #1BE2EB
];

export const GLOW = {
    /** Tight radius: the colour stays near the cursor instead of washing the section. */
    radius: 150,
    /** Most of the energy sits inside the first third of the radius. */
    stops: [
        [0, 1],
        [0.28, 0.45],
        [0.6, 0.1],
        [1, 0],
    ],
    /** Per-theme core alpha — enough presence to read, low enough to stay dark. */
    alpha: { light: 0.17, dark: 0.24 },
    /** Small blur only: heavy blur is what used to spread the colour everywhere. */
    blur: { light: 12, dark: 10 },
    /** Layer opacity, kept restrained so the glow never turns neon. */
    opacity: { light: 0.3, dark: 0.55 },
    /** Saturation stays close to 1 — brand hues, not fluorescent ones. */
    saturate: { light: 1.02, dark: 1.08 },
    /** Cursor easing; low value = soft, trailing follow. */
    lerp: 0.14,
};

/**
 * A single pigment's radial gradient, using the shared falloff.
 *
 * @param {number[]} rgb
 * @param {number} alpha
 * @param {string} [position]
 * @return {string}
 */
export function pigmentGradient(rgb, alpha, position = 'circle at 50% 50%') {
    const stops = GLOW.stops
        .map(([offset, weight]) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(alpha * weight).toFixed(4)}) ${Math.round(offset * 100)}%`)
        .join(', ');

    return `radial-gradient(${position}, ${stops})`;
}
