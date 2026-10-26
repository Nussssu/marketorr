import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, ConfirmDialog, EmptyState, Input, PageHeader, Panel, Select, useConfirm } from '../../../components/admin/ui';
import SnippetModal from './SnippetModal';

const GRADIENT = 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))';

const ICONS = {
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    delete: <><path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" /><path d="M10 11.5v5M14 11.5v5" /></>,
};

function Icon({ name }) {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[name]}
        </svg>
    );
}

const ACTION = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink-faint)] transition-colors duration-200 hover:bg-[var(--chip)] hover:text-[var(--ink)]';

export function Switch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
            style={{ background: checked ? GRADIENT : 'var(--field-line)' }}
        >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} aria-hidden />
        </button>
    );
}

const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'disabled', label: 'Disabled' },
];

export default function CustomCodeIndex({ snippets, filters, masterEnabled, locations, targets, pageOptions = [], openNew = false, openSnippet = null }) {
    // Errors from list actions, e.g. switching on a snippet whose code fails the publish checks.
    const pageErrors = usePage().props.errors ?? {};
    const [search, setSearch] = useState(filters.search ?? '');
    const [request, confirm, cancel, run] = useConfirm();
    // The add / edit popup: 'new', a snippet, or closed.
    const [editing, setEditing] = useState(() => (openNew ? 'new' : snippets.find((snippet) => snippet.id === openSnippet) ?? null));

    useEffect(() => {
        if (openNew) setEditing('new');
        else if (openSnippet) setEditing(snippets.find((snippet) => snippet.id === openSnippet) ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openNew, openSnippet]);

    // Closing drops ?new / ?edit from the address, so a reload does not reopen it.
    const closeEditor = () => {
        setEditing(null);
        const url = new URL(window.location.href);
        if (url.searchParams.has('new') || url.searchParams.has('edit')) {
            url.searchParams.delete('new');
            url.searchParams.delete('edit');
            window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
        }
    };

    const apply = (next) => {
        router.get('/admin/custom-code', Object.fromEntries(Object.entries({ ...filters, ...next }).filter(([, value]) => value)), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setMaster = (enabled) => {
        if (enabled) {
            router.patch('/admin/custom-code/master', { enabled: true }, { preserveScroll: true });

            return;
        }

        confirm({
            title: 'Switch off all custom code?',
            body: 'Every snippet stops running on the site straight away. Nothing is deleted, and switching back on restores them all.',
            confirmLabel: 'Switch off',
            action: () => router.patch('/admin/custom-code/master', { enabled: false }, { preserveScroll: true }),
        });
    };

    const askDelete = (snippet) => {
        confirm({
            title: `Delete “${snippet.name}”?`,
            body: 'The snippet is deleted permanently. To stop it running without losing it, switch it off instead.',
            confirmLabel: 'Delete',
            action: () => router.delete(`/admin/custom-code/${snippet.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title="Custom code | Marketorr Admin" />
            <PageHeader title="Custom Code" subtitle="CSS, scripts, tracking pixels and third-party embeds, injected into the public site. Never into the admin panel.">
                <Button type="button" onClick={() => setEditing('new')}>+ New snippet</Button>
            </PageHeader>

            {pageErrors.code && (
                <p role="alert" className="mb-4 rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-[13px] text-[#ff6b6b]">
                    This snippet cannot go live until its code is fixed: {pageErrors.code}
                </p>
            )}

            <div
                className={`mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 ${
                    masterEnabled ? 'border-[var(--line)] bg-[var(--surface)]' : 'border-[#ff6b6b]/40 bg-[#ff6b6b]/10'
                }`}
            >
                <div>
                    <p className="text-[13px] font-semibold text-[var(--ink-strong)]">
                        {masterEnabled ? 'Custom code is running on the site' : 'All custom code is switched off'}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--mute)]">
                        {masterEnabled
                            ? 'If a snippet breaks the site, switch this off to stop every snippet at once, then find the culprit.'
                            : 'No snippet runs on the site until this is switched back on. Snippets can still be edited.'}
                    </p>
                </div>
                <Switch checked={masterEnabled} onChange={setMaster} label="Run custom code on the site" />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {STATUS_FILTERS.map((option) => {
                    const active = (filters.status ?? '') === option.value;

                    return (
                        <button
                            key={option.value || 'all'}
                            type="button"
                            onClick={() => apply({ status: option.value })}
                            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${
                                active ? 'border-transparent text-white' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]'
                            }`}
                            style={active ? { background: GRADIENT } : undefined}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            <Panel className="mb-4">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        apply({ search });
                    }}
                    className="grid gap-3 sm:grid-cols-[1fr_11rem]"
                >
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or code, then press Enter" aria-label="Search snippets" />
                    <Select value={filters.location ?? ''} onChange={(event) => apply({ location: event.target.value })} aria-label="Filter by placement">
                        <option value="">All placements</option>
                        {locations.map((location) => <option key={location.value} value={location.value}>{location.label}</option>)}
                    </Select>
                </form>
            </Panel>

            <Panel className="overflow-hidden">
                {snippets.length === 0 ? (
                    <EmptyState>
                        {Object.values(filters).some(Boolean) ? 'No snippet matches these filters.' : 'No custom code yet. Add a snippet for analytics, a pixel, a chat widget or a CSS tweak.'}
                    </EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[880px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Priority</th>
                                    <th className="pb-3 pr-4 font-bold">Snippet</th>
                                    <th className="pb-3 pr-4 font-bold">Placement</th>
                                    <th className="pb-3 pr-4 font-bold">Pages</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 pr-4 font-bold">On</th>
                                    <th className="pb-3 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="align-top">
                                {snippets.map((snippet) => (
                                    <tr key={snippet.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-4 font-mono text-[12px] text-[var(--mute)]">{snippet.priority}</td>
                                        <td className="max-w-[18rem] py-3 pr-4">
                                            <button type="button" onClick={() => setEditing(snippet)} className="block max-w-full truncate text-left font-semibold text-[var(--ink-strong)] hover:underline">{snippet.name}</button>
                                            <p className="truncate text-[12px] text-[var(--ink-faint)]">
                                                {snippet.description || `${snippet.size.toLocaleString()} characters`}
                                                {snippet.updatedAt && ` · ${snippet.updatedAt}${snippet.updatedBy ? ` by ${snippet.updatedBy}` : ''}`}
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap py-3 pr-4 text-[var(--mute)]">{snippet.locationLabel}</td>
                                        <td className="max-w-[12rem] py-3 pr-4 text-[var(--mute)]">
                                            <p>{snippet.target === 'all' ? 'All pages' : snippet.target === 'only' ? 'Only' : 'All except'}</p>
                                            {snippet.targetPaths.length > 0 && <p className="truncate font-mono text-[11px] text-[var(--ink-faint)]" title={snippet.targetPaths.join(', ')}>{snippet.targetPaths.join(', ')}</p>}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${snippet.live && masterEnabled ? 'text-[#16a34a]' : 'text-[var(--ink-faint)]'}`}>
                                                <span className={`h-2 w-2 rounded-full ${snippet.live && masterEnabled ? 'bg-[#22c55e]' : 'bg-[var(--field-line)]'}`} aria-hidden />
                                                {snippet.status === 'published' ? (snippet.live && masterEnabled ? 'Live' : 'Published') : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Switch
                                                checked={snippet.enabled}
                                                onChange={(enabled) => router.patch(`/admin/custom-code/${snippet.id}/toggle`, { enabled }, { preserveScroll: true })}
                                                label={`${snippet.enabled ? 'Switch off' : 'Switch on'} ${snippet.name}`}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-1.5">
                                                <button type="button" onClick={() => setEditing(snippet)} className={ACTION} title="Edit" aria-label={`Edit ${snippet.name}`}><Icon name="edit" /></button>
                                                <button type="button" onClick={() => router.post(`/admin/custom-code/${snippet.id}/duplicate`)} className={ACTION} title="Duplicate" aria-label={`Duplicate ${snippet.name}`}><Icon name="copy" /></button>
                                                <button type="button" onClick={() => askDelete(snippet)} className={`${ACTION} !text-[#ff6b6b] hover:!bg-[#ff6b6b]/10`} title="Delete" aria-label={`Delete ${snippet.name}`}><Icon name="delete" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

            {editing && (
                <SnippetModal
                    key={editing === 'new' ? 'new' : editing.id}
                    snippet={editing === 'new' ? null : editing}
                    locations={locations}
                    targets={targets}
                    pageOptions={pageOptions}
                    onClose={closeEditor}
                    Switch={Switch}
                />
            )}

            <ConfirmDialog
                open={!!request}
                title={request?.title ?? ''}
                body={request?.body}
                confirmLabel={request?.confirmLabel}
                onConfirm={run}
                onCancel={cancel}
            />
        </>
    );
}

CustomCodeIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
