import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
    Button,
    ColorInput,
    Field,
    Input,
    PageHeader,
    Panel,
    RepeatableList,
    Select,
    Textarea,
    slugify,
} from '../../../components/admin/ui';

export default function ProjectForm({ project, statuses, categories = [] }) {
    const isEdit = Boolean(project);
    // Only auto-fill the slug while the admin has not hand-edited it.
    const [slugLocked, setSlugLocked] = useState(isEdit);
    const [preview, setPreview] = useState(project?.image_url ?? null);

    const { data, setData, post, processing, errors } = useForm({
        // Spoofed so the multipart upload still reaches the PUT route on update.
        _method: isEdit ? 'put' : 'post',
        slug: project?.slug ?? '',
        title: project?.title ?? '',
        client: project?.client ?? '',
        category_id: project?.category_id ?? '',
        year: project?.year ?? String(new Date().getFullYear()),
        description: project?.description ?? '',
        metric: project?.metric ?? '',
        metric_label: project?.metric_label ?? '',
        accent: project?.accent ?? '#891FFB',
        image: null,
        image_alt: project?.image_alt ?? '',
        external_url: project?.external_url ?? '',
        tags: project?.tags?.length ? project.tags : [''],
        featured: project?.featured ?? false,
        status: project?.status ?? 'published',
        sort_order: project?.sort_order ?? '',
    });

    const onTitleChange = (value) => {
        setData((current) => ({
            ...current,
            title: value,
            slug: slugLocked ? current.slug : slugify(value),
        }));
    };

    const onImageChange = (file) => {
        setData('image', file);
        setPreview(file ? URL.createObjectURL(file) : project?.image_url ?? null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(isEdit ? `/admin/projects/${project.id}` : '/admin/projects', { forceFormData: true });
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'New'} project — Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${project.title}` : 'New project'}
                subtitle="Fields map one-to-one onto the public case study page."
            >
                <Button as="link" href="/admin/projects" variant="secondary">Cancel</Button>
            </PageHeader>

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Basics">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Title" error={errors.title} required className="sm:col-span-2">
                                <Input value={data.title} onChange={(e) => onTitleChange(e.target.value)} />
                            </Field>
                            <Field
                                label="Slug"
                                error={errors.slug}
                                required
                                hint="Used in the URL: /work/your-slug"
                                className="sm:col-span-2"
                            >
                                <Input
                                    value={data.slug}
                                    onChange={(e) => {
                                        setSlugLocked(true);
                                        setData('slug', e.target.value);
                                    }}
                                />
                            </Field>
                            <Field label="Client" error={errors.client} required>
                                <Input value={data.client} onChange={(e) => setData('client', e.target.value)} placeholder="Acme Co · Manufacturer" />
                            </Field>
                            <Field
                                label="Category"
                                error={errors.category_id}
                                required
                                hint={categories.length === 0 ? 'No categories yet — create one first.' : undefined}
                            >
                                <Select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}>
                                    <option value="">Select a category…</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.label}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Year" error={errors.year} required>
                                <Input value={data.year} onChange={(e) => setData('year', e.target.value)} />
                            </Field>
                            <Field label="Accent colour" error={errors.accent} required>
                                <ColorInput value={data.accent} onChange={(v) => setData('accent', v)} />
                            </Field>
                            <Field label="Description" error={errors.description} required className="sm:col-span-2">
                                <Textarea rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="Headline metric" description="Optional — shown over the cover image and on the case study.">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Metric" error={errors.metric}>
                                <Input value={data.metric ?? ''} onChange={(e) => setData('metric', e.target.value)} placeholder="2100%" />
                            </Field>
                            <Field label="Metric label" error={errors.metric_label}>
                                <Input value={data.metric_label ?? ''} onChange={(e) => setData('metric_label', e.target.value)} placeholder="Organic Traffic Increase" />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="External case study" description="Optional — when the full write-up lives elsewhere (Behance, Dribbble, the client's own site), the project page links out to it instead of repeating it.">
                        <Field label="Case study URL" error={errors.external_url}>
                            <Input
                                type="url"
                                value={data.external_url ?? ''}
                                onChange={(e) => setData('external_url', e.target.value)}
                                placeholder="https://www.behance.net/gallery/..."
                            />
                        </Field>
                    </Panel>

                    <Panel title="Cover image">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Image"
                                error={errors.image}
                                required={!isEdit}
                                hint={isEdit ? 'Leave empty to keep the current image.' : 'JPG, PNG or WebP, up to 4 MB.'}
                            >
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                                    className="w-full text-[13px] text-[var(--mute)] file:mr-3 file:rounded-lg file:border file:border-[var(--field-line)] file:bg-[var(--chip)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-[var(--ink)]"
                                />
                            </Field>
                            <Field label="Image alt text" error={errors.image_alt} required>
                                <Input value={data.image_alt} onChange={(e) => setData('image_alt', e.target.value)} />
                            </Field>
                            {preview && (
                                <div className="sm:col-span-2">
                                    <img src={preview} alt="" className="aspect-[16/10] w-full max-w-sm rounded-lg border border-[var(--line)] object-cover" />
                                </div>
                            )}
                        </div>
                    </Panel>
                </div>

                <div className="space-y-6">
                    <Panel title="Publishing">
                        <div className="space-y-5">
                            <Field label="Status" error={errors.status} required>
                                <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Select>
                            </Field>
                            <label className="flex items-center gap-3 text-[13px] text-[var(--ink)]">
                                <input
                                    type="checkbox"
                                    checked={data.featured}
                                    onChange={(e) => setData('featured', e.target.checked)}
                                    className="h-4 w-4 rounded border-[var(--field-line)]"
                                />
                                Feature on the home page
                            </label>
                            <Field label="Sort order" error={errors.sort_order} hint="Leave empty to append to the end.">
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.sort_order ?? ''}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="Tags">
                        <RepeatableList
                            values={data.tags}
                            onChange={(tags) => setData('tags', tags)}
                            placeholder="SEO"
                            addLabel="Add tag"
                            errors={errors}
                            name="tags"
                        />
                        {errors.tags && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.tags}</p>}
                    </Panel>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
                    </Button>
                </div>
            </form>
        </>
    );
}

ProjectForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
