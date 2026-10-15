import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

const ICON_PATHS = {
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    view: <><path d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" /><circle cx="12" cy="12" r="2.75" /></>,
    duplicate: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></>,
    delete: <><path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" /><path d="M10 11.5v5M14 11.5v5" /></>,
};

const ICON_BUTTON =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors';
const NEUTRAL_ICON = `${ICON_BUTTON} text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]`;

function ActionIcon({ name }) {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICON_PATHS[name]}
        </svg>
    );
}

export default function PagesIndex({ pages }) {
    const [request, confirm, cancel, run] = useConfirm();

    const askDelete = (page) => {
        confirm({
            title: `Delete “${page.title}”?`,
            body: `Its ${page.sections_count} section(s) go with it. The page is soft-deleted and can be restored from the database.`,
            action: () => router.delete(`/admin/pages/${page.id}`, { preserveScroll: true }),
        });
    };

    const duplicate = (page) => router.post(`/admin/pages/${page.id}/duplicate`, {}, { preserveScroll: true });

    const toggleVisibility = (page) => {
        router.patch(`/admin/pages/${page.id}/visibility`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Pages | Marketorr Admin" />
            <PageHeader
                title="Pages"
                subtitle="Every page on the site. Build each one from sections, and override its SEO."
            >
                <Button as="link" href="/admin/pages/create">New page</Button>
            </PageHeader>

            <Panel className="overflow-hidden">
                {pages.length === 0 ? (
                    <EmptyState>No pages yet, create the first one.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Page</th>
                                    <th className="pb-3 pr-4 font-bold">URL</th>
                                    <th className="pb-3 pr-4 font-bold">Sections</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 pr-4 font-bold">Visibility</th>
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
                                        <td className="py-3 pr-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleVisibility(page)}
                                                role="switch"
                                                aria-checked={page.status === 'published'}
                                                aria-label={`${page.status === 'published' ? 'Hide' : 'Show'} ${page.title}`}
                                                className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                                                    page.status === 'published'
                                                        ? 'border-transparent'
                                                        : 'border-[var(--field-line)] bg-[var(--chip)]'
                                                }`}
                                                style={page.status === 'published' ? { background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' } : undefined}
                                            >
                                                <span
                                                    className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${
                                                        page.status === 'published' ? 'left-[25px]' : 'left-[3px]'
                                                    }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/admin/pages/${page.id}/builder`} className={NEUTRAL_ICON} title={`Edit ${page.title}`} aria-label={`Edit ${page.title}`}>
                                                    <ActionIcon name="edit" />
                                                </Link>
                                                {/* Plain anchor: the public page is a different app shell. */}
                                                <a href={page.url} target="_blank" rel="noreferrer" className={NEUTRAL_ICON} title={`View ${page.title}`} aria-label={`View ${page.title}`}>
                                                    <ActionIcon name="view" />
                                                </a>
                                                <button type="button" onClick={() => duplicate(page)} className={NEUTRAL_ICON} title={`Duplicate ${page.title}`} aria-label={`Duplicate ${page.title}`}>
                                                    <ActionIcon name="duplicate" />
                                                </button>
                                                {!page.is_system && (
                                                    <button type="button" onClick={() => askDelete(page)} className={`${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`} title={`Delete ${page.title}`} aria-label={`Delete ${page.title}`}>
                                                        <ActionIcon name="delete" />
                                                    </button>
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
