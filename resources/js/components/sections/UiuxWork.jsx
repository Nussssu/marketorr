import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import RevealText from '../motion/RevealText';
import { SectionLabel } from '../ui/primitives';
import UiuxPrinter from './UiuxPrinter';

const PORTFOLIO_HREF = '/work/portfolio/uiux';

/**
 * The landing page's UI/UX half of Our Work: the same printer the project
 * pages use, printing one cover per project instead of one project's pages.
 * Each printed sheet opens that project's own printer.
 *
 * @param {{
 *   projects?: Array<{ slug: string, name: string, discipline: string, href: string, cover: { src: string, thumb: string, width: number, height: number, alt: string } }>,
 * }} props
 */
export default function UiuxWork({ projects = [] }) {
    const printed = useMemo(
        () => ({
            slug: 'uiux-portfolio',
            name: 'UI/UX Portfolio',
            discipline: 'UI/UX',
            screens: projects.map((project) => ({
                ...project.cover,
                alt: project.cover.alt || project.name,
                label: project.name,
                href: project.href,
            })),
        }),
        [projects],
    );

    if (projects.length === 0) return null;

    return (
        <section id="uiux-work" className="relative bg-[var(--bg)] pt-[clamp(5rem,9vw,9rem)]">
            <div className="container-x">
                <SectionLabel name="UI/UX WORK" />
                <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
                    <div>
                        <RevealText
                            as="h2"
                            className="display-lg uppercase text-[var(--ink-strong)]"
                            lines={['Interfaces', 'that convert.']}
                            highlightedLines={[1]}
                        />
                        <p className="mt-4 max-w-lg text-[15px] text-[var(--mute)]">
                            Websites, apps and SaaS products, printed one project at a time. Pick one to see every screen.
                        </p>
                    </div>
                    <Link
                        href={PORTFOLIO_HREF}
                        data-cursor="explore"
                        className="link-underline btn-press text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]"
                    >
                        Full UI/UX portfolio →
                    </Link>
                </div>
            </div>

            <UiuxPrinter
                project={printed}
                hint={{ desktop: 'Click a project to see all its screens', mobile: 'Tap a project to see all its screens' }}
            />
        </section>
    );
}
