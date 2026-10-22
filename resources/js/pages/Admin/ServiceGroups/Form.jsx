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
    StickyColumn,
    Textarea,
    slugify,
} from '../../../components/admin/ui';

export default function ServiceGroupForm({ group, statuses }) {
    const isEdit = Boolean(group);
    const [slugLocked, setSlugLocked] = useState(isEdit);

    const { data, setData, post, put, processing, errors, isDirty } = useForm({
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

            {/* Both columns start on the same line and stick: whichever is shorter stays beside the other while scrolling. */}
            <form onSubmit={submit} className="grid items-start gap-6 pb-24 lg:grid-cols-3">
                <StickyColumn bottomOffset={96} className="space-y-6 lg:col-span-2">
                    <Panel title="Basics">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Name" error={errors.name} required>
                                <Input value={data.name} onChange={(e) => onNameChange(e.target.value)} placeholder="Branding" />
                            </Field>
                            <Field label="Slug" error={errors.slug} required hint={`Opens this tab: /services#${slugify(data.slug) || 'your-tab'} · lowercase letters, numbers and hyphens`}>
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
                </StickyColumn>

                <StickyColumn bottomOffset={96} className="space-y-6">
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

                </StickyColumn>
                {/* The page's one save button, always on screen at the bottom. */}
                <div className="fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:left-64">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                        <p className={`flex items-center gap-2 text-[13px] font-semibold ${isDirty ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]'}`}>
                            <span className={`h-2 w-2 rounded-full ${isDirty ? 'bg-[#f5a524]' : 'bg-[var(--field-line)]'}`} aria-hidden />
                            {isDirty ? 'You have unsaved changes.' : 'No unsaved changes.'}
                        </p>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create tab'}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}

ServiceGroupForm.layout = (page) => <AdminLayout>{page}</AdminLayout>;
