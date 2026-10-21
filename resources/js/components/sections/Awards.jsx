import RecognitionStrip from './RecognitionStrip';
import { assetUrl } from '../../lib/asset';

/**
 * A heading over a drifting strip of award and press logos. It closes the
 * section padding the leadership section above it leaves open, so the two
 * read as they always have.
 *
 * @param {{ content?: { heading?: string, items?: Array<{ name?: string, detail?: string, image?: string }> } }} props
 */
export default function Awards({ content = {} }) {
    const items = (content.items ?? [])
        .filter((award) => award?.name && award?.image)
        .map((award) => ({ ...award, image: assetUrl(award.image) }));

    if (items.length === 0) return null;

    return (
        <section aria-labelledby="awards-title" className="relative overflow-hidden pb-[clamp(5rem,9vw,9rem)]">
            {content.heading && (
                <div className="container-x text-center">
                    <h3 id="awards-title" className="font-display text-[calc(1.125rem*var(--heading-scale,1))] leading-7 font-extrabold uppercase tracking-[0.14em] text-[var(--ink-strong)] sm:text-[calc(1.25rem*var(--heading-scale,1))] md:text-[calc(1.5rem*var(--heading-scale,1))] md:leading-8">
                        {content.heading}
                    </h3>
                </div>
            )}

            <div className="mt-8 md:mt-10">
                <RecognitionStrip items={items} />
            </div>
        </section>
    );
}
