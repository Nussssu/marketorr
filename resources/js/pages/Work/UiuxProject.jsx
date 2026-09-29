import { Head } from '@inertiajs/react';
import { SectionLabel, Tag } from '../../components/ui/primitives';
import ScrollHeading from '../../components/motion/ScrollHeading';
import UiuxPrinter from '../../components/sections/UiuxPrinter';
import BounceTitle from '../../components/motion/BounceTitle';

/** The UI/UX accent, matching the portfolio's purple. */
const ACCENT = '#891FFB';

/**
 * One UI/UX project's own page, opened from "See all pages" in the portfolio.
 *
 * The project's name heads the page, with a line or two on the project and
 * what Marketorr worked on beneath it, then the project's printer; every
 * printed page opens larger in place.
 */
export default function UiuxProject({ project }) {
    const services = project.services ?? [];

    return (
        <>
            <Head title={`${project.name} — Marketorr`} />
            <div className="bg-[var(--bg)] pb-16 pt-24 md:pb-24 md:pt-32">
                <div className="container-x">
                    <SectionLabel index="03" name="UI/UX PORTFOLIO" />
                    <ScrollHeading className="mt-6 md:mt-8">
                        <h1 className="display-lg uppercase text-[var(--ink-strong)]">
                            <BounceTitle text={project.name} />
                        </h1>
                    </ScrollHeading>

                    {project.summary && (
                        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--mute)] md:mt-6 md:text-base">{project.summary}</p>
                    )}

                    {services.length > 0 && (
                        <div className="mt-5 md:mt-6">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">What Marketorr worked on</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {services.map((service) => (
                                    <Tag key={service} accent={ACCENT}>
                                        {service}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <UiuxPrinter project={project} />
            </div>
        </>
    );
}
