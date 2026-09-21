import { BRAND_SEQUENCE } from '../../lib/tokens';

/**
 * Looping strip of short words. The three brand colours cycle across the
 * items, so any number of words stays on-palette.
 *
 * @param {{ content?: { items?: string[] } }} props
 */
export default function Marquee({ content }) {
    const words = content?.items?.length ? content.items : ['IDEA', 'EXPERIENCE', 'RESULT'];
    const items = Array.from({ length: 8 }).flatMap(() => words);

    return (
        <div className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--surface)] py-4" aria-hidden>
            <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
                {[0, 1].map((half) => (
                    <div key={half} className="flex gap-8">
                        {items.map((word, index) => (
                            <span
                                key={`${half}-${index}`}
                                className="flex items-center gap-8 font-display text-[13px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]"
                            >
                                {word}
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ background: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] }}
                                />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
