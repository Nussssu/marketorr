import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, Input, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';
import { withAlpha } from '../../../lib/tokens';

const STATUS_THEME = {
    new: { label: 'New', color: 'var(--brand-1)', background: 'rgba(var(--brand-1-rgb),0.1)' },
    in_progress: { label: 'In Progress', color: 'var(--brand-2)', background: 'rgba(var(--brand-2-rgb),0.1)' },
    replied: { label: 'Replied', color: 'var(--brand-3)', background: 'rgba(var(--brand-3-rgb),0.1)' },
    archived: { label: 'Archived', color: '#8B98A8', background: 'rgba(139,152,168,0.1)' },
};

function StatusSelect({ inquiry, statuses }) {
    const [open, setOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(inquiry.status);
    const [highlighted, setHighlighted] = useState(-1);
    const [menuPosition, setMenuPosition] = useState(null);
    const [saving, setSaving] = useState(false);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const theme = STATUS_THEME[currentStatus] ?? STATUS_THEME.archived;

    useEffect(() => {
        setCurrentStatus(inquiry.status);
    }, [inquiry.status]);

    useEffect(() => {
        if (!open) return undefined;

        const closeOnOutsidePress = (event) => {
            if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        const closeOnViewportChange = () => setOpen(false);

        document.addEventListener('pointerdown', closeOnOutsidePress);
        document.addEventListener('keydown', closeOnEscape);
        window.addEventListener('resize', closeOnViewportChange);
        window.addEventListener('scroll', closeOnViewportChange, true);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsidePress);
            document.removeEventListener('keydown', closeOnEscape);
            window.removeEventListener('resize', closeOnViewportChange);
            window.removeEventListener('scroll', closeOnViewportChange, true);
        };
    }, [open]);

    const openList = () => {
        const bounds = buttonRef.current?.getBoundingClientRect();

        if (!bounds) return;

        const menuWidth = 144;
        const menuHeight = statuses.length * 37 + 12;
        const dropUp = window.innerHeight - bounds.bottom < menuHeight + 12 && bounds.top > menuHeight;

        setHighlighted(Math.max(0, statuses.indexOf(currentStatus)));
        setMenuPosition({
            left: Math.min(bounds.left, window.innerWidth - menuWidth - 8),
            top: dropUp ? bounds.top - 8 : bounds.bottom + 8,
            dropUp,
            width: Math.max(bounds.width, menuWidth),
        });
        setOpen(true);
    };

    const choose = (status) => {
        if (status === currentStatus) {
            setOpen(false);

            return;
        }

        const previousStatus = currentStatus;
        setCurrentStatus(status);
        setOpen(false);
        setSaving(true);
        router.patch(
            `/admin/inquiries/${inquiry.id}/status`,
            { status },
            {
                preserveScroll: true,
                onError: () => setCurrentStatus(previousStatus),
                onFinish: () => setSaving(false),
            },
        );
    };

    const onKeyDown = (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        if (!open) {
            openList();

            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setHighlighted((index) => (index + step + statuses.length) % statuses.length);
        } else if (highlighted >= 0) {
            choose(statuses[highlighted]);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Change status for ${inquiry.name}`}
                disabled={saving}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onKeyDown}
                className="flex h-9 w-[132px] items-center justify-between gap-2 rounded-lg border py-0 pr-3 pl-3 text-left text-[12px] font-semibold transition-all disabled:cursor-wait disabled:opacity-60"
                style={{ borderColor: `${withAlpha(theme.color, '66')}`, color: theme.color, background: theme.background }}
            >
                <span className="min-w-0 truncate">{saving ? 'Saving…' : theme.label}</span>
                <svg
                    viewBox="0 0 12 7"
                    className={`h-[7px] w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    aria-hidden
                >
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && menuPosition && typeof document !== 'undefined' && createPortal(
                <ul
                    ref={menuRef}
                    role="listbox"
                    aria-label={`Status for ${inquiry.name}`}
                    className="fixed z-[300] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]"
                    style={{
                        left: menuPosition.left,
                        top: menuPosition.top,
                        width: menuPosition.width,
                        transform: menuPosition.dropUp ? 'translateY(-100%)' : undefined,
                    }}
                >
                    {statuses.map((status, index) => {
                        const optionTheme = STATUS_THEME[status] ?? STATUS_THEME.archived;
                        const active = highlighted === index;
                        const selected = currentStatus === status;

                        return (
                            <li
                                key={status}
                                role="option"
                                aria-selected={selected}
                                onPointerEnter={() => setHighlighted(index)}
                                onClick={() => choose(status)}
                                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors duration-150 ${active ? 'text-white' : 'text-[var(--ink)]'} ${selected ? 'font-bold' : 'font-medium'}`}
                                style={active ? { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' } : undefined}
                            >
                                <span>{optionTheme.label}</span>
                                {selected && (
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#fff' : optionTheme.color }} aria-hidden />
                                )}
                            </li>
                        );
                    })}
                </ul>,
                document.body,
            )}
        </>
    );
}

/**
 * A filter dropdown (All statuses / All types) whose open list matches the
 * message-status menu: dark surface, brand-gradient highlight, a dot on the
 * chosen option. The trigger keeps the look of the other filter fields.
 *
 * @param {{ value: string, onChange: (value: string) => void, options: Array<{ value: string, label: string }>, placeholder: string, label: string }} props
 */
function FilterSelect({ value, onChange, options, placeholder, label }) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [menuPosition, setMenuPosition] = useState(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const choices = [{ value: '', label: placeholder }, ...options];
    const current = choices.find((choice) => choice.value === value) ?? choices[0];

    useEffect(() => {
        if (!open) return undefined;

        const closeOnOutsidePress = (event) => {
            if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        const closeOnViewportChange = () => setOpen(false);

        document.addEventListener('pointerdown', closeOnOutsidePress);
        document.addEventListener('keydown', closeOnEscape);
        window.addEventListener('resize', closeOnViewportChange);
        window.addEventListener('scroll', closeOnViewportChange, true);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsidePress);
            document.removeEventListener('keydown', closeOnEscape);
            window.removeEventListener('resize', closeOnViewportChange);
            window.removeEventListener('scroll', closeOnViewportChange, true);
        };
    }, [open]);

    const openList = () => {
        const bounds = buttonRef.current?.getBoundingClientRect();

        if (!bounds) return;

        const menuHeight = choices.length * 37 + 12;
        const dropUp = window.innerHeight - bounds.bottom < menuHeight + 12 && bounds.top > menuHeight;

        setHighlighted(Math.max(0, choices.indexOf(current)));
        setMenuPosition({
            left: bounds.left,
            top: dropUp ? bounds.top - 8 : bounds.bottom + 8,
            dropUp,
            width: bounds.width,
        });
        setOpen(true);
    };

    const choose = (choice) => {
        setOpen(false);
        if (choice.value !== value) onChange(choice.value);
    };

    const onKeyDown = (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        if (!open) {
            openList();

            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setHighlighted((index) => (index + step + choices.length) % choices.length);
        } else if (highlighted >= 0) {
            choose(choices[highlighted]);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`${label}: ${current.label}`}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onKeyDown}
                className={`flex min-w-[140px] shrink-0 items-center justify-between gap-3 rounded-lg border border-[var(--field-line)] bg-[var(--bg)] px-3 py-2.5 text-left text-[14px] transition-colors hover:border-[rgba(var(--brand-1-rgb),0.65)] ${value ? 'text-[var(--ink)]' : 'text-[var(--placeholder)]'}`}
            >
                <span className="min-w-0 truncate capitalize">{current.label}</span>
                <svg
                    viewBox="0 0 12 7"
                    className={`h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    aria-hidden
                >
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && menuPosition && typeof document !== 'undefined' && createPortal(
                <ul
                    ref={menuRef}
                    role="listbox"
                    aria-label={label}
                    className="fixed z-[300] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]"
                    style={{
                        left: menuPosition.left,
                        top: menuPosition.top,
                        width: menuPosition.width,
                        transform: menuPosition.dropUp ? 'translateY(-100%)' : undefined,
                    }}
                >
                    {choices.map((choice, index) => {
                        const active = highlighted === index;
                        const selected = current.value === choice.value;

                        return (
                            <li
                                key={choice.value || 'all'}
                                role="option"
                                aria-selected={selected}
                                onPointerEnter={() => setHighlighted(index)}
                                onClick={() => choose(choice)}
                                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px] capitalize transition-colors duration-150 ${active ? 'text-white' : 'text-[var(--ink)]'} ${selected ? 'font-bold' : 'font-medium'}`}
                                style={active ? { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' } : undefined}
                            >
                                <span>{choice.label}</span>
                                {selected && (
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#fff' : 'var(--ink-faint)' }} aria-hidden />
                                )}
                            </li>
                        );
                    })}
                </ul>,
                document.body,
            )}
        </>
    );
}

function EyeIcon() {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" />
            <circle cx="12" cy="12" r="2.75" />
        </svg>
    );
}

function ReplyIcon() {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8 5 12.5 9.5 17" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5h9.5A4.5 4.5 0 0 1 19 17v1" />
        </svg>
    );
}

/** A reply to the lead in the admin's own email app, quoting the inquiry type. */
function replyHref(inquiry) {
    return `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your project inquiry: ${inquiry.type}`)}`;
}

function TrashIcon() {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" />
            <path strokeLinecap="round" d="M10 11.5v5M14 11.5v5" />
        </svg>
    );
}

/** A compact date picker with its label beside the field, for the filter row. */
function DateField({ label, value, min, max, onChange }) {
    return (
        <label className="flex shrink-0 items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">{label}</span>
            <span className="flex h-[42px] items-center rounded-lg border border-[var(--field-line)] bg-[var(--bg)] px-3 transition-colors focus-within:border-[var(--brand-3)] focus-within:ring-1 focus-within:ring-[var(--brand-3)]">
                <input
                    type="date"
                    value={value}
                    min={min}
                    max={max}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label={`Received ${label.toLowerCase()} date`}
                    className="w-[128px] bg-transparent text-[13px] text-[var(--ink)] focus:outline-none"
                />
            </span>
        </label>
    );
}

function Detail({ label, children }) {
    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{label}</p>
            <p className="mt-1 break-words text-[14px] text-[var(--ink)]">{children || '-'}</p>
        </div>
    );
}

function InquiryModal({ inquiry, onClose }) {
    useEffect(() => {
        if (!inquiry) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [inquiry, onClose]);

    if (!inquiry) return null;

    const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your project inquiry: ${inquiry.type}`)}`;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-modal-title"
        >
            <button
                type="button"
                aria-label="Close lead details"
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
                <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 id="inquiry-modal-title" className="font-display text-xl font-extrabold text-[var(--ink-strong)]">{inquiry.name}</h2>
                            <Badge tone={inquiry.status} />
                        </div>
                        <p className="mt-1 text-[12px] text-[var(--mute)]">Received {inquiry.createdAt}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--field-line)] text-xl text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                    >
                        &times;
                    </button>
                </header>

                <div className="overflow-y-auto p-5 sm:p-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Panel title="Message">
                                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--ink)]">{inquiry.message}</p>
                            </Panel>
                            <Panel title="Contact details">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Detail label="Email">{inquiry.email}</Detail>
                                    <Detail label="Phone">{inquiry.phone}</Detail>
                                    <Detail label="Company">{inquiry.company}</Detail>
                                    <Detail label="Project type">{inquiry.type}</Detail>
                                    <Detail label="Budget">{inquiry.budget}</Detail>
                                </div>
                            </Panel>
                        </div>
                        <div className="space-y-6">
                            <Panel title="Request metadata">
                                <div className="grid gap-5">
                                    <Detail label="Source page">{inquiry.sourcePage}</Detail>
                                    <Detail label="First replied">{inquiry.respondedAt}</Detail>
                                    <Detail label="IP address">{inquiry.ipAddress}</Detail>
                                    <Detail label="User agent">{inquiry.userAgent}</Detail>
                                </div>
                            </Panel>
                            <Panel title="Internal notes">
                                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--ink)]">{inquiry.adminNotes || '-'}</p>
                            </Panel>
                        </div>
                    </div>
                </div>

                <footer className="flex justify-end gap-3 border-t border-[var(--line)] px-5 py-4 sm:px-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                    <Button as="a" href={mailto}>Reply by email</Button>
                </footer>
            </div>
        </div>
    );
}

export default function InquiriesIndex({ inquiries, filters, statuses, types, counts = {} }) {
    const [form, setForm] = useState(filters);
    const { errors } = usePage().props;
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [request, confirm, cancel, run] = useConfirm();

    const askDelete = (inquiry) => confirm({
        title: `Delete lead from “${inquiry.name}”?`,
        body: 'The submission is permanently removed from the inbox.',
        action: () => router.delete(`/admin/inquiries/${inquiry.id}`, { preserveScroll: true }),
    });

    const apply = (next) => {
        setForm(next);
        router.get('/admin/inquiries', next, { preserveState: true, replace: true, preserveScroll: true });
    };

    const onSearch = (e) => {
        e.preventDefault();
        apply(form);
    };

    return (
        <>
            <Head title="Inquiries | Marketorr Admin" />
            <PageHeader title="Leads" subtitle={`${inquiries.total} submission${inquiries.total === 1 ? '' : 's'} from the contact form.`}>
                <Form action="/admin/inquiries/import" method="post" resetOnSuccess>
                    {({ errors, processing }) => (
                        <div className="flex flex-col items-end gap-1">
                            <Button
                                as="label"
                                variant="secondary"
                                className={processing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            >
                                {processing ? 'Importing...' : 'Import CSV'}
                                <input
                                    type="file"
                                    name="csv"
                                    accept=".csv,text/csv"
                                    className="sr-only"
                                    disabled={processing}
                                    onChange={(event) => event.currentTarget.form?.requestSubmit()}
                                />
                            </Button>
                            {errors.csv && <span className="max-w-xs text-right text-[11px] text-[#ff6b6b]">{errors.csv}</span>}
                        </div>
                    )}
                </Form>
                {/* Plain anchor, not a Link: the export is a file download, not
                    an Inertia visit. */}
                <Button as="a" href={`/admin/inquiries/export?${new URLSearchParams(filters).toString()}`} variant="secondary">
                    Export CSV
                </Button>
            </PageHeader>

            {/* Inbox totals by status; each chip filters the list to it. */}
            <div className="mb-3 flex flex-wrap gap-2" aria-label="Inquiry counts">
                {[{ value: '', label: 'Total', color: 'var(--ink)', count: counts.total ?? 0 }, ...statuses.map((status) => ({
                    value: status,
                    label: STATUS_THEME[status]?.label ?? status.replace('_', ' '),
                    color: STATUS_THEME[status]?.color ?? 'var(--ink)',
                    count: counts[status] ?? 0,
                }))].map((chip) => {
                    const active = (form.status ?? '') === chip.value;

                    return (
                        <button
                            key={chip.value || 'total'}
                            type="button"
                            onClick={() => apply({ ...form, status: chip.value })}
                            aria-pressed={active}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                                active ? 'border-[var(--brand-2)]/60 bg-[var(--chip)]' : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--chip)]'
                            }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: chip.color }} aria-hidden />
                            <span className="text-[var(--ink-faint)]">{chip.label}</span>
                            <span className="font-display text-[13px] font-black" style={{ color: chip.color }}>{chip.count}</span>
                        </button>
                    );
                })}
            </div>

            <Panel className="mb-6">
                {/* One row: search, status, type, the received-date range (both days
                    included, applied as soon as a date is picked) and Search. */}
                <form onSubmit={onSearch} className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                    <Input
                        value={form.search}
                        onChange={(e) => setForm({ ...form, search: e.target.value })}
                        placeholder="Search name, email or company…"
                        aria-label="Search inquiries"
                        className="min-w-[160px] flex-1 lg:w-auto"
                    />
                    <FilterSelect
                        label="Filter by status"
                        value={form.status ?? ''}
                        onChange={(status) => apply({ ...form, status })}
                        placeholder="All statuses"
                        options={statuses.map((s) => ({ value: s, label: STATUS_THEME[s]?.label ?? s.replace('_', ' ') }))}
                    />
                    <FilterSelect
                        label="Filter by type"
                        value={form.type ?? ''}
                        onChange={(type) => apply({ ...form, type })}
                        placeholder="All types"
                        options={types.map((t) => ({ value: t, label: t }))}
                    />
                    <DateField
                        label="From"
                        value={form.from ?? ''}
                        max={form.to || undefined}
                        onChange={(from) => apply({ ...form, from })}
                    />
                    <DateField
                        label="To"
                        value={form.to ?? ''}
                        min={form.from || undefined}
                        onChange={(to) => apply({ ...form, to })}
                    />
                    {(form.from || form.to) && (
                        <button
                            type="button"
                            onClick={() => apply({ ...form, from: '', to: '' })}
                            title="Clear dates"
                            aria-label="Clear dates"
                            className="flex h-[42px] w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--field-line)] text-[16px] text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                        >
                            &times;
                        </button>
                    )}
                    <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
                </form>
                {(errors?.from || errors?.to) && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.from || errors.to}</p>}
            </Panel>

            <Panel className="overflow-hidden">
                {inquiries.data.length === 0 ? (
                    <EmptyState>No inquiries match these filters.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Name</th>
                                    <th className="pb-3 pr-4 font-bold">Type</th>
                                    <th className="pb-3 pr-4 font-bold">Budget</th>
                                    <th className="pb-3 pr-4 font-bold">Source</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 pr-4 font-bold">Submitted</th>
                                    <th className="pb-3 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.data.map((inquiry) => (
                                    <tr key={inquiry.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-4">
                                            <p className="font-semibold text-[var(--ink)]">{inquiry.name}</p>
                                            <p className="text-[12px] text-[var(--ink-faint)]">{inquiry.email}</p>
                                            {inquiry.phone && <p className="text-[12px] text-[var(--ink-faint)]">{inquiry.phone}</p>}
                                            {inquiry.company && <p className="text-[12px] text-[var(--ink-faint)]">{inquiry.company}</p>}
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{inquiry.type}</td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{inquiry.budget ?? '-'}</td>
                                        <td className="py-3 pr-4 font-mono text-[12px] text-[var(--ink-faint)]">{inquiry.sourcePage ?? '-'}</td>
                                        <td className="py-3 pr-4">
                                            <StatusSelect inquiry={inquiry} statuses={statuses} />
                                        </td>
                                        <td className="py-3 pr-4 whitespace-nowrap text-[var(--mute)]">{inquiry.createdAt}</td>
                                        <td className="py-3 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedInquiry(inquiry)}
                                                aria-label={`View ${inquiry.name}`}
                                                title={`View ${inquiry.name}`}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--ink-faint)] transition-colors hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                                            >
                                                <EyeIcon />
                                            </button>
                                            {/* Plain anchor: opens the email app, not an Inertia visit. */}
                                            <a
                                                href={replyHref(inquiry)}
                                                aria-label={`Reply to ${inquiry.name} by email`}
                                                title={`Reply to ${inquiry.email}`}
                                                className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--ink-faint)] transition-colors hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--brand-3)]"
                                            >
                                                <ReplyIcon />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => askDelete(inquiry)}
                                                aria-label={`Delete ${inquiry.name}`}
                                                title={`Delete ${inquiry.name}`}
                                                className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#ff6b6b] transition-colors hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

            {inquiries.links?.length > 3 && (
                <nav className="mt-6 flex flex-wrap justify-end gap-2" aria-label="Pagination">
                    {inquiries.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            disabled={!link.url}
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

            <InquiryModal inquiry={selectedInquiry} onClose={() => setSelectedInquiry(null)} />
            <ConfirmDialog open={!!request} title={request?.title ?? ''} body={request?.body} confirmLabel="Delete" onConfirm={run} onCancel={cancel} />
        </>
    );
}

InquiriesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
