import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
    Button,
    Field,
    Input,
    MediaPickerField,
    PageHeader,
    Panel,
    Select,
    Textarea,
    slugify,
} from '../../../components/admin/ui';

const ROBOTS = ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'];

export default function PageForm({ page, statuses }) {
    const isEdit = Boolean(page);
    const isSystem = page?.is_system ?? false;
    // Only auto-fill the slug while the admin has not hand-edited it.
    const [slugLocked, setSlugLocked] = useState(isEdit);
    const [preview, setPreview] = useState(page?.og_image_url ?? null);

    const { data, setData, post, processing, errors } = useForm({
        // Spoofed so the multipart upload still reaches the PUT route on update.
        _method: isEdit ? 'put' : 'post',
        slug: page?.slug ?? '',
        title: page?.title ?? '',
        status: page?.status ?? 'published',
        sort_order: page?.sort_order ?? '',
        meta_title: page?.meta_title ?? '',
        meta_description: page?.meta_description ?? '',
        og_image: null,
        meta_robots: page?.meta_robots ?? 'index,follow',
        canonical_url: page?.canonical_url ?? '',
        schema_markup: page?.schema_markup ?? '',
    });

    const onTitleChange = (value) => {
        setData((current) => ({
            ...current,
            title: value,
            slug: slugLocked || isSystem ? current.slug : slugify(value),
        }));
    };

    const onOgChange = (fileOrUrl) => {
        setData('og_image', fileOrUrl);
        if (typeof fileOrUrl === 'string') {
            setPreview(fileOrUrl || (page?.og_image_url ?? null));
        } else if (fileOrUrl instanceof File) {
            setPreview(URL.createObjectURL(fileOrUrl));
        } else {
            setPreview(page?.og_image_url ?? null);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(isEdit ? `/admin/pages/${page.id}` : '/admin/pages', { forceFormData: true });
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'New'} page — Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${page.title}` : 'New page'}
                subtitle="Page details and the SEO that overrides the site defaults."
            >
                {isEdit && <Button as="link" href={`/admin/pages/${page.id}/builder`} variant="secondary">Sections</Button>}
                <Button as="link" href="/admin/pages" variant="secondary">Cancel</Button>
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
                                required={!isSystem}
                                hint={isSystem
                                    ? 'Locked: this page backs a built-in route.'
                                    : 'Used in the URL: /your-slug'}
                                className="sm:col-span-2"
                            >
                                <Input
                                    value={data.slug}
                                    disabled={isSystem}
                                    onChange={(e) => {
                                        setSlugLocked(true);
                                        setData('slug', e.target.value);
                                    }}
                                />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="SEO" description="Blank fields fall back to the site defaults in Settings.">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Meta title" error={errors.meta_title} className="sm:col-span-2">
                                <Input value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} />
                            </Field>
                            <Field
                                label="Meta description"
                                error={errors.meta_description}
                                hint={`${data.meta_description.length}/500 characters`}
                                className="sm:col-span-2"
                            >
                                <Textarea rows={3} value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} />
                            </Field>
                            <Field label="Robots" error={errors.meta_robots} required>
                                <Select value={data.meta_robots} onChange={(e) => setData('meta_robots', e.target.value)}>
                                    {ROBOTS.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Canonical URL" error={errors.canonical_url} hint="Optional, full URL.">
                                <Input value={data.canonical_url} onChange={(e) => setData('canonical_url', e.target.value)} />
                            </Field>
                            <Field
                                label="Schema markup (JSON-LD)"
                                error={errors.schema_markup}
                                hint="Valid JSON. Rendered into the page head."
                                className="sm:col-span-2"
                            >
                                <Textarea
                                    rows={6}
                                    className="font-mono text-[12px]"
                                    value={data.schema_markup}
                                    onChange={(e) => setData('schema_markup', e.target.value)}
                                    placeholder='{"@context":"https://schema.org","@type":"WebPage"}'
                                />
                            </Field>
                        </div>
                    </Panel>
                </div>

                <div className="space-y-6">
                    <Panel title="Social image">
                        <MediaPickerField
                            label="OG image"
                            error={errors.og_image}
                            hint="JPG, PNG or WebP. Max 4 MB."
                            preview={preview}
                            value={typeof data.og_image === 'string' ? data.og_image : ''}
                            onChange={(url) => onOgChange(url)}
                        />
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
                        {processing ? 'Saving…' : isEdit ? 'Save page' : 'Create page'}
                    </Button>
                </div>
            </form>
        </>
    );
}

PageForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
