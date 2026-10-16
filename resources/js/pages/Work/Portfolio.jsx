import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { GradientTitle, SectionLabel } from '../../components/ui/primitives';
import ScrollHeading from '../../components/motion/ScrollHeading';
import WorkShowcase from '../../components/sections/WorkShowcase';
import { projectHref } from '../../lib/uiuxShowcase';

/** The UI/UX portfolio's accent: the brand purple, so its visuals carry a purple shade. */
const UIUX_ACCENT = 'var(--brand-1)';

/**
 * The six UI/UX showcase projects in the shape the Branding showcase uses.
 *
 * Each leads to its printer page rather than a case study, and lists every
 * page designed where a Branding project lists its tags.
 *
 * @param {Array<{ slug: string, name: string, discipline: string, cover: ({ thumb: string, alt: string }|null), screens: Array<{ label: string }> }>} showcase
 */
function uiuxProjects(showcase) {
    return showcase.map((project) => {
        const pageCount = project.screens.length;
        const pages = `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`;

        return {
            slug: project.slug,
            href: projectHref(project.slug),
            ctaLabel: 'See all pages',
            title: project.name,
            client: project.discipline,
            year: pages,
            description: `${pages} designed for ${project.name}. Open the project to print every page and view each one full size.`,
            tags: project.screens.map((screen) => screen.label),
            accent: UIUX_ACCENT,
            image: project.cover?.thumb ?? null,
            // A dedicated cover is framed from its centre; a project still
            // showing its first page is shown from the top, where the hero is.
            imagePosition: project.cover && project.cover.src !== project.screens[0]?.src ? 'center' : 'top',
            imageAlt: project.cover?.alt ?? project.name,
            metric: null,
            metricLabel: null,
        };
    });
}

/**
 * One portfolio: every project filed under that practice.
 *
 * The heading is the portfolio's own name, so the reader always knows which of
 * the two they are inside. Both portfolios use the same showcase — the written
 * half holds still while the visuals float up past it. Branding lists its
 * published projects, each opening its case study; UI/UX lists its six
 * showcase projects, each opening its printer page.
 */
export default function WorkPortfolio({ group, projects = [], showcase = null }) {
    const { url } = usePage();
    const listed = useMemo(() => {
        if (!showcase) return projects;

        return [...projects, ...uiuxProjects(showcase)].filter(
            (project, index, allProjects) => allProjects.findIndex(({ slug }) => slug === project.slug) === index,
        );
    }, [showcase, projects]);

    // `?project=` — from a printer page's Close or the Our Work menu — brings
    // that project's visual into view.
    useEffect(() => {
        const slug = new URLSearchParams(url.split('?')[1] ?? '').get('project');
        const item = slug ? document.getElementById(`work-${slug}`) : null;
        if (!item) return;
        const top = item.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.25;
        if (window.__lenis) window.__lenis.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo(0, top);
    }, [url]);

    return (
        <>
            <Head title={`${group.heading} | Marketorr`} />
            <div className="bg-[var(--bg)] pb-16 pt-24 md:pb-24 md:pt-32">
                <div className="container-x">
                    <SectionLabel name="OUR WORK" />
                    <ScrollHeading className="mt-8">
                        <h1 className="display-lg uppercase text-[var(--ink-strong)]">
                            <GradientTitle text={group.heading} />
                        </h1>
                    </ScrollHeading>

                    <WorkShowcase projects={listed} mobileOptimized={Boolean(showcase)} />
                </div>
            </div>
        </>
    );
}
