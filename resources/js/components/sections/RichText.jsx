import { GradientTitle, SectionLabel } from '../ui/primitives';

/**
 * Heading plus editor-authored rich text. The body is written in the admin
 * panel by a signed-in editor, so it is rendered as HTML.
 *
 * @param {{ content?: { eyebrow?: string, heading?: string, body?: string } }} props
 */
export default function RichText({ content }) {
    const { eyebrow, heading, body } = content ?? {};

    return (
        <section className="bg-[var(--bg)] pb-24 pt-32">
            <div className="container-x max-w-3xl">
                {eyebrow && <SectionLabel index="§" name={eyebrow} />}
                {heading && (
                    <h1 className="display-md mt-8 uppercase text-[var(--ink-strong)]"><GradientTitle text={heading} /></h1>
                )}
                {body && (
                    <div
                        className="prose-cms mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--mute)]"
                        dangerouslySetInnerHTML={{ __html: body }}
                    />
                )}
            </div>
        </section>
    );
}
