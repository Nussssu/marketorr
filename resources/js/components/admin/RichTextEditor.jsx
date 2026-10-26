import { useEffect, useRef, useState } from 'react';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Whether a stored value is HTML rather than plain text. */
export function isHtml(value) {
    return /<\/?[a-z][^>]*>/i.test(String(value ?? ''));
}

/** Plain text (as older content was written) as paragraphs for the visual editor. */
function toHtml(value) {
    const text = String(value ?? '');
    if (text === '' || isHtml(text)) return text;

    return text
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/[&<>"']/g, (c) => ESCAPES[c]).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

/** An editor left empty, rather than an empty paragraph. */
function normalise(html) {
    const stripped = html.replace(/<br\s*\/?>/gi, '').replace(/<p>\s*<\/p>/gi, '').replace(/&nbsp;/g, ' ').trim();

    return stripped === '' ? '' : html;
}

const TOOLS = [
    { command: 'bold', label: 'Bold', icon: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7V5Zm0 7h7a3.5 3.5 0 0 1 0 7H7v-7Z" /> },
    { command: 'italic', label: 'Italic', icon: <path d="M14 5h-4m4 14h-4m3-14-2 14" /> },
    { command: 'underline', label: 'Underline', icon: <path d="M7 5v6a5 5 0 0 0 10 0V5M6 20h12" /> },
    { divider: true },
    { command: 'formatBlock', arg: 'h2', label: 'Heading', text: 'H2' },
    { command: 'formatBlock', arg: 'h3', label: 'Subheading', text: 'H3' },
    { command: 'formatBlock', arg: 'p', label: 'Paragraph', text: '¶' },
    { divider: true },
    { command: 'insertUnorderedList', label: 'Bullet list', icon: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" /> },
    { command: 'insertOrderedList', label: 'Numbered list', icon: <path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 14.5a1.5 1.5 0 0 1 3 0c0 1-3 2-3 3.5h3" /> },
    { command: 'formatBlock', arg: 'blockquote', label: 'Quote', icon: <path d="M6 17c2 0 3.5-1.5 3.5-3.5V8H5v5.5h3M15 17c2 0 3.5-1.5 3.5-3.5V8H14v5.5h3" /> },
    { divider: true },
    { command: 'createLink', label: 'Link', icon: <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /> },
    { command: 'unlink', label: 'Remove link', icon: <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1M4 4l16 16" /> },
    { command: 'removeFormat', label: 'Clear formatting', icon: <path d="M6 5h12M12 5l-3 14M4 20l16-16" /> },
];

/**
 * A rich text box for the page builder: a visual editor with a formatting
 * toolbar, and an HTML view of the same content, switched from the box's
 * top-right corner. Emits HTML (or the plain text it was given, untouched
 * until edited); the server keeps only safe markup.
 *
 * @param {{ label: string, value?: string, onChange: (html: string) => void, error?: string, rows?: number, className?: string }} props
 */
export default function RichTextEditor({ label, value = '', onChange, error, rows = 6, className = '' }) {
    const [mode, setMode] = useState('visual');
    const editor = useRef(null);
    const lastEmitted = useRef(null);
    const minHeight = `${Math.max(rows, 2) * 1.65 + 1.5}rem`;

    // Load the value into the visual editor, unless it is what was just typed.
    useEffect(() => {
        if (mode !== 'visual' || !editor.current) return;
        if (value === lastEmitted.current && editor.current.innerHTML !== '') return;

        editor.current.innerHTML = toHtml(value);
    }, [value, mode]);

    const emit = () => {
        const html = normalise(editor.current?.innerHTML ?? '');
        lastEmitted.current = html;
        onChange(html);
    };

    const run = (tool) => {
        editor.current?.focus();
        document.execCommand('defaultParagraphSeparator', false, 'p');

        if (tool.command === 'createLink') {
            const url = window.prompt('Link address (https://…, /page, mailto:…)', 'https://');
            if (!url || url === 'https://') return;
            document.execCommand('createLink', false, url);
        } else if (tool.command === 'formatBlock') {
            document.execCommand('formatBlock', false, tool.arg);
        } else {
            document.execCommand(tool.command, false, null);
        }

        emit();
    };

    const switchTo = (next) => {
        if (next === mode) return;
        lastEmitted.current = null;
        setMode(next);
    };

    return (
        <div className={`block ${className}`}>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{label}</span>
            <div className={`overflow-hidden rounded-lg border bg-[var(--bg)] transition-colors focus-within:border-[var(--brand-3)] focus-within:ring-1 focus-within:ring-[var(--brand-3)] ${error ? 'border-[#ff6b6b]/60' : 'border-[var(--field-line)]'}`}>
                <div className="flex items-center justify-between gap-2 border-b border-[var(--field-line)] bg-[var(--surface)] px-2 py-1.5">
                    <div className={`flex min-w-0 flex-wrap items-center gap-0.5 ${mode === 'html' ? 'invisible' : ''}`} role="toolbar" aria-label={`${label} formatting`}>
                        {TOOLS.map((tool, index) =>
                            tool.divider ? (
                                <span key={`divider-${index}`} className="mx-1 h-4 w-px bg-[var(--field-line)]" aria-hidden />
                            ) : (
                                <button
                                    key={tool.label}
                                    type="button"
                                    title={tool.label}
                                    aria-label={tool.label}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => run(tool)}
                                    className="inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1 text-[11px] font-bold text-[var(--ink-faint)] transition-colors hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                                >
                                    {tool.icon ? (
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{tool.icon}</svg>
                                    ) : tool.text}
                                </button>
                            ),
                        )}
                    </div>

                    {/* Visual / HTML, in the box's top-right corner. */}
                    <div className="flex shrink-0 rounded-md border border-[var(--field-line)] p-0.5 text-[10px] font-bold uppercase tracking-[0.12em]" role="tablist" aria-label={`${label} view`}>
                        {[['visual', 'Visual'], ['html', 'HTML']].map(([key, text]) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={mode === key}
                                onClick={() => switchTo(key)}
                                className={`rounded px-2.5 py-1 transition-colors ${mode === key ? 'text-white' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'}`}
                                style={mode === key ? { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' } : undefined}
                            >
                                {text}
                            </button>
                        ))}
                    </div>
                </div>

                {mode === 'visual' ? (
                    <div
                        ref={editor}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        aria-label={label}
                        onInput={emit}
                        onBlur={emit}
                        className="prose-cms max-h-[28rem] overflow-y-auto px-3 py-2.5 text-[14px] leading-relaxed text-[var(--ink)] focus:outline-none"
                        style={{ minHeight }}
                    />
                ) : (
                    <textarea
                        value={value ?? ''}
                        onChange={(event) => onChange(event.target.value)}
                        aria-label={`${label} HTML`}
                        spellCheck={false}
                        className="block w-full resize-y bg-transparent px-3 py-2.5 font-mono text-[12px] leading-relaxed text-[var(--ink)] focus:outline-none"
                        style={{ minHeight }}
                    />
                )}
            </div>
            {error && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{error}</span>}
        </div>
    );
}
