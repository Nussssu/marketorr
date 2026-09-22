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

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';
const MARKETORR_PHONE = '+880 1332-850355';

/**
 * Cinematic card reveal: the box rises as one while its rows follow in a
 * staggered trail — the same enter-once-in-view rhythm as the reference.
 * Disabled entirely under reduced motion.
 */
const boxReveal = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const rowReveal = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [...EASE] } },
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

            <div className="container-x relative">
                <SectionLabel index="04" name="CONTACT" />
                <ScrollHeading enabled={heroHeading} className="mt-10">
                    <RevealText
                        as="h2"
                        className="display-lg uppercase text-[var(--ink-strong)]"
                        lines={['Have a project?', "Let's make", 'it matter.']}
                        highlightedLines={[2]}
                        duration={0.72}
                        stagger={0.13}
                    />
                </ScrollHeading>

                {heroHeading && (
                    <SpeakWithUs contactEmail={contactEmail} contactPhone={contactPhone} />
                )}

                <div className="mt-12 grid gap-12 lg:grid-cols-2">
                    <motion.div
                        initial={reduce ? false : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: '-8% 0px' }}
                        transition={{ duration: 0.7, ease: [...EASE] }}
                    >
                        <MagneticButton strength={12}>
                            <a
                                href={`mailto:${contactEmail}`}
                                data-cursor="cta"
                                className="btn-press group relative flex items-center justify-center gap-4 overflow-hidden rounded-full border border-[var(--field-line)] px-6 py-7 font-display text-xl font-extrabold uppercase tracking-tight text-[var(--ink)] transition-all duration-500 hover:border-transparent hover:text-white sm:px-10 md:text-2xl"
                            >
                                <span
                                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)', boxShadow: `0 0 ${Math.round(60 * fx.glow)}px rgba(137,31,251,0.35)` }}
                                    aria-hidden
                                />
                                <span className="relative">Start a project →</span>
                            </a>
                        </MagneticButton>
                        <div className="mt-10 grid grid-cols-1 gap-6 text-sm min-[420px]:grid-cols-2">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Email</p>
                                <a href={`mailto:${contactEmail}`} className="link-underline btn-press mt-1 inline-block font-semibold text-[var(--ink)]">{contactEmail}</a>
                            </div>
                            {contactPhone && (
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Phone</p>
                                    <a href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`} className="link-underline btn-press mt-1 inline-block font-semibold text-[var(--ink)]">{contactPhone}</a>
                                </div>
                            )}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Location</p>
                                <p className="mt-1 font-semibold text-[var(--ink)]">{locationText}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Socials</p>
                                <p className="mt-1 flex gap-3 font-semibold text-[var(--ink)]">
                                    {socialLinks.slice(0, 2).map((s) => (
                                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-underline btn-press">{s.label}</a>
                                    ))}
                                </p>
                            </div>
                        </div>
                        <OfficeMap
                            className="mt-8"
                            address={address}
                            directionsHref={directionsUrl}
                        />
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="link-underline btn-press mt-3 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                        >
                            Open in Google Maps ↗
                        </a>
                    </motion.div>

                    <motion.form
                        id="project-inquiry"
                        onSubmit={submit}
                        initial={reduce ? false : { opacity: 0, y: 26 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-8% 0px' }}
                        transition={{ duration: 0.7, ease: [...EASE] }}
                        className="scroll-mt-28 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:p-9"
                        aria-label="Project inquiry form"
                    >
                        {/* Honeypot — off-screen and skipped by assistive tech, so only bots fill it. */}
                        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
                            <label>
                                Nickname
                                <input
                                    type="text"
                                    name="nickname"
                                    value={data.nickname}
                                    onChange={(e) => setData('nickname', e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </label>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {[
                                ['Name*', 'name', 'text', 'Jane Cooper'],
                                ['Email*', 'email', 'email', 'jane@company.com'],
                                ['Phone', 'phone', 'tel', '+880 1700 000000'],
                                ['Company', 'company', 'text', 'Company Inc.'],
                                ['Budget', 'budget', 'text', '$10k – $25k'],
                            ].map(([label, key, type, ph]) => (
                                <label key={key} className="field-wrap block">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">{label}</span>
                                    <input
                                        type={type}
                                        value={data[key]}
                                        onChange={(e) => setData(key, e.target.value)}
                                        placeholder={ph}
                                        className="field-underline w-full bg-transparent pb-3 text-[15px]"
                                    />
                                    {errors[key] && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors[key]}</span>}
                                </label>
                            ))}
                            <label className="field-wrap block">
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Project type</span>
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="field-underline w-full bg-transparent pb-3 text-[15px]">
                                    {TYPES.map((t) => (
                                        <option key={t} value={t} className="bg-[var(--surface)]">{t}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="field-wrap block sm:col-span-2">
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Message*</span>
                                <textarea
                                    rows={4}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Tell us about your goals, timeline, and what success looks like…"
                                    className="field-underline w-full resize-none bg-transparent pb-3 text-[15px]"
                                />
                                {errors.message && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors.message}</span>}
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={processing || wasSuccessful}
                            data-cursor="cta"
                            className="btn-press btn-3d mt-8 flex w-full items-center justify-center gap-3 rounded-full py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                            style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                        >
                            {processing ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                                    Sending…
                                </>
                            ) : wasSuccessful ? (
                                'Inquiry received ✓'
                            ) : (
                                'Send inquiry →'
                            )}
                        </button>
                        <p className="mt-3 text-center text-[12px] text-[var(--ink-faint)]">
                            {wasSuccessful ? 'Thanks — we reply within 24–48h.' : 'No spam. NDA-friendly.'}
                        </p>
                    </motion.form>
                </div>
            </div>
        </section>
    );
}
