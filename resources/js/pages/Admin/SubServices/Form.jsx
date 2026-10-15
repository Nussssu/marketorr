import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import MediaPickerField from '../../../components/admin/MediaPickerField';
import {
    Button,
    ColorInput,
    Field,
    Input,
    PageHeader,
    Panel,
    RepeatableList,
    Select,
    Textarea,
    slugify,
} from '../../../components/admin/ui';

export default function SubServiceForm({ item, groups, statuses }) {
    const isEdit = Boolean(item);
    const [slugLocked, setSlugLocked] = useState(isEdit);

    const { data, setData, post, put, processing, errors } = useForm({
        service_group_id: item?.service_group_id ?? groups[0]?.id ?? '',
        slug: item?.slug ?? '',
        name: item?.name ?? '',
        short: item?.short ?? '',
        description: item?.description ?? '',
        deliverables: item?.deliverables?.length ? item.deliverables : [''],
        image: item?.image ?? '',
        image_alt: item?.image_alt ?? '',
        accent: item?.accent ?? '#507AF4',
        related_match: item?.related_match?.length ? item.related_match : [''],
        related_pin: item?.related_pin?.length ? item.related_pin : [''],
        case_study: item?.case_study ? JSON.stringify(item.case_study, null, 2) : '',
        status: item?.status ?? 'published',
        sort_order: item?.sort_order ?? '',
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
            put(`/admin/sub-services/${item.id}`);
        } else {
            post('/admin/sub-services');
        }
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'New'} sub-service | Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${item.name}` : 'New sub-service'}
                subtitle="Fields map one-to-one onto the public sub-service page."
            >
                <Button as="link" href="/admin/sub-services" variant="secondary">Cancel</Button>
            </PageHeader>

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Basics">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Tab" error={errors.service_group_id} required className="sm:col-span-2">
                                <Select value={data.service_group_id} onChange={(e) => setData('service_group_id', e.target.value)}>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Name" error={errors.name} required>
                                <Input value={data.name} onChange={(e) => onNameChange(e.target.value)} />
                            </Field>
                            <Field label="Slug" error={errors.slug} required hint="Used in the URL: /services/{tab}/{slug}">
                                <Input
                                    value={data.slug}
                                    onChange={(e) => {
                                        setSlugLocked(true);
                                        setData('slug', e.target.value);
                                    }}
                                />
                            </Field>
                            <Field label="Tagline" error={errors.short} className="sm:col-span-2">
                                <Input value={data.short ?? ''} onChange={(e) => setData('short', e.target.value)} placeholder="Positioning that makes choosing you obvious." />
                            </Field>
                            <Field label="Description" error={errors.description} className="sm:col-span-2">
                                <Textarea rows={4} value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} />
                            </Field>
                            <Field label="Accent colour" error={errors.accent} required>
                                <ColorInput value={data.accent} onChange={(v) => setData('accent', v)} />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="Showcase image" description="The visual the tile, transition and hero all share. Empty renders the placeholder plate.">
                        <div className="space-y-4">
                            <MediaPickerField
                                label="Image"
                                error={errors.image}
                                hint="Choose an asset from the library. Upload target: 16:10, 1600×1000."
                                preview={typeof data.image === 'string' ? data.image : ''}
                                value={typeof data.image === 'string' ? data.image : ''}
                                onChange={(url) => setData('image', url)}
                            />
                            <Field label="Image alt text" error={errors.image_alt}>
                                <Input value={data.image_alt ?? ''} onChange={(e) => setData('image_alt', e.target.value)} />
                            </Field>
                        </div>
                    </Panel>

                    <Panel title="Deliverables" description="The “what you get” list on the dedicated page.">
                        <RepeatableList
                            values={data.deliverables}
                            onChange={(v) => setData('deliverables', v)}
                            placeholder="Positioning statement"
                            addLabel="Add deliverable"
                            errors={errors}
                            name="deliverables"
                        />
                        {errors.deliverables && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.deliverables}</p>}
                    </Panel>

                    <Panel title="Related work" description="Pinned project slugs lead; matching tags then fill from the same portfolio.">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <RepeatableList
                                    values={data.related_match}
                                    onChange={(v) => setData('related_match', v)}
                                    placeholder="Brand Identity"
                                    addLabel="Add match tag"
                                    errors={errors}
                                    name="related_match"
                                />
                                {errors.related_match && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.related_match}</p>}
                            </div>
                            <div>
                                <RepeatableList
                                    values={data.related_pin}
                                    onChange={(v) => setData('related_pin', v)}
                                    placeholder="project-slug"
                                    addLabel="Add pinned slug"
                                    errors={errors}
                                    name="related_pin"
                                />
                                {errors.related_pin && <p className="mt-2 text-[12px] text-[#ff6b6b]">{errors.related_pin}</p>}
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Case study" description="Optional long-form story. Advanced: valid JSON with meta and sections, as seeded.">
                        <Field label="Case study JSON" error={errors.case_study} hint="Leave empty for no case study.">
                            <Textarea
                                rows={8}
                                className="font-mono text-[12px]"
                                value={data.case_study ?? ''}
                                onChange={(e) => setData('case_study', e.target.value)}
                                placeholder='{"meta": "...", "sections": [...]}'
                            />
                        </Field>
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
                            <Field label="Sort order" error={errors.sort_order} hint="Leave empty to append to the end of its tab.">
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
                        {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create sub-service'}
                    </Button>
                </div>
            </form>
        </>
    );
}

SubServiceForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
