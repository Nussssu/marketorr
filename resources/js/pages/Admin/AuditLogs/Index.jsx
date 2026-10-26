import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, ConfirmDialog, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

const CATEGORIES = [
    { key: 'all', label: 'All Activity' },
    { key: 'leads', label: 'Leads & Inquiries' },
    { key: 'system', label: 'System & Mail' },
    { key: 'users', label: 'Users' },
    { key: 'content', label: 'Content' },
];

/** Module group names, as the category tabs show them. */
const CATEGORY_LABELS = { leads: 'Leads', system: 'System', mail: 'Mail', users: 'Users', content: 'Content' };

/** Up to two initials for the user column's avatar. */
function initials(name) {
    return String(name || '?')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || '?';
}

function descriptionPreview(description, maxLength = 48) {
    const text = String(description || 'No additional details.');

    return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

/** Up to five consecutive page numbers, centred on the current page. */
function paginationWindow(currentPage, lastPage) {
    const visiblePages = Math.min(5, lastPage);
    const firstPage = Math.min(
        Math.max(currentPage - Math.floor(visiblePages / 2), 1),
        lastPage - visiblePages + 1,
    );

    return Array.from({ length: visiblePages }, (_, index) => firstPage + index);
}

function pageUrl(page, filters) {
    const query = new URLSearchParams({
        category: filters.category ?? 'all',
        ...(filters.search ? { search: filters.search } : {}),
        page: String(page),
    });

    return `/admin/audit-logs?${query.toString()}`;
}

function AuditLogModal({ item, onClose }) {
    useEffect(() => {
        if (!item) return undefined;

        const closeOnEscape = (event) => event.key === 'Escape' && onClose();
        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [item, onClose]);

    if (!item) return null;

    const details = [
        ['User', item.actor],
        ['Action', item.status],
        ['Type', item.type],
        ['Module', CATEGORY_LABELS[item.category] ?? item.category],
        ['IP address', item.ip],
        ['Time', item.timestamp],
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Audit log details"
                className="w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Audit event</p>
                        <h2 className="mt-1 font-display text-[16px] font-bold text-[var(--ink-strong)]">{item.title}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]" aria-label="Close">
                        &times;
                    </button>
                </header>

                <div className="space-y-5 p-5">
                    <dl className="grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-[8rem_1fr]">
                        {details.map(([label, value]) => (
                            <div key={label} className="contents">
                                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">{label}</dt>
                                <dd className="break-words text-[var(--ink)]">{value || '-'}</dd>
                            </div>
                        ))}
                    </dl>

                    {item.description && (
                        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Description</p>
                            <p className="break-words text-[13px] leading-6 text-[var(--ink)]">{item.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AuditLogsIndex({ logs = { data: [], links: [] }, filters = {}, stats = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedLog, setSelectedLog] = useState(null);
    const currentCategory = filters.category ?? 'all';
    const [request, confirm, cancel, run] = useConfirm();

    // Clears the open tab (All Activity clears everything).
    const askClear = () => {
        const label = CATEGORIES.find((cat) => cat.key === currentCategory)?.label ?? 'All Activity';

        confirm({
            title: currentCategory === 'all' ? 'Clear the whole audit log?' : `Clear “${label}”?`,
            body: 'Every entry shown here is removed from the audit log and cannot be brought back. Inquiries, media files and settings themselves are not touched; new activity keeps being logged.',
            confirmLabel: 'Clear',
            action: () => router.delete('/admin/audit-logs', { data: { category: currentCategory }, preserveScroll: true }),
        });
    };

    const handleCategoryChange = (key) => {
        router.get(
            '/admin/audit-logs',
            { category: key, search: search || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/admin/audit-logs',
            { category: currentCategory, search: search || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const getLevelBadge = (level, status) => {
        switch (level) {
            case 'success':
                return <span title={status || 'Success'} className="inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-3)]/40 bg-[var(--brand-3)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-3)]">{status || 'Success'}</span>;
            case 'warning':
                return <span title={status || 'Warning'} className="inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6F91FF]">{status || 'Warning'}</span>;
            case 'error':
                return <span title={status || 'Error'} className="inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-1)]/40 bg-[var(--brand-1)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#A855F7]">{status || 'Error'}</span>;
            default:
                return <span title={status || 'Info'} className="inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6F91FF]">{status || 'Info'}</span>;
        }
    };

    return (
        <>
            <Head title="Audit Logs | Marketorr Admin" />
            <PageHeader
                title="Audit logs"
                subtitle="Chronological audit trail of customer inquiries, SMTP dispatches, system logs and administrative actions."
            />

            {/* Quick metrics */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">Total Events</p>
                    <p className="mt-1 font-display text-2xl font-black text-[var(--ink-strong)]">{stats.total ?? logs.total ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">Lead Activity</p>
                    <p className="mt-1 font-display text-2xl font-black text-[var(--brand-3)]">{stats.leads ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">System & Mail</p>
                    <p className="mt-1 font-display text-2xl font-black text-[#A855F7]">{stats.system ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">User Changes</p>
                    <p className="mt-1 font-display text-2xl font-black text-[#6F91FF]">{stats.users ?? 0}</p>
                </div>
            </div>

            {/* Category tabs & Search bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key}
                            type="button"
                            onClick={() => handleCategoryChange(cat.key)}
                            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
                                currentCategory === cat.key
                                    ? 'bg-[var(--chip)] text-[var(--ink-strong)] shadow-sm'
                                    : 'text-[var(--mute)] hover:text-[var(--ink)]'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter audit logs..."
                            className="w-64 rounded-lg border border-[var(--field-line)] bg-[var(--surface)] px-3 py-1.5 text-[12px] text-[var(--ink)] placeholder-[var(--mute)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-3)] focus:border-[var(--brand-3)] transition-colors"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/admin/audit-logs', { category: currentCategory }, { preserveState: true });
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--mute)] hover:text-[var(--ink)]"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="rounded-lg border border-[var(--line)] bg-[var(--chip)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] hover:bg-[var(--line)]"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={askClear}
                        title={currentCategory === 'all' ? 'Clear the whole audit log' : 'Clear this tab'}
                        className="rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff6b6b] hover:bg-[#ff6b6b]/20"
                    >
                        Clear
                    </button>
                </form>
            </div>

            {/* Log entries list */}
            <Panel title="Event Stream" description="Live audit events recorded by application controllers and dispatchers.">
                {logs.data.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-[13px] font-medium text-[var(--mute)]">No audit log records found for this criteria.</p>
                    </div>
                ) : (
                    <div className="-mx-5 overflow-hidden px-5">
                        <table className="w-full table-fixed text-left text-[13px]">
                            <colgroup>
                                <col className="w-[16%]" />
                                <col className="w-[17%]" />
                                <col className="w-[16%]" />
                                <col className="w-[24%]" />
                                <col className="w-[11%]" />
                                <col className="w-[10%]" />
                                <col className="w-[6%]" />
                            </colgroup>
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="px-3 pb-3 font-bold">User</th>
                                    <th className="px-3 pb-3 font-bold">Action</th>
                                    <th className="px-3 pb-3 font-bold">Module</th>
                                    <th className="px-3 pb-3 font-bold">Description</th>
                                    <th className="px-3 pb-3 font-bold">IP</th>
                                    <th className="px-3 pb-3 font-bold">When</th>
                                    <th className="px-3 pb-3 text-right font-bold"><span className="sr-only">Action</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map((item) => (
                                    <tr key={item.id} className="border-t border-[var(--line)] align-top transition-colors hover:bg-[var(--chip)]/40">
                                        <td className="px-3 py-3.5">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <span
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                                                    style={{ background: 'linear-gradient(135deg,var(--brand-1),var(--brand-2),var(--brand-3))' }}
                                                    aria-hidden
                                                >
                                                    {initials(item.actor)}
                                                </span>
                                                <span className="min-w-0 truncate font-semibold text-[var(--ink-strong)]" title={item.actor}>{item.actor || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3.5">{getLevelBadge(item.level, item.status)}</td>
                                        <td className="px-3 py-3.5">
                                            <p className="truncate font-semibold text-[var(--ink)]" title={item.type}>{item.type}</p>
                                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">{CATEGORY_LABELS[item.category] ?? item.category}</p>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <p className="truncate font-semibold text-[var(--ink-strong)]" title={item.title}>{item.title}</p>
                                            <p className="mt-0.5 truncate text-[12px] text-[var(--mute)]" title={item.description}>{descriptionPreview(item.description)}</p>
                                        </td>
                                        <td className="overflow-hidden whitespace-nowrap px-3 py-3.5 font-mono text-[12px] text-[var(--mute)]">
                                            <span className="block truncate" title={item.ip}>{item.ip || '—'}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3.5">
                                            <p className="font-semibold text-[var(--ink)]">{item.time_for_humans}</p>
                                            <p className="mt-0.5 font-mono text-[11px] text-[var(--ink-faint)]">{item.timestamp ? item.timestamp.split('T')[0] : ''}</p>
                                        </td>
                                        <td className="px-3 py-3.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLog(item)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                                                aria-label={`View ${item.title}`}
                                                title="View details"
                                            >
                                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12s-3.5 6.75-9.75 6.75S2.25 12 2.25 12Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

            {logs.last_page > 1 && (
                <nav className="mt-6 flex flex-wrap justify-end gap-2" aria-label="Pagination">
                    <Link
                        href={logs.prev_page_url ?? '#'}
                        disabled={!logs.prev_page_url}
                        preserveScroll
                        className={`rounded-lg border border-[var(--line)] px-3 py-2 text-[12px] font-bold text-[var(--ink-faint)] hover:text-[var(--ink)] ${logs.prev_page_url ? '' : 'pointer-events-none opacity-40'}`}
                    >
                        Previous
                    </Link>
                    {paginationWindow(logs.current_page, logs.last_page).map((page) => (
                        <Link
                            key={page}
                            href={pageUrl(page, filters)}
                            preserveScroll
                            className={`rounded-lg border px-3 py-2 text-[12px] font-bold ${
                                page === logs.current_page
                                    ? 'border-transparent bg-[var(--chip)] text-[var(--ink-strong)]'
                                    : 'border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]'
                            }`}
                        >
                            {page}
                        </Link>
                    ))}
                    <Link
                        href={logs.next_page_url ?? '#'}
                        disabled={!logs.next_page_url}
                        preserveScroll
                        className={`rounded-lg border border-[var(--line)] px-3 py-2 text-[12px] font-bold text-[var(--ink-faint)] hover:text-[var(--ink)] ${logs.next_page_url ? '' : 'pointer-events-none opacity-40'}`}
                    >
                        Next
                    </Link>
                </nav>
            )}

            <AuditLogModal item={selectedLog} onClose={() => setSelectedLog(null)} />
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

AuditLogsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
