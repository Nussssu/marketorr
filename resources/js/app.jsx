import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './lib/theme';
import Layout from './components/Layout';

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx');
        const page = await pages[`./pages/${name}.jsx`]();
        page.default.layout =
            page.default.layout || ((children) => <Layout>{children}</Layout>);
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#891FFB',
        showSpinner: true,
    },
});
