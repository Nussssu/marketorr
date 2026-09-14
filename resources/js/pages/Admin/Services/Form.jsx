import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
    Button,
    ColorInput,
    Field,
    Input,
    PageHeader,
    Panel,
    RepeatableList,
    RepeatableRows,
    Select,
    Textarea,
    slugify,
} from '../../../components/admin/ui';

export default function ServiceForm({ service, statuses }) {
    const isEdit = Boolean(service);
    const [slugLocked, setSlugLocked] = useState(isEdit);

    const { data, setData, post, put, processing, errors } = useForm({
        slug: service?.slug ?? '',
        index_label: service?.index_label ?? '',
        name: service?.name ?? '',
        short: service?.short ?? '',
        description: service?.description ?? '',
        accent: service?.accent ?? '#891FFB',
        accent_to: service?.accent_to ?? '',
        capabilities: service?.capabilities?.length ? service.capabilities : [''],
        deliverables: service?.deliverables?.length ? service.deliverables : [''],
        outcomes: service?.outcomes?.length ? service.outcomes : [{ value: '', label: '' }],
        status: service?.status ?? 'published',
        sort_order: service?.sort_order ?? '',
    });

    const onNameChange = (value) => {
        setData((current) => ({
            ...current,
            name: value,
            slug: slugLocked ? current.slug : slugify(value),
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/services/${service.id}`);
        } else {
            post('/admin/services');
        }
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'New'} service — Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${service.name}` : 'New service'}
                subtitle="Fields map one-to-one onto the public service page."
            >
                <Button as="link" href="/admin/services" variant="secondary">Cancel</Button>
            </PageHeader>

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Basics">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Name" error={errors.name} required>
                                <Input value={data.name} onChange={(e) => onNameChange(e.target.value)} />
                            </Field>
                            <Field label="Display index" error={errors.index_label} required hint="Shown beside the name, e.g. 02">
                                <Input value={data.index_label} onChange={(e) => setData('index_label', e.target.value)} placeholder="02" />
                            </Field>
                            <Field label="Slug" error={errors.slug} required hint="Used in the URL: /services/your-slug" className="sm:col-span-2">
                                <Input
                                    value={data.slug}
                                    onChange={(e) => {
                                        setSlugLocked(true);
                                        setData('slug', e.target.value);
                                    }}
                                />
                            </Field>
                            <Field label="Tagline" error={errors.short} required className="sm:col-span-2">
                                <Input value={data.short} onChange={(e) => setData('short', e.target.value)} placeholder="Websites engineered to convert." />
                            </Field>
                            <Field label="Description" error={errors.description} required className="sm:col-span-2">
                                <Textarea rows={4} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </Field>
                            <Field label="Accent colour" error={errors.accent} required>
                                <ColorInput value={data.accent} onChange={(v) => setData('accent', v)} />
                            </Field>
                            <Field label="Gradient end" error={errors.accent_to} hint="Optional second colour.">
                                <ColorInput value={data.accent_to ?? ''} onChange={(v) => setData('accent_to', v)} />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="Capabilities" description="Shown as tags on the service page.">
                        <RepeatableList
                            values={data.capabilities}
                            onChange={(v) => setData('capabilities', v)}
                            placeholder="UX Strategy"
                            addLabel="Add capability"
                            errors={errors}
                            name="capabilities"
                        />
                        {errors.capabilities && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.capabilities}</p>}
                    </Panel>

                    <Panel title="Deliverables" description="The “what you get” list.">
                        <RepeatableList
                            values={data.deliverables}
                            onChange={(v) => setData('deliverables', v)}
                            placeholder="Design system"
                            addLabel="Add deliverable"
                            errors={errors}
                            name="deliverables"
                        />
                        {errors.deliverables && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.deliverables}</p>}
                    </Panel>

                    <Panel title="Outcomes" description="Headline stat blocks — value and label.">
                        <RepeatableRows
                            values={data.outcomes}
                            onChange={(v) => setData('outcomes', v)}
                            fields={[
                                { key: 'value', placeholder: '2.4x' },
                                { key: 'label', placeholder: 'Avg. conversion lift' },
                            ]}
                            addLabel="Add outcome"
                            errors={errors}
                            name="outcomes"
                        />
                        {errors.outcomes && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.outcomes}</p>}
                    </Panel>
                </div>

                <div className="space-y-6">
                    <Panel title="Publishing">
                        <div className="space-y-5">
                            <Field label="Status" error={errors.status} required>
                                <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Sort order" error={errors.sort_order} hint="Leave empty to append to the end.">
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.sort_order ?? ''}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                />
                            </Field>
                        </div>
                    </Panel>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create service'}
                    </Button>
                </div>
            </form>
        </>
    );
}

ServiceForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
