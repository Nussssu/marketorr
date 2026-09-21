import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

export default function AboutPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="About — Marketorr" />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
