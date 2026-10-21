import { Link } from '@inertiajs/react';
import { TAB_BAR_CLASS, TAB_GRADIENT, tabClass } from './ui';

/**
 * Top pill tabs consolidating SMTP Settings and transactional Email Templates.
 */
export default function MailNav({ activeTab = 'smtp' }) {
    return (
        <div className="mb-8">
            <nav
                className={TAB_BAR_CLASS}
                aria-label="Email & SMTP pill tabs"
            >
                <Link
                    href="/admin/email-smtp"
                    className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] ${tabClass(activeTab === 'smtp')}`}
                    style={activeTab === 'smtp' ? TAB_GRADIENT : undefined}
                >
                    <span>SMTP Settings</span>
                </Link>
                <Link
                    href="/admin/email-templates"
                    className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] ${tabClass(activeTab === 'templates')}`}
                    style={activeTab === 'templates' ? TAB_GRADIENT : undefined}
                >
                    <span>Email Templates</span>
                </Link>
                <Link
                    href="/admin/email-logs"
                    className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] ${tabClass(activeTab === 'logs')}`}
                    style={activeTab === 'logs' ? TAB_GRADIENT : undefined}
                >
                    <span>Email Logs</span>
                </Link>
            </nav>
        </div>
    );
}
