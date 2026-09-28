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
