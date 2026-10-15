import { Link, usePage } from '@inertiajs/react';
import { GradientTitle } from '../ui/primitives';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import BrandLogo from './BrandLogo';
import MagneticButton from '../motion/MagneticButton';
import ThemeToggle from './ThemeToggle';
import { useTapIntent } from '../../lib/tapIntent';
import { transitionTo } from '../motion/PageTransition';
import { MARK, markBarStyle, markGap } from '../../lib/tokens';

/**
 * Used only when the Header menu has been emptied in the admin panel — the
 * site should never be left with no way to navigate.
 */
const FALLBACK_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Our Work', href: '/work' },
];

function menuTreeToMegaGroups(items, fallbackGroups) {
    return items.map((parent) => {
        const fallback = fallbackGroups.find((group) =>
            group.href === parent.url
            || `/services#${group.slug}` === parent.url
            || group.name === parent.label,
        );

        return {
            ...fallback,
            slug: fallback?.slug ?? `menu-${parent.id}`,
            name: parent.label,
            href: parent.url,
            newTab: parent.newTab,
            items: (parent.children ?? []).map((child) => {
                const fallbackItem = fallback?.items?.find((item) =>
                    item.href === child.url
                    || `/services/${fallback.slug}/${item.slug}` === child.url
                    || item.name === child.label,
                );

                return {
                    ...fallbackItem,
                    slug: fallbackItem?.slug ?? `menu-${child.id}`,
                    name: child.label,
                    href: child.url,
                    newTab: child.newTab,
                };
            }),
        };
    });
}

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

/** `compact` shrinks the mark to suit the floating pill the header becomes once scrolled. */
function Logo({ compact = false }) {
    const sizeClass = compact
        ? '[&_img]:!h-[16px] sm:[&_img]:!h-[19px] lg:[&_img]:!h-[20px]'
        : 'sm:[&_img]:!h-[24px] lg:[&_img]:!h-[26px]';

    return (
        <Link
            href="/"
            onClick={(event) => navigateWithCurtain(event, '/')}
            className="btn-press group flex items-center"
            aria-label="Marketorr home"
        >
            <BrandLogo
                priority
                height={19}
                className={`transition-transform duration-300 ease-out group-hover:scale-[1.03] [&_img]:transition-[height] [&_img]:duration-300 [&_img]:ease-[cubic-bezier(0.22,1,0.36,1)] ${sizeClass}`}
            />
        </Link>
    );
}

const EASE = [0.22, 1, 0.36, 1];

/** Height of the docked header's mark: its tallest bar. */
const DOCKED_MARK_SIZE = '20px';

/** A section counts as current once its label passes this share of the viewport. */
const READOUT_LINE = 0.42;

/**
 * One bar of the docked mark, in the logo's shape. It fills over its own
 * third of the page: Idea, then Experience, then Result.
 */
function MarkBar({ index, progress }) {
    const scaleY = useTransform(progress, [index / 3, (index + 1) / 3], [0.14, 1]);

    return (
        <span className="relative block overflow-hidden bg-[var(--line)]" style={markBarStyle(DOCKED_MARK_SIZE, index)}>
            <motion.span
                className="absolute inset-0 origin-bottom"
                style={{ background: MARK.colors[index], scaleY }}
            />
        </span>
    );
}

/**
 * The docked header's logo: the brand mark on its own, doubling as the page's
 * scroll meter.
 */
function BrandMark() {
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

    return (
        <span className="flex items-end" style={{ height: DOCKED_MARK_SIZE, gap: markGap(DOCKED_MARK_SIZE) }} aria-hidden>
            {MARK.colors.map((color, index) => (
                <MarkBar key={color} index={index} progress={progress} />
            ))}
        </span>
    );
}

/**
 * The label of the section the reader is currently in, read from
 * the page's own section eyebrows. Null above the first one.
 *
 * @param {string} url
 * @return {string|null}
 */
function useCurrentSectionLabel(url) {
    const [label, setLabel] = useState(null);

    useEffect(() => {
        let ticking = false;

        const update = () => {
            ticking = false;
            const line = window.innerHeight * READOUT_LINE;
            let current = null;

            document.querySelectorAll('main [data-section-label]').forEach((element) => {
                // A label inside a layout hidden at this width has no box at
                // all, and would otherwise read as sitting at the very top.
                if (element.getClientRects().length === 0) return;

                if (element.getBoundingClientRect().top <= line) {
                    current = element.getAttribute('data-section-label');
                }
            });

            setLabel(current);
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [url]);

    return label;
}

/** The current section's label, rolling up to the next one as it changes. */
function SectionReadout({ label }) {
    const reduce = useReducedMotion();

    return (
        <span className="relative block h-4 min-w-0 overflow-hidden" aria-live="off">
            <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                    key={label}
                    className="block whitespace-nowrap font-display text-[11px] font-bold uppercase leading-4 tracking-[0.22em] text-[var(--ink)]"
                    initial={reduce ? false : { y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={reduce ? undefined : { y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                >
                    {label}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

/**
 * The docked header's first pod: the mark, then where the reader is.
 */
function DockedBrand({ label }) {
    return (
        <Link
            href="/"
            onClick={(event) => navigateWithCurtain(event, '/')}
            className="btn-press group flex min-w-0 items-center gap-3"
            aria-label="Marketorr home"
        >
            <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex"
            >
                <BrandMark />
            </motion.span>
            {label && (
                <>
                    <span className="h-4 w-px shrink-0 bg-[var(--line)]" aria-hidden />
                    <SectionReadout label={label} />
                </>
            )}
        </Link>
    );
}

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
    const href = item.href ?? `/services/${category.slug}/${item.slug}`;

    return (
        <motion.li variants={variants} className="border-b border-[var(--line-soft)] last:border-b-0">
            <Link
                href={href}
                prefetch
                target={item.newTab ? '_blank' : undefined}
                rel={item.newTab ? 'noreferrer' : undefined}
                data-cursor="explore"
                {...tapIntent}
                onClick={(event) => {
                    tapIntent.onClick(event);
                    if (!item.newTab) navigateWithCurtain(event, href, onNavigate);
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
 * One discipline section: an oversized heading, which is a plain label rather
 * than a link, and every sub-service ruled out beneath it.
 */
function MegaSection({ category, index, variants, onNavigate }) {
    const items = category.items ?? [];

    return (
        <div className="min-w-0">
            <motion.div variants={variants.item}>
                <div className="block">
                    <span className="flex items-center gap-3">
                        <span className="font-display text-[11px] font-bold tracking-[0.22em] text-[var(--ink-faint)]" aria-hidden>
                            0{index + 1}
                        </span>
                    </span>
                    <span className="mt-4 flex items-baseline gap-3">
                        <span className="min-w-0 font-display text-[clamp(1.5rem,2vw,2.15rem)] font-bold leading-[1.05] tracking-[-0.01em] text-[var(--ink)]">
                            {category.name}
                        </span>
                    </span>
                    {category.short && (
                        <span className="mt-2.5 block max-w-[30ch] text-[13px] leading-relaxed text-[var(--mute)]">
                            {category.short}
                        </span>
                    )}
                </div>
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
 * One Our Work column: the portfolio's name, and its projects as a slow
 * horizontal strip of covers rather than a list of titles.
 *
 * The strip is two identical halves travelling exactly one half-width, so the
 * wrap is invisible and the gallery reads as continuous. Reduced motion gets
 * the same covers, still. `compact` is the mobile menu's version: the same
 * block with type and covers scaled down for a phone.
 */
function WorkMegaSection({ category, index, variants, onNavigate, compact = false }) {
    const tapIntent = useTapIntent();
    const reduce = useReducedMotion();
    const href = category.href ?? '/work';
    const items = category.items ?? [];

    return (
        <div className="min-w-0">
            <motion.div variants={variants.item}>
                <Link
                    href={href}
                    prefetch
                    target={category.newTab ? '_blank' : undefined}
                    rel={category.newTab ? 'noreferrer' : undefined}
                    data-cursor="explore"
                    {...tapIntent}
                    onClick={(event) => {
                        tapIntent.onClick(event);
                        if (!category.newTab) navigateWithCurtain(event, href, onNavigate);
                    }}
                    // Inside the mobile menu the header's touch rule makes links
                    // inline-flex; the heading keeps its stacked desktop layout.
                    className={`group/head block focus-visible:outline-none ${compact ? '!block' : ''}`.trimEnd()}
                >
                    <span className="flex items-center gap-3">
                        <span className={`font-display ${compact ? 'text-[10px]' : 'text-[11px]'} font-bold tracking-[0.22em] text-[var(--ink-faint)]`} aria-hidden>
                            0{index + 1}
                        </span>
                    </span>
                    <span className={`${compact ? 'mt-3' : 'mt-4'} flex items-baseline gap-3`}>
                        <span className={`min-w-0 font-display ${compact ? 'text-[1.35rem]' : 'text-[clamp(1.5rem,2vw,2.15rem)]'} font-bold leading-[1.05] tracking-[-0.01em] text-[var(--ink)]`}>
                            <GradientTitle text={category.name} />
                        </span>
                        <span
                            aria-hidden
                            className="shrink-0 -translate-x-1 text-[14px] leading-none text-[var(--ink-faint)] opacity-0 transition-all duration-300 group-hover/head:translate-x-0 group-hover/head:opacity-100"
                        >
                            &#8599;
                        </span>
                    </span>
                    <span className={`mt-2.5 block ${compact ? 'text-[10.5px]' : 'text-[12px]'} font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]`}>
                        {items.length} {items.length === 1 ? 'project' : 'projects'}
                    </span>
                </Link>
            </motion.div>

            <motion.div
                variants={variants.row}
                className={`${compact ? 'mt-5' : 'mt-7'} overflow-hidden`}
            >
                <motion.div
                    className="flex w-max"
                    animate={reduce ? undefined : { x: ['0%', '-50%'] }}
                    transition={reduce ? undefined : { duration: 42, ease: 'linear', repeat: Infinity }}
                >
                    {[false, true].map((duplicate) => (
                        <ul
                            key={duplicate ? 'duplicate' : 'primary'}
                            className="flex shrink-0 list-none gap-3 pr-3"
                            aria-hidden={duplicate || undefined}
                        >
                            {items.map((item) => (
                                <li key={`${duplicate ? 'duplicate-' : ''}${item.slug}`}>
                                    <Link
                                        href={item.href}
                                        prefetch
                                        target={item.newTab ? '_blank' : undefined}
                                        rel={item.newTab ? 'noreferrer' : undefined}
                                        data-cursor="view"
                                        tabIndex={duplicate ? -1 : undefined}
                                        {...tapIntent}
                                        onClick={(event) => {
                                            tapIntent.onClick(event);
                                            if (!item.newTab) navigateWithCurtain(event, item.href, onNavigate);
                                        }}
                                        aria-label={item.name}
                                        className="group/tile block overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] focus-visible:outline-none"
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                draggable={false}
                                                className={`${compact ? 'h-16 w-24' : 'h-20 w-32'} object-cover transition-transform duration-500 ease-out group-hover/tile:scale-[1.06]`}
                                            />
                                        ) : (
                                            <span className={`${compact ? 'h-16 w-24' : 'h-20 w-32'} flex items-center justify-center bg-[var(--chip)] px-3 text-center text-[11px] font-bold text-[var(--ink)]`}>
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ))}
                </motion.div>
            </motion.div>
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
function ServicesMegaMenu({
    categories,
    onNavigate,
    onPointerOpen,
    onPointerClose,
    ariaLabel = 'Services menu',
    eyebrow = 'What we do',
    headline = (<>Design that <span className="text-gradient">compounds</span>.</>),
    blurb = 'Two disciplines, one standard. Pick a practice, or go straight to the specialism you need.',
    allHref = '/services',
    allLabel = 'View all services',
    showAllLink = true,
    Section = MegaSection,
}) {
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
                aria-label={ariaLabel}
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
                                    {eyebrow}
                                </span>
                                <p className="mt-6 max-w-[16ch] font-display text-[clamp(1.75rem,2.6vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--ink)]">
                                    {headline}
                                </p>
                                <p className="mt-5 max-w-[34ch] text-[13.5px] leading-relaxed text-[var(--mute)]">
                                    {blurb}
                                </p>
                            </div>
                            {showAllLink && (
                            <Link
                                href={allHref}
                                prefetch
                                data-cursor="explore"
                                onClick={(event) => navigateWithCurtain(event, allHref, onNavigate)}
                                className="group/all mt-10 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--line)] px-5 py-3 transition-colors duration-300 hover:border-[var(--field-line)] focus-visible:outline-none"
                            >
                                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                                    {allLabel}
                                </span>
                                <span aria-hidden className="text-[13px] leading-none text-[var(--ink-faint)] transition-transform duration-300 group-hover/all:translate-x-1">
                                    &rarr;
                                </span>
                            </Link>
                            )}
                        </motion.div>
                        {categories.map((category, index) => (
                            <div
                                key={category.slug}
                                className="col-span-4 min-w-0 border-l border-[var(--line-soft)] pl-10 xl:pl-14"
                            >
                                <Section
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
 * One group inside a mobile accordion (a Services discipline or an Our Work
 * portfolio) - the small-screen reading of the full-screen menu. The heading
 * links to the group's page and every entry is ruled out under it, so nothing
 * hides behind a second tap and the list still has room to breathe.
 */
function MobileServiceGroup({ category, index, onNavigate }) {
    const items = category.items ?? [];
    // Our Work groups carry their own hrefs and stay links; Services groups
    // (Branding, UI/UX) are plain headings.
    const groupHref = category.href;
    const itemHref = (item) => item.href ?? `/services/${category.slug}/${item.slug}`;
    const heading = (
        <>
            <span className="flex items-center gap-3">
                <span className="font-display text-[10px] font-bold tracking-[0.22em] text-[var(--ink-faint)]" aria-hidden>
                    0{index + 1}
                </span>
            </span>
            <span className="mt-3 flex items-baseline gap-2.5">
                <span className="min-w-0 truncate font-display text-[1.5rem] font-bold leading-[1.1] tracking-[-0.01em] text-[var(--ink)]">
                    {category.name}
                </span>
                {groupHref && <span aria-hidden className="shrink-0 text-[13px] leading-none text-[var(--ink-faint)]">&#8599;</span>}
            </span>
            {category.short && (
                <span className="mt-2 block text-[12.5px] leading-relaxed text-[var(--mute)]">
                    {category.short}
                </span>
            )}
        </>
    );

    return (
        <div className="pb-7 pl-11 pr-2 pt-5">
            {groupHref ? (
                <Link
                    href={groupHref}
                    target={category.newTab ? '_blank' : undefined}
                    rel={category.newTab ? 'noreferrer' : undefined}
                    onClick={category.newTab ? undefined : (event) => navigateWithCurtain(event, groupHref, onNavigate)}
                    className="block"
                >
                    {heading}
                </Link>
            ) : (
                <div className="block">{heading}</div>
            )}
            <ul className="mt-5 list-none border-t border-[var(--line-soft)]">
                {items.map((item) => (
                    <li key={item.slug} className="border-b border-[var(--line-soft)] last:border-b-0">
                        <Link
                            href={itemHref(item)}
                            target={item.newTab ? '_blank' : undefined}
                            rel={item.newTab ? 'noreferrer' : undefined}
                            onClick={item.newTab ? undefined : (event) => navigateWithCurtain(event, itemHref(item), onNavigate)}
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
    const [workMega, setWorkMega] = useState(false);
    const reduceMotion = useReducedMotion();
    const workMenuVariants = megaVariants(reduceMotion);
    /** Which mobile accordion is expanded ('/services', '/work' or null); one at a time. */
    const [mobileSection, setMobileSection] = useState(null);
    const closeTimer = useRef(null);
    const workCloseTimer = useRef(null);
    const { url, props } = usePage();
    const serviceCategories = props.serviceCategories ?? [];
    const workGroups = props.workGroups ?? [];
    const serviceMegaGroups = Object.prototype.hasOwnProperty.call(props.menus ?? {}, 'mega_services')
        ? menuTreeToMegaGroups(props.menus.mega_services, serviceCategories)
        : serviceCategories;
    const workMegaGroups = Object.prototype.hasOwnProperty.call(props.menus ?? {}, 'mega_work')
        ? menuTreeToMegaGroups(props.menus.mega_work, workGroups)
        : workGroups;
    // Editor-managed navigation; `/services` still opens the mega menu.
    // On desktop Contact is reached through the header CTA, so it is not a nav
    // link there; the mobile menu lists it after the rest.
    const hasManagedHeader = Object.prototype.hasOwnProperty.call(props.menus ?? {}, 'header');
    const managedHeaderItems = props.menus?.header ?? [];
    const menuLinks = managedHeaderItems
        .filter((item) => item.url !== '/contact')
        .map((item) => ({
            label: item.label,
            href: item.url,
            newTab: item.newTab,
            children: item.children ?? [],
        }));
    const LINKS = hasManagedHeader ? menuLinks : FALLBACK_LINKS;
    const managedContact = managedHeaderItems.find((item) => item.url === '/contact');
    const MOBILE_LINKS = [
        ...LINKS,
        ...(managedContact
            ? [{
                label: managedContact.label,
                href: managedContact.url,
                newTab: managedContact.newTab,
                children: managedContact.children ?? [],
            }]
            : hasManagedHeader ? [] : [{ label: 'Contact', href: '/contact' }]),
    ];
    const settings = props.settings;
    const isSticky = settings?.headerSticky !== false;
    const ctaLink = settings?.headerCtaLink || '/contact';
    const ctaText = settings?.headerCtaText || 'Start a Project';

    /** Hover intent: open instantly, close after a short grace period. */
    const openMega = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setWorkMega(false);
        setMega(true);
    };
    const scheduleMegaClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setMega(false), 140);
    };
    const handleMegaBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) scheduleMegaClose();
    };

    /** Same hover intent for Our Work; opening one menu closes the other. */
    const openWorkMega = () => {
        if (workCloseTimer.current) clearTimeout(workCloseTimer.current);
        setMega(false);
        setWorkMega(true);
    };
    const scheduleWorkMegaClose = () => {
        if (workCloseTimer.current) clearTimeout(workCloseTimer.current);
        workCloseTimer.current = setTimeout(() => setWorkMega(false), 140);
    };
    const handleWorkMegaBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) scheduleWorkMegaClose();
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
            if (event.key === 'Escape') {
                setMega(false);
                setWorkMega(false);
            }
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
        setWorkMega(false);
        setMobileSection(null);
    }, [url]);

    useEffect(() => {
        if (!open) {
            setMobileSection(null);
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

    /** Scrolled and not mid-menu: the bar docks, splitting into separate pods. */
    const floating = scrolled && !open;
    const sectionLabel = useCurrentSectionLabel(url);
    const readout = sectionLabel ?? LINKS.find((l) => l.href !== '/' && isActive(url, l.href))?.label ?? null;

    return (
        <header className={`${isSticky ? 'fixed' : 'relative'} inset-x-0 top-0 z-[9999]`}>
            {/* One full-width bar at the top of the page. Once scrolled, desktop
                docks it into three pods - mark and section readout, links, CTA -
                while phones keep the plain bar. */}
            <div className={`header-shell mobile-header-shell relative z-10 ${floating ? 'header-shell--docked' : ''}`}>
                <div
                    className={`flex h-16 items-center justify-between gap-3 transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        floating ? 'lg:h-[52px]' : 'lg:h-[72px]'
                    }`}
                >
                    <div className={`header-pod header-pod--brand flex min-w-0 items-center ${floating ? 'lg:h-full lg:pl-4 lg:pr-5' : ''}`}>
                        <span className={floating ? 'lg:hidden' : undefined}>
                            <Logo compact={floating} />
                        </span>
                        {floating && (
                            <span className="hidden min-w-0 lg:flex">
                                <DockedBrand label={readout} />
                            </span>
                        )}
                    </div>
                    <div className={`hidden items-center lg:flex ${floating ? 'h-full gap-2' : 'gap-5 xl:gap-8'}`}>
                        <nav
                            className={`header-pod header-pod--nav flex items-center transition-[gap] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                floating ? 'h-full gap-4 pl-5 pr-2 xl:gap-6 xl:pl-6' : 'gap-5 xl:gap-8'
                            }`}
                            aria-label="Primary"
                        >
                            {LINKS.map((l) => {
                                const active = isActive(url, l.href);
                                const linkClass = `link-underline btn-press group relative whitespace-nowrap py-2 text-[13px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${
                                    active ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'
                                }`;
                                if (l.href === '/services' || l.href === '/work') {
                                    const isWork = l.href === '/work';
                                    const enterMenu = isWork ? openWorkMega : openMega;
                                    const leaveMenu = isWork ? scheduleWorkMegaClose : scheduleMegaClose;
                                    const blurMenu = isWork ? handleWorkMegaBlur : handleMegaBlur;
                                    const menuOpen = isWork ? workMega : mega;

                                    return (
                                        <div
                                            key={l.href}
                                            onMouseEnter={enterMenu}
                                            onMouseLeave={leaveMenu}
                                            onFocus={enterMenu}
                                            onBlur={blurMenu}
                                            className="relative"
                                        >
                                            <button
                                                type="button"
                                                onClick={enterMenu}
                                                aria-haspopup="true"
                                                aria-expanded={menuOpen}
                                                className={`${linkClass} cursor-pointer`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <NavLabel label={l.label} />
                                                    <span
                                                        aria-hidden
                                                        className={`transition-transform duration-200 ease-out ${menuOpen ? 'rotate-180' : 'group-hover:translate-y-[1px]'}`}
                                                    >
                                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="block">
                                                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                </span>
                                            </button>
                                        </div>
                                    );
                                }
                                if (l.children?.length > 0) {
                                    return (
                                        <div key={l.href} className="group/menu relative py-2">
                                            <Link
                                                href={l.href}
                                                target={l.newTab ? '_blank' : undefined}
                                                rel={l.newTab ? 'noreferrer' : undefined}
                                                onClick={l.newTab ? undefined : (event) => navigateWithCurtain(event, l.href)}
                                                className={linkClass}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <NavLabel label={l.label} />
                                                    <span aria-hidden className="transition-transform duration-200 group-hover/menu:rotate-180">
                                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="block">
                                                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                </span>
                                            </Link>
                                            <ul className="invisible absolute left-1/2 top-full min-w-52 -translate-x-1/2 translate-y-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 opacity-0 shadow-xl transition-all group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:translate-y-0 group-focus-within/menu:opacity-100">
                                                {l.children.map((child) => (
                                                    <li key={child.id}>
                                                        <Link
                                                            href={child.url}
                                                            target={child.newTab ? '_blank' : undefined}
                                                            rel={child.newTab ? 'noreferrer' : undefined}
                                                            onClick={child.newTab ? undefined : (event) => navigateWithCurtain(event, child.url)}
                                                            className="block rounded-lg px-3 py-2.5 text-[12px] font-semibold text-[var(--mute)] transition-colors hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        target={l.newTab ? '_blank' : undefined}
                                        rel={l.newTab ? 'noreferrer' : undefined}
                                        onClick={l.newTab ? undefined : (event) => navigateWithCurtain(event, l.href)}
                                        className={linkClass}
                                    >
                                        <NavLabel label={l.label} />
                                    </Link>
                                );
                            })}
                            <ThemeToggle />
                        </nav>
                        <div className={`header-pod header-pod--cta flex items-center ${floating ? 'h-full px-1' : ''}`}>
                            <MagneticButton>
                                <Link
                                    href={ctaLink}
                                    onClick={(event) => navigateWithCurtain(event, ctaLink)}
                                    data-cursor="cta"
                                    className="btn-press inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-[12px] xl:px-6 font-bold uppercase tracking-[0.16em] text-white"
                                    style={{
                                        background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)',
                                    }}
                                >
                                    {ctaText} <span aria-hidden>↗</span>
                                </Link>
                            </MagneticButton>
                        </div>
                    </div>
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
                        categories={serviceMegaGroups}
                        onNavigate={() => setMega(false)}
                        onPointerOpen={openMega}
                        onPointerClose={scheduleMegaClose}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
                {workMega && (
                    <ServicesMegaMenu
                        key="work-mega-menu"
                        categories={workMegaGroups}
                        onNavigate={() => setWorkMega(false)}
                        onPointerOpen={openWorkMega}
                        onPointerClose={scheduleWorkMegaClose}
                        Section={WorkMegaSection}
                        ariaLabel="Our Work menu"
                        eyebrow="Selected work"
                        headline={<>Work that <span className="text-gradient">creates impact</span>.</>}
                        blurb="Two practices, one standard. Pick a discipline, or go straight to the project you want to see."
                        showAllLink={false}
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
                            {MOBILE_LINKS.map((l, i) => {
                                const active = isActive(url, l.href);

                                // Services and Our Work open in place on mobile, listing the
                                // same groups their desktop mega menus show.
                                const accordion = l.href === '/services'
                                    ? { groups: serviceMegaGroups, label: 'services' }
                                    : l.href === '/work'
                                        ? { groups: workMegaGroups, label: 'work' }
                                        : l.children?.length > 0
                                            ? {
                                                groups: [{
                                                    slug: `menu-${l.href}`,
                                                    name: l.label,
                                                    href: l.href,
                                                    newTab: l.newTab,
                                                    items: l.children.map((child) => ({
                                                        slug: `menu-${child.id}`,
                                                        name: child.label,
                                                        href: child.url,
                                                        newTab: child.newTab,
                                                    })),
                                                }],
                                                label: l.label,
                                            }
                                        : null;

                                if (accordion && accordion.groups.length > 0) {
                                    const expanded = mobileSection === l.href;

                                    return (
                                        <motion.li key={l.href} variants={MOBILE_MENU_ITEM} className="w-full">
                                            <div className="flex h-16 w-full items-center gap-4 border-b border-[var(--line-soft)]">
                                                <span className="w-7 shrink-0 font-display text-[10px] font-bold tracking-[0.16em] text-[var(--ink-faint)]" aria-hidden>
                                                    0{i + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setMobileSection(l.href)}
                                                    aria-expanded={expanded}
                                                    aria-current={active ? 'page' : undefined}
                                                    className="flex min-w-0 flex-1 cursor-pointer items-center text-left"
                                                >
                                                    <span className={`truncate font-display text-[clamp(1.35rem,7vw,1.75rem)] font-bold leading-none ${
                                                        active ? 'text-gradient' : 'text-[var(--ink)]'
                                                    }`}>
                                                        {l.label}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMobileSection((current) => (current === l.href ? null : l.href))}
                                                    aria-expanded={expanded}
                                                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${accordion.label}`}
                                                    className="btn-press shrink-0 p-1"
                                                >
                                                    <AccordionChevron expanded={expanded} />
                                                </button>
                                            </div>
                                            <AnimatePresence initial={false}>
                                                {expanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.28, ease: [...EASE] }}
                                                        className="overflow-hidden"
                                                    >
                                                        {l.href === '/work' ? (
                                                            // The desktop Our Work blocks, stacked: one row per
                                                            // portfolio, each with its rule and cover strip.
                                                            <motion.div
                                                                initial="hidden"
                                                                animate="show"
                                                                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                                                                className="space-y-8 pb-8 pt-6"
                                                            >
                                                                {accordion.groups.map((category, categoryIndex) => (
                                                                    <div key={category.slug} className="min-w-0 border-l border-[var(--line-soft)] pl-4">
                                                                        <WorkMegaSection
                                                                            compact
                                                                            category={category}
                                                                            index={categoryIndex}
                                                                            variants={workMenuVariants}
                                                                            onNavigate={() => setOpen(false)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        ) : accordion.groups.map((category, categoryIndex) => (
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
