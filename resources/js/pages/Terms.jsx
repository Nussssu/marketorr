import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

export default function TermsPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="Terms — Marketorr" />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
