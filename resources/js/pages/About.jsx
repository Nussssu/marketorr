import SectionRenderer from '../components/sections/SectionRenderer';
import ContactClosingCta from '../components/sections/ContactClosingCta';
import PageMeta from '../components/PageMeta';

export default function AboutPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="About — Marketorr" />
            <SectionRenderer sections={page?.sections ?? []} />
            <ContactClosingCta />
        </>
    );
}
