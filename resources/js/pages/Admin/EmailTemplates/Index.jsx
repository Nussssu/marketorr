import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, Field, Input, PageHeader, Panel, Textarea, Toggle } from '../../../components/admin/ui';

function TemplateEditor({ template }) {
    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        subject: template.subject,
        body_html: template.bodyHtml,
        enabled: template.enabled,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/email-templates/${template.id}`, { preserveScroll: true });
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

                <div>
                    <button
                        type="button"
                        onClick={() => setShowPreview((v) => !v)}
                        aria-expanded={showPreview}
                        className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                    >
                        {showPreview ? 'Hide preview' : 'Show preview'}
                    </button>
                    {showPreview && (
                        <div className="mt-3 rounded-lg border border-[var(--field-line)] bg-[var(--bg)] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                                Subject
                            </p>
                            <p className="mt-1 text-[13px] text-[var(--ink)]">{template.preview.subject}</p>
                            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                                Body
                            </p>
                            {/* Rendered from the last saved template, with sample values. */}
                            <div
                                className="prose-cms mt-2 text-[13px] leading-relaxed text-[var(--mute)]"
                                dangerouslySetInnerHTML={{ __html: template.preview.body }}
                            />
                            <p className="mt-4 text-[11px] text-[var(--ink-faint)]">
                                Preview reflects the last save — save to refresh it.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                    <Toggle
                        checked={data.enabled}
                        onChange={(value) => setData('enabled', value)}
                        label="Send this email"
                        hint="Switching it off stops this message without affecting the other."
                    />
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Save template'}
                    </Button>
                </div>
            </form>
        </Panel>
    );
}

export default function EmailTemplatesIndex({ templates }) {
    return (
        <>
            <Head title="Email templates — Marketorr Admin" />
            <PageHeader
                title="Email templates"
                subtitle="The two emails a new lead triggers."
            />
            <div className="space-y-6">
                {templates.map((template) => (
                    <TemplateEditor key={template.id} template={template} />
                ))}
            </div>
        </>
    );
}

EmailTemplatesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
