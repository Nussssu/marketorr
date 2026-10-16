import { useState } from 'react';
import MediaPickerModal, { isImageAsset, getFileExtension } from './MediaPickerModal';

/**
 * Reusable form control that replaces raw file inputs with a centralized
 * "Choose from Media Library" picker button and preview.
 *
 * @param {{
 *   value?: string,
 *   onChange: (url: string, asset?: object) => void,
 *   preview?: string,
 *   label?: string,
 *   error?: string,
 *   hint?: string,
 *   required?: boolean,
 *   filterType?: 'all' | 'image' | 'document',
 *   buttonText?: string,
 *   className?: string
 * }} props
 */
export default function MediaPickerField({
    value = '',
    onChange,
    preview = '',
    label,
    error,
    hint,
    required = false,
    filterType = 'image',
    buttonText = 'Choose from Media Library',
    className = '',
}) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const activePreview = value || preview;
    const isImg = isImageAsset({ file_url: activePreview });

    const handleSelect = (asset) => {
        onChange(asset.file_url, asset);
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                        {label}
                        {required && <span className="text-[#ff6b6b]"> *</span>}
                    </span>
                </div>
            )}

            {activePreview ? (
                <div className="relative flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-3">
                    {/* Preview Box */}
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center">
                        {isImg ? (
                            <img
                                src={activePreview}
                                alt="Selected asset preview"
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-[var(--ink-faint)]">
                                <svg className="h-6 w-6 text-[var(--ink-faint)] mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-[9px] font-bold text-[var(--ink-faint)]">
                                    {getFileExtension(activePreview)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Path & Actions */}
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-mono text-[var(--mute)]" title={activePreview}>
                            {activePreview}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPickerOpen(true)}
                                className="rounded-md border border-[var(--field-line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] hover:bg-[var(--chip)] hover:text-[var(--ink-strong)] transition-colors"
                            >
                                Replace Asset
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-md border border-rose-900/40 bg-rose-950/20 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/30 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty state: Choose from Media Library */
                <div className="flex flex-col items-start gap-2">
                    <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="inline-flex items-center gap-2.5 rounded-lg border border-[var(--field-line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:border-cyan-500/50 hover:bg-[var(--chip)] hover:text-[var(--ink-strong)] transition-all shadow-sm group"
                    >
                        <svg className="h-4 w-4 text-cyan-400 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{buttonText}</span>
                    </button>
                </div>
            )}

            {hint && !error && <span className="mt-1 block text-[11px] text-[var(--ink-faint)]">{hint}</span>}
            {error && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{error}</span>}

            {/* Modal Picker */}
            <MediaPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleSelect}
                filterType={filterType}
                currentUrl={activePreview}
            />
        </div>
    );
}
