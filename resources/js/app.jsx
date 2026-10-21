import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ThemeProvider } from './lib/theme';
import Layout from './components/Layout';
import { setAssetBase } from './lib/asset';
import { applyPageSnippets } from './lib/codeSnippets';

// Set the asset base before any page module loads: pages build some asset
// URLs at import time, and the first page is imported before `setup` runs.
try {
    const initialPage = document.querySelector('script[data-page="app"]')?.textContent;
    setAssetBase(initialPage ? JSON.parse(initialPage).props?.assetBase : '');
} catch {
    setAssetBase('');
}

// Page-specific custom code follows the visitor through in-app navigation;
// the first page load fires this too.
router.on('navigate', (event) => applyPageSnippets(event.detail.page.props.codeSnippets));

// Custom code must never run inside the admin panel, and code a public page
// has already run lives on in the document. So moving between the public site
// and the admin is always a full page load, never an in-app visit.
const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');
let currentIsAdmin = isAdminPath(window.location.pathname);

router.on('before', (event) => {
    const { url, method } = event.detail.visit;

    if (method === 'get' && isAdminPath(url.pathname) !== currentIsAdmin) {
        event.preventDefault();
        window.location.assign(url.href);
    }
});

// Back and forward, or a redirect, can still cross over in place: reload so
// the new side starts from a clean document.
router.on('navigate', (event) => {
    const nextIsAdmin = isAdminPath(new URL(event.detail.page.url, window.location.origin).pathname);

    if (nextIsAdmin !== currentIsAdmin) {
        window.location.reload();
    }
});

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
