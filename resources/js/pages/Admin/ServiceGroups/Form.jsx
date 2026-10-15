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
    Select,
    Textarea,
    slugify,
} from '../../../components/admin/ui';

export default function ServiceGroupForm({ group, statuses }) {
    const isEdit = Boolean(group);
    const [slugLocked, setSlugLocked] = useState(isEdit);

    const { data, setData, post, put, processing, errors } = useForm({
        slug: group?.slug ?? '',
        name: group?.name ?? '',
        tagline: group?.tagline ?? '',
        accent: group?.accent ?? '#891FFB',
        status: group?.status ?? 'published',
        sort_order: group?.sort_order ?? '',
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
            put(`/admin/service-groups/${group.id}`);
        } else {
            post('/admin/service-groups');
        }
    };

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'New'} service tab | Marketorr Admin`} />
            <PageHeader
                title={isEdit ? `Edit ${group.name}` : 'New service tab'}
                subtitle="A tab on the public Services page. Sub-services filed under it render inside it."
            >
                <Button as="link" href="/admin/service-groups" variant="secondary">Cancel</Button>
            </PageHeader>

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Panel title="Basics">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Name" error={errors.name} required>
                                <Input value={data.name} onChange={(e) => onNameChange(e.target.value)} placeholder="Branding" />
                            </Field>
                            <Field label="Slug" error={errors.slug} required hint="Used in the URL: /services/your-tab">
                                <Input
                                    value={data.slug}
                                    onChange={(e) => {
                                        setSlugLocked(true);
                                        setData('slug', e.target.value);
                                    }}
                                />
                            </Field>
                            <Field label="Tagline" error={errors.tagline} className="sm:col-span-2">
                                <Textarea rows={2} value={data.tagline ?? ''} onChange={(e) => setData('tagline', e.target.value)} placeholder="Identities that demand attention." />
                            </Field>
                            <Field label="Accent colour" error={errors.accent} required>
                                <ColorInput value={data.accent} onChange={(v) => setData('accent', v)} />
                            </Field>
                        </div>
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
                        {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create tab'}
                    </Button>
                </div>
            </form>
        </>
    );
}

ServiceGroupForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
