import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Grouped so the panel stays readable as the module count grows: content an
 * editor touches daily first, configuration a super admin touches rarely last.
 */
const NAV = [
    {
        group: 'Overview',
        items: [{ label: 'Dashboard', href: '/admin', exact: true }],
    },
    {
        group: 'Content',
        items: [
            { label: 'Pages', href: '/admin/pages' },
            { label: 'Projects', href: '/admin/projects' },
            { label: 'Categories', href: '/admin/categories' },
            { label: 'Services', href: '/admin/services' },
            { label: 'Global blocks', href: '/admin/blocks' },
            { label: 'Menus', href: '/admin/menus' },
        ],
    },
    {
        group: 'Leads',
        items: [{ label: 'Inbox', href: '/admin/inquiries' }],
    },
    {
        group: 'Configuration',
        items: [
            { label: 'Settings', href: '/admin/settings', superAdminOnly: true },
            { label: 'Email & SMTP', href: '/admin/mail', superAdminOnly: true },
            { label: 'Email templates', href: '/admin/email-templates', superAdminOnly: true },
            { label: 'Users', href: '/admin/users', superAdminOnly: true },
        ],
    },
];

function isActive(url, item) {
    const path = url.split('?')[0];
    return item.exact ? path === item.href : path.startsWith(item.href);
}

/**
 * Dense, functional chrome for the admin panel — deliberately free of the
 * marketing site's cursor, parallax and scroll effects.
 */
export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const flash = props.flash?.success;
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState(flash);

    useEffect(() => {
        setNotice(flash);
        if (!flash) return undefined;

        const timer = setTimeout(() => setNotice(null), 6000);
        return () => clearTimeout(timer);
    }, [flash]);

    useEffect(() => {
        setOpen(false);
    }, [url]);

    const groups = NAV
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !item.superAdminOnly || user?.isSuperAdmin),
        }))
        .filter((group) => group.items.length > 0);

    const logout = () => router.post('/admin/logout');

    return (
        <div className="min-h-svh bg-[var(--bg)] text-[var(--ink)]">
            <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)] lg:hidden">
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-display text-[15px] font-extrabold tracking-tight text-[var(--ink-strong)]">
                        MARKETORR<span className="text-gradient">.</span> Admin
                    </span>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        className="rounded-lg border border-[var(--line)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em]"
                    >
                        {open ? 'Close' : 'Menu'}
                    </button>
                </div>
            </header>

            <div className="lg:flex">
                <aside
                    className={`${open ? 'block' : 'hidden'} border-b border-[var(--line)] bg-[var(--surface)] lg:sticky lg:top-0 lg:block lg:h-svh lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r`}
                >
                    <div className="hidden px-5 py-6 lg:block">
                        <Link href="/admin" className="flex items-center gap-2">
                            <span className="flex h-7 items-end gap-[3px]" aria-hidden>
                                <span className="h-3.5 w-[5px] rounded-[2px] bg-[#891FFB]" />
                                <span className="h-5 w-[5px] rounded-[2px] bg-[#507AF4]" />
                                <span className="h-7 w-[5px] rounded-[2px] bg-[#1BE2EB]" />
                            </span>
                            <span className="font-display text-[15px] font-extrabold tracking-tight text-[var(--ink-strong)]">
                                MARKETORR<span className="text-gradient">.</span>
                            </span>
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-5 px-3 pb-6 lg:px-3" aria-label="Admin">
                        {groups.map((group) => (
                            <div key={group.group} className="flex flex-col gap-1">
                                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]/70">
                                    {group.group}
                                </p>
                                {group.items.map((item) => {
                                    const active = isActive(url, item);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={`rounded-lg px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors ${
                                                active
                                                    ? 'bg-[var(--chip)] text-[var(--ink-strong)]'
                                                    : 'text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto border-t border-[var(--line)] px-5 py-4 lg:absolute lg:bottom-0 lg:w-60">
                        {user && (
                            <>
                                <p className="truncate text-[13px] font-semibold text-[var(--ink)]">{user.name}</p>
                                <p className="truncate text-[11px] text-[var(--ink-faint)]">{user.email}</p>
                            </>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <a href="/" target="_blank" rel="noreferrer" className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
                                View site ↗
                            </a>
                            <button onClick={logout} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
                                Log out
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
            </div>

            {/* Toast: floats clear of the page so a save never shifts the form
                the editor is still looking at. */}
            {notice && (
                <div
                    role="status"
                    className="fixed bottom-5 right-5 z-[200] flex max-w-sm items-start gap-3 rounded-xl border border-[#1BE2EB]/40 bg-[var(--surface)] px-4 py-3 text-[13px] text-[var(--ink)] shadow-2xl"
                >
                    <span aria-hidden className="mt-0.5 text-[#1BE2EB]">✓</span>
                    <span className="flex-1">{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        aria-label="Dismiss"
                        className="text-[var(--ink-faint)] hover:text-[var(--ink)]"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}
