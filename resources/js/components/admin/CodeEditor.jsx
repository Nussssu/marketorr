import { useMemo, useRef } from 'react';

/**
 * Token rules per language, tried in order at each position. Each entry is
 * [token class, pattern]; text no rule matches is left plain.
 */
const RULES = {
    js: [
        ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
        ['string', /`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/y],
        ['keyword', /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|class|extends|import|export|from|async|await|try|catch|finally|throw|delete|in|of|void|yield)\b/y],
        ['literal', /\b(?:true|false|null|undefined|NaN|Infinity)\b|\b\d+(?:\.\d+)?\b/y],
        ['fn', /\b[A-Za-z_$][\w$]*(?=\s*\()/y],
    ],
    css: [
        ['comment', /\/\*[\s\S]*?\*\//y],
        ['string', /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/y],
        ['keyword', /@[\w-]+/y],
        ['property', /[\w-]+(?=\s*:(?!:))/y],
        ['literal', /#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr)?\b/y],
        ['fn', /[.#][\w-]+/y],
    ],
    html: [
        ['comment', /<!--[\s\S]*?-->/y],
        ['tag', /<\/?[A-Za-z][\w:-]*|\/?>/y],
        ['string', /"[^"]*"|'[^']*'/y],
        ['property', /\b[\w:-]+(?==)/y],
    ],
};

/** Mid-tone colours that stay readable on both the light and dark admin themes. */
const COLORS = {
    comment: 'text-[#8b98a8] italic',
    string: 'text-[#22a35a]',
    keyword: 'text-[#a855f7]',
    literal: 'text-[#e08a0b]',
    fn: 'text-[#3b82f6]',
    property: 'text-[#0ea5c6]',
    tag: 'text-[#e0457b]',
};

function tokenize(code, language) {
    const rules = RULES[language] ?? [];
    const tokens = [];
    let plain = '';
    let index = 0;

    while (index < code.length) {
        let matched = null;

        for (const [kind, pattern] of rules) {
            pattern.lastIndex = index;
            const result = pattern.exec(code);
            if (result && result[0].length > 0) {
                matched = [kind, result[0]];
                break;
            }
        }

        if (matched) {
            if (plain) tokens.push([null, plain]);
            plain = '';
            tokens.push(matched);
            index += matched[1].length;
        } else {
            plain += code[index];
            index += 1;
        }
    }

    if (plain) tokens.push([null, plain]);

    return tokens;
}

const SHARED = 'm-0 whitespace-pre break-normal p-3 font-mono text-[13px] leading-[1.6] [tab-size:2]';

/**
 * A lightweight code editor: a plain textarea for editing (so typing, undo
 * and paste behave natively) laid over a syntax-highlighted copy, with line
 * numbers and Tab indenting. No code is ever executed here.
 *
 * @param {{ value: string, onChange: (value: string) => void, language: 'js'|'css'|'html', invalid?: boolean, rows?: number, readOnly?: boolean }} props
 */
export default function CodeEditor({ value, onChange, language, invalid = false, rows = 18, readOnly = false, ...props }) {
    const highlightRef = useRef(null);
    const gutterRef = useRef(null);
    const tokens = useMemo(() => tokenize(value ?? '', language), [value, language]);
    const lineCount = Math.max((value ?? '').split('\n').length, 1);

    const syncScroll = (event) => {
        if (highlightRef.current) {
            highlightRef.current.scrollTop = event.target.scrollTop;
            highlightRef.current.scrollLeft = event.target.scrollLeft;
        }
        if (gutterRef.current) gutterRef.current.scrollTop = event.target.scrollTop;
    };

    const onKeyDown = (event) => {
        if (event.key !== 'Tab' || readOnly) return;
        event.preventDefault();
        const { selectionStart, selectionEnd } = event.target;
        const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
        onChange(next);
        requestAnimationFrame(() => event.target.setSelectionRange(selectionStart + 2, selectionStart + 2));
    };

    return (
        <div
            className={`relative flex overflow-hidden rounded-lg border bg-[var(--bg)] focus-within:ring-1 ${invalid ? 'border-[#ff6b6b] focus-within:ring-[#ff6b6b]' : 'border-[var(--field-line)] focus-within:border-[var(--brand-3)] focus-within:ring-[var(--brand-3)]'}`}
            style={{ height: `calc(${rows} * 1.6 * 13px + 1.5rem)` }}
        >
            <div ref={gutterRef} className="shrink-0 select-none overflow-hidden border-r border-[var(--line)] bg-[var(--surface)] py-3 text-right font-mono text-[12px] leading-[1.6] text-[var(--ink-faint)]" aria-hidden>
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="px-2.5" style={{ height: 'calc(13px * 1.6)' }}>{i + 1}</div>
                ))}
            </div>
            <div className="relative min-w-0 flex-1">
                <pre ref={highlightRef} className={`${SHARED} pointer-events-none absolute inset-0 overflow-hidden text-[var(--ink)]`} aria-hidden>
                    {tokens.map(([kind, text], i) => (kind ? <span key={i} className={COLORS[kind]}>{text}</span> : text))}
                    {'\n'}
                </pre>
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onScroll={syncScroll}
                    onKeyDown={onKeyDown}
                    readOnly={readOnly}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    wrap="off"
                    className={`${SHARED} absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-[var(--ink)] outline-none selection:bg-[var(--brand-2)]/25`}
                    {...props}
                />
            </div>
        </div>
    );
}
