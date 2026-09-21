import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

export default function ContactPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="Contact — Marketorr" />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
