import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Helper to determine whether an asset is an image based on mime_type or file extension.
 */
export function isImageAsset(item) {
    if (!item) return false;
    const mime = (item.mime_type || '').toLowerCase();
    if (mime.startsWith('image/')) return true;
    const url = (item.file_url || item.filename || '').toLowerCase();
    return /\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(url);
}

/**
 * Returns a clean file extension or format badge (e.g. PDF, DOCX, SVG).
 */
export function getFileExtension(filename = '') {
    const ext = filename.split('.').pop();
    return ext ? ext.toUpperCase() : 'FILE';
}

/**
 * Centralized Media Library Modal Picker.
 *
 * Supports browsing, live search, category filtering, file type filtering,
 * drag-and-drop uploading, asset inspection, deletion, and selection.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSelect: (asset: { id: number, file_url: string, filename: string, alt_text?: string, mime_type?: string }) => void,
 *   title?: string,
 *   filterType?: 'all' | 'image' | 'document',
 *   currentUrl?: string
 * }} props
 */
export default function MediaPickerModal({
    open,
    onClose,
    onSelect,
    title = 'Media Library',
    filterType = 'all',
    currentUrl = '',
}) {
    const [media, setMedia] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'upload'
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [typeFilter, setTypeFilter] = useState(filterType); // 'all' | 'image' | 'document'

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadCategory, setUploadCategory] = useState('General');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch media list
    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await fetch('/admin/media?json=1', {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const json = await res.json();
                setMedia(json.media || []);
                setCategories(json.categories || []);
            }
        } catch (e) {
            console.error('Failed to load media items', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchMedia();
            setActiveTab('browse');
            setSearch('');
            setSelectedCategory('');
        }
    }, [open]);

    // Handle escape key and body overflow
    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    // Filtered media items
    const filteredItems = useMemo(() => {
        return media.filter((item) => {
            if (selectedCategory && item.category !== selectedCategory) {
                return false;
            }

            if (typeFilter === 'image' && !isImageAsset(item)) {
                return false;
            }

            if (typeFilter === 'document' && isImageAsset(item)) {
                return false;
            }

            if (search.trim()) {
                const q = search.toLowerCase();
                const matchFilename = (item.filename || '').toLowerCase().includes(q);
                const matchAlt = (item.alt_text || '').toLowerCase().includes(q);
                const matchCat = (item.category || '').toLowerCase().includes(q);
                if (!matchFilename && !matchAlt && !matchCat) return false;
            }

            return true;
        });
    }, [media, selectedCategory, typeFilter, search]);

    // Handle single file upload
    const handleFileUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        setUploadError('');

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', uploadCategory || 'General');

        try {
            const res = await fetch('/admin/media', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            const json = await res.json();
            if (res.ok && json.medium) {
                setMedia((prev) => [json.medium, ...prev]);
                setSelectedAsset(json.medium);
                setActiveTab('browse');
            } else {
                setUploadError(json.message || 'Failed to upload asset. Please verify file type and size.');
            }
        } catch (err) {
            setUploadError('Network error while uploading asset.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle asset deletion
    const handleDelete = async (id, e) => {
        e?.stopPropagation();
        if (!window.confirm('Delete this asset permanently from the media library?')) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(`/admin/media/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (res.ok) {
                setMedia((prev) => prev.filter((m) => m.id !== id));
                if (selectedAsset?.id === id) {
                    setSelectedAsset(null);
                }
            }
        } catch (err) {
            alert('Failed to delete asset.');
        }
    };

    // Handle selection confirmation
    const handleConfirmSelect = () => {
        if (!selectedAsset) return;
        onSelect(selectedAsset);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-800 bg-[#0d121f] text-slate-200 shadow-2xl overflow-hidden">
                {/* Header Bar */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-6 bg-[#0a0e17]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-display text-[16px] font-bold text-white tracking-tight">{title}</h2>
                                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                                    {media.length} items
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Header Tabs & Close */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg bg-slate-900/90 p-1 border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setActiveTab('browse')}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                    activeTab === 'browse'
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Browse Assets
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                    activeTab === 'upload'
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                + Upload New
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                            aria-label="Close media picker"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Sub-toolbar: Search & Category filters (Browse mode) */}
                {activeTab === 'browse' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0a0e17]/60 px-6 py-2.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search filename or alt..."
                                    className="w-56 sm:w-64 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-200"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* Type Filter Pills */}
                            <div className="flex items-center rounded-md bg-slate-900 p-0.5 border border-slate-800/80 text-[11px]">
                                {['all', 'image', 'document'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTypeFilter(t)}
                                        className={`rounded px-2.5 py-1 capitalize font-medium transition-all ${
                                            typeFilter === t
                                                ? 'bg-slate-800 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {t === 'all' ? 'All Types' : t === 'image' ? 'Images' : 'Docs & PDFs'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <span className="text-xs text-slate-400">
                            {filteredItems.length} matching {filteredItems.length === 1 ? 'asset' : 'assets'}
                        </span>
                    </div>
                )}

                {/* Main Content Body */}
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {activeTab === 'upload' ? (
                        /* Upload Screen */
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
                            <div className="w-full max-w-xl space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Assign Category (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadCategory}
                                        onChange={(e) => setUploadCategory(e.target.value)}
                                        placeholder="e.g. Projects, Branding, Pages, Documents"
                                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    />
                                </div>

                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOver(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) handleFileUpload(file);
                                    }}
                                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                                        dragOver
                                            ? 'border-cyan-400 bg-cyan-500/10'
                                            : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf,.doc,.docx,.txt,.zip"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file);
                                        }}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />

                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400 shadow-inner">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>

                                    <h3 className="font-display text-base font-bold text-white">
                                        Drag & drop your files here
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-400">
                                        or <span className="font-semibold text-cyan-400 underline">browse files</span> from your computer
                                    </p>
                                    <p className="mt-3 text-[11px] text-slate-500">
                                        Supports JPG, PNG, WebP, SVG, GIF, PDF, DOCX (up to 20MB)
                                    </p>

                                    {uploading && (
                                        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-cyan-400">
                                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                                            Uploading asset to library…
                                        </div>
                                    )}

                                    {uploadError && (
                                        <p className="mt-4 text-xs font-medium text-rose-400">{uploadError}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Browse Grid + Inspector Sidebar */
                        <>
                            {/* Grid Area */}
                            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                                {loading ? (
                                    <div className="flex h-64 items-center justify-center text-xs text-slate-400 gap-2">
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                                        Loading library assets…
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="flex h-64 flex-col items-center justify-center text-center">
                                        <p className="text-sm font-semibold text-slate-400">No assets found</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Try adjusting your filters or upload a new asset.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('upload')}
                                            className="mt-4 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
                                        >
                                            + Upload an Asset
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                                        {filteredItems.map((item) => {
                                            const isSelected = selectedAsset?.id === item.id;
                                            const isCurrent = currentUrl && (item.file_url === currentUrl || currentUrl.endsWith(item.filename));
                                            const isImg = isImageAsset(item);

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setSelectedAsset(item)}
                                                    className={`group relative flex flex-col rounded-xl border p-2 text-left cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(27,226,235,0.15)] ring-1 ring-cyan-400'
                                                            : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/90'
                                                    }`}
                                                >
                                                    {/* Thumbnail preview */}
                                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800/50">
                                                        {isImg ? (
                                                            <img
                                                                src={item.file_url}
                                                                alt={item.alt_text || item.filename}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                                                                <svg className="h-8 w-8 mb-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                                                                    {getFileExtension(item.filename)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Current in-use badge */}
                                                        {isCurrent && (
                                                            <span className="absolute top-1.5 left-1.5 rounded bg-indigo-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                                                                In Use
                                                            </span>
                                                        )}

                                                        {/* Selected checkmark */}
                                                        {isSelected && (
                                                            <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow">
                                                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Meta details */}
                                                    <div className="mt-2 min-w-0">
                                                        <p className="truncate text-xs font-semibold text-slate-200" title={item.filename}>
                                                            {item.filename}
                                                        </p>
                                                        <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
                                                            <span className="truncate">{item.category || 'General'}</span>
                                                            <span>{item.size}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Inspector Panel on Right */}
                            {selectedAsset && (
                                <div className="w-72 sm:w-80 shrink-0 border-l border-slate-800/80 bg-[#0a0e17] p-5 flex flex-col justify-between overflow-y-auto">
                                    <div className="space-y-4">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                                            {isImageAsset(selectedAsset) ? (
                                                <img
                                                    src={selectedAsset.file_url}
                                                    alt={selectedAsset.alt_text || selectedAsset.filename}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <svg className="h-12 w-12 text-slate-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-xs font-bold text-slate-300">
                                                        {getFileExtension(selectedAsset.filename)} DOCUMENT
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="break-all text-xs font-bold text-white">
                                                {selectedAsset.filename}
                                            </h4>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                Category: <span className="text-slate-300">{selectedAsset.category || 'General'}</span>
                                            </p>
                                        </div>

                                        <dl className="grid grid-cols-2 gap-2 rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-[11px]">
                                            <div>
                                                <dt className="text-slate-500">File size</dt>
                                                <dd className="font-semibold text-slate-300">{selectedAsset.size || '—'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Dimensions</dt>
                                                <dd className="font-semibold text-slate-300">{selectedAsset.dimensions || '—'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Type</dt>
                                                <dd className="font-semibold text-slate-300 truncate" title={selectedAsset.mime_type}>
                                                    {selectedAsset.mime_type || getFileExtension(selectedAsset.filename)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Uploaded</dt>
                                                <dd className="font-semibold text-slate-300 truncate">{selectedAsset.created_at || '—'}</dd>
                                            </div>
                                        </dl>

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={selectedAsset.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 py-1.5 text-center text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                            >
                                                Open full ↗
                                            </a>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(selectedAsset.id, e)}
                                                className="rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/30 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-slate-800">
                                        <button
                                            type="button"
                                            onClick={handleConfirmSelect}
                                            className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:opacity-95 transition-opacity"
                                        >
                                            Choose this Asset
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Bar */}
                <div className="flex items-center justify-between border-t border-slate-800 bg-[#090d16] px-6 py-3">
                    <div className="text-xs text-slate-400">
                        {selectedAsset ? (
                            <span>Selected: <strong className="text-slate-200">{selectedAsset.filename}</strong></span>
                        ) : (
                            <span>Select an asset to view details or insert</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!selectedAsset}
                            onClick={handleConfirmSelect}
                            className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Insert Asset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
