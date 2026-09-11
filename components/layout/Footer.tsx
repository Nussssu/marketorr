import Link from "next/link";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/marketorr" },
  { label: "Behance", href: "https://www.behance.net/marketorr" },
  { label: "Dribbble", href: "https://dribbble.com/marketorr" },
  { label: "Instagram", href: "https://www.instagram.com/marketorr" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-[#08080A]">
      <div className="h-[2px] w-full" aria-hidden style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }} />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 items-end gap-[4px]" aria-hidden>
              <span className="h-4 w-[6px] rounded-[2px] bg-[#891FFB]" />
              <span className="h-6 w-[6px] rounded-[2px] bg-[#507AF4]" />
              <span className="h-8 w-[6px] rounded-[2px] bg-[#1BE2EB]" />
            </span>
            <span className="font-display text-lg font-extrabold text-white">MARKETORR.</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#9A9AA3]">
            Independent creative &amp; digital agency. We turn ideas into experiences, and experiences into measurable results.
          </p>
          <div className="mt-5 flex flex-wrap gap-5 text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-underline btn-press hover:text-white">{s.label}</a>
            ))}
          </div>
        </div>
        <nav aria-label="Footer">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Sitemap</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm font-semibold text-white/80">
            <Link href="/#about" className="btn-press w-fit hover:text-white">About</Link>
            <Link href="/#services" className="btn-press w-fit hover:text-white">Services</Link>
            <Link href="/#work" className="btn-press w-fit hover:text-white">Our Work</Link>
            <Link href="/#contact" className="btn-press w-fit hover:text-white">Contact</Link>
            <Link href="/work" className="btn-press w-fit hover:text-white">All work</Link>
          </div>
        </nav>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Services</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm font-semibold text-white/80">
            <Link href="/services/branding" className="btn-press w-fit hover:text-white">Branding</Link>
            <Link href="/services/web-ui-ux" className="btn-press w-fit hover:text-white">Web UI/UX</Link>
            <Link href="/services/software-ui-ux" className="btn-press w-fit hover:text-white">Software UI/UX</Link>
            <Link href="/services/mobile-app-ui-ux" className="btn-press w-fit hover:text-white">Mobile App UI/UX</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Marketorr. All rights reserved.</span>
          <span className="flex gap-5">
            <Link href="/privacy" className="btn-press hover:text-white">Privacy</Link>
            <Link href="/terms" className="btn-press hover:text-white">Terms</Link>
            <span className="text-gradient font-bold">IDEA → EXPERIENCE → RESULT</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
