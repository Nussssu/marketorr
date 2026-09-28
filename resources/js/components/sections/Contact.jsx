import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useForm, usePage } from '@inertiajs/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FastCollapse from '../ui/FastCollapse';
import { SectionLabel } from '../ui/primitives';
import OfficeMap from '../ui/OfficeMap';
import { useThemeMotion } from '../../lib/theme';
import InkField from '../decor/InkField';

const TYPES = ['Branding', 'Web UI/UX', 'Software UI/UX', 'Mobile App UI/UX', 'Other'];

/** Budget bands offered by the inquiry form. */
const BUDGETS = ['$10k - $25k', 'Under $10k', '$25k - $50k', '$50k+', 'Not sure yet'];

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/**
 * Omnira-style reveal choreography, retuned for Marketorr's tokens.
 *
 * The reference runs one scroll-based sequence everywhere: a short rise +
 * fade, lines unmasked top-to-bottom, children staggered so a block reads in
 * order, sections arriving once and then holding still. Everything below is
 * transform + opacity only (no blur, no scroll-linked parallax, no canvas),
 * so it stays on the compositor at 60fps on desktop and mobile.
 */
/**
 * Soft spring entrances: every block rises a short distance and settles with
 * one small, controlled overshoot — the premium bounce. Springs are tuned
 * stiff with high damping so there is exactly one gentle settle, never a
 * wobble, and each animation is over in well under a second. Transform and
 * opacity only, so everything stays on the compositor.
 */
const SPRING_RISE = { type: 'spring', stiffness: 280, damping: 30, mass: 1 };
const SPRING_LINE = { type: 'spring', stiffness: 330, damping: 33, mass: 1 };
const SPRING_BOX = { type: 'spring', stiffness: 250, damping: 26, mass: 0.95 };

/** Children of a group arrive in sequence, so a block reads top-to-bottom. */
const omniGroup = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

/** Heading lines unmask a touch faster than the block rise around them. */
const lineGroup = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

/** The page's reveal: a short spring rise that bounces once and settles. */
const omniRise = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: SPRING_RISE },
};

/** Masked heading lines: each line springs up out of its own mask. */
const omniLine = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: SPRING_LINE },
};

const faqBox = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: SPRING_BOX },
};

/** Below-fold groups trigger the moment they enter, play once, then rest. */
const revealViewport = { once: true, amount: 0.15, margin: '0px 0px -5% 0px' };

/**
 * The questions are drawn only from what the site already states: the two
 * practices and their sub-services, the reply window and NDA note carried by
 * this form, and the studio address in settings. Nothing here asserts a
 * timeline, a price or a capability that Marketorr has not published.
 */
const FAQS = [
    {
        q: 'What does Marketorr do?',
        a: 'Two practices. Branding — identities that demand attention. UI/UX — interfaces engineered to convert.',
    },
    {
        q: 'What sits under Branding?',
        a: 'Brand Strategy, Brand Identity Design, Rebranding, Packaging Design, Motion Branding and Brand Guidelines.',
    },
    {
        q: 'What sits under UI/UX?',
        a: 'Website UI/UX Design, Mobile App UI/UX, SaaS Product Design, UX Research & Strategy, Wireframing & Prototyping and Design Systems.',
    },
    {
        q: 'How soon will you reply?',
        a: 'We reply within 24–48 hours of receiving an inquiry.',
    },
    {
        q: 'What do you need to start?',
        a: 'Your name and email, the project type, a budget range, and a note on your goals, timeline and what success looks like.',
    },
    {
        q: 'Do you work with NDAs?',
        a: 'Yes — inquiries are NDA-friendly, and we never pass your details on.',
    },
    {
        q: 'Where is the studio?',
        a: 'Remote-first and working worldwide, from Natore Tower, Plot 32D & E, Road 2, Sector 3, Uttara, Dhaka 1230.',
    },
];

/** Small ruled chip that opens each block, as the section labels do elsewhere. */
function BlockChip({ children }) {
    return (
        <motion.span
            variants={omniRise}
            className="inline-flex h-7 w-fit shrink-0 select-none items-center gap-2 self-start rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]"
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
            {children}
        </motion.span>
    );
}

/**
 * One question. The answer opens with a pure-CSS grid-rows transition, so
 * toggling never measures layout in JS and the motion stays smooth even
 * mid-scroll: the panel glides open while its text fades and drifts up a
 * few pixels, and the plus rotates into a cross. Only one answer is open
 * at a time; clicking the open row closes it.
 */
const FaqRow = memo(function FaqRow({ item, index, open, onToggle, reduce }) {
    const id = `faq-panel-${index}`;

    return (
        <motion.div
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={revealViewport}
            variants={reduce ? undefined : faqBox}
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
        >
            <button
                type="button"
                onClick={() => onToggle(index)}
                aria-expanded={open}
                aria-controls={id}
                data-cursor="explore"
                className="group flex h-14 w-full items-center gap-5 px-5 text-left"
            >
                <span
                    className={`font-display text-[12px] font-bold tracking-[0.18em] transition-colors duration-100 ${open ? 'bg-clip-text text-transparent' : 'text-[var(--ink-faint)]'}`}
                    style={open ? { backgroundImage: BRAND_GRADIENT } : undefined}
                    aria-hidden
                >
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-[var(--ink)] md:text-[17px]">
                    {item.q}
                </span>
                <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-colors duration-100 group-hover:border-transparent"
                    style={open ? { background: BRAND_GRADIENT, borderColor: 'transparent' } : undefined}
                    aria-hidden
                >
                    <span
                        className={`text-[16px] font-light leading-none transition-transform duration-[120ms] ease-out motion-reduce:transition-none ${open ? 'rotate-45 text-white' : 'rotate-0 text-[var(--ink)]'}`}
                    >
                        +
                    </span>
                </span>
            </button>
            <FastCollapse open={open} id={id}>
                <p
                    className={`max-w-[58ch] pb-5 pl-[4.4rem] pr-8 text-[14px] leading-[22px] text-[var(--mute)] transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none ${open ? 'translate-y-0 opacity-100' : '-translate-y-0.5 opacity-0'}`}
                >
                    {item.a}
                </p>
            </FastCollapse>
        </motion.div>
    );
});

/**
 * Keep accordion state inside the FAQ subtree. Toggling an answer must not
 * re-render the contact form and map above it.
 */
function FaqList({ reduce }) {
    const [openFaq, setOpenFaq] = useState(-1);
    const toggleFaq = useCallback((index) => {
        setOpenFaq((current) => (current === index ? -1 : index));
    }, []);

    // The list fills its column, so the first row starts level with the FAQ
    // chip and the last row ends level with the assist box opposite. The 12px
    // gap is the floor; any surplus is shared between rows, so the two sides
    // stay locked as answers open and close.
    return (
        <div className="flex flex-col gap-3 lg:h-full lg:justify-between">
            {FAQS.map((item, index) => (
                <FaqRow
                    key={item.q}
                    item={item}
                    index={index}
                    open={openFaq === index}
                    onToggle={toggleFaq}
                    reduce={reduce}
                />
            ))}
        </div>
    );
}

/** Live studio time. Seconds tick, so the strip reads as a signal, not a label. */
function StudioClock() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);

        return () => window.clearInterval(id);
    }, []);

    const time = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Dhaka',
    }).format(now);

    return (
        <span className="inline-flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
            Local time
            <span className="tabular-nums text-[var(--ink)]">{time}</span>
        </span>
    );
}

/**
 * Submission acknowledgement rendered outside the form so it never changes
 * the card's height or shifts nearby content.
 */
function InquirySuccessToast({ open, onClose, reduce }) {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[10030] flex justify-center px-4 sm:bottom-7" aria-live="polite">
                    <motion.div
                        role="status"
                        initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
                        transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.72)]"
                    >
                        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: BRAND_GRADIENT }} aria-hidden />
                        <div className="flex items-start gap-4">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ background: BRAND_GRADIENT }} aria-hidden>
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m5 12 4 4L19 6" />
                                </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-display text-[15px] font-bold uppercase tracking-[0.04em] text-[var(--ink-strong)]">
                                    Inquiry received
                                </p>
                                <p className="mt-1 text-[13px] leading-5 text-[var(--mute)]">
                                    Thanks. We&rsquo;ll review the details and reply within 24&ndash;48 hours.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[18px] leading-none text-[var(--ink-faint)] transition-colors duration-150 hover:text-[var(--ink)]"
                                aria-label="Dismiss confirmation"
                            >
                                &times;
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default function Contact({ heroHeading = false }) {
    const reduce = useReducedMotion();
    const fx = useThemeMotion();
    const [showSuccess, setShowSuccess] = useState(false);
    const scrollReveal = reduce
        ? {}
        : { initial: 'hidden', whileInView: 'show', viewport: revealViewport };
    const { settings } = usePage().props;
    const { contactEmail, contactPhone, locationText, socials, address, directionsUrl } = settings;
    // Only the socials that have been filled in, in display order.
    const socialLinks = [
        { label: 'LinkedIn', href: socials.linkedin },
        { label: 'Behance', href: socials.behance },
        { label: 'Dribbble', href: socials.dribbble },
        { label: 'Instagram', href: socials.instagram },
        { label: 'Facebook', href: socials.facebook },
    ].filter((s) => s.href);
    const { data, setData, post, processing, wasSuccessful, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'Branding',
        budget: '',
        message: '',
        // Honeypot — hidden from real visitors, rejected server-side when filled.
        nickname: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                setShowSuccess(true);
            },
        });
    };

    return (
        <>
        <section id="contact" className="noise relative overflow-hidden bg-[var(--bg)] pt-[clamp(5rem,9vw,9rem)] pb-16 lg:pb-20">
            <InkField theme={fx.theme} />
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <motion.span
                    whileInView={reduce ? undefined : { x: [0, 40, 0], opacity: [0.5, 0.75, 0.5] }}
                    viewport={{ once: false, margin: '10% 0px' }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-32 top-[8%] h-[26rem] w-[26rem] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(137,31,251,0.12), transparent 65%)' }}
                />
                <motion.span
                    whileInView={reduce ? undefined : { x: [0, -44, 0], opacity: [0.45, 0.7, 0.45] }}
                    viewport={{ once: false, margin: '10% 0px' }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute -right-32 bottom-[4%] h-[28rem] w-[28rem] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(27,226,235,0.10), transparent 65%)' }}
                />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-6 opacity-30" aria-hidden>
                {[['#891FFB', 140], ['#507AF4', 210], ['#1BE2EB', 300]].map(([color, height], index) => (
                    <motion.span
                        key={index}
                        animate={reduce ? undefined : { y: [20 * fx.float, -10 * fx.float, 20 * fx.float] }}
                        transition={{ duration: 7 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-24 rounded-t-xl border md:w-36"
                        style={{ height, background: `linear-gradient(180deg, ${color}44, transparent)`, borderColor: `${color}33` }}
                    />
                ))}
            </div>

            {/* The page keeps one consistent section rhythm and collapses to one
                column below lg. */}
            <div className="container-x relative">
                {/* ---------- 1. Contact ---------- */}
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_600px] lg:grid-rows-[auto_1fr_auto] lg:items-stretch lg:gap-x-10 lg:gap-y-0">
                    <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="lg:col-start-1 lg:row-start-1">
                        <SectionLabel index="04" name="CONTACT" />
                    </motion.div>

                    <div className="flex flex-col lg:col-start-1 lg:row-start-2">

                        <motion.h2
                            {...scrollReveal}
                            variants={reduce ? undefined : lineGroup}
                            className="display-lg mt-7 uppercase text-[var(--ink-strong)]"
                        >
                            <span className="mask-line">
                                <motion.span variants={reduce ? undefined : omniLine} className="mask-inner">
                                    Have a project?
                                </motion.span>
                            </span>
                            <span className="mask-line">
                                <motion.span variants={reduce ? undefined : omniLine} className="mask-inner text-gradient">
                                    Let&rsquo;s make
                                </motion.span>
                            </span>
                            <span className="mask-line">
                                <motion.span variants={reduce ? undefined : omniLine} className="mask-inner text-gradient">
                                    it matter.
                                </motion.span>
                            </span>
                        </motion.h2>

                        <motion.p {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-7 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]">
                            Tell us about the work and we will come back with a clear direction, scope and next steps.
                            Two practices: Branding, and UI/UX.
                        </motion.p>

                        {/* Email / Location / Socials, each behind a tinted glyph tile. */}
                        <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-9 grid gap-6 sm:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, #891FFB 14%, transparent)' }} aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="#891FFB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                                        <path d="m3 6.5 9 6 9-6" />
                                    </svg>
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Email</span>
                                    <a href={`mailto:${contactEmail}`} className="link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]">{contactEmail}</a>
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, #507AF4 14%, transparent)' }} aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="#507AF4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
                                        <circle cx="12" cy="10" r="2.6" />
                                    </svg>
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Location</span>
                                    <span className="mt-1 block text-[14px] font-semibold text-[var(--ink)]">{locationText}</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, #1BE2EB 16%, transparent)' }} aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="#1BE2EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="9" r="3" />
                                        <path d="M2.8 19a6.4 6.4 0 0 1 12.4 0" />
                                        <path d="M16.5 7.2a3 3 0 0 1 0 5.6M18.4 19a6.3 6.3 0 0 0-2.1-4" />
                                    </svg>
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Socials</span>
                                    <span className="mt-1 flex gap-3 text-[14px] font-semibold text-[var(--ink)]">
                                        {socialLinks.slice(0, 2).map((social) => (
                                            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="link-underline btn-press">{social.label}</a>
                                        ))}
                                    </span>
                                </span>
                            </div>
                        </motion.div>

                        {/* The studio map, exactly as it was. */}
                    <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-9 w-full">
                            <OfficeMap address={address} directionsHref={directionsUrl} />
                        </motion.div>
                    </div>

                    <div className="lg:col-start-1 lg:row-start-3">
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="link-underline btn-press mt-4 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                        >
                            Open in Google Maps &rarr;
                        </a>
                        {contactPhone && (
                            <motion.p {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-4 text-[14px] font-semibold text-[var(--ink)]">
                                <a href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`} className="link-underline btn-press">
                                    {contactPhone}
                                </a>
                            </motion.p>
                        )}
                    </div>

                    {/* ---- message card ---- */}
                    <motion.form
                        {...scrollReveal}
                        id="project-inquiry"
                        onSubmit={submit}
                        variants={reduce ? undefined : omniRise}
                        className="scroll-mt-28 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-7 md:p-9 lg:col-start-2 lg:row-start-2 lg:mt-7 lg:flex lg:h-[calc(100%-1.75rem)] lg:flex-col"
                        aria-label="Project inquiry form"
                    >
                        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
                            <label>
                                Nickname
                                <input type="text" name="nickname" value={data.nickname} onChange={(e) => setData('nickname', e.target.value)} tabIndex={-1} autoComplete="off" />
                            </label>
                        </div>

                        {showSuccess ? (
                            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
                                <span className="grid h-16 w-16 place-items-center rounded-full text-white" style={{ background: BRAND_GRADIENT }} aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m5 12 4 4L19 6" />
                                    </svg>
                                </span>
                                <h3 className="mt-6 font-display text-[clamp(1.3rem,1.8vw,26px)] font-extrabold tracking-[-0.01em] text-[var(--ink-strong)]">
                                    Thank you &mdash; your inquiry is in
                                </h3>
                                <p className="mt-3 max-w-[38ch] text-[14px] leading-[22px] text-[var(--mute)]">
                                    We&rsquo;ve received your details and will reply within 24&ndash;48 hours.
                                    A copy of the conversation will come from {contactEmail}.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setShowSuccess(false); reset(); }}
                                    data-cursor="cta"
                                    className="btn-press mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--field-line)] px-7 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                        <>
                            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                                Send us a message
                            </span>
                            <h3 className="mt-4 font-display text-[clamp(1.4rem,2vw,28px)] font-extrabold tracking-[-0.01em] text-[var(--ink-strong)]">
                                Let&rsquo;s build something great
                            </h3>
                            <p className="mt-2 text-[14px] leading-[22px] text-[var(--mute)]">
                                Share a few details and we will get in touch shortly.
                            </p>

                            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:flex-1 lg:grid-rows-[auto_auto_auto_1fr]">
                                {[
                                    { key: 'name', label: 'Your name*', type: 'text', ph: 'Jane Cooper' },
                                    { key: 'email', label: 'Email*', type: 'email', ph: 'jane@company.com' },
                                    { key: 'phone', label: 'Phone', type: 'tel', ph: '+880 1700 000000' },
                                    { key: 'company', label: 'Company', type: 'text', ph: 'Company Inc.' },
                                ].map((f) => (
                                    <label key={f.key} className="block">
                                        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{f.label}</span>
                                        <input
                                            type={f.type}
                                            value={data[f.key]}
                                            onChange={(e) => setData(f.key, e.target.value)}
                                            placeholder={f.ph}
                                            className="field-box h-12 w-full rounded-xl px-4 text-[14px]"
                                        />
                                        {errors[f.key] && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors[f.key]}</span>}
                                    </label>
                                ))}

                                <label className="block">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Budget range</span>
                                    <select value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="field-box h-12 w-full rounded-xl px-4 text-[14px]">
                                        {BUDGETS.map((b) => (<option key={b} value={b} className="bg-[var(--surface)]">{b}</option>))}
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Project type</span>
                                    <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="field-box h-12 w-full rounded-xl px-4 text-[14px]">
                                        {TYPES.map((t) => (<option key={t} value={t} className="bg-[var(--surface)]">{t}</option>))}
                                    </select>
                                </label>

                                <label className="flex flex-col sm:col-span-2 lg:min-h-0 lg:h-full">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Message*</span>
                                    <textarea
                                        rows={4}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Tell us about your goals, timeline, and what success looks like..."
                                        className="field-box w-full resize-none rounded-xl p-4 text-[14px] lg:min-h-[120px] lg:flex-1"
                                    />
                                    {errors.message && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors.message}</span>}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || wasSuccessful}
                                data-cursor="cta"
                                className="btn-press btn-3d mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full text-[13px] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                                style={{ background: BRAND_GRADIENT }}
                            >
                                {processing ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />Sending...</>)
                                    : wasSuccessful ? 'Inquiry received' : (<>Send inquiry <span aria-hidden>&rarr;</span></>)}
                            </button>
                            <p className="mt-3 text-center text-[12px] text-[var(--ink-faint)]">
                                {wasSuccessful ? 'Thanks - we reply within 24-48h.' : 'No spam. NDA-friendly.'}
                            </p>
                        </>
                        )}
                    </motion.form>
                </div>

                {/* The landing page shows the contact block and stops there;
                    the questions and the closing panel belong to the contact
                    page itself. */}
                {heroHeading && (
                    <>
                    {/* ---------- 2. Questions ---------- */}
                    <div className="mt-28 grid gap-12 lg:mt-32 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-stretch lg:gap-x-12 lg:gap-y-0">
                        <motion.div
                            {...scrollReveal}
                            variants={reduce ? undefined : omniGroup}
                            className="flex flex-col"
                        >
                            <BlockChip>FAQs</BlockChip>
                            <motion.h2
                                variants={reduce ? undefined : lineGroup}
                                className="display-lg mt-4 uppercase text-[var(--ink-strong)]"
                            >
                                <span className="mask-line">
                                    <motion.span variants={reduce ? undefined : omniLine} className="mask-inner">
                                        Clear answers
                                    </motion.span>
                                </span>
                                <span className="mask-line">
                                    <motion.span variants={reduce ? undefined : omniLine} className="mask-inner text-gradient">
                                        before we start
                                    </motion.span>
                                </span>
                            </motion.h2>
                            <motion.span variants={reduce ? undefined : omniRise} className="mt-4 block h-[3px] w-10 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                            <motion.p variants={reduce ? undefined : omniRise} className="mt-5 max-w-[44ch] text-[14px] leading-[22px] text-[var(--mute)]">
                                What we do, what we need from you, and how quickly you will hear back.
                            </motion.p>

                            {/* Flexible rail spacer: absorbs FAQ growth so the
                                assist box below glides with the FAQ column
                                while the 40px rhythm above it never shrinks. */}
                            <div className="hidden flex-1 lg:block" aria-hidden />
                            <motion.div variants={reduce ? undefined : omniRise} className="mt-10 flex items-start gap-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
                                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-[var(--line)] text-[var(--ink)]" aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-4.2A8.4 8.4 0 1 1 21 11.5Z" />
                                    </svg>
                                </span>
                                <span className="min-w-0">
                                    <span className="block font-display text-[15px] font-bold uppercase tracking-[0.03em] text-[var(--ink)]">Still have questions?</span>
                                    <span className="mt-1 block text-[13px] text-[var(--mute)]">Send the details and we will come back to you.</span>
                                    <a href="#project-inquiry" data-cursor="cta" className="link-underline btn-press mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-gradient">
                                        Contact us <span aria-hidden>&rarr;</span>
                                    </a>
                                </span>
                            </motion.div>
                        </motion.div>

                        <FaqList reduce={reduce} />
                    </div>

                    {/* ---------- 3. Let's connect ---------- */}
                    <div className="mt-28 lg:mt-32">
                        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-start lg:gap-x-12 lg:gap-y-0">
                            <motion.div
                                {...scrollReveal}
                                variants={reduce ? undefined : omniGroup}
                                className="flex flex-col"
                            >
                                <BlockChip>Let&rsquo;s connect</BlockChip>
                                <motion.h2
                                    variants={reduce ? undefined : lineGroup}
                                    className="display-lg mt-4 uppercase text-[var(--ink-strong)]"
                                >
                                    <span className="mask-line">
                                        <motion.span variants={reduce ? undefined : omniLine} className="mask-inner">
                                            Let&rsquo;s build
                                        </motion.span>
                                    </span>
                                    <span className="mask-line">
                                        <motion.span variants={reduce ? undefined : omniLine} className="mask-inner text-gradient">
                                            something
                                        </motion.span>
                                    </span>
                                </motion.h2>
                                <motion.span variants={reduce ? undefined : omniRise} className="mt-6 block h-[3px] w-10 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                                <motion.p variants={reduce ? undefined : omniRise} className="mt-6 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]">
                                    We&rsquo;re currently available for select projects and collaborations. Let&rsquo;s create digital experiences that leave a lasting impact.
                                </motion.p>
                            </motion.div>

                            <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 lg:mt-[44px]">
                                <ul className="list-none border-b border-[var(--line)]">
                                    {[
                                        { label: contactEmail, href: `mailto:${contactEmail}`, type: 'email', ext: false },
                                        ...(socials.linkedin ? [{ label: 'LinkedIn', href: socials.linkedin, type: 'linkedin', ext: true }] : []),
                                    ].map((row) => (
                                        <li key={row.label} className="border-b border-[var(--line)] last:border-b-0">
                                            <a
                                                href={row.href}
                                                {...(row.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                                                data-cursor="explore"
                                                className="group flex items-center gap-4 py-4 text-[var(--ink)]"
                                            >
                                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--ink)]" aria-hidden>
                                                    {row.type === 'linkedin' ? (
                                                        <span className="font-display text-[11px] font-extrabold lowercase">in</span>
                                                    ) : (
                                                        <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                                                                <path d="m3 6.5 9 6 9-6" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate text-[15px]">{row.label}</span>
                                                <span className="text-[13px] text-[var(--ink-faint)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[var(--ink)]" aria-hidden>&#8599;</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="#project-inquiry"
                                    data-cursor="cta"
                                    className="btn-press btn-3d mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full text-[13px] font-bold uppercase tracking-[0.18em] text-white"
                                    style={{ background: BRAND_GRADIENT }}
                                >
                                    Start a project <span aria-hidden>&rarr;</span>
                                </a>
                            </motion.div>
                        </div>

                        {/* Location and studio time only: Marketorr publishes no
                            availability status, so none is claimed here. */}
                        <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-12 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-14">
                            <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                                Marketorr &middot; <span className="text-gradient">{locationText}</span>
                            </span>
                            <StudioClock />
                        </motion.div>
                    </div>
                    </>
                )}
            </div>
        </section>
        </>
    );
}
