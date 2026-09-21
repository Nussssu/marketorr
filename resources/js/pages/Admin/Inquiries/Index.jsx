import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, EmptyState, Input, PageHeader, Panel, Select } from '../../../components/admin/ui';

export default function InquiriesIndex({ inquiries, filters, statuses, types }) {
    const [form, setForm] = useState(filters);

    const apply = (next) => {
        setForm(next);
        router.get('/admin/inquiries', next, { preserveState: true, replace: true, preserveScroll: true });
    };

    const onSearch = (e) => {
        e.preventDefault();
        apply(form);
    };

    return (
        <>
            <Head title="Inquiries — Marketorr Admin" />
            <PageHeader title="Leads" subtitle={`${inquiries.total} submission${inquiries.total === 1 ? '' : 's'} from the contact form.`}>
                {/* Plain anchor, not a Link: the export is a file download, not
                    an Inertia visit. */}
                <Button as="a" href={`/admin/inquiries/export?${new URLSearchParams(filters).toString()}`} variant="secondary">
                    Export CSV
                </Button>
            </PageHeader>

            <Panel className="mb-6">
                <form onSubmit={onSearch} className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto]">
                    <Input
                        value={form.search}
                        onChange={(e) => setForm({ ...form, search: e.target.value })}
                        placeholder="Search name, email or company…"
                        aria-label="Search inquiries"
                    />
                    <Select value={form.status} onChange={(e) => apply({ ...form, status: e.target.value })} aria-label="Filter by status">
                        <option value="">All statuses</option>
                        {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </Select>
                    <Select value={form.type} onChange={(e) => apply({ ...form, type: e.target.value })} aria-label="Filter by type">
                        <option value="">All types</option>
                        {types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <Button type="submit" variant="secondary">Search</Button>
                </form>
            </Panel>

            <Panel className="overflow-hidden">
                {inquiries.data.length === 0 ? (
                    <EmptyState>No inquiries match these filters.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Name</th>
                                    <th className="pb-3 pr-4 font-bold">Type</th>
                                    <th className="pb-3 pr-4 font-bold">Budget</th>
                                    <th className="pb-3 pr-4 font-bold">Source</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 pr-4 font-bold">Submitted</th>
                                    <th className="pb-3 font-bold" />
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.data.map((inquiry) => (
                                    <tr key={inquiry.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-4">
                                            <p className="font-semibold text-[var(--ink)]">{inquiry.name}</p>
                                            <p className="text-[12px] text-[var(--ink-faint)]">{inquiry.email}</p>
                                            {inquiry.phone && <p className="text-[12px] text-[var(--ink-faint)]">{inquiry.phone}</p>}
                                            {inquiry.company && <p className="text-[12px] text-[var(--ink-faint)]">{inquiry.company}</p>}
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{inquiry.type}</td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{inquiry.budget ?? '—'}</td>
                                        <td className="py-3 pr-4 font-mono text-[12px] text-[var(--ink-faint)]">{inquiry.sourcePage ?? '—'}</td>
                                        <td className="py-3 pr-4"><Badge tone={inquiry.status} /></td>
                                        <td className="py-3 pr-4 whitespace-nowrap text-[var(--mute)]">{inquiry.createdAt}</td>
                                        <td className="py-3 text-right">
                                            <Link
                                                href={`/admin/inquiries/${inquiry.id}`}
                                                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                                            >
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

            {inquiries.links?.length > 3 && (
                <nav className="mt-6 flex flex-wrap gap-2" aria-label="Pagination">
                    {inquiries.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            disabled={!link.url}
                            className={`rounded-lg border px-3 py-2 text-[12px] font-bold ${
                                link.active
                                    ? 'border-transparent bg-[var(--chip)] text-[var(--ink-strong)]'
                                    : 'border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]'
                            } ${link.url ? '' : 'pointer-events-none opacity-40'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>
            )}
        </>
    );
}

InquiriesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
