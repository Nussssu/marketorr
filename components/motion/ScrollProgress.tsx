"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  return (
    <motion.div
      className="fixed left-0 top-0 z-[120] h-[3px] w-full origin-left"
      style={{ scaleX, background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}
      aria-hidden
    />
  );
}
