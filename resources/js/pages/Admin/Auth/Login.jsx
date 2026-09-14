import { Head, useForm } from '@inertiajs/react';
import { Button, Field, Input } from '../../../components/admin/ui';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="Admin Login — Marketorr" />
            <div className="flex min-h-svh items-center justify-center bg-[var(--bg)] px-4 py-12">
                <div className="w-full max-w-sm">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 items-end gap-[4px]" aria-hidden>
                            <span className="h-4 w-[6px] rounded-[2px] bg-[#891FFB]" />
                            <span className="h-6 w-[6px] rounded-[2px] bg-[#507AF4]" />
                            <span className="h-8 w-[6px] rounded-[2px] bg-[#1BE2EB]" />
                        </span>
                        <span className="font-display text-xl font-extrabold tracking-tight text-[var(--ink-strong)]">
                            MARKETORR<span className="text-gradient">.</span>
                        </span>
                    </div>
                    <h1 className="mt-8 font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)]">Admin sign in</h1>
                    <p className="mt-2 text-[13px] text-[var(--mute)]">Manage projects, services, inquiries and site content.</p>

                    <form onSubmit={submit} className="mt-8 space-y-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
                        <Field label="Email" error={errors.email} required>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="username"
                                autoFocus
                            />
                        </Field>
                        <Field label="Password" error={errors.password} required>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="current-password"
                            />
                        </Field>
                        <label className="flex items-center gap-2 text-[12px] text-[var(--mute)]">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-[var(--field-line)]"
                            />
                            Remember me
                        </label>
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Signing in…' : 'Sign in →'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}

// Standalone page — no marketing chrome, no admin sidebar.
Login.layout = (page) => page;
