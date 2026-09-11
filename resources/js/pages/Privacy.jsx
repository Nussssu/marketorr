import { Head } from '@inertiajs/react';
import { SectionLabel } from '../components/ui/primitives';

export default function PrivacyPage() {
    return (
        <>
            <Head title="Privacy — Marketorr" />
            <div className="bg-[var(--bg)] pb-24 pt-32">
                <div className="container-x max-w-3xl">
                    <SectionLabel index="§" name="PRIVACY" />
                    <h1 className="display-md mt-8 uppercase text-[var(--ink-strong)]">Privacy policy</h1>
                    <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--mute)]">
                        <p>Marketorr respects your privacy. This page outlines how we handle inquiries submitted through this site.</p>
                        <p>Contact-form details (name, email, company, project info) are used solely to respond to your inquiry. We do not sell personal data, run third-party trackers, or share submissions without consent.</p>
                        <p>To request deletion of your inquiry, email hello@marketorr.com with the subject “Delete my data”.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
