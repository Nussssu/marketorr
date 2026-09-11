export const DUR = { fast: 0.18, base: 0.4, slow: 0.75, cine: 1.2 } as const;
export const EASE = [0.22, 1, 0.36, 1] as const;

export const staggerParent = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const maskLine = (delay = 0, y = "110%") => ({
  hidden: { y },
  show: {
    y: "0%",
    transition: { duration: 0.9, ease: [...EASE] as unknown as [number, number, number, number], delay },
  },
});

export const fadeUp = (delay = 0, dist = 28) => ({
  hidden: { opacity: 0, y: dist },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.slow, ease: [...EASE] as unknown as [number, number, number, number], delay },
  },
});

export const viewportOnce = {
  once: true,
  margin: "-12% 0px -12% 0px",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window
  );
}
