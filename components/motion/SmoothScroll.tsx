"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // natural touch scroll

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // anchor smooth scroll (same-page only; cross-page /# links use native nav)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const raw = a.getAttribute("href");
      if (!raw || raw === "#") return;
      const hashIndex = raw.indexOf("#");
      if (hashIndex === -1) return;
      const path = raw.slice(0, hashIndex);
      // cross-page anchor (e.g. "/#about" from /work) -> let navigation happen
      if (path !== "" && path !== window.location.pathname) return;
      const id = raw.slice(hashIndex);
      if (id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.2 });
    };
    document.addEventListener("click", onClick);

    // expose for transitions
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // deep-link: arriving with /#section from another page
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        requestAnimationFrame(() => {
          lenis.scrollTo(el as HTMLElement, { offset: -72, immediate: true });
        });
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);
  return null;
}
