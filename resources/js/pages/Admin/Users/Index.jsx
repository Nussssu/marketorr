import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Button, ConfirmDialog, Field, Input, PageHeader, Panel, Select, useConfirm } from '../../../components/admin/ui';

export default function UsersIndex({ users, roles }) {
    const currentUser = usePage().props.auth?.user;
    const [request, confirm, cancel, run] = useConfirm();
    const superAdmins = users.filter((u) => u.role === 'super_admin').length;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'editor',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/users', { preserveScroll: true, onSuccess: () => reset() });
    };

    const changeRole = (user, role) => {
        router.put(`/admin/users/${user.id}`, { name: user.name, email: user.email, role }, { preserveScroll: true });
    };

    const askDelete = (user) => {
        confirm({
            title: `Delete ${user.name}?`,
            body: 'Their admin access is removed immediately. This cannot be undone.',
            action: () => router.delete(`/admin/users/${user.id}`, { preserveScroll: true }),
        });
    };

    return (
        <>
            <Head title="Admins — Marketorr Admin" />
            <PageHeader title="Admins" subtitle="Editors manage content. Super admins also manage settings and other admins." />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Panel className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-left text-[13px]">
                                <thead>
                                    <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                        <th className="pb-3 pr-4 font-bold">Admin</th>
                                        <th className="pb-3 pr-4 font-bold">Role</th>
                                        <th className="pb-3 pr-4 font-bold">Added</th>
                                        <th className="pb-3 font-bold" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => {
                                        const isSelf = user.id === currentUser?.id;
                                        const isLastSuperAdmin = user.role === 'super_admin' && superAdmins === 1;

                                        return (
                                            <tr key={user.id} className="border-t border-[var(--line)]">
                                                <td className="py-3 pr-4">
                                                    <p className="font-semibold text-[var(--ink)]">
                                                        {user.name}
                                                        {isSelf && <span className="ml-2 text-[11px] text-[var(--ink-faint)]">(you)</span>}
                                                    </p>
                                                    <p className="text-[12px] text-[var(--ink-faint)]">{user.email}</p>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Select
                                                        value={user.role}
                                                        onChange={(e) => changeRole(user, e.target.value)}
                                                        disabled={isLastSuperAdmin}
                                                        aria-label={`Role for ${user.name}`}
                                                        className="max-w-[160px]"
                                                    >
                                                        {roles.map((role) => (
                                                            <option key={role.value} value={role.value}>{role.label}</option>
                                                        ))}
                                                    </Select>
                                                </td>
                                                <td className="py-3 pr-4 whitespace-nowrap text-[var(--mute)]">{user.createdAt}</td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        onClick={() => askDelete(user)}
                                                        disabled={isSelf || isLastSuperAdmin}
                                                        title={isSelf ? 'You cannot delete your own account' : isLastSuperAdmin ? 'At least one super admin must remain' : undefined}
                                                        className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                    {errors.role && <p className="mt-3 text-[12px] text-[#ff6b6b]">{errors.role}</p>}
                    {errors.user && <p className="mt-3 text-[12px] text-[#ff6b6b]">{errors.user}</p>}
                </div>

                <Panel title="Invite an admin" description="A temporary password is shown once after creating.">
                    <form onSubmit={submit} className="space-y-5">
                        <Field label="Name" error={errors.name} required>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </Field>
                        <Field label="Email" error={errors.email} required>
                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </Field>
                        <Field label="Role" error={errors.role} required>
                            <Select value={data.role} onChange={(e) => setData('role', e.target.value)}>
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </Select>
                        </Field>
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Creating…' : 'Create admin'}
                        </Button>
                    </form>
                </Panel>
            </div>

            <ConfirmDialog
                open={!!request}
                title={request?.title ?? ''}
                body={request?.body}
                onConfirm={run}
                onCancel={cancel}
            />
        </>
    );
}

UsersIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
