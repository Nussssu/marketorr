import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, Field, PageHeader, Panel, Select } from '../../../components/admin/ui';

function Detail({ label, children }) {
    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{label}</p>
            <p className="mt-1 break-words text-[14px] text-[var(--ink)]">{children ?? '—'}</p>
        </div>
    );
}

export default function InquiryShow({ inquiry, statuses }) {
    const updateStatus = (status) => {
        router.patch(`/admin/inquiries/${inquiry.id}/status`, { status }, { preserveScroll: true });
    };

    const destroy = () => {
        if (!window.confirm('Delete this inquiry permanently?')) return;
        router.delete(`/admin/inquiries/${inquiry.id}`);
    };

    const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your project inquiry — ${inquiry.type}`)}`;

    return (
        <>
            <Head title={`${inquiry.name} — Marketorr Admin`} />
            <PageHeader title={inquiry.name} subtitle={`Received ${inquiry.createdAt}`}>
                <Button as="link" href="/admin/inquiries" variant="secondary">← All inquiries</Button>
                <Button as="a" href={mailto}>Reply by email ↗</Button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Message">
                        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--ink)]">{inquiry.message}</p>
                    </Panel>
                    <Panel title="Contact details">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Detail label="Email">{inquiry.email}</Detail>
                            <Detail label="Company">{inquiry.company}</Detail>
                            <Detail label="Project type">{inquiry.type}</Detail>
                            <Detail label="Budget">{inquiry.budget}</Detail>
                        </div>
                    </Panel>
                    <Panel title="Request metadata">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Detail label="IP address">{inquiry.ipAddress}</Detail>
                            <Detail label="User agent">{inquiry.userAgent}</Detail>
                        </div>
                    </Panel>
                </div>

                <div className="space-y-6">
                    <Panel title="Status">
                        <div className="space-y-4">
                            <Badge tone={inquiry.status} />
                            <Field label="Change status">
                                <Select value={inquiry.status} onChange={(e) => updateStatus(e.target.value)}>
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </Select>
                            </Field>
                        </div>
                    </Panel>
                    <Button type="button" variant="danger" onClick={destroy} className="w-full">
                        Delete inquiry
                    </Button>
                </div>
            </div>
        </>
    );
}

InquiryShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;
