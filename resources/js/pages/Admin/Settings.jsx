import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    Button,
    Field,
    Input,
    MediaPickerField,
    PageHeader,
    RepeatableList,
    RepeatableRows,
    Textarea,
    Toggle,
} from '../../components/admin/ui';

/** Upload field wired to its own live preview using Media Library. */
function ImageField({ label, hint, error, preview, onChange, className = '' }) {
    return (
        <Field label={label} error={error} hint={hint} className={className}>
            <MediaPickerField
                preview={preview}
                onChange={(url) => onChange(url)}
                hint={hint}
                error={error}
            />
        </Field>
    );
}

/** Accordion / Collapsible Widget Panel */
function AccordionWidget({ id, title, subtitle, badge, icon, isOpen, onToggle, children }) {
    return (
        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] transition-colors">
            <button
                type="button"
                onClick={() => onToggle(id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[var(--chip)]/40 focus:outline-none"
            >
                <div className="flex items-center gap-3.5">
                    {icon && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)]">
                            {icon}
                        </span>
                    )}
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink-strong)]">
                                {title}
                            </h2>
                            {badge && (
                                <span className="rounded bg-[var(--chip)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--mute)] border border-[var(--line)]">
                                    {badge}
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="mt-0.5 text-[12px] text-[var(--mute)]">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mute)] hidden sm:inline">
                        {isOpen ? 'Collapse' : 'Expand'}
                    </span>
                    <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition-transform duration-300 ease-out ${
                            isOpen ? 'rotate-180 border-[#1BE2EB]/40 bg-[#1BE2EB]/10 text-[#1BE2EB]' : ''
                        }`}
                        aria-hidden
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                </div>
            </button>

            <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-[var(--line)] p-6 pt-5 bg-[var(--surface)]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Settings({ settings }) {
    const [ogPreview, setOgPreview] = useState(settings.og_image_url);
    const [logoPreview, setLogoPreview] = useState(settings.logo_url);
    const [logoDarkPreview, setLogoDarkPreview] = useState(settings.logo_dark_url);
    const [faviconPreview, setFaviconPreview] = useState(settings.favicon_url);

    // Initial state: Top widget (general) open by default, all others collapsed
    const [openSections, setOpenSections] = useState({
        general: true,
        header_branding: false,
        footer_social: false,
        seo_meta: false,
        custom_scripts: false,
        hero_about: false,
    });

    const toggleSection = (key) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const expandAll = () => {
        setOpenSections({
            general: true,
            header_branding: true,
            footer_social: true,
            seo_meta: true,
            custom_scripts: true,
            hero_about: true,
        });
    };

    const collapseAll = () => {
        setOpenSections({
            general: false,
            header_branding: false,
            footer_social: false,
            seo_meta: false,
            custom_scripts: false,
            hero_about: false,
        });
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        site_name: settings.site_name ?? '',
        logo: null,
        logo_dark: null,
        favicon: null,
        header_sticky: settings.header_sticky ?? true,
        header_cta_text: settings.header_cta_text ?? 'Start a Project',
        header_cta_link: settings.header_cta_link ?? '/contact',
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

    /** Swaps an upload or chosen media asset in and previews it without waiting for the save. */
    const onImageChange = (field, setPreview, fallback) => (fileOrUrl) => {
        setData(field, fileOrUrl);
        if (typeof fileOrUrl === 'string') {
            setPreview(fileOrUrl || fallback);
        } else if (fileOrUrl instanceof File) {
            setPreview(URL.createObjectURL(fileOrUrl));
        } else {
            setPreview(fallback);
        }
    };

    const onOgChange = (fileOrUrl) => {
        setData('meta_default_og_image', fileOrUrl);
        if (typeof fileOrUrl === 'string') {
            setOgPreview(fileOrUrl || settings.og_image_url);
        } else if (fileOrUrl instanceof File) {
            setOgPreview(URL.createObjectURL(fileOrUrl));
        } else {
            setOgPreview(settings.og_image_url);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings', { forceFormData: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Settings — Marketorr Admin" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <PageHeader
                    title="Site settings"
                    subtitle="Global site configuration, header/footer branding, SEO directives and custom script injection."
                />

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={expandAll}
                        className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--mute)] hover:text-[var(--ink)]"
                    >
                        Expand all
                    </button>
                    <button
                        type="button"
                        onClick={collapseAll}
                        className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--mute)] hover:text-[var(--ink)]"
                    >
                        Collapse all
                    </button>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* 1. General / Site Info (Open by default) */}
                <AccordionWidget
                    id="general"
                    title="General / Site Info"
                    subtitle="Primary agency identity and core contact coordinates."
                    badge="Default Open"
                    isOpen={openSections.general}
                    onToggle={toggleSection}
                    icon={(
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                            <path d="M2 12h20"/>
                        </svg>
                    )}
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Site name" error={errors.site_name} required>
                            <Input value={data.site_name} onChange={(e) => setData('site_name', e.target.value)} />
                        </Field>
                        <Field label="Contact email" error={errors.contact_email} required hint="Inquiry notifications are sent here if not overridden in Email & SMTP.">
                            <Input type="email" value={data.contact_email} onChange={(e) => setData('contact_email', e.target.value)} />
                        </Field>
                        <Field label="Contact phone" error={errors.contact_phone} hint="Leave empty to hide the phone block.">
                            <Input value={data.contact_phone ?? ''} onChange={(e) => setData('contact_phone', e.target.value)} placeholder="+880 1234 567890" />
                        </Field>
                        <Field label="Location" error={errors.location_text} required>
                            <Input value={data.location_text} onChange={(e) => setData('location_text', e.target.value)} />
                        </Field>
                        <Field label="Office address" error={errors.address} className="sm:col-span-2">
                            <Input value={data.address ?? ''} onChange={(e) => setData('address', e.target.value)} />
                        </Field>
                        <Field label="Directions URL" error={errors.directions_url} hint="Linked from the contact map." className="sm:col-span-2">
                            <Input type="url" value={data.directions_url ?? ''} onChange={(e) => setData('directions_url', e.target.value)} />
                        </Field>
                    </div>
                </AccordionWidget>

                {/* 2. Header & Branding (Collapsed by default) */}
                <AccordionWidget
                    id="header_branding"
                    title="Header & Branding"
                    subtitle="Header behavior, sticky navbar toggle, CTA button, logos and favicon."
                    badge="Navigation"
                    isOpen={openSections.header_branding}
                    onToggle={toggleSection}
                    icon={(
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18"/>
                            <path d="M9 21V9"/>
                        </svg>
                    )}
                >
                    <div className="space-y-6">
                        {/* Header navigation options */}
                        <div>
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4">
                                Header Controls
                            </h3>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                                    <Toggle
                                        checked={data.header_sticky}
                                        onChange={(value) => setData('header_sticky', value)}
                                        label="Sticky Header Navigation"
                                        hint="When enabled, the header navbar stays pinned to the top of the viewport during page scroll."
                                    />
                                </div>
                                <Field
                                    label="Header CTA Button Text"
                                    error={errors.header_cta_text}
                                    hint="The primary action button in the top navbar."
                                >
                                    <Input
                                        value={data.header_cta_text ?? ''}
                                        onChange={(e) => setData('header_cta_text', e.target.value)}
                                        placeholder="Start a Project"
                                    />
                                </Field>
                                <Field
                                    label="Header CTA Button Link"
                                    error={errors.header_cta_link}
                                    hint="Internal path (e.g., /contact) or full external URL."
                                >
                                    <Input
                                        value={data.header_cta_link ?? ''}
                                        onChange={(e) => setData('header_cta_link', e.target.value)}
                                        placeholder="/contact"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Branding Assets */}
                        <div className="border-t border-[var(--line)] pt-6">
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-2">
                                Brand Assets & Icons
                            </h3>
                            <p className="text-[12px] text-[var(--mute)] mb-4">
                                Logos and favicon. Leave empty to keep the built-in MARKETORR mark.
                            </p>
                            <div className="grid gap-5 sm:grid-cols-3">
                                <ImageField
                                    label="Logo (Light Theme)"
                                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                    hint="SVG, PNG or WebP. Max 2 MB."
                                    error={errors.logo}
                                    preview={logoPreview}
                                    onChange={onImageChange('logo', setLogoPreview, settings.logo_url)}
                                />
                                <ImageField
                                    label="Logo (Dark Theme)"
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
                        </div>
                    </div>
                </AccordionWidget>

                {/* 3. Footer & Social Links (Collapsed by default) */}
                <AccordionWidget
                    id="footer_social"
                    title="Footer & Social Links"
                    subtitle="Footer description, dynamic copyright statement, and public social profiles."
                    badge="Footer"
                    isOpen={openSections.footer_social}
                    onToggle={toggleSection}
                    icon={(
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 15h18"/>
                        </svg>
                    )}
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4">
                                Footer Content
                            </h3>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Copyright line"
                                    error={errors.copyright_text}
                                    hint="Use {year} and {site} as automatic replacement variables."
                                    className="sm:col-span-2"
                                >
                                    <Input
                                        value={data.copyright_text ?? ''}
                                        onChange={(e) => setData('copyright_text', e.target.value)}
                                        placeholder="© {year} {site}. All rights reserved."
                                    />
                                </Field>
                                <Field
                                    label="Footer bio / intro text"
                                    error={errors.footer_intro}
                                    className="sm:col-span-2"
                                    hint="Displayed in the main agency overview column of the footer."
                                >
                                    <Textarea
                                        rows={3}
                                        value={data.footer_intro ?? ''}
                                        onChange={(e) => setData('footer_intro', e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>

                        <div className="border-t border-[var(--line)] pt-6">
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-2">
                                Social Profile Links
                            </h3>
                            <p className="text-[12px] text-[var(--mute)] mb-4">
                                Empty URLs are automatically hidden from the public footer and contact section.
                            </p>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="LinkedIn URL" error={errors.social_linkedin}>
                                    <Input type="url" value={data.social_linkedin ?? ''} onChange={(e) => setData('social_linkedin', e.target.value)} placeholder="https://www.linkedin.com/company/..." />
                                </Field>
                                <Field label="Facebook URL" error={errors.social_facebook}>
                                    <Input type="url" value={data.social_facebook ?? ''} onChange={(e) => setData('social_facebook', e.target.value)} placeholder="https://www.facebook.com/..." />
                                </Field>
                                <Field label="Instagram URL" error={errors.social_instagram}>
                                    <Input type="url" value={data.social_instagram ?? ''} onChange={(e) => setData('social_instagram', e.target.value)} placeholder="https://www.instagram.com/..." />
                                </Field>
                                <Field label="X (Twitter) URL" error={errors.social_x}>
                                    <Input type="url" value={data.social_x ?? ''} onChange={(e) => setData('social_x', e.target.value)} placeholder="https://x.com/..." />
                                </Field>
                                <Field label="YouTube URL" error={errors.social_youtube}>
                                    <Input type="url" value={data.social_youtube ?? ''} onChange={(e) => setData('social_youtube', e.target.value)} placeholder="https://www.youtube.com/@..." />
                                </Field>
                                <Field label="Behance URL" error={errors.social_behance}>
                                    <Input type="url" value={data.social_behance ?? ''} onChange={(e) => setData('social_behance', e.target.value)} placeholder="https://www.behance.net/..." />
                                </Field>
                                <Field label="Dribbble URL" error={errors.social_dribbble} className="sm:col-span-2">
                                    <Input type="url" value={data.social_dribbble ?? ''} onChange={(e) => setData('social_dribbble', e.target.value)} placeholder="https://dribbble.com/..." />
                                </Field>
                            </div>
                        </div>
                    </div>
                </AccordionWidget>

                {/* 4. SEO & Meta Defaults (Collapsed by default) */}
                <AccordionWidget
                    id="seo_meta"
                    title="SEO & Meta Defaults"
                    subtitle="Global meta tags, OpenGraph sharing preview, XML sitemaps and search engine directives."
                    badge="SEO"
                    isOpen={openSections.seo_meta}
                    onToggle={toggleSection}
                    icon={(
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                    )}
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4">
                                Global Meta Tags
                            </h3>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Default Meta Title" error={errors.meta_default_title} required className="sm:col-span-2">
                                    <Input value={data.meta_default_title} onChange={(e) => setData('meta_default_title', e.target.value)} />
                                </Field>
                                <Field label="Default Meta Description" error={errors.meta_default_description} required className="sm:col-span-2">
                                    <Textarea rows={3} value={data.meta_default_description} onChange={(e) => setData('meta_default_description', e.target.value)} />
                                </Field>
                                <div className="sm:col-span-2">
                                    <MediaPickerField
                                        label="Default Social Sharing Image (OG Image)"
                                        value={typeof data.meta_default_og_image === 'string' ? data.meta_default_og_image : ''}
                                        preview={ogPreview}
                                        onChange={(url) => onOgChange(url)}
                                        error={errors.meta_default_og_image}
                                        hint="JPG, PNG or WebP. Recommended size: 1200 × 630 px."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[var(--line)] pt-6">
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4">
                                Search Engines & Indexing
                            </h3>
                            <div className="grid gap-5">
                                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                                    <Toggle
                                        checked={data.sitemap_enabled}
                                        onChange={(value) => setData('sitemap_enabled', value)}
                                        label="Publish XML Sitemap (/sitemap.xml)"
                                        hint="Automatically lists all published pages, services, categories, and portfolio projects."
                                    />
                                </div>
                                <Field
                                    label="robots.txt Custom Rules"
                                    error={errors.robots_txt}
                                    hint="Leave blank to serve the auto-generated default linking to /sitemap.xml."
                                >
                                    <Textarea
                                        rows={4}
                                        className="font-mono text-[12px]"
                                        value={data.robots_txt ?? ''}
                                        onChange={(e) => setData('robots_txt', e.target.value)}
                                        placeholder={'User-agent: *\nDisallow: /admin'}
                                    />
                                </Field>
                                <Field
                                    label="Global Schema Markup (JSON-LD)"
                                    error={errors.schema_markup}
                                    hint="Valid JSON-LD structure injected into <head> for search snippet rich cards."
                                >
                                    <Textarea
                                        rows={5}
                                        className="font-mono text-[12px]"
                                        value={data.schema_markup ?? ''}
                                        onChange={(e) => setData('schema_markup', e.target.value)}
                                        placeholder='{"@context":"https://schema.org","@type":"Organization","name":"Marketorr"}'
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>
                </AccordionWidget>

                {/* 5. Custom Code & Script Injection (Collapsed by default) */}
                <AccordionWidget
                    id="custom_scripts"
                    title="Custom Code & Script Injection"
                    subtitle="Direct <head> and <body> code injection for analytics, Meta Pixel and live chat."
                    badge="Scripts"
                    isOpen={openSections.custom_scripts}
                    onToggle={toggleSection}
                    icon={(
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                    )}
                >
                    <div className="space-y-6">
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-[12px] text-amber-200/90">
                            <strong className="font-bold text-amber-400">Caution:</strong> Injected code runs verbatim in public visitor browsers. Only paste trusted verification tags and tracking scripts.
                        </div>

                        <Field
                            label="<head> Code Injection (Google Analytics, GTM, Meta Pixel)"
                            error={errors.head_scripts}
                            hint="Rendered inside the HTML <head> section of every page immediately before the closing </head> tag."
                        >
                            <Textarea
                                rows={6}
                                className="font-mono text-[12px]"
                                value={data.head_scripts ?? ''}
                                onChange={(e) => setData('head_scripts', e.target.value)}
                                placeholder="<!-- Google tag (gtag.js) -->\n<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXX'></script>"
                            />
                        </Field>

                        <Field
                            label="<body> / Footer Code Injection (Chat Widgets, Conversion Pixels)"
                            error={errors.body_scripts}
                            hint="Rendered immediately before the closing </body> tag. Ideal for Intercom, Crisp, Drift or performance tracking scripts."
                        >
                            <Textarea
                                rows={6}
                                className="font-mono text-[12px]"
                                value={data.body_scripts ?? ''}
                                onChange={(e) => setData('body_scripts', e.target.value)}
                                placeholder="<!-- Live Chat Widget -->\n<script>window.$crisp=[];window.CRISP_WEBSITE_ID='...';</script>"
                            />
                        </Field>
                    </div>
                </AccordionWidget>

                {/* 6. Hero & About Content (Collapsed by default) */}
                <AccordionWidget
                    id="hero_about"
                    title="Hero & About Content"
                    subtitle="Homepage showcase typography, animated statistics, and agency narrative."
                    badge="Content"
                    isOpen={openSections.hero_about}
                    onToggle={toggleSection}
                    icon={(
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                            <path d="M6 6h10"/>
                            <path d="M6 10h10"/>
                        </svg>
                    )}
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4">
                                Homepage Hero
                            </h3>
                            <div className="grid gap-5">
                                <Field label="Hero Eyebrow" error={errors.hero_eyebrow} required>
                                    <Input value={data.hero_eyebrow} onChange={(e) => setData('hero_eyebrow', e.target.value)} />
                                </Field>
                                <Field label="Heading Lines" error={errors.hero_heading_lines} required hint="One line per row — the last line gets the brand gradient.">
                                    <RepeatableList
                                        values={data.hero_heading_lines}
                                        onChange={(v) => setData('hero_heading_lines', v)}
                                        placeholder="We turn"
                                        addLabel="Add line"
                                        errors={errors}
                                        name="hero_heading_lines"
                                    />
                                </Field>
                                <Field label="Hero Subtext" error={errors.hero_subtext} required>
                                    <Textarea rows={3} value={data.hero_subtext} onChange={(e) => setData('hero_subtext', e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        <div className="border-t border-[var(--line)] pt-6">
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4">
                                Agency About & Stats
                            </h3>
                            <div className="grid gap-5">
                                <Field label="About narrative text" error={errors.about_text} required>
                                    <Textarea rows={4} value={data.about_text} onChange={(e) => setData('about_text', e.target.value)} />
                                </Field>
                                <Field label="Numerical Metrics" error={errors.about_metrics} required hint="Number counts up on viewport scroll; suffix is attached after (e.g. 120 + '+').">
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
                        </div>
                    </div>
                </AccordionWidget>

                {/* Sticky / Dedicated Save Bar */}
                <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)]/95 p-4 shadow-xl backdrop-blur-md">
                    <p className="text-[12px] text-[var(--mute)]">
                        Changes update site configuration and active layout components immediately.
                    </p>
                    <Button type="submit" disabled={processing} className="min-w-[140px]">
                        {processing ? 'Saving…' : 'Save all settings'}
                    </Button>
                </div>
            </form>
        </>
    );
}

Settings.layout = (page) => <AdminLayout>{page}</AdminLayout>;
