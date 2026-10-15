import RevealText from '../motion/RevealText';
import { SectionLabel } from '../ui/primitives';
import RecognitionStrip from './RecognitionStrip';

/**
 * Press and award logos, split across two rows drifting in opposite
 * directions so the band reads as movement rather than a static wall.
 *
 * @param {{ content?: { heading?: string, items?: Array<{ name?: string, image?: string }> } }} props
 */
export default function Recognition({ content }) {
    const items = (content?.items ?? []).filter((item) => item?.name && item?.image);
    const heading = content?.heading || 'Featured and recognised';

    if (items.length === 0) return null;

    const rows = items.length >= 8
        ? [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)]
        : [items];

    return (
        <section id="recognition" className="relative overflow-hidden bg-[var(--bg)] section-pad">
            <div className="container-x">
                <SectionLabel name="RECOGNITION" />
                <RevealText
                    as="h2"
                    className="display-md mt-8 max-w-3xl uppercase text-[var(--ink-strong)]"
                    lines={[heading]}
                />
            </div>
            <div className="mt-10 md:mt-14">
                {rows.map((row, index) => (
                    <RecognitionStrip key={index} items={row} duration={index === 0 ? 46 : 54} reverse={index === 1} />
                ))}
            </div>
        </section>
    );
}
