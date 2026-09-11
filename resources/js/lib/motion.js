export const DUR = { fast: 0.18, base: 0.4, slow: 0.75, cine: 1.2 };
export const EASE = [0.22, 1, 0.36, 1];

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
    once: true,
    margin: '-12% 0px -12% 0px',
};
