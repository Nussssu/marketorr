import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
    Badge,
    Button,
    ConfirmDialog,
    Field,
    PageHeader,
    Panel,
    Select,
    Textarea,
    useConfirm,
} from '../../../components/admin/ui';

function Detail({ label, children }) {
    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{label}</p>
            <p className="mt-1 break-words text-[14px] text-[var(--ink)]">{children ?? '—'}</p>
        </div>
    );
}

export default function InquiryShow({ inquiry, statuses }) {
    const [request, confirm, cancel, run] = useConfirm();

    const notes = useForm({ admin_notes: inquiry.adminNotes ?? '' });

    const updateStatus = (status) => {
        router.patch(`/admin/inquiries/${inquiry.id}/status`, { status }, { preserveScroll: true });
    };

    const saveNotes = (e) => {
        e.preventDefault();
        notes.patch(`/admin/inquiries/${inquiry.id}/notes`, { preserveScroll: true });
    };

    const askDelete = () => {
        confirm({
            title: 'Delete this lead?',
            body: `${inquiry.name}'s submission will be removed permanently. This cannot be undone.`,
            action: () => router.delete(`/admin/inquiries/${inquiry.id}`),
        });
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
                            <Detail label="Phone">{inquiry.phone}</Detail>
                            <Detail label="Company">{inquiry.company}</Detail>
                            <Detail label="Project type">{inquiry.type}</Detail>
                            <Detail label="Budget">{inquiry.budget}</Detail>
                        </div>
                    </Panel>
                    <Panel title="Request metadata">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Detail label="Source page">{inquiry.sourcePage}</Detail>
                            <Detail label="First replied">{inquiry.respondedAt}</Detail>
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
                    <Panel title="Internal notes" description="Only visible here.">
                        <form onSubmit={saveNotes} className="grid gap-4">
                            <Field label="Notes" error={notes.errors.admin_notes}>
                                <Textarea
                                    rows={5}
                                    value={notes.data.admin_notes}
                                    onChange={(e) => notes.setData('admin_notes', e.target.value)}
                                />
                            </Field>
                            <Button type="submit" variant="secondary" disabled={notes.processing}>
                                {notes.processing ? 'Saving…' : 'Save notes'}
                            </Button>
                        </form>
                    </Panel>

                    <Button type="button" variant="danger" onClick={askDelete} className="w-full">
                        Delete lead
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={!!request}
                title={request?.title ?? ''}
                body={request?.body}
                onConfirm={run}
                onCancel={cancel}
            />
        </>
    );
}

InquiryShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;
