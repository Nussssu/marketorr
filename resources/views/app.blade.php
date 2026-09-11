<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Marketorr is an independent creative & digital agency building brands, digital products and experiences designed for measurable growth." />
    <title inertia>Marketorr — We Turn Attention Into Results</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <script>
        // Apply theme before paint: stored choice wins, otherwise default to light.
        (function () {
            try {
                var stored = localStorage.getItem('marketorr-theme');
                var theme = stored === 'light' || stored === 'dark' ? stored : 'light';
                document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {
                document.documentElement.setAttribute('data-theme', 'light');
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
