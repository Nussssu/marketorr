import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import MailNav from '../../../components/admin/MailNav';
import { EmptyState, Input, PageHeader, Panel, Select } from '../../../components/admin/ui';

const STATUS_TONES = {
    sent: 'border-[#22c55e]/40 bg-[#22c55e]/10 text-[#16a34a]',
    failed: 'border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]',
    skipped: 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#d97706]',
    activity: 'border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 text-[var(--brand-2)]',
};

function StatusBadge({ status, label }) {
    return (
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${STATUS_TONES[status] ?? ''}`}>
            {label}
        </span>
    );
}

/** The setting and template field names an activity entry lists. */
const FIELD_LABELS = {
    enabled: 'SMTP on/off',
    host: 'Host',
    port: 'Port',
    encryption: 'Encryption',
    username: 'Username',
    password: 'Password',
    from_address: 'From address',
    from_name: 'From name',
    admin_notification_email: 'Admin notification email',
    subject: 'Subject',
    body: 'Body',
    enabled_template: 'On/off',
};

/**
 * One log entry in full: who and what, the error when there is one, and the
 * message exactly as it was sent, shown in a sandboxed frame.
 */
function LogModal({ id, onClose }) {
    const [log, setLog] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!id) return undefined;

        const controller = new AbortController();
        setLog(null);
        setFailed(false);
        fetch(`/admin/email-logs/${id}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
            .then((response) => (response.ok ? response.json() : Promise.reject(response)))
            .then(setLog)
            .catch((error) => {
                if (error?.name !== 'AbortError') setFailed(true);
            });

        const onKey = (event) => event.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);

        return () => {
            controller.abort();
            window.removeEventListener('keydown', onKey);
        };
    }, [id]);

    if (!id) return null;

    const rows = log ? [
        ['Type', log.sourceLabel],
        ['To', log.recipients],
        ['From', log.from],
        ['Subject', log.subject],
        ['Mailer', log.mailer],
        ['By', log.user ?? (log.status === 'activity' ? null : 'System (website)')],
        ['Time', log.createdAt],
    ].filter(([, value]) => value) : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Email log entry"
                className="w-full max-w-3xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
                    <div className="flex items-center gap-3">
                        {log && <StatusBadge status={log.status} label={log.statusLabel} />}
                        <h2 className="font-display text-[14px] font-bold text-[var(--ink-strong)]">{log?.subject ?? 'Email log'}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]" aria-label="Close">✕</button>
                </div>

                <div className="space-y-5 p-5">
                    {failed && <p className="text-[13px] text-[#ff6b6b]">This entry could not be loaded.</p>}
                    {!log && !failed && <p className="text-[13px] text-[var(--mute)]">Loading…</p>}

                    {log && (
                        <>
                            <dl className="grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-[8rem_1fr]">
                                {rows.map(([label, value]) => (
                                    <div key={label} className="contents">
                                        <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:pt-0.5">{label}</dt>
                                        <dd className="break-words text-[var(--ink)]">{value}</dd>
                                    </div>
                                ))}
                                {log.inquiryId && (
                                    <div className="contents">
                                        <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:pt-0.5">Lead</dt>
                                        <dd><Link href={`/admin/inquiries/${log.inquiryId}`} className="text-[var(--brand-2)] hover:underline">Open lead #{log.inquiryId} →</Link></dd>
                                    </div>
                                )}
                            </dl>

                            {log.error && (
                                <div className={`rounded-lg border px-4 py-3 text-[13px] ${log.status === 'failed' ? 'border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]' : 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#d97706]'}`}>
                                    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em]">{log.status === 'failed' ? 'Error' : 'Reason'}</p>
                                    <p className="break-words">{log.error}</p>
                                </div>
                            )}

                            {log.meta?.changed?.length > 0 && (
                                <div>
                                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Changed</p>
                                    <div className="flex flex-wrap gap-2">
                                        {log.meta.changed.map((field) => (
                                            <span key={field} className="rounded-full border border-[var(--line)] bg-[var(--chip)] px-3 py-1 text-[12px] text-[var(--ink)]">
                                                {FIELD_LABELS[field] ?? field}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {log.body && (
                                <div>
                                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Message</p>
                                    {/* Sandboxed with no permissions: the stored email renders, nothing in it runs. */}
                                    <iframe
                                        title="Email message"
                                        sandbox=""
                                        srcDoc={/<[a-z][\s\S]*>/i.test(log.body) ? log.body : `<pre style="white-space:pre-wrap;font:14px/1.6 system-ui,sans-serif;margin:16px">${log.body.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</pre>`}
                                        className="h-[28rem] w-full rounded-lg border border-[var(--line)] bg-white"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EmailLogsIndex({ logs, filters, counts, statuses, sources }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [openId, setOpenId] = useState(null);
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    const apply = (next) => {
        router.get('/admin/email-logs', Object.fromEntries(Object.entries({ ...filters, ...next }).filter(([, value]) => value)), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Email logs | Marketorr Admin" />
            <PageHeader
                title="Email & SMTP"
                subtitle="Every email the site sends, fails or skips, and every change to the email setup."
            />

            <MailNav activeTab="logs" />

            <div className="mb-4 flex flex-wrap gap-2">
                {[{ value: '', label: 'All', count: total }, ...statuses.map((status) => ({ ...status, count: counts[status.value] ?? 0 }))].map((option) => {
                    const active = (filters.status ?? '') === option.value;

                    return (
                        <button
                            key={option.value || 'all'}
                            type="button"
                            onClick={() => apply({ status: option.value })}
                            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${
                                active ? 'border-transparent text-white' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]'
                            }`}
                            style={active ? { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' } : undefined}
                        >
                            {option.label}
                            <span className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-white/20' : 'bg-[var(--chip)]'}`}>{option.count}</span>
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
                    className="grid gap-3 sm:grid-cols-[1fr_14rem]"
                >
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recipient or subject, then press Enter" aria-label="Search email logs" />
                    <Select value={filters.source ?? ''} onChange={(event) => apply({ source: event.target.value })} aria-label="Filter by type">
                        <option value="">All types</option>
                        {sources.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}
                    </Select>
                </form>
            </Panel>

            <Panel className="overflow-hidden">
                {logs.data.length === 0 ? (
                    <EmptyState>{total === 0 ? 'No email activity yet. Sends, failures and SMTP changes will appear here.' : 'Nothing matches these filters.'}</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Time</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 pr-4 font-bold">Type</th>
                                    <th className="pb-3 pr-4 font-bold">To</th>
                                    <th className="pb-3 pr-4 font-bold">Subject / action</th>
                                    <th className="pb-3 pr-4 font-bold">By</th>
                                    <th className="pb-3 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="align-top">
                                {logs.data.map((log) => (
                                    <tr key={log.id} onClick={() => setOpenId(log.id)} className="cursor-pointer border-t border-[var(--line)] transition-colors hover:bg-[var(--chip)]/50">
                                        <td className="whitespace-nowrap py-3 pr-4 text-[var(--mute)]" title={log.createdAt}>{log.createdAgo}</td>
                                        <td className="py-3 pr-4"><StatusBadge status={log.status} label={log.statusLabel} /></td>
                                        <td className="whitespace-nowrap py-3 pr-4 text-[var(--mute)]">{log.sourceLabel}</td>
                                        <td className="max-w-[14rem] truncate py-3 pr-4 text-[var(--ink)]" title={log.recipients ?? ''}>{log.recipients ?? '-'}</td>
                                        <td className="max-w-[18rem] py-3 pr-4">
                                            <p className="truncate text-[var(--ink-strong)]" title={log.subject ?? ''}>{log.subject ?? '-'}</p>
                                            {log.error && <p className={`truncate text-[12px] ${log.status === 'failed' ? 'text-[#ff6b6b]' : 'text-[#d97706]'}`} title={log.error}>{log.error}</p>}
                                        </td>
                                        <td className="whitespace-nowrap py-3 pr-4 text-[var(--mute)]">{log.user ?? (log.status === 'activity' ? '-' : 'Website')}</td>
                                        <td className="py-3">
                                            <button type="button" onClick={(event) => { event.stopPropagation(); setOpenId(log.id); }} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

            {logs.links?.length > 3 && (
                <nav className="mt-6 flex flex-wrap gap-2" aria-label="Pagination">
                    {logs.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            disabled={!link.url}
                            preserveScroll
                            className={`rounded-lg border px-3 py-2 text-[12px] font-bold ${
                                link.active
                                    ? 'border-transparent bg-[var(--chip)] text-[var(--ink-strong)]'
                                    : 'border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]'
                            } ${link.url ? '' : 'pointer-events-none opacity-40'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>
            )}

            <LogModal id={openId} onClose={() => setOpenId(null)} />
        </>
    );
}

EmailLogsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
