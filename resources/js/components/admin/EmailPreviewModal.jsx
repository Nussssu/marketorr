import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui';

export function getFormattedDate() {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date());
}

/**
 * Asks the server to render the editor's unsaved subject and widgets into
 * the real email layout, with sample values, so the preview matches what is
 * actually sent.
 */
async function fetchPreview(templateId, draft, signal) {
    // Laravel sets the XSRF-TOKEN cookie on every response and accepts it back as a header.
    const xsrfToken = decodeURIComponent(document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
    const res = await fetch(`/admin/email-templates/${templateId}/preview`, {
        method: 'POST',
        signal,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': xsrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ subject: draft.subject, blocks: draft.blocks }),
    });

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || 'The preview could not be rendered.');
    }

    return res.json();
}

/**
 * Desktop & mobile mail-client frame around the server-rendered email.
 */
export default function EmailPreviewModal({ open, template, draft, onClose }) {
    const { props } = usePage();
    const rawSiteName = props?.settings?.siteName || 'Marketorr';

    const [device, setDevice] = useState('desktop');
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open || !template || !draft) return undefined;

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetchPreview(template.id, draft, controller.signal)
            .then((result) => setPreview(result))
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [open, template, draft]);

    const isNotification = template?.key?.startsWith('admin');
    const mockFrom = `${rawSiteName} <notifications@marketorr.com>`;
    const mockTo = isNotification ? 'admin@marketorr.com' : 'recipient@example.com';
    const formattedDate = useMemo(() => getFormattedDate(), []);

    if (!open || !template) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in"
            aria-labelledby="preview-modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop click to close */}
            <div
                className="fixed inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Email Client Window Frame */}
            <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-700/70 bg-[#0f172a] shadow-2xl overflow-hidden z-10">
                {/* Window Chrome Titlebar */}
                <header className="flex items-center justify-between border-b border-slate-800 bg-[#0b1120] px-5 py-3.5 select-none">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            title="Close preview"
                            className="h-3 w-3 rounded-full bg-[#ff5f56] transition-opacity hover:opacity-80 focus:outline-none"
                        />
                        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                        <span className="ml-3 hidden font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:inline">
                            Mail Client · {template.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border border-slate-700/80 bg-slate-800/80 p-0.5 text-[11px] font-bold uppercase tracking-[0.08em]">
                            {['desktop', 'mobile'].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setDevice(mode)}
                                    className={`rounded-md px-3 py-1 capitalize transition-all ${
                                        device === mode ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close modal"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </header>

                {/* Message headers */}
                <div className="border-b border-slate-800 bg-[#0f172a] px-6 py-4 text-slate-200">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 id="preview-modal-title" className="text-[16px] font-bold leading-snug tracking-tight text-white">
                            {preview?.subject || (loading ? 'Rendering…' : '(No Subject)')}
                        </h3>
                        <span className="font-mono text-[12px] text-slate-400">{formattedDate}</span>
                    </div>
                    <div className="grid gap-1 pt-3 text-[13px]">
                        <div className="flex items-center gap-2">
                            <span className="w-12 text-[11px] font-bold uppercase tracking-wider text-slate-400">From:</span>
                            <span className="font-semibold text-slate-100">{mockFrom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-12 text-[11px] font-bold uppercase tracking-wider text-slate-400">To:</span>
                            <span className="font-medium text-slate-300">{mockTo}</span>
                        </div>
                    </div>
                </div>

                {/* The email exactly as it is sent */}
                <div className="flex-1 overflow-y-auto bg-[#0b0b0f]">
                    {error ? (
                        <p className="p-8 text-center text-[13px] text-[#ff6b6b]">{error}</p>
                    ) : (
                        <div className={`mx-auto transition-all duration-300 ${device === 'mobile' ? 'max-w-[390px]' : 'w-full'}`}>
                            <iframe
                                title={`${template.label} preview`}
                                srcDoc={preview?.html || ''}
                                sandbox=""
                                className={`block h-[60vh] w-full border-0 transition-opacity ${loading ? 'opacity-40' : 'opacity-100'}`}
                            />
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-between border-t border-slate-800 bg-[#0b1120] px-6 py-3.5">
                    <div className="text-[11px] text-slate-400">Rendered by the server with sample values for every placeholder</div>
                    <Button type="button" variant="secondary" onClick={onClose} className="border-slate-700 text-slate-200 hover:bg-slate-800">
                        Close Preview
                    </Button>
                </footer>
            </div>
        </div>
    );
}
