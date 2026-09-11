import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import MagneticButton from '../motion/MagneticButton';
import ThemeToggle from './ThemeToggle';

const LINKS = [
    { label: 'About', hash: '#about' },
    { label: 'Services', hash: '#services' },
    { label: 'Our Work', hash: '#work' },
    { label: 'Contact', hash: '#contact' },
];

function Logo({ home }) {
    const inner = (
        <>
            <span className="flex h-9 items-end gap-[4px]" aria-hidden>
                <span className="h-5 w-[7px] rounded-[2px] bg-[#891FFB] transition-all duration-300 group-hover:h-9" />
                <span className="h-7 w-[7px] rounded-[2px] bg-[#507AF4] transition-all duration-300 group-hover:h-9" />
                <span className="h-9 w-[7px] rounded-[2px] bg-[#1BE2EB] transition-all duration-300 group-hover:h-9" />
            </span>
            <span className="font-display text-[19px] font-extrabold tracking-tight text-[var(--ink)]">
                MARKETORR<span className="text-gradient">.</span>
            </span>
        </>
    );
    const cls = 'btn-press group flex items-center gap-3';
    if (home) {
        return (
            <a href="#top" className={cls} aria-label="Marketorr home">
                {inner}
            </a>
        );
    }
    return (
        <Link href="/" className={cls} aria-label="Marketorr home">
            {inner}
        </Link>
    );
}

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [open, setOpen] = useState(false);
    const reduce = useReducedMotion();
    const { url } = usePage();
    const home = url === '/';
    const hrefFor = (hash) => (home ? hash : `/${hash}`);

    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 24);
            if (reduce) return;
            if (y > 320 && y > last + 4) setHidden(true);
            else if (y < last - 4) setHidden(false);
            last = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [reduce]);

    return (
        <motion.header
            animate={{ y: hidden && !open ? '-110%' : '0%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${
                scrolled && !open
                    ? 'border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-xl'
                    : 'border-b border-transparent bg-transparent'
            }`}
        >
            <div className="container-x flex h-[72px] items-center justify-between">
                <Logo home={home} />
                <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
                    {LINKS.map((l) =>
                        home ? (
                            <a
                                key={l.hash}
                                href={hrefFor(l.hash)}
                                className="link-underline btn-press group relative py-2 text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                            >
                                <span className="relative block overflow-hidden">
                                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">{l.label}</span>
                                    <span aria-hidden className="absolute inset-0 block translate-y-full text-gradient transition-transform duration-300 group-hover:translate-y-0">
                                        {l.label}
                                    </span>
                                </span>
                            </a>
                        ) : (
                            <Link
                                key={l.hash}
                                href={hrefFor(l.hash)}
                                className="link-underline btn-press group relative py-2 text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                            >
                                <span className="relative block overflow-hidden">
                                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">{l.label}</span>
                                    <span aria-hidden className="absolute inset-0 block translate-y-full text-gradient transition-transform duration-300 group-hover:translate-y-0">
                                        {l.label}
                                    </span>
                                </span>
                            </Link>
                        ),
                    )}
                    <ThemeToggle />
                    <MagneticButton>
                        {home ? (
                            <a
                                href="#contact"
                                data-cursor="cta"
                                className="btn-press inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
                                style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                            >
                                Start a Project <span aria-hidden>↗</span>
                            </a>
                        ) : (
                            <Link
                                href="/#contact"
                                data-cursor="cta"
                                className="btn-press inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
                                style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                            >
                                Start a Project <span aria-hidden>↗</span>
                            </Link>
                        )}
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
                            <span className={`absolute left-0 top-0 h-[2px] w-full bg-[var(--ink)] transition-transform duration-300 ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
                            <span className={`absolute bottom-0 left-0 h-[2px] w-full bg-[var(--ink)] transition-transform duration-300 ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
                        </span>
                    </button>
                </div>
            </div>
            {open && (
                <nav className="border-t border-[var(--line)] bg-[var(--header-bg)] px-5 pb-8 pt-4 backdrop-blur-xl lg:hidden" aria-label="Mobile">
                    {LINKS.map((l, i) =>
                        home ? (
                            <a
                                key={l.hash}
                                href={hrefFor(l.hash)}
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-between border-b border-[var(--line-soft)] py-4 font-display text-2xl font-bold text-[var(--ink)]"
                            >
                                {l.label}
                                <span className="text-sm text-[var(--ink-faint)]">0{i + 1}</span>
                            </a>
                        ) : (
                            <Link
                                key={l.hash}
                                href={hrefFor(l.hash)}
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-between border-b border-[var(--line-soft)] py-4 font-display text-2xl font-bold text-[var(--ink)]"
                            >
                                {l.label}
                                <span className="text-sm text-[var(--ink-faint)]">0{i + 1}</span>
                            </Link>
                        ),
                    )}
                    {home ? (
                        <a
                            href="#contact"
                            onClick={() => setOpen(false)}
                            className="mt-5 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold uppercase tracking-[0.16em] text-white"
                            style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                        >
                            Start a Project ↗
                        </a>
                    ) : (
                        <Link
                            href="/#contact"
                            onClick={() => setOpen(false)}
                            className="mt-5 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold uppercase tracking-[0.16em] text-white"
                            style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                        >
                            Start a Project ↗
                        </Link>
                    )}
                </nav>
            )}
        </motion.header>
    );
}
