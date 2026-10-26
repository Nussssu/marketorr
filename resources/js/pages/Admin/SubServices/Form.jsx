import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import MediaPickerField from '../../../components/admin/MediaPickerField';
import { Button, ColorInput, Field, Input, PageHeader, RepeatableList, Select, StickyColumn, Textarea, WidgetPanel, slugify } from '../../../components/admin/ui';

/** How many projects the public page's related-work row shows. */
const RELATED_LIMIT = 4;

const ROW_ICON = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--ink-faint)] transition-colors hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30';

/**
 * Mirrors `SubServiceRelatedWork` on the server: pinned projects lead, then
 * projects with a matching tag, then the rest of the portfolio tops the row
 * up — so the editor sees what the page will show before saving.
 */
function previewRelated(options, pins, match) {
    const terms = match.map((term) => term.trim().toLowerCase()).filter(Boolean);
    const pinned = pins.map((slug) => options.find((option) => option.slug === slug)).filter(Boolean);
    const matching = options.filter((option) => option.tags.some((tag) => terms.includes(tag.toLowerCase())));
    const related = [...new Map([...pinned, ...matching].map((option) => [option.slug, option])).values()].slice(0, RELATED_LIMIT);
    const rest = options.filter((option) => !related.some((entry) => entry.slug === option.slug)).slice(0, RELATED_LIMIT - related.length);

    return [...related.map((option) => ({ ...option, related: true })), ...rest.map((option) => ({ ...option, related: false }))];
}

function Thumb({ src, alt }) {
    return src
        ? <img src={src} alt={alt} loading="lazy" className="h-12 w-16 shrink-0 rounded-md border border-[var(--line)] object-cover" />
        : <span className="h-12 w-16 shrink-0 rounded-md border border-[var(--line)] bg-[var(--chip)]" aria-hidden />;
}

/**
 * Related work, picked rather than typed: hand-picked projects (in order)
 * lead the row, and match tags pull in more projects carrying that tag.
 */
function RelatedWorkPicker({ options, pins, onPinsChange, match, onMatchChange, groupName }) {
    const [browsing, setBrowsing] = useState(false);
    const [search, setSearch] = useState('');
    const [tagDraft, setTagDraft] = useState('');

    const cleanPins = pins.filter(Boolean);
    const cleanMatch = match.filter(Boolean);
    const available = options.filter((option) => !cleanPins.includes(option.slug));
    const query = search.trim().toLowerCase();
    const found = query
        ? available.filter((option) => `${option.title} ${option.meta} ${option.tags.join(' ')}`.toLowerCase().includes(query))
        : available;
    const tagSuggestions = [...new Set(options.flatMap((option) => option.tags))]
        .filter((tag) => !cleanMatch.some((term) => term.toLowerCase() === tag.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));
    const preview = previewRelated(options, cleanPins, cleanMatch);

    const movePin = (index, direction) => {
        const next = [...cleanPins];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        onPinsChange(next);
    };

    const addTag = (tag) => {
        const value = tag.trim();
        if (!value || cleanMatch.some((term) => term.toLowerCase() === value.toLowerCase())) return;
        onMatchChange([...cleanMatch, value]);
        setTagDraft('');
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Hand-picked projects</p>
                    <Button type="button" variant="secondary" onClick={() => setBrowsing((open) => !open)}>
                        {browsing ? 'Done' : '+ Add related work'}
                    </Button>
                </div>

                {cleanPins.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[var(--field-line)] px-4 py-3 text-[13px] text-[var(--mute)]">
                        None picked yet. Add projects to show them first, in this order.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {cleanPins.map((slug, index) => {
                            const option = options.find((entry) => entry.slug === slug);

                            return (
                                <li key={slug} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2">
                                    <Thumb src={option?.image} alt={option?.title ?? slug} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-semibold text-[var(--ink-strong)]">{option?.title ?? slug}</p>
                                        <p className="truncate text-[11px] text-[var(--ink-faint)]">
                                            {option ? option.meta : `Not in the ${groupName} portfolio (unpublished or no cover), so it is skipped.`}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => movePin(index, -1)} disabled={index === 0} className={ROW_ICON} title="Move up" aria-label={`Move ${option?.title ?? slug} up`}>↑</button>
                                    <button type="button" onClick={() => movePin(index, 1)} disabled={index === cleanPins.length - 1} className={ROW_ICON} title="Move down" aria-label={`Move ${option?.title ?? slug} down`}>↓</button>
                                    <button type="button" onClick={() => onPinsChange(cleanPins.filter((entry) => entry !== slug))} className={`${ROW_ICON} hover:text-[#ff6b6b]`} title="Remove" aria-label={`Remove ${option?.title ?? slug}`}>✕</button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {browsing && (
                    <div className="mt-3 rounded-xl border border-[var(--field-line)] bg-[var(--bg)] p-3">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search the ${groupName} portfolio…`} aria-label="Search projects" />
                        {found.length === 0 ? (
                            <p className="px-1 pt-3 text-[13px] text-[var(--mute)]">{available.length === 0 ? 'Every project is already picked.' : 'No project matches that search.'}</p>
                        ) : (
                            <ul className="mt-3 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                                {found.map((option) => (
                                    <li key={option.slug}>
                                        <button
                                            type="button"
                                            onClick={() => onPinsChange([...cleanPins, option.slug])}
                                            className="flex w-full items-center gap-3 rounded-lg border border-[var(--line)] p-2 text-left transition-colors hover:border-[var(--brand-3)] hover:bg-[var(--chip)]"
                                        >
                                            <Thumb src={option.image} alt={option.title} />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13px] font-semibold text-[var(--ink-strong)]">{option.title}</span>
                                                <span className="block truncate text-[11px] text-[var(--ink-faint)]">{option.meta}</span>
                                            </span>
                                            <span className="text-[18px] text-[var(--ink-faint)]" aria-hidden>+</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Match tags</p>
                <div className="flex flex-wrap gap-2">
                    {cleanMatch.map((term) => (
                        <span key={term} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--field-line)] bg-[var(--chip)] py-1 pl-3 pr-1.5 text-[12px] text-[var(--ink)]">
                            {term}
                            <button type="button" onClick={() => onMatchChange(cleanMatch.filter((entry) => entry !== term))} className="rounded-full px-1 text-[var(--ink-faint)] hover:text-[#ff6b6b]" aria-label={`Remove tag ${term}`}>✕</button>
                        </span>
                    ))}
                    {cleanMatch.length === 0 && <span className="text-[13px] text-[var(--mute)]">No tags. Projects carrying a tag added here join the row.</span>}
                </div>
                <div className="mt-3 flex gap-2">
                    <Input
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(tagDraft);
                            }
                        }}
                        list="related-tag-suggestions"
                        placeholder="Type or choose a tag, then Add"
                        aria-label="New match tag"
                    />
                    <datalist id="related-tag-suggestions">
                        {tagSuggestions.map((tag) => <option key={tag} value={tag} />)}
                    </datalist>
                    <Button type="button" variant="secondary" onClick={() => addTag(tagDraft)}>Add</Button>
                </div>
            </div>

            <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">What the page will show</p>
                {preview.length === 0 ? (
                    <p className="text-[13px] text-[var(--mute)]">The {groupName} portfolio has no projects with a cover yet, so the section stays hidden.</p>
                ) : (
                    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {preview.map((entry) => (
                            <li key={entry.slug}>
                                <img src={entry.image} alt={entry.title} loading="lazy" className="aspect-[4/3] w-full rounded-lg border border-[var(--line)] object-cover" />
                                <p className="mt-1.5 truncate text-[12px] font-semibold text-[var(--ink-strong)]">{entry.title}</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">{entry.related ? 'Related' : 'Fills the row'}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

const BLANK_SECTION = { eyebrow: '', heading: '', body: '', images: [] };

/**
 * The case study as a form instead of raw JSON: a meta line, then ordered
 * sections of eyebrow, heading, body and images from the media library.
 */
function CaseStudyEditor({ value, onChange, error }) {
    const study = value ?? { meta: '', sections: [] };
    const sections = study.sections ?? [];

    const setSections = (next) => onChange({ ...study, sections: next });
    const updateSection = (index, patch) => setSections(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));
    const moveSection = (index, direction) => {
        const next = [...sections];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        setSections(next);
    };

    return (
        <div className="space-y-5">
            {error && <p className="text-[12px] text-[#ff6b6b]">{error}</p>}
            <Field label="Meta line" hint="Small line above the story, e.g. when and how it was made.">
                <Input value={study.meta ?? ''} onChange={(e) => onChange({ ...study, meta: e.target.value })} />
            </Field>

            {sections.map((section, index) => (
                <div key={index} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Section {index + 1}</p>
                        <div className="flex items-center">
                            <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className={ROW_ICON} title="Move up" aria-label={`Move section ${index + 1} up`}>↑</button>
                            <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className={ROW_ICON} title="Move down" aria-label={`Move section ${index + 1} down`}>↓</button>
                            <button type="button" onClick={() => setSections(sections.filter((_, i) => i !== index))} className={`${ROW_ICON} hover:text-[#ff6b6b]`} title="Remove section" aria-label={`Remove section ${index + 1}`}>✕</button>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <Field label="Eyebrow">
                            <Input value={section.eyebrow ?? ''} onChange={(e) => updateSection(index, { eyebrow: e.target.value })} placeholder="About the project" />
                        </Field>
                        <Field label="Heading">
                            <Input value={section.heading ?? ''} onChange={(e) => updateSection(index, { heading: e.target.value })} />
                        </Field>
                        <Field label="Text">
                            <Textarea rows={3} value={section.body ?? ''} onChange={(e) => updateSection(index, { body: e.target.value })} />
                        </Field>
                        <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Images</p>
                            <div className="space-y-4">
                                {(section.images ?? []).map((image, imageIndex) => (
                                    <div key={imageIndex} className="rounded-lg border border-[var(--line)] p-3">
                                        <MediaPickerField
                                            label={`Image ${imageIndex + 1}`}
                                            value={image.src ?? ''}
                                            preview={image.src ?? ''}
                                            onChange={(url) => updateSection(index, { images: section.images.map((entry, i) => (i === imageIndex ? { ...entry, src: url } : entry)) })}
                                        />
                                        <div className="mt-3 flex items-end gap-2">
                                            <Field label="Alt text" className="flex-1">
                                                <Input value={image.alt ?? ''} onChange={(e) => updateSection(index, { images: section.images.map((entry, i) => (i === imageIndex ? { ...entry, alt: e.target.value } : entry)) })} />
                                            </Field>
                                            <Button type="button" variant="secondary" onClick={() => updateSection(index, { images: section.images.filter((_, i) => i !== imageIndex) })}>Remove</Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" onClick={() => updateSection(index, { images: [...(section.images ?? []), { src: '', alt: '' }] })}>+ Add image</Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <Button type="button" variant="secondary" onClick={() => setSections([...sections, { ...BLANK_SECTION }])}>+ Add section</Button>
        </div>
    );
}

/** Labels for the page copy fields, in the order the page shows them. */
const PAGE_FIELDS = [
    { key: 'work_label', label: 'Related work label' },
    { key: 'work_heading', label: 'Related work heading' },
    { key: 'portfolio_label', label: 'Portfolio button' },
    { key: 'deliverables_heading', label: 'Deliverables card heading' },
    { key: 'practice_heading', label: 'Practice card heading' },
    { key: 'practice_body', label: 'Practice card text (after the tagline)', multiline: true },
    { key: 'discuss_label', label: 'Discuss button' },
    { key: 'discuss_url', label: 'Discuss button link' },
    { key: 'start_label', label: 'Start a project button' },
    { key: 'start_url', label: 'Start a project button link' },
];

export default function SubServiceForm({ item, groups, statuses, relatedOptions = {}, pageDefaults = {} }) {
    const isEdit = Boolean(item);
    const [slugLocked, setSlugLocked] = useState(isEdit);

    const { data, setData, post, put, processing, errors, isDirty, transform } = useForm({
        service_group_id: item?.service_group_id ?? groups[0]?.id ?? '',
        slug: item?.slug ?? '',
        name: item?.name ?? '',
        short: item?.short ?? '',
        description: item?.description ?? '',
        deliverables: item?.deliverables?.length ? item.deliverables : [''],
        image: item?.image ?? '',
        image_alt: item?.image_alt ?? '',
        accent: item?.accent ?? '#507AF4',
        related_match: item?.related_match ?? [],
        related_pin: item?.related_pin ?? [],
        case_study: item?.case_study ?? null,
        page_content: { ...pageDefaults, ...(item?.page_content ?? {}) },
        meta_title: item?.meta_title ?? '',
        meta_description: item?.meta_description ?? '',
        meta_og_image: item?.meta_og_image ?? '',
        meta_robots: item?.meta_robots ?? 'index,follow',
        canonical_url: item?.canonical_url ?? '',
        status: item?.status ?? 'published',
        sort_order: item?.sort_order ?? '',
    });

    const onNameChange = (value) => {
        setData((current) => ({
            ...current,
            name: value,
            slug: slugLocked ? current.slug : slugify(value),
        }));
    };

    const groupSlug = groups.find((group) => String(group.id) === String(data.service_group_id))?.slug;
    const groupName = groups.find((group) => String(group.id) === String(data.service_group_id))?.name ?? 'tab';

    // The server stores the case study from JSON; a study with no sections
    // is no case study at all.
    transform((current) => ({
        ...current,
        case_study: current.case_study?.sections?.length ? JSON.stringify(current.case_study) : '',
    }));

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/sub-services/${item.id}`);
        } else {
            post('/admin/sub-services');
        }
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'New'} sub-service | Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${item.name}` : 'New sub-service'}
                subtitle="Fields map one-to-one onto the public sub-service page."
            >
            </PageHeader>

            {/* Both columns start on the same line and stick: whichever is shorter stays beside the other while scrolling. */}
            <form onSubmit={submit} className="grid items-start gap-6 pb-24 lg:grid-cols-3">
                <StickyColumn bottomOffset={96} className="space-y-4 lg:col-span-2">
                    <WidgetPanel title="Basics" summary={data.name || 'Tab, name, slug, tagline, description and accent'} defaultOpen>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Tab" error={errors.service_group_id} required className="sm:col-span-2">
                                <Select value={data.service_group_id} onChange={(e) => setData('service_group_id', e.target.value)}>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Name" error={errors.name} required>
                                <Input value={data.name} onChange={(e) => onNameChange(e.target.value)} />
                            </Field>
                            <Field label="Slug" error={errors.slug} required hint={`Live address: /services/${groups.find((group) => String(group.id) === String(data.service_group_id))?.slug ?? 'tab'}/${slugify(data.slug) || 'your-slug'} · lowercase letters, numbers and hyphens`}>
                                <Input
                                    value={data.slug}
                                    onChange={(e) => {
                                        setSlugLocked(true);
                                        setData('slug', e.target.value);
                                    }}
                                />
                            </Field>
                            <Field label="Tagline" error={errors.short} className="sm:col-span-2">
                                <Input value={data.short ?? ''} onChange={(e) => setData('short', e.target.value)} placeholder="Positioning that makes choosing you obvious." />
                            </Field>
                            <Field label="Description" error={errors.description} className="sm:col-span-2">
                                <Textarea rows={4} value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} />
                            </Field>
                            <Field label="Accent colour" error={errors.accent} required>
                                <ColorInput value={data.accent} onChange={(v) => setData('accent', v)} />
                            </Field>
                        </div>
                    </WidgetPanel>

                    <WidgetPanel title="Showcase image" summary={data.image ? 'Image set' : 'No image yet'} description="The visual the tile, transition and hero all share. Empty renders the placeholder plate.">
                        <div className="space-y-4">
                            <MediaPickerField
                                label="Image"
                                error={errors.image}
                                hint="Choose an asset from the library. Upload target: 16:10, 1600×1000."
                                preview={typeof data.image === 'string' ? data.image : ''}
                                value={typeof data.image === 'string' ? data.image : ''}
                                onChange={(url) => setData('image', url)}
                            />
                            <Field label="Image alt text" error={errors.image_alt}>
                                <Input value={data.image_alt ?? ''} onChange={(e) => setData('image_alt', e.target.value)} />
                            </Field>
                        </div>
                    </WidgetPanel>

                    <WidgetPanel title="Deliverables" summary={`${data.deliverables.filter(Boolean).length} deliverable${data.deliverables.filter(Boolean).length === 1 ? '' : 's'}`} description="The “what you get” list on the dedicated page.">
                        <RepeatableList
                            values={data.deliverables}
                            onChange={(v) => setData('deliverables', v)}
                            placeholder="Positioning statement"
                            addLabel="Add deliverable"
                            errors={errors}
                            name="deliverables"
                        />
                        {errors.deliverables && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.deliverables}</p>}
                    </WidgetPanel>

                    <WidgetPanel title="Related work" summary={`${data.related_pin.length} pinned · ${data.related_match.length} tagged`} description={`Up to ${RELATED_LIMIT} projects from the ${groupName} portfolio. Hand-picked ones lead, tagged ones follow, and the rest of the portfolio fills any gap.`}>
                        <RelatedWorkPicker
                            options={relatedOptions[groupSlug] ?? []}
                            pins={data.related_pin}
                            onPinsChange={(v) => setData('related_pin', v)}
                            match={data.related_match}
                            onMatchChange={(v) => setData('related_match', v)}
                            groupName={groupName}
                        />
                        {(errors.related_pin || errors.related_match) && (
                            <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.related_pin ?? errors.related_match}</p>
                        )}
                    </WidgetPanel>

                    <WidgetPanel title="Page text" summary="Headings and buttons on the dedicated page" description="The headings and buttons on the dedicated page. {name} and {category} fill in the live names; an emptied field goes back to its default.">
                        <div className="grid gap-5 sm:grid-cols-2">
                            {PAGE_FIELDS.map((field) => (
                                <Field
                                    key={field.key}
                                    label={field.label}
                                    error={errors[`page_content.${field.key}`]}
                                    className={field.multiline ? 'sm:col-span-2' : ''}
                                >
                                    {field.multiline ? (
                                        <Textarea
                                            rows={3}
                                            value={data.page_content[field.key] ?? ''}
                                            placeholder={pageDefaults[field.key]}
                                            onChange={(e) => setData('page_content', { ...data.page_content, [field.key]: e.target.value })}
                                        />
                                    ) : (
                                        <Input
                                            value={data.page_content[field.key] ?? ''}
                                            placeholder={pageDefaults[field.key]}
                                            onChange={(e) => setData('page_content', { ...data.page_content, [field.key]: e.target.value })}
                                        />
                                    )}
                                </Field>
                            ))}
                        </div>
                    </WidgetPanel>

                    <WidgetPanel title="Case study" summary={data.case_study?.sections?.length ? `${data.case_study.sections.length} section${data.case_study.sections.length === 1 ? '' : 's'}` : 'No case study'} description="Optional long-form story below the page. Leave without sections for no case study.">
                        <CaseStudyEditor value={data.case_study} onChange={(v) => setData('case_study', v)} error={errors.case_study} />
                    </WidgetPanel>
                </StickyColumn>

                <StickyColumn bottomOffset={96} className="space-y-4">
                    <WidgetPanel title="Publishing" summary={data.status} defaultOpen>
                        <div className="space-y-5">
                            <Field label="Status" error={errors.status} required>
                                <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Sort order" error={errors.sort_order} hint="Leave empty to append to the end of its tab.">
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.sort_order ?? ''}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                />
                            </Field>
                        </div>
                    </WidgetPanel>

                    <WidgetPanel title="SEO" summary={data.meta_title || 'Uses the page name and description'} description="How this page appears in search results and when shared. Empty fields use the page's name, description and image.">
                        <div className="space-y-5">
                            <Field label="Meta title" error={errors.meta_title} hint={`${data.meta_title.length}/60 characters`}>
                                <Input value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} placeholder={`${data.name || 'Sub-service'} | Marketorr`} />
                            </Field>
                            <Field label="Meta description" error={errors.meta_description} hint={`${data.meta_description.length}/160 characters`}>
                                <Textarea rows={3} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} placeholder={data.description || data.short} />
                            </Field>
                            <MediaPickerField
                                label="Share image"
                                error={errors.meta_og_image}
                                hint="Empty uses the showcase image."
                                value={data.meta_og_image}
                                preview={data.meta_og_image}
                                onChange={(url) => setData('meta_og_image', url)}
                            />
                            <Field label="Robots" error={errors.meta_robots}>
                                <Select value={data.meta_robots} onChange={(e) => setData('meta_robots', e.target.value)}>
                                    {['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'].map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Canonical URL" error={errors.canonical_url}>
                                <Input value={data.canonical_url} onChange={(e) => setData('canonical_url', e.target.value)} placeholder="https://" />
                            </Field>
                        </div>
                    </WidgetPanel>

                </StickyColumn>
                {/* The page's one save button, always on screen at the bottom. */}
                <div className="fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-6 lg:left-64 lg:px-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className={`flex items-center gap-2 text-[13px] font-semibold ${isDirty ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]'}`}>
                            <span className={`h-2 w-2 rounded-full ${isDirty ? 'bg-[#f5a524]' : 'bg-[var(--field-line)]'}`} aria-hidden />
                            {isDirty ? 'You have unsaved changes.' : 'No unsaved changes.'}
                        </p>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create sub-service'}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}

SubServiceForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
