import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, Field, Input, PageHeader, Panel, Select, Toggle } from '../../../components/admin/ui';

/** Sends a probe message through the saved settings. */
function TestPanel({ defaultRecipient }) {
    const { data, setData, post, processing, errors } = useForm({
        recipient: defaultRecipient ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/mail/test', { preserveScroll: true });
    };

    return (
        <Panel title="Send a test" description="Proves the credentials before a real lead depends on them.">
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Send to" error={errors.recipient} required>
                    <Input type="email" value={data.recipient} onChange={(e) => setData('recipient', e.target.value)} />
                </Field>
                <Button type="submit" variant="secondary" disabled={processing}>
                    {processing ? 'Sending…' : 'Send test email'}
                </Button>
            </form>
        </Panel>
    );
}

export default function MailEdit({ mail, encryptions, envMailer }) {
    const { auth } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        enabled: mail.enabled,
        host: mail.host ?? '',
        port: mail.port ?? 587,
        encryption: mail.encryption ?? 'tls',
        username: mail.username ?? '',
        password: '',
        from_address: mail.fromAddress ?? '',
        from_name: mail.fromName ?? '',
        admin_notification_email: mail.adminNotificationEmail ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/mail', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Email & SMTP — Marketorr Admin" />
            <PageHeader
                title="Email & SMTP"
                subtitle={data.enabled
                    ? 'Stored SMTP settings are in use.'
                    : `Disabled — mail is going through the .env mailer (${envMailer}).`}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-6 lg:col-span-2">
                    <Panel title="Server">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Toggle
                                    checked={data.enabled}
                                    onChange={(value) => setData('enabled', value)}
                                    label="Send through these SMTP settings"
                                    hint="When off, the mailer configured in .env is used instead."
                                />
                            </div>
                            <Field label="Host" error={errors.host} required={data.enabled}>
                                <Input value={data.host} onChange={(e) => setData('host', e.target.value)} placeholder="smtp.example.com" />
                            </Field>
                            <Field label="Port" error={errors.port} required={data.enabled}>
                                <Input type="number" min="1" max="65535" value={data.port} onChange={(e) => setData('port', e.target.value)} />
                            </Field>
                            <Field label="Encryption" error={errors.encryption} required>
                                <Select value={data.encryption} onChange={(e) => setData('encryption', e.target.value)}>
                                    {encryptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Username" error={errors.username}>
                                <Input value={data.username} onChange={(e) => setData('username', e.target.value)} autoComplete="off" />
                            </Field>
                            <Field
                                label="Password"
                                error={errors.password}
                                hint={mail.hasPassword
                                    ? 'A password is stored. Leave blank to keep it.'
                                    : 'No password stored yet.'}
                                className="sm:col-span-2"
                            >
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder={mail.hasPassword ? '••••••••' : ''}
                                />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="Addresses">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="From address" error={errors.from_address} hint="Falls back to the .env sender.">
                                <Input type="email" value={data.from_address} onChange={(e) => setData('from_address', e.target.value)} />
                            </Field>
                            <Field label="From name" error={errors.from_name}>
                                <Input value={data.from_name} onChange={(e) => setData('from_name', e.target.value)} />
                            </Field>
                            <Field
                                label="Lead notifications go to"
                                error={errors.admin_notification_email}
                                hint="Falls back to the contact email in Settings."
                                className="sm:col-span-2"
                            >
                                <Input
                                    type="email"
                                    value={data.admin_notification_email}
                                    onChange={(e) => setData('admin_notification_email', e.target.value)}
                                />
                            </Field>
                        </div>
                    </Panel>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Save SMTP settings'}
                    </Button>
                </form>

                <div className="space-y-6">
                    <TestPanel defaultRecipient={auth?.user?.email} />

                    <Panel title="Last test">
                        {mail.lastTestedAt ? (
                            <>
                                <p className="text-[13px] text-[var(--ink)]">{mail.lastTestResult}</p>
                                <p className="mt-2 text-[11px] text-[var(--ink-faint)]">{mail.lastTestedAt}</p>
                            </>
                        ) : (
                            <p className="text-[13px] text-[var(--mute)]">Never tested.</p>
                        )}
                    </Panel>

                    <Panel title="Security">
                        <p className="text-[12px] leading-relaxed text-[var(--mute)]">
                            The password is stored encrypted and is never sent back to this form. Only super admins can
                            reach this page.
                        </p>
                    </Panel>
                </div>
            </div>
        </>
    );
}

MailEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;
