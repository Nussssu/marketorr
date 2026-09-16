<!DOCTYPE html>
<html lang="en" data-theme="dark" class="dark">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Marketorr is an independent creative & digital agency building brands, digital products and experiences designed for measurable growth." />
    <title inertia>Marketorr — We Turn Attention Into Results</title>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <script>
        // Apply theme before paint: saved choice wins (legacy key migrated), otherwise dark.
        (function () {
            try {
                var stored = localStorage.getItem('theme') || localStorage.getItem('marketorr-theme');
                var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
                var root = document.documentElement;
                root.setAttribute('data-theme', theme);
                root.classList.toggle('dark', theme === 'dark');
                localStorage.setItem('theme', theme);
                localStorage.removeItem('marketorr-theme');
            } catch (e) {
                var fallback = document.documentElement;
                fallback.setAttribute('data-theme', 'dark');
                fallback.classList.add('dark');
            }
        })();
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
