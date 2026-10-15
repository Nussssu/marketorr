import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, Field, Input, PageHeader, Panel, Toggle } from '../../../components/admin/ui';

const BLANK = { label: '', url: '', opens_in_new_tab: false, enabled: true, children: [] };
const MENU_TABS = [
    { id: 'header', label: 'Header' },
    { id: 'footer', label: 'Footer' },
    { id: 'mega', label: 'Mega Menu' },
];

/** One editable menu location. The whole tree is saved in a single request. */
function MenuEditor({ menu }) {
    const { data, setData, put, processing, errors } = useForm({
        items: menu.items.map((item) => ({
            ...item,
            children: item.children ?? [],
        })),
    });

    const setItems = (items) => setData('items', items);

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

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/menus/${menu.location}`, { preserveScroll: true });
    };

    return (
        <Panel title={menu.label} description={`${data.items.length} top-level item(s). Add nested items to build the hierarchy.`}>
            <form onSubmit={submit}>
                <div className="space-y-3">
                    {data.items.map((item, index) => (
                        <div key={index} className="rounded-lg border border-[var(--field-line)] p-4">
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
                            </div>

                            {item.children.length > 0 && (
                                <div className="mt-4 space-y-3 border-l-2 border-[var(--line)] pl-4">
                                    {item.children.map((child, childIndex) => (
                                        <div key={childIndex} className="grid gap-4 sm:grid-cols-[auto_1fr_1fr]">
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
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Save menu'}
                    </Button>
                </div>
            </form>
        </Panel>
    );
}

export default function MenusIndex({ menus }) {
    const [activeTab, setActiveTab] = useState('header');

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

            <div>
                {MENU_TABS.map((tab) => (
                    <div key={tab.id} role="tabpanel" hidden={activeTab !== tab.id} className="space-y-6">
                        {menus.filter((menu) => menu.group === tab.id).map((menu) => (
                            <MenuEditor key={menu.location} menu={menu} />
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}

MenusIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
