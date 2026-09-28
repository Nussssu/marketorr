import Contact from '../components/sections/Contact';
import PageMeta from '../components/PageMeta';

export default function ContactPage({ page }) {
    return (
        <>
            <PageMeta page={page} fallbackTitle="Contact — Marketorr" />
            <Contact heroHeading />
        </>
    );
}
