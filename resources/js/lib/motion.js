export const DUR = { fast: 0.18, base: 0.4, slow: 0.75, cine: 1.2 };
export const EASE = [0.22, 1, 0.36, 1];

/**
 * A short, transform-only zoom-out used by every portfolio hero visual.
 * The media starts slightly oversized, then settles at its exact rendered
 * size without changing layout or waiting for image/video decoding.
 */
export const heroMediaEntrance = (disabled = false) => ({
    initial: disabled ? false : { scale: 1.18 },
    animate: { scale: 1 },
    transition: {
        duration: disabled ? 0 : 0.95,
        delay: disabled ? 0 : 0.06,
        ease: [...EASE],
    },
});

export const staggerParent = (stagger = 0.08, delay = 0) => ({
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const maskLine = (delay = 0, y = '110%') => ({
    hidden: { y },
    show: {
        y: '0%',
        transition: { duration: 0.9, ease: [...EASE], delay },
    },
});

export const fadeUp = (delay = 0, dist = 28) => ({
    hidden: { opacity: 0, y: dist },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: DUR.slow, ease: [...EASE], delay },
    },
});

export const viewportOnce = {
    once: false,
    margin: '-12% 0px -12% 0px',
};

/**
 * A CSS-driven entrance (see `.enter` in app.css): the class and timing
 * variables for one element. Used above the fold, where a server-rendered page
 * must start its opening moves on first paint rather than after hydration.
 *
 * @param {'fade-up'|'mask-up'|'scale-x'|'grow-y'|'settle'|'lift'} kind
 * @param {{ dur?: number, delay?: number, y?: number|string, to?: number, scale?: number, className?: string, style?: object }} [options]
 *   `dur`/`delay` in seconds; `y` in px (or any CSS length); `to` is the end
 *   opacity; `scale` the starting scale of a lift.
 * @return {{ className: string, style: object }}
 */
export const enter = (kind, { dur = 0.4, delay = 0, y, to, scale, className = '', style = {} } = {}) => ({
    className: `enter enter--${kind} ${className}`.trim(),
    style: {
        '--enter-dur': `${dur}s`,
        '--enter-delay': `${delay}s`,
        ...(y !== undefined ? { '--enter-y': typeof y === 'number' ? `${y}px` : y } : {}),
        ...(to !== undefined ? { '--enter-to': to } : {}),
        ...(scale !== undefined ? { '--enter-scale': scale } : {}),
        ...style,
    },
});
