import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, PageHeader, Panel } from '../../../components/admin/ui';

const CATEGORIES = [
    { key: 'all', label: 'All Activity' },
    { key: 'leads', label: 'Leads & Inquiries' },
    { key: 'system', label: 'System & Mail' },
    { key: 'users', label: 'Users' },
    { key: 'content', label: 'Content' },
];

export default function AuditLogsIndex({ logs = [], filters = {}, stats = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const currentCategory = filters.category ?? 'all';

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
                return <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">{status || 'Success'}</span>;
            case 'warning':
                return <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">{status || 'Warning'}</span>;
            case 'error':
                return <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 border border-rose-500/20">{status || 'Error'}</span>;
            default:
                return <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">{status || 'Info'}</span>;
        }
    };

    return (
        <>
            <Head title="Audit Logs — Marketorr Admin" />
            <PageHeader
                title="Audit logs"
                subtitle="Chronological audit trail of customer inquiries, SMTP dispatches, system logs and administrative actions."
            />

            {/* Quick metrics */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">Total Events</p>
                    <p className="mt-1 font-display text-2xl font-black text-[var(--ink-strong)]">{stats.total ?? logs.length}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">Lead Activity</p>
                    <p className="mt-1 font-display text-2xl font-black text-cyan-400">{stats.leads ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">System & Mail</p>
                    <p className="mt-1 font-display text-2xl font-black text-violet-400">{stats.system ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">User Changes</p>
                    <p className="mt-1 font-display text-2xl font-black text-emerald-400">{stats.users ?? 0}</p>
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
                            className="w-64 rounded-lg border border-[var(--field-line)] bg-[var(--surface)] px-3 py-1.5 text-[12px] text-[var(--ink)] placeholder-[var(--mute)] focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
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
                </form>
            </div>

            {/* Log entries list */}
            <Panel title="Event Stream" description="Live audit events recorded by application controllers and dispatchers.">
                {logs.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-[13px] font-medium text-[var(--mute)]">No audit log records found for this criteria.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--line)]">
                        {logs.map((item) => (
                            <div key={item.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 shrink-0">
                                        {getLevelBadge(item.level, item.status)}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--mute)]">
                                                [{item.type}]
                                            </span>
                                            <h3 className="text-[13px] font-semibold text-[var(--ink-strong)]">
                                                {item.title}
                                            </h3>
                                        </div>
                                        {item.description && (
                                            <p className="mt-0.5 text-[12px] text-[var(--mute)]">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-4 text-left sm:text-right">
                                    <div>
                                        <p className="text-[11px] font-medium text-[var(--ink-strong)]">{item.actor}</p>
                                        <p className="text-[10px] font-mono text-[var(--mute)]">IP: {item.ip}</p>
                                    </div>
                                    <div className="min-w-[90px]">
                                        <span className="block text-[11px] font-semibold text-[var(--ink)]">
                                            {item.time_for_humans}
                                        </span>
                                        <span className="block text-[10px] font-mono text-[var(--mute)]">
                                            {item.timestamp ? item.timestamp.split('T')[0] : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </>
    );
}

AuditLogsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
