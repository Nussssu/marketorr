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
    Select,
    Textarea,
    slugify,
} from '../../../components/admin/ui';

export default function CategoryForm({ category, statuses, parents = [] }) {
    const isEdit = Boolean(category);
    // Only auto-fill the slug while the admin has not hand-edited it.
    const [slugLocked, setSlugLocked] = useState(isEdit);
    const [preview, setPreview] = useState(category?.thumbnail_url ?? null);

    const { data, setData, post, processing, errors } = useForm({
        // Spoofed so the multipart upload still reaches the PUT route on update.
        _method: isEdit ? 'put' : 'post',
        parent_id: category?.parent_id ?? '',
        slug: category?.slug ?? '',
        name: category?.name ?? '',
        description: category?.description ?? '',
        thumbnail: null,
        accent: category?.accent ?? '#891FFB',
        status: category?.status ?? 'published',
        sort_order: category?.sort_order ?? '',
    });

    const onNameChange = (value) => {
        setData((current) => ({
            ...current,
            name: value,
            slug: slugLocked ? current.slug : slugify(value),
        }));
    };

    const onThumbnailChange = (file) => {
        setData('thumbnail', file);
        setPreview(file ? URL.createObjectURL(file) : category?.thumbnail_url ?? null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(isEdit ? `/admin/categories/${category.id}` : '/admin/categories', { forceFormData: true });
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'New'} category — Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${category.name}` : 'New category'}
                subtitle="Categories file projects and can nest one level deep."
            >
                <Button as="link" href="/admin/categories" variant="secondary">Cancel</Button>
            </PageHeader>

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Basics">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Name" error={errors.name} required className="sm:col-span-2">
                                <Input value={data.name} onChange={(e) => onNameChange(e.target.value)} />
                            </Field>
                            <Field
                                label="Slug"
                                error={errors.slug}
                                required
                                hint="Used when filtering by category."
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
                            <Field
                                label="Parent category"
                                error={errors.parent_id}
                                hint="Leave empty for a top-level discipline."
                            >
                                <Select value={data.parent_id ?? ''} onChange={(e) => setData('parent_id', e.target.value)}>
                                    <option value="">— None (top level)</option>
                                    {parents.map((parent) => (
                                        <option key={parent.id} value={parent.id}>{parent.label}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Accent colour" error={errors.accent}>
                                <ColorInput value={data.accent} onChange={(v) => setData('accent', v)} />
                            </Field>
                            <Field label="Description" error={errors.description} className="sm:col-span-2">
                                <Textarea rows={4} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </Field>
                        </div>
                    </Panel>
                </div>

                <div className="space-y-6">
                    <Panel title="Thumbnail">
                        <Field label="Image" error={errors.thumbnail} hint="JPG, PNG, WebP or SVG. Max 2 MB.">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                onChange={(e) => onThumbnailChange(e.target.files?.[0] ?? null)}
                                className="w-full text-[12px] text-[var(--mute)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--chip)] file:px-3 file:py-2 file:text-[11px] file:font-bold file:uppercase file:tracking-[0.14em] file:text-[var(--ink)]"
                            />
                        </Field>
                        {preview && (
                            <img src={preview} alt="" className="mt-4 w-full rounded-lg border border-[var(--line)] object-cover" />
                        )}
                    </Panel>

                    <Panel title="Publishing">
                        <div className="space-y-5">
                            <Field label="Status" error={errors.status} required>
                                <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Sort order" error={errors.sort_order} hint="Leave blank to append.">
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                />
                            </Field>
                        </div>
                    </Panel>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving…' : isEdit ? 'Save category' : 'Create category'}
                    </Button>
                </div>
            </form>
        </>
    );
}

CategoryForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
