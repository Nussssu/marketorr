"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PANELS = ["#891FFB", "#507AF4", "#1BE2EB"];

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cover, setCover] = useState(false);
  const first = useRef(true);
  const prev = useRef(pathname);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      prev.current = pathname;
      return;
    }
    // App Router pathname excludes hash -> same-page anchors never trigger
    if (pathname === prev.current) return;
    prev.current = pathname;
    setCover(true);
    const win = window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } };
    const t1 = setTimeout(() => {
      if (window.location.hash) return; // deep-link handled by SmoothScroll
      if (win.__lenis) win.__lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    }, 450);
    const t2 = setTimeout(() => setCover(false), 1050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {cover && (
          <motion.div
            key={pathname}
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
