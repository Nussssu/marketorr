import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import EmailPreviewModal from '../../../components/admin/EmailPreviewModal';
import MailNav from '../../../components/admin/MailNav';
import { Button, Field, Input, PageHeader, Panel, Textarea, Toggle } from '../../../components/admin/ui';

function TemplateEditor({ template, onPreview }) {
    const { data, setData, put, processing, errors } = useForm({
        subject: template.subject,
        body_html: template.bodyHtml,
        enabled: template.enabled,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/email-templates/${template.id}`, { preserveScroll: true });
    };

    const triggerPreview = () => {
        onPreview({
            ...template,
            subject: data.subject,
            bodyHtml: data.body_html,
        });
    };

    return (
        <Panel title={template.label} description={template.description}>
            <form onSubmit={submit} className="grid gap-5">
                <Field label="Subject" error={errors.subject} required>
                    <Input value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                </Field>

                <Field
                    label="Body"
                    error={errors.body_html}
                    required
                    hint="HTML is allowed. Placeholder values are escaped before they are inserted."
                >
                    <Textarea
                        rows={14}
                        className="font-mono text-[12px]"
                        value={data.body_html}
                        onChange={(e) => setData('body_html', e.target.value)}
                    />
                </Field>

                <div className="rounded-lg border border-[var(--field-line)] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                        Available placeholders
                    </p>
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                        {template.placeholders.map((placeholder) => (
                            <li key={placeholder.token} className="text-[12px] text-[var(--mute)]">
                                <code className="text-[var(--ink)]">{placeholder.token}</code> — {placeholder.hint}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                    <Toggle
                        checked={data.enabled}
                        onChange={(value) => setData('enabled', value)}
                        label="Send this email"
                        hint="Switching it off stops this message without affecting the other."
                    />
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="secondary" onClick={triggerPreview}>
                            Preview Template
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save template'}
                        </Button>
                    </div>
                </div>
            </form>
        </Panel>
    );
}

export default function EmailTemplatesIndex({ templates }) {
    const [activePreview, setActivePreview] = useState(null);

    return (
        <>
            <Head title="Email templates — Marketorr Admin" />
            <PageHeader
                title="Email & SMTP"
                subtitle="Transactional email templates triggered by new inquiries."
            />

            <MailNav activeTab="templates" />

            <div className="space-y-6">
                {templates.map((template) => (
                    <TemplateEditor
                        key={template.id}
                        template={template}
                        onPreview={(item) => setActivePreview(item)}
                    />
                ))}
            </div>

            <EmailPreviewModal
                open={!!activePreview}
                template={activePreview}
                onClose={() => setActivePreview(null)}
            />
        </>
    );
}

EmailTemplatesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
