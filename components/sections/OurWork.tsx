"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { PROJECTS, type Project } from "@/lib/projects";
import { SectionLabel, Tag } from "@/components/ui/primitives";
import RevealText from "@/components/motion/RevealText";

function ProjectVisual({ p }: { p: Project }) {
  // Abstract premium visual per project — no stock, pure brand system
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#111116]">
      <div
        className="absolute inset-0 transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
        style={{
          background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}33, transparent 55%), linear-gradient(160deg, #18181F, #08080A)`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 grid grid-cols-6 gap-px opacity-20" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="border-r border-white/10" />
        ))}
      </div>
      {/* rising bars composition */}
      <div className="absolute bottom-0 left-8 flex items-end gap-3" aria-hidden>
        {[90, 150, 220].map((h, i) => (
          <span
            key={i}
            className="w-12 rounded-t-lg border md:w-16"
            style={{
              height: h,
              background: `linear-gradient(180deg, ${[p.accent, "#507AF4", "#1BE2EB"][i]}, transparent)`,
              borderColor: `${[p.accent, "#507AF4", "#1BE2EB"][i]}55`,
              boxShadow: `0 0 40px ${[p.accent, "#507AF4", "#1BE2EB"][i]}44`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>
      <div className="absolute right-8 top-8 text-right" aria-hidden>
        <p className="font-display text-5xl font-extrabold text-white/90 md:text-7xl">{p.metric}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">{p.metricLabel}</p>
      </div>
      <div className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-black transition-transform duration-500 group-hover:rotate-45" aria-hidden>
        ↗
      </div>
      <span className="absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-500 group-hover:border-white/15" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }} aria-hidden />
    </div>
  );
}

function Card({ p, className = "", ratio = "aspect-[16/10]" }: { p: Project; className?: string; ratio?: string }) {
  return (
    <motion.div whileTap={{ scale: 0.985 }} transition={{ duration: 0.18 }} className={className}>
      <Link href={`/work/${p.slug}`} data-cursor="view" className="group block" aria-label={`View ${p.title} case study`}>
        <div className={`${ratio} overflow-hidden rounded-2xl border border-white/10`}>
          <ProjectVisual p={p} />
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">{p.client} · {p.year}</p>
            <h3 className="mt-1 font-display text-2xl font-extrabold uppercase text-white md:text-3xl">
              <span className="bg-[linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)] bg-[length:0%_100%] bg-no-repeat bg-clip-text transition-[background-size,color] duration-500 group-hover:bg-[length:100%_100%] group-hover:text-transparent">
                {p.title}
              </span>
            </h3>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#9A9AA3]">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <Tag key={t} accent={p.accent}>{t}</Tag>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-extrabold" style={{ color: p.accent }}>{p.metric}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">{p.metricLabel}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function OurWork() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stickyRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);

  return (
    <section id="work" className="relative bg-[#0B0B0E] py-24 md:py-36">
      <div className="container-x">
        <SectionLabel index="03" name="OUR WORK" />
        {/* sticky intro */}
        <div ref={stickyRef} className="relative">
          <div className="md:sticky md:top-24 md:z-10 md:py-6">
            <RevealText as="h2" className="display-lg uppercase text-white" lines={["Work that", "creates impact."]} />
            <p className="mt-4 max-w-lg text-[15px] text-[#9A9AA3]">
              Selected work across branding, digital products, UI/UX, campaigns, and growth-focused experiences.
            </p>
          </div>

          <motion.div style={reduce ? undefined : { y: bgY }} className="mt-12 grid gap-14">
            <Card p={PROJECTS[0]} ratio="aspect-[16/9]" />
            <div className="grid gap-14 md:grid-cols-12">
              <Card p={PROJECTS[1]} className="md:col-span-5" ratio="aspect-[3/4]" />
              <div className="flex flex-col justify-center md:col-span-7">
                <p className="font-display text-[12px] font-bold uppercase tracking-[0.24em] text-white/40">Progression</p>
                <p className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-white md:text-4xl">
                  Idea <span className="text-[#891FFB]">→</span> Experience <span className="text-[#507AF4]">→</span> Result <span className="text-[#1BE2EB]">→</span>
                </p>
                <div className="mt-6 h-[3px] w-full" style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }} aria-hidden />
                <p className="mt-6 max-w-md text-[14px] text-[#9A9AA3]">Every engagement moves through the same operating system — sharp idea, crafted experience, measured result.</p>
              </div>
            </div>
            <Card p={PROJECTS[2]} ratio="aspect-[21/10]" />
            <div className="grid gap-14 md:grid-cols-2">
              <Card p={PROJECTS[3]} ratio="aspect-[4/3]" />
              <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-[#111116] p-8 md:p-12">
                <p className="font-display text-4xl font-extrabold uppercase leading-none text-white">Your brand<br /><span className="text-gradient">could be next.</span></p>
                <Link href="#contact" data-cursor="cta" className="btn-press mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}>
                  Start a project ↗
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/work" className="btn-press link-underline text-[13px] font-bold uppercase tracking-[0.18em] text-white/70 hover:text-white">
            View all work →
          </Link>
        </div>
      </div>
    </section>
  );
}
