import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BrandLogo from './BrandLogo';
import MagneticButton from '../motion/MagneticButton';
import ThemeToggle from './ThemeToggle';
import { useTapIntent } from '../../lib/tapIntent';

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
        <Link href="/" className="btn-press group flex items-center" aria-label="Marketorr home">
            <BrandLogo
                height={19}
                className="transition-transform duration-300 ease-out group-hover:scale-[1.03] sm:[&_img]:!h-[24px] lg:[&_img]:!h-[26px]"
            />
        </Link>
    );
}

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';
const EASE = [0.22, 1, 0.36, 1];

/**
 * Mobile menu rows arrive one after another rather than as a single block, and
 * leave together so closing stays quick. The panel itself still does the fade
 * and slide; this is the beat inside it.
 */
const MOBILE_MENU = {
    hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const MOBILE_MENU_ITEM = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [...EASE] } },
};

/** Rolling two-line label shared by desktop nav links. */
function NavLabel({ label }) {
    return (
        <span className="relative block overflow-hidden">
            <span className="block transition-transform duration-200 group-hover:-translate-y-full">
                {label}
            </span>
            <span
                aria-hidden
                className="absolute inset-0 block translate-y-full text-gradient transition-transform duration-200 group-hover:translate-y-0"
            >
                {label}
            </span>
        </span>
    );
}

/**
 * One discipline in the Services menu. Keeps the column treatment the menu
 * always had — index label, oversized gradient title, growing brand rule,
 * circular arrow badge, blurb — but the whole column is now a single link
 * straight to its category page rather than an accordion of sub-services.
 */
function MegaCategoryLink({ category, index, onNavigate, className = '' }) {
    const tapIntent = useTapIntent();

    return (
        <Link
            href={`/services/${category.slug}`}
            onClick={onNavigate}
            prefetch
            data-cursor="explore"
            {...tapIntent}
            className={`group block ${className}`.trim()}
        >
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">{index} — Category</p>
            <span className="mt-2 flex w-full items-start justify-between gap-4 text-left">
                <span>
                    <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-[var(--ink-strong)] transition-colors duration-200 group-hover:text-gradient xl:text-[1.75rem]">
                        {category.name}<span className="text-gradient">.</span>
                    </span>
                    <span aria-hidden className="mt-2 block h-[3px] w-16 origin-left rounded-full transition-[width] duration-300 ease-out group-hover:w-full" style={{ background: BRAND_GRADIENT }} />
                </span>
                <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-base text-[var(--ink)] transition-all duration-200 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-[#507AF4] group-hover:text-white"
                >
                    ↗
                </span>
            </span>
            {category.short && (
                <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-[var(--mute)]">{category.short}</p>
            )}
        </Link>
    );
}

function ServicesMegaMenu({ categories, onNavigate }) {
    const reduce = useReducedMotion();
    const container = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.055, delayChildren: reduce ? 0 : 0.05 } },
    };
    const item = {
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [...EASE] } },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8, transition: { duration: 0.18, ease: [...EASE] } }}
            transition={{ duration: 0.22, ease: [...EASE] }}
            className="absolute left-0 right-0 top-full mx-auto mt-2 hidden w-full max-w-[860px] rounded-2xl border border-[var(--line)] bg-[var(--header-bg)] shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45)] backdrop-blur-md lg:block"
        >
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-2 gap-8 px-7 py-6"
            >
                {categories.map((category, i) => (
                    <motion.div key={category.slug} variants={item}>
                        <MegaCategoryLink
                            category={category}
                            index={`0${i + 1}`}
                            onNavigate={onNavigate}
                            className={i > 0 ? 'border-l border-[var(--line)] pl-8' : ''}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [mega, setMega] = useState(false);
    const closeTimer = useRef(null);
    const { url, props } = usePage();
    const serviceCategories = props.serviceCategories ?? [];

    /** Hover intent: open instantly, close after a short grace period. */
    const openMega = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setMega(true);
    };
    const scheduleMegaClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setMega(false), 140);
    };
    const handleMegaBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) scheduleMegaClose();
    };

    useEffect(() => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }, []);

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
        setMega(false);
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
        <header className="fixed inset-x-0 top-0 z-[9999]">
            {/* full-width at the top of the page, compact floating pill once scrolled */}
            <div className={`header-shell mobile-header-shell ${floating ? 'header-shell--float' : ''}`}>
                <div
                    className={`flex h-16 items-center justify-between transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        floating ? 'lg:h-[60px]' : 'lg:h-[72px]'
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
                            const linkClass = `link-underline btn-press group relative py-2 text-[13px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${
                                active ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'
                            }`;
                            if (l.href === '/services') {
                                return (
                                    <div
                                        key={l.href}
                                        onMouseEnter={openMega}
                                        onMouseLeave={scheduleMegaClose}
                                        onFocus={openMega}
                                        onBlur={handleMegaBlur}
                                        onKeyDown={(e) => { if (e.key === 'Escape') setMega(false); }}
                                    >
                                        <Link
                                            href={l.href}
                                            aria-haspopup="true"
                                            aria-expanded={mega}
                                            className={linkClass}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <NavLabel label={l.label} />
                                                <span
                                                    aria-hidden
                                                    className={`transition-transform duration-200 ease-out ${mega ? 'rotate-180' : 'group-hover:translate-y-[1px]'}`}
                                                >
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="block">
                                                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </span>
                                            </span>
                                        </Link>
                                        <AnimatePresence initial={false}>
                                            {mega && (
                                                <ServicesMegaMenu
                                                    key="services-mega"
                                                    categories={serviceCategories}
                                                    onNavigate={() => setMega(false)}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            }
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className={linkClass}
                                >
                                    <NavLabel label={l.label} />
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
                            aria-label={open ? 'Close menu' : 'Open menu'}
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
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                            duration: 0.24,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain border-t border-[var(--line)] bg-[var(--bg)] lg:hidden"
                        aria-label="Mobile"
                    >
                        <motion.ul
                            className="flex list-none flex-col px-5 pb-10 pt-2"
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={MOBILE_MENU}
                        >
                            {LINKS.map((l, i) => {
                                const active = isActive(url, l.href);

                                return (
                                    <motion.li key={l.href} variants={MOBILE_MENU_ITEM} className="w-full">
                                        <Link
                                            href={l.href}
                                            onClick={() => setOpen(false)}
                                            aria-current={active ? 'page' : undefined}
                                            className="flex h-16 w-full items-center gap-4 border-b border-[var(--line-soft)]"
                                        >
                                            {/* Fixed-width gutter: the number keeps its own column, so a
                                                long label can never run into it. */}
                                            <span className="w-7 shrink-0 font-display text-[10px] font-bold tracking-[0.16em] text-[var(--ink-faint)]" aria-hidden>
                                                0{i + 1}
                                            </span>
                                            <span className={`min-w-0 flex-1 truncate font-display text-[clamp(1.35rem,7vw,1.75rem)] font-bold leading-none ${
                                                active ? 'text-gradient' : 'text-[var(--ink)]'
                                            }`}>
                                                {l.label}
                                            </span>
                                            <span aria-hidden className="shrink-0 text-[var(--ink-faint)]">→</span>
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </motion.ul>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
