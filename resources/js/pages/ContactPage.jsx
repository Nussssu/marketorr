import PageMeta from '../components/PageMeta';
import SectionRenderer from '../components/sections/SectionRenderer';

export default function ContactPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="Contact | Marketorr" />
            <SectionRenderer sections={page?.sections ?? []} />
        </>
    );
}
