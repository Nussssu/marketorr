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

export const DUMMY_LEAD_DATA = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 234-5678',
    company: 'Acme Corporation',
    type: 'Web Development',
    budget: '$5,000 - $10,000',
    source_page: '/contact',
    submitted_at: getFormattedDate(),
    message: 'We are looking to rebuild our marketing site...',
    site_name: 'Marketorr',
    contact_email: 'hello@marketorr.com',
};

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function compileSubject(templateSubject, data = DUMMY_LEAD_DATA) {
    if (!templateSubject) return '';
    return templateSubject.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, token) => {
        const key = token.toLowerCase();
        return key in data ? data[key] : match;
    });
}

export function compileBodyHtml(templateBody, data = DUMMY_LEAD_DATA) {
    if (!templateBody) return '';
    return templateBody.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, token) => {
        const key = token.toLowerCase();
        if (key in data) {
            const escaped = escapeHtml(data[key]);
            return escaped.replace(/\n/g, '<br>');
        }
        return match;
    });
}

/**
 * Professional desktop & mobile email client frame modal with dynamic agency branding.
 */
export default function EmailPreviewModal({ open, template, onClose }) {
    const { props } = usePage();
    const settings = props?.settings;

    const rawSiteName = settings?.siteName || 'Marketorr';
    const siteNameUpper = rawSiteName.replace(/\.+$/, '').toUpperCase();
    const contactEmail = settings?.contactEmail || 'hello@marketorr.com';
    const currentYear = new Date().getFullYear();
    const copyrightText = settings?.copyright || `© ${currentYear} ${rawSiteName}. All rights reserved.`;

    const [device, setDevice] = useState('desktop');

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

    const isNotification = template?.key === 'admin_lead_notification' || template?.key?.includes('admin');

    const mockFrom = `${rawSiteName} System <notifications@marketorr.com>`;
    const mockTo = isNotification ? 'admin@marketorr.com' : 'lead@example.com';
    const formattedDate = useMemo(() => getFormattedDate(), []);

    const previewData = useMemo(() => ({
        ...DUMMY_LEAD_DATA,
        site_name: rawSiteName,
        contact_email: contactEmail,
    }), [rawSiteName, contactEmail]);

    const compiledSubject = useMemo(
        () => compileSubject(template?.subject, previewData),
        [template?.subject, previewData]
    );

    const compiledBody = useMemo(
        () => compileBodyHtml(template?.bodyHtml, previewData),
        [template?.bodyHtml, previewData]
    );

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
                    {/* Mac-style Window Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            title="Close preview"
                            className="h-3 w-3 rounded-full bg-[#ff5f56] transition-opacity hover:opacity-80 focus:outline-none"
                        />
                        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                        <span className="ml-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Mail Client · {template.label}
                        </span>
                    </div>

                    {/* Controls (Device Viewport Switcher & Close Button) */}
                    <div className="flex items-center gap-3">
                        {/* Device Viewport Toggle Button */}
                        <div className="flex items-center rounded-lg border border-slate-700/80 bg-slate-800/80 p-0.5 text-[11px] font-bold uppercase tracking-[0.08em]">
                            <button
                                type="button"
                                onClick={() => setDevice('desktop')}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-all ${
                                    device === 'desktop'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Desktop</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDevice('mobile')}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-all ${
                                    device === 'mobile'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>Mobile</span>
                            </button>
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

                {/* Structured Email Header Card */}
                <div className="border-b border-slate-800 bg-[#0f172a] px-6 py-4 text-slate-200">
                    <div className="space-y-2">
                        {/* Dynamic Subject Line */}
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <h3
                                id="preview-modal-title"
                                className="text-[16px] font-bold text-white tracking-tight leading-snug"
                            >
                                {compiledSubject || '(No Subject)'}
                            </h3>
                            <span className="text-[12px] font-mono text-slate-400">
                                {formattedDate}
                            </span>
                        </div>

                        {/* From & To Fields */}
                        <div className="grid gap-1 pt-1 text-[13px]">
                            <div className="flex items-center gap-2">
                                <span className="w-12 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    From:
                                </span>
                                <span className="font-semibold text-slate-100">
                                    {mockFrom}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-12 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    To:
                                </span>
                                <span className="font-medium text-slate-300">
                                    {mockTo}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Body Canvas */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
                    <div
                        className={`mx-auto transition-all duration-300 ${
                            device === 'mobile' ? 'max-w-[390px]' : 'w-full'
                        }`}
                    >
                        {/* Centered White Card */}
                        <div className="bg-white max-w-xl mx-auto rounded-lg shadow-sm border border-slate-200/80 p-8 text-slate-800">
                            {/* Header Agency Branding */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-5 items-end gap-[2.5px]" aria-hidden="true">
                                        <span className="h-2.5 w-[3.5px] rounded-[1.5px] bg-[#891FFB]" />
                                        <span className="h-4 w-[3.5px] rounded-[1.5px] bg-[#507AF4]" />
                                        <span className="h-5 w-[3.5px] rounded-[1.5px] bg-[#1BE2EB]" />
                                    </span>
                                    <span className="font-display text-[15px] font-extrabold uppercase tracking-tight text-slate-900">
                                        {siteNameUpper}<span className="text-[#507AF4]">.</span>
                                    </span>
                                </div>
                                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100">
                                    {isNotification ? 'Internal Alert' : 'Confirmation'}
                                </span>
                            </div>

                            {/* Rendered Email Body Content */}
                            <div
                                className="email-canvas-body"
                                dangerouslySetInnerHTML={{
                                    __html: compiledBody || '<p style="color: #94a3b8; font-style: italic;">(Empty message body)</p>',
                                }}
                            />

                            {/* Footer Agency Branding */}
                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[12px] text-slate-400 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <span className="font-semibold text-slate-600">Sent by {rawSiteName}</span>
                                        <span className="text-slate-300">·</span>
                                        <a
                                            href={`mailto:${contactEmail}`}
                                            className="text-[#507AF4] hover:underline transition-colors"
                                        >
                                            {contactEmail}
                                        </a>
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {copyrightText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Window Footer */}
                <footer className="border-t border-slate-800 bg-[#0b1120] px-6 py-3.5 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                        Rendered with simulated dummy data for all placeholders
                    </div>
                    <Button type="button" variant="secondary" onClick={onClose} className="border-slate-700 text-slate-200 hover:bg-slate-800">
                        Close Preview
                    </Button>
                </footer>
            </div>
        </div>
    );
}
