import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import SectionFields from '../../../components/admin/SectionFields';
import {
    Button,
    ConfirmDialog,
    EmptyState,
    Field,
    Input,
    PageHeader,
    Panel,
    Select,
    Toggle,
    useConfirm,
} from '../../../components/admin/ui';

/** One section in the stack: reorder, rename, edit its fields, or remove it. */
function SectionCard({ page, section, index, count, onMove, onDelete }) {
    const [open, setOpen] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        type: section.type,
        name: section.name,
        content: section.content ?? {},
        enabled: section.enabled,
    });

    // A save re-renders this card from the server's copy; re-sync so the form
    // reflects what was actually stored rather than what was typed.
    useEffect(() => {
        setData({
            type: section.type,
            name: section.name,
            content: section.content ?? {},
            enabled: section.enabled,
        });
    }, [section.id, section.name, section.enabled, JSON.stringify(section.content)]);

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/pages/${page.id}/sections/${section.id}`, { preserveScroll: true });
    };

    return (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex flex-col">
                    <button
                        type="button"
                        onClick={() => onMove(index, -1)}
                        disabled={index === 0}
                        aria-label="Move section up"
                        className="text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]"
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(index, 1)}
                        disabled={index === count - 1}
                        aria-label="Move section down"
                        className="mt-1 text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]"
                    >
                        ▼
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    className="flex flex-1 items-center gap-3 text-left"
                >
                    <span className="font-display text-[14px] font-bold text-[var(--ink-strong)]">{section.name}</span>
                    <span className="rounded-full border border-[var(--field-line)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                        {section.typeLabel}
                    </span>
                    {!section.enabled && (
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b]">Hidden</span>
                    )}
                </button>

                <span className="text-[11px] text-[var(--ink-faint)]">{open ? 'Close' : 'Edit'}</span>
                <Button variant="ghost" onClick={() => onDelete(section)}>Remove</Button>
            </div>

            {open && (
                <form onSubmit={submit} className="border-t border-[var(--line)] p-5">
                    {section.dataDriven && (
                        <p className="mb-5 rounded-lg border border-[#507AF4]/30 bg-[#507AF4]/10 px-4 py-3 text-[12px] text-[var(--mute)]">
                            This section draws its own content from the database — the fields below only set the
                            surrounding copy.
                        </p>
                    )}

                    <Field label="Section name" error={errors.name} required className="mb-5">
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </Field>

                    <SectionFields
                        fields={section.fields}
                        content={data.content}
                        onChange={(content) => setData('content', content)}
                        errors={errors}
                    />

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                        <Toggle
                            checked={data.enabled}
                            onChange={(value) => setData('enabled', value)}
                            label="Visible on the site"
                            hint="Hidden sections stay here but are not rendered."
                        />
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save section'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

/** The palette: pick a widget type and it is appended to the stack. */
function AddSection({ page, palette }) {
    const [type, setType] = useState(palette[0]?.value ?? '');
    const selected = palette.find((item) => item.value === type);

    const add = () => {
        if (!selected) return;

        router.post(
            `/admin/pages/${page.id}/sections`,
            { type: selected.value, name: selected.label, content: {}, enabled: true },
            { preserveScroll: true },
        );
    };

    return (
        <Panel title="Add a section" description="Pick a widget; edit its content once it is in the stack.">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <Field label="Section type">
                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                        {palette.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </Select>
                </Field>
                <Button type="button" onClick={add}>Add section</Button>
            </div>
            {selected && <p className="mt-3 text-[12px] text-[var(--mute)]">{selected.description}</p>}
        </Panel>
    );
}

export default function PageBuilder({ page, sections, palette }) {
    // Local copy so the up/down buttons reorder instantly, then persist.
    const [rows, setRows] = useState(sections);
    const [request, confirm, cancel, run] = useConfirm();

    useEffect(() => {
        setRows(sections);
    }, [sections]);

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= rows.length) return;

        const next = [...rows];
        [next[index], next[target]] = [next[target], next[index]];
        setRows(next);

        router.patch(
            `/admin/pages/${page.id}/sections/reorder`,
            { ids: next.map((row) => row.id) },
            { preserveScroll: true },
        );
    };

    const askDelete = (section) => {
        confirm({
            title: `Remove “${section.name}”?`,
            body: 'The section and its content are deleted permanently.',
            confirmLabel: 'Remove',
            action: () => router.delete(`/admin/pages/${page.id}/sections/${section.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title={`${page.title} sections — Marketorr Admin`} />
            <PageHeader
                title={`${page.title} — sections`}
                subtitle="The order here is the order on the page."
            >
                <Button as="link" href={`/admin/pages/${page.id}/edit`} variant="secondary">Page & SEO</Button>
                <Button as="link" href="/admin/pages" variant="secondary">All pages</Button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {rows.length === 0 ? (
                        <Panel><EmptyState>No sections yet — add the first one.</EmptyState></Panel>
                    ) : (
                        rows.map((section, index) => (
                            <SectionCard
                                key={section.id}
                                page={page}
                                section={section}
                                index={index}
                                count={rows.length}
                                onMove={move}
                                onDelete={askDelete}
                            />
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <AddSection page={page} palette={palette} />
                    <Panel title="Preview">
                        <a
                            href={page.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                        >
                            Open {page.url} ↗
                        </a>
                    </Panel>
                </div>
            </div>

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

PageBuilder.layout = (page) => <AdminLayout>{page}</AdminLayout>;
