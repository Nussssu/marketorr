import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import CodeEditor from '../../../components/admin/CodeEditor';
import { Button, Field, Input, Select } from '../../../components/admin/ui';

const PLACEHOLDER = '<!-- Paste the code exactly as the provider gives it, tags included. -->\n<script>\n  console.log("Hello from Marketorr");\n</script>';

/**
 * A real syntax check for the inline scripts, done by parsing without
 * running: `new Function` compiles the code but never calls it. Script
 * loaders (src=) and data blocks such as JSON-LD are skipped.
 */
function syntaxErrors(code) {
    const isInlineJs = (attributes) => !/\bsrc\s*=/i.test(attributes)
        && (!/\btype\s*=/i.test(attributes) || /\btype\s*=\s*["']?text\/javascript["']?/i.test(attributes));

    return [...code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
        .filter((match) => isInlineJs(match[1]))
        .flatMap((match) => {
            try {
                // eslint-disable-next-line no-new, no-new-func
                new Function(match[2]);

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

/**
 * The code as it is edited now that every snippet is added as written: an
 * older CSS or JavaScript snippet gets the tag it used to be wrapped in, so
 * saving it changes nothing on the site.
 */
function editableCode(snippet) {
    if (!snippet) return '';
    if (snippet.type === 'css') return `<style>\n${snippet.code}\n</style>`;
    if (snippet.type === 'js') return `<script>\n${snippet.code}\n</script>`;

    return snippet.code ?? '';
}

/**
 * A dropdown of the site's pages with a tick box each, grouped and
 * searchable; the chosen ones show underneath and can be taken off.
 */
function PagePicker({ options, value, onChange, invalid }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapper = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const close = (event) => {
            if (!wrapper.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);

        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    const labels = useMemo(
        () => Object.fromEntries(options.flatMap((group) => group.items.map((item) => [item.path, item.label]))),
        [options],
    );
    const needle = query.trim().toLowerCase();
    const groups = options
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !needle || item.label.toLowerCase().includes(needle) || item.path.includes(needle)),
        }))
        .filter((group) => group.items.length > 0);

    const toggle = (path) => onChange(value.includes(path) ? value.filter((entry) => entry !== path) : [...value, path]);

    return (
        <div ref={wrapper} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-[var(--bg)] px-3 py-2.5 text-left text-[14px] text-[var(--ink)] ${invalid ? 'border-[#ff6b6b]' : 'border-[var(--field-line)]'}`}
            >
                <span className={value.length ? '' : 'text-[var(--ink-faint)]'}>
                    {value.length ? `${value.length} page${value.length === 1 ? '' : 's'} selected` : 'Select pages…'}
                </span>
                <svg aria-hidden="true" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
                    <div className="border-b border-[var(--line)] p-2">
                        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages…" aria-label="Search pages" autoFocus />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1">
                        {groups.length === 0 && <p className="px-3 py-4 text-center text-[12px] text-[var(--mute)]">No page matches.</p>}
                        {groups.map((group) => (
                            <div key={group.group} className="py-1">
                                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">{group.group}</p>
                                {group.items.map((item) => (
                                    <label key={item.path} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 hover:bg-[var(--chip)]">
                                        <input type="checkbox" checked={value.includes(item.path)} onChange={() => toggle(item.path)} className="h-4 w-4 shrink-0 accent-[var(--brand-2)]" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13px] text-[var(--ink)]">{item.label}</span>
                                            <span className="block truncate font-mono text-[11px] text-[var(--ink-faint)]">{item.path}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {value.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {value.map((path) => (
                        <span key={path} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--chip)] py-1 pl-3 pr-1.5 text-[12px] text-[var(--ink)]">
                            <span className="truncate" title={path}>{labels[path] ?? path}</span>
                            <button type="button" onClick={() => toggle(path)} aria-label={`Remove ${labels[path] ?? path}`} className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--ink-faint)] hover:text-[#ff6b6b]">×</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Add or edit a snippet in a popup over the list. The code goes into the
 * page exactly as written, so <script> and <style> tags are pasted as they are.
 */
export default function SnippetModal({ snippet, locations, targets, pageOptions, onClose, Switch }) {
    const isEdit = Boolean(snippet);
    const statusRef = useRef(snippet?.status ?? 'draft');
    const [checks, setChecks] = useState({ errors: [], warnings: [] });

    const { data, setData, post, put, processing, errors, isDirty, transform } = useForm({
        name: snippet?.name ?? '',
        location: snippet?.location ?? 'head',
        code: editableCode(snippet),
        priority: snippet?.priority ?? 10,
        target: snippet?.target ?? 'all',
        target_paths: snippet?.targetPaths ?? [],
        status: snippet?.status ?? 'draft',
        enabled: snippet?.enabled ?? true,
    });

    transform((current) => ({ ...current, status: statusRef.current }));

    // Live checks while typing: the server's rules plus a real JS parse here.
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            const local = syntaxErrors(data.code);

            fetch('/admin/custom-code/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
                body: JSON.stringify({ type: 'html', code: data.code }),
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
    }, [data.code]);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
        };
    }, [onClose]);

    const save = (status) => {
        statusRef.current = status;
        const options = { preserveScroll: true, onSuccess: () => onClose() };

        if (isEdit) {
            put(`/admin/custom-code/${snippet.id}`, options);
        } else {
            post('/admin/custom-code', options);
        }
    };

    const hasErrors = checks.errors.length > 0;
    const pathsError = errors.target_paths ?? errors[Object.keys(errors).find((key) => key.startsWith('target_paths.'))];

    return (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={isEdit ? `Edit ${snippet.name}` : 'New snippet'}>
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    save(data.status);
                }}
                className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
                    <div>
                        <h2 className="font-display text-[15px] font-bold text-[var(--ink-strong)]">{isEdit ? `Edit ${snippet.name}` : 'New snippet'}</h2>
                        <p className="mt-0.5 text-[12px] text-[var(--mute)]">
                            {isEdit
                                ? `${snippet.live ? 'Live on the site' : snippet.status === 'published' ? 'Published but switched off' : 'Draft, not on the site'}`
                                : 'Drafts never run on the site; publish when the code is ready.'}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]">✕</button>
                </header>

                <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <Field label="Name" error={errors.name} required>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Google Analytics" />
                        </Field>
                        <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Code <span className="text-[#ff6b6b]">*</span></p>
                            <CodeEditor
                                value={data.code}
                                onChange={(value) => setData('code', value)}
                                language="html"
                                invalid={Boolean(errors.code) || hasErrors}
                                placeholder={PLACEHOLDER}
                                rows={14}
                                aria-label="Snippet code"
                            />
                            <p className="mt-2 text-[11px] text-[var(--ink-faint)]">Added to the page exactly as written: paste full &lt;script&gt;…&lt;/script&gt; or &lt;style&gt;…&lt;/style&gt; tags.</p>
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
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] px-4 py-3">
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
                        <Field label="Runs on" error={errors.target} required>
                            <Select value={data.target} onChange={(e) => setData('target', e.target.value)}>
                                {targets.map((target) => <option key={target.value} value={target.value}>{target.label}</option>)}
                            </Select>
                        </Field>
                        {data.target !== 'all' && (
                            <Field label={data.target === 'only' ? 'Only on these pages' : 'Not on these pages'} error={pathsError} required>
                                <PagePicker options={pageOptions} value={data.target_paths} onChange={(paths) => setData('target_paths', paths)} invalid={Boolean(pathsError)} />
                            </Field>
                        )}
                    </div>
                </div>

                <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--line)] px-6 py-4">
                    {isDirty && <span className="mr-auto text-[11px] text-[var(--mute)]">Unsaved changes</span>}
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" variant="secondary" onClick={() => save('draft')} disabled={processing}>
                        {isEdit && snippet.status === 'published' ? 'Unpublish (save as draft)' : 'Save as draft'}
                    </Button>
                    <Button type="button" onClick={() => save('published')} disabled={processing || hasErrors} title={hasErrors ? 'Fix the errors in the code first' : undefined}>
                        {processing && statusRef.current === 'published' ? 'Publishing…' : isEdit && snippet.status === 'published' ? 'Save & keep published' : 'Publish'}
                    </Button>
                </footer>
            </form>
        </div>
    );
}
