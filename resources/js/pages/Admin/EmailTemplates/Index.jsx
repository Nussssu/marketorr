import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import EmailPreviewModal from '../../../components/admin/EmailPreviewModal';
import MailNav from '../../../components/admin/MailNav';
import { Button, Field, Input, PageHeader, Panel, Textarea, Toggle } from '../../../components/admin/ui';

/**
 * One template's fields. Its values live in the page's single form, which
 * the fixed save bar submits for every template at once.
 */
function TemplateEditor({ template, data, onChange, errors, onPreview }) {
    const setData = (key, value) => onChange({ ...data, [key]: value });

    const triggerPreview = () => {
        onPreview({
            ...template,
            subject: data.subject,
            bodyHtml: data.body_html,
        });
    };

    return (
        <Panel title={template.label} description={template.description}>
            <div className="grid gap-5">
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
                                <code className="text-[var(--ink)]">{placeholder.token}</code>: {placeholder.hint}
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
                    </div>
                </div>
            </div>
        </Panel>
    );
}

export default function EmailTemplatesIndex({ templates }) {
    const [activePreview, setActivePreview] = useState(null);
    const { data, setData, put, processing, errors, isDirty } = useForm({
        templates: templates.map((template) => ({
            id: template.id,
            subject: template.subject,
            body_html: template.bodyHtml,
            enabled: template.enabled,
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/email-templates', { preserveScroll: true });
    };

    const updateTemplate = (index, value) => setData('templates', data.templates.map((row, i) => (i === index ? value : row)));
    // Errors arrive keyed by position (templates.0.body_html); each editor reads its own.
    const errorsFor = (index) => Object.fromEntries(
        Object.entries(errors)
            .filter(([key]) => key.startsWith(`templates.${index}.`))
            .map(([key, message]) => [key.slice(`templates.${index}.`.length), message]),
    );

    return (
        <>
            <Head title="Email templates | Marketorr Admin" />
            <PageHeader
                title="Email & SMTP"
                subtitle="Transactional email templates triggered by new inquiries."
            />

            <MailNav activeTab="templates" />

            <form onSubmit={submit} className="space-y-6 pb-24">
                {templates.map((template, index) => (
                    <TemplateEditor
                        key={template.id}
                        template={template}
                        data={data.templates[index]}
                        onChange={(value) => updateTemplate(index, value)}
                        errors={errorsFor(index)}
                        onPreview={(item) => setActivePreview(item)}
                    />
                ))}

                {/* The page's one save button, always on screen at the bottom. */}
                <div className="fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:left-64">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                        <p className={`flex items-center gap-2 text-[13px] font-semibold ${isDirty ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]'}`}>
                            <span className={`h-2 w-2 rounded-full ${isDirty ? 'bg-[#f5a524]' : 'bg-[var(--field-line)]'}`} aria-hidden />
                            {isDirty ? 'You have unsaved changes.' : 'No unsaved changes.'}
                        </p>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save templates'}
                        </Button>
                    </div>
                </div>
            </form>

            <EmailPreviewModal
                open={!!activePreview}
                template={activePreview}
                onClose={() => setActivePreview(null)}
            />
        </>
    );
}

EmailTemplatesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
