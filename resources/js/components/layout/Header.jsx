import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BrandLogo from './BrandLogo';
import MagneticButton from '../motion/MagneticButton';
import ThemeToggle from './ThemeToggle';
import { useTapIntent } from '../../lib/tapIntent';
import { transitionTo } from '../motion/PageTransition';

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

function navigateWithCurtain(event, href, onNavigate) {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();
    onNavigate?.();
    transitionTo(href);
}

function Logo() {
    return (
        <Link
            href="/"
            onClick={(event) => navigateWithCurtain(event, '/')}
            className="btn-press group flex items-center"
            aria-label="Marketorr home"
        >
            <BrandLogo
                height={19}
                className="transition-transform duration-300 ease-out group-hover:scale-[1.03] sm:[&_img]:!h-[24px] lg:[&_img]:!h-[26px]"
            />
        </Link>
    );
}

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
 * One sub-service row inside a flyout submenu. Navigates only on a real
 * tap/click — the tap-intent guard swallows scrolls and drags.
 */
function DropdownSubLink({ category, item, onNavigate }) {
    const tapIntent = useTapIntent();
    const href = `/services/${category.slug}/${item.slug}`;

    return (
        <Link
            href={href}
            prefetch
            data-cursor="explore"
            {...tapIntent}
            onClick={(event) => {
                tapIntent.onClick(event);
                navigateWithCurtain(event, href, onNavigate);
            }}
            className="flex items-center gap-2.5 px-4 py-2 transition-colors duration-150 hover:bg-[var(--chip)]"
        >
            <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: item.accent ?? category.accent }}
                aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--ink)]">
                {item.name}
            </span>
        </Link>
    );
}

/**
 * Flyout submenu beside its category row. Pure CSS hover/focus reveal —
 * no JS state, so it appears instantly with a short fade/slide. The
 * padding bridge keeps it open while the pointer travels across the gap.
 */
function ServiceFlyout({ category, onNavigate }) {
    return (
        <div className="invisible absolute left-full top-0 z-10 translate-x-1 pl-2 opacity-0 transition-all duration-150 ease-out group-hover/item:visible group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-within/item:visible group-focus-within/item:translate-x-0 group-focus-within/item:opacity-100">
            <ul className="w-60 rounded-xl border border-[var(--line)] bg-[var(--header-bg)] py-1.5 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                {(category.items ?? []).map((item) => (
                    <li key={item.slug}>
                        <DropdownSubLink category={category} item={item} onNavigate={onNavigate} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * One category row in the Services dropdown. The row itself links to the
 * dedicated category page; hovering (or keyboard-focusing) it reveals the
 * flyout submenu beside it.
 */
function ServiceMenuItem({ category, onNavigate }) {
    const tapIntent = useTapIntent();
    const href = `/services/${category.slug}`;

    return (
        <div className="group/item relative">
            <Link
                href={href}
                prefetch
                data-cursor="explore"
                {...tapIntent}
                onClick={(event) => {
                    tapIntent.onClick(event);
                    navigateWithCurtain(event, href, onNavigate);
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 transition-colors duration-150 hover:bg-[var(--chip)]"
                aria-haspopup="true"
            >
                <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: category.accent }}
                    aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--ink)]">
                    {category.name}
                </span>
                <span aria-hidden className="shrink-0 text-[13px] leading-none text-[var(--ink-faint)]">›</span>
            </Link>
            <ServiceFlyout category={category} onNavigate={onNavigate} />
        </div>
    );
}

/**
 * Minimal Services dropdown: a small box with the two disciplines, each
 * revealing its sub-services in a flyout beside it. No cards, no
 * descriptions, no footer — just navigation. Data-driven, so new
 * sub-services appear automatically. Hover intent (open fast,
 * grace-period close) lives on the parent.
 */
function ServicesDropdown({ categories, onNavigate }) {
    const reduce = useReducedMotion();

    return (
        <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-2 lg:block">
            <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -4, transition: { duration: 0.14, ease: [...EASE] } }}
                transition={{ duration: 0.18, ease: [...EASE] }}
                className="w-60 overflow-visible rounded-xl border border-[var(--line)] bg-[var(--header-bg)] py-1.5 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
                {categories.map((category) => (
                    <ServiceMenuItem
                        key={category.slug}
                        category={category}
                        onNavigate={onNavigate}
                    />
                ))}
            </motion.div>
        </div>
    );
}

/** Small chevron toggle used by the mobile Services accordion. */
function AccordionChevron({ expanded }) {
    return (
        <span
            aria-hidden
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        >
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="block">
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    );
}

/**
 * One expandable category inside the mobile Services accordion. The name
 * itself links to the dedicated category page; the chevron expands the
 * sub-service list in place.
 */
function MobileServiceCategory({ category, expanded, onToggle, onNavigate }) {
    const reduce = useReducedMotion();
    const items = category.items ?? [];

    return (
        <div className="border-b border-[var(--line-soft)]">
            <div className="flex items-center gap-2 pl-11 pr-2">
                <Link
                    href={`/services/${category.slug}`}
                    onClick={(event) => navigateWithCurtain(event, `/services/${category.slug}`, onNavigate)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 py-3 text-left"
                >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: category.accent }} aria-hidden />
                    <span className="min-w-0">
                        <span className="block truncate text-[15px] font-bold text-[var(--ink)]">{category.name}</span>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                            {items.length} services
                        </span>
                    </span>
                </Link>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${category.name} services`}
                    className="btn-press shrink-0 p-1"
                >
                    <AccordionChevron expanded={expanded} />
                </button>
            </div>
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.26, ease: [...EASE] }}
                        className="overflow-hidden"
                    >
                        {items.map((item) => (
                            <li key={item.slug}>
                                <Link
                                    href={`/services/${category.slug}/${item.slug}`}
                                    onClick={(event) => navigateWithCurtain(event, `/services/${category.slug}/${item.slug}`, onNavigate)}
                                    className="flex items-center gap-2.5 py-2.5 pl-[52px] pr-5"
                                >
                                    <span
                                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                                        style={{ background: item.accent ?? category.accent }}
                                        aria-hidden
                                    />
                                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--ink)]">
                                        {item.name}
                                    </span>
                                    <span aria-hidden className="shrink-0 text-[13px] text-[var(--ink-faint)]">→</span>
                                </Link>
                            </li>
                        ))}
                        <li aria-hidden className="pb-2" />
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [mega, setMega] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const [mobileCat, setMobileCat] = useState(null);
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
        setMobileServicesOpen(false);
        setMobileCat(null);
    }, [url]);

    useEffect(() => {
        if (!open) {
            setMobileServicesOpen(false);
            setMobileCat(null);
        }
    }, [open]);

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
                                        className="relative"
                                    >
                                        <Link
                                            href={l.href}
                                            onClick={(event) => navigateWithCurtain(event, l.href, () => setMega(false))}
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
                                                <ServicesDropdown
                                                    key="services-dropdown"
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
                                    onClick={(event) => navigateWithCurtain(event, l.href)}
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
                                onClick={(event) => navigateWithCurtain(event, '/contact')}
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

                                if (l.href === '/services') {
                                    return (
                                        <motion.li key={l.href} variants={MOBILE_MENU_ITEM} className="w-full">
                                            <div className="flex h-16 w-full items-center gap-4 border-b border-[var(--line-soft)]">
                                                <span className="w-7 shrink-0 font-display text-[10px] font-bold tracking-[0.16em] text-[var(--ink-faint)]" aria-hidden>
                                                    0{i + 1}
                                                </span>
                                                <Link
                                                    href={l.href}
                                                    onClick={(event) => navigateWithCurtain(event, l.href, () => setOpen(false))}
                                                    aria-current={active ? 'page' : undefined}
                                                    className="flex min-w-0 flex-1 items-center"
                                                >
                                                    <span className={`truncate font-display text-[clamp(1.35rem,7vw,1.75rem)] font-bold leading-none ${
                                                        active ? 'text-gradient' : 'text-[var(--ink)]'
                                                    }`}>
                                                        {l.label}
                                                    </span>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setMobileServicesOpen((v) => !v)}
                                                    aria-expanded={mobileServicesOpen}
                                                    aria-label={`${mobileServicesOpen ? 'Collapse' : 'Expand'} services`}
                                                    className="btn-press shrink-0 p-1"
                                                >
                                                    <AccordionChevron expanded={mobileServicesOpen} />
                                                </button>
                                            </div>
                                            <AnimatePresence initial={false}>
                                                {mobileServicesOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.28, ease: [...EASE] }}
                                                        className="overflow-hidden"
                                                    >
                                                        {serviceCategories.map((category) => (
                                                            <MobileServiceCategory
                                                                key={category.slug}
                                                                category={category}
                                                                expanded={mobileCat === category.slug}
                                                                onToggle={() => setMobileCat((current) => (current === category.slug ? null : category.slug))}
                                                                onNavigate={() => setOpen(false)}
                                                            />
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.li>
                                    );
                                }

                                return (
                                    <motion.li key={l.href} variants={MOBILE_MENU_ITEM} className="w-full">
                                        <Link
                                            href={l.href}
                                            onClick={(event) => navigateWithCurtain(event, l.href, () => setOpen(false))}
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
