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
    Toggle,
} from '../../components/admin/ui';

/** Upload field wired to its own live preview. */
function ImageField({ label, hint, accept, error, preview, onChange, className = '' }) {
    return (
        <Field label={label} error={error} hint={hint} className={className}>
            <input
                type="file"
                accept={accept}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                className="w-full text-[13px] text-[var(--mute)] file:mr-3 file:rounded-lg file:border file:border-[var(--field-line)] file:bg-[var(--chip)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-[var(--ink)]"
            />
            {preview && (
                <img src={preview} alt="" className="mt-3 h-14 w-auto max-w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] object-contain p-2" />
            )}
        </Field>
    );
}

export default function Settings({ settings }) {
    const [ogPreview, setOgPreview] = useState(settings.og_image_url);
    const [logoPreview, setLogoPreview] = useState(settings.logo_url);
    const [logoDarkPreview, setLogoDarkPreview] = useState(settings.logo_dark_url);
    const [faviconPreview, setFaviconPreview] = useState(settings.favicon_url);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        site_name: settings.site_name ?? '',
        logo: null,
        logo_dark: null,
        favicon: null,
        contact_email: settings.contact_email ?? '',
        contact_phone: settings.contact_phone ?? '',
        location_text: settings.location_text ?? '',
        address: settings.address ?? '',
        directions_url: settings.directions_url ?? '',
        copyright_text: settings.copyright_text ?? '',
        footer_intro: settings.footer_intro ?? '',
        social_linkedin: settings.social_linkedin ?? '',
        social_facebook: settings.social_facebook ?? '',
        social_behance: settings.social_behance ?? '',
        social_dribbble: settings.social_dribbble ?? '',
        social_instagram: settings.social_instagram ?? '',
        social_x: settings.social_x ?? '',
        social_youtube: settings.social_youtube ?? '',
        hero_eyebrow: settings.hero_eyebrow ?? '',
        hero_heading_lines: settings.hero_heading_lines?.length ? settings.hero_heading_lines : [''],
        hero_subtext: settings.hero_subtext ?? '',
        about_text: settings.about_text ?? '',
        about_metrics: settings.about_metrics?.length ? settings.about_metrics : [{ value: '', suffix: '', label: '' }],
        meta_default_title: settings.meta_default_title ?? '',
        meta_default_description: settings.meta_default_description ?? '',
        meta_default_og_image: null,
        head_scripts: settings.head_scripts ?? '',
        body_scripts: settings.body_scripts ?? '',
        robots_txt: settings.robots_txt ?? '',
        schema_markup: settings.schema_markup ?? '',
        sitemap_enabled: settings.sitemap_enabled ?? true,
    });

    /** Swaps an upload in and previews it without waiting for the save. */
    const onImageChange = (field, setPreview, fallback) => (file) => {
        setData(field, file);
        setPreview(file ? URL.createObjectURL(file) : fallback);
    };

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

                <Panel title="Branding" description="Logos and favicon. Leave empty to keep the built-in mark.">
                    <div className="grid gap-5 sm:grid-cols-3">
                        <ImageField
                            label="Logo (light theme)"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            hint="SVG, PNG or WebP. Max 2 MB."
                            error={errors.logo}
                            preview={logoPreview}
                            onChange={onImageChange('logo', setLogoPreview, settings.logo_url)}
                        />
                        <ImageField
                            label="Logo (dark theme)"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            hint="Optional variant for dark mode."
                            error={errors.logo_dark}
                            preview={logoDarkPreview}
                            onChange={onImageChange('logo_dark', setLogoDarkPreview, settings.logo_dark_url)}
                        />
                        <ImageField
                            label="Favicon"
                            accept="image/png,image/svg+xml,image/x-icon"
                            hint="PNG, SVG or ICO. Max 512 KB."
                            error={errors.favicon}
                            preview={faviconPreview}
                            onChange={onImageChange('favicon', setFaviconPreview, settings.favicon_url)}
                        />
                    </div>
                </Panel>

                <Panel title="Contact & footer">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Office address" error={errors.address} className="sm:col-span-2">
                            <Input value={data.address ?? ''} onChange={(e) => setData('address', e.target.value)} />
                        </Field>
                        <Field label="Directions URL" error={errors.directions_url} hint="Linked from the contact map.">
                            <Input type="url" value={data.directions_url ?? ''} onChange={(e) => setData('directions_url', e.target.value)} />
                        </Field>
                        <Field
                            label="Copyright line"
                            error={errors.copyright_text}
                            hint="Use {year} and {site} as placeholders."
                        >
                            <Input value={data.copyright_text ?? ''} onChange={(e) => setData('copyright_text', e.target.value)} />
                        </Field>
                        <Field label="Footer intro" error={errors.footer_intro} className="sm:col-span-2">
                            <Textarea rows={3} value={data.footer_intro ?? ''} onChange={(e) => setData('footer_intro', e.target.value)} />
                        </Field>
                    </div>
                </Panel>

                <Panel title="Social links" description="Empty fields are hidden from the footer and contact section.">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="LinkedIn" error={errors.social_linkedin}>
                            <Input type="url" value={data.social_linkedin ?? ''} onChange={(e) => setData('social_linkedin', e.target.value)} />
                        </Field>
                        <Field label="Facebook" error={errors.social_facebook}>
                            <Input type="url" value={data.social_facebook ?? ''} onChange={(e) => setData('social_facebook', e.target.value)} />
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
                        <Field label="X (Twitter)" error={errors.social_x}>
                            <Input type="url" value={data.social_x ?? ''} onChange={(e) => setData('social_x', e.target.value)} />
                        </Field>
                        <Field label="YouTube" error={errors.social_youtube}>
                            <Input type="url" value={data.social_youtube ?? ''} onChange={(e) => setData('social_youtube', e.target.value)} />
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

                <Panel title="Search engines" description="robots.txt and the XML sitemap are generated from live content.">
                    <div className="grid gap-5">
                        <Toggle
                            checked={data.sitemap_enabled}
                            onChange={(value) => setData('sitemap_enabled', value)}
                            label="Publish /sitemap.xml"
                            hint="Lists every published, indexable page, project and service."
                        />
                        <Field
                            label="robots.txt"
                            error={errors.robots_txt}
                            hint="Leave blank to serve the generated default, which points at the sitemap."
                        >
                            <Textarea
                                rows={5}
                                className="font-mono text-[12px]"
                                value={data.robots_txt ?? ''}
                                onChange={(e) => setData('robots_txt', e.target.value)}
                                placeholder={'User-agent: *\nDisallow: /admin'}
                            />
                        </Field>
                        <Field
                            label="Site-wide schema markup (JSON-LD)"
                            error={errors.schema_markup}
                            hint="Valid JSON, e.g. your Organization record."
                        >
                            <Textarea
                                rows={6}
                                className="font-mono text-[12px]"
                                value={data.schema_markup ?? ''}
                                onChange={(e) => setData('schema_markup', e.target.value)}
                                placeholder='{"@context":"https://schema.org","@type":"Organization"}'
                            />
                        </Field>
                    </div>
                </Panel>

                <Panel
                    title="Custom scripts"
                    description="Injected verbatim into every page. Only add code you trust — a mistake here can break the whole site."
                >
                    <div className="grid gap-5">
                        <Field label="Head scripts" error={errors.head_scripts} hint="Analytics and verification tags.">
                            <Textarea
                                rows={5}
                                className="font-mono text-[12px]"
                                value={data.head_scripts ?? ''}
                                onChange={(e) => setData('head_scripts', e.target.value)}
                                placeholder="<script>…</script>"
                            />
                        </Field>
                        <Field label="Body scripts" error={errors.body_scripts} hint="Chat widgets and anything that must load last.">
                            <Textarea
                                rows={5}
                                className="font-mono text-[12px]"
                                value={data.body_scripts ?? ''}
                                onChange={(e) => setData('body_scripts', e.target.value)}
                            />
                        </Field>
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
