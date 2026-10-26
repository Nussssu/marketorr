import { Head, useForm } from '@inertiajs/react';
import AuthCard from '../../../components/admin/AuthCard';
import { Button, Field, Input } from '../../../components/admin/ui';

export default function AcceptInvitation({ name, email, action }) {
    const { data, setData, post, processing, errors } = useForm({
        name: name ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // The signed URL (with its signature and expiry) is posted back as-is.
        post(action);
    };

    return (
        <>
            <Head title="Accept invitation | Marketorr" />
            <AuthCard title="Welcome aboard" subtitle={`Set a password to activate the admin account for ${email}.`}>
                <form onSubmit={submit} className="space-y-5">
                    <Field label="Your name" error={errors.name} required>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" />
                    </Field>
                    <input type="email" value={email} autoComplete="username" readOnly hidden />
                    <Field label="Password" error={errors.password} hint="At least 10 characters, with letters and numbers." required>
                        <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" autoFocus />
                    </Field>
                    <Field label="Confirm password" error={errors.password_confirmation} required>
                        <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                    </Field>
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Activating…' : 'Activate account →'}
                    </Button>
                </form>
            </AuthCard>
        </>
    );
}

AcceptInvitation.layout = (page) => page;
