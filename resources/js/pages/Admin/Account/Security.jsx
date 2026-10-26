import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, ConfirmDialog, EmptyState, Field, Input, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

function PasswordPanel() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/account/password', { preserveScroll: true, onSuccess: () => reset(), onError: () => reset('current_password') });
    };

    return (
        <Panel title="Password" description="Use at least 10 characters, with letters and numbers.">
            <form onSubmit={submit} className="space-y-5">
                <Field label="Current password" error={errors.current_password} required>
                    <Input type="password" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} autoComplete="current-password" />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="New password" error={errors.password} required>
                        <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" />
                    </Field>
                    <Field label="Confirm new password" error={errors.password_confirmation} required>
                        <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                    </Field>
                </div>
                <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Change password'}</Button>
            </form>
        </Panel>
    );
}

/** A form asking for the current password before a sensitive change. */
function PasswordConfirmForm({ action, method = 'post', label, variant = 'secondary', onDone }) {
    const { data, setData, processing, errors, reset, submit } = useForm({ password: '' });

    const send = (e) => {
        e.preventDefault();
        submit(method, action, { preserveScroll: true, onSuccess: () => { reset(); onDone?.(); }, onError: () => reset('password') });
    };

    return (
        <form onSubmit={send} className="flex flex-wrap items-start gap-3">
            <div className="min-w-[220px] flex-1">
                <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Your current password" aria-label="Current password" autoComplete="current-password" />
                {errors.password && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors.password}</span>}
            </div>
            <Button type="submit" variant={variant} disabled={processing || data.password === ''}>{label}</Button>
        </form>
    );
}

function RecoveryCodes({ codes }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard?.writeText(codes.join('\n')).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="rounded-lg border border-[var(--brand-3)]/40 bg-[var(--brand-3)]/5 p-4">
            <p className="text-[13px] font-semibold text-[var(--ink)]">Save your recovery codes</p>
            <p className="mt-1 text-[12px] text-[var(--mute)]">
                Each code signs you in once if you lose your phone. They are shown only now, so store them somewhere safe.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-[13px] text-[var(--ink)]">
                {codes.map((code) => (
                    <li key={code} className="rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-center">{code}</li>
                ))}
            </ul>
            <Button type="button" variant="secondary" className="mt-3" onClick={copy}>{copied ? 'Copied ✓' : 'Copy codes'}</Button>
        </div>
    );
}

function TwoFactorPanel({ twoFactor, recoveryCodes }) {
    const confirmForm = useForm({ code: '' });
    const [showRegenerate, setShowRegenerate] = useState(false);
    const [showDisable, setShowDisable] = useState(false);

    const start = () => router.post('/admin/account/two-factor', {}, { preserveScroll: true });
    const cancel = () => router.delete('/admin/account/two-factor/pending', { preserveScroll: true });
    const confirm = (e) => {
        e.preventDefault();
        confirmForm.post('/admin/account/two-factor/confirm', { preserveScroll: true, onSuccess: () => confirmForm.reset() });
    };

    return (
        <Panel
            title="Two-factor authentication"
            description="A code from an authenticator app (Google Authenticator, Authy, 1Password, Microsoft Authenticator) is asked for after your password."
            action={
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${twoFactor.enabled ? 'border-[var(--brand-3)]/40 text-[var(--brand-3)]' : 'border-[var(--field-line)] text-[var(--ink-faint)]'}`}>
                    {twoFactor.enabled ? 'On' : 'Off'}
                </span>
            }
        >
            <div className="space-y-5">
                {recoveryCodes?.length > 0 && <RecoveryCodes codes={recoveryCodes} />}

                {!twoFactor.enabled && !twoFactor.pending && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[13px] text-[var(--mute)]">Protect your account even if your password leaks.</p>
                        <Button type="button" onClick={start}>Set up two-factor</Button>
                    </div>
                )}

                {!twoFactor.enabled && twoFactor.pending && (
                    <div className="space-y-4">
                        <ol className="list-decimal space-y-2 pl-5 text-[13px] text-[var(--mute)]">
                            <li>
                                In your authenticator app, add an account with this setup key
                                <span className="sm:hidden">, or <a href={twoFactor.pending.uri} className="text-[var(--brand-3)] underline">open it in your app</a></span>:
                            </li>
                        </ol>
                        <p className="select-all break-all rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-center font-mono text-[15px] tracking-[0.15em] text-[var(--ink-strong)]">
                            {twoFactor.pending.secret}
                        </p>
                        <ol start={2} className="list-decimal pl-5 text-[13px] text-[var(--mute)]">
                            <li>Enter the 6-digit code it shows to finish.</li>
                        </ol>
                        <form onSubmit={confirm} className="flex flex-wrap items-start gap-3">
                            <div className="w-40">
                                <Input
                                    value={confirmForm.data.code}
                                    onChange={(e) => confirmForm.setData('code', e.target.value)}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="123456"
                                    maxLength={7}
                                    aria-label="Authentication code"
                                    className="text-center font-mono tracking-[0.3em]"
                                />
                            </div>
                            <Button type="submit" disabled={confirmForm.processing}>Confirm</Button>
                            <Button type="button" variant="ghost" onClick={cancel}>Cancel</Button>
                        </form>
                        {confirmForm.errors.code && <p className="text-[12px] text-[#ff6b6b]">{confirmForm.errors.code}</p>}
                    </div>
                )}

                {twoFactor.enabled && (
                    <div className="space-y-4">
                        <p className="text-[13px] text-[var(--mute)]">
                            {twoFactor.recoveryCodesLeft} recovery {twoFactor.recoveryCodesLeft === 1 ? 'code' : 'codes'} left.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button type="button" variant="secondary" onClick={() => { setShowRegenerate((v) => !v); setShowDisable(false); }}>
                                New recovery codes
                            </Button>
                            <Button type="button" variant="danger" onClick={() => { setShowDisable((v) => !v); setShowRegenerate(false); }}>
                                Turn off
                            </Button>
                        </div>
                        {showRegenerate && (
                            <PasswordConfirmForm action="/admin/account/two-factor/recovery-codes" label="Create new codes" onDone={() => setShowRegenerate(false)} />
                        )}
                        {showDisable && (
                            <PasswordConfirmForm action="/admin/account/two-factor" method="delete" label="Turn off two-factor" variant="danger" onDone={() => setShowDisable(false)} />
                        )}
                    </div>
                )}
            </div>
        </Panel>
    );
}

function SessionsPanel({ sessions }) {
    const { errors } = usePage().props;
    const [request, confirm, cancel, run] = useConfirm();
    const [showSignOutOthers, setShowSignOutOthers] = useState(false);
    const others = sessions.filter((session) => !session.current).length;

    const revoke = (session) =>
        confirm({
            title: `Sign out ${session.device}?`,
            body: 'That browser will need your password again.',
            confirmLabel: 'Sign out',
            action: () => router.delete(`/admin/account/sessions/${session.id}`, { preserveScroll: true }),
        });

    return (
        <Panel
            title="Where you're signed in"
            description="Sign out any browser you do not recognise, then change your password."
            action={others > 0 && <Button type="button" variant="secondary" onClick={() => setShowSignOutOthers((v) => !v)}>Sign out others</Button>}
        >
            {showSignOutOthers && (
                <div className="mb-4">
                    <PasswordConfirmForm action="/admin/account/sessions" method="delete" label={`Sign out ${others} other${others === 1 ? '' : 's'}`} variant="danger" onDone={() => setShowSignOutOthers(false)} />
                </div>
            )}
            {errors?.session && <p className="mb-3 text-[12px] text-[#ff6b6b]">{errors.session}</p>}
            {sessions.length === 0 ? (
                <EmptyState>No tracked sessions yet.</EmptyState>
            ) : (
                <ul className="divide-y divide-[var(--line)]">
                    {sessions.map((session) => (
                        <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-[var(--ink)]">
                                    {session.device}
                                    {session.current && <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-3)]">This browser</span>}
                                </p>
                                <p className="mt-0.5 text-[12px] text-[var(--mute)]">
                                    {session.ip ?? 'Unknown IP'} · active {session.lastActive ?? 'never'}
                                </p>
                            </div>
                            {!session.current && (
                                <Button type="button" variant="dangerGhost" className="!px-2 !py-1" onClick={() => revoke(session)}>Sign out</Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <ConfirmDialog open={!!request} title={request?.title ?? ''} body={request?.body} confirmLabel={request?.confirmLabel} onConfirm={run} onCancel={cancel} />
        </Panel>
    );
}

export default function AccountSecurity({ account, twoFactor, recoveryCodes, sessions }) {
    return (
        <>
            <Head title="My Security | Marketorr Admin" />
            <PageHeader title="My security" subtitle={`${account.name} · ${account.email} · ${account.role}`}>
                {account.lastLoginAt && (
                    <p className="text-[12px] text-[var(--ink-faint)]">
                        Last sign-in {account.lastLoginAt}
                        {account.lastLoginIp && ` from ${account.lastLoginIp}`}
                    </p>
                )}
            </PageHeader>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-6">
                    <TwoFactorPanel twoFactor={twoFactor} recoveryCodes={recoveryCodes} />
                    <PasswordPanel />
                </div>
                <SessionsPanel sessions={sessions} />
            </div>
        </>
    );
}

AccountSecurity.layout = (page) => <AdminLayout>{page}</AdminLayout>;
