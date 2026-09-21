import SectionRenderer from '../components/sections/SectionRenderer';
import PageMeta from '../components/PageMeta';

export default function PrivacyPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="Privacy — Marketorr" />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
