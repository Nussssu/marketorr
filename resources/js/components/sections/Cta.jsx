import { GradientButton, GradientTitle, SectionLabel } from '../ui/primitives';

/**
 * @param {{ content?: { heading?: string, body?: string, buttonLabel?: string, buttonUrl?: string } }} props
 */
export default function Cta({ content }) {
    const { heading, body, buttonLabel, buttonUrl } = content ?? {};

    if (!heading && !body) return null;

    return (
        <section className="bg-[var(--bg-soft)] section-pad">
            <div className="container-x max-w-3xl text-center">
                <SectionLabel index="§" name="NEXT STEP" />
                {heading && (
                    <h2 className="display-md mt-8 uppercase text-[var(--ink-strong)]"><GradientTitle text={heading} /></h2>
                )}
                {body && <p className="mt-5 text-[16px] leading-[1.75] text-[var(--mute)]">{body}</p>}
                {buttonLabel && buttonUrl && (
                    <div className="mt-9 flex justify-center">
                        <GradientButton href={buttonUrl}>{buttonLabel}</GradientButton>
                    </div>
                )}
            </div>
        </section>
    );
}
