import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

/**
 * The home page is a CMS page: its sections, their order and their copy all
 * come from the Pages module in the admin panel.
 *
 * The brand reveal is not wired here: it lives inside the Hero section itself,
 * below the IDEA · EXPERIENCE · RESULT bar row, so it belongs to the hero's
 * own composition rather than following it as a separate block.
 */
export default function Home({ page }) {
    return (
        <>
            <PageMeta page={page} />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
