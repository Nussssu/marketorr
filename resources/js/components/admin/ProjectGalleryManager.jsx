import { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';

const ICON_BUTTON = 'inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--field-line)] text-[12px] text-[var(--ink)] hover:bg-[var(--chip)] disabled:cursor-not-allowed disabled:opacity-40';

/** Show/hide switch for one gallery image. */
function VisibilitySwitch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            title={checked ? 'Shown on the project page — click to hide' : 'Hidden from the project page — click to show'}
            onClick={() => onChange(!checked)}
            className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
            style={{ background: checked ? 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' : 'var(--field-line)' }}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} aria-hidden />
        </button>
    );
}

/**
 * Sequential gallery manager for a project's dedicated page.
 *
 * The admin picks images one by one from the Media Library and the list order
 * is the display order — first row renders first on the public page. Each
 * row can be moved up or down, swapped for another image, shown or hidden on
 * the page, or removed.
 *
 * @param {{ values?: Array<{src: string, alt?: string, hidden?: boolean}>, onChange: (values: Array<{src: string, alt?: string, hidden?: boolean}>) => void, error?: string }} props
 */
export default function ProjectGalleryManager({ values = [], onChange, error }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    // The row being swapped for another image, or null when adding a new one.
    const [replacing, setReplacing] = useState(null);

    const moveTo = (index, target) => {
        if (target < 0 || target >= values.length || target === index) return;
        const next = [...values];
        const [image] = next.splice(index, 1);
        next.splice(target, 0, image);
        onChange(next);
    };

    const remove = (index) => {
        onChange(values.filter((_, i) => i !== index));
    };

    const update = (index, patch) => {
        onChange(values.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const openPicker = (index = null) => {
        setReplacing(index);
        setPickerOpen(true);
    };

    const handleSelect = (asset) => {
        if (replacing === null) {
            onChange([...values, { src: asset.file_url, alt: asset.alt_text || '', hidden: false }]);
        } else {
            update(replacing, { src: asset.file_url, alt: values[replacing]?.alt || asset.alt_text || '' });
        }
        setReplacing(null);
    };

    const shown = values.filter((image) => !image.hidden).length;

    return (
        <div className="space-y-3">
            {values.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--field-line)] px-4 py-6 text-center text-[12px] text-[var(--ink-faint)]">
                    No gallery images yet, the dedicated page falls back to its placeholders.
                    Use the button below to add the first image from the Media Library.
                </p>
            ) : (
                <>
                    <p className="text-[12px] text-[var(--ink-faint)]">
                        {values.length} image{values.length === 1 ? '' : 's'}, {shown} shown on the project page.
                    </p>
                    <ol className="space-y-2">
                        {values.map((image, index) => (
                            <li
                                key={`${image.src}-${index}`}
                                className={`flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-2.5 sm:flex-nowrap ${image.hidden ? 'opacity-60' : ''}`}
                            >
                                <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--chip)] text-[12px] font-bold text-[var(--ink)]"
                                    title={`Position ${index + 1}`}
                                >
                                    {index + 1}
                                </span>
                                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg)]">
                                    <img
                                        src={image.src}
                                        alt={image.alt || ''}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-mono text-[11px] text-[var(--mute)]" title={image.src}>
                                        {image.src}
                                    </span>
                                    <input
                                        value={image.alt ?? ''}
                                        onChange={(e) => update(index, { alt: e.target.value })}
                                        placeholder="Alt text (optional)"
                                        aria-label={`Alt text for image ${index + 1}`}
                                        className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-[12px] text-[var(--ink)] placeholder-[var(--placeholder)] focus:border-cyan-500 focus:outline-none"
                                    />
                                </span>
                                <span className="flex shrink-0 items-center gap-1.5">
                                    <VisibilitySwitch
                                        checked={!image.hidden}
                                        onChange={(visible) => update(index, { hidden: !visible })}
                                        label={`${image.hidden ? 'Show' : 'Hide'} image ${index + 1} on the project page`}
                                    />
                                    <button type="button" onClick={() => moveTo(index, index - 1)} disabled={index === 0} aria-label={`Move image ${index + 1} up`} className={ICON_BUTTON}>
                                        ↑
                                    </button>
                                    <button type="button" onClick={() => moveTo(index, index + 1)} disabled={index === values.length - 1} aria-label={`Move image ${index + 1} down`} className={ICON_BUTTON}>
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openPicker(index)}
                                        aria-label={`Replace image ${index + 1}`}
                                        title="Replace this image"
                                        className={ICON_BUTTON}
                                    >
                                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" />
                                            <path d="m13.5 6.5 4 4" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        aria-label={`Remove image ${index + 1}`}
                                        className="rounded-md border border-rose-900/40 bg-rose-950/20 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/30"
                                    >
                                        Remove
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ol>
                </>
            )}

            <div>
                <button
                    type="button"
                    onClick={() => openPicker(null)}
                    className="inline-flex items-center gap-2.5 rounded-lg border border-[var(--field-line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] shadow-sm transition-all hover:border-cyan-500/50 hover:bg-[var(--chip)] hover:text-[var(--ink-strong)]"
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
                onClose={() => {
                    setPickerOpen(false);
                    setReplacing(null);
                }}
                onSelect={handleSelect}
                filterType="image"
                title={replacing === null ? 'Add gallery image' : `Replace image ${replacing + 1}`}
            />
        </div>
    );
}
