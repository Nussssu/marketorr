import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ThemeProvider } from './lib/theme';
import Layout from './components/Layout';
import { setAssetBase } from './lib/asset';

// Set the asset base before any page module loads: pages build some asset
// URLs at import time, and the first page is imported before `setup` runs.
try {
    const initialPage = document.querySelector('script[data-page="app"]')?.textContent;
    setAssetBase(initialPage ? JSON.parse(initialPage).props?.assetBase : '');
} catch {
    setAssetBase('');
}

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx');
        const page = await pages[`./pages/${name}.jsx`]();
        page.default.layout =
            page.default.layout || ((children) => <Layout>{children}</Layout>);
        return page;
    },
    setup({ el, App, props }) {
        const app = (
            <ThemeProvider initial={props.initialPage?.props?.theme}>
                <App {...props} />
            </ThemeProvider>
        );

        // Server-rendered markup is adopted in place; without the SSR server
        // the page renders client-side exactly as before. Hydration waits for
        // the next frame so the browser paints the server's HTML first instead
        // of holding it behind one long hydration task.
        if (el.dataset.serverRendered === 'true') {
            requestAnimationFrame(() => setTimeout(() => hydrateRoot(el, app), 0));
        } else {
            createRoot(el).render(app);
        }
    },
    progress: {
        color: '#891FFB',
        showSpinner: true,
    },
});
