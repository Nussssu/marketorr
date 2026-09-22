import { Link } from '@inertiajs/react';

/**
 * Top pill tabs consolidating SMTP Settings and transactional Email Templates.
 */
export default function MailNav({ activeTab = 'smtp' }) {
    return (
        <div className="mb-8">
            <nav
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--field-line)] bg-[var(--surface)] p-1.5 shadow-xs"
                aria-label="Email & SMTP pill tabs"
            >
                <Link
                    href="/admin/email-smtp"
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition-all ${
                        activeTab === 'smtp'
                            ? 'bg-[var(--chip)] text-[var(--ink-strong)] shadow-xs'
                            : 'text-[var(--ink-faint)] hover:bg-[var(--chip)]/50 hover:text-[var(--ink)]'
                    }`}
                >
                    <span>SMTP Settings</span>
                </Link>
                <Link
                    href="/admin/email-templates"
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition-all ${
                        activeTab === 'templates'
                            ? 'bg-[var(--chip)] text-[var(--ink-strong)] shadow-xs'
                            : 'text-[var(--ink-faint)] hover:bg-[var(--chip)]/50 hover:text-[var(--ink)]'
                    }`}
                >
                    <span>Email Templates</span>
                </Link>
            </nav>
        </div>
    );
}
