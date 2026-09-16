import { Head } from '@inertiajs/react';
import Services from '../../components/sections/Services';

export default function ServicesIndex({ subservices }) {
    return (
        <>
            <Head title="Services — Marketorr" />
            <Services heroHeading subservices={subservices} />
        </>
    );
}
