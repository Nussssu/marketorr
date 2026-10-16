import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button, Field, PageHeader, Panel, Textarea } from '../../components/admin/ui';

/**
 * Code injected into every public page — analytics, pixels, chat widgets —
 * kept apart from the rest of the site settings.
 */
export default function CustomCode({ code }) {
    const { data, setData, put, processing, errors, isDirty } = useForm({
        head_scripts: code.head_scripts ?? '',
        body_scripts: code.body_scripts ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/custom-code', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Custom Code | Marketorr Admin" />
            <PageHeader
                title="Custom code"
                subtitle="Code injected into every page of the site: analytics, Meta Pixel, live chat and verification tags."
            />

            <form onSubmit={submit} className="space-y-6">
                <div className="rounded-xl border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 p-4 text-[12px] text-[var(--ink)]">
                    <strong className="font-bold text-[#6F91FF]">Caution:</strong> Injected code runs verbatim in public visitor browsers. Only paste trusted verification tags and tracking scripts.
                </div>

                <Panel title="Head code" description="Rendered inside the HTML <head> of every page, immediately before the closing </head> tag.">
                    <Field label="<head> Code Injection (Google Analytics, GTM, Meta Pixel)" error={errors.head_scripts}>
                        <Textarea
                            rows={8}
                            className="font-mono text-[12px]"
                            value={data.head_scripts}
                            onChange={(e) => setData('head_scripts', e.target.value)}
                            placeholder="<!-- Google tag (gtag.js) -->\n<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXX'></script>"
                        />
                    </Field>
                </Panel>

                <Panel title="Body code" description="Rendered immediately before the closing </body> tag. Ideal for Intercom, Crisp, Drift or performance tracking scripts.">
                    <Field label="<body> / Footer Code Injection (Chat Widgets, Conversion Pixels)" error={errors.body_scripts}>
                        <Textarea
                            rows={8}
                            className="font-mono text-[12px]"
                            value={data.body_scripts}
                            onChange={(e) => setData('body_scripts', e.target.value)}
                            placeholder="<!-- Live Chat Widget -->\n<script>window.$crisp=[];window.CRISP_WEBSITE_ID='...';</script>"
                        />
                    </Field>
                </Panel>

                <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)]/95 p-4 shadow-xl backdrop-blur-md">
                    <p className="text-[12px] text-[var(--mute)]">
                        {isDirty ? 'You have unsaved changes.' : 'Changes apply to every page as soon as they are saved.'}
                    </p>
                    <Button type="submit" disabled={processing} className="min-w-[140px]">
                        {processing ? 'Saving…' : 'Save custom code'}
                    </Button>
                </div>
            </form>
        </>
    );
}

CustomCode.layout = (page) => <AdminLayout>{page}</AdminLayout>;
