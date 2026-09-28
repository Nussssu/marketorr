import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.matchMedia('(max-width: 1023px), (pointer: coarse)').matches) return;
        if (window.__lenis) return;

        const lenis = new Lenis({
            duration: 0.82,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.92,
            syncTouch: false,
        });

        let raf = 0;
        let running = false;
        let deepLinkRaf = 0;
        const loop = (time) => {
            lenis.raf(time);

            if (lenis.isScrolling === 'smooth' || Math.abs(lenis.velocity) > 0.01) {
                raf = requestAnimationFrame(loop);
            } else {
                raf = 0;
                running = false;
            }
        };
        const startLoop = () => {
            if (running || document.hidden) return;

            running = true;
            raf = requestAnimationFrame(loop);
        };

        // Run frames only while Lenis is actively easing a scroll. An idle
        // 60fps loop competes with viewport reveals for no visible benefit.
        window.addEventListener('wheel', startLoop, { passive: true });

        // anchor smooth scroll (same-page only; cross-page /# links reload + deep-link below)
        const onClick = (e) => {
            const a = e.target.closest?.("a[href*='#']");
            if (!a) return;
            const raw = a.getAttribute('href');
            if (!raw || raw === '#') return;
            const hashIndex = raw.indexOf('#');
            if (hashIndex === -1) return;
            const path = raw.slice(0, hashIndex);
            if (path !== '' && path !== window.location.pathname) return;
            const id = raw.slice(hashIndex);
            if (id === '#') return;
            let el = null;
            try {
                el = document.querySelector(id);
            } catch {
                return;
            }
            if (!el) return;
            e.preventDefault();
            lenis.scrollTo(el, { offset: -72, duration: 0.65 });
            startLoop();
        };
        document.addEventListener('click', onClick);

        window.__lenis = lenis;

        // deep-link: arriving with /#section from another page
        if (window.location.hash) {
            let el = null;
            try {
                el = document.querySelector(window.location.hash);
            } catch {
                // invalid selector in hash
            }
            if (el) {
                deepLinkRaf = requestAnimationFrame(() => {
                    lenis.scrollTo(el, { offset: -72, immediate: true });
                });
            }
        }

        return () => {
            running = false;
            cancelAnimationFrame(raf);
            cancelAnimationFrame(deepLinkRaf);
            window.removeEventListener('wheel', startLoop);
            document.removeEventListener('click', onClick);
            lenis.destroy();
            if (window.__lenis === lenis) window.__lenis = undefined;
        };
    }, []);
    return null;
}
