import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, Field, Input, PageHeader, Panel, RepeatableList, Textarea, Toggle } from '../../../components/admin/ui';

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

/** One editable menu location within the page-wide save form. */
function MenuEditor({ menu, data, setData, errors }) {

    const setItems = (items) => setData('items', items);
    const setContent = (key, value) => setData('content', { ...data.content, [key]: value });

    const updateItem = (index, patch) =>
        setItems(data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= data.items.length) return;

        const next = [...data.items];
        [next[index], next[target]] = [next[target], next[index]];
        setItems(next);
    };

    const updateChild = (parentIndex, childIndex, patch) =>
        updateItem(parentIndex, {
            children: data.items[parentIndex].children.map((child, i) =>
                i === childIndex ? { ...child, ...patch } : child,
            ),
        });

    const moveChild = (parentIndex, childIndex, direction) => {
        const children = [...data.items[parentIndex].children];
        const target = childIndex + direction;
        if (target < 0 || target >= children.length) return;

        [children[childIndex], children[target]] = [children[target], children[childIndex]];
        updateItem(parentIndex, { children });
    };

    return (
        <Panel className="h-full" title={data.name || menu.label} description={`${data.items.length} item(s) sit directly under this parent label.`}>
            {menu.note && (
                <p className="mb-4 rounded-lg border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 px-4 py-3 text-[12px] text-[var(--mute)]">
                    {menu.note}
                </p>
            )}
            <div>
                <div className="mb-5 rounded-xl border border-[var(--brand-1)]/25 bg-gradient-to-r from-[var(--brand-1)]/10 via-[var(--brand-2)]/8 to-[var(--brand-3)]/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-1)] shadow-[0_0_0_4px_rgba(var(--brand-1-rgb),0.12)]" aria-hidden />
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Parent label</span>
                    </div>
                    <Field label="Label" error={errors.name}>
                        <Input value={data.name} onChange={(event) => setData('name', event.target.value)} />
                    </Field>
                </div>
                {Object.keys(data.content).length > 0 && (
                    <div className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-3)] shadow-[0_0_0_4px_rgba(var(--brand-3-rgb),0.12)]" aria-hidden />
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Menu text</span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
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
                    </div>
                )}
                <div className="ml-1 space-y-3 border-l-2 border-[var(--line)] pl-5">
                    {data.items.map((item, index) => (
                        <div key={index} className="relative rounded-lg border border-[var(--field-line)] bg-[var(--surface)] p-4 before:absolute before:-left-[22px] before:top-8 before:w-5 before:border-t-2 before:border-[var(--line)] after:absolute after:-left-[27px] after:top-[27px] after:h-2.5 after:w-2.5 after:rounded-full after:border-2 after:border-[var(--brand-2)] after:bg-[var(--surface)]">
                            <div className="flex items-start gap-3">
                                <div className="flex flex-col pt-2">
                                    <button
                                        type="button"
                                        onClick={() => move(index, -1)}
                                        disabled={index === 0}
                                        aria-label="Move item up"
                                        className="text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(index, 1)}
                                        disabled={index === data.items.length - 1}
                                        aria-label="Move item down"
                                        className="mt-1 text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]"
                                    >
                                        ▼
                                    </button>
                                </div>

                                <span className="mt-7 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-[var(--field-line)] px-1.5 font-mono text-[12px] font-bold text-[var(--ink)]" aria-label={`Item ${index + 1}`}>
                                    {index + 1}
                                </span>

                                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                    <Field label="Label" error={errors[`items.${index}.label`]}>
                                        <Input value={item.label} onChange={(e) => updateItem(index, { label: e.target.value })} />
                                    </Field>
                                    <Field label="URL" error={errors[`items.${index}.url`]}>
                                        <Input value={item.url} onChange={(e) => updateItem(index, { url: e.target.value })} placeholder="/about" />
                                    </Field>
                                    {menu.location === 'mega_services' && (
                                        <Field label="Supporting text" error={errors[`items.${index}.description`]} className="sm:col-span-2">
                                            <Input value={item.description ?? ''} onChange={(e) => updateItem(index, { description: e.target.value })} placeholder="Identities that demand attention." />
                                        </Field>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setItems(data.items.filter((_, i) => i !== index))}
                                    aria-label={`Remove ${item.label || 'item'}`}
                                    className="pt-2 text-[12px] text-[#ff6b6b] hover:opacity-80"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-6 border-t border-[var(--line)] pt-4">
                                <Toggle
                                    checked={item.enabled}
                                    onChange={(value) => updateItem(index, { enabled: value })}
                                    label="Visible"
                                />
                                <Toggle
                                    checked={item.opens_in_new_tab}
                                    onChange={(value) => updateItem(index, { opens_in_new_tab: value })}
                                    label="Open in a new tab"
                                />
                                {menu.location === 'header' && (item.url === '/contact' || item.label.trim().toLowerCase() === 'contact') && (
                                    <>
                                        <Toggle
                                            checked={item.show_on_desktop}
                                            onChange={(value) => updateItem(index, { show_on_desktop: value })}
                                            label="Show on desktop"
                                        />
                                        <Toggle
                                            checked={item.show_on_mobile}
                                            onChange={(value) => updateItem(index, { show_on_mobile: value })}
                                            label="Show on mobile"
                                        />
                                    </>
                                )}
                            </div>

                            {item.children.length > 0 && (
                                <div className="mt-4 space-y-3 border-l-2 border-[var(--line)] pl-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                        Under {item.label || `item ${index + 1}`}
                                    </p>
                                    {item.children.map((child, childIndex) => (
                                        <div key={childIndex} className="relative grid gap-4 rounded-lg bg-[var(--bg)] p-3 sm:grid-cols-[auto_1fr_1fr]">
                                            <span className="mt-7 flex h-7 min-w-9 items-center justify-center self-start rounded-md border border-[var(--line)] px-1.5 font-mono text-[11px] font-bold text-[var(--mute)]" aria-label={`Item ${index + 1}.${childIndex + 1}`}>
                                                {index + 1}.{childIndex + 1}
                                            </span>
                                            <Field label="Sub-item label" error={errors[`items.${index}.children.${childIndex}.label`]}>
                                                <Input
                                                    value={child.label}
                                                    onChange={(e) => updateChild(index, childIndex, { label: e.target.value })}
                                                />
                                            </Field>
                                            <div className="flex items-end gap-2">
                                                <Field label="Sub-item URL" className="flex-1" error={errors[`items.${index}.children.${childIndex}.url`]}>
                                                    <Input
                                                        value={child.url}
                                                        onChange={(e) => updateChild(index, childIndex, { url: e.target.value })}
                                                    />
                                                </Field>
                                                <button
                                                    type="button"
                                                    onClick={() => moveChild(index, childIndex, -1)}
                                                    disabled={childIndex === 0}
                                                    aria-label="Move sub-item up"
                                                    className="mb-2.5 rounded-lg border border-[var(--field-line)] px-2.5 py-2 text-[10px] text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveChild(index, childIndex, 1)}
                                                    disabled={childIndex === item.children.length - 1}
                                                    aria-label="Move sub-item down"
                                                    className="mb-2.5 rounded-lg border border-[var(--field-line)] px-2.5 py-2 text-[10px] text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ▼
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateItem(index, {
                                                            children: item.children.filter((_, i) => i !== childIndex),
                                                        })
                                                    }
                                                    aria-label="Remove sub-item"
                                                    className="mb-2.5 rounded-lg border border-[var(--field-line)] px-3 py-2 text-[12px] text-[#ff6b6b] hover:opacity-80"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-6 sm:col-span-2">
                                                <Toggle
                                                    checked={child.enabled}
                                                    onChange={(value) => updateChild(index, childIndex, { enabled: value })}
                                                    label="Visible"
                                                />
                                                <Toggle
                                                    checked={child.opens_in_new_tab}
                                                    onChange={(value) => updateChild(index, childIndex, { opens_in_new_tab: value })}
                                                    label="Open in a new tab"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => updateItem(index, { children: [...item.children, { ...BLANK }] })}
                                className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                            >
                                + Add sub-item
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => setItems([...data.items, { ...BLANK }])}
                        className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                    >
                        + Add item
                    </button>
                </div>
            </div>
        </Panel>
    );
}

export default function MenusIndex({ menus }) {
    const [activeTab, setActiveTab] = useState('header');
    const { data, setData, put, processing, errors, isDirty } = useForm({
        menus: menus.map((menu) => ({
            location: menu.location,
            name: menu.label,
            content: menu.content ?? {},
            items: menu.items.map((item) => ({
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

    return (
        <>
            <Head title="Menus | Marketorr Admin" />
            <PageHeader
                title="Menus"
                subtitle="Build the header, footer and mega menus as ordered navigation trees."
            />

            <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5" role="tablist" aria-label="Menu areas">
                {MENU_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-lg px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors ${
                            activeTab === tab.id
                                ? 'bg-[var(--chip)] text-[var(--ink-strong)]'
                                : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'
                        }`}
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
                        <p className="text-[12px] text-[var(--mute)]">
                            {isDirty ? 'You have unsaved menu changes.' : 'All menu changes are saved.'}
                        </p>
                        <Button type="submit" disabled={processing || !isDirty}>
                            {processing ? 'Saving…' : 'Save all changes'}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}

MenusIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
