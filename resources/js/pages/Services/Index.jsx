import { Head } from '@inertiajs/react';
import Services from '../../components/sections/Services';

export default function ServicesIndex({ services }) {
    return (
        <>
            <Head title="Services — Marketorr" />
            <Services heroHeading services={services} />
        </>
    );
}
