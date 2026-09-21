import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

/**
 * The home page is a CMS page: its sections, their order and their copy all
 * come from the Pages module in the admin panel.
 */
export default function Home({ page }) {
    return (
        <>
            <PageMeta page={page} />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
