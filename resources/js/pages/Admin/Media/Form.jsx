import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, Field, Input, PageHeader, Panel } from '../../../components/admin/ui';

export default function MediaForm({ medium }) {
    const isEdit = Boolean(medium);
    const [preview, setPreview] = useState(medium?.file_url ?? null);
    const [isDragging, setIsDragging] = useState(false);
    const dragDepth = useRef(0);

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

    useEffect(() => () => {
        if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    }, [preview]);

    const onDragEnter = (event) => {
        event.preventDefault();
        dragDepth.current += 1;
        setIsDragging(true);
    };

    const onDragLeave = (event) => {
        event.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsDragging(false);
    };

    const onDrop = (event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setIsDragging(false);
        onFileChange(event.dataTransfer.files?.[0] ?? null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(isEdit ? `/admin/media/${medium.id}` : '/admin/media', { forceFormData: true });
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'Upload'} media | Marketorr Admin`} />
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
                                hint={isEdit ? 'Leave empty to keep the current file: choosing one replaces it.' : 'JPG, PNG, WebP or GIF, up to 12 MB.'}
                                className="sm:col-span-2"
                            >
                                <label
                                    onDragEnter={onDragEnter}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        event.dataTransfer.dropEffect = 'copy';
                                    }}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    className={`group flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-all ${
                                        isDragging
                                            ? 'border-[#507AF4] bg-[#507AF4]/10 shadow-[0_0_0_1px_#507AF4]'
                                            : 'border-[var(--field-line)] bg-[var(--bg)] hover:border-[#507AF4]/70 hover:bg-[var(--chip)]'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                                        className="sr-only"
                                    />
                                    <span
                                        className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform group-hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg,#891FFB,#507AF4,#1BE2EB)' }}
                                        aria-hidden
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
                                        </svg>
                                    </span>
                                    <span className="mt-4 font-display text-[14px] font-bold text-[var(--ink-strong)]">
                                        {isDragging ? 'Drop image here' : 'Drag and drop an image'}
                                    </span>
                                    <span className="mt-1 text-[12px] text-[var(--mute)]">or click to browse</span>
                                    {data.file && (
                                        <span className="mt-3 max-w-full truncate rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--ink)]">
                                            {data.file.name}
                                        </span>
                                    )}
                                </label>
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
                                    <dd className="text-[var(--ink)]">{[medium.dimensions, medium.size].filter(Boolean).join(' · ') || '-'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[var(--ink-faint)]">Uploaded</dt>
                                    <dd className="text-[var(--ink)]">{medium.created_at ?? '-'}</dd>
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
