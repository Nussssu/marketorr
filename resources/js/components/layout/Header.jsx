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
 * Reveal beat for the full-screen menu. The surface wipes down from under the
 * navbar, then the rail, sections and rows arrive just behind it. Closing
 * skips the stagger so the overlay never lingers once the pointer leaves.
 */
function megaVariants(reduce) {
    return {
        scrim: {
            hidden: { opacity: 0, transition: { duration: 0.2, ease: [...EASE] } },
            show: { opacity: 1, transition: { duration: 0.34, ease: [...EASE] } },
        },
        panel: {
            hidden: {
                opacity: 0,
                clipPath: reduce ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                transition: { duration: 0.24, ease: [...EASE] },
            },
            show: {
                opacity: 1,
                clipPath: 'inset(0% 0% 0% 0%)',
                transition: {
                    duration: reduce ? 0.2 : 0.52,
                    ease: [...EASE],
                    staggerChildren: reduce ? 0 : 0.045,
                    delayChildren: reduce ? 0 : 0.12,
                },
            },
        },
        item: {
            hidden: { opacity: 0, y: reduce ? 0 : 14, transition: { duration: 0.12 } },
            show: { opacity: 1, y: 0, transition: { duration: 0.46, ease: [...EASE] } },
        },
        row: {
            hidden: { opacity: 0, y: reduce ? 0 : 10, transition: { duration: 0.1 } },
            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [...EASE] } },
        },
    };
}

/**
 * One sub-service row inside a discipline section. Ruled top and bottom so the
 * list reads as a set; the accent bar and arrow only appear under the pointer.
 * Navigates on a real tap/click only - the tap-intent guard swallows drags.
 */
function MegaSubLink({ category, item, variants, onNavigate }) {
    const tapIntent = useTapIntent();
    const href = `/services/${category.slug}/${item.slug}`;

    return (
        <motion.li variants={variants} className="border-b border-[var(--line-soft)] last:border-b-0">
            <Link
                href={href}
                prefetch
                data-cursor="explore"
                {...tapIntent}
                onClick={(event) => {
                    tapIntent.onClick(event);
                    navigateWithCurtain(event, href, onNavigate);
                }}
                className="group/row flex items-center gap-4 py-3.5 focus-visible:outline-none"
            >
                <span
                    className="h-[2px] w-0 shrink-0 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:w-5 group-focus-visible/row:w-5"
                    style={{ background: item.accent ?? category.accent }}
                    aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium leading-snug text-[var(--mute)] transition-colors duration-300 group-hover/row:text-[var(--ink)] group-focus-visible/row:text-[var(--ink)]">
                    {item.name}
                </span>
                <span
                    aria-hidden
                    className="shrink-0 -translate-x-2 text-[14px] leading-none text-[var(--ink-faint)] opacity-0 transition-all duration-300 group-hover/row:translate-x-0 group-hover/row:opacity-100 group-focus-visible/row:translate-x-0 group-focus-visible/row:opacity-100"
                >
                    &rarr;
                </span>
            </Link>
        </motion.li>
    );
}

/**
 * One discipline section: an oversized heading that links to the category
 * page, and every sub-service ruled out beneath it.
 */
function MegaSection({ category, index, variants, onNavigate }) {
    const tapIntent = useTapIntent();
    const href = `/services/${category.slug}`;
    const items = category.items ?? [];

    return (
        <div className="min-w-0">
            <motion.div variants={variants.item}>
                <Link
                    href={href}
                    prefetch
                    data-cursor="explore"
                    {...tapIntent}
                    onClick={(event) => {
                        tapIntent.onClick(event);
                        navigateWithCurtain(event, href, onNavigate);
                    }}
                    className="group/head block focus-visible:outline-none"
                >
                    <span className="flex items-center gap-3">
                        <span className="font-display text-[11px] font-bold tracking-[0.22em] text-[var(--ink-faint)]" aria-hidden>
                            0{index + 1}
                        </span>
                        <span
                            className="h-px w-8 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/head:w-14"
                            style={{ background: category.accent }}
                            aria-hidden
                        />
                    </span>
                    <span className="mt-4 flex items-baseline gap-3">
                        <span className="min-w-0 font-display text-[clamp(1.5rem,2vw,2.15rem)] font-bold leading-[1.05] tracking-[-0.01em] text-[var(--ink)]">
                            {category.name}
                        </span>
                        <span
                            aria-hidden
                            className="shrink-0 -translate-x-1 text-[14px] leading-none text-[var(--ink-faint)] opacity-0 transition-all duration-300 group-hover/head:translate-x-0 group-hover/head:opacity-100"
                        >
                            &#8599;
                        </span>
                    </span>
                    {category.short && (
                        <span className="mt-2.5 block max-w-[30ch] text-[13px] leading-relaxed text-[var(--mute)]">
                            {category.short}
                        </span>
                    )}
                </Link>
            </motion.div>
            <ul className="mt-7 list-none border-t border-[var(--line-soft)]">
                {items.map((item) => (
                    <MegaSubLink
                        key={item.slug}
                        category={category}
                        item={item}
                        variants={variants.row}
                        onNavigate={onNavigate}
                    />
                ))}
            </ul>
        </div>
    );
}

/**
 * Full-screen Services menu. A full-bleed surface drops from under the navbar
 * with the two disciplines side by side and every sub-service ruled out
 * beneath them; the rest of the viewport dims behind it. Data-driven, so new
 * sub-services appear automatically. Desktop only - small screens use the
 * Services panel inside the mobile menu.
 */
function ServicesMegaMenu({ categories, onNavigate, onPointerOpen, onPointerClose }) {
    const reduce = useReducedMotion();
    const variants = megaVariants(reduce);

    return (
        <div className="fixed inset-0 z-0 hidden lg:block">
            {/* Everything below the panel dims and softens, so the menu owns the
                screen. Reaching for the page behind it is a way out, so entering
                or clicking the scrim closes the menu. */}
            <motion.div
                variants={variants.scrim}
                initial="hidden"
                animate="show"
                exit="hidden"
                aria-hidden
                onMouseEnter={onPointerClose}
                onClick={onNavigate}
                className="absolute inset-0 backdrop-blur-[3px]"
                style={{ background: 'color-mix(in srgb, var(--bg) 62%, transparent)' }}
            />
            <motion.div
                variants={variants.panel}
                initial="hidden"
                animate="show"
                exit="hidden"
                onMouseEnter={onPointerOpen}
                onMouseLeave={onPointerClose}
                className="absolute inset-x-0 top-0 overflow-hidden border-b border-[var(--line)] bg-[var(--bg)]"
                role="group"
                aria-label="Services menu"
            >
                {/* Quiet vertical rhythm behind the content, plus one soft brand wash. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
                        backgroundSize: '120px 100%',
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: 'radial-gradient(70% 120% at 12% 0%, var(--glow-purple), transparent 62%), radial-gradient(60% 110% at 88% 10%, var(--glow-cyan), transparent 60%)',
                    }}
                />
                <div className="container-x relative pb-12 pt-[104px] xl:pb-16">
                    <div className="grid grid-cols-12 gap-x-10 xl:gap-x-16">
                        <motion.div variants={variants.item} className="col-span-4 flex min-w-0 flex-col justify-between">
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink-faint)]">
                                    What we do
                                </span>
                                <p className="mt-6 max-w-[16ch] font-display text-[clamp(1.75rem,2.6vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--ink)]">
                                    Design that <span className="text-gradient">compounds</span>.
                                </p>
                                <p className="mt-5 max-w-[34ch] text-[13.5px] leading-relaxed text-[var(--mute)]">
                                    Two disciplines, one standard. Pick a practice, or go straight
                                    to the specialism you need.
                                </p>
                            </div>
                            <Link
                                href="/services"
                                prefetch
                                data-cursor="explore"
                                onClick={(event) => navigateWithCurtain(event, '/services', onNavigate)}
                                className="group/all mt-10 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--line)] px-5 py-3 transition-colors duration-300 hover:border-[var(--field-line)] focus-visible:outline-none"
                            >
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                                    View all services
                                </span>
                                <span aria-hidden className="text-[13px] leading-none text-[var(--ink-faint)] transition-transform duration-300 group-hover/all:translate-x-1">
                                    &rarr;
                                </span>
                            </Link>
                        </motion.div>
                        {categories.map((category, index) => (
                            <div
                                key={category.slug}
                                className="col-span-4 min-w-0 border-l border-[var(--line-soft)] pl-10 xl:pl-14"
                            >
                                <MegaSection
                                    category={category}
                                    index={index}
                                    variants={variants}
                                    onNavigate={onNavigate}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {/* The brand, reduced to a single hairline along the bottom edge. */}
                <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px opacity-90"
                    style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                />
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
 * One discipline block inside the mobile Services panel - the small-screen
 * reading of the full-screen menu. The heading links to the category page and
 * every sub-service is ruled out under it, so nothing hides behind a second
 * tap and the list still has room to breathe.
 */
function MobileServiceGroup({ category, index, onNavigate }) {
    const items = category.items ?? [];

    return (
        <div className="pb-7 pl-11 pr-2 pt-5">
            <Link
                href={`/services/${category.slug}`}
                onClick={(event) => navigateWithCurtain(event, `/services/${category.slug}`, onNavigate)}
                className="block"
            >
                <span className="flex items-center gap-3">
                    <span className="font-display text-[10px] font-bold tracking-[0.22em] text-[var(--ink-faint)]" aria-hidden>
                        0{index + 1}
                    </span>
                    <span className="h-px w-7 shrink-0" style={{ background: category.accent }} aria-hidden />
                </span>
                <span className="mt-3 flex items-baseline gap-2.5">
                    <span className="min-w-0 truncate font-display text-[1.5rem] font-bold leading-[1.1] tracking-[-0.01em] text-[var(--ink)]">
                        {category.name}
                    </span>
                    <span aria-hidden className="shrink-0 text-[13px] leading-none text-[var(--ink-faint)]">&#8599;</span>
                </span>
                {category.short && (
                    <span className="mt-2 block text-[12.5px] leading-relaxed text-[var(--mute)]">
                        {category.short}
                    </span>
                )}
            </Link>
            <ul className="mt-5 list-none border-t border-[var(--line-soft)]">
                {items.map((item) => (
                    <li key={item.slug} className="border-b border-[var(--line-soft)] last:border-b-0">
                        <Link
                            href={`/services/${category.slug}/${item.slug}`}
                            onClick={(event) => navigateWithCurtain(event, `/services/${category.slug}/${item.slug}`, onNavigate)}
                            className="flex items-center gap-3.5 py-3.5 active:opacity-70"
                        >
                            <span
                                className="h-[2px] w-4 shrink-0 rounded-full"
                                style={{ background: item.accent ?? category.accent }}
                                aria-hidden
                            />
                            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-[var(--ink)]">
                                {item.name}
                            </span>
                            <span aria-hidden className="shrink-0 text-[13px] text-[var(--ink-faint)]">&rarr;</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [mega, setMega] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
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
        if (!mega) return undefined;

        // Escape only. The menu stays open until the reader closes it or
        // goes somewhere - scrolling the page behind it is not a decision to
        // close, and treating it as one made the menu vanish under the reader.
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setMega(false);
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [mega]);

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
    }, [url]);

    useEffect(() => {
        if (!open) {
            setMobileServicesOpen(false);
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
            <div className={`header-shell mobile-header-shell relative z-10 ${floating ? 'header-shell--float' : ''}`}>
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
                {mega && (
                    <ServicesMegaMenu
                        key="services-mega-menu"
                        categories={serviceCategories}
                        onNavigate={() => setMega(false)}
                        onPointerOpen={openMega}
                        onPointerClose={scheduleMegaClose}
                    />
                )}
            </AnimatePresence>
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
                                                        {serviceCategories.map((category, categoryIndex) => (
                                                            <MobileServiceGroup
                                                                key={category.slug}
                                                                category={category}
                                                                index={categoryIndex}
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
