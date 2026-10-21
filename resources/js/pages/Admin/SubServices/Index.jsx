import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, ConfirmDialog, EmptyState, PageHeader, Panel, TAB_BAR_CLASS, TAB_GRADIENT, tabClass, useConfirm } from '../../../components/admin/ui';

const ICON_PATHS = {
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    view: <><path d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" /><circle cx="12" cy="12" r="2.75" /></>,
    copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></>,
    delete: <><path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" /><path d="M10 11.5v5M14 11.5v5" /></>,
};

const ICON_BUTTON = 'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors';
const NEUTRAL_ICON = `${ICON_BUTTON} text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]`;

function ActionIcon({ name }) {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICON_PATHS[name]}
        </svg>
    );
}

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

    // Flips the row at once for instant feedback; the server response then
    // resyncs the list to what was stored.
    const setStatus = (item, status) => {
        setRows((current) => current.map((row) => (row.id === item.id ? { ...row, status } : row)));
        router.patch(`/admin/sub-services/${item.id}/status`, { status }, { preserveScroll: true });
    };

    const duplicate = (item) => router.post(`/admin/sub-services/${item.id}/duplicate`, {}, { preserveScroll: true });

    return (
        <>
            <Head title="Sub-services | Marketorr Admin" />
            <PageHeader title="Sub-services" subtitle={`${rows.length} sub-services. Order here is the order inside each tab on the public site.`}>
                <Button as="link" href="/admin/sub-services/create">New sub-service</Button>
            </PageHeader>

            <div className={`mb-6 ${TAB_BAR_CLASS}`}>
                {groups.map((group) => {
                    const selected = String(activeGroup) === String(group.id);

                    return (
                        <button
                            key={group.id}
                            type="button"
                            onClick={() => setActiveGroup(group.id)}
                            className={`text-[11px] font-bold uppercase tracking-[0.14em] ${tabClass(selected)}`}
                            style={selected ? TAB_GRADIENT : undefined}
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
                                    <th className="pb-3 font-bold">Action</th>
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
                                            <a href={`/services/${item.group_slug}/${item.slug}`} target="_blank" rel="noreferrer" className="block truncate font-mono text-[12px] text-[var(--ink-faint)] hover:text-[var(--ink)] hover:underline" title="Open on the site">/services/{item.group_slug}/{item.slug} ↗</a>
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
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={item.status === 'published'}
                                                    aria-label={`${item.status === 'published' ? 'Unpublish' : 'Publish'} ${item.name}`}
                                                    title={item.status === 'published' ? 'Published, click to set as draft' : 'Draft, click to publish'}
                                                    onClick={() => setStatus(item, item.status === 'published' ? 'draft' : 'published')}
                                                    className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
                                                    style={{ background: item.status === 'published' ? 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' : 'var(--field-line)' }}
                                                >
                                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${item.status === 'published' ? 'translate-x-[18px]' : 'translate-x-0.5'}`} aria-hidden />
                                                </button>
                                            </span>
                                        </td>
                                        <td className="py-3 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                <Link href={`/admin/sub-services/${item.id}/edit`} className={NEUTRAL_ICON} title={`Edit ${item.name}`} aria-label={`Edit ${item.name}`}>
                                                    <ActionIcon name="edit" />
                                                </Link>
                                                <a href={`/services/${item.group_slug}/${item.slug}`} target="_blank" rel="noreferrer" className={NEUTRAL_ICON} title={`View ${item.name}`} aria-label={`View ${item.name}`}>
                                                    <ActionIcon name="view" />
                                                </a>
                                                <button type="button" onClick={() => duplicate(item)} className={NEUTRAL_ICON} title={`Copy ${item.name}`} aria-label={`Copy ${item.name}`}>
                                                    <ActionIcon name="copy" />
                                                </button>
                                                <button type="button" onClick={() => askDelete(item)} className={`${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`} title={`Delete ${item.name}`} aria-label={`Delete ${item.name}`}>
                                                    <ActionIcon name="delete" />
                                                </button>
                                            </div>
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
