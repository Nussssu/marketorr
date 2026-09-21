import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

export default function ProjectsIndex({ projects }) {
    // Local copy so the up/down buttons reorder instantly, then persist.
    const [rows, setRows] = useState(projects);
    const [request, confirm, cancel, run] = useConfirm();

    // Reorder updates local state first for instant feedback; every server
    // response (reorder, feature toggle, delete) then resyncs it to the truth.
    useEffect(() => {
        setRows(projects);
    }, [projects]);

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= rows.length) return;

        const next = [...rows];
        [next[index], next[target]] = [next[target], next[index]];
        setRows(next);

        router.patch('/admin/projects/reorder', { ids: next.map((r) => r.id) }, { preserveScroll: true });
    };

    const toggleFeatured = (project) => {
        router.patch(`/admin/projects/${project.id}/featured`, {}, { preserveScroll: true });
    };

    const askDelete = (project) => {
        confirm({
            title: `Delete “${project.title}”?`,
            body: 'The project is soft-deleted and can be restored from the database.',
            action: () => router.delete(`/admin/projects/${project.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title="Projects — Marketorr Admin" />
            <PageHeader title="Projects" subtitle={`${rows.length} case studies. Order here is the order on the public site.`}>
                <Button as="link" href="/admin/projects/create">New project</Button>
            </PageHeader>

            <Panel className="overflow-hidden">
                {rows.length === 0 ? (
                    <EmptyState>No projects yet — create the first one.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-3 font-bold">Order</th>
                                    <th className="pb-3 pr-4 font-bold">Project</th>
                                    <th className="pb-3 pr-4 font-bold">Client</th>
                                    <th className="pb-3 pr-4 font-bold">Year</th>
                                    <th className="pb-3 pr-4 font-bold">Featured</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 font-bold" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((project, index) => (
                                    <tr key={project.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-3">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => move(index, -1)}
                                                    disabled={index === 0}
                                                    aria-label={`Move ${project.title} up`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => move(index, 1)}
                                                    disabled={index === rows.length - 1}
                                                    aria-label={`Move ${project.title} down`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={project.image_url}
                                                    alt=""
                                                    className="h-10 w-16 shrink-0 rounded object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-[var(--ink)]">{project.title}</p>
                                                    <p className="truncate text-[12px] text-[var(--ink-faint)]">/{project.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{project.client}</td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{project.year}</td>
                                        <td className="py-3 pr-4">
                                            <button
                                                onClick={() => toggleFeatured(project)}
                                                role="switch"
                                                aria-checked={project.featured}
                                                aria-label={`Feature ${project.title}`}
                                                className={`relative h-6 w-11 rounded-full border transition-colors ${
                                                    project.featured ? 'border-transparent' : 'border-[var(--field-line)] bg-[var(--chip)]'
                                                }`}
                                                style={project.featured ? { background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' } : undefined}
                                            >
                                                <span
                                                    className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${
                                                        project.featured ? 'left-[25px]' : 'left-[3px]'
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="py-3 pr-4"><Badge tone={project.status} /></td>
                                        <td className="py-3 text-right whitespace-nowrap">
                                            <Link
                                                href={`/admin/projects/${project.id}/edit`}
                                                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => askDelete(project)}
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

ProjectsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
