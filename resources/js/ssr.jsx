import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { ThemeProvider } from './lib/theme';
import Layout from './components/Layout';
import { setAssetBase } from './lib/asset';

/**
 * Server-side rendering entry, run by `php artisan inertia:start-ssr`.
 *
 * Mirrors app.jsx — same page resolution, default layout and theme provider —
 * so the HTML the server sends is exactly what the client hydrates.
 */
createServer((page) => {
    setAssetBase(page.props?.assetBase);

    return createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: async (name) => {
            const pages = import.meta.glob('./pages/**/*.jsx');
            const resolved = await pages[`./pages/${name}.jsx`]();
            resolved.default.layout =
                resolved.default.layout || ((children) => <Layout>{children}</Layout>);
            return resolved;
        },
        setup: ({ App, props }) => (
            <ThemeProvider initial={props.initialPage?.props?.theme}>
                <App {...props} />
            </ThemeProvider>
        ),
    });
});
