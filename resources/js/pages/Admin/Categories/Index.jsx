import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

function Row({ category, depth = 0, onDelete }) {
    return (
        <tr className="border-t border-[var(--line)]">
            <td className="py-3 pr-4">
                <span style={{ paddingLeft: depth * 18 }} className="flex items-center gap-2">
                    {depth > 0 && <span aria-hidden className="text-[var(--ink-faint)]">└</span>}
                    {category.accent && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: category.accent }} aria-hidden />
                    )}
                    <span className="font-semibold text-[var(--ink-strong)]">{category.name}</span>
                </span>
            </td>
            <td className="py-3 pr-4 font-mono text-[12px] text-[var(--ink-faint)]">{category.slug}</td>
            <td className="py-3 pr-4 text-[var(--mute)]">{category.projects_count}</td>
            <td className="py-3 pr-4"><Badge tone={category.status} /></td>
            <td className="py-3 text-right">
                <div className="flex justify-end gap-3">
                    <Button as="link" variant="ghost" href={`/admin/categories/${category.id}/edit`}>Edit</Button>
                    <Button variant="ghost" onClick={() => onDelete(category)}>Delete</Button>
                </div>
            </td>
        </tr>
    );
}

export default function CategoriesIndex({ categories }) {
    const [request, confirm, cancel, run] = useConfirm();

    const askDelete = (category) => {
        const children = category.children?.length ?? 0;

        confirm({
            title: `Delete “${category.name}”?`,
            body: [
                category.projects_count > 0 && `${category.projects_count} project(s) will be left without a category.`,
                children > 0 && `${children} sub-categorie(s) will be moved to the top level.`,
                'The category itself is soft-deleted and can be restored from the database.',
            ].filter(Boolean).join(' '),
            action: () => router.delete(`/admin/categories/${category.id}`, { preserveScroll: true }),
        });
    };

    const total = categories.reduce((sum, c) => sum + 1 + (c.children?.length ?? 0), 0);

    return (
        <>
            <Head title="Categories — Marketorr Admin" />
            <PageHeader title="Categories" subtitle={`${total} categories. Projects are filed under these.`}>
                <Button as="link" href="/admin/categories/create">New category</Button>
            </PageHeader>

            <Panel className="overflow-hidden">
                {categories.length === 0 ? (
                    <EmptyState>No categories yet — create the first one.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Name</th>
                                    <th className="pb-3 pr-4 font-bold">Slug</th>
                                    <th className="pb-3 pr-4 font-bold">Projects</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 font-bold" />
                                </tr>
                            </thead>
                            <tbody>
                                {categories.flatMap((parent) => [
                                    <Row key={parent.id} category={parent} onDelete={askDelete} />,
                                    ...(parent.children ?? []).map((child) => (
                                        <Row key={child.id} category={child} depth={1} onDelete={askDelete} />
                                    )),
                                ])}
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

CategoriesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
