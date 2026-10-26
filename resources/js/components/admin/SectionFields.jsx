import MediaPickerField from './MediaPickerField';
import RichTextEditor from './RichTextEditor';
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
                        {field.item_fields.map((itemField) => itemField.type === 'image' ? (
                            <MediaPickerField
                                key={itemField.name}
                                label={itemField.label}
                                value={row[itemField.name] ?? ''}
                                onChange={(url) => update(index, itemField.name, url)}
                                className="sm:col-span-2"
                            />
                        ) : itemField.type === 'richtext' ? (
                            <RichTextEditor
                                key={itemField.name}
                                label={itemField.label}
                                value={row[itemField.name] ?? ''}
                                onChange={(html) => update(index, itemField.name, html)}
                                rows={3}
                                className="sm:col-span-2"
                            />
                        ) : (
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
    // The gradient line count can never exceed the heading lines written.
    const headingLineCount = (lines) => (Array.isArray(lines) ? lines : []).filter((line) => String(line ?? '').trim() !== '').length;
    const clampHighlight = (value, lines) => (value === '' ? '' : Math.min(Math.max(Math.trunc(Number(value) || 0), 0), headingLineCount(lines)));

    const set = (name, value) => {
        const next = { ...content, [name]: value };

        if (name === 'titleLines' && next.titleHighlight !== undefined && next.titleHighlight !== '') {
            next.titleHighlight = clampHighlight(next.titleHighlight, value);
        }

        onChange(next);
    };

    const renderField = (field) => {
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

        if (field.type === 'richtext') {
            return (
                <RichTextEditor
                    key={field.name}
                    label={field.label}
                    value={value ?? ''}
                    error={error}
                    onChange={(html) => set(field.name, html)}
                />
            );
        }

        if (field.type === 'textarea') {
            return (
                <Field key={field.name} label={field.label} error={error}>
                    <Textarea
                        rows={4}
                        value={value ?? ''}
                        onChange={(e) => set(field.name, e.target.value)}
                    />
                </Field>
            );
        }

        if (field.type === 'image') {
            return (
                <MediaPickerField
                    key={field.name}
                    label={field.label}
                    value={value ?? ''}
                    error={error}
                    onChange={(url) => set(field.name, url)}
                />
            );
        }

        if (field.type === 'color') {
            return (
                <Field key={field.name} label={field.label} error={error}>
                    <ColorInput value={value ?? ''} onChange={(next) => set(field.name, next)} />
                </Field>
            );
        }

        if (field.name === 'headingScale') {
            return (
                <Field key={field.name} label={field.label} error={error}>
                    <Input
                        type="number"
                        min={50}
                        max={200}
                        step={5}
                        value={value ?? 100}
                        onChange={(e) => set(field.name, e.target.value === '' ? '' : Math.trunc(Number(e.target.value) || 0))}
                        onBlur={(e) => set(field.name, e.target.value === '' ? 100 : Math.min(Math.max(Math.trunc(Number(e.target.value) || 0), 50), 200))}
                    />
                </Field>
            );
        }

        if (field.name === 'titleHighlight') {
            const max = headingLineCount(content?.titleLines);

            return (
                <Field key={field.name} label={field.label} error={error} hint={`0 to ${max}, the number of heading lines.`}>
                    <Input
                        type="number"
                        min={0}
                        max={max}
                        step={1}
                        value={value ?? ''}
                        onChange={(e) => set(field.name, clampHighlight(e.target.value, content?.titleLines))}
                    />
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
    };

    // The heading size box sits beside the heading it scales: the heading
    // lines, else the field labelled "Heading". With neither it keeps its
    // own row.
    const scaleField = fields.find((field) => field.name === 'headingScale');
    const scaleAnchor = scaleField
        ? fields.find((field) => ['headingLines', 'titleLines'].includes(field.name)) ?? fields.find((field) => field.label === 'Heading')
        : undefined;

    return (
        <div className="grid gap-5">
            {fields.map((field) => {
                if (scaleAnchor && field === scaleField) return null;

                if (scaleAnchor && field === scaleAnchor) {
                    return (
                        <div key={field.name} className="grid grid-cols-[minmax(0,1fr)_7rem] items-start gap-3">
                            {renderField(field)}
                            {renderField({ ...scaleField, label: 'Size (%)' })}
                        </div>
                    );
                }

                return renderField(field);
            })}
        </div>
    );
}
