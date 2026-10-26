import { Head, Link, useForm } from '@inertiajs/react';
import AuthCard from '../../../components/admin/AuthCard';
import { Button, Field, Input } from '../../../components/admin/ui';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/reset-password');
    };

    return (
        <>
            <Head title="Reset password | Marketorr" />
            <AuthCard title="New password" subtitle="Choose a new password. Every browser signed in to this account is signed out.">
                <form onSubmit={submit} className="space-y-5">
                    <Field label="Email" error={errors.email} required>
                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} autoComplete="username" />
                    </Field>
                    <Field label="New password" error={errors.password} hint="At least 10 characters, with letters and numbers." required>
                        <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" autoFocus />
                    </Field>
                    <Field label="Confirm password" error={errors.password_confirmation} required>
                        <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                    </Field>
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving…' : 'Set password →'}
                    </Button>
                    <p className="text-center text-[12px]">
                        <Link href="/admin/login" className="text-[var(--ink-faint)] hover:text-[var(--ink)]">Back to sign in</Link>
                    </p>
                </form>
            </AuthCard>
        </>
    );
}

ResetPassword.layout = (page) => page;
