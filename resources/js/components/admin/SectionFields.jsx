import {
    ColorInput,
    Field,
    Input,
    RepeatableList,
    Textarea,
} from './ui';

/**
 * Repeatable object rows driven by a widget's declared item fields, rendered
 * as stacked cards rather than a single line — a testimonial quote or an FAQ
 * answer needs room that a table row does not give it.
 */
function Repeater({ field, values, onChange }) {
    const rows = Array.isArray(values) ? values : [];
    const blank = Object.fromEntries(field.item_fields.map((f) => [f.name, f.type === 'number' ? 0 : '']));

    const update = (index, key, value) =>
        onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

    return (
        <div className="space-y-3">
            {rows.map((row, index) => (
                <div key={index} className="rounded-lg border border-[var(--field-line)] p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                            {field.label} {index + 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => onChange(rows.filter((_, i) => i !== index))}
                            className="text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]"
                            aria-label={`Remove ${field.label} ${index + 1}`}
                        >
                            Remove
                        </button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {field.item_fields.map((itemField) => (
                            <Field
                                key={itemField.name}
                                label={itemField.label}
                                className={itemField.type === 'textarea' ? 'sm:col-span-2' : ''}
                            >
                                {itemField.type === 'textarea' ? (
                                    <Textarea
                                        rows={3}
                                        value={row[itemField.name] ?? ''}
                                        onChange={(e) => update(index, itemField.name, e.target.value)}
                                    />
                                ) : itemField.type === 'color' ? (
                                    <ColorInput
                                        value={row[itemField.name] ?? ''}
                                        onChange={(value) => update(index, itemField.name, value)}
                                    />
                                ) : (
                                    <Input
                                        type={itemField.type === 'number' ? 'number' : 'text'}
                                        value={row[itemField.name] ?? ''}
                                        onChange={(e) => update(index, itemField.name, e.target.value)}
                                    />
                                )}
                            </Field>
                        ))}
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => onChange([...rows, blank])}
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
            >
                + Add {field.label.toLowerCase()}
            </button>
        </div>
    );
}

/**
 * Renders the form for one widget from the field schema the server sends, so
 * adding a widget type on the back end needs no matching form here.
 *
 * @param {{ fields: Array<object>, content: object, onChange: (content: object) => void, errors?: Record<string, string> }} props
 */
export default function SectionFields({ fields, content, onChange, errors = {} }) {
    const set = (name, value) => onChange({ ...content, [name]: value });

    return (
        <div className="grid gap-5">
            {fields.map((field) => {
                const value = content?.[field.name];
                const error = errors[`content.${field.name}`];

                if (field.type === 'repeater') {
                    return (
                        <Field key={field.name} label={field.label} error={error}>
                            <Repeater field={field} values={value} onChange={(next) => set(field.name, next)} />
                        </Field>
                    );
                }

                if (field.type === 'list') {
                    return (
                        <Field key={field.name} label={field.label} error={error}>
                            <RepeatableList
                                values={Array.isArray(value) ? value : []}
                                onChange={(next) => set(field.name, next)}
                                addLabel={`Add ${field.label.toLowerCase()}`}
                            />
                        </Field>
                    );
                }

                if (field.type === 'textarea' || field.type === 'richtext') {
                    return (
                        <Field
                            key={field.name}
                            label={field.label}
                            error={error}
                            hint={field.type === 'richtext' ? 'HTML is allowed — use <p>, <strong>, <a> and lists.' : undefined}
                        >
                            <Textarea
                                rows={field.type === 'richtext' ? 8 : 4}
                                className={field.type === 'richtext' ? 'font-mono text-[12px]' : ''}
                                value={value ?? ''}
                                onChange={(e) => set(field.name, e.target.value)}
                            />
                        </Field>
                    );
                }

                if (field.type === 'color') {
                    return (
                        <Field key={field.name} label={field.label} error={error}>
                            <ColorInput value={value ?? ''} onChange={(next) => set(field.name, next)} />
                        </Field>
                    );
                }

                return (
                    <Field key={field.name} label={field.label} error={error}>
                        <Input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={value ?? ''}
                            onChange={(e) => set(field.name, e.target.value)}
                        />
                    </Field>
                );
            })}
        </div>
    );
}
