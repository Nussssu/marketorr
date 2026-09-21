import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, ColorInput, Field, Input, PageHeader, Panel, Toggle } from '../../../components/admin/ui';

/** Human labels for the content keys a block stores. */
const LABELS = {
    message: 'Message',
    linkLabel: 'Link label',
    linkUrl: 'Link URL',
    accent: 'Background colour',
};

function BlockEditor({ block }) {
    const { data, setData, put, processing, errors } = useForm({
        name: block.name,
        enabled: block.enabled,
        content: block.content ?? {},
    });

    const setContent = (key, value) => setData('content', { ...data.content, [key]: value });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/blocks/${block.id}`, { preserveScroll: true });
    };

    return (
        <Panel title={block.name} description={block.enabled ? 'Currently showing on the site.' : 'Currently hidden.'}>
            <form onSubmit={submit} className="grid gap-5">
                {Object.entries(data.content).map(([key, value]) => (
                    <Field key={key} label={LABELS[key] ?? key} error={errors[`content.${key}`]}>
                        {key === 'accent' ? (
                            <ColorInput value={value ?? ''} onChange={(next) => setContent(key, next)} />
                        ) : (
                            <Input value={value ?? ''} onChange={(e) => setContent(key, e.target.value)} />
                        )}
                    </Field>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                    <Toggle
                        checked={data.enabled}
                        onChange={(value) => setData('enabled', value)}
                        label="Show on the site"
                    />
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Save block'}
                    </Button>
                </div>
            </form>
        </Panel>
    );
}

export default function BlocksIndex({ blocks }) {
    return (
        <>
            <Head title="Global blocks — Marketorr Admin" />
            <PageHeader title="Global blocks" subtitle="Reusable content shown across the whole site." />
            <div className="space-y-6">
                {blocks.map((block) => (
                    <BlockEditor key={block.id} block={block} />
                ))}
            </div>
        </>
    );
}

BlocksIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
