import { Link } from '@inertiajs/react';

export function SectionLabel({ index, name }) {
    return (
        <div className="flex items-center gap-4">
            <span className="font-display text-[12px] font-bold tracking-[0.22em] text-[var(--ink-faint)]">
                {index} / {name}
            </span>
            <span className="h-[2px] w-16 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden>
                <span className="block h-full w-full origin-left bg-brand" />
            </span>
        </div>
    );
}

/**
 * Keeps a dynamic heading's leading words in the theme ink colour and gives
 * its closing phrase the shared Marketorr purple-to-cyan treatment.
 */
export function GradientTitle({ text, highlightWords = 1 }) {
    const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return null;

    const splitAt = Math.max(0, words.length - Math.max(1, highlightWords));
    const primary = words.slice(0, splitAt).join(' ');
    const highlight = words.slice(splitAt).join(' ');

    return (
        <>
            {primary && <>{primary}{' '}</>}
            <span className="text-gradient">{highlight}</span>
        </>
    );
}

export function Tag({ children, accent = '#891FFB' }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden />
            {children}
        </span>
    );
}

export function GradientButton({ href, children, variant = 'primary' }) {
    if (variant === 'ghost') {
        return (
            <Link
                href={href}
                data-cursor="cta"
                className="btn-press group inline-flex items-center gap-3 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]"
            >
                {children}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
        );
    }
    return (
        <Link
            href={href}
            data-cursor="cta"
            className="btn-press group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] text-white"
            style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
        >
            <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/15" aria-hidden />
            <span className="relative">{children}</span>
            <span aria-hidden className="relative transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">↗</span>
        </Link>
    );
}
