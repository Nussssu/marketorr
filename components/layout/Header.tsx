"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import MagneticButton from "@/components/motion/MagneticButton";

const LINKS = [
  { label: "About", hash: "#about" },
  { label: "Services", hash: "#services" },
  { label: "Our Work", hash: "#work" },
  { label: "Contact", hash: "#contact" },
];

function Logo({ home }: { home: boolean }) {
  return (
    <Link href={home ? "#top" : "/"} className="btn-press group flex items-center gap-3" aria-label="Marketorr home">
      <span className="flex h-9 items-end gap-[4px]" aria-hidden>
        <span className="w-[7px] rounded-[2px] bg-[#891FFB] transition-all duration-300 group-hover:h-9 h-5" />
        <span className="w-[7px] rounded-[2px] bg-[#507AF4] transition-all duration-300 group-hover:h-9 h-7" />
        <span className="w-[7px] rounded-[2px] bg-[#1BE2EB] transition-all duration-300 group-hover:h-9 h-9" />
      </span>
      <span className="font-display text-[19px] font-extrabold tracking-tight text-white">
        MARKETORR<span className="text-gradient">.</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const home = pathname === "/";
  const hrefFor = (hash: string) => (home ? hash : `/${hash}`);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (reduce) return;
      if (y > 320 && y > last + 4) setHidden(true);
      else if (y < last - 4) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);

  return (
    <motion.header
      animate={{ y: hidden && !open ? "-110%" : "0%" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${
        scrolled && !open
          ? "border-b border-white/10 bg-[#08080A]/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between">
        <Logo home={home} />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.hash}
              href={hrefFor(l.hash)}
              className="link-underline btn-press group relative py-2 text-[13px] font-bold uppercase tracking-[0.18em] text-white/70 hover:text-white"
            >
              <span className="relative block overflow-hidden">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">{l.label}</span>
                <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-gradient">
                  {l.label}
                </span>
              </span>
            </a>
          ))}
          <MagneticButton>
            <a
              href={hrefFor("#contact")}
              data-cursor="cta"
              className="btn-press inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
              style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}
            >
              Start a Project <span aria-hidden>↗</span>
            </a>
          </MagneticButton>
        </nav>
        <button
          className="btn-press flex h-11 w-11 items-center justify-center rounded-full border border-white/15 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 top-0 h-[2px] w-full bg-white transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`absolute left-0 bottom-0 h-[2px] w-full bg-white transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-[#08080A]/95 px-5 pb-8 pt-4 backdrop-blur-xl lg:hidden" aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a
              key={l.hash}
              href={hrefFor(l.hash)}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-white/8 py-4 font-display text-2xl font-bold text-white"
            >
              {l.label}
              <span className="text-sm text-white/40">0{i + 1}</span>
            </a>
          ))}
          <a
            href={hrefFor("#contact")}
            onClick={() => setOpen(false)}
            className="mt-5 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold uppercase tracking-[0.16em] text-white"
            style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}
          >
            Start a Project ↗
          </a>
        </nav>
      )}
    </motion.header>
  );
}
