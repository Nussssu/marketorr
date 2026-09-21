import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

export default function PagesIndex({ pages }) {
    const [request, confirm, cancel, run] = useConfirm();

    const askDelete = (page) => {
        confirm({
            title: `Delete “${page.title}”?`,
            body: `Its ${page.sections_count} section(s) go with it. The page is soft-deleted and can be restored from the database.`,
            action: () => router.delete(`/admin/pages/${page.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title="Pages — Marketorr Admin" />
            <PageHeader
                title="Pages"
                subtitle="Every page on the site. Build each one from sections, and override its SEO."
            >
                <Button as="link" href="/admin/pages/create">New page</Button>
            </PageHeader>

            <Panel className="overflow-hidden">
                {pages.length === 0 ? (
                    <EmptyState>No pages yet — create the first one.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Page</th>
                                    <th className="pb-3 pr-4 font-bold">URL</th>
                                    <th className="pb-3 pr-4 font-bold">Sections</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 font-bold" />
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page) => (
                                    <tr key={page.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-4">
                                            <span className="font-semibold text-[var(--ink-strong)]">{page.title}</span>
                                            {page.is_system && (
                                                <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                                    System
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 font-mono text-[12px] text-[var(--ink-faint)]">{page.url}</td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{page.sections_count}</td>
                                        <td className="py-3 pr-4"><Badge tone={page.status} /></td>
                                        <td className="py-3 text-right">
                                            <div className="flex justify-end gap-3">
                                                <Button as="link" variant="ghost" href={`/admin/pages/${page.id}/builder`}>Sections</Button>
                                                <Button as="link" variant="ghost" href={`/admin/pages/${page.id}/edit`}>SEO</Button>
                                                {!page.is_system && (
                                                    <Button variant="ghost" onClick={() => askDelete(page)}>Delete</Button>
                                                )}
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

PagesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
