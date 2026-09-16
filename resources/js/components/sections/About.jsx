import { Link, usePage } from '@inertiajs/react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import RevealText from '../motion/RevealText';
import { SectionLabel } from '../ui/primitives';
import ScrollHeading from '../motion/ScrollHeading';
import CursorGlow from '../decor/CursorGlow';
import Stage from '../decor/Stage';

/** Phones count up once; desktop keeps replaying on every viewport re-entry. */
const COUNTER_ONCE_QUERY = '(max-width: 767px)';

function Counter({ to, suffix = '', decimals = 0 }) {
    const ref = useRef(null);
    // Each frame of the count sets React state, so a replay re-renders four
    // counters at 60fps for 1.6s. That is affordable once, but not every time
    // a thumb scrolls the section back into view on a phone.
    const [once] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(COUNTER_ONCE_QUERY).matches,
    );
    const inView = useInView(ref, { margin: '-15% 0px', once });
    const reduce = useReducedMotion();
    // Never render zero: the pre-animation state is the final value, and each
    // replay counts up from a small non-zero floor instead of resetting.
    const [val, setVal] = useState(to);

    useEffect(() => {
        // Leaving the viewport keeps the final value visible; entering replays.
        if (!inView) return;
        const floor = Math.min(to, Math.max(1, Math.floor(to * 0.08)));
        if (reduce || floor >= to) {
            // Intentional: jump straight to final value when motion is reduced
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVal(to);
            return;
        }
        let raf = 0;
        const start = performance.now();
        const dur = 1600;
        const tick = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(2, -10 * p);
            setVal(floor + (to - floor) * (p === 1 ? 1 : eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, to, reduce]);

    return (
        <span ref={ref}>
            {val.toFixed(decimals)}
            {suffix}
        </span>
    );
}

/** Accent bar under each stat block, repeating if more metrics are configured. */
const METRIC_ACCENTS = ['#891FFB', '#891FFB', '#507AF4', '#1BE2EB'];

export default function About({ heroHeading = false }) {
    const { settings } = usePage().props;
    const { text, metrics } = settings.about;

    return (
        <section
            id="about"
            className="noise relative overflow-hidden bg-[var(--bg-soft)] section-pad"
        >
            {/* cursor-reactive stage — clean single orb + motif, stays dark */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
            >
                <Stage variant="about" />
            </div>
            <CursorGlow />

            <div className="container-x relative">
                <SectionLabel index="01" name="ABOUT" />
                <div className="mt-10 grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <ScrollHeading enabled={heroHeading}>
                            <RevealText
                                as="h2"
                                className="display-lg uppercase text-[var(--ink-strong)]"
                                lines={['We build brands', 'and digital', 'experiences', 'that move people.']}
                            />
                        </ScrollHeading>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: false }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-8 h-[3px] w-48 origin-left"
                            style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}
                            aria-hidden
                        />
                    </div>
                    <div className="lg:col-span-5 lg:pt-4">
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[16px] leading-relaxed text-[var(--mute)]"
                        >
                            {text}
                        </motion.p>
                        <p className="mt-5 font-display text-[12px] font-bold uppercase tracking-[0.22em]">
                            <span className="text-[#891FFB]">Creative thinking. </span>
                            <span className="text-[#507AF4]">Digital execution. </span>
                            <span className="text-[#1BE2EB]">Measurable results.</span>
                        </p>
                        <Link href="/services" data-cursor="explore" className="link-underline btn-press mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                            Explore our services →
                        </Link>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
                    {metrics.map((m, i) => (
                        <div key={m.label} className="bg-[var(--surface)] p-7 md:p-9">
                            <p className="font-display text-4xl font-extrabold text-[var(--ink-strong)] md:text-5xl">
                                <Counter to={Number(m.value)} suffix={m.suffix ?? ''} />
                            </p>
                            <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">{m.label}</p>
                            <span
                                className="mt-4 block h-[2px] w-10"
                                style={{ background: METRIC_ACCENTS[i % METRIC_ACCENTS.length] }}
                                aria-hidden
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
