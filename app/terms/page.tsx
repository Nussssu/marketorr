import { SectionLabel } from "@/components/ui/primitives";

export const metadata = { title: "Terms — Marketorr" };

export default function TermsPage() {
  return (
    <div className="bg-[#08080A] pb-24 pt-32">
      <div className="container-x max-w-3xl">
        <SectionLabel index="§" name="TERMS" />
        <h1 className="display-md mt-8 uppercase text-white">Terms of use</h1>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-white/70">
          <p>Portfolio content on this site is shown for illustration. All trademarks belong to their respective owners.</p>
          <p>Project inquiries are non-binding until a written proposal or agreement is signed by both parties.</p>
          <p>For questions about these terms, contact hello@marketorr.com.</p>
        </div>
      </div>
    </div>
  );
}
