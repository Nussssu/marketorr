import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, ConfirmDialog, useConfirm } from '../../../components/admin/ui';

const FILTERS = [['all', 'All'], ['images', 'Images'], ['videos', 'Videos'], ['gif', 'GIF'], ['documents', 'Documents']];
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,.pdf,.doc,.docx,.txt,.zip';

/** A file's kind, as the library groups and labels it. */
function kindOf(medium) {
    const mime = String(medium.mime_type ?? '');
    if (mime === 'image/gif') return 'GIF';
    if (mime.startsWith('image/') || medium.is_image) return 'Image';
    if (mime.startsWith('video/')) return 'Video';

    return 'Document';
}
const STAT_CARDS = [['total_files', 'Total Files', 'files'], ['storage_used', 'Storage Used', 'storage'], ['images', 'Images', 'images'], ['used_in_products', 'Used in Products', 'products']];

function Icon({ name, className = 'h-5 w-5' }) {
    const paths = {
        files: <><path d="M4 7.5h16v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-11Z" /><path d="M8 7.5V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8v1.7" /></>,
        storage: <><ellipse cx="12" cy="6" rx="7.5" ry="3" /><path d="M4.5 6v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6M4.5 12v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" /></>,
        images: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="m5 17 4.2-4.2a1.5 1.5 0 0 1 2.1 0l2 2 1.4-1.4a1.5 1.5 0 0 1 2.1 0L20 16.6" /></>,
        products: <><path d="m4 8 8-4 8 4-8 4-8-4Z" /><path d="m4 8 8 4 8-4v8l-8 4-8-4V8Z" /><path d="M12 12v8" /></>,
        upload: <><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></>,
        search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
        copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
        file: <><path d="M6 3.5h8l4 4V20H6V3.5Z" /><path d="M14 3.5V8h4" /></>,
        eye: <><path d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
        close: <path d="m6 6 12 12M18 6 6 18" />,
    };

    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>{paths[name]}</svg>;
}

/**
 * Drop or choose files and they upload straight away — no category step.
 *
 * @param {{ fileInput: { current: HTMLInputElement|null } }} props
 */
function UploadArea({ fileInput }) {
    const dragDepth = useRef(0);
    const [dragging, setDragging] = useState(false);
    const { data, setData, post, processing, progress, errors, reset, clearErrors } = useForm({ files: [] });
    const [pending, setPending] = useState(false);

    const chooseFiles = (incoming) => {
        const files = Array.from(incoming ?? []).slice(0, 20);
        if (files.length === 0 || processing) return;
        clearErrors();
        setData('files', files);
        setPending(true);
    };

    // Upload as soon as the chosen files are in the form.
    useEffect(() => {
        if (!pending) return;
        setPending(false);
        post('/admin/media', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('files');
                if (fileInput.current) fileInput.current.value = '';
            },
        });
    }, [pending]);

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
                role="button"
                tabIndex={0}
                onClick={() => fileInput.current?.click()}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInput.current?.click(); }}
                onDragEnter={(event) => { event.preventDefault(); dragDepth.current += 1; setDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
                onDragLeave={(event) => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (dragDepth.current === 0) setDragging(false); }}
                onDrop={(event) => { event.preventDefault(); dragDepth.current = 0; setDragging(false); chooseFiles(event.dataTransfer.files); }}
                className={`m-4 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center outline-none transition-all sm:m-5 ${dragging ? 'border-cyan-500 bg-cyan-50 shadow-[0_0_0_4px_rgba(6,182,212,0.08)]' : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50 focus:border-blue-500'}`}
            >
                <input ref={fileInput} type="file" multiple accept={ACCEPT} onChange={(event) => chooseFiles(event.target.files)} className="sr-only" />
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200"><Icon name="upload" className="h-7 w-7" /></span>
                <h2 className="mt-5 text-lg font-bold text-slate-900">{dragging ? 'Drop files to upload' : 'Drag & drop media here'}</h2>
                <p className="mt-1 text-sm text-slate-500">or click to browse your device · up to 20 files, 20 MB each</p>
                <span className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">Choose files</span>
            </div>

            {(data.files.length > 0 || Object.keys(errors).length > 0) && (
                <div className="border-t border-slate-200 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900">
                            {processing ? `Uploading ${data.files.length} file${data.files.length === 1 ? '' : 's'}… ${progress?.percentage ?? 0}%` : `${data.files.length} file${data.files.length === 1 ? '' : 's'}`}
                        </p>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {data.files.map((file) => (
                            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm"><Icon name="file" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800" title={file.name}>{file.name}</p><p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div></div>
                                {processing && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all" style={{ width: `${progress?.percentage ?? 0}%` }} /></div>}
                            </div>
                        ))}
                    </div>
                    {Object.values(errors).map((error) => <p key={error} className="mt-2 text-xs text-rose-600">{error}</p>)}
                </div>
            )}
        </section>
    );
}

function MediaPreview({ medium, onClose, onDelete }) {
    const [renaming, setRenaming] = useState(false);
    const [filename, setFilename] = useState(medium.filename);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const closeOnEscape = (event) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    const copyUrl = async () => {
        const url = new URL(medium.file_url, window.location.origin).href;
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    const rename = (event) => {
        event.preventDefault();
        router.put(`/admin/media/${medium.id}`, { filename, category: medium.category, usage_location: medium.usage_location ?? '', alt_text: medium.alt_text ?? '' }, { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Preview ${medium.filename}`}>
            <button type="button" className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={onClose} aria-label="Close preview" />
            <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
                <div className="flex min-h-72 items-center justify-center bg-slate-100 p-5">
                    {medium.is_image ? <img src={medium.file_url} alt={medium.alt_text || medium.filename} className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-sm" /> : <div className="text-center text-slate-400"><Icon name="file" className="mx-auto h-20 w-20" /><p className="mt-3 font-bold">Document preview unavailable</p></div>}
                </div>
                <aside className="overflow-y-auto border-l border-slate-200 p-6">
                    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Media details</p><h2 className="mt-1 break-all text-lg font-bold text-slate-900">{medium.filename}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Icon name="close" /></button></div>
                    <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div><dt className="text-xs text-slate-500">Size</dt><dd className="mt-1 font-semibold text-slate-800">{medium.size || '—'}</dd></div><div><dt className="text-xs text-slate-500">Dimensions</dt><dd className="mt-1 font-semibold text-slate-800">{medium.dimensions || '—'}</dd></div><div><dt className="text-xs text-slate-500">Collection</dt><dd className="mt-1 font-semibold text-slate-800">{medium.category}</dd></div><div><dt className="text-xs text-slate-500">Uploaded</dt><dd className="mt-1 font-semibold text-slate-800">{medium.created_at?.slice(0, 10) || '—'}</dd></div>
                    </dl>
                    <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Used in</p>{medium.usage_labels.length > 0 ? <ul className="mt-2 space-y-1 text-sm text-slate-700">{medium.usage_labels.map((label) => <li key={label}>• {label}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">Not currently linked to CMS content.</p>}</div>
                    {renaming && <form onSubmit={rename} className="mt-5"><label className="text-xs font-bold text-slate-700" htmlFor="rename-media">Display filename</label><div className="mt-2 flex gap-2"><input id="rename-media" value={filename} onChange={(event) => setFilename(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500" /><button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Save</button></div></form>}
                    <div className="mt-6 grid gap-2"><button type="button" onClick={copyUrl} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><Icon name="copy" className="h-4 w-4" />{copied ? 'URL copied' : 'Copy URL'}</button><button type="button" onClick={() => setRenaming((value) => !value)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Rename</button><button type="button" onClick={() => onDelete(medium)} className="rounded-lg border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50">Delete media</button></div>
                </aside>
            </div>
        </div>
    );
}

export default function MediaIndex({ media, filters = {}, stats = {} }) {
    const items = media?.data ?? [];
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [activeFilter, setActiveFilter] = useState(filters.type ?? 'all');
    const fileInput = useRef(null);
    const [sort, setSort] = useState(filters.sort ?? 'newest');
    const firstSearch = useRef(true);
    const [request, confirm, cancel, run] = useConfirm();

    const visit = (next = {}) => router.get('/admin/media', { type: next.type ?? activeFilter, search: next.search ?? search, sort: next.sort ?? sort }, { preserveState: true, preserveScroll: true, replace: true });

    useEffect(() => {
        if (firstSearch.current) { firstSearch.current = false; return undefined; }
        const timeout = window.setTimeout(() => visit({ search }), 400);
        return () => window.clearTimeout(timeout);
    }, [search]);

    const askDelete = (medium) => confirm({
        title: `Delete “${medium.filename}”?`,
        body: medium.usage_count > 0 ? `This file is currently used in ${medium.usage_count} CMS location(s). Deleting it will leave those locations without a working asset.` : 'The file will be permanently removed from storage and the media library.',
        action: () => router.delete(`/admin/media/${medium.id}`, { preserveScroll: true, onSuccess: () => setSelected(null) }),
    });

    const chooseFilter = (type) => { setActiveFilter(type); visit({ type }); };
    const chooseSort = (value) => { setSort(value); visit({ sort: value }); };

    return (
        <>
            <Head title="Media Library | Marketorr Admin" />
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--ink-strong)]">Media Library</h1><p className="mt-1 text-[13px] text-[var(--mute)]">Upload, organize and reuse images, videos, GIFs and documents.</p></div><Button type="button" onClick={() => fileInput.current?.click()}>Upload media</Button></div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STAT_CARDS.map(([key, label, icon]) => <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon name={icon} /></span></div><p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{stats[key] ?? 0}</p></article>)}
            </div>

            <div id="media-upload-zone" className="mt-6"><UploadArea fileInput={fileInput} /></div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">{FILTERS.map(([value, label]) => <button key={value} type="button" onClick={() => chooseFilter(value)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition ${activeFilter === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{label}</button>)}</div>
                    <div className="flex flex-col gap-2 sm:flex-row"><label className="relative block sm:w-72"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" className="h-4 w-4" /></span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media…" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><select value={sort} onChange={(event) => chooseSort(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="largest">Largest first</option><option value="smallest">Smallest first</option></select></div>
                </div></div>

                <div className="p-4 sm:p-5">
                    {items.length === 0 ? <div className="py-16 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Icon name="images" className="h-7 w-7" /></span><h2 className="mt-4 font-bold text-slate-900">No media found</h2><p className="mt-1 text-sm text-slate-500">Try another filter or upload a new asset.</p></div> : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">{items.map((medium) => (
                            <article key={medium.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
                                <button type="button" onClick={() => setSelected(medium)} className="relative block aspect-square w-full overflow-hidden bg-slate-100 text-left">{medium.is_image ? <img src={medium.file_url} alt={medium.alt_text || medium.filename} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : kindOf(medium) === 'Video' ? <video src={medium.file_url} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <span className="flex h-full flex-col items-center justify-center text-slate-400"><Icon name="file" className="h-12 w-12" /><span className="mt-2 text-xs font-bold">{medium.filename.split('.').pop()?.toUpperCase()}</span></span>}<span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/30 group-hover:opacity-100"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg"><Icon name="eye" /></span></span>{medium.usage_count > 0 && <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow">In use · {medium.usage_count}</span>}</button>
                                <div className="p-3"><p className="truncate text-xs font-bold text-slate-800" title={medium.filename}>{medium.filename}</p><div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500"><span className="truncate">{kindOf(medium)}</span><span className="shrink-0">{medium.size || '—'}</span></div></div>
                            </article>
                        ))}</div>
                    )}
                    {media?.last_page > 1 && <nav className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5" aria-label="Media pagination">{media.prev_page_url ? <Link href={media.prev_page_url} preserveScroll className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Previous</Link> : <span />}<span className="text-xs font-medium text-slate-500">Page {media.current_page} of {media.last_page}</span>{media.next_page_url ? <Link href={media.next_page_url} preserveScroll className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Next</Link> : <span />}</nav>}
                </div>
            </section>

            {selected && <MediaPreview medium={selected} onClose={() => setSelected(null)} onDelete={askDelete} />}
            <ConfirmDialog open={!!request} title={request?.title ?? ''} body={request?.body} onConfirm={run} onCancel={cancel} />
        </>
    );
}

MediaIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
