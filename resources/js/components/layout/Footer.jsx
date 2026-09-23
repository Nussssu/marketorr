import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import BrandLogo from './BrandLogo';

const EASE = [0.22, 1, 0.36, 1];
const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/**
 * Used only when the Footer — Sitemap menu has been emptied in the admin
 * panel, so the footer is never left without links.
 */
const FALLBACK_SITEMAP = [
    { label: 'About', url: '/about' },
    { label: 'Services', url: '/services' },
    { label: 'Our Work', url: '/work' },
    { label: 'Contact', url: '/contact' },
];

function ColumnHeading({ children }) {
    return (
        <p className="flex items-center gap-3 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            {children}
            <span className="h-px flex-1 bg-[var(--line)] sm:max-w-[56px]" aria-hidden />
        </p>
    );
}

export default function Footer() {
    const reduce = useReducedMotion();
    const { settings, menus } = usePage().props;
    // Only the socials that have been filled in, in display order.
    const socials = [
        { label: 'LinkedIn', href: settings.socials.linkedin },
        { label: 'Facebook', href: settings.socials.facebook },
        { label: 'Behance', href: settings.socials.behance },
        { label: 'Dribbble', href: settings.socials.dribbble },
        { label: 'Instagram', href: settings.socials.instagram },
        { label: 'X', href: settings.socials.x },
        { label: 'YouTube', href: settings.socials.youtube },
    ].filter((s) => s.href);

    const sitemap = menus?.footer_sitemap?.length ? menus.footer_sitemap : FALLBACK_SITEMAP;
    const serviceLinks = menus?.footer_services ?? [];
    const legalLinks = menus?.footer_legal ?? [];

    const container = {
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
    };
    const item = {
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
    };

    return (
        <footer className="relative bg-[var(--bg)]">
            {/* Brand divider — draws in on enter, then a single sheen passes across it */}
            <div className="relative h-[3px] w-full overflow-hidden" aria-hidden>
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: false, margin: '-5% 0px' }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="h-full w-full origin-left"
                    style={{ background: BRAND_GRADIENT }}
                />
                {!reduce && (
                    <motion.div
                        initial={{ x: '-130%' }}
                        whileInView={{ x: '130%' }}
                        viewport={{ once: false, margin: '-5% 0px' }}
                        transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
                        className="absolute inset-y-0 w-1/3"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)' }}
                    />
                )}
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, margin: '-8% 0px' }}
                className="container-x grid grid-cols-1 gap-x-10 gap-y-12 pt-14 pb-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-14 lg:pt-20 lg:pb-16"
            >
                {/* Brand + intro */}
                <motion.div variants={item} className="sm:col-span-2 lg:col-span-4 lg:max-w-md">
                    <div className="flex items-center">
                        <BrandLogo height={28} />
                    </div>
                    {settings.footerIntro && (
                        <p className="mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--mute)]">
                            {settings.footerIntro}
                        </p>
                    )}
                    <div className="mt-7">
                        <ColumnHeading>Follow</ColumnHeading>
                        <div data-cursor="explore" className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] font-bold uppercase tracking-[0.16em]">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    data-cursor="explore"
                                    data-social-platform={s.label}
                                    className="footer-link"
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                        <Link href="/work" data-cursor="cta" className="footer-explore btn-press mt-7 font-display">
                            Explore
                            <span aria-hidden className="footer-explore__arrow text-[12px] leading-none">↗</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Sitemap */}
                <motion.nav variants={item} aria-label="Footer" className="lg:col-span-3 lg:col-start-6">
                    <ColumnHeading>Sitemap</ColumnHeading>
                    <ul className="mt-5 flex flex-col gap-3 text-[15px] font-semibold">
                        {sitemap.map((item) => (
                            <li key={`${item.label}-${item.url}`}>
                                <Link href={item.url} className="footer-link block">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </motion.nav>

                {/* Services */}
                <motion.div variants={item} className="lg:col-span-3 lg:col-start-10">
                    <ColumnHeading>Services</ColumnHeading>
                    <ul className="mt-5 flex flex-col gap-3 text-[15px] font-semibold">
                        {serviceLinks.map((item) => (
                            <li key={`${item.label}-${item.url}`}>
                                <Link href={item.url} className="footer-link block">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </motion.div>

            <div className="border-t border-[var(--line)]">
                <motion.div
                    variants={item}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, margin: '-4% 0px' }}
                    className="container-x flex flex-col items-start gap-4 py-6 text-[12px] text-[var(--ink-faint)] md:flex-row md:items-center md:justify-between md:gap-8"
                >
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span>{settings.copyright}</span>
                        {legalLinks.map((item) => (
                            <Link key={`${item.label}-${item.url}`} href={item.url} className="footer-link footer-link--inline">
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <p className="footer-motto font-display text-[12px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em]">
                        <span style={{ color: '#891FFB' }}>IDEA</span>
                        <span aria-hidden className="px-1.5 sm:px-2.5">→</span>
                        <span style={{ color: '#507AF4' }}>EXPERIENCE</span>
                        <span aria-hidden className="px-1.5 sm:px-2.5">→</span>
                        <span style={{ color: '#1BE2EB' }}>RESULT</span>
                    </p>
                </motion.div>
            </div>
        </footer>
    );
}
