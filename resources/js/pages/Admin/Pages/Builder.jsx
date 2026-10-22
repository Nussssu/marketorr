import { Head, Link, router, useForm } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import MediaPickerField from '../../../components/admin/MediaPickerField';
import SectionFields from '../../../components/admin/SectionFields';
import { Button, ConfirmDialog, EmptyState, Field, Input, PageHeader, Panel, Select, StickyColumn, Textarea, WidgetPanel, useConfirm } from '../../../components/admin/ui';

const ROBOTS = ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'];

const ICONS = {
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    delete: <><path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" /><path d="M10 11.5v5M14 11.5v5" /></>,
    up: <path d="m6 15 6-6 6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
};

function Icon({ name }) {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[name]}
        </svg>
    );
}

const ICON_BUTTON = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-30';
const NEUTRAL_ICON = `${ICON_BUTTON} text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]`;

/**
 * Show/hide switch for one section. Flips immediately and saves on its own,
 * so a section can be taken off the live page without opening its form.
 */
function VisibilitySwitch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            title={checked ? 'Shown on the site — click to hide' : 'Hidden from the site — click to show'}
            onClick={() => onChange(!checked)}
            className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
            style={{ background: checked ? 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' : 'var(--field-line)' }}
        >
            <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                aria-hidden
            />
        </button>
    );
}

/**
 * One section as a widget card: its number, name and type in a single row
 * with reorder, show/hide and delete controls. Tapping the card opens its
 * form and tapping again closes it; each card opens and closes on its own,
 * so the others stay exactly as they were. Edits are saved by the page's
 * fixed save bar, which this card registers with.
 */
function SectionCard({ page, section, index, count, open, onToggleOpen, onMove, onDelete, register }) {
    const { data, setData, put, errors } = useForm({
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

    const isDirty = () =>
        JSON.stringify({ name: data.name, content: data.content }) !==
        JSON.stringify({ name: section.name, content: section.content ?? {} });

    const save = () =>
        new Promise((resolve) => {
            put(`/admin/pages/${page.id}/sections/${section.id}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => resolve(true),
                onError: () => resolve(false),
                onCancel: () => resolve(false),
            });
        });

    useEffect(() => register(section.id, { isDirty, save }));
    useEffect(() => () => register(section.id, null), [section.id]);

    const submit = (e) => {
        e.preventDefault();
    };

    // Saves the stored copy with only the visibility flipped, so an unsaved
    // edit in the open form is never published by accident.
    const setVisible = (enabled) => {
        router.put(
            `/admin/pages/${page.id}/sections/${section.id}`,
            { type: section.type, name: section.name, content: section.content ?? {}, enabled },
            { preserveScroll: true },
        );
    };

    return (
        <div className={`rounded-xl border bg-[var(--surface)] transition-colors ${open ? 'border-[var(--brand-2)]/50' : 'border-[var(--line)]'} ${section.enabled ? '' : 'opacity-75'}`}>
            <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-[var(--field-line)] px-1.5 font-mono text-[12px] font-bold text-[var(--ink)]">
                    {index + 1}
                </span>

                <button
                    type="button"
                    onClick={onToggleOpen}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 flex-col items-start text-left sm:flex-row sm:items-center sm:gap-3"
                >
                    <span className="truncate font-display text-[14px] font-bold text-[var(--ink-strong)]">{section.name}</span>
                    <span className="mt-1 rounded-full border border-[var(--field-line)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:mt-0">
                        {section.typeLabel}
                    </span>
                </button>

                <span className={`hidden text-[10px] font-bold uppercase tracking-[0.14em] sm:inline ${section.enabled ? 'text-[var(--ink-faint)]' : 'text-[#ff6b6b]'}`}>
                    {section.enabled ? 'Visible' : 'Hidden'}
                </span>
                <VisibilitySwitch
                    checked={section.enabled}
                    onChange={setVisible}
                    label={`${section.enabled ? 'Hide' : 'Show'} ${section.name} on the site`}
                />

                <div className="flex items-center">
                    <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} className={NEUTRAL_ICON} title="Move up" aria-label={`Move ${section.name} up`}>
                        <Icon name="up" />
                    </button>
                    <button type="button" onClick={() => onMove(index, 1)} disabled={index === count - 1} className={NEUTRAL_ICON} title="Move down" aria-label={`Move ${section.name} down`}>
                        <Icon name="down" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(section)}
                        className={`${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`}
                        title="Delete section"
                        aria-label={`Delete ${section.name}`}
                    >
                        <Icon name="delete" />
                    </button>
                </div>
            </div>

            {open && (
                <form onSubmit={submit} className="border-t border-[var(--line)] p-5">
                    {section.dataDriven && (
                        <p className="mb-5 rounded-lg border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 px-4 py-3 text-[12px] text-[var(--mute)]">
                            This section draws its own content from the database, the fields below only set the
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

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--line)] pt-5">
                        <Button type="button" variant="secondary" onClick={onToggleOpen}>Close</Button>
                    </div>
                </form>
            )}
        </div>
    );
}

/** One category row: colour dot, name, slug, project count and actions. */
function CategoryRow({ category, nested = false, onDelete }) {
    return (
        <div className={`flex items-center gap-3 border-t border-[var(--line)] py-3 ${nested ? 'pl-8' : ''}`}>
            {category.accent && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: category.accent }} aria-hidden />}
            <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[var(--ink-strong)]">{category.name}</p>
                <p className="truncate font-mono text-[11px] text-[var(--ink-faint)]">{category.slug} · {category.projects_count} project{category.projects_count === 1 ? '' : 's'}</p>
            </div>
            <Link href={`/admin/categories/${category.id}/edit`} className={NEUTRAL_ICON} title="Edit category" aria-label={`Edit ${category.name}`}>
                <Icon name="edit" />
            </Link>
            <button
                type="button"
                onClick={() => onDelete(category)}
                className={`${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`}
                title="Delete category"
                aria-label={`Delete ${category.name}`}
            >
                <Icon name="delete" />
            </button>
        </div>
    );
}

/**
 * The categories projects are filed under, managed here on the Our Work
 * page rather than in a module of their own.
 */
function CategoriesWidget({ categories, onDelete }) {
    const total = categories.reduce((sum, category) => sum + 1 + (category.children?.length ?? 0), 0);

    return (
        <div id="categories" className="scroll-mt-24">
            <WidgetPanel
                title="Project categories"
                description="The categories projects are filed under. Tap edit to change one."
                summary={`${total} categor${total === 1 ? 'y' : 'ies'}`}
                defaultOpen={typeof window !== 'undefined' && window.location.hash === '#categories'}
                action={<Button as="link" href="/admin/categories/create" variant="secondary">Add category</Button>}
            >
                {categories.length === 0 ? (
                    <EmptyState>No categories yet, add the first one.</EmptyState>
                ) : (
                    <div className="-mt-3">
                        {categories.map((category) => (
                            <div key={category.id}>
                                <CategoryRow category={category} onDelete={onDelete} />
                                {(category.children ?? []).map((child) => (
                                    <CategoryRow key={child.id} category={child} nested onDelete={onDelete} />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </WidgetPanel>
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

/** A count that turns red once the text passes the length search engines show. */
function LengthHint({ value, limit }) {
    const length = String(value ?? '').length;

    return <span className={length > limit ? 'text-[#ff6b6b]' : ''}>{length}/{limit} characters</span>;
}

/**
 * This page's SEO, edited beside its sections. Saved by the page's fixed save
 * bar through the same page update as the full "Page & SEO" screen, staying
 * on the builder.
 */
function SeoPanel({ page, register }) {
    const { data, setData, put, errors, isDirty, setDefaults } = useForm({
        slug: page.slug,
        title: page.title,
        status: page.status,
        sort_order: page.sort_order ?? 0,
        meta_title: page.meta_title ?? '',
        meta_description: page.meta_description ?? '',
        meta_robots: page.meta_robots ?? 'index,follow',
        canonical_url: page.canonical_url ?? '',
        schema_markup: page.schema_markup ?? '',
        og_image: page.og_image_url ?? '',
        stay: true,
    });

    const save = () =>
        new Promise((resolve) => {
            put(`/admin/pages/${page.id}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setDefaults();
                    resolve(true);
                },
                onError: () => resolve(false),
                onCancel: () => resolve(false),
            });
        });

    useEffect(() => register('seo', { isDirty: () => isDirty, save }));
    useEffect(() => () => register('seo', null), []);

    const submit = (e) => {
        e.preventDefault();
    };

    return (
        <Panel title="SEO" description="How this page appears in search results and when shared.">
            <form onSubmit={submit} className="grid gap-4">
                <Field label="Meta title" error={errors.meta_title} hint={<LengthHint value={data.meta_title} limit={60} />}>
                    <Input value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} placeholder={`${page.title} | Marketorr`} />
                </Field>
                <Field label="Meta description" error={errors.meta_description} hint={<LengthHint value={data.meta_description} limit={160} />}>
                    <Textarea rows={3} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} />
                </Field>
                <MediaPickerField
                    label="Share image"
                    value={data.og_image}
                    error={errors.og_image}
                    onChange={(url) => setData('og_image', url)}
                />
                <Field label="Robots" error={errors.meta_robots} required>
                    <Select value={data.meta_robots} onChange={(e) => setData('meta_robots', e.target.value)}>
                        {ROBOTS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </Select>
                </Field>
                <Field label="Canonical URL" error={errors.canonical_url}>
                    <Input value={data.canonical_url} onChange={(e) => setData('canonical_url', e.target.value)} placeholder="https://" />
                </Field>
                <Field label="Schema markup (JSON-LD)" error={errors.schema_markup}>
                    <Textarea rows={4} className="font-mono text-[12px]" value={data.schema_markup} onChange={(e) => setData('schema_markup', e.target.value)} />
                </Field>
            </form>
        </Panel>
    );
}

export default function PageBuilder({ page, sections, palette, categories = null }) {
    // Local copy so the up/down buttons reorder instantly, then persist.
    const [rows, setRows] = useState(sections);
    // Each card's open state is its own: opening one never closes another.
    const [openIds, setOpenIds] = useState(() => new Set());
    const toggleOpen = (id) => setOpenIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);

        return next;
    });
    const [request, confirm, cancel, run] = useConfirm();

    // Every editable widget registers its dirty check and save here, so the
    // fixed save bar can save all pending changes in one go.
    const savers = useRef(new Map());
    const register = useCallback((key, api) => {
        if (api) savers.current.set(key, api);
        else savers.current.delete(key);
    }, []);
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);

    // Saves one widget after another, since a new Inertia visit would cancel
    // the one still in flight. Widgets that fail validation are opened so
    // their errors show.
    const saveAll = async () => {
        setSaving(true);
        setSaveResult(null);

        const pending = [...savers.current.entries()].filter(([, api]) => api.isDirty());
        const failed = [];
        for (const [key, api] of pending) {
            if (!(await api.save())) failed.push(key);
        }

        const failedSections = failed.filter((key) => key !== 'seo');
        if (failedSections.length > 0) {
            setOpenIds((current) => new Set([...current, ...failedSections]));
        }

        setSaving(false);
        setSaveResult(pending.length === 0 ? 'none' : failed.length === 0 ? 'saved' : 'failed');
    };

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
            title: `Delete “${section.name}”?`,
            body: 'The section and its content are deleted permanently.',
            confirmLabel: 'Delete',
            action: () => router.delete(`/admin/pages/${page.id}/sections/${section.id}`, { preserveScroll: true }),
        });
    };

    const askDeleteCategory = (category) => {
        const children = category.children?.length ?? 0;
        confirm({
            title: `Delete “${category.name}”?`,
            body: [
                category.projects_count > 0 && `${category.projects_count} project(s) will be left without a category.`,
                children > 0 && `${children} sub-categor${children === 1 ? 'y moves' : 'ies move'} to the top level.`,
            ].filter(Boolean).join(' ') || 'The category is removed.',
            confirmLabel: 'Delete',
            action: () => router.delete(`/admin/categories/${category.id}`, { preserveScroll: true }),
        });
    };

    const visibleCount = rows.filter((row) => row.enabled).length;

    return (
        <>
            <Head title={`${page.title} sections | Marketorr Admin`} />
            <PageHeader
                title={`${page.title}: sections`}
                subtitle={`${rows.length} section${rows.length === 1 ? '' : 's'}, ${visibleCount} shown on the site. The order here is the order on the page.`}
            >
                <Button as="a" href={page.url} target="_blank" rel="noreferrer" variant="secondary">View page ↗</Button>
                <Button as="link" href="/admin/pages" variant="secondary">All pages</Button>
            </PageHeader>

            {/* Both columns start on the same line and stick: whichever is shorter
                stays beside the other while scrolling, so neither leaves a blank area. */}
            <div className="grid items-start gap-6 lg:grid-cols-3">
                <StickyColumn className="space-y-3 lg:col-span-2" bottomOffset={96}>
                    {rows.length === 0 ? (
                        <Panel><EmptyState>No sections yet, add the first one.</EmptyState></Panel>
                    ) : (
                        rows.map((section, index) => (
                            <SectionCard
                                key={section.id}
                                page={page}
                                section={section}
                                index={index}
                                count={rows.length}
                                open={openIds.has(section.id)}
                                onToggleOpen={() => toggleOpen(section.id)}
                                onMove={move}
                                onDelete={askDelete}
                                register={register}
                            />
                        ))
                    )}

                    {categories && <CategoriesWidget categories={categories} onDelete={askDeleteCategory} />}
                </StickyColumn>

                <StickyColumn className="space-y-3" bottomOffset={96}>
                    <AddSection page={page} palette={palette} />
                    <SeoPanel page={page} register={register} />
                </StickyColumn>
            </div>

            {/* Spacer so the fixed save bar never covers the last widget. */}
            <div className="h-20" aria-hidden />

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:px-6 lg:left-64 lg:px-10">
                <div className="flex items-center justify-end gap-3">
                    {saveResult === 'saved' && <span className="text-[12px] text-[var(--mute)]">All changes saved.</span>}
                    {saveResult === 'none' && <span className="text-[12px] text-[var(--mute)]">No changes to save.</span>}
                    {saveResult === 'failed' && <span className="text-[12px] text-[#ff6b6b]">Some changes could not be saved, check the highlighted fields.</span>}
                    <Button type="button" onClick={saveAll} disabled={saving}>
                        {saving ? 'Saving…' : 'Save changes'}
                    </Button>
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
