import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
    Button,
    ConfirmDialog,
    EmptyState,
    Field,
    Input,
    PageHeader,
    Panel,
    Select,
    TAB_BAR_CLASS,
    TAB_GRADIENT,
    Textarea,
    tabClass,
    useConfirm,
} from '../../../components/admin/ui';

const GRADIENT = 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))';

const STATUS_TONES = {
    active: 'border-[var(--brand-3)]/40 bg-[var(--brand-3)]/10 text-[var(--brand-3)]',
    invited: 'border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 text-[#6F91FF]',
    suspended: 'border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]',
};

function StatusPill({ status, children }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${STATUS_TONES[status] ?? STATUS_TONES.invited}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
            {children}
        </span>
    );
}

function Avatar({ name }) {
    const initials = (name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold text-white" style={{ background: GRADIENT }} aria-hidden>
            {initials}
        </span>
    );
}

/**
 * A centred popup for a focused task (invite, edit, sessions, activity,
 * role editor), with the list dimmed behind it.
 */
function Popup({ open, title, description, onClose, children, footer, wide = false }) {
    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <button type="button" aria-label="Close popup" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
            >
                <div className="h-1 shrink-0" style={{ background: GRADIENT }} aria-hidden />
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
                    <div className="min-w-0">
                        <h2 className="font-display text-[17px] font-extrabold text-[var(--ink-strong)]">{title}</h2>
                        {description && <p className="mt-1 text-[12px] text-[var(--mute)]">{description}</p>}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]">
                        ✕
                    </button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {footer && <footer className="shrink-0 border-t border-[var(--line)] px-6 py-4">{footer}</footer>}
            </aside>
        </div>,
        document.body,
    );
}

/** Stroke icons for the row's action menu. */
const MENU_ICONS = {
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    sessions: <><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M8.5 20h7M12 16.5V20" /></>,
    activity: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    invite: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
    password: <><circle cx="8" cy="14" r="3.5" /><path d="m10.5 11.5 8-8M16 6l2.5 2.5M14 8l2 2" /></>,
    twoFactor: <><path d="M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5Z" /><path d="m9 12 2 2 4-4" /></>,
    suspend: <><circle cx="12" cy="12" r="8.5" /><path d="M10 9v6M14 9v6" /></>,
    reactivate: <><circle cx="12" cy="12" r="8.5" /><path d="m10 8.5 5 3.5-5 3.5v-7Z" /></>,
    delete: <><path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" /><path d="M10 11.5v5M14 11.5v5" /></>,
};

function MenuIcon({ name }) {
    return (
        <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {MENU_ICONS[name]}
        </svg>
    );
}

/**
 * A row's actions as icon buttons, each with a tooltip naming it.
 */
function RowActions({ user, items }) {
    const actions = items.filter((item) => item && item !== 'divider');

    return (
        <div className="flex items-center justify-end gap-1">
            {actions.map((item) => (
                <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    disabled={item.disabled}
                    title={item.disabled ? `${item.label}: ${item.reason}` : item.label}
                    aria-label={`${item.label}: ${user.name}`}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                        item.danger
                            ? 'text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10'
                            : 'text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]'
                    }`}
                >
                    <MenuIcon name={item.icon} />
                </button>
            ))}
        </div>
    );
}

function StatTile({ label, value, accent }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent ?? GRADIENT }} aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]">{label}</p>
            <p className="mt-1 font-display text-2xl font-black text-[var(--ink-strong)]">{value}</p>
        </div>
    );
}

/** JSON from one of the panel's read-only endpoints (sessions, activity). */
function useJson(url, key) {
    const [state, setState] = useState({ loading: false, data: [], error: null });

    const load = useCallback(() => {
        if (!url) return undefined;

        const controller = new AbortController();
        setState((current) => ({ ...current, loading: true, error: null }));

        fetch(url, { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error(`Request failed (${response.status})`);
                return response.json();
            })
            .then((json) => setState({ loading: false, data: json[key] ?? [], error: null }))
            .catch((error) => {
                if (error.name !== 'AbortError') setState({ loading: false, data: [], error: 'Could not load this right now.' });
            });

        return () => controller.abort();
    }, [url, key]);

    useEffect(() => load(), [load]);

    return [state, load];
}

/** Role <option>s, returned as elements so ThemedSelect can read them. */
function roleOptions(roles) {
    return roles.map((role) => (
        <option key={role.value} value={role.value}>
            {role.label}
        </option>
    ));
}

function InvitePanel({ open, onClose, roles }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: roles.find((role) => role.value === 'editor')?.value ?? roles[0]?.value ?? '',
    });

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        post('/admin/users', { preserveScroll: true, onSuccess: close });
    };

    const selected = roles.find((role) => role.value === data.role);

    return (
        <Popup
            open={open}
            onClose={close}
            title="Invite an admin"
            description="They get a secure, single-use link by email to set their own password. The link expires in 7 days."
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
                    <Button type="submit" form="invite-admin" disabled={processing}>{processing ? 'Sending…' : 'Send invitation'}</Button>
                </div>
            }
        >
            <form id="invite-admin" onSubmit={submit} className="space-y-5">
                <Field label="Full name" error={errors.name} required>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus />
                </Field>
                <Field label="Work email" error={errors.email} required>
                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                </Field>
                <Field label="Role" error={errors.role} required>
                    <Select value={data.role} onChange={(e) => setData('role', e.target.value)}>
                        {roleOptions(roles)}
                    </Select>
                </Field>
                {selected && (
                    <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 text-[12px] text-[var(--mute)]">
                        <p className="font-semibold text-[var(--ink)]">{selected.name}</p>
                        <p className="mt-1">{selected.description || 'No description.'}</p>
                        <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
                            {selected.isSuperAdmin ? 'Full access, including users, roles and custom code.' : `${selected.permissions.length} permission${selected.permissions.length === 1 ? '' : 's'} granted.`}
                        </p>
                    </div>
                )}
            </form>
        </Popup>
    );
}

function EditPanel({ user, onClose, roles }) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? '',
    });

    useEffect(() => {
        if (user) {
            setData({ name: user.name, email: user.email, role: user.role });
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const submit = (event) => {
        event.preventDefault();
        put(`/admin/users/${user.id}`, { preserveScroll: true, onSuccess: onClose });
    };

    const roleLocked = user?.isSelf || user?.isPrimary;

    return (
        <Popup
            open={!!user}
            onClose={onClose}
            title={`Edit ${user?.name ?? 'admin'}`}
            description="Change their name, email or role. Role changes apply on their next page load."
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="edit-admin" disabled={processing}>{processing ? 'Saving…' : 'Save changes'}</Button>
                </div>
            }
        >
            {user && (
                <form id="edit-admin" onSubmit={submit} className="space-y-5">
                    <Field label="Full name" error={errors.name} required>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </Field>
                    <Field label="Email" error={errors.email} required>
                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </Field>
                    <Field
                        label="Role"
                        error={errors.role || errors.user}
                        hint={user.isPrimary ? 'The primary Super Admin always stays a Super Admin.' : user.isSelf ? 'You cannot change your own role.' : undefined}
                        required
                    >
                        <Select value={data.role} onChange={(e) => setData('role', e.target.value)} disabled={roleLocked}>
                            {roleOptions(roles)}
                        </Select>
                    </Field>
                    <dl className="grid grid-cols-2 gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 text-[12px]">
                        <div>
                            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Status</dt>
                            <dd className="mt-1"><StatusPill status={user.status}>{user.statusLabel}</StatusPill></dd>
                        </div>
                        <div>
                            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Two-factor</dt>
                            <dd className="mt-1 text-[var(--ink)]">{user.twoFactor ? 'On' : 'Off'}</dd>
                        </div>
                        <div>
                            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Last sign-in</dt>
                            <dd className="mt-1 text-[var(--ink)]">{user.lastLoginAt ?? 'Never'}</dd>
                        </div>
                        <div>
                            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Added</dt>
                            <dd className="mt-1 text-[var(--ink)]">
                                {user.createdAt}
                                {user.invitedBy && <span className="text-[var(--ink-faint)]"> by {user.invitedBy}</span>}
                            </dd>
                        </div>
                    </dl>
                </form>
            )}
        </Popup>
    );
}

function SessionsPanel({ user, onClose, confirm }) {
    const [{ loading, data: sessions, error }, reload] = useJson(user ? `/admin/users/${user.id}/sessions` : null, 'sessions');

    const revoke = (session) =>
        router.delete(`/admin/users/${user.id}/sessions/${session.id}`, { preserveScroll: true, onSuccess: () => reload() });

    const revokeAll = () =>
        confirm({
            title: `Sign ${user.name} out everywhere?`,
            body: user.isSelf ? 'Every other browser is signed out. This one stays signed in.' : 'Every browser they are signed in on is signed out immediately.',
            confirmLabel: 'Sign out all',
            action: () => router.delete(`/admin/users/${user.id}/sessions`, { preserveScroll: true, onSuccess: () => reload() }),
        });

    const locked = user?.protected;

    return (
        <Popup
            open={!!user}
            onClose={onClose}
            title="Active sessions"
            description={user ? `Browsers ${user.isSelf ? 'you are' : `${user.name} is`} signed in on.` : undefined}
            footer={
                <div className="flex justify-between gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                    <Button type="button" variant="danger" onClick={revokeAll} disabled={locked || sessions.length === 0}>
                        Sign out all
                    </Button>
                </div>
            }
        >
            {locked && <p className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-[12px] text-[var(--mute)]">Only the primary Super Admin can end their own sessions.</p>}
            {loading && <p className="py-8 text-center text-[13px] text-[var(--mute)]">Loading sessions…</p>}
            {error && <p className="py-8 text-center text-[13px] text-[#ff6b6b]">{error}</p>}
            {!loading && !error && sessions.length === 0 && <EmptyState>No active sessions.</EmptyState>}
            <ul className="space-y-3">
                {sessions.map((session) => (
                    <li key={session.id} className="flex items-start justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4">
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[var(--ink)]">
                                {session.device}
                                {session.current && <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-3)]">This browser</span>}
                            </p>
                            <p className="mt-1 text-[12px] text-[var(--mute)]">
                                {session.ip ?? 'Unknown IP'} · active {session.lastActive ?? 'never'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]">Started {session.startedAt}</p>
                        </div>
                        {!session.current && (
                            <Button type="button" variant="dangerGhost" className="!px-2 !py-1" onClick={() => revoke(session)} disabled={locked}>
                                Sign out
                            </Button>
                        )}
                    </li>
                ))}
            </ul>
        </Popup>
    );
}

function ActivityPanel({ user, onClose }) {
    const [{ loading, data: activity, error }] = useJson(user ? `/admin/users/${user.id}/activity` : null, 'activity');

    return (
        <Popup open={!!user} onClose={onClose} title="Activity" description={user ? `The latest 50 account events for and by ${user.name}.` : undefined} wide>
            {loading && <p className="py-8 text-center text-[13px] text-[var(--mute)]">Loading activity…</p>}
            {error && <p className="py-8 text-center text-[13px] text-[#ff6b6b]">{error}</p>}
            {!loading && !error && activity.length === 0 && <EmptyState>No activity recorded yet.</EmptyState>}
            <ol className="relative space-y-4 border-l border-[var(--line)] pl-5">
                {activity.map((entry) => (
                    <li key={entry.id} className="relative">
                        <span
                            className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[var(--surface)] ${entry.warning ? 'bg-[#ff6b6b]' : 'bg-[var(--brand-3)]'}`}
                            aria-hidden
                        />
                        <p className="text-[13px] font-semibold text-[var(--ink)]">
                            {entry.label}
                            {entry.subject && entry.subject !== user?.name && <span className="font-normal text-[var(--mute)]"> · {entry.subject}</span>}
                        </p>
                        {entry.details && <p className="mt-0.5 break-words text-[12px] text-[var(--mute)]">{entry.details}</p>}
                        <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]" title={entry.at}>
                            {entry.ago}
                            {entry.actor && ` · by ${entry.actor}`}
                            {entry.ip && ` · ${entry.ip}`}
                        </p>
                    </li>
                ))}
            </ol>
        </Popup>
    );
}

function RolePanel({ role, sections, onClose }) {
    const isNew = role === 'new';
    const current = isNew ? null : role;
    const readOnly = !!current?.isSuperAdmin;

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        name: current?.name ?? '',
        description: current?.description ?? '',
        permissions: current?.permissions ?? [],
    });

    useEffect(() => {
        if (role) {
            setData({ name: current?.name ?? '', description: current?.description ?? '', permissions: current?.permissions ?? [] });
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    const has = (key) => data.permissions.includes(key);

    const toggle = (section, action) => {
        const key = `${section.key}.${action}`;
        let next = data.permissions.filter((permission) => permission !== key);

        if (!has(key)) {
            next = [...next, key];
            // Manage implies view.
            if (action === 'manage' && !next.includes(`${section.key}.view`)) next.push(`${section.key}.view`);
        } else if (action === 'view') {
            next = next.filter((permission) => permission !== `${section.key}.manage`);
        }

        setData('permissions', next);
    };

    const setAll = (on) => setData('permissions', on ? sections.flatMap((section) => section.actions.map((action) => `${section.key}.${action}`)) : []);

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };
        isNew ? post('/admin/roles', options) : put(`/admin/roles/${current.id}`, options);
    };

    return (
        <Popup
            open={!!role}
            onClose={onClose}
            wide
            title={isNew ? 'New role' : readOnly ? current.name : `Edit ${current?.name ?? 'role'}`}
            description={readOnly ? 'Super Admins always hold every permission, plus users, roles and custom code.' : 'Choose what this role can see and change. Manage includes view. The server enforces every permission.'}
            footer={
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
                    {!readOnly && (
                        <Button type="submit" form="role-editor" disabled={processing}>
                            {processing ? 'Saving…' : isNew ? 'Create role' : 'Save role'}
                        </Button>
                    )}
                </div>
            }
        >
            <form id="role-editor" onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Role name" error={errors.name} hint={current?.isSystem && !readOnly ? 'System role names cannot change.' : undefined} required>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} disabled={readOnly || current?.isSystem} />
                    </Field>
                    <Field label="Description" error={errors.description}>
                        <Textarea rows={1} value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} disabled={readOnly} />
                    </Field>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Permissions</p>
                        {!readOnly && (
                            <div className="flex gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
                                <button type="button" onClick={() => setAll(true)} className="text-[var(--ink-faint)] hover:text-[var(--ink)]">Grant all</button>
                                <button type="button" onClick={() => setAll(false)} className="text-[var(--ink-faint)] hover:text-[var(--ink)]">Clear</button>
                            </div>
                        )}
                    </div>
                    {errors.permissions && <p className="mb-2 text-[12px] text-[#ff6b6b]">{errors.permissions}</p>}
                    <div className="overflow-hidden rounded-lg border border-[var(--line)]">
                        <div className="grid grid-cols-[1fr_64px_72px] gap-2 border-b border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                            <span>Section</span>
                            <span className="text-center">View</span>
                            <span className="text-center">Manage</span>
                        </div>
                        {sections.map((section) => (
                            <div key={section.key} className="grid grid-cols-[1fr_64px_72px] items-center gap-2 border-b border-[var(--line)] px-4 py-3 last:border-b-0">
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-[var(--ink)]">{section.label}</p>
                                    <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]">{section.description}</p>
                                </div>
                                {['view', 'manage'].map((action) => (
                                    <div key={action} className="flex justify-center">
                                        {section.actions.includes(action) ? (
                                            <input
                                                type="checkbox"
                                                checked={readOnly || has(`${section.key}.${action}`)}
                                                onChange={() => toggle(section, action)}
                                                disabled={readOnly}
                                                aria-label={`${section.label}: ${action}`}
                                                className="h-4 w-4 cursor-pointer accent-[var(--brand-2)] disabled:cursor-not-allowed"
                                            />
                                        ) : (
                                            <span className="text-[var(--ink-faint)]" aria-hidden>—</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-[11px] text-[var(--ink-faint)]">User Management and Custom Code are always limited to Super Admins.</p>
                </div>
            </form>
        </Popup>
    );
}

function RolesTab({ roles, sections, onEdit, onDelete }) {
    const total = sections.reduce((sum, section) => sum + section.actions.length, 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
                <article key={role.id} className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="font-display text-[15px] font-extrabold text-[var(--ink-strong)]">{role.name}</h3>
                            <p className="mt-1 text-[12px] text-[var(--mute)]">{role.description || 'No description.'}</p>
                        </div>
                        {role.isSystem && (
                            <span className="shrink-0 rounded-full border border-[var(--field-line)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">System</span>
                        )}
                    </div>
                    <div className="mt-4">
                        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--chip)]">
                            <div className="h-full rounded-full" style={{ width: `${role.isSuperAdmin ? 100 : Math.round((role.permissions.length / Math.max(total, 1)) * 100)}%`, background: TAB_GRADIENT.background }} />
                        </div>
                        <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
                            {role.isSuperAdmin ? 'Full access' : `${role.permissions.length} of ${total} permissions`} · {role.usersCount} {role.usersCount === 1 ? 'admin' : 'admins'}
                        </p>
                    </div>
                    <div className="mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-4">
                        <Button type="button" variant="secondary" className="!px-3 !py-1.5" onClick={() => onEdit(role)}>
                            {role.isSuperAdmin ? 'View' : 'Edit permissions'}
                        </Button>
                        {!role.isSystem && (
                            <Button
                                type="button"
                                variant="dangerGhost"
                                className="!px-3 !py-1.5"
                                onClick={() => onDelete(role)}
                                disabled={role.usersCount > 0}
                                title={role.usersCount > 0 ? 'Move everyone with this role to another role first' : undefined}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </article>
            ))}
        </div>
    );
}

export default function UsersIndex({ users, roles, sections = [], stats = {} }) {
    const { errors } = usePage().props;
    const [request, confirm, cancel, run] = useConfirm();
    const [tab, setTab] = useState('users');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [inviting, setInviting] = useState(false);
    const [editing, setEditing] = useState(null);
    const [sessionsFor, setSessionsFor] = useState(null);
    const [activityFor, setActivityFor] = useState(null);
    const [roleEditing, setRoleEditing] = useState(null);

    const closeInvite = useCallback(() => setInviting(false), []);
    const closeEdit = useCallback(() => setEditing(null), []);
    const closeSessions = useCallback(() => setSessionsFor(null), []);
    const closeActivity = useCallback(() => setActivityFor(null), []);
    const closeRole = useCallback(() => setRoleEditing(null), []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return users.filter(
            (user) =>
                (roleFilter === 'all' || user.role === roleFilter) &&
                (statusFilter === 'all' || user.status === statusFilter) &&
                (term === '' || `${user.name} ${user.email} ${user.roleLabel}`.toLowerCase().includes(term)),
        );
    }, [users, search, roleFilter, statusFilter]);

    const activeSuperAdmins = users.filter((user) => user.isSuperAdmin && user.status === 'active').length;
    const pageError = errors?.user || errors?.role;

    const act = (method, url, title, body, confirmLabel) =>
        confirm({
            title,
            body,
            confirmLabel,
            action: () => (method === 'delete' ? router.delete(url, { preserveScroll: true }) : router[method](url, {}, { preserveScroll: true })),
        });

    const menuFor = (user) => {
        const isLastSuperAdmin = user.isSuperAdmin && user.status === 'active' && activeSuperAdmins === 1;
        const guarded = user.isSelf || user.isPrimary || isLastSuperAdmin;
        const guardReason = user.isSelf
            ? 'You cannot do this to your own account'
            : user.isPrimary
              ? 'The primary Super Admin is protected'
              : 'At least one active Super Admin must remain';

        return [
            { label: 'Edit details & role', icon: 'edit', onClick: () => setEditing(user), disabled: user.protected, reason: 'Only the primary Super Admin can change this account' },
            { label: 'Manage sessions', icon: 'sessions', onClick: () => setSessionsFor(user) },
            { label: 'View activity', icon: 'activity', onClick: () => setActivityFor(user) },
            'divider',
            user.status === 'invited' && {
                label: 'Resend invitation',
                icon: 'invite',
                onClick: () => act('post', `/admin/users/${user.id}/invitation`, `Resend the invitation to ${user.name}?`, `A new link goes to ${user.email}. Any earlier invitation link stops working.`, 'Resend'),
            },
            user.status !== 'invited' && {
                label: 'Send password reset',
                icon: 'password',
                disabled: user.protected,
                reason: 'Only the primary Super Admin can change this account',
                onClick: () => act('post', `/admin/users/${user.id}/password-reset`, `Email ${user.name} a password reset link?`, `A link to choose a new password goes to ${user.email}. It expires in 60 minutes, and resetting signs them out everywhere.`, 'Send link'),
            },
            user.twoFactor && {
                label: 'Reset two-factor',
                icon: 'twoFactor',
                disabled: user.protected,
                reason: 'Only the primary Super Admin can change this account',
                onClick: () => act('delete', `/admin/users/${user.id}/two-factor`, `Reset two-factor for ${user.name}?`, 'Their authenticator app stops working for this account and they sign in with their password alone until they set it up again.', 'Reset'),
            },
            user.status === 'suspended'
                ? {
                      label: 'Reactivate',
                      icon: 'reactivate',
                      onClick: () => act('patch', `/admin/users/${user.id}/reactivate`, `Reactivate ${user.name}?`, 'They can sign in again with their existing password.', 'Reactivate'),
                  }
                : {
                      label: 'Suspend',
                      icon: 'suspend',
                      danger: true,
                      disabled: guarded,
                      reason: guardReason,
                      onClick: () => act('patch', `/admin/users/${user.id}/suspend`, `Suspend ${user.name}?`, 'They are signed out everywhere and cannot sign in until reactivated. Nothing they made is removed.', 'Suspend'),
                  },
            {
                label: 'Delete',
                icon: 'delete',
                danger: true,
                disabled: guarded,
                reason: guardReason,
                onClick: () => act('delete', `/admin/users/${user.id}`, `Delete ${user.name}?`, 'Their admin access is removed immediately. This cannot be undone. Suspend instead to keep the account.', 'Delete'),
            },
        ];
    };

    const deleteRole = (role) =>
        confirm({
            title: `Delete the "${role.name}" role?`,
            body: 'This cannot be undone.',
            action: () => router.delete(`/admin/roles/${role.id}`, { preserveScroll: true }),
        });

    return (
        <>
            <Head title="User Management | Marketorr Admin" />
            <PageHeader title="User management" subtitle="Invite admins, control what each role can do, and keep every account secure.">
                {tab === 'users' ? (
                    <Button type="button" onClick={() => setInviting(true)}>+ Invite admin</Button>
                ) : (
                    <Button type="button" onClick={() => setRoleEditing('new')}>+ New role</Button>
                )}
            </PageHeader>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile label="Total admins" value={stats.total ?? users.length} />
                <StatTile label="Active" value={stats.active ?? 0} accent="var(--brand-3)" />
                <StatTile label="Invited" value={stats.invited ?? 0} accent="var(--brand-2)" />
                <StatTile label="Suspended" value={stats.suspended ?? 0} accent="#ff6b6b" />
                <StatTile label="Two-factor on" value={`${stats.twoFactor ?? 0}/${stats.total ?? users.length}`} accent="var(--brand-1)" />
                <StatTile label="Super Admins" value={stats.superAdmins ?? 0} />
            </div>

            <div className={`${TAB_BAR_CLASS} mb-6 text-[11px] font-bold uppercase tracking-[0.14em]`} role="tablist">
                {[
                    { key: 'users', label: `Users (${users.length})` },
                    { key: 'roles', label: `Roles & permissions (${roles.length})` },
                ].map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.key}
                        onClick={() => setTab(item.key)}
                        className={tabClass(tab === item.key)}
                        style={tab === item.key ? TAB_GRADIENT : undefined}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {pageError && (
                <p role="alert" className="mb-4 rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-[13px] text-[#ff6b6b]">
                    {pageError}
                </p>
            )}

            {tab === 'users' ? (
                <Panel className="overflow-hidden">
                    <div className="mb-4 grid gap-3 md:grid-cols-[1fr_200px_180px]">
                        <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or role…" aria-label="Search admins" />
                        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
                            <option value="all">All roles</option>
                            {roleOptions(roles)}
                        </Select>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="invited">Invited</option>
                            <option value="suspended">Suspended</option>
                        </Select>
                    </div>

                    <div className="-mx-5 overflow-x-auto px-5">
                        <table className="w-full min-w-[940px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-4 font-bold">Admin</th>
                                    <th className="pb-3 pr-4 font-bold">Role</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 pr-4 font-bold">2FA</th>
                                    <th className="pb-3 pr-4 font-bold">Last sign-in</th>
                                    <th className="pb-3 pr-4 font-bold">Sessions</th>
                                    <th className="pb-3 font-bold"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id} className="border-t border-[var(--line)] align-middle">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={user.name} />
                                                <div className="min-w-0">
                                                    <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--ink)]">
                                                        {user.name}
                                                        {user.isSelf && <span className="text-[11px] font-normal text-[var(--ink-faint)]">(you)</span>}
                                                        {user.isPrimary && (
                                                            <span className="rounded-full border border-[var(--brand-1)]/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#A855F7]" title="Protected: cannot be suspended, demoted or deleted">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="truncate text-[12px] text-[var(--ink-faint)]">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--ink)]">{user.roleLabel}</td>
                                        <td className="py-3 pr-4">
                                            <StatusPill status={user.status}>{user.statusLabel}</StatusPill>
                                            {user.status === 'invited' && user.invitedAt && <p className="mt-1 text-[11px] text-[var(--ink-faint)]">Sent {user.invitedAt}</p>}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className={`text-[12px] font-semibold ${user.twoFactor ? 'text-[var(--brand-3)]' : 'text-[var(--ink-faint)]'}`}>{user.twoFactor ? 'On' : 'Off'}</span>
                                        </td>
                                        <td className="py-3 pr-4 whitespace-nowrap">
                                            <p className="text-[var(--ink)]" title={user.lastLoginAt ?? undefined}>{user.lastLogin ?? 'Never'}</p>
                                            {user.lastLoginIp && <p className="text-[11px] text-[var(--ink-faint)]">{user.lastLoginIp}</p>}
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{user.sessions}</td>
                                        <td className="py-3 text-right">
                                            <RowActions user={user} items={menuFor(user)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <EmptyState>No admins match these filters.</EmptyState>}
                    </div>
                </Panel>
            ) : (
                <RolesTab roles={roles} sections={sections} onEdit={setRoleEditing} onDelete={deleteRole} />
            )}

            <InvitePanel open={inviting} onClose={closeInvite} roles={roles} />
            <EditPanel user={editing} onClose={closeEdit} roles={roles} />
            <SessionsPanel user={sessionsFor} onClose={closeSessions} confirm={confirm} />
            <ActivityPanel user={activityFor} onClose={closeActivity} />
            <RolePanel role={roleEditing} sections={sections} onClose={closeRole} />

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

UsersIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
