import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

export default function SubServicesIndex({ groups, items }) {
    const [rows, setRows] = useState(items);
    const [activeGroup, setActiveGroup] = useState(() => groups[0]?.id ?? null);
    const [request, confirm, cancel, run] = useConfirm();

    // Reorder updates local state first for instant feedback; every server
    // response then resyncs it to the truth.
    useEffect(() => {
        setRows(items);
    }, [items]);

    const inActiveGroup = (item) => String(item.service_group_id) === String(activeGroup);
    const visible = rows.filter(inActiveGroup);

    const move = (visibleIndex, direction) => {
        const target = visibleIndex + direction;
        if (target < 0 || target >= visible.length) return;

        // Swap the two rows inside this tab, then write the tab's new order
        // back into the slots its rows hold in the full list, so every other
        // tab keeps its order untouched.
        const reordered = [...visible];
        [reordered[visibleIndex], reordered[target]] = [reordered[target], reordered[visibleIndex]];
        let cursor = 0;
        const next = rows.map((row) => (inActiveGroup(row) ? reordered[cursor++] : row));
        setRows(next);

        router.patch('/admin/sub-services/reorder', { ids: next.map((r) => r.id) }, { preserveScroll: true });
    };

    const askDelete = (item) => {
        confirm({
            title: `Delete “${item.name}”?`,
            body: 'The sub-service page is removed from the public site. Related work keeps showing from the rest of the portfolio.',
            action: () => router.delete(`/admin/sub-services/${item.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title="Sub-services | Marketorr Admin" />
            <PageHeader title="Sub-services" subtitle={`${rows.length} sub-services. Order here is the order inside each tab on the public site.`}>
                <Button as="link" href="/admin/sub-services/create">New sub-service</Button>
            </PageHeader>

            <div className="mb-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
                {groups.map((group) => {
                    const selected = String(activeGroup) === String(group.id);

                    return (
                        <button
                            key={group.id}
                            type="button"
                            onClick={() => setActiveGroup(group.id)}
                            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
                                selected ? 'text-white shadow-sm' : 'text-[var(--mute)] hover:text-[var(--ink)]'
                            }`}
                            style={selected ? { background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' } : undefined}
                        >
                            {group.name}
                        </button>
                    );
                })}
            </div>

            <Panel className="overflow-hidden">
                {visible.length === 0 ? (
                    <EmptyState>No sub-services here yet.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-3 font-bold">Order</th>
                                    <th className="pb-3 pr-4 font-bold">Sub-service</th>
                                    <th className="pb-3 pr-4 font-bold">Tab</th>
                                    <th className="pb-3 pr-4 font-bold">Tagline</th>
                                    <th className="pb-3 pr-4 font-bold">Accent</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 font-bold" />
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item, index) => (
                                    <tr key={item.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-3">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => move(index, -1)}
                                                    disabled={index === 0}
                                                    title={`Move ${item.name} up`}
                                                    aria-label={`Move ${item.name} up`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => move(index, 1)}
                                                    disabled={index === visible.length - 1}
                                                    title={`Move ${item.name} down`}
                                                    aria-label={`Move ${item.name} down`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                                            <p className="text-[12px] text-[var(--ink-faint)]">/{item.group_slug}/{item.slug}</p>
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{item.group_name}</td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{item.short || '—'}</td>
                                        <td className="py-3 pr-4">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-4 w-8 rounded"
                                                    style={{ background: item.accent }}
                                                    aria-hidden
                                                />
                                                <span className="text-[12px] text-[var(--ink-faint)]">{item.accent}</span>
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4"><Badge tone={item.status} /></td>
                                        <td className="py-3 text-right whitespace-nowrap">
                                            <Link
                                                href={`/admin/sub-services/${item.id}/edit`}
                                                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => askDelete(item)}
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

SubServicesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
