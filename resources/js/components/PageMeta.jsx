import { Head, usePage } from '@inertiajs/react';

/**
 * Per-page head tags driven by the CMS: title, description, canonical, robots
 * and Open Graph, each falling back to the site defaults from Settings.
 *
 * @param {{ page?: { title?: string, meta?: object }, fallbackTitle?: string }} props
 */
export default function PageMeta({ page, fallbackTitle }) {
    const { settings } = usePage().props;
    const meta = page?.meta ?? {};
    const title = meta.title || page?.title || fallbackTitle || settings.meta.title;
    const description = meta.description || settings.meta.description;
    const ogImage = meta.ogImage || settings.meta.ogImage;

    return (
        <Head title={title}>
            <meta name="description" content={description} head-key="description" />
            {meta.robots && <meta name="robots" content={meta.robots} head-key="robots" />}
            {meta.canonical && <link rel="canonical" href={meta.canonical} head-key="canonical" />}
            <meta property="og:title" content={title} head-key="og:title" />
            <meta property="og:description" content={description} head-key="og:description" />
            <meta property="og:type" content="website" head-key="og:type" />
            {ogImage && <meta property="og:image" content={ogImage} head-key="og:image" />}
            <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} head-key="twitter:card" />
            {meta.schema && (
                <script type="application/ld+json" head-key="schema">
                    {JSON.stringify(meta.schema)}
                </script>
            )}
        </Head>
    );
}
