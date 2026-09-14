import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Badge, EmptyState, Panel, PageHeader } from '../../components/admin/ui';

function Stat({ label, value, accent }) {
    return (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-display text-3xl font-extrabold text-[var(--ink-strong)]">{value}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{label}</p>
            <span className="mt-3 block h-[2px] w-10" style={{ background: accent }} aria-hidden />
        </div>
    );
}

export default function Dashboard({ stats, recentInquiries }) {
    return (
        <>
            <Head title="Dashboard — Marketorr Admin" />
            <PageHeader title="Dashboard" subtitle="What's live and what needs a reply." />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Published projects" value={stats.publishedProjects} accent="#891FFB" />
                <Stat label="Draft projects" value={stats.draftProjects} accent="#507AF4" />
                <Stat label="Services" value={stats.services} accent="#1BE2EB" />
                <Stat label="New inquiries" value={stats.newInquiries} accent="#891FFB" />
            </div>

            <div className="mt-8">
                <Panel title="Latest inquiries" className="overflow-hidden">
                    {recentInquiries.length === 0 ? (
                        <EmptyState>No inquiries yet.</EmptyState>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-[13px]">
                                <thead>
                                    <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                        <th className="pb-3 pr-4 font-bold">Name</th>
                                        <th className="pb-3 pr-4 font-bold">Type</th>
                                        <th className="pb-3 pr-4 font-bold">Status</th>
                                        <th className="pb-3 pr-4 font-bold">Received</th>
                                        <th className="pb-3 font-bold" />
                                    </tr>
                                </thead>
                                <tbody className="align-top">
                                    {recentInquiries.map((inquiry) => (
                                        <tr key={inquiry.id} className="border-t border-[var(--line)]">
                                            <td className="py-3 pr-4">
                                                <p className="font-semibold text-[var(--ink)]">{inquiry.name}</p>
                                                <p className="text-[12px] text-[var(--ink-faint)]">{inquiry.email}</p>
                                            </td>
                                            <td className="py-3 pr-4 text-[var(--mute)]">{inquiry.type}</td>
                                            <td className="py-3 pr-4"><Badge tone={inquiry.status} /></td>
                                            <td className="py-3 pr-4 text-[var(--mute)]">{inquiry.createdAt}</td>
                                            <td className="py-3 text-right">
                                                <Link href={`/admin/inquiries/${inquiry.id}`} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
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
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
