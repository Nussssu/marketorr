import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, Field, Input, PageHeader, Panel, RepeatableList, TAB_BAR_CLASS, TAB_GRADIENT, Textarea, Toggle, tabClass } from '../../../components/admin/ui';

const BLANK = {
    label: '',
    url: '',
    description: '',
    opens_in_new_tab: false,
    enabled: true,
    show_on_desktop: true,
    show_on_mobile: true,
    children: [],
};
const MENU_TABS = [
    { id: 'header', label: 'Header' },
    { id: 'footer', label: 'Footer' },
    { id: 'mega', label: 'Mega Menu' },
];
const MENU_DISPLAY_ORDER = {
    footer_social: 0,
    footer_sitemap: 1,
    footer_services: 2,
    footer_legal: 3,
};

/**
 * A client-only key per row, so open editors and drag state follow a row as
 * it moves. The server reads only the fields it knows, so it never stores it.
 */
let keySeed = 0;
const newKey = () => `row-${++keySeed}`;
const withKey = (item) => ({ ...item, _key: newKey(), children: (item.children ?? []).map((child) => ({ ...child, _key: newKey() })) });

/** Moves one entry of a list to another position. */
const moveTo = (list, from, to) => {
    const next = [...list];
    const [entry] = next.splice(from, 1);
    next.splice(to, 0, entry);

    return next;
};

const ICONS = {
    grip: <><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    edit: <><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    delete: <><path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" /><path d="M10 11.5v5M14 11.5v5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    plusCircle: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
    dot: <circle cx="12" cy="12" r="4" />,
};

function Icon({ name, className = 'h-4 w-4' }) {
    const filled = name === 'grip' || name === 'dot';

    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[name]}
        </svg>
    );
}

const ACTION_BUTTON = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-faint)] transition-colors duration-200 hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30';
const GHOST_BUTTON = 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--ink-faint)] transition-colors duration-200 hover:bg-[var(--chip)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30';
const URL_INPUT = 'w-full rounded-lg border bg-[var(--bg)] py-1.5 pl-8 pr-2.5 font-mono text-[12.5px] text-[var(--ink)] transition-colors focus:border-[var(--brand-3)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-3)]';

/** A compact show/hide switch for a row's Visible flag. */
function RowSwitch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
            style={{ background: checked ? 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))' : 'var(--field-line)' }}
        >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} aria-hidden />
        </button>
    );
}

/**
 * One menu entry as a single row: drag handle, expand chevron, number,
 * label and badge, an inline URL field, Visible, Open in new tab, and
 * Edit / Duplicate / Delete. Edit opens the rest of its fields beneath.
 */
function MenuRow({
    item,
    number,
    child = false,
    open,
    onToggleOpen,
    onChange,
    onDuplicate,
    onDelete,
    onMoveUp,
    onMoveDown,
    drag,
    errors,
    errorPrefix,
    isMega,
    isHeader,
    expander,
    footerAction,
}) {
    const isContact = isHeader && !child && (item.url === '/contact' || item.label.trim().toLowerCase() === 'contact');
    const name = item.label || 'item';
    const urlError = errors[`${errorPrefix}.url`];

    return (
        <div
            onDragOver={drag.onDragOver}
            onDragLeave={drag.onDragLeave}
            onDrop={drag.onDrop}
            className={`transition-colors duration-200 ${drag.isOver ? 'bg-[var(--brand-2)]/10 shadow-[inset_0_2px_0_var(--brand-2)]' : ''} ${drag.isDragging ? 'opacity-40' : ''}`}
        >
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${child ? 'px-3 py-2' : 'px-3 py-3'} ${item.enabled ? '' : 'opacity-60'}`}>
                <span
                    draggable
                    onDragStart={drag.onDragStart}
                    onDragEnd={drag.onDragEnd}
                    className="inline-flex h-7 w-4 shrink-0 cursor-grab items-center justify-center text-[var(--ink-faint)] hover:text-[var(--ink)] active:cursor-grabbing"
                    title="Drag to reorder"
                    aria-hidden
                >
                    <Icon name="grip" className="h-4 w-4" />
                </span>

                {expander}

                <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 font-mono text-[12px] font-bold text-[var(--ink)]">
                    {number}
                </span>

                <button type="button" onClick={onToggleOpen} className="flex min-w-0 flex-1 items-center gap-2.5 text-left" aria-expanded={open} title="Edit">
                    <span className={`truncate ${child ? 'text-[13.5px] font-medium' : 'text-[14.5px] font-bold'} ${item.label ? 'text-[var(--ink-strong)]' : 'italic text-[var(--ink-faint)]'}`}>
                        {item.label || 'Untitled'}
                    </span>
                    <span
                        className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:inline ${
                            child ? 'bg-[var(--brand-3)]/12 text-[var(--brand-3)]' : 'bg-[var(--brand-1)]/12 text-[var(--brand-1)]'
                        }`}
                    >
                        {child ? 'Sub-item' : 'Parent item'}
                    </span>
                </button>

                <label className="relative hidden w-56 shrink-0 md:block xl:w-64" title={urlError}>
                    <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[var(--ink-faint)]"><Icon name="link" className="h-3.5 w-3.5" /></span>
                    <input
                        value={item.url}
                        onChange={(e) => onChange({ url: e.target.value })}
                        placeholder="/about"
                        aria-label={`URL for ${name}`}
                        aria-invalid={Boolean(urlError)}
                        className={`${URL_INPUT} ${urlError ? 'border-[#ff6b6b]' : 'border-[var(--line)]'}`}
                    />
                </label>

                <label className="flex shrink-0 cursor-pointer items-center gap-2">
                    <RowSwitch checked={item.enabled} onChange={(value) => onChange({ enabled: value })} label={`${item.enabled ? 'Hide' : 'Show'} ${name}`} />
                    <span className="hidden text-[13px] text-[var(--ink)] lg:inline">Visible</span>
                </label>

                <label className="flex shrink-0 cursor-pointer items-center gap-2">
                    <input
                        type="checkbox"
                        checked={!!item.opens_in_new_tab}
                        onChange={(e) => onChange({ opens_in_new_tab: e.target.checked })}
                        aria-label={`Open ${name} in a new tab`}
                        className="h-4 w-4 cursor-pointer rounded accent-[var(--brand-2)]"
                    />
                    <span className="hidden text-[13px] text-[var(--ink)] lg:inline">Open in new tab</span>
                </label>

                <span className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={onToggleOpen} className={`${ACTION_BUTTON} ${open ? '!border-[var(--brand-2)]/50 !bg-[var(--chip)] !text-[var(--ink)]' : ''}`} title={open ? 'Close' : 'Edit'} aria-label={`${open ? 'Close' : 'Edit'} ${name}`}>
                        <Icon name="edit" />
                    </button>
                    <button type="button" onClick={onDuplicate} className={ACTION_BUTTON} title="Duplicate" aria-label={`Duplicate ${name}`}>
                        <Icon name="copy" />
                    </button>
                    <button type="button" onClick={onDelete} className={`${ACTION_BUTTON} !text-[#ff6b6b] hover:!border-[#ff6b6b]/40 hover:!bg-[#ff6b6b]/10`} title="Delete" aria-label={`Delete ${name}`}>
                        <Icon name="delete" />
                    </button>
                </span>
            </div>

            {open && (
                <div className={`border-t border-[var(--line)] px-3 pb-3 pt-3 ${child ? '' : 'mx-3 mb-3 rounded-lg border bg-[var(--surface)]'}`}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Label" error={errors[`${errorPrefix}.label`]}>
                            <Input value={item.label} onChange={(e) => onChange({ label: e.target.value })} />
                        </Field>
                        <Field label="URL" error={urlError}>
                            <Input value={item.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="/about" />
                        </Field>
                        {isMega && !child && (
                            <Field label="Supporting text" error={errors[`${errorPrefix}.description`]} className="sm:col-span-2">
                                <Input value={item.description ?? ''} onChange={(e) => onChange({ description: e.target.value })} placeholder="Identities that demand attention." />
                            </Field>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                        {isContact && (
                            <>
                                <Toggle checked={item.show_on_desktop} onChange={(value) => onChange({ show_on_desktop: value })} label="Show on desktop" />
                                <Toggle checked={item.show_on_mobile} onChange={(value) => onChange({ show_on_mobile: value })} label="Show on mobile" />
                            </>
                        )}
                        {footerAction}
                        <span className="ml-auto flex items-center gap-1">
                            <button type="button" onClick={onMoveUp} disabled={!onMoveUp} className={`${GHOST_BUTTON} -rotate-90`} title="Move up" aria-label="Move up"><Icon name="chevron" /></button>
                            <button type="button" onClick={onMoveDown} disabled={!onMoveDown} className={`${GHOST_BUTTON} rotate-90`} title="Move down" aria-label="Move down"><Icon name="chevron" /></button>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

/** One editable menu location within the page-wide save form. */
function MenuEditor({ menu, data, setData, errors }) {
    const [openKeys, setOpenKeys] = useState(() => new Set());
    const [expandedKeys, setExpandedKeys] = useState(() => new Set());
    const [textOpen, setTextOpen] = useState(false);
    const [dragging, setDragging] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    const setItems = (items) => setData('items', items);
    const setContent = (key, value) => setData('content', { ...data.content, [key]: value });
    const hasErrors = (prefix) => Object.keys(errors).some((key) => key.startsWith(prefix));
    const toggleKey = (setter, key) => setter((current) => {
        const next = new Set(current);
        if (next.has(key)) next.delete(key);
        else next.add(key);

        return next;
    });
    const expand = (key) => setExpandedKeys((current) => new Set([...current, key]));

    const updateItem = (index, patch) =>
        setItems(data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    const updateChild = (parentIndex, childIndex, patch) =>
        updateItem(parentIndex, {
            children: data.items[parentIndex].children.map((child, i) => (i === childIndex ? { ...child, ...patch } : child)),
        });

    const duplicateItem = (index) => {
        const source = data.items[index];
        const copy = withKey({ ...source, label: source.label ? `${source.label} (Copy)` : '' });
        const next = [...data.items];
        next.splice(index + 1, 0, copy);
        setItems(next);
    };
    const duplicateChild = (parentIndex, childIndex) => {
        const children = [...data.items[parentIndex].children];
        const source = children[childIndex];
        children.splice(childIndex + 1, 0, { ...source, label: source.label ? `${source.label} (Copy)` : '', _key: newKey() });
        updateItem(parentIndex, { children });
    };
    const addChild = (index) => {
        const child = { ...BLANK, _key: newKey() };
        updateItem(index, { children: [...data.items[index].children, child] });
        expand(data.items[index]._key);
        setOpenKeys((current) => new Set([...current, child._key]));
    };
    const addItem = () => {
        const item = withKey(BLANK);
        setItems([...data.items, item]);
        setOpenKeys((current) => new Set([...current, item._key]));
    };

    /**
     * Drag-and-drop within one level: top-level items among themselves, and
     * sub-items only within their own parent.
     */
    const dragProps = (scope, index, key) => ({
        isDragging: dragging?.key === key,
        isOver: dropTarget === key && dragging && dragging.key !== key && dragging.scope === scope,
        onDragStart: (event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', key);
            setDragging({ scope, index, key });
        },
        onDragEnd: () => {
            setDragging(null);
            setDropTarget(null);
        },
        onDragOver: (event) => {
            if (!dragging || dragging.scope !== scope) return;
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
            if (dropTarget !== key) setDropTarget(key);
        },
        onDragLeave: () => {
            if (dropTarget === key) setDropTarget(null);
        },
        onDrop: (event) => {
            if (!dragging || dragging.scope !== scope) return;
            event.preventDefault();
            event.stopPropagation();
            if (dragging.index !== index) {
                if (scope === 'root') {
                    setItems(moveTo(data.items, dragging.index, index));
                } else {
                    const parentIndex = Number(scope.split(':')[1]);
                    updateItem(parentIndex, { children: moveTo(data.items[parentIndex].children, dragging.index, index) });
                }
            }
            setDragging(null);
            setDropTarget(null);
        },
    });

    const hasMenuText = Object.keys(data.content).length > 0;
    const menuTextOpen = textOpen || hasErrors('content.');

    return (
        <Panel
            className="h-full"
            title={data.name || menu.label}
            description="Drag to reorder, click a row to edit, or add new items."
            action={
                <Button type="button" onClick={addItem} className="inline-flex items-center gap-2">
                    <Icon name="plus" className="h-4 w-4" /> Add item
                </Button>
            }
        >
            {menu.note && (
                <p className="mb-4 rounded-lg border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 px-3 py-2 text-[12px] text-[var(--mute)]">
                    {menu.note}
                </p>
            )}

            <div className="mb-4 flex flex-wrap items-end gap-3">
                <Field label="Parent label" error={errors.name} className="min-w-0 flex-1 sm:max-w-sm">
                    <Input value={data.name} onChange={(event) => setData('name', event.target.value)} />
                </Field>
                {hasMenuText && (
                    <button
                        type="button"
                        onClick={() => setTextOpen((value) => !value)}
                        aria-expanded={menuTextOpen}
                        className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] transition-colors duration-200 hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                    >
                        <Icon name="chevron" className={`h-3 w-3 transition-transform duration-200 ${menuTextOpen ? 'rotate-90' : ''}`} />
                        Menu text
                    </button>
                )}
            </div>

            {hasMenuText && menuTextOpen && (
                <div className="mb-4 grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 sm:grid-cols-2">
                    {menu.location === 'footer_social' ? (
                        <Field label="Agency intro" error={errors['content.intro']} className="sm:col-span-2">
                            <Textarea rows={3} value={data.content.intro ?? ''} onChange={(event) => setContent('intro', event.target.value)} />
                        </Field>
                    ) : menu.location === 'footer_legal' ? (
                        <>
                            <Field label="Copyright line" error={errors['content.copyright']} hint="Use {year} and {site} as automatic replacement variables." className="sm:col-span-2">
                                <Input value={data.content.copyright ?? ''} onChange={(event) => setContent('copyright', event.target.value)} />
                            </Field>
                            <Field label="Footer motto words" error={errors['content.motto_items']} className="sm:col-span-2">
                                <RepeatableList
                                    values={data.content.motto_items ?? []}
                                    onChange={(values) => setContent('motto_items', values)}
                                    placeholder="IDEA"
                                    addLabel="Add word"
                                    errors={errors}
                                    name="content.motto_items"
                                />
                            </Field>
                        </>
                    ) : (
                        <>
                            <Field label="Eyebrow" error={errors['content.eyebrow']}>
                                <Input value={data.content.eyebrow ?? ''} onChange={(event) => setContent('eyebrow', event.target.value)} />
                            </Field>
                            <Field label="Heading start" error={errors['content.headline_before']}>
                                <Input value={data.content.headline_before ?? ''} onChange={(event) => setContent('headline_before', event.target.value)} />
                            </Field>
                            <Field label="Gradient heading text" error={errors['content.headline_highlight']}>
                                <Input value={data.content.headline_highlight ?? ''} onChange={(event) => setContent('headline_highlight', event.target.value)} />
                            </Field>
                            <Field label="Heading end" error={errors['content.headline_after']}>
                                <Input value={data.content.headline_after ?? ''} onChange={(event) => setContent('headline_after', event.target.value)} />
                            </Field>
                            <Field label="Description" error={errors['content.blurb']} className="sm:col-span-2">
                                <Textarea rows={3} value={data.content.blurb ?? ''} onChange={(event) => setContent('blurb', event.target.value)} />
                            </Field>
                            {menu.location === 'mega_services' && (
                                <>
                                    <Field label="View all label" error={errors['content.all_label']}>
                                        <Input value={data.content.all_label ?? ''} onChange={(event) => setContent('all_label', event.target.value)} />
                                    </Field>
                                    <Field label="View all URL" error={errors['content.all_url']}>
                                        <Input value={data.content.all_url ?? ''} onChange={(event) => setContent('all_url', event.target.value)} />
                                    </Field>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {data.items.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--field-line)] px-4 py-6 text-center text-[13px] text-[var(--mute)]">
                    No items yet. Use Add item to create the first one.
                </p>
            )}

            <div className="space-y-3">
                {data.items.map((item, index) => {
                    const children = item.children ?? [];
                    const itemOpen = openKeys.has(item._key) || hasErrors(`items.${index}.label`) || hasErrors(`items.${index}.url`) || hasErrors(`items.${index}.description`);
                    const childrenShown = children.length > 0 && (expandedKeys.has(item._key) || hasErrors(`items.${index}.children.`));

                    return (
                        <div
                            key={item._key}
                            className={`overflow-hidden rounded-xl border transition-colors duration-200 ${
                                childrenShown || itemOpen ? 'border-[var(--brand-2)]/30 bg-[var(--brand-2)]/[0.04]' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--field-line)]'
                            }`}
                        >
                            <MenuRow
                                item={item}
                                number={index + 1}
                                open={itemOpen}
                                onToggleOpen={() => toggleKey(setOpenKeys, item._key)}
                                onChange={(patch) => updateItem(index, patch)}
                                onDuplicate={() => duplicateItem(index)}
                                onDelete={() => setItems(data.items.filter((_, i) => i !== index))}
                                onMoveUp={index > 0 ? () => setItems(moveTo(data.items, index, index - 1)) : undefined}
                                onMoveDown={index < data.items.length - 1 ? () => setItems(moveTo(data.items, index, index + 1)) : undefined}
                                drag={dragProps('root', index, item._key)}
                                errors={errors}
                                errorPrefix={`items.${index}`}
                                isMega={menu.location === 'mega_services'}
                                isHeader={menu.location === 'header'}
                                expander={
                                    <button
                                        type="button"
                                        onClick={() => (children.length > 0 ? toggleKey(setExpandedKeys, item._key) : addChild(index))}
                                        className={GHOST_BUTTON}
                                        title={children.length === 0 ? 'Add a sub-item' : childrenShown ? 'Collapse sub-items' : `Show ${children.length} sub-item${children.length === 1 ? '' : 's'}`}
                                        aria-label={children.length === 0 ? `Add a sub-item to ${item.label || 'item'}` : `${childrenShown ? 'Collapse' : 'Expand'} sub-items of ${item.label || 'item'}`}
                                        aria-expanded={children.length > 0 ? childrenShown : undefined}
                                    >
                                        <Icon name="chevron" className={`h-4 w-4 transition-transform duration-200 ${childrenShown ? 'rotate-90' : ''} ${children.length === 0 ? 'opacity-30' : ''}`} />
                                    </button>
                                }
                                footerAction={children.length === 0 && (
                                    <button
                                        type="button"
                                        onClick={() => addChild(index)}
                                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-1)] transition-opacity hover:opacity-80"
                                    >
                                        <Icon name="plusCircle" className="h-4 w-4" /> Add sub-item
                                    </button>
                                )}
                            />

                            {childrenShown && (
                                <div className="mx-3 mb-3 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] sm:ml-10">
                                    <div className="divide-y divide-[var(--line)]">
                                        {children.map((childItem, childIndex) => (
                                            <MenuRow
                                                key={childItem._key}
                                                item={childItem}
                                                number={`${index + 1}.${childIndex + 1}`}
                                                child
                                                open={openKeys.has(childItem._key) || hasErrors(`items.${index}.children.${childIndex}.`)}
                                                onToggleOpen={() => toggleKey(setOpenKeys, childItem._key)}
                                                onChange={(patch) => updateChild(index, childIndex, patch)}
                                                onDuplicate={() => duplicateChild(index, childIndex)}
                                                onDelete={() => updateItem(index, { children: children.filter((_, i) => i !== childIndex) })}
                                                onMoveUp={childIndex > 0 ? () => updateItem(index, { children: moveTo(children, childIndex, childIndex - 1) }) : undefined}
                                                onMoveDown={childIndex < children.length - 1 ? () => updateItem(index, { children: moveTo(children, childIndex, childIndex + 1) }) : undefined}
                                                drag={dragProps(`children:${index}`, childIndex, childItem._key)}
                                                errors={errors}
                                                errorPrefix={`items.${index}.children.${childIndex}`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addChild(index)}
                                        className="flex w-full items-center gap-2 border-t border-[var(--line)] px-4 py-3 text-[13px] font-semibold text-[var(--brand-1)] transition-colors hover:bg-[var(--brand-1)]/5"
                                    >
                                        <Icon name="plusCircle" className="h-4 w-4" /> Add sub-item
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}

export default function MenusIndex({ menus }) {
    const [activeTab, setActiveTab] = useState('header');
    const { data, setData, put, processing, errors, isDirty, reset, clearErrors } = useForm({
        menus: menus.map((menu) => ({
            location: menu.location,
            name: menu.label,
            content: menu.content ?? {},
            items: menu.items.map((item) => withKey({
                ...item,
                description: item.description ?? '',
                children: (item.children ?? []).map((child) => ({
                    ...child,
                    description: child.description ?? '',
                })),
            })),
        })),
    });

    const updateMenu = (index, value) => {
        const next = [...data.menus];
        next[index] = value;
        setData('menus', next);
    };

    const submit = (event) => {
        event.preventDefault();
        put('/admin/menus', { preserveScroll: true });
    };

    const discard = () => {
        reset();
        clearErrors();
    };

    return (
        <>
            <Head title="Menus | Marketorr Admin" />
            <PageHeader
                title="Menus"
                subtitle="Build the header, footer and mega menus as ordered navigation trees."
            />

            <div className={`mb-6 ${TAB_BAR_CLASS}`} role="tablist" aria-label="Menu areas">
                {MENU_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-[12px] font-bold uppercase tracking-[0.12em] ${tabClass(activeTab === tab.id)}`}
                        style={activeTab === tab.id ? TAB_GRADIENT : undefined}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="pb-24">
                {MENU_TABS.map((tab) => (
                    <div
                        key={tab.id}
                        role="tabpanel"
                        hidden={activeTab !== tab.id}
                        className="space-y-6"
                    >
                        {menus.map((menu, index) => ({ menu, index }))
                            .filter(({ menu }) => menu.group === tab.id)
                            .sort((a, b) => (MENU_DISPLAY_ORDER[a.menu.location] ?? 100) - (MENU_DISPLAY_ORDER[b.menu.location] ?? 100))
                            .map(({ menu, index }) => {
                                const prefix = `menus.${index}.`;
                                const scopedErrors = Object.fromEntries(
                                    Object.entries(errors)
                                        .filter(([key]) => key.startsWith(prefix))
                                        .map(([key, value]) => [key.slice(prefix.length), value]),
                                );

                                return (
                                    <MenuEditor
                                        key={menu.location}
                                        menu={menu}
                                        data={data.menus[index]}
                                        setData={(key, value) => updateMenu(index, { ...data.menus[index], [key]: value })}
                                        errors={scopedErrors}
                                    />
                                );
                            })}
                    </div>
                ))}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:px-6 lg:left-64 lg:px-10">
                    <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
                        <p className="flex items-center gap-2 text-[13px] text-[var(--mute)]">
                            <Icon name={isDirty ? 'dot' : 'check'} className={`h-4 w-4 ${isDirty ? 'text-[var(--brand-2)]' : 'text-[#22c55e]'}`} />
                            {isDirty ? 'You have unsaved menu changes.' : 'All menu changes are saved.'}
                        </p>
                        <div className="flex items-center gap-3">
                            <Button type="button" variant="secondary" onClick={discard} disabled={processing || !isDirty}>
                                Reset changes
                            </Button>
                            <Button type="submit" disabled={processing || !isDirty}>
                                {processing ? 'Saving…' : 'Save all changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

MenusIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
