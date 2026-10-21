import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, ConfirmDialog, EmptyState, PageHeader, Panel, TAB_BAR_CLASS, TAB_GRADIENT, tabClass, useConfirm } from '../../../components/admin/ui';

/** The two Our Work portfolios, each project listed under the one it shows in. */
const PORTFOLIO_TABS = [
    { key: 'branding', label: 'Branding' },
    { key: 'uiux', label: 'UI/UX' },
];

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

export default function ProjectsIndex({ projects }) {
    // Local copy so the up/down buttons reorder instantly, then persist.
    const [rows, setRows] = useState(projects);
    const [request, confirm, cancel, run] = useConfirm();
    const [activeTab, setActiveTab] = useState('branding');
    const visible = rows.filter((row) => row.portfolio === activeTab);

    // Reorder updates local state first for instant feedback; every server
    // response (reorder, feature toggle, delete) then resyncs it to the truth.
    useEffect(() => {
        setRows(projects);
    }, [projects]);

    // Moves within the open tab; the server keeps the other tab's places.
    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= visible.length) return;

        const order = [...visible];
        [order[index], order[target]] = [order[target], order[index]];

        const slots = rows.map((row, position) => (row.portfolio === activeTab ? position : null)).filter((position) => position !== null);
        const next = [...rows];
        slots.forEach((position, i) => {
            next[position] = order[i];
        });
        setRows(next);

        router.patch('/admin/projects/reorder', { ids: order.map((r) => r.id) }, { preserveScroll: true });
    };

    const toggleFeatured = (project) => {
        router.patch(`/admin/projects/${project.id}/featured`, {}, { preserveScroll: true });
    };

    const updateStatus = (project, status) => {
        const previousStatus = project.status;
        setRows((current) => current.map((row) => (row.id === project.id ? { ...row, status } : row)));

        router.patch(
            `/admin/projects/${project.id}/status`,
            { status },
            {
                preserveScroll: true,
                onError: () => setRows((current) => current.map((row) => (
                    row.id === project.id ? { ...row, status: previousStatus } : row
                ))),
            },
        );
    };

    const askDelete = (project) => {
        confirm({
            title: `Delete “${project.title}”?`,
            body: 'The project is soft-deleted and can be restored from the database.',
            action: () => router.delete(`/admin/projects/${project.id}`, { preserveScroll: true }),
        });
    };

    const duplicate = (project) => router.post(`/admin/projects/${project.id}/duplicate`, {}, { preserveScroll: true });

    return (
        <>
            <Head title="Projects | Marketorr Admin" />
            <PageHeader title="Projects" subtitle={`${rows.length} projects. Order here is the order on the public site.`}>
                <Button as="link" href="/admin/projects/create">New project</Button>
            </PageHeader>

            <div className={`mb-6 ${TAB_BAR_CLASS}`} role="tablist" aria-label="Portfolio">
                {PORTFOLIO_TABS.map((tab) => {
                    const selected = activeTab === tab.key;
                    const count = rows.filter((row) => row.portfolio === tab.key).length;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => setActiveTab(tab.key)}
                            className={`text-[11px] font-bold uppercase tracking-[0.14em] ${tabClass(selected)}`}
                            style={selected ? TAB_GRADIENT : undefined}
                        >
                            {tab.label} <span className="opacity-70">({count})</span>
                        </button>
                    );
                })}
            </div>

            <Panel className="overflow-hidden">
                {visible.length === 0 ? (
                    <EmptyState>No {PORTFOLIO_TABS.find((tab) => tab.key === activeTab)?.label} projects yet, create the first one.</EmptyState>
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
                                    <th className="pb-3 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((project, index) => (
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
                                                    disabled={index === visible.length - 1}
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
                                                    <a href={project.public_url} target="_blank" rel="noreferrer" className="block truncate font-mono text-[12px] text-[var(--ink-faint)] hover:text-[var(--ink)] hover:underline" title="Open on the site">{project.public_url} ↗</a>
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
                                                className={`relative h-5 w-9 rounded-full border transition-colors ${
                                                    project.featured ? 'border-transparent' : 'border-[var(--field-line)] bg-[var(--chip)]'
                                                }`}
                                                style={project.featured ? { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' } : undefined}
                                            >
                                                <span
                                                    className={`absolute top-[3px] h-3 w-3 rounded-full bg-white transition-all ${
                                                        project.featured ? 'left-[21px]' : 'left-[3px]'
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateStatus(project, project.status === 'published' ? 'draft' : 'published')}
                                                    role="switch"
                                                    aria-checked={project.status === 'published'}
                                                    aria-label={`${project.status === 'published' ? 'Hide' : 'Show'} ${project.title}`}
                                                    className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
                                                        project.status === 'published' ? 'border-transparent' : 'border-[var(--field-line)] bg-[var(--chip)]'
                                                    }`}
                                                    style={project.status === 'published' ? { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' } : undefined}
                                                >
                                                    <span
                                                        className={`absolute top-[3px] h-3 w-3 rounded-full bg-white transition-all ${
                                                            project.status === 'published' ? 'left-[21px]' : 'left-[3px]'
                                                        }`}
                                                    />
                                                </button>
                                                <span className="text-[11px] font-semibold text-[var(--ink-faint)]">
                                                    {project.status === 'published' ? 'Show' : 'Hide'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                <Link href={`/admin/projects/${project.id}/edit`} className={NEUTRAL_ICON} title={`Edit ${project.title}`} aria-label={`Edit ${project.title}`}>
                                                    <ActionIcon name="edit" />
                                                </Link>
                                                <a href={project.public_url} target="_blank" rel="noreferrer" className={NEUTRAL_ICON} title={`View ${project.title}`} aria-label={`View ${project.title}`}>
                                                    <ActionIcon name="view" />
                                                </a>
                                                <button type="button" onClick={() => duplicate(project)} className={NEUTRAL_ICON} title={`Copy ${project.title}`} aria-label={`Copy ${project.title}`}>
                                                    <ActionIcon name="copy" />
                                                </button>
                                                <button type="button" onClick={() => askDelete(project)} className={`${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`} title={`Delete ${project.title}`} aria-label={`Delete ${project.title}`}>
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

ProjectsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
