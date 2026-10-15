import { Link } from '@inertiajs/react';
import BounceTitle from '../motion/BounceTitle';

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/**
 * A centred closing panel: a small label, a heading and one button.
 *
 * @param {{ content?: { label?: string, heading?: string, buttonLabel?: string, buttonUrl?: string } }} props
 */
export default function ClosingPanel({ content = {} }) {
    if (!content.heading && !content.buttonLabel) return null;

    return (
        <section className="container-x pb-24 pt-8 min-[769px]:py-24 lg:py-32">
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-7 py-16 text-center sm:px-12 lg:py-24">
                {content.label && (
                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">{content.label}</p>
                )}
                {content.heading && (
                    <h2 className="display-md mx-auto mt-5 max-w-4xl uppercase text-[var(--ink-strong)]">
                        <BounceTitle text={content.heading} highlightWords={0} delay={0.1} onScroll />
                    </h2>
                )}
                {content.buttonLabel && (
                    <Link href={content.buttonUrl || '/contact'} className="btn-press mt-8 inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.17em] text-white" style={{ background: BRAND_GRADIENT }}>
                        {content.buttonLabel} <span aria-hidden>↗</span>
                    </Link>
                )}
            </div>
        </section>
    );
}
