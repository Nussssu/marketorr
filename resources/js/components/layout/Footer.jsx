import { Link, usePage } from '@inertiajs/react';

const SOCIALS = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/marketorr' },
    { label: 'Behance', href: 'https://www.behance.net/marketorr' },
    { label: 'Dribbble', href: 'https://dribbble.com/marketorr' },
    { label: 'Instagram', href: 'https://www.instagram.com/marketorr' },
];

const SITEMAP = [
    { label: 'About', hash: '#about' },
    { label: 'Services', hash: '#services' },
    { label: 'Our Work', hash: '#work' },
    { label: 'Contact', hash: '#contact' },
];

export default function Footer() {
    const year = new Date().getFullYear();
    const { url } = usePage();
    const home = url === '/';

    return (
        <footer className="relative bg-[var(--bg)]">
            <div className="h-[2px] w-full" aria-hidden style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }} />
            <div className="container-x grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 items-end gap-[4px]" aria-hidden>
                            <span className="h-4 w-[6px] rounded-[2px] bg-[#891FFB]" />
                            <span className="h-6 w-[6px] rounded-[2px] bg-[#507AF4]" />
                            <span className="h-8 w-[6px] rounded-[2px] bg-[#1BE2EB]" />
                        </span>
                        <span className="font-display text-lg font-extrabold text-[var(--ink)]">MARKETORR.</span>
                    </div>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--mute)]">
                        Independent creative &amp; digital agency. We turn ideas into experiences, and experiences into measurable results.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-5 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                        {SOCIALS.map((s) => (
                            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-underline btn-press hover:text-[var(--ink)]">{s.label}</a>
                        ))}
                    </div>
                </div>
                <nav aria-label="Footer">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Sitemap</p>
                    <div className="mt-4 flex flex-col gap-2.5 text-sm font-semibold text-[var(--ink)]">
                        {SITEMAP.map((s) =>
                            home ? (
                                <a key={s.hash} href={s.hash} className="btn-press w-fit opacity-80 hover:opacity-100 hover:text-[var(--ink)]">{s.label}</a>
                            ) : (
                                <Link key={s.hash} href={`/${s.hash}`} className="btn-press w-fit opacity-80 hover:opacity-100 hover:text-[var(--ink)]">{s.label}</Link>
                            ),
                        )}
                        <Link href="/work" className="btn-press w-fit opacity-80 hover:opacity-100 hover:text-[var(--ink)]">All work</Link>
                    </div>
                </nav>
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Services</p>
                    <div className="mt-4 flex flex-col gap-2.5 text-sm font-semibold text-[var(--ink)]">
                        <Link href="/services/branding" className="btn-press w-fit opacity-80 hover:opacity-100 hover:text-[var(--ink)]">Branding</Link>
                        <Link href="/services/web-ui-ux" className="btn-press w-fit opacity-80 hover:opacity-100 hover:text-[var(--ink)]">Web UI/UX</Link>
                        <Link href="/services/software-ui-ux" className="btn-press w-fit opacity-80 hover:opacity-100 hover:text-[var(--ink)]">Software UI/UX</Link>
                        <Link href="/services/mobile-app-ui-ux" className="btn-press w-fit opacity-80 hover:opacity-100 hover:text-[var(--ink)]">Mobile App UI/UX</Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-[var(--line)]">
                <div className="container-x flex flex-col gap-2 py-5 text-[12px] text-[var(--ink-faint)] sm:flex-row sm:items-center sm:justify-between">
                    <span>© {year} Marketorr. All rights reserved.</span>
                    <span className="flex gap-5">
                        <Link href="/privacy" className="btn-press hover:text-[var(--ink)]">Privacy</Link>
                        <Link href="/terms" className="btn-press hover:text-[var(--ink)]">Terms</Link>
                        <span className="font-bold text-gradient">IDEA → EXPERIENCE → RESULT</span>
                    </span>
                </div>
            </div>
        </footer>
    );
}
