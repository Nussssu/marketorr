import { Head } from '@inertiajs/react';
import { SectionLabel } from '../../components/ui/primitives';
import ScrollHeading from '../../components/motion/ScrollHeading';
import WorkShowcase from '../../components/sections/WorkShowcase';

export default function WorkIndex({ projects }) {
    return (
        <>
            <Head title="Our Work — Marketorr" />
            <div className="bg-[var(--bg)] pb-24 pt-32">
                <div className="container-x">
                    <SectionLabel index="03" name="OUR WORK" />
                    <ScrollHeading className="mt-8">
                        <h1 className="display-lg uppercase text-[var(--ink-strong)]">Work that <span className="text-gradient">creates impact.</span></h1>
                    </ScrollHeading>
                    <WorkShowcase projects={projects} />
                </div>
            </div>
        </>
    );
}
