import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ThemedSelect from './ThemedSelect';

/** Page heading with an optional action slot on the right. */
export function PageHeader({ title, subtitle, children }) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--ink-strong)]">{title}</h1>
                {subtitle && <p className="mt-1 text-[13px] text-[var(--mute)]">{subtitle}</p>}
            </div>
            {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
        </div>
    );
}

export function Panel({ title, description, action, children, className = '' }) {
    return (
        <section className={`rounded-xl border border-[var(--line)] bg-[var(--surface)] ${className}`}>
            {title && (
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
                    <div>
                        <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">{title}</h2>
                        {description && <p className="mt-1 text-[12px] text-[var(--mute)]">{description}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

/**
 * A collapsible widget card: tap the header to open it, tap again to close
 * it. Every widget keeps its own open state, so opening or closing one never
 * changes another. Its content stays mounted while closed, so nothing typed
 * in it is lost.
 *
 * @param {{ title: string, description?: string, summary?: string, defaultOpen?: boolean, action?: import('react').ReactNode, children: import('react').ReactNode, className?: string }} props
 */
export function WidgetPanel({ title, description, summary, defaultOpen = false, action, children, className = '' }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className={`rounded-xl border bg-[var(--surface)] transition-colors ${open ? 'border-[var(--brand-2)]/50' : 'border-[var(--line)]'} ${className}`}>
            <header className="flex items-center gap-3 px-5 py-4">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <svg
                        viewBox="0 0 12 7"
                        className={`h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        fill="none"
                        aria-hidden
                    >
                        <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="min-w-0">
                        <span className="block font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">{title}</span>
                        {(open ? description : summary || description) && (
                            <span className="mt-1 block truncate text-[12px] text-[var(--mute)]">{open ? description : summary || description}</span>
                        )}
                    </span>
                </button>
                {action && <div className="shrink-0">{action}</div>}
            </header>
            <div className={open ? 'border-t border-[var(--line)] p-5' : 'hidden'}>{children}</div>
        </section>
    );
}

const BUTTON_BASE =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export function Button({ as = 'button', variant = 'primary', className = '', ...props }) {
    const styles = {
        primary: 'text-white',
        secondary: 'border border-[var(--field-line)] text-[var(--ink)] hover:bg-[var(--chip)]',
        danger: 'border border-[#ff6b6b]/40 text-[#ff6b6b] hover:bg-[#ff6b6b]/10',
        ghost: 'text-[var(--ink-faint)] hover:text-[var(--ink)]',
        dangerGhost: 'text-[#ff6b6b] hover:opacity-80',
    }[variant];

    const style = variant === 'primary' ? { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' } : undefined;
    const Component = as === 'link' ? Link : as;

    return <Component className={`${BUTTON_BASE} ${styles} ${className}`} style={style} {...props} />;
}

/** Labelled form control that renders its own validation message. */
export function Field({ label, error, hint, required = false, children, className = '' }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                {label}
                {required && <span className="text-[#ff6b6b]"> *</span>}
            </span>
            {children}
            {hint && !error && <span className="mt-1 block text-[11px] text-[var(--ink-faint)]">{hint}</span>}
            {error && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{error}</span>}
        </label>
    );
}

/**
 * The admin's pill-style segmented tab bar: an auto-width track with a
 * subtle border, neutral inactive pills and the brand gradient on the active
 * one. Callers keep their own text classes, so typography stays per bar.
 */
export const TAB_BAR_CLASS = 'inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1';
export const TAB_GRADIENT = { background: 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' };

export function tabClass(active) {
    return `rounded-full px-4 py-1.5 transition-all duration-200 ease-out ${
        active ? 'text-white shadow-sm' : 'text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]'
    }`;
}

export const INPUT_CLASS =
    'w-full rounded-lg border border-[var(--field-line)] bg-[var(--bg)] px-3 py-2.5 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-3)] focus:border-[var(--brand-3)] transition-colors';

export function Input({ className = '', ...props }) {
    return <input className={`${INPUT_CLASS} ${className}`} {...props} />;
}

export function Textarea({ className = '', rows = 4, ...props }) {
    return <textarea rows={rows} className={`${INPUT_CLASS} resize-y ${className}`} {...props} />;
}

/** The admin's dropdown, in the site theme (see ThemedSelect). */
export function Select(props) {
    return <ThemedSelect {...props} />;
}

/**
 * One column of a two-column editor. It sticks while the other column
 * scrolls, so neither side leaves a blank area: a column shorter than the
 * screen stays at the shared top line, and a taller one scrolls with the page
 * until its end is in view, then holds there (clear of a fixed save bar,
 * `bottomOffset`), never needing a scrollbar of its own. Put it on both
 * columns and whichever is shorter is the one that sticks.
 */
export function StickyColumn({ className = '', topOffset = 24, bottomOffset = 24, children }) {
    const ref = useRef(null);
    const [top, setTop] = useState(topOffset);

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;

        const update = () => setTop(Math.min(topOffset, window.innerHeight - element.offsetHeight - bottomOffset));
        update();

        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
        observer?.observe(element);
        window.addEventListener('resize', update);

        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [topOffset, bottomOffset]);

    return (
        <div ref={ref} className={`lg:sticky lg:self-start ${className}`} style={{ top }}>
            {children}
        </div>
    );
}

/** Hex colour input paired with a native swatch picker. */
export function ColorInput({ value, onChange, ...props }) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(value ?? '') ? value : '#891FFB'}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--field-line)] bg-[var(--bg)] p-1 focus:outline-none focus:ring-1 focus:ring-[var(--brand-3)] focus:border-[var(--brand-3)] transition-colors"
                aria-label="Colour picker"
            />
            <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="#891FFB" {...props} />
        </div>
    );
}

const BADGE_TONES = {
    published: 'border-[var(--brand-3)]/40 text-[var(--brand-3)]',
    draft: 'border-[var(--field-line)] text-[var(--ink-faint)]',
    new: 'border-[var(--brand-1)]/40 text-[var(--brand-1)]',
    in_progress: 'border-[var(--brand-2)]/40 text-[var(--brand-2)]',
    replied: 'border-[var(--brand-3)]/40 text-[var(--brand-3)]',
    archived: 'border-[var(--field-line)] text-[var(--ink-faint)]',
};

export function Badge({ tone, children }) {
    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${BADGE_TONES[tone] ?? BADGE_TONES.draft}`}>
            {children ?? tone?.replace('_', ' ')}
        </span>
    );
}

export function EmptyState({ children }) {
    return <p className="py-12 text-center text-[13px] text-[var(--mute)]">{children}</p>;
}

/**
 * Repeatable single-value input (tags, capabilities, deliverables).
 *
 * @param {{ values: string[], onChange: (values: string[]) => void, placeholder?: string, addLabel?: string, errors?: Record<string, string>, name?: string }} props
 */
export function RepeatableList({ values, onChange, placeholder = '', addLabel = 'Add item', errors = {}, name = '' }) {
    const update = (index, value) => onChange(values.map((v, i) => (i === index ? value : v)));
    const remove = (index) => onChange(values.filter((_, i) => i !== index));

    return (
        <div className="space-y-2">
            {values.map((value, index) => (
                <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                        <Input value={value} onChange={(e) => update(index, e.target.value)} placeholder={placeholder} />
                        {errors[`${name}.${index}`] && (
                            <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors[`${name}.${index}`]}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove item ${index + 1}`}
                        className="mt-1 rounded-lg border border-[var(--field-line)] px-3 py-2 text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]"
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => onChange([...values, ''])}
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
            >
                + {addLabel}
            </button>
        </div>
    );
}

/**
 * Repeatable object rows built from a field spec, e.g. `{value, label}` pairs.
 *
 * @param {{ values: object[], onChange: (values: object[]) => void, fields: {key: string, placeholder: string, type?: string}[], addLabel?: string, errors?: Record<string, string>, name?: string }} props
 */
export function RepeatableRows({ values, onChange, fields, addLabel = 'Add row', errors = {}, name = '' }) {
    const blank = Object.fromEntries(fields.map((f) => [f.key, '']));
    const update = (index, key, value) =>
        onChange(values.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
    const remove = (index) => onChange(values.filter((_, i) => i !== index));

    return (
        <div className="space-y-2">
            {values.map((row, index) => (
                <div key={index} className="flex items-start gap-2">
                    <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}>
                        {fields.map((field) => (
                            <div key={field.key}>
                                <Input
                                    type={field.type ?? 'text'}
                                    value={row[field.key] ?? ''}
                                    onChange={(e) => update(index, field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    aria-label={`${field.placeholder} ${index + 1}`}
                                />
                                {errors[`${name}.${index}.${field.key}`] && (
                                    <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors[`${name}.${index}.${field.key}`]}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove row ${index + 1}`}
                        className="mt-1 rounded-lg border border-[var(--field-line)] px-3 py-2 text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]"
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => onChange([...values, blank])}
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
            >
                + {addLabel}
            </button>
        </div>
    );
}

/** Turn a title into a URL-safe slug, matching Laravel's `alpha_dash` rule. */
export function slugify(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Confirmation dialog for destructive actions.
 *
 * Rendered as a real modal rather than `window.confirm` so the consequence
 * can be spelled out — "this also unfiles 12 projects" is worth reading
 * before clicking, and a native dialog cannot say it.
 *
 * @param {{ open: boolean, title: string, body?: string, confirmLabel?: string, onConfirm: () => void, onCancel: () => void }} props
 */
export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onCancel }) {
    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => {
            if (event.key === 'Escape') onCancel();
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Cancel"
                onClick={onCancel}
                className="absolute inset-0 bg-black/60"
            />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-label={title}
                className="relative w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"
            >
                <h2 className="font-display text-[16px] font-extrabold text-[var(--ink-strong)]">{title}</h2>
                {body && <p className="mt-2 text-[13px] leading-relaxed text-[var(--mute)]">{body}</p>}
                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="button" variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Wires a `ConfirmDialog` to an arbitrary action.
 *
 * @returns {[object|null, (request: {title: string, body?: string, confirmLabel?: string, action: () => void}) => void, () => void]}
 */
export function useConfirm() {
    const [request, setRequest] = useState(null);

    const confirm = (next) => setRequest(next);
    const cancel = () => setRequest(null);

    const run = () => {
        request?.action?.();
        setRequest(null);
    };

    return [request, confirm, cancel, run];
}

/** Labelled on/off switch. */
export function Toggle({ checked, onChange, label, hint }) {
    return (
        <label className="flex cursor-pointer items-start gap-3">
            <input
                type="checkbox"
                checked={!!checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--brand-2)]"
            />
            <span>
                <span className="block text-[13px] font-semibold text-[var(--ink)]">{label}</span>
                {hint && <span className="mt-0.5 block text-[11px] text-[var(--ink-faint)]">{hint}</span>}
            </span>
        </label>
    );
}

export { default as MediaPickerModal } from './MediaPickerModal';
export { default as MediaPickerField } from './MediaPickerField';
export { default as ProjectGalleryManager } from './ProjectGalleryManager';

