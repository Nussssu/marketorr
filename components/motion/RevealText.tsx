"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function RevealText({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  stagger = 0.08,
  as: Tag = "span",
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span" | "div";
}) {
  const reduce = useReducedMotion();
  const MTag = (motion as unknown as Record<string, typeof motion.div>)[Tag] ?? motion.span;
  return (
    <MTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {lines.map((line, i) => (
        <span key={i} className={`mask-line ${lineClassName}`}>
          <motion.span
            className="mask-inner"
            variants={{
              hidden: { y: reduce ? "0%" : "110%" },
              show: { y: "0%", transition: { duration: 0.9, ease: [...EASE] as unknown as [number,number,number,number] } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MTag>
  );
}
