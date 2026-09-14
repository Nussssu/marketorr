import { Link } from '@inertiajs/react';

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

export function Panel({ title, description, children, className = '' }) {
    return (
        <section className={`rounded-xl border border-[var(--line)] bg-[var(--surface)] ${className}`}>
            {title && (
                <header className="border-b border-[var(--line)] px-5 py-4">
                    <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">{title}</h2>
                    {description && <p className="mt-1 text-[12px] text-[var(--mute)]">{description}</p>}
                </header>
            )}
            <div className="p-5">{children}</div>
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
    }[variant];

    const style = variant === 'primary' ? { background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' } : undefined;
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

export const INPUT_CLASS =
    'w-full rounded-lg border border-[var(--field-line)] bg-[var(--bg)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[#507AF4]';

export function Input({ className = '', ...props }) {
    return <input className={`${INPUT_CLASS} ${className}`} {...props} />;
}

export function Textarea({ className = '', rows = 4, ...props }) {
    return <textarea rows={rows} className={`${INPUT_CLASS} resize-y ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
    return (
        <select className={`${INPUT_CLASS} ${className}`} {...props}>
            {children}
        </select>
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
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--field-line)] bg-[var(--bg)] p-1"
                aria-label="Colour picker"
            />
            <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="#891FFB" {...props} />
        </div>
    );
}

const BADGE_TONES = {
    published: 'border-[#1BE2EB]/40 text-[#1BE2EB]',
    draft: 'border-[var(--field-line)] text-[var(--ink-faint)]',
    new: 'border-[#891FFB]/40 text-[#891FFB]',
    in_progress: 'border-[#507AF4]/40 text-[#507AF4]',
    replied: 'border-[#1BE2EB]/40 text-[#1BE2EB]',
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
