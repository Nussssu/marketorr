import { Head } from '@inertiajs/react';
import Contact from '../components/sections/Contact';

export default function ContactPage() {
    return (
        <>
            <Head title="Contact — Marketorr" />
            <div className="pt-[72px]">
                <Contact heroHeading />
            </div>
        </>
    );
}
