import { motion, useReducedMotion } from 'framer-motion';
import { useForm, usePage } from '@inertiajs/react';
import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import FastCollapse from '../ui/FastCollapse';
import RichContent from '../ui/RichContent';
import { SectionLabel } from '../ui/primitives';
import OfficeMap from '../ui/OfficeMap';
import { useThemeMotion } from '../../lib/theme';
import InkField from '../decor/InkField';

const BRAND_GRADIENT = 'linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))';

/**
 * A blank inquiry: the form's starting state, and what "Send another message"
 * returns it to.
 *
 * The form is reset to this explicitly rather than with `reset()`: after a
 * successful submit Inertia keeps the submitted values as the form's new
 * defaults, so `reset()` would bring the previous inquiry straight back.
 */
const BLANK_INQUIRY = {
    name: '',
    email: '',
    phone: '',
    company: '',
    type: '',
    budget: '',
    message: '',
    // Honeypot — hidden from real visitors, rejected server-side when filled.
    nickname: '',
};

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
 * A masked, multi-line heading: each line rises out of its own mask, and the
 * last `highlight` lines carry the brand gradient. The lines come from the
 * section's content, so editors write them in the admin.
 *
 * @param {{ lines?: string[], highlight?: number, reduce: boolean }} props
 */
function TitleLines({ lines = [], highlight = 0, reduce }) {
    const visible = lines.filter(Boolean);
    const gradientFrom = visible.length - Number(highlight || 0);

    return visible.map((line, index) => (
        <span key={`${line}-${index}`} className="mask-line">
            <motion.span variants={reduce ? undefined : omniLine} className={`mask-inner${index >= gradientFrom ? ' text-gradient' : ''}`}>
                {line}
            </motion.span>
        </span>
    ));
}

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
 * few pixels, and the plus gives way to a cross. Only one answer is open
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
                    {item.question}
                </span>
                <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-colors duration-100 group-hover:border-transparent"
                    style={open ? { background: BRAND_GRADIENT, backgroundOrigin: 'border-box', borderColor: 'transparent' } : undefined}
                    aria-hidden
                >
                    {open ? (
                        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 12 12" className="h-3 w-3 text-[var(--ink)]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M6 1.5v9M1.5 6h9" />
                        </svg>
                    )}
                </span>
            </button>
            <FastCollapse open={open} id={id}>
                <p
                    className={`max-w-[58ch] pb-5 pl-[4.4rem] pr-8 text-[14px] leading-[22px] text-[var(--mute)] transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none ${open ? 'translate-y-0 opacity-100' : '-translate-y-0.5 opacity-0'}`}
                >
                    {item.answer}
                </p>
            </FastCollapse>
        </motion.div>
    );
});

/**
 * Keep accordion state inside the FAQ subtree. Toggling an answer must not
 * re-render the contact form and map above it.
 */
function FaqList({ items, reduce }) {
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
            {items.map((item, index) => (
                <FaqRow
                    key={`${item.question}-${index}`}
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
/**
 * The inquiry form's dropdown, drawn in the site theme instead of the
 * browser's native list. The list floats over the form, so nothing around it
 * shifts or jumps when it opens. It opens below the field, or above it when
 * there is not room below for the whole list, so every option stays visible.
 *
 * @param {{ value: string, onChange: (value: string) => void, options: string[], placeholder: string, label: string }} props
 */
function ThemedSelect({ value, onChange, options, placeholder, label }) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [dropUp, setDropUp] = useState(false);
    const rootRef = useRef(null);
    const listRef = useRef(null);
    const listId = useId();

    // Measured before paint, so the list never flashes on the wrong side.
    useLayoutEffect(() => {
        if (!open || !rootRef.current || !listRef.current) return;

        const field = rootRef.current.getBoundingClientRect();
        const needed = listRef.current.offsetHeight + 12;
        const below = window.innerHeight - field.bottom;
        const above = field.top;
        setDropUp(below < needed && above > below);
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    const openList = () => {
        setHighlighted(Math.max(0, options.indexOf(value)));
        setOpen(true);
    };

    const choose = (option) => {
        onChange(option);
        setOpen(false);
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            setOpen(false);

            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
                openList();

                return;
            }
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setHighlighted((current) => (current + step + options.length) % options.length);

            return;
        }

        if ((event.key === 'Enter' || event.key === ' ') && open && highlighted >= 0) {
            event.preventDefault();
            choose(options[highlighted]);
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-label={`${label}: ${value || placeholder}`}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onKeyDown}
                className={`field-box flex h-12 w-full items-center justify-between gap-3 rounded-xl px-4 text-left text-[14px] ${value ? '' : 'is-empty'}`.trimEnd()}
                style={open ? { borderColor: 'transparent', boxShadow: '0 0 0 1px var(--brand-2)' } : undefined}
            >
                <span className="min-w-0 truncate">{value || placeholder}</span>
                <svg
                    viewBox="0 0 12 7"
                    className={`h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    aria-hidden
                >
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    aria-label={label}
                    className={`absolute inset-x-0 z-30 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]`}
                >
                    {options.map((option, index) => {
                        const selected = option === value;
                        const active = index === highlighted;

                        return (
                            <li
                                key={option}
                                role="option"
                                aria-selected={selected}
                                onPointerEnter={() => setHighlighted(index)}
                                onClick={() => choose(option)}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors duration-150 ${
                                    active ? 'text-white' : 'text-[var(--ink)]'
                                } ${selected ? 'font-semibold' : ''}`.trimEnd()}
                                style={active ? { background: BRAND_GRADIENT } : undefined}
                            >
                                <span className="min-w-0 truncate">{option}</span>
                                {selected && (
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: active ? '#fff' : BRAND_GRADIENT }} aria-hidden />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

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
            {/* Server and browser render different seconds; the browser's
                value takes over on the next tick. */}
            <span className="tabular-nums text-[var(--ink)]" suppressHydrationWarning>{time}</span>
        </span>
    );
}

export default function Contact({ content = {} }) {
    const reduce = useReducedMotion();
    const fx = useThemeMotion();
    const [showSuccess, setShowSuccess] = useState(false);
    const scrollReveal = reduce
        ? {}
        : { initial: 'hidden', whileInView: 'show', viewport: revealViewport };
    const { settings, inquiryTypes = [] } = usePage().props;
    const { contactEmail, contactPhone, address, directionsUrl } = settings;
    const { data, setData, post, processing, errors, clearErrors } = useForm({ ...BLANK_INQUIRY });
    const budgets = (content.budgets ?? []).filter(Boolean);
    // Only types the server accepts, in the order the editor listed them.
    const projectTypes = (content.projectTypes ?? []).filter((type) => inquiryTypes.includes(type));
    const successBody = String(content.successBody ?? '').replace('{email}', contactEmail ?? '');

    const submit = (e) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
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
                    style={{ background: 'radial-gradient(circle, rgba(var(--brand-1-rgb),0.12), transparent 65%)' }}
                />
                <motion.span
                    whileInView={reduce ? undefined : { x: [0, -44, 0], opacity: [0.45, 0.7, 0.45] }}
                    viewport={{ once: false, margin: '10% 0px' }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute -right-32 bottom-[4%] h-[28rem] w-[28rem] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(var(--brand-3-rgb),0.10), transparent 65%)' }}
                />
            </div>

            {/* The page keeps one consistent section rhythm and collapses to one
                column below lg. */}
            <div className="container-x relative">
                {/* ---------- 1. Contact ---------- */}
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_600px] lg:grid-rows-[auto_1fr_auto] lg:items-stretch lg:gap-x-10 lg:gap-y-0">
                    <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="lg:col-start-1 lg:row-start-1">
                        {content.heading && <SectionLabel name={content.heading.toUpperCase()} />}
                    </motion.div>

                    <div className="flex flex-col lg:col-start-1 lg:row-start-2">

                        <motion.h2
                            {...scrollReveal}
                            variants={reduce ? undefined : lineGroup}
                            className="display-lg mt-7 uppercase text-[var(--ink-strong)]"
                        >
                            <TitleLines lines={content.titleLines} highlight={content.titleHighlight} reduce={reduce} />
                        </motion.h2>

                        {content.intro && (
                            <motion.p {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-7 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]">
                                {content.intro}
                            </motion.p>
                        )}

                        {/* Email / Phone / Location, each behind a tinted glyph tile. */}
                        <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-9 grid gap-6 sm:grid-cols-3">
                            <div className="flex items-start gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand-1) 14%, transparent)' }} aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" style={{ stroke: 'var(--brand-1)' }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                                        <path d="m3 6.5 9 6 9-6" />
                                    </svg>
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">{content.emailTileLabel}</span>
                                    <a href={`mailto:${contactEmail}`} className="link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]">{contactEmail}</a>
                                </span>
                            </div>

                            {contactPhone && (
                                <div className="flex items-start gap-3">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand-2) 14%, transparent)' }} aria-hidden>
                                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" style={{ stroke: 'var(--brand-2)' }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 3.5h3.2l1.6 4.3-2.1 1.4a11 11 0 0 0 5.1 5.1l1.4-2.1 4.3 1.6V17a2.5 2.5 0 0 1-2.7 2.5A15.5 15.5 0 0 1 2.5 6.2 2.5 2.5 0 0 1 5 3.5Z" />
                                        </svg>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">{content.phoneTileLabel}</span>
                                        <a href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`} className="link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]">{contactPhone}</a>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand-3) 16%, transparent)' }} aria-hidden>
                                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" style={{ stroke: 'var(--brand-3)' }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
                                        <circle cx="12" cy="10" r="2.6" />
                                    </svg>
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">{content.locationTileLabel}</span>
                                    <a href={directionsUrl} target="_blank" rel="noreferrer" className="link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]">{address}</a>
                                </span>
                            </div>
                        </motion.div>

                        {/* The studio map and its phone-sized actions stay in one
                            flow so the link sits directly below the map. */}
                        <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-9 w-full">
                            <OfficeMap address={address} directionsHref={directionsUrl} />
                        </motion.div>
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="link-underline btn-press mt-3 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)] lg:hidden"
                        >
                            {content.mapLinkLabel}
                        </a>
                    </div>

                    <div className="hidden lg:col-start-1 lg:row-start-3 lg:block">
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="link-underline btn-press mt-4 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)]"
                        >
                            {content.mapLinkLabel}
                        </a>
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
                                    {content.successHeading}
                                </h3>
                                {successBody && (
                                    <p className="mt-3 max-w-[38ch] text-[14px] leading-[22px] text-[var(--mute)]">
                                        {successBody}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData({ ...BLANK_INQUIRY });
                                        clearErrors();
                                        setShowSuccess(false);
                                    }}
                                    data-cursor="cta"
                                    className="btn-press mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--field-line)] px-7 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]"
                                >
                                    {content.sendAnotherLabel}
                                </button>
                            </div>
                        ) : (
                        <>
                            {content.formLabel && (
                                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                                    {content.formLabel}
                                </span>
                            )}
                            {content.formHeading && (
                                <h3 className="mt-4 font-display text-[clamp(1.4rem,2vw,28px)] font-extrabold tracking-[-0.01em] text-[var(--ink-strong)]">
                                    {content.formHeading}
                                </h3>
                            )}
                            {content.formIntro && (
                                <p className="mt-2 text-[14px] leading-[22px] text-[var(--mute)]">
                                    {content.formIntro}
                                </p>
                            )}

                            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:flex-1 lg:grid-rows-[auto_auto_auto_1fr]">
                                {[
                                    { key: 'name', label: content.nameLabel, type: 'text', ph: content.namePlaceholder },
                                    { key: 'email', label: content.emailLabel, type: 'email', ph: content.emailPlaceholder },
                                    { key: 'phone', label: content.phoneLabel, type: 'tel', ph: content.phonePlaceholder },
                                    { key: 'company', label: content.companyLabel, type: 'text', ph: content.companyPlaceholder },
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

                                <div className="block">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{content.budgetLabel}</span>
                                    <ThemedSelect
                                        label={content.budgetLabel ?? ''}
                                        value={data.budget}
                                        onChange={(value) => setData('budget', value)}
                                        options={budgets}
                                        placeholder={content.budgetPlaceholder ?? ''}
                                    />
                                </div>

                                <div className="block">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{content.typeLabel}</span>
                                    <ThemedSelect
                                        label={content.typeLabel ?? ''}
                                        value={data.type}
                                        onChange={(value) => setData('type', value)}
                                        options={projectTypes}
                                        placeholder={content.typePlaceholder ?? ''}
                                    />
                                    {errors.type && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors.type}</span>}
                                </div>

                                <label className="flex flex-col sm:col-span-2 lg:min-h-0 lg:h-full">
                                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{content.messageLabel}</span>
                                    <textarea
                                        rows={4}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder={content.messagePlaceholder ?? ''}
                                        className="field-box w-full resize-none rounded-xl p-4 text-[14px] lg:min-h-[120px] lg:flex-1"
                                    />
                                    {errors.message && <span className="mt-1 block text-[12px] text-[#ff6b6b]">{errors.message}</span>}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                data-cursor="cta"
                                className="btn-press btn-3d mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full text-[13px] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                                style={{ background: BRAND_GRADIENT }}
                            >
                                {processing ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />{content.sendingLabel}</>)
                                    : (<>{content.submitLabel} <span aria-hidden>&rarr;</span></>)}
                            </button>
                            {content.formNote && (
                                <p className="mt-3 text-center text-[12px] text-[var(--ink-faint)]">
                                    {content.formNote}
                                </p>
                            )}
                        </>
                        )}
                    </motion.form>
                </div>

            </div>
        </section>
        </>
    );
}

/**
 * Shared setup for the Contact page's follow-on sections: the same reveal and
 * reduced-motion handling as the main Contact block.
 */
function useSectionReveal() {
    const reduce = useReducedMotion();
    const scrollReveal = reduce
        ? {}
        : { initial: 'hidden', whileInView: 'show', viewport: revealViewport };

    return { reduce, scrollReveal };
}

/**
 * The Contact page's questions: heading, intro and a help box beside the
 * accordion. Its top padding keeps the same gap below the Contact block that
 * the page has always had.
 *
 * @param {{ content?: { label?: string, titleLines?: string[], titleHighlight?: number, intro?: string, items?: Array<{ question?: string, answer?: string }>, helpHeading?: string, helpBody?: string, helpLinkLabel?: string } }} props
 */
export function ContactFaq({ content = {} }) {
    const { reduce, scrollReveal } = useSectionReveal();
    const faqs = (content.items ?? []).filter((item) => item?.question);

    return (
        <section className="noise relative overflow-hidden bg-[var(--bg)] pt-12">
            <div className="container-x relative">
                        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-stretch lg:gap-x-12 lg:gap-y-0">
                <motion.div
                    {...scrollReveal}
                    variants={reduce ? undefined : omniGroup}
                    className="flex flex-col"
                >
                    {content.label && <BlockChip>{content.label}</BlockChip>}
                    <motion.h2
                        variants={reduce ? undefined : lineGroup}
                        className="display-lg mt-4 uppercase text-[var(--ink-strong)]"
                    >
                        <TitleLines lines={content.titleLines} highlight={content.titleHighlight} reduce={reduce} />
                    </motion.h2>
                    <motion.span variants={reduce ? undefined : omniRise} className="mt-4 block h-[3px] w-10 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                    {content.intro && (
                        <motion.p variants={reduce ? undefined : omniRise} className="mt-5 max-w-[44ch] text-[14px] leading-[22px] text-[var(--mute)]">
                            {content.intro}
                        </motion.p>
                    )}

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
                            <span className="block font-display text-[15px] font-bold uppercase tracking-[0.03em] text-[var(--ink)]">{content.helpHeading}</span>
                            {content.helpBody && <span className="mt-1 block text-[13px] text-[var(--mute)]">{content.helpBody}</span>}
                            {content.helpLinkLabel && (
                                <a href="#project-inquiry" data-cursor="cta" className="link-underline btn-press mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-gradient">
                                    {content.helpLinkLabel} <span aria-hidden>&rarr;</span>
                                </a>
                            )}
                        </span>
                    </motion.div>
                </motion.div>

                <FaqList items={faqs} reduce={reduce} />
            </div>
            </div>
        </section>
    );
}

/**
 * The Contact page's closing block: heading and copy beside the social links
 * and a call to action, then the reply-time line and studio clock.
 *
 * @param {{ content?: { label?: string, titleLines?: string[], titleHighlight?: number, body?: string, buttonLabel?: string, closingNote?: string } }} props
 */
export function ContactConnect({ content = {} }) {
    const { reduce, scrollReveal } = useSectionReveal();
    const { settings, menus } = usePage().props;
    // The same site-wide social links the footer shows, managed under Settings.
    const socialLinks = Object.prototype.hasOwnProperty.call(menus ?? {}, 'footer_social')
        ? menus.footer_social.map((item) => ({ label: item.label, href: item.url }))
        : [
            { label: 'LinkedIn', href: settings.socials.linkedin },
            { label: 'Behance', href: settings.socials.behance },
            { label: 'Dribbble', href: settings.socials.dribbble },
            { label: 'Instagram', href: settings.socials.instagram },
        ];

    return (
        <section className="noise relative overflow-hidden bg-[var(--bg)] pb-16 pt-28 lg:pb-20 lg:pt-32">
            <div className="container-x relative">
                        <div>
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-start lg:gap-x-12 lg:gap-y-0">
                    <motion.div
                        {...scrollReveal}
                        variants={reduce ? undefined : omniGroup}
                        className="flex flex-col"
                    >
                        {content.label && <BlockChip>{content.label}</BlockChip>}
                        <motion.h2
                            variants={reduce ? undefined : lineGroup}
                            className="display-lg mt-4 uppercase text-[var(--ink-strong)]"
                        >
                            <TitleLines lines={content.titleLines} highlight={content.titleHighlight} reduce={reduce} />
                        </motion.h2>
                        <motion.span variants={reduce ? undefined : omniRise} className="mt-6 block h-[3px] w-10 rounded-full" style={{ background: BRAND_GRADIENT }} aria-hidden />
                        <RichContent
                            as={motion.p}
                            htmlAs={motion.div}
                            value={content.body}
                            variants={reduce ? undefined : omniRise}
                            className="mt-6 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]"
                        />
                    </motion.div>

                    <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 lg:mt-[44px]">
                        <ul className="list-none border-b border-[var(--line)]">
                            {socialLinks.filter((row) => row.href).map((row) => (
                                <li key={row.label} className="border-b border-[var(--line)] last:border-b-0">
                                    <a
                                        href={row.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        data-social-platform={row.label}
                                        className="group flex items-center gap-4 py-4 text-[var(--ink)]"
                                    >
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--ink)]" aria-hidden>
                                            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                                {row.label === 'LinkedIn' && (
                                                    <>
                                                        <rect x="3" y="3" width="18" height="18" rx="2.5" />
                                                        <path d="M7.5 10v7M7.5 7.25v.1M11.5 17v-4a3 3 0 0 1 6 0v4M11.5 10v7" />
                                                    </>
                                                )}
                                                {row.label === 'Behance' && (
                                                    <>
                                                        <path d="M3.5 6.5h5a3 3 0 0 1 0 6h-5zM3.5 12.5h5.75a3.25 3.25 0 0 1 0 6.5H3.5zM14.5 7h5" />
                                                        <path d="M20.5 15.5h-7a3.5 3.5 0 1 0 6.35 2" />
                                                    </>
                                                )}
                                                {row.label === 'Dribbble' && (
                                                    <>
                                                        <circle cx="12" cy="12" r="9" />
                                                        <path d="M7.2 4.4c3.1 3.8 5.8 8.2 7.5 14.8M3.2 10.4c4.7.1 9.2-1.2 12.5-4.1M5.4 17.8c2.5-3.6 6.7-5.4 15.4-4.4" />
                                                    </>
                                                )}
                                                {row.label === 'Instagram' && (
                                                    <>
                                                        <rect x="3" y="3" width="18" height="18" rx="5" />
                                                        <circle cx="12" cy="12" r="4" />
                                                        <circle cx="17.4" cy="6.7" r=".8" fill="currentColor" stroke="none" />
                                                    </>
                                                )}
                                                {!['LinkedIn', 'Behance', 'Dribbble', 'Instagram'].includes(row.label) && (
                                                    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
                                                )}
                                            </svg>
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
                            {content.buttonLabel} <span aria-hidden>&rarr;</span>
                        </a>
                    </motion.div>
                </div>

                {/* Reply time and studio time only: Marketorr publishes no
                    availability status, so none is claimed here. */}
                <motion.div {...scrollReveal} variants={reduce ? undefined : omniRise} className="mt-12 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-14">
                    <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                        Marketorr{content.closingNote && <> &middot; <span className="text-gradient">{content.closingNote}</span></>}
                    </span>
                    <StudioClock />
                </motion.div>
            </div>
            </div>
        </section>
    );
}
