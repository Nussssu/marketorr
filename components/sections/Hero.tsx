"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { EASE } from "@/lib/motion";
import MagneticButton from "@/components/motion/MagneticButton";

function Bars({ mx, my }: { mx: MotionValue<number>; my: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const bars = [
    { c: "#891FFB", h: 190, label: "IDEA", delay: 0.55, depth: -1 },
    { c: "#507AF4", h: 280, label: "EXPERIENCE", delay: 0.68, depth: 0 },
    { c: "#1BE2EB", h: 380, label: "RESULT", delay: 0.81, depth: 1 },
  ];
  return (
    <div className="relative flex items-end gap-4 sm:gap-6" aria-hidden>
      {bars.map((b) => (
        <BarColumn key={b.label} b={b} mx={mx} my={my} reduce={!!reduce} />
      ))}
    </div>
  );
}

function BarColumn({
  b, mx, my, reduce,
}: {
  b: { c: string; h: number; label: string; delay: number; depth: number };
  mx: MotionValue<number>;
  my: MotionValue<number>;
  reduce: boolean;
}) {
  const bx = useTransform(mx, (v) => (reduce ? 0 : v * b.depth * 14));
  const by = useTransform(my, (v) => (reduce ? 0 : v * -12));
  const rot = useTransform(mx, (v) => (reduce ? 0 : v * b.depth * 2));
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay: b.delay, ease: [...EASE] as unknown as [number, number, number, number] }}
        style={{
          originY: 1,
          width: 56,
          height: b.h,
          background: `linear-gradient(180deg, ${b.c}, ${b.c}55)`,
          boxShadow: `0 0 60px ${b.c}55, 0 0 140px ${b.c}22`,
          border: `1px solid ${b.c}66`,
          borderRadius: 10,
          x: bx,
          y: by,
          rotate: rot,
        }}
        className="hidden sm:block"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, delay: b.delay, ease: [...EASE] as unknown as [number, number, number, number] }}
        style={{
          originY: 1, width: 40, height: b.h * 0.62,
          background: `linear-gradient(180deg, ${b.c}, ${b.c}55)`,
          boxShadow: `0 0 40px ${b.c}55`,
          border: `1px solid ${b.c}66`, borderRadius: 8,
        }}
        className="sm:hidden"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ delay: b.delay + 0.4, duration: 0.6 }}
        className="font-display text-[10px] font-bold tracking-[0.24em] text-white/70"
      >
        {b.label}
      </motion.span>
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.96]);
  const barsY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const gridX = useTransform(sx, (v) => (reduce ? 0 : v * 18));
  const gridY = useTransform(sy, (v) => (reduce ? 0 : v * 18));

  useEffect(() => {
    if (reduce) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        mx.set((e.clientX / window.innerWidth - 0.5) * 2);
        my.set((e.clientY / window.innerHeight - 0.5) * 2);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce, mx, my]);

  return (
    <section ref={ref} id="top" className="noise relative flex min-h-svh flex-col overflow-hidden bg-[#08080A]">
      {/* bg */}
      <motion.div className="grid-bg absolute inset-0" style={reduce ? undefined : { x: gridX, y: gridY }} aria-hidden />
      <div className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full blur-[140px]" style={{ background: "rgba(137,31,251,0.18)" }} aria-hidden />
      <div className="absolute right-[-160px] top-[8%] h-[420px] w-[420px] rounded-full blur-[140px]" style={{ background: "rgba(80,122,244,0.15)" }} aria-hidden />
      <div className="absolute bottom-[-120px] left-1/3 h-[300px] w-[520px] rounded-full blur-[140px]" style={{ background: "rgba(27,226,235,0.12)" }} aria-hidden />

      <motion.div style={{ y: textY, opacity: textOpacity, scale: textScale }} className="container-x relative z-10 flex flex-1 flex-col justify-center pt-32">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [...EASE] as unknown as [number,number,number,number] }}
          className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white/60 sm:text-[12px]"
        >
          <span className="inline-block h-[2px] w-10 bg-brand" style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }} aria-hidden />
          Independent creative &amp; digital agency
        </motion.p>

        <h1 className="display-xl uppercase text-white">
          <span className="mask-line"><motion.span className="mask-inner" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, delay: 0.35, ease: [...EASE] as unknown as [number,number,number,number] }}>We turn</motion.span></span>
          <span className="mask-line"><motion.span className="mask-inner" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, delay: 0.44, ease: [...EASE] as unknown as [number,number,number,number] }}>attention</motion.span></span>
          <span className="mask-line"><motion.span className="mask-inner text-gradient" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, delay: 0.53, ease: [...EASE] as unknown as [number,number,number,number] }}>into results.</motion.span></span>
        </h1>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: [...EASE] as unknown as [number,number,number,number] }}
          className="mt-8 h-[3px] w-full max-w-xl origin-left"
          style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}
          aria-hidden
        />

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 1.0, ease: [...EASE] as unknown as [number,number,number,number] }}
            className="max-w-md text-[16px] leading-relaxed text-[#9A9AA3]"
          >
            Marketorr builds brands, digital products, and experiences designed to create measurable growth.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 1.1, ease: [...EASE] as unknown as [number,number,number,number] }}
            className="flex flex-wrap gap-4"
          >
            <MagneticButton>
              <a href="#work" data-cursor="cta" className="btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}>
                View our work <span aria-hidden>↗</span>
              </a>
            </MagneticButton>
            <MagneticButton>
              <a href="#contact" data-cursor="cta" className="btn-press inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white hover:border-white hover:bg-white hover:text-black">
                Start a project <span aria-hidden>→</span>
              </a>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      <motion.div style={reduce ? undefined : { y: barsY }} className="container-x relative z-10 mt-10 flex items-end justify-between pb-10">
        <div className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40 md:flex" aria-hidden>
          <span>Idea <span className="text-[#891FFB]">●</span></span>
          <span>Experience <span className="text-[#507AF4]">●</span></span>
          <span>Result <span className="text-[#1BE2EB]">●</span></span>
        </div>
        <Bars mx={sx} my={sy} />
        <motion.a
          href="#about"
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="btn-press hidden flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/50 hover:text-white md:flex"
        >
          Scroll to explore
          <span className="block h-10 w-[1px] bg-gradient-to-b from-[#891FFB] via-[#507AF4] to-[#1BE2EB]" aria-hidden />
        </motion.a>
      </motion.div>
    </section>
  );
}
