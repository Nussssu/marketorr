import { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';

/**
 * Sequential gallery manager for a project's dedicated page.
 *
 * The admin picks images one by one from the Media Library and the list order
 * is the display order — first row renders first on the public page. Rows can
 * be moved up/down or removed; nothing else on the page is affected.
 *
 * @param {{ values?: Array<{src: string, alt?: string}>, onChange: (values: Array<{src: string, alt?: string}>) => void, error?: string }} props
 */
export default function ProjectGalleryManager({ values = [], onChange, error }) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const move = (index, delta) => {
        const next = [...values];
        const target = index + delta;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    const remove = (index) => {
        onChange(values.filter((_, i) => i !== index));
    };

    const updateAlt = (index, alt) => {
        onChange(values.map((row, i) => (i === index ? { ...row, alt } : row)));
    };

    const handleSelect = (asset) => {
        onChange([...values, { src: asset.file_url, alt: asset.alt_text || '' }]);
    };

    return (
        <div className="space-y-3">
            {values.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--field-line)] px-4 py-6 text-center text-[12px] text-[var(--ink-faint)]">
                    No gallery images yet, the dedicated page falls back to its placeholders.
                    Use the button below to add the first image from the Media Library.
                </p>
            ) : (
                <ol className="space-y-2">
                    {values.map((image, index) => (
                        <li
                            key={`${image.src}-${index}`}
                            className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5"
                        >
                            <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[12px] font-bold text-slate-200"
                                title={`Position ${index + 1}`}
                            >
                                {index + 1}
                            </span>
                            <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                                <img
                                    src={image.src}
                                    alt={image.alt || ''}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-mono text-[11px] text-slate-300" title={image.src}>
                                    {image.src}
                                </span>
                                <input
                                    value={image.alt ?? ''}
                                    onChange={(e) => updateAlt(index, e.target.value)}
                                    placeholder="Alt text (optional)"
                                    aria-label={`Alt text for image ${index + 1}`}
                                    className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[12px] text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                                />
                            </span>
                            <span className="flex shrink-0 flex-col gap-1">
                                <span className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => move(index, -1)}
                                        disabled={index === 0}
                                        aria-label={`Move image ${index + 1} up`}
                                        className="rounded-md border border-slate-700 px-2 py-0.5 text-[12px] text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(index, 1)}
                                        disabled={index === values.length - 1}
                                        aria-label={`Move image ${index + 1} down`}
                                        className="rounded-md border border-slate-700 px-2 py-0.5 text-[12px] text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ↓
                                    </button>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    aria-label={`Remove image ${index + 1}`}
                                    className="rounded-md border border-rose-900/40 bg-rose-950/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/30"
                                >
                                    Remove
                                </button>
                            </span>
                        </li>
                    ))}
                </ol>
            )}

            <div>
                <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-2.5 text-xs font-semibold text-slate-200 shadow-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
                >
                    <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{values.length === 0 ? 'Add image from Media Library' : 'Add another image'}</span>
                </button>
            </div>

            {error && <span className="block text-[12px] text-[#ff6b6b]">{error}</span>}

            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleSelect}
                filterType="image"
                title="Add gallery image"
            />
        </div>
    );
}
