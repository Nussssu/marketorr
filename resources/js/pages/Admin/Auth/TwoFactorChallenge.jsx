import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthCard from '../../../components/admin/AuthCard';
import { Button, Field, Input } from '../../../components/admin/ui';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ code: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/two-factor', { onError: () => reset('code') });
    };

    const switchMode = () => {
        setRecovery((value) => !value);
        reset('code');
    };

    return (
        <>
            <Head title="Two-factor sign in | Marketorr" />
            <AuthCard
                title="Two-factor check"
                subtitle={recovery ? 'Enter one of your saved recovery codes. Each works once.' : 'Enter the 6-digit code from your authenticator app.'}
            >
                <form onSubmit={submit} className="space-y-5">
                    <Field label={recovery ? 'Recovery code' : 'Authentication code'} error={errors.code} required>
                        <Input
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            inputMode={recovery ? 'text' : 'numeric'}
                            autoComplete="one-time-code"
                            placeholder={recovery ? 'XXXXX-XXXXX' : '123 456'}
                            maxLength={recovery ? 20 : 7}
                            className="text-center font-mono tracking-[0.3em]"
                            autoFocus
                        />
                    </Field>
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Checking…' : 'Verify →'}
                    </Button>
                    <div className="flex items-center justify-between text-[12px]">
                        <button type="button" onClick={switchMode} className="text-[var(--ink-faint)] hover:text-[var(--ink)]">
                            {recovery ? 'Use an authenticator code' : 'Use a recovery code'}
                        </button>
                        <Link href="/admin/login" className="text-[var(--ink-faint)] hover:text-[var(--ink)]">
                            Start over
                        </Link>
                    </div>
                </form>
            </AuthCard>
        </>
    );
}

TwoFactorChallenge.layout = (page) => page;
