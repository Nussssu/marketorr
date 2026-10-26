import { Head, useForm } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import EmailPreviewModal from '../../../components/admin/EmailPreviewModal';
import MailNav from '../../../components/admin/MailNav';
import { Button, Field, Input, PageHeader, Textarea, Toggle, WidgetPanel } from '../../../components/admin/ui';

/** Room left below the text, about one extra line. */
const TEXTAREA_SPARE_PX = 22;

/**
 * A textarea sized to its text plus about one spare line, growing and
 * shrinking as the text changes, instead of a fixed tall box.
 */
function AutoTextarea({ value, className = '', ...props }) {
    const ref = useRef(null);

    const fit = () => {
        const el = ref.current;
        // A textarea in a closed panel has no size yet; it is fitted when shown.
        if (!el || el.offsetParent === null) return;

        el.style.height = 'auto';
        const height = `${el.scrollHeight + TEXTAREA_SPARE_PX}px`;
        if (el.style.height !== height) el.style.height = height;
    };

    useLayoutEffect(fit, [value]);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;

        // Fits once the panel opens, and again when the width changes the wrapping.
        let lastWidth = 0;
        const observer = new ResizeObserver(([entry]) => {
            const width = Math.round(entry.contentRect.width);
            if (width !== lastWidth) {
                lastWidth = width;
                fit();
            }
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return <Textarea ref={ref} rows={1} value={value ?? ''} className={`overflow-hidden ${className}`} {...props} />;
}

/**
 * The widgets a template saves: unchanged when its Body was not edited, or
 * the edited HTML as a single Custom HTML widget.
 */
const blocksFor = (template, row) => (row.body_html === template.bodyHtml ? template.blocks : [{ type: 'html', html: row.body_html }]);

/** The first error about the template's body, wherever it was reported. */
const bodyError = (errors) => errors.blocks ?? Object.entries(errors).find(([key]) => key.startsWith('blocks.'))?.[1];

/**
 * One template's fields. Its values live in the page's single form, which
 * the fixed save bar submits for every template at once.
 */
function TemplateEditor({ template, data, onChange, errors, onPreview, defaultOpen = false }) {
    const setData = (key, value) => onChange({ ...data, [key]: value });

    return (
        <WidgetPanel
            defaultOpen={defaultOpen}
            title={template.label}
            description={template.description}
            summary={`${data.subject}${template.canBeDisabled && !data.enabled ? ' · switched off' : ''}`}
        >
            <div className="grid gap-5">
                <Field label="Subject" error={errors.subject} required>
                    <Input value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                </Field>

                <Field
                    label="Body"
                    error={bodyError(errors)}
                    required
                    hint="HTML is allowed. Placeholder values are escaped before they are inserted."
                >
                    <AutoTextarea
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
                    {template.canBeDisabled ? (
                        <Toggle
                            checked={data.enabled}
                            onChange={(value) => setData('enabled', value)}
                            label="Send this email"
                            hint="Switching it off stops this message without affecting the others."
                        />
                    ) : (
                        <p className="text-[12px] text-[var(--mute)]">This email is always sent: it cannot be switched off.</p>
                    )}
                    <Button type="button" variant="secondary" onClick={() => onPreview({ subject: data.subject, blocks: blocksFor(template, data) })}>
                        Preview Template
                    </Button>
                </div>
            </div>
        </WidgetPanel>
    );
}

export default function EmailTemplatesIndex({ templates }) {
    const [activePreview, setActivePreview] = useState(null);
    const { data, setData, transform, put, processing, errors, isDirty } = useForm({
        templates: templates.map((template) => ({
            id: template.id,
            subject: template.subject,
            body_html: template.bodyHtml,
            enabled: template.enabled,
        })),
    });

    transform((form) => ({
        templates: form.templates.map((row, index) => ({
            id: row.id,
            subject: row.subject,
            enabled: row.enabled,
            blocks: blocksFor(templates[index], row),
        })),
    }));

    const submit = (e) => {
        e.preventDefault();
        put('/admin/email-templates', { preserveScroll: true });
    };

    const updateTemplate = (index, value) => setData('templates', data.templates.map((row, i) => (i === index ? value : row)));
    // Errors arrive keyed by position (templates.0.blocks); each editor reads its own.
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
                subtitle="Every email the site sends, inside the branded layout with the site logo."
            />

            <MailNav activeTab="templates" />

            <form onSubmit={submit} className="space-y-4 pb-24">
                {templates.map((template, index) => (
                    <TemplateEditor
                        key={template.id}
                        template={template}
                        data={data.templates[index]}
                        onChange={(value) => updateTemplate(index, value)}
                        errors={errorsFor(index)}
                        onPreview={(draft) => setActivePreview({ template, draft })}
                        defaultOpen={index === 0}
                    />
                ))}

                {/* The page's one save button, always on screen at the bottom. */}
                <div className="fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-6 lg:left-64 lg:px-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
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
                template={activePreview?.template}
                draft={activePreview?.draft}
                onClose={() => setActivePreview(null)}
            />
        </>
    );
}

EmailTemplatesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
