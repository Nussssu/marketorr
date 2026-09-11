import { motion, useReducedMotion } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import MagneticButton from '../motion/MagneticButton';
import { SectionLabel } from '../ui/primitives';
import RevealText from '../motion/RevealText';
import { useThemeMotion } from '../../lib/theme';

const TYPES = ['Branding', 'Web UI/UX', 'Software UI/UX', 'Mobile App UI/UX', 'Other'];

export default function Contact() {
    const reduce = useReducedMotion();
    const fx = useThemeMotion();
    const { data, setData, post, processing, wasSuccessful, errors, reset } = useForm({
        name: '',
        email: '',
        company: '',
        type: 'Branding',
        budget: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => reset('message'),
        });
    };

    return (
        <section id="contact" className="noise relative overflow-hidden bg-[var(--bg)] py-24 md:py-36">
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
                <RevealText
                    as="h2"
                    className="display-lg mt-10 uppercase text-[var(--ink-strong)]"
                    lines={['Have a project?', "Let's make", 'it matter.']}
                />

                <div className="mt-12 grid gap-12 lg:grid-cols-2">
                    <div>
                        <MagneticButton strength={12}>
                            <a
                                href="mailto:hello@marketorr.com"
                                data-cursor="cta"
                                className="btn-press group relative flex items-center justify-center gap-4 overflow-hidden rounded-full border border-[var(--field-line)] px-10 py-7 font-display text-xl font-extrabold uppercase tracking-tight text-[var(--ink)] transition-all duration-500 hover:border-transparent hover:text-white md:text-2xl"
                            >
                                <span
                                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)', boxShadow: `0 0 ${Math.round(60 * fx.glow)}px rgba(137,31,251,0.35)` }}
                                    aria-hidden
                                />
                                <span className="relative">Start a project →</span>
                            </a>
                        </MagneticButton>
                        <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Email</p>
                                <a href="mailto:hello@marketorr.com" className="link-underline btn-press mt-1 inline-block font-semibold text-[var(--ink)]">hello@marketorr.com</a>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Phone</p>
                                <a href="tel:+10000000000" className="link-underline btn-press mt-1 inline-block font-semibold text-[var(--ink)]">+1 (000) 000-0000</a>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Location</p>
                                <p className="mt-1 font-semibold text-[var(--ink)]">Remote-first · Worldwide</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">Socials</p>
                                <p className="mt-1 flex gap-3 font-semibold text-[var(--ink)]">
                                    {[
                                        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/marketorr' },
                                        { label: 'Behance', href: 'https://www.behance.net/marketorr' },
                                    ].map((s) => (
                                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-underline btn-press">{s.label}</a>
                                    ))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:p-9" aria-label="Project inquiry form">
                        <div className="grid gap-6 sm:grid-cols-2">
                            {[
                                ['Name*', 'name', 'text', 'Jane Cooper'],
                                ['Email*', 'email', 'email', 'jane@company.com'],
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
                            className="btn-press mt-8 flex w-full items-center justify-center gap-3 rounded-full py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
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
                    </form>
                </div>
            </div>
        </section>
    );
}
