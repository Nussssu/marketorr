import Link from "next/link";

export function SectionLabel({ index, name }: { index: string; name: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-[12px] font-bold tracking-[0.22em] text-white/70">
        {index} / {name}
      </span>
      <span className="h-[2px] w-16 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <span className="block h-full w-full origin-left bg-brand" />
      </span>
    </div>
  );
}

export function Tag({ children, accent = "#891FFB" }: { children: React.ReactNode; accent?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden />
      {children}
    </span>
  );
}

export function AnimatedLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isAnchor = href.startsWith("#");
  const cls =
    "link-underline btn-press group inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] text-white/80 hover:text-white";
  const inner = (
    <>
      <span className="relative overflow-hidden">
        <span className="block transition-transform duration-300 group-hover:-translate-y-full">{children}</span>
        <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-gradient">
          {children}
        </span>
      </span>
    </>
  );
  if (isAnchor) return <a href={href} className={cls}>{inner}</a>;
  return <Link href={href} className={cls}>{inner}</Link>;
}

export function GradientButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  if (variant === "ghost") {
    return (
      <Link
        href={href}
        data-cursor="cta"
        className="btn-press group inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-transparent hover:bg-white hover:text-black"
      >
        {children}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      data-cursor="cta"
      className="btn-press group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] text-white"
      style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}
    >
      <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/15" aria-hidden />
      <span className="relative">{children}</span>
      <span aria-hidden className="relative transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">↗</span>
    </Link>
  );
}
