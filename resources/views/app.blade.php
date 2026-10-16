<!DOCTYPE html>
@php($theme = request()->cookie('theme') === 'dark' ? 'dark' : 'light')
<html lang="en" data-theme="{{ $theme }}" class="{{ $theme === 'dark' ? 'dark' : '' }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="{{ $siteSettings?->meta_default_description ?? 'Marketorr is an independent creative & digital agency building brands, digital products and experiences designed for measurable growth.' }}" />
    <title inertia>{{ $siteSettings?->meta_default_title ?? 'Marketorr | We Turn Attention Into Results' }}</title>
    {{-- An uploaded favicon replaces the set; the shipped Marketorr icon keeps every size. --}}
    @if (($siteSettings?->favicon_path !== '/favicon.svg') && ($faviconUrl = $siteSettings?->assetUrl($siteSettings?->favicon_path)))
        <link rel="icon" href="{{ $faviconUrl }}" />
    @else
    <link rel="icon" href="{{ \App\Services\PublicAsset::to('favicon.ico') }}" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="{{ \App\Services\PublicAsset::to('favicon.svg') }}" />
    <link rel="icon" type="image/png" sizes="32x32" href="{{ \App\Services\PublicAsset::to('favicon-32x32.png') }}" />
    <link rel="icon" type="image/png" sizes="16x16" href="{{ \App\Services\PublicAsset::to('favicon-16x16.png') }}" />
    <link rel="apple-touch-icon" href="{{ \App\Services\PublicAsset::to('apple-touch-icon.png') }}" />
    @endif
    {{-- The header logo for the theme being rendered (an uploaded logo wins),
         fetched early: it is often the first image on screen. --}}
    @php($headerLogo = $theme === 'light'
        ? ($siteSettings?->assetUrl($siteSettings?->logo_path ?: $siteSettings?->logo_dark_path) ?? \App\Services\PublicAsset::to('images/logo/marketorr-logo-on-light.png'))
        : ($siteSettings?->assetUrl($siteSettings?->logo_dark_path ?: $siteSettings?->logo_path) ?? \App\Services\PublicAsset::to('images/logo/marketorr-logo-on-dark.png')))
    <link rel="preload" href="{{ $headerLogo }}" as="image" fetchpriority="high" />
    {{-- Self-hosted fonts (declared in app.css): preload the Latin files the first paint uses. --}}
    <link rel="preload" href="{{ Vite::asset('resources/fonts/sora-latin.woff2') }}" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="{{ Vite::asset('resources/fonts/manrope-latin.woff2') }}" as="font" type="font/woff2" crossorigin />
    <script>
        // Apply theme before paint: saved choice wins (legacy key migrated), otherwise light.
        (function () {
            try {
                var stored = localStorage.getItem('theme') || localStorage.getItem('marketorr-theme');
                var theme = stored === 'light' || stored === 'dark' ? stored : 'light';
                var root = document.documentElement;
                root.setAttribute('data-theme', theme);
                root.classList.toggle('dark', theme === 'dark');
                localStorage.setItem('theme', theme);
                localStorage.removeItem('marketorr-theme');
                // Mirrored to a cookie so the server renders the same theme.
                document.cookie = 'theme=' + theme + ';path=/;max-age=31536000;SameSite=Lax';
            } catch (e) {
                var fallback = document.documentElement;
                fallback.setAttribute('data-theme', 'light');
                fallback.classList.remove('dark');
            }
        })();
    </script>
    @viteReactRefresh
    {{-- The current page's component is listed too, so its chunk is preloaded
         alongside the app instead of being discovered only after app.js runs. --}}
    @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/pages/{$page['component']}.jsx"])
    @inertiaHead
    {{-- Editor-managed tracking snippets, rendered verbatim. --}}
    @if (filled($siteSettings?->head_scripts))
        {!! $siteSettings->head_scripts !!}
    @endif
    @if (filled($siteSettings?->schema_markup))
        <script type="application/ld+json">{!! json_encode($siteSettings->schema_markup) !!}</script>
    @endif
</head>
<body>
    @inertia
    @if (filled($siteSettings?->body_scripts))
        {!! $siteSettings->body_scripts !!}
    @endif
</body>
</html>
