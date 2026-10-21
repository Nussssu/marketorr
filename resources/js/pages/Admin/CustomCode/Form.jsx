import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import CodeEditor from '../../../components/admin/CodeEditor';
import { Button, ConfirmDialog, Field, Input, PageHeader, Panel, Select, useConfirm } from '../../../components/admin/ui';
import { Switch } from './Index';

const PLACEHOLDERS = {
    css: '/* Only the rules: the <style> tag is added for you. */\n.hero-title {\n  letter-spacing: -0.02em;\n}',
    js: "// Only the code: the <script> tag is added for you.\nwindow.dataLayer = window.dataLayer || [];",
    html: '<!-- Paste the code exactly as the provider gives it, tags included. -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>',
};

const TYPE_HINTS = {
    css: 'Wrapped in a <style> tag.',
    js: 'Wrapped in a <script> tag.',
    html: 'Added exactly as written: use it for pixels, embeds and full <script> tags.',
};

/**
 * A real syntax check for JavaScript, done by parsing without running:
 * `new Function` compiles the code but never calls it.
 */
function syntaxErrors(type, code) {
    // In HTML, only inline scripts are JavaScript: skip src= loaders and
    // data blocks such as type="application/ld+json".
    const isInlineJs = (attributes) => !/\bsrc\s*=/i.test(attributes)
        && (!/\btype\s*=/i.test(attributes) || /\btype\s*=\s*["']?(text\/javascript|module)["']?/i.test(attributes));

    const sources = type === 'js'
        ? [code]
        : type === 'html'
            ? [...code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
                .filter((match) => isInlineJs(match[1]) && !/\btype\s*=\s*["']?module/i.test(match[1]))
                .map((match) => match[2])
            : [];

    return sources.flatMap((source) => {
        try {
            // eslint-disable-next-line no-new, no-new-func
            new Function(source);

            return [];
        } catch (error) {
            return [`JavaScript syntax error: ${error.message}`];
        }
    });
}

function xsrfToken() {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

function VersionModal({ version, language, onClose, onRestore }) {
    if (!version) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8" onClick={onClose}>
            <div role="dialog" aria-modal="true" aria-label={`Version ${version.version}`} className="w-full max-w-3xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
                    <div>
                        <h2 className="font-display text-[14px] font-bold text-[var(--ink-strong)]">Version {version.version}: {version.note}</h2>
                        <p className="text-[12px] text-[var(--mute)]">{version.createdAt}{version.user ? ` · ${version.user}` : ''}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]" aria-label="Close">✕</button>
                </div>
                <div className="space-y-4 p-5">
                    <p className="text-[12px] text-[var(--mute)]">
                        {version.snapshot.name} · {version.snapshot.type?.toUpperCase()} · {version.snapshot.location} · priority {version.snapshot.priority} · {version.snapshot.status}{version.snapshot.enabled ? '' : ' · off'}
                    </p>
                    <CodeEditor value={version.snapshot.code ?? ''} onChange={() => {}} language={version.snapshot.type ?? language} readOnly rows={16} aria-label={`Code in version ${version.version}`} />
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                        <Button type="button" onClick={() => onRestore(version)}>Restore this version</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CustomCodeForm({ snippet, versions, types, locations, targets }) {
    const isEdit = Boolean(snippet);
    const statusRef = useRef(snippet?.status ?? 'draft');
    const [checks, setChecks] = useState({ errors: [], warnings: [] });
    const [viewing, setViewing] = useState(null);
    const [request, confirm, cancel, run] = useConfirm();
    // Errors from a refused rollback, which is not a submission of this form.
    const pageErrors = usePage().props.errors ?? {};

    const { data, setData, post, put, processing, errors, isDirty, transform } = useForm({
        name: snippet?.name ?? '',
        description: snippet?.description ?? '',
        type: snippet?.type ?? 'html',
        location: snippet?.location ?? 'head',
        code: snippet?.code ?? '',
        priority: snippet?.priority ?? 10,
        target: snippet?.target ?? 'all',
        target_paths: snippet?.targetPaths?.length ? snippet.targetPaths : [''],
        status: snippet?.status ?? 'draft',
        enabled: snippet?.enabled ?? true,
    });

    transform((current) => ({ ...current, status: statusRef.current }));

    // Live checks while typing: the server's rules plus a real JS parse here.
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            const local = syntaxErrors(data.type, data.code);

            fetch('/admin/custom-code/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
                body: JSON.stringify({ type: data.type, code: data.code }),
                signal: controller.signal,
            })
                .then((response) => (response.ok ? response.json() : { errors: [], warnings: [] }))
                .then((result) => setChecks({ errors: [...local, ...result.errors], warnings: result.warnings }))
                .catch((error) => {
                    if (error?.name !== 'AbortError') setChecks({ errors: local, warnings: [] });
                });
        }, 400);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [data.type, data.code]);

    const save = (status) => {
        statusRef.current = status;
        if (isEdit) {
            put(`/admin/custom-code/${snippet.id}`, { preserveScroll: true });
        } else {
            post('/admin/custom-code');
        }
    };

    const restore = (version) => {
        setViewing(null);
        confirm({
            title: `Restore version ${version.version}?`,
            body: `The snippet goes back to how it was ${version.createdAgo}, including its status and on/off state. Your current state stays in the history, so this can be undone.`,
            confirmLabel: 'Restore',
            action: () => router.post(`/admin/custom-code/${snippet.id}/versions/${version.id}/restore`, {}, { preserveScroll: true }),
        });
    };

    const askDelete = () => {
        confirm({
            title: `Delete “${snippet.name}”?`,
            body: 'The snippet and its whole version history are deleted permanently.',
            confirmLabel: 'Delete',
            action: () => router.delete(`/admin/custom-code/${snippet.id}`),
        });
    };

    const hasErrors = checks.errors.length > 0;

    return (
        <>
            <Head title={`${isEdit ? `Edit ${snippet.name}` : 'New snippet'} | Marketorr Admin`} />
            <PageHeader
                title={isEdit ? snippet.name : 'New snippet'}
                subtitle={isEdit ? `${snippet.live ? 'Live on the site' : snippet.status === 'published' ? 'Published but switched off' : 'Draft, not on the site'} · last changed ${snippet.updatedAt}` : 'Drafts never run on the site; publish when the code is ready.'}
            >
                <Button as="link" href="/admin/custom-code" variant="secondary">All snippets</Button>
                {isEdit && <Button type="button" variant="danger" onClick={askDelete}>Delete</Button>}
            </PageHeader>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    save(data.status);
                }}
                className="grid gap-6 pb-24 lg:grid-cols-3"
            >
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Snippet">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Name" error={errors.name} required>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Google Analytics" />
                            </Field>
                            <Field label="Type" error={errors.type} required hint={TYPE_HINTS[data.type]}>
                                <Select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                                    {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </Select>
                            </Field>
                            <Field label="Description" error={errors.description} className="sm:col-span-2">
                                <Input value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="What it does and who asked for it" />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="Code" description="Highlighted as you type, and checked before it can be published. Nothing runs here.">
                        <CodeEditor
                            value={data.code}
                            onChange={(value) => setData('code', value)}
                            language={data.type}
                            invalid={Boolean(errors.code) || hasErrors}
                            placeholder={PLACEHOLDERS[data.type]}
                            aria-label="Snippet code"
                        />
                        <div className="mt-3 space-y-2">
                            {errors.code && <p className="text-[12px] text-[#ff6b6b]">{errors.code}</p>}
                            {checks.errors.map((message) => (
                                <p key={message} className="flex gap-2 rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-3 py-2 text-[12px] text-[#ff6b6b]"><span aria-hidden>✕</span>{message}</p>
                            ))}
                            {checks.warnings.map((message) => (
                                <p key={message} className="flex gap-2 rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-2 text-[12px] text-[#d97706]"><span aria-hidden>!</span>{message}</p>
                            ))}
                            {!hasErrors && checks.warnings.length === 0 && data.code.trim() !== '' && (
                                <p className="flex gap-2 text-[12px] text-[#16a34a]"><span aria-hidden>✓</span>No problems found.</p>
                            )}
                        </div>
                    </Panel>
                </div>

                <div className="space-y-6">
                    <Panel title="Publishing">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[13px] font-semibold text-[var(--ink)]">Switched on</p>
                                    <p className="text-[11px] text-[var(--ink-faint)]">Off keeps it saved but not running.</p>
                                </div>
                                <Switch checked={data.enabled} onChange={(value) => setData('enabled', value)} label="Switch this snippet on" />
                            </div>
                            <Field label="Placement" error={errors.location} required>
                                <Select value={data.location} onChange={(e) => setData('location', e.target.value)}>
                                    {locations.map((location) => <option key={location.value} value={location.value}>{location.label}</option>)}
                                </Select>
                            </Field>
                            <Field label="Priority" error={errors.priority} required hint="Lower runs first within the same placement (0–999).">
                                <Input type="number" min={0} max={999} value={data.priority} onChange={(e) => setData('priority', e.target.value)} />
                            </Field>
                            <div className="grid gap-2">
                                <Button type="button" onClick={() => save('published')} disabled={processing || hasErrors} title={hasErrors ? 'Fix the errors in the code first' : undefined}>
                                    {processing && statusRef.current === 'published' ? 'Publishing…' : isEdit && snippet.status === 'published' ? 'Save & keep published' : 'Publish'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => save('draft')} disabled={processing}>
                                    {isEdit && snippet.status === 'published' ? 'Unpublish (save as draft)' : 'Save as draft'}
                                </Button>
                                {isDirty && <p className="text-center text-[11px] text-[var(--mute)]">Unsaved changes</p>}
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Pages" description="Paths like /about, or end with * to cover a section, e.g. /services/*.">
                        <div className="space-y-4">
                            <Field label="Runs on" error={errors.target} required>
                                <Select value={data.target} onChange={(e) => setData('target', e.target.value)}>
                                    {targets.map((target) => <option key={target.value} value={target.value}>{target.label}</option>)}
                                </Select>
                            </Field>
                            {data.target !== 'all' && (
                                <div className="space-y-2">
                                    {data.target_paths.map((path, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={path}
                                                onChange={(e) => setData('target_paths', data.target_paths.map((entry, i) => (i === index ? e.target.value : entry)))}
                                                placeholder="/services/*"
                                                aria-label={`Page path ${index + 1}`}
                                                className="font-mono text-[13px]"
                                            />
                                            <Button type="button" variant="secondary" onClick={() => setData('target_paths', data.target_paths.filter((_, i) => i !== index))} disabled={data.target_paths.length === 1} aria-label="Remove path">✕</Button>
                                        </div>
                                    ))}
                                    {(errors.target_paths || Object.keys(errors).find((key) => key.startsWith('target_paths.'))) && (
                                        <p className="text-[12px] text-[#ff6b6b]">{errors.target_paths ?? errors[Object.keys(errors).find((key) => key.startsWith('target_paths.'))]}</p>
                                    )}
                                    <button type="button" onClick={() => setData('target_paths', [...data.target_paths, ''])} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
                                        + Add path
                                    </button>
                                </div>
                            )}
                        </div>
                    </Panel>

                    {isEdit && (
                        <Panel title="Version history" description="Every save is kept. Open one to see its code or restore it.">
                            {pageErrors.code && (
                                <p role="alert" className="mb-3 text-[12px] text-[#ff6b6b]">That version cannot go live until its code is fixed: {pageErrors.code}</p>
                            )}
                            <ul className="max-h-96 space-y-1 overflow-y-auto">
                                {versions.map((version, index) => (
                                    <li key={version.id}>
                                        <button
                                            type="button"
                                            onClick={() => setViewing(version)}
                                            className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--chip)]"
                                        >
                                            <span className="mt-0.5 inline-flex h-6 min-w-8 items-center justify-center rounded-md border border-[var(--line)] font-mono text-[11px] font-bold text-[var(--ink)]">v{version.version}</span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13px] text-[var(--ink-strong)]">{version.note}{index === 0 && <span className="ml-2 text-[11px] text-[#16a34a]">current</span>}</span>
                                                <span className="block text-[11px] text-[var(--ink-faint)]">{version.createdAgo}{version.user ? ` · ${version.user}` : ''}</span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                    )}
                </div>
            </form>

            <VersionModal version={viewing} language={data.type} onClose={() => setViewing(null)} onRestore={restore} />
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

CustomCodeForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
