import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import MagneticButton from '../motion/MagneticButton';
import { GradientTitle, SectionLabel } from '../ui/primitives';
import RevealText from '../motion/RevealText';
import { EASE } from '../../lib/motion';
import { useThemeMotion } from '../../lib/theme';
import ScrollHeading from '../motion/ScrollHeading';
import InkField from '../decor/InkField';
import OfficeMap from '../ui/OfficeMap';

const TYPES = ['Branding', 'Web UI/UX', 'Software UI/UX', 'Mobile App UI/UX', 'Other'];

/** Budget bands offered by the inquiry form. */
const BUDGETS = ['$10k - $25k', 'Under $10k', '$25k - $50k', '$50k+', 'Not sure yet'];

/**
 * The page's reveal: a long rise that decelerates hard and settles without
 * overshoot, so a block arrives rather than pops.
 *
 * Travel and curve are matched to the motion brief: 56px, ~85% of the distance
 * covered in the first 300ms, fully at rest by ~650ms.
 */
const RISE_DISTANCE = 32;
const RISE_EASE = [0.16, 1, 0.3, 1];

const rise = {
    hidden: { opacity: 0, y: RISE_DISTANCE },
    show: { opacity: 1, y: 0, transition: { duration: 0.68, ease: RISE_EASE } },
};

/** Children of a group arrive in sequence, so a block reads top-to-bottom. */
const riseGroup = {
    hidden: {},
    show: { transition: { staggerChildren: 0.065, delayChildren: 0.02 } },
};

/** One in-view trigger for every reveal on the page. */
const revealOnce = { once: true, margin: '-12% 0px' };

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';
const MARKETORR_PHONE = '+880 1332-850355';

/**
 * Cinematic card reveal: the box rises as one while its rows follow in a
 * staggered trail — the same enter-once-in-view rhythm as the reference.
 * Disabled entirely under reduced motion.
 */
const boxReveal = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

const rowReveal = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [...EASE] } },
};

/** Seconds between automatic glass passes while the card is on screen. */
const SWEEP_LOOP_MS = 9500;

/**
 * Automatic glass sweep: one purple-to-cyan pass crosses the card as it
 * enters the viewport, then replays on a slow timer while it stays visible.
 * Never follows the mouse; parked entirely under reduced motion.
 */
function useAutoSweep(active) {
    const [sweeping, setSweeping] = useState(false);
    const sweepingRef = useRef(false);
    const setSweep = (value) => {
        sweepingRef.current = value;
        setSweeping(value);
    };

    useEffect(() => {
        if (!active) {
            setSweep(false);

            return undefined;
        }
        setSweep(true);
        const id = window.setInterval(() => {
            if (!sweepingRef.current && !document.hidden) setSweep(true);
        }, SWEEP_LOOP_MS);

        return () => window.clearInterval(id);
    }, [active]);

    return { sweeping, finishSweep: () => setSweep(false) };
}

function GradientPhoneIcon({ gradientId, className }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <defs>
                <linearGradient id={gradientId} x1="3" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#891FFB" />
                    <stop offset="0.62" stopColor="#891FFB" />
                    <stop offset="0.84" stopColor="#507AF4" />
                    <stop offset="1" stopColor="#1BE2EB" />
                </linearGradient>
            </defs>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.69A2 2 0 0 1 22 16.92Z" />
        </svg>
    );
}

/**
 * The single contact-introduction box follows the reference's focused visual
 * hierarchy: one centred glass card, a prominent phone mark, conversational
 * copy, a full-width call tile, and a full-width message action.
 *
 * The CMS phone takes precedence; the published Bangladesh office number is
 * the fallback so the primary conversation path is never missing. Entrance
 * is a staggered card reveal that starts as the box enters the viewport, and
 * the whole card drifts on scroll at a barely-there parallax (wrapped outside
 * the reveal, so the two motions never fight). A purple-to-cyan light pass
 * crosses the glass on entry and replays on a slow timer — never tracking the
 * pointer. Theme tokens carry the treatment across both themes.
 */
function SpeakWithUs({ contactEmail, contactPhone }) {
    const reduce = useReducedMotion();
    const cardRef = useRef(null);
    const inCardView = useInView(cardRef, { amount: 0.35, once: false });
    const { sweeping, finishSweep } = useAutoSweep(inCardView && !reduce);
    const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'end start'] });
    const cardY = useTransform(scrollYProgress, [0, 1], [24, -24]);
    const cardScale = useTransform(scrollYProgress, [0, 1], [0.986, 1]);
    const displayPhone = contactPhone || MARKETORR_PHONE;
    const telHref = `tel:${displayPhone.replace(/[^+\d]/g, '')}`;

    return (
        <div
            className="relative left-1/2 isolate mt-12 w-screen -translate-x-1/2 overflow-hidden bg-[var(--bg)] px-4 py-14 sm:px-6 sm:py-20 lg:py-24"
        >
            <motion.div
                style={reduce ? undefined : { y: cardY, scale: cardScale }}
                className="mx-auto w-full max-w-[34rem]"
            >
            <motion.aside
                ref={cardRef}
                initial={reduce ? false : 'hidden'}
                whileInView="show"
                viewport={{ once: true, margin: '-10% 0px' }}
                variants={reduce ? undefined : boxReveal}
                aria-label="Speak with us"
                className="group relative w-full overflow-hidden rounded-[1.4rem] border border-[var(--line)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_48px_-44px_rgba(137,31,251,0.25),0_20px_54px_-40px_rgba(0,0,0,0.5)] backdrop-blur-[36px] backdrop-saturate-[155%] transition-[border-color,box-shadow,background-color] duration-500 hover:border-[#507AF4]/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_50px_-42px_rgba(137,31,251,0.34),0_22px_58px_-40px_rgba(137,31,251,0.38)] sm:p-10"
                style={{
                    background:
                        'linear-gradient(135deg, color-mix(in srgb, var(--surface) 66%, transparent), color-mix(in srgb, var(--surface-2) 46%, transparent))',
                }}
            >
                <div
                    className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
                    style={{
                        background:
                            'radial-gradient(68% 82% at 0% 0%, var(--glow-purple), transparent 72%), radial-gradient(64% 80% at 100% 100%, var(--glow-cyan), transparent 74%), linear-gradient(135deg, color-mix(in srgb, #891FFB 3.5%, transparent), color-mix(in srgb, #1BE2EB 2.5%, transparent))',
                    }}
                    aria-hidden
                />
                <motion.div
                    initial={false}
                    animate={sweeping
                        ? { x: ['-145%', '145%'], opacity: [0, 0.78, 0.5, 0] }
                        : { x: '-145%', opacity: 0 }}
                    transition={{ duration: sweeping ? 1.35 : 0.01, ease: [...EASE], times: sweeping ? [0, 0.26, 0.72, 1] : undefined }}
                    onAnimationComplete={finishSweep}
                    className="pointer-events-none absolute inset-y-[-18%] left-[-12%] w-[54%] skew-x-[-14deg] blur-2xl"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent 0%, rgba(137,31,251,0.05) 8%, rgba(137,31,251,0.3) 34%, rgba(137,31,251,0.22) 54%, rgba(80,122,244,0.18) 76%, rgba(27,226,235,0.14) 90%, transparent 100%)',
                    }}
                    aria-hidden
                />

                <div className="relative">
                    <motion.div
                        variants={reduce ? undefined : rowReveal}
                        className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] border border-[#891FFB]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_38px_-20px_rgba(137,31,251,0.85)]"
                        style={{ background: 'linear-gradient(135deg, rgba(137,31,251,0.24), rgba(137,31,251,0.13) 62%, rgba(27,226,235,0.11))' }}
                        aria-hidden
                    >
                        <GradientPhoneIcon gradientId="contact-phone-mark" className="h-9 w-9" />
                    </motion.div>

                    <motion.h3 variants={reduce ? undefined : rowReveal} className="font-display mt-8 text-[clamp(1.8rem,6vw,2.15rem)] font-bold leading-tight tracking-[-0.035em] text-[var(--ink-strong)]">
                        <GradientTitle text="Speak With Us" highlightWords={2} />
                    </motion.h3>
                    <motion.p variants={reduce ? undefined : rowReveal} className="mt-4 text-[15px] font-medium leading-7 text-[var(--mute)] sm:text-[17px]">
                        Prefer a conversation? Call our Bangladesh studio directly or send us a message.
                    </motion.p>

                    <motion.a
                        variants={reduce ? undefined : rowReveal}
                        href={telHref}
                        data-cursor="cta"
                        className="btn-press group/call mt-8 flex w-full items-center gap-4 rounded-2xl border border-[var(--field-line)] bg-[var(--chip)] px-5 py-5 transition-[border-color,background-color,box-shadow,transform] duration-300 hover:border-[#507AF4]/45 hover:bg-[color-mix(in_srgb,var(--chip)_72%,rgba(137,31,251,0.09))] hover:shadow-[0_14px_40px_-28px_rgba(137,31,251,0.85)] sm:gap-5"
                        aria-label={`Call Marketorr at ${displayPhone}`}
                    >
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(137,31,251,0.25),0_10px_24px_-18px_rgba(137,31,251,0.9)] transition-transform duration-300 group-hover/call:scale-105" style={{ background: 'linear-gradient(135deg, rgba(137,31,251,0.2), rgba(137,31,251,0.1) 65%, rgba(27,226,235,0.1))' }} aria-hidden>
                            <GradientPhoneIcon gradientId="contact-phone-call" className="h-6 w-6" />
                        </span>
                        <span className="min-w-0 text-left">
                            <span className="block bg-clip-text text-[11px] font-bold uppercase tracking-[0.14em] text-transparent" style={{ backgroundImage: BRAND_GRADIENT }}>Bangladesh Studio</span>
                            <span className="mt-1 block text-[clamp(1.05rem,5vw,1.35rem)] font-bold tracking-[-0.015em] text-[var(--ink-strong)]">{displayPhone}</span>
                        </span>
                    </motion.a>

                    <motion.a
                        variants={reduce ? undefined : rowReveal}
                        href="#project-inquiry"
                        data-cursor="cta"
                        className="btn-press group/message relative isolate mt-5 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[var(--field-line)] bg-[var(--chip)] px-5 py-5 text-center text-[15px] font-bold text-[var(--ink-strong)] transition-[border-color,background-color,color,box-shadow] duration-300 hover:border-transparent hover:text-white hover:shadow-[0_16px_44px_-24px_rgba(137,31,251,0.72)] sm:text-[17px]"
                    >
                        <span className="absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/message:opacity-100" style={{ background: BRAND_GRADIENT }} aria-hidden />
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                        </svg>
                        Send a Message Instead
                    </motion.a>

                    <motion.a
                        variants={reduce ? undefined : rowReveal}
                        href={`mailto:${contactEmail}`}
                        className="mx-auto mt-5 block w-fit text-center text-[12px] font-semibold text-[var(--ink-faint)] transition-colors hover:text-[#891FFB]"
                    >
                        {contactEmail}
                    </motion.a>
                </div>
            </motion.aside>
            </motion.div>
        </div>
    );
}


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
function BlockChip({ children, reduce }) {
    return (
        <motion.span
            variants={reduce ? undefined : rise}
            className="inline-flex h-7 w-fit shrink-0 select-none items-center gap-2 self-start rounded-[2px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]"
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
            {children}
        </motion.span>
    );
}

/**
 * One question. The panel animates its own height so the list stays a single
 * column that grows, and only one answer is open at a time.
 */
function FaqRow({ item, index, open, onToggle, reduce }) {
    const id = `faq-panel-${index}`;

    return (
        <motion.div
            variants={reduce ? undefined : rise}
            className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]"
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={id}
                data-cursor="explore"
                className="group flex h-14 w-full items-center gap-5 px-5 text-left"
            >
                <span
                    className={`font-display text-[12px] font-bold tracking-[0.18em] transition-colors duration-300 ${open ? 'bg-clip-text text-transparent' : 'text-[var(--ink-faint)]'}`}
                    style={open ? { backgroundImage: BRAND_GRADIENT } : undefined}
                    aria-hidden
                >
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-[var(--ink)] md:text-[17px]">
                    {item.q}
                </span>
                <span
                    className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-colors duration-300 group-hover:border-transparent"
                    style={open ? { background: BRAND_GRADIENT } : undefined}
                    aria-hidden
                >
                    <span className={`absolute h-px w-3 transition-colors duration-300 ${open ? 'bg-white' : 'bg-[var(--ink)]'}`} />
                    <motion.span
                        animate={{ rotate: open ? 0 : 90 }}
                        transition={{ duration: reduce ? 0 : 0.4, ease: [...RISE_EASE] }}
                        className={`absolute h-px w-3 ${open ? 'bg-white' : 'bg-[var(--ink)]'}`}
                    />
                </span>
            </button>
            <div
                id={id}
                aria-hidden={!open}
                className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
                <div className="min-h-0 overflow-hidden">
                    <p className={`max-w-[58ch] pb-5 pl-[4.4rem] pr-8 text-[14px] leading-[22px] text-[var(--mute)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${open ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'}`}>
                        {item.a}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Keep accordion state inside the FAQ subtree. Toggling an answer must not
 * re-render the contact form, map and ambient motion layers above it.
 */
function FaqList({ reduce }) {
    const [openFaq, setOpenFaq] = useState(-1);

    return (
        <div className="space-y-3">
            {FAQS.map((item, index) => (
                <FaqRow
                    key={item.q}
                    item={item}
                    index={index}
                    reduce={reduce}
                    open={openFaq === index}
                    onToggle={() => setOpenFaq((current) => current === index ? -1 : index)}
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

export default function Contact({ heroHeading = false }) {
    const reduce = useReducedMotion();
    const fx = useThemeMotion();
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
            onSuccess: () => reset('message'),
        });
    };

    return (
        <section id="contact" className="noise relative overflow-hidden bg-[var(--bg)] section-pad">
            {/* mouse-reactive watercolour field */}
            <InkField theme={fx.theme} />
            {/* slow ambient light drift — background only, independent of the cursor */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <motion.span
                    animate={reduce ? undefined : { x: [0, 40, 0], opacity: [0.5, 0.75, 0.5] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-32 top-[8%] h-[26rem] w-[26rem] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(137,31,251,0.12), transparent 65%)' }}
                />
                <motion.span
                    animate={reduce ? undefined : { x: [0, -44, 0], opacity: [0.45, 0.7, 0.45] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute -right-32 bottom-[4%] h-[28rem] w-[28rem] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(27,226,235,0.10), transparent 65%)' }}
                />
            </div>
            {/* rising bars bg — calmer in light theme */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-6 opacity-30" aria-hidden>
                {[['#891FFB', 140], ['#507AF4', 210], ['#1BE2EB', 300]].map(([c, h], i) => (
                    <motion.span
                        key={i}
                        animate={reduce ? undefined : { y: [20 * fx.float, -10 * fx.float, 20 * fx.float] }}
                        transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-24 rounded-t-xl border md:w-36"
                        style={{ height: h, background: `linear-gradient(180deg, ${c}44, transparent)`, borderColor: `${c}33` }}
                    />
                ))}
            </div>

            {/* The page keeps one consistent section rhythm and collapses to one
                column below lg. */}
            <div className="relative mx-auto w-full max-w-[1208px] px-6 sm:px-8 xl:px-0">
                {/* ---------- 1. Contact ---------- */}
                <motion.div
                    initial={reduce ? false : 'hidden'}
                    whileInView="show"
                    viewport={revealOnce}
                    variants={reduce ? undefined : riseGroup}
                    className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-x-12 xl:mx-auto xl:w-fit xl:grid-cols-[580px_534px] xl:gap-x-12"
                >
                    <div className="flex flex-col">
                        <motion.div variants={reduce ? undefined : rise}>
                            <SectionLabel index="04" name="CONTACT" />
                        </motion.div>

                        <motion.h2
                            variants={reduce ? undefined : rise}
                                className="mt-7 font-display font-extrabold uppercase tracking-[-0.02em] text-[var(--ink-strong)]"
                                style={{ fontSize: 'clamp(2.2rem, 4.2vw, 60px)', lineHeight: 1.06 }}
                        >
                            Have a project?
                            <span className="block text-gradient">Let&rsquo;s make</span>
                            <span className="block text-gradient">it matter.</span>
                        </motion.h2>

                        <motion.p variants={reduce ? undefined : rise} className="mt-7 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]">
                            Tell us about the work and we will come back with a clear direction, scope and next steps.
                            Two practices: Branding, and UI/UX.
                        </motion.p>

                        {/* Email / Location / Socials, each behind a tinted glyph tile. */}
                        <motion.div variants={reduce ? undefined : rise} className="mt-9 grid gap-6 sm:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, #891FFB 14%, transparent)' }} aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="#891FFB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                                        <path d="m3 6.5 9 6 9-6" />
                                    </svg>
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Email</span>
                                    <a href={'mailto:' + contactEmail} className="link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]">{contactEmail}</a>
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
                        <motion.div variants={reduce ? undefined : rise} className="mt-9">
                            <OfficeMap address={address} directionsHref={directionsUrl} />
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="link-underline btn-press mt-4 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                            >
                                Open in Google Maps &rarr;
                            </a>
                        </motion.div>
                    </div>

                    {/* ---- message card ---- */}
                    <motion.form
                        id="project-inquiry"
                        onSubmit={submit}
                        variants={reduce ? undefined : rise}
                        className="scroll-mt-28 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-7 lg:mt-[3.5rem] md:p-9"
                        aria-label="Project inquiry form"
                    >
                        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
                            <label>
                                Nickname
                                <input type="text" name="nickname" value={data.nickname} onChange={(e) => setData('nickname', e.target.value)} tabIndex={-1} autoComplete="off" />
                            </label>
                        </div>

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

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
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

                            <label className="block sm:col-span-2">
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Message*</span>
                                <textarea
                                    rows={4}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Tell us about your goals, timeline, and what success looks like..."
                                    className="field-box w-full resize-none rounded-xl p-4 text-[14px]"
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
                    </motion.form>
                </motion.div>

                {/* ---------- 2. Questions ---------- */}
                <motion.div
                    initial={reduce ? false : 'hidden'}
                    whileInView="show"
                    viewport={revealOnce}
                    variants={reduce ? undefined : riseGroup}
                    className="mt-28 grid gap-12 lg:mt-32 lg:grid-cols-[556px_554px] lg:gap-x-[96px] lg:gap-y-0"
                >
                    <div className="flex flex-col">
                        <BlockChip reduce={reduce}>FAQs</BlockChip>
                        <motion.h2 variants={reduce ? undefined : rise} className="mt-4 font-display font-extrabold uppercase tracking-[-0.02em] text-[var(--ink-strong)]" style={{ fontSize: 'clamp(2.2rem, 4.2vw, 60px)', lineHeight: 1.06 }}>
                            Clear answers
                            <span className="block text-gradient">before we start</span>
                        </motion.h2>
                        <motion.span variants={reduce ? undefined : rise} className="mt-4 block h-[3px] w-10 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                        <motion.p variants={reduce ? undefined : rise} className="mt-5 max-w-[44ch] text-[14px] leading-[22px] text-[var(--mute)]">
                            What we do, what we need from you, and how quickly you will hear back.
                        </motion.p>

                        <motion.div variants={reduce ? undefined : rise} className="mt-12 flex items-start gap-5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 lg:mt-auto">
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
                    </div>

                    <FaqList reduce={reduce} />
                </motion.div>

                {/* ---------- 3. Let's connect ---------- */}
                <motion.div
                    initial={reduce ? false : 'hidden'}
                    whileInView="show"
                    viewport={revealOnce}
                    variants={reduce ? undefined : riseGroup}
                    className="relative mt-28 overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] px-6 py-10 sm:px-8 sm:py-12 lg:-mx-[92px] lg:mt-32 lg:px-[92px] lg:py-14"
                >
                    <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
                        <span className="absolute inset-x-0 top-0 h-px" style={{ background: BRAND_GRADIENT }} />
                        <span className="absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, color-mix(in srgb, #891FFB 8%, transparent), transparent 68%)' }} />
                    </div>
                    <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t border-[var(--ink-faint)] opacity-40" aria-hidden />
                    <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r border-t border-[var(--ink-faint)] opacity-40" aria-hidden />
                    <span className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[var(--ink-faint)] opacity-40" aria-hidden />
                    <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[var(--ink-faint)] opacity-40" aria-hidden />

                    <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:items-start lg:gap-x-20">
                        <div className="relative">
                            <motion.h2 variants={reduce ? undefined : rise} className="font-display font-extrabold uppercase tracking-[-0.02em] text-[var(--ink-strong)]" style={{ fontSize: 'clamp(2.15rem, 3.8vw, 54px)', lineHeight: 1.04 }}>
                                Let&rsquo;s build
                                <span className="block text-gradient">something</span>
                            </motion.h2>
                            <motion.span variants={reduce ? undefined : rise} className="mt-6 block h-[3px] w-10 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                            <motion.p variants={reduce ? undefined : rise} className="mt-6 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]">
                                We&rsquo;re currently available for select projects and collaborations. Let&rsquo;s create digital experiences that leave a lasting impact.
                            </motion.p>
                        </div>

                        <motion.div variants={reduce ? undefined : rise} className="relative border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
                            <BlockChip reduce={reduce}>Let&rsquo;s connect</BlockChip>
                            <ul className="mt-6 list-none border-y border-[var(--line)]">
                                {[
                                    { label: contactEmail, href: 'mailto:' + contactEmail, type: 'email', ext: false },
                                    ...(socials.linkedin ? [{ label: 'LinkedIn', href: socials.linkedin, type: 'linkedin', ext: true }] : []),
                                ].map((row) => (
                                    <li key={row.label} className="border-b border-[var(--line)] last:border-b-0">
                                        <a
                                            href={row.href}
                                            {...(row.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                                            data-cursor="explore"
                                            className="group flex items-center gap-4 py-4 text-[var(--ink)]"
                                        >
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--line)] text-[var(--ink)]" aria-hidden>
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

                    <motion.div variants={reduce ? undefined : rise} className="relative mt-12 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-14">
                        <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#8bdc3c]" aria-hidden />
                            Status: <span className="text-[var(--ink)]">Open for work</span>
                        </span>
                        <StudioClock />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
