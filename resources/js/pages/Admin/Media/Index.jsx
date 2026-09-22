import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, ConfirmDialog, EmptyState, Field, Input, PageHeader, Panel, useConfirm } from '../../../components/admin/ui';

function FetchFromUrl() {
    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
        category: '',
        usage_location: '',
        alt_text: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/media/fetch', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <Panel title="Fetch from URL" description="Download a remote image straight into the library — useful for portfolio artwork.">
            <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                <Field label="Image URL" error={errors.url} required className="md:col-span-2">
                    <Input
                        value={data.url}
                        onChange={(e) => setData('url', e.target.value)}
                        placeholder="https://…/cover.jpg"
                    />
                </Field>
                <Field label="Category / service" error={errors.category} required>
                    <Input value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Rebranding" />
                </Field>
                <Field label="Usage location" error={errors.usage_location}>
                    <Input value={data.usage_location} onChange={(e) => setData('usage_location', e.target.value)} placeholder="Rebranding service page" />
                </Field>
                <Field label="Alt text" error={errors.alt_text} className="md:col-span-2">
                    <Input value={data.alt_text} onChange={(e) => setData('alt_text', e.target.value)} placeholder="Describe the image" />
                </Field>
                <div className="md:col-span-2">
                    <Button type="submit" disabled={processing}>{processing ? 'Fetching…' : 'Fetch into library'}</Button>
                </div>
            </form>
        </Panel>
    );
}

export default function MediaIndex({ media, categories = [] }) {
    const [rows, setRows] = useState(media);
    const [filter, setFilter] = useState('');
    const [request, confirm, cancel, run] = useConfirm();

    useEffect(() => {
        setRows(media);
    }, [media]);

    const visible = filter ? rows.filter((m) => m.category === filter) : rows;

    const askDelete = (medium) => {
        confirm({
            title: `Delete “${medium.filename}”?`,
            body: 'The file is removed from storage as well as the library. Pages using it will lose their image.',
            action: () => router.delete(`/admin/media/${medium.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title="Media — Marketorr Admin" />
            <PageHeader title="Media" subtitle={`${rows.length} files. Uploads, fetched artwork and every replacement live here.`}>
                <Button as="link" href="/admin/media/create">Upload media</Button>
            </PageHeader>

            <div className="grid gap-6">
                <FetchFromUrl />

                <Panel className="overflow-hidden">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]" htmlFor="media-filter">
                            Category
                        </label>
                        <select
                            id="media-filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="rounded-lg border border-[var(--field-line)] bg-transparent px-3 py-2 text-[13px] text-[var(--ink)]"
                        >
                            <option value="">All</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <span className="text-[12px] text-[var(--ink-faint)]">{visible.length} shown</span>
                    </div>

                    {visible.length === 0 ? (
                        <EmptyState>No media yet — upload the first file or fetch one from a URL.</EmptyState>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left text-[13px]">
                                <thead>
                                    <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                        <th className="pb-3 pr-4 font-bold">Preview</th>
                                        <th className="pb-3 pr-4 font-bold">Filename</th>
                                        <th className="pb-3 pr-4 font-bold">Category</th>
                                        <th className="pb-3 pr-4 font-bold">Usage</th>
                                        <th className="pb-3 pr-4 font-bold">Uploaded</th>
                                        <th className="pb-3 font-bold" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((medium) => (
                                        <tr key={medium.id} className="border-t border-[var(--line)]">
                                            <td className="py-3 pr-4">
                                                <img
                                                    src={medium.file_url}
                                                    alt=""
                                                    className="h-10 w-16 shrink-0 rounded object-cover"
                                                    loading="lazy"
                                                />
                                            </td>
                                            <td className="py-3 pr-4">
                                                <p className="max-w-[220px] truncate font-semibold text-[var(--ink)]" title={medium.filename}>
                                                    {medium.filename}
                                                </p>
                                                <p className="text-[12px] text-[var(--ink-faint)]">
                                                    {[medium.dimensions, medium.size].filter(Boolean).join(' · ') || medium.mime_type}
                                                </p>
                                            </td>
                                            <td className="py-3 pr-4"><Badge tone="published">{medium.category}</Badge></td>
                                            <td className="max-w-[220px] truncate py-3 pr-4 text-[var(--mute)]" title={medium.usage_location ?? ''}>
                                                {medium.usage_location ?? '—'}
                                            </td>
                                            <td className="py-3 pr-4 text-[var(--mute)]">{medium.created_at ?? '—'}</td>
                                            <td className="py-3 text-right whitespace-nowrap">
                                                <Link
                                                    href={`/admin/media/${medium.id}/edit`}
                                                    className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => askDelete(medium)}
                                                    className="ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </div>

            <ConfirmDialog
                open={!!request}
                title={request?.title ?? ''}
                body={request?.body}
                onConfirm={run}
                onCancel={cancel}
            />
        </>
    );
}

MediaIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
