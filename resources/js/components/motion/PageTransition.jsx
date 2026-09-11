import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const PANELS = ['#891FFB', '#507AF4', '#1BE2EB'];

function scrollAfterNav() {
    if (window.location.hash) {
        const el = document.querySelector(window.location.hash);
        if (el) {
            if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72, immediate: true });
            else el.scrollIntoView();
            return;
        }
    }
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
}

export default function PageTransition({ children }) {
    const [cover, setCover] = useState(false);
    const timers = useRef([]);

    useEffect(() => {
        const clear = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
        const offStart = router.on('start', (event) => {
            // Form posts validate in place — no cinematic cover for those.
            if (event.detail.visit.method !== 'get') return;
            clear();
            setCover(true);
        });
        const offFinish = router.on('finish', (event) => {
            if (event.detail.visit.method !== 'get') return;
            timers.current.push(setTimeout(scrollAfterNav, 450));
            timers.current.push(setTimeout(() => setCover(false), 1050));
        });
        return () => {
            offStart();
            offFinish();
            clear();
        };
    }, []);

    return (
        <>
            <AnimatePresence>
                {cover && (
                    <motion.div
                        className="pointer-events-none fixed inset-0 z-[150] flex"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {PANELS.map((c, i) => (
                            <motion.div
                                key={c}
                                className="h-full flex-1 origin-top"
                                style={{ background: c }}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: [0, 1, 1, 0] }}
                                transition={{ duration: 1.0, times: [0, 0.4, 0.6, 1], delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
}
