import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import RevealText from '../motion/RevealText';
import { SectionLabel } from '../ui/primitives';
import Stage from '../decor/Stage';

function Counter({ to, suffix = '', decimals = 0 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-15% 0px' });
    const reduce = useReducedMotion();
    const [val, setVal] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) {
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
            setVal(to * (p === 1 ? 1 : eased));
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

const METRICS = [
    { value: 120, suffix: '+', label: 'Projects delivered' },
    { value: 48, suffix: '', label: 'Brands transformed' },
    { value: 12, suffix: '', label: 'Industries served' },
    { value: 6, suffix: 'yrs', label: 'Avg. team experience' },
];

export default function About() {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const reduceRef = useRef(false);
    useEffect(() => {
        reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    return (
        <section
            id="about"
            className="noise relative overflow-hidden bg-[var(--bg-soft)] section-pad"
            onMouseMove={(e) => {
                if (reduceRef.current) return;
                if (window.matchMedia('(pointer: coarse)').matches) return;
                const r = e.currentTarget.getBoundingClientRect();
                setTilt({
                    x: ((e.clientX - r.left) / r.width - 0.5) * 2,
                    y: ((e.clientY - r.top) / r.height - 0.5) * 2,
                });
            }}
        >
            {/* cursor-reactive stage — clean single orb + motif, stays dark */}
            <div
                className="pointer-events-none absolute inset-0 transition-transform duration-500"
                style={{ transform: `translate(${tilt.x * 14}px, ${tilt.y * 14}px)` }}
                aria-hidden
            >
                <Stage variant="about" />
            </div>

            <div className="container-x relative">
                <SectionLabel index="01" name="ABOUT" />
                <div className="mt-10 grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <RevealText
                            as="h2"
                            className="display-lg uppercase text-[var(--ink-strong)]"
                            lines={['We build brands', 'and digital', 'experiences', 'that move people.']}
                        />
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
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
                            viewport={{ once: true }}
                            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[16px] leading-relaxed text-[var(--mute)]"
                        >
                            Marketorr is a creative and digital agency focused on helping ambitious brands build stronger identities,
                            better digital experiences, and measurable business growth. We combine strategy, branding, UI/UX,
                            technology, content, and performance thinking to create work that looks exceptional and performs even better.
                        </motion.p>
                        <p className="mt-5 font-display text-[12px] font-bold uppercase tracking-[0.22em]">
                            <span className="text-[#891FFB]">Creative thinking. </span>
                            <span className="text-[#507AF4]">Digital execution. </span>
                            <span className="text-[#1BE2EB]">Measurable results.</span>
                        </p>
                        <a href="#services" data-cursor="explore" className="link-underline btn-press mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                            Explore our services →
                        </a>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
                    {METRICS.map((m, i) => (
                        <div key={m.label} className="bg-[var(--surface)] p-7 md:p-9">
                            <p className="font-display text-4xl font-extrabold text-[var(--ink-strong)] md:text-5xl">
                                <Counter to={m.value} suffix={m.suffix} />
                            </p>
                            <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">{m.label}</p>
                            <span
                                className="mt-4 block h-[2px] w-10"
                                style={{ background: ['#891FFB', '#891FFB', '#507AF4', '#1BE2EB'][i] }}
                                aria-hidden
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
