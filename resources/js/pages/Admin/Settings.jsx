import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    Button,
    Field,
    Input,
    PageHeader,
    Panel,
    RepeatableList,
    RepeatableRows,
    Textarea,
} from '../../components/admin/ui';

export default function Settings({ settings }) {
    const [ogPreview, setOgPreview] = useState(settings.og_image_url);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        site_name: settings.site_name ?? '',
        contact_email: settings.contact_email ?? '',
        contact_phone: settings.contact_phone ?? '',
        location_text: settings.location_text ?? '',
        social_linkedin: settings.social_linkedin ?? '',
        social_behance: settings.social_behance ?? '',
        social_dribbble: settings.social_dribbble ?? '',
        social_instagram: settings.social_instagram ?? '',
        hero_eyebrow: settings.hero_eyebrow ?? '',
        hero_heading_lines: settings.hero_heading_lines?.length ? settings.hero_heading_lines : [''],
        hero_subtext: settings.hero_subtext ?? '',
        about_text: settings.about_text ?? '',
        about_metrics: settings.about_metrics?.length ? settings.about_metrics : [{ value: '', suffix: '', label: '' }],
        meta_default_title: settings.meta_default_title ?? '',
        meta_default_description: settings.meta_default_description ?? '',
        meta_default_og_image: null,
    });

    const onOgChange = (file) => {
        setData('meta_default_og_image', file);
        setOgPreview(file ? URL.createObjectURL(file) : settings.og_image_url);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings', { forceFormData: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Settings — Marketorr Admin" />
            <PageHeader title="Site settings" subtitle="Content here appears across the public site immediately after saving." />

            <form onSubmit={submit} className="space-y-6">
                <Panel title="General">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Site name" error={errors.site_name} required>
                            <Input value={data.site_name} onChange={(e) => setData('site_name', e.target.value)} />
                        </Field>
                        <Field label="Contact email" error={errors.contact_email} required hint="Inquiry notifications are sent here.">
                            <Input type="email" value={data.contact_email} onChange={(e) => setData('contact_email', e.target.value)} />
                        </Field>
                        <Field label="Contact phone" error={errors.contact_phone} hint="Leave empty to hide the phone block.">
                            <Input value={data.contact_phone ?? ''} onChange={(e) => setData('contact_phone', e.target.value)} placeholder="+880 1234 567890" />
                        </Field>
                        <Field label="Location" error={errors.location_text} required>
                            <Input value={data.location_text} onChange={(e) => setData('location_text', e.target.value)} />
                        </Field>
                    </div>
                </Panel>

                <Panel title="Social links" description="Empty fields are hidden from the footer and contact section.">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="LinkedIn" error={errors.social_linkedin}>
                            <Input type="url" value={data.social_linkedin ?? ''} onChange={(e) => setData('social_linkedin', e.target.value)} />
                        </Field>
                        <Field label="Behance" error={errors.social_behance}>
                            <Input type="url" value={data.social_behance ?? ''} onChange={(e) => setData('social_behance', e.target.value)} />
                        </Field>
                        <Field label="Dribbble" error={errors.social_dribbble}>
                            <Input type="url" value={data.social_dribbble ?? ''} onChange={(e) => setData('social_dribbble', e.target.value)} />
                        </Field>
                        <Field label="Instagram" error={errors.social_instagram}>
                            <Input type="url" value={data.social_instagram ?? ''} onChange={(e) => setData('social_instagram', e.target.value)} />
                        </Field>
                    </div>
                </Panel>

                <Panel title="Hero" description="The opening section of the home page.">
                    <div className="grid gap-5">
                        <Field label="Eyebrow" error={errors.hero_eyebrow} required>
                            <Input value={data.hero_eyebrow} onChange={(e) => setData('hero_eyebrow', e.target.value)} />
                        </Field>
                        <Field label="Heading lines" error={errors.hero_heading_lines} required hint="One line per row — the last line gets the brand gradient.">
                            <RepeatableList
                                values={data.hero_heading_lines}
                                onChange={(v) => setData('hero_heading_lines', v)}
                                placeholder="We turn"
                                addLabel="Add line"
                                errors={errors}
                                name="hero_heading_lines"
                            />
                        </Field>
                        <Field label="Subtext" error={errors.hero_subtext} required>
                            <Textarea rows={3} value={data.hero_subtext} onChange={(e) => setData('hero_subtext', e.target.value)} />
                        </Field>
                    </div>
                </Panel>

                <Panel title="About" description="Paragraph and the stat blocks beneath it.">
                    <div className="grid gap-5">
                        <Field label="About text" error={errors.about_text} required>
                            <Textarea rows={5} value={data.about_text} onChange={(e) => setData('about_text', e.target.value)} />
                        </Field>
                        <Field label="Metrics" error={errors.about_metrics} required hint="Value counts up on scroll; suffix is appended, e.g. 120 + “+”.">
                            <RepeatableRows
                                values={data.about_metrics}
                                onChange={(v) => setData('about_metrics', v)}
                                fields={[
                                    { key: 'value', placeholder: '120', type: 'number' },
                                    { key: 'suffix', placeholder: '+' },
                                    { key: 'label', placeholder: 'Projects delivered' },
                                ]}
                                addLabel="Add metric"
                                errors={errors}
                                name="about_metrics"
                            />
                        </Field>
                    </div>
                </Panel>

                <Panel title="SEO defaults">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Default title" error={errors.meta_default_title} required className="sm:col-span-2">
                            <Input value={data.meta_default_title} onChange={(e) => setData('meta_default_title', e.target.value)} />
                        </Field>
                        <Field label="Default description" error={errors.meta_default_description} required className="sm:col-span-2">
                            <Textarea rows={3} value={data.meta_default_description} onChange={(e) => setData('meta_default_description', e.target.value)} />
                        </Field>
                        <Field label="Default OG image" error={errors.meta_default_og_image} hint="JPG, PNG or WebP, up to 4 MB.">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => onOgChange(e.target.files?.[0] ?? null)}
                                className="w-full text-[13px] text-[var(--mute)] file:mr-3 file:rounded-lg file:border file:border-[var(--field-line)] file:bg-[var(--chip)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-[var(--ink)]"
                            />
                        </Field>
                        {ogPreview && (
                            <div>
                                <img src={ogPreview} alt="" className="aspect-[1.91/1] w-full max-w-xs rounded-lg border border-[var(--line)] object-cover" />
                            </div>
                        )}
                    </div>
                </Panel>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving…' : 'Save settings'}
                    </Button>
                </div>
            </form>
        </>
    );
}

Settings.layout = (page) => <AdminLayout>{page}</AdminLayout>;
