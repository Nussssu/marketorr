import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

/**
 * Any page created in the admin panel that has no hand-built route of its
 * own — rendered entirely from its widget stack.
 */
export default function CmsPage({ page }) {
    return (
        <>
            <PageMeta page={page} />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
