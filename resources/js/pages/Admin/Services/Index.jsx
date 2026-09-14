import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Badge, Button, EmptyState, PageHeader, Panel } from '../../../components/admin/ui';

export default function ServicesIndex({ services }) {
    const [rows, setRows] = useState(services);

    // Reorder updates local state first for instant feedback; every server
    // response (reorder, feature toggle, delete) then resyncs it to the truth.
    useEffect(() => {
        setRows(services);
    }, [services]);

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= rows.length) return;

        const next = [...rows];
        [next[index], next[target]] = [next[target], next[index]];
        setRows(next);

        router.patch('/admin/services/reorder', { ids: next.map((r) => r.id) }, { preserveScroll: true });
    };

    const destroy = (service) => {
        if (!window.confirm(`Delete “${service.name}”? It can be restored from the database.`)) return;
        router.delete(`/admin/services/${service.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Services — Marketorr Admin" />
            <PageHeader title="Services" subtitle={`${rows.length} services. Order here is the order on the public site.`}>
                <Button as="link" href="/admin/services/create">New service</Button>
            </PageHeader>

            <Panel className="overflow-hidden">
                {rows.length === 0 ? (
                    <EmptyState>No services yet — create the first one.</EmptyState>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-[13px]">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                                    <th className="pb-3 pr-3 font-bold">Order</th>
                                    <th className="pb-3 pr-4 font-bold">Index</th>
                                    <th className="pb-3 pr-4 font-bold">Service</th>
                                    <th className="pb-3 pr-4 font-bold">Tagline</th>
                                    <th className="pb-3 pr-4 font-bold">Accent</th>
                                    <th className="pb-3 pr-4 font-bold">Status</th>
                                    <th className="pb-3 font-bold" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((service, index) => (
                                    <tr key={service.id} className="border-t border-[var(--line)]">
                                        <td className="py-3 pr-3">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => move(index, -1)}
                                                    disabled={index === 0}
                                                    aria-label={`Move ${service.name} up`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => move(index, 1)}
                                                    disabled={index === rows.length - 1}
                                                    aria-label={`Move ${service.name} down`}
                                                    className="rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 font-display font-bold text-[var(--ink-faint)]">{service.index_label}</td>
                                        <td className="py-3 pr-4">
                                            <p className="font-semibold text-[var(--ink)]">{service.name}</p>
                                            <p className="text-[12px] text-[var(--ink-faint)]">/{service.slug}</p>
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--mute)]">{service.short}</td>
                                        <td className="py-3 pr-4">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-4 w-8 rounded"
                                                    style={{
                                                        background: service.accent_to
                                                            ? `linear-gradient(90deg, ${service.accent}, ${service.accent_to})`
                                                            : service.accent,
                                                    }}
                                                    aria-hidden
                                                />
                                                <span className="text-[12px] text-[var(--ink-faint)]">{service.accent}</span>
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4"><Badge tone={service.status} /></td>
                                        <td className="py-3 text-right whitespace-nowrap">
                                            <Link
                                                href={`/admin/services/${service.id}/edit`}
                                                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => destroy(service)}
                                                className="ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>
        </>
    );
}

ServicesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;
