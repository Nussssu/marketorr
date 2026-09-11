import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MagneticButton from '../motion/MagneticButton';
import ThemeToggle from './ThemeToggle';

const LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Our Work', href: '/work' },
    { label: 'Contact', href: '/contact' },
];

function isActive(url, href) {
    if (href === '/') return url === '/';
    return url === href || url.startsWith(`${href}/`);
}

function Logo() {
    return (
        <Link href="/" className="btn-press group flex items-center gap-3" aria-label="Marketorr home">
            <span className="flex h-9 items-end gap-[4px]" aria-hidden>
                <span className="h-5 w-[7px] rounded-[2px] bg-[#891FFB] transition-[height] duration-200 group-hover:h-9" />
                <span className="h-7 w-[7px] rounded-[2px] bg-[#507AF4] transition-[height] duration-200 group-hover:h-9" />
                <span className="h-9 w-[7px] rounded-[2px] bg-[#1BE2EB] transition-[height] duration-200 group-hover:h-9" />
            </span>
            <span className="font-display text-[19px] font-extrabold tracking-tight text-[var(--ink)]">
                MARKETORR<span className="text-gradient">.</span>
            </span>
        </Link>
    );
}

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.__lenis?.stop();

        return () => {
            document.body.style.overflow = previousOverflow;
            window.__lenis?.start();
        };
    }, [open]);

    useEffect(() => {
        setOpen(false);
    }, [url]);

    useEffect(() => {
        let ticking = false;

        const update = () => {
            ticking = false;
            // The bar is always on screen; this only picks the full-width vs floating shape.
            setScrolled(Math.max(0, window.scrollY) > 24);
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /** Scrolled and not mid-menu: the bar collapses into the centered pill. */
    const floating = scrolled && !open;

    return (
        <header className="fixed inset-x-0 top-0 z-[100]">
            {/* full-width at the top of the page, compact floating pill once scrolled */}
            <div className={`header-shell ${floating ? 'header-shell--float' : ''}`}>
                <div
                    className={`flex items-center justify-between transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        floating ? 'h-[60px]' : 'h-[72px]'
                    }`}
                >
                    <Logo />
                    <nav
                        className={`hidden items-center transition-[gap] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
                            floating ? 'gap-6' : 'gap-8'
                        }`}
                        aria-label="Primary"
                    >
                        {LINKS.map((l) => {
                            const active = isActive(url, l.href);
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className={`link-underline btn-press group relative py-2 text-[13px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${
                                        active ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'
                                    }`}
                                >
                                    <span className="relative block overflow-hidden">
                                        <span className="block transition-transform duration-200 group-hover:-translate-y-full">
                                            {l.label}
                                        </span>
                                        <span
                                            aria-hidden
                                            className="absolute inset-0 block translate-y-full text-gradient transition-transform duration-200 group-hover:translate-y-0"
                                        >
                                            {l.label}
                                        </span>
                                    </span>
                                </Link>
                            );
                        })}
                        <ThemeToggle />
                        <MagneticButton>
                            <Link
                                href="/contact"
                                data-cursor="cta"
                                className="btn-press inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
                                style={{
                                    background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)',
                                }}
                            >
                                Start a Project <span aria-hidden>↗</span>
                            </Link>
                        </MagneticButton>
                    </nav>
                    <div className="flex items-center gap-3 lg:hidden">
                        <ThemeToggle compact />
                        <button
                            className="btn-press flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)]"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-label="Toggle menu"
                        >
                            <span className="relative block h-3 w-5">
                                <span
                                    className={`absolute left-0 top-0 h-[2px] w-full bg-[var(--ink)] transition-transform duration-300 ${open ? 'translate-y-[5px] rotate-45' : ''}`}
                                />
                                <span
                                    className={`absolute bottom-0 left-0 h-[2px] w-full bg-[var(--ink)] transition-transform duration-300 ${open ? '-translate-y-[5px] -rotate-45' : ''}`}
                                />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            duration: 0.24,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="max-h-[calc(100svh-72px)] overflow-y-auto border-t border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-md lg:hidden"
                        aria-label="Mobile"
                    >
                        <div className="px-5 pb-8 pt-4">
                            {LINKS.map((l, i) => {
                                const active = isActive(url, l.href);
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center justify-between border-b border-[var(--line-soft)] py-4 font-display text-2xl font-bold ${
                                            active ? 'text-gradient' : 'text-[var(--ink)]'
                                        }`}
                                    >
                                        {l.label}
                                        <span className="text-sm text-[var(--ink-faint)]">0{i + 1}</span>
                                    </Link>
                                );
                            })}
                            <Link
                                href="/contact"
                                onClick={() => setOpen(false)}
                                className="mt-5 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold uppercase tracking-[0.16em] text-white"
                                style={{
                                    background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)',
                                }}
                            >
                                Start a Project ↗
                            </Link>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
