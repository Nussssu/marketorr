import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, Field, Input, PageHeader, Panel } from '../../../components/admin/ui';

export default function MediaForm({ medium }) {
    const isEdit = Boolean(medium);
    const [preview, setPreview] = useState(medium?.file_url ?? null);

    const { data, setData, post, processing, errors } = useForm({
        // Spoofed so the multipart upload still reaches the PUT route on update.
        _method: isEdit ? 'put' : 'post',
        file: null,
        category: medium?.category ?? '',
        usage_location: medium?.usage_location ?? '',
        alt_text: medium?.alt_text ?? '',
    });

    const onFileChange = (file) => {
        setData('file', file);
        setPreview(file ? URL.createObjectURL(file) : medium?.file_url ?? null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(isEdit ? `/admin/media/${medium.id}` : '/admin/media', { forceFormData: true });
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'Upload'} media — Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${medium.filename}` : 'Upload media'}
                subtitle={isEdit ? 'Replace the file or tidy up its catalogue entry.' : 'Files land in the shared library with their catalogue entry.'}
            >
                <Button as="link" href="/admin/media" variant="secondary">Cancel</Button>
            </PageHeader>

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="File">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Image file"
                                error={errors.file}
                                required={!isEdit}
                                hint={isEdit ? 'Leave empty to keep the current file — choosing one replaces it.' : 'JPG, PNG, WebP or GIF, up to 12 MB.'}
                                className="sm:col-span-2"
                            >
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                                    className="w-full text-[13px] text-[var(--mute)] file:mr-3 file:rounded-lg file:border file:border-[var(--field-line)] file:bg-[var(--chip)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-[var(--ink)]"
                                />
                            </Field>
                            {preview && (
                                <div className="sm:col-span-2">
                                    <img src={preview} alt="" className="aspect-[16/10] w-full max-w-sm rounded-lg border border-[var(--line)] object-cover" />
                                </div>
                            )}
                        </div>
                    </Panel>

                    <Panel title="Catalogue entry">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Category / service" error={errors.category} required>
                                <Input value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Rebranding" />
                            </Field>
                            <Field label="Usage location" error={errors.usage_location}>
                                <Input value={data.usage_location} onChange={(e) => setData('usage_location', e.target.value)} placeholder="Rebranding service page" />
                            </Field>
                            <Field label="Alt text" error={errors.alt_text} className="sm:col-span-2">
                                <Input value={data.alt_text} onChange={(e) => setData('alt_text', e.target.value)} placeholder="Describe the image" />
                            </Field>
                        </div>
                    </Panel>
                </div>

                <div className="space-y-6">
                    {isEdit && (
                        <Panel title="Details">
                            <dl className="space-y-3 text-[13px]">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[var(--ink-faint)]">Filename</dt>
                                    <dd className="truncate text-right text-[var(--ink)]">{medium.filename}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[var(--ink-faint)]">Size</dt>
                                    <dd className="text-[var(--ink)]">{[medium.dimensions, medium.size].filter(Boolean).join(' · ') || '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[var(--ink-faint)]">Uploaded</dt>
                                    <dd className="text-[var(--ink)]">{medium.created_at ?? '—'}</dd>
                                </div>
                            </dl>
                        </Panel>
                    )}
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Upload media'}
                    </Button>
                </div>
            </form>
        </>
    );
}

MediaForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
