import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

export default function ServiceGroupsIndex({ groups }) {
    const [rows, setRows] = useState(groups);
    const [request, confirm, cancel, run] = useConfirm();

    // Reorder updates local state first for instant feedback; every server
    // response then resyncs it to the truth.
    useEffect(() => {
        setRows(groups);
    }, [groups]);

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= rows.length) return;

        const next = [...rows];
        [next[index], next[target]] = [next[target], next[index]];
        setRows(next);

        router.patch('/admin/service-groups/reorder', { ids: next.map((r) => r.id) }, { preserveScroll: true });
    };

    const askDelete = (group) => {
        confirm({
            title: `Delete “${group.name}”?`,
            body: group.sub_services_count > 0
                ? `This also removes the ${group.sub_services_count} sub-service(s) filed under it from the public site.`
                : 'The tab is removed from the public Services page.',
            action: () => router.delete(`/admin/service-groups/${group.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title="Service Tabs | Marketorr Admin" />
            <PageHeader title="Service Tabs" subtitle={`${rows.length} tabs. These are the tabs on the public Services page, in order.`}>
                <Button as="link" href="/admin/service-groups/create">New tab</Button>
            </PageHeader>

            <Panel className="overflow-hidden">
                {rows.length === 0 ? (
                    <EmptyState>No service tabs yet, create the first one.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-3 font-bold">Order</th>
                                    <th className="pb-3 pr-4 font-bold">Tab</th>
                                    <th className="pb-3 pr-4 font-bold">Tagline</th>
                                    <th className="pb-3 pr-4 font-bold">Accent</th>
                                    <th className="pb-3 pr-4 font-bold">Sub-services</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 font-bold" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((group, index) => (
                                    <tr key={group.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-3">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => move(index, -1)}
                                                    disabled={index === 0}
                                                    aria-label={`Move ${group.name} up`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => move(index, 1)}
                                                    disabled={index === rows.length - 1}
                                                    aria-label={`Move ${group.name} down`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <p className="font-semibold text-[var(--ink)]">{group.name}</p>
                                            <p className="text-[12px] text-[var(--ink-faint)]">/{group.slug}</p>
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{group.tagline || '—'}</td>
                                        <td className="py-3 pr-4">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-4 w-8 rounded"
                                                    style={{ background: group.accent }}
                                                    aria-hidden
                                                />
                                                <span className="text-[12px] text-[var(--ink-faint)]">{group.accent}</span>
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 font-display font-bold text-[var(--ink)]">{group.sub_services_count}</td>
                                        <td className="py-3 pr-4"><Badge tone={group.status} /></td>
                                        <td className="py-3 text-right whitespace-nowrap">
                                            <Link
                                                href={`/admin/service-groups/${group.id}/edit`}
                                                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => askDelete(group)}
                                                className="ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

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

ServiceGroupsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
