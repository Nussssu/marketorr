import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

/**
 * The home page is a CMS page: its sections, their order and their copy all
 * come from the Pages module in the admin panel.
 *
 * It is the one page that uses the `reveal` arrival: sections lift into
 * place once and then stay still, rather than travelling through the 3D
 * stage the rest of the site uses. The widgets themselves are unchanged.
 */
export default function Home({ page }) {
    return (
        <>
            <PageMeta page={page} />
            <SectionRenderer sections={page?.sections ?? []} appearance="reveal" />
        </>
    );
}
