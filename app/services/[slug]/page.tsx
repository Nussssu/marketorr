import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";
import { SectionLabel, Tag } from "@/components/ui/primitives";
import MagneticButton from "@/components/motion/MagneticButton";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return { title: `${s.name} — Marketorr`, description: s.description };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();
  const grad = s.accentTo ? `linear-gradient(90deg, ${s.accent}, ${s.accentTo})` : s.accent;

  return (
    <article className="bg-[#08080A] pb-24 pt-32">
      <div className="container-x">
        <SectionLabel index={s.index} name={s.name.toUpperCase()} />
        <h1 className="display-lg mt-8 uppercase text-white">
          {s.name.split(" ")[0]} <span className="text-gradient">{s.name.split(" ").slice(1).join(" ") || ""}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#9A9AA3]">{s.description}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton>
            <Link href="/#contact" data-cursor="cta" className="btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" }}>
              Start a project ↗
            </Link>
          </MagneticButton>
          <Link href="/work" className="btn-press inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white hover:bg-white hover:text-black">
            View work →
          </Link>
        </div>

        {/* progression visual */}
        <div className="mt-14 flex items-end gap-4" aria-hidden>
          {[s.accent, s.accentTo ?? "#507AF4", "#1BE2EB"].map((c, i) => (
            <span key={i} className="w-20 rounded-t-xl border md:w-28" style={{ height: 70 + i * 60, background: `linear-gradient(180deg, ${c}66, transparent)`, borderColor: `${c}44` }} />
          ))}
          <span className="mb-2 ml-2 h-[3px] flex-1" style={{ background: grad }} />
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#111116] p-8">
            <h2 className="font-display text-xl font-bold uppercase text-white">Capabilities</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {s.capabilities.map((c) => (
                <Tag key={c} accent={s.accent}>{c}</Tag>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111116] p-8">
            <h2 className="font-display text-xl font-bold uppercase text-white">What you get</h2>
            <ul className="mt-5 space-y-3 text-[15px] text-white/75">
              {s.deliverables.map((d) => (
                <li key={d} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: grad }} aria-hidden /> {d}
                </li>
              ))}
            </ul>
            <div className="mt-7 grid grid-cols-2 gap-4">
              {s.outcomes.map((o) => (
                <div key={o.label} className="rounded-xl bg-[#18181F] p-4">
                  <p className="font-display text-2xl font-extrabold text-white">{o.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">{o.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <nav className="mt-14 flex flex-wrap gap-3" aria-label="Other services">
          {SERVICES.filter((x) => x.slug !== s.slug).map((o) => (
            <Link key={o.slug} href={`/services/${o.slug}`} data-cursor="explore" className="btn-press rounded-full border border-white/15 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white/70 hover:border-white/40 hover:text-white">
              {o.name} →
            </Link>
          ))}
        </nav>
      </div>
    </article>
  );
}
