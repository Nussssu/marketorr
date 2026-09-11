import { Link } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from '../../lib/motion';
import { FEATURED_PROJECTS } from '../../lib/projects';
import { SectionLabel, Tag } from '../ui/primitives';
import RevealText from '../motion/RevealText';
import CursorGlow from '../decor/CursorGlow';
import Stage from '../decor/Stage';

/** Parallax + cover-reveal are desktop/tablet only; phones keep a plain fade. */
function useRichMotion() {
    const [rich, setRich] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px)');
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return rich;
}

/**
 * Real project cover: masked reveal on entry, slow scroll parallax, fast hover.
 *
 * @param {{ p: import('../../lib/projects').Project, glow: (color: string, size: number) => string, rich: boolean, progress: import('framer-motion').MotionValue<number> }} props
 */
function ProjectCover({ p, glow, rich, progress }) {
    const reduce = useReducedMotion();
    const parallax = rich && !reduce;
    const y = useTransform(progress, [0, 1], parallax ? ['-5.5%', '5.5%'] : ['0%', '0%']);

    return (
        <div className="relative h-full w-full overflow-hidden bg-[#111116]" style={{ containerType: 'inline-size' }}>
            <motion.div
                className="absolute inset-x-0 -top-[6%] h-[112%]"
                style={{ y }}
                initial={{ scale: reduce ? 1 : 1.12 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 1.1, ease: [...EASE] }}
            >
                <img
                    src={p.image}
                    alt={p.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.035]"
                />
            </motion.div>

            {/* accent wash — keeps covers cinematic in both themes, lifts on hover */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-200 group-hover:opacity-40"
                style={{ background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}2e, transparent 55%), linear-gradient(160deg, rgba(24,24,31,0.55), rgba(8,8,10,0.82))` }}
                aria-hidden
            />

            {/* curtain wipe on first entry */}
            {!reduce && (
                <motion.span
                    className="absolute inset-0 origin-bottom bg-[var(--bg-soft)]"
                    initial={{ scaleY: 1 }}
                    whileInView={{ scaleY: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 0.72, ease: [...EASE] }}
                    aria-hidden
                />
            )}

            {p.metric && (
                <motion.div
                    className="absolute right-4 top-4 text-right md:right-8 md:top-8"
                    initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 0.5, delay: 0.5, ease: [...EASE] }}
                    aria-hidden
                >
                    <p
                        className="font-display font-extrabold leading-none text-white/95"
                        style={{ fontSize: 'clamp(1.35rem, 9cqw, 3.5rem)', textShadow: `0 2px 24px ${p.accent}55` }}
                    >
                        {p.metric}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 md:text-[11px] md:tracking-[0.2em]">{p.metricLabel}</p>
                </motion.div>
            )}

            <div
                className="absolute bottom-4 left-4 flex max-w-[calc(100%-5rem)] items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 backdrop-blur-sm md:bottom-6 md:left-6 md:max-w-[calc(100%-6rem)]"
                style={{ boxShadow: glow ? glow(p.accent, 26) : undefined }}
                aria-hidden
            >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
                <span className="truncate font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">{p.category}</span>
            </div>

            <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black transition-transform duration-200 group-hover:scale-105 md:bottom-6 md:right-6 md:h-14 md:w-14" aria-hidden>
                <span data-arrow>↗</span>
            </div>

            <span className="absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-200 group-hover:border-white/20" aria-hidden />
            <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }} aria-hidden />
        </div>
    );
}

/**
 * One marquee item. `ratio` is numeric (w / h) so the media keeps its exact
 * proportion while every card shares the row height set by `--mq-h`.
 *
 * @param {{ p: import('../../lib/projects').Project, glow?: (color: string, size: number) => string, className?: string, ratio?: number }} props
 */
function Card({ p, glow, className = '', ratio = 16 / 10 }) {
    const ref = useRef(null);
    const rich = useRichMotion();
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

    const meta = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
    };
    const metaItem = {
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [...EASE] } },
    };

    return (
        <motion.div
            ref={ref}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.18 }}
            className={`shrink-0 ${className}`}
            style={{ width: `calc(var(--mq-h) * ${ratio})` }}
        >
            <Link href={`/work/${p.slug}`} data-cursor="view" className="group block" aria-label={`View ${p.title} case study`}>
                <div
                    className="overflow-hidden rounded-2xl border border-[var(--line)]"
                    style={{ height: 'var(--mq-h)', aspectRatio: ratio }}
                >
                    <ProjectCover p={p} glow={glow} rich={rich} progress={scrollYProgress} />
                </div>
                <motion.div
                    variants={meta}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-12% 0px' }}
                    className="mt-5 flex flex-wrap items-start justify-between gap-4"
                >
                    <div>
                        <motion.p variants={metaItem} className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]">{p.client} · {p.year}</motion.p>
                        <motion.h3 variants={metaItem} className="mt-1 font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)] md:text-3xl">
                            <span className="bg-[linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)] bg-[length:0%_100%] bg-no-repeat bg-clip-text transition-[background-size,color] duration-200 group-hover:bg-[length:100%_100%] group-hover:text-transparent">
                                {p.title}
                            </span>
                        </motion.h3>
                        <motion.p variants={metaItem} className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--mute)]">{p.description}</motion.p>
                        <motion.div variants={metaItem} className="mt-3 flex flex-wrap gap-2">
                            {p.tags.map((t) => (
                                <Tag key={t} accent={p.accent}>{t}</Tag>
                            ))}
                        </motion.div>
                    </div>
                    {p.metric && (
                        <motion.div variants={metaItem} className="text-right">
                            <p className="font-display text-2xl font-extrabold" style={{ color: p.accent }}>{p.metric}</p>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">{p.metricLabel}</p>
                        </motion.div>
                    )}
                </motion.div>
            </Link>
        </motion.div>
    );
}

/** Card order and proportions for the row — each keeps its original ratio. */
const ROW = [
    { index: 0, ratio: 16 / 9 },
    { index: 1, ratio: 3 / 4 },
    { index: 2, ratio: 21 / 10 },
    { index: 3, ratio: 4 / 3 },
];

/**
 * Seamless right-to-left portfolio marquee.
 *
 * The track holds two identical copies of the row; the offset wraps at exactly
 * half the track width, so the loop never jumps and never reverses. Speed is
 * derived from the measured width to land inside the target loop time, and
 * hover eases the factor down instead of stopping dead.
 */
function Marquee({ projects, glow }) {
    const trackRef = useRef(null);
    const hovering = useRef(false);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return undefined;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

        // Slower on small screens, per the same leftward travel.
        const loopSeconds = window.matchMedia('(max-width: 767px)').matches ? 48 : 42;

        let half = track.scrollWidth / 2;
        let offset = 0;
        let factor = 1;
        let last = 0;
        let visible = true;
        let raf = 0;

        const frame = (time) => {
            raf = requestAnimationFrame(frame);
            const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
            last = time;
            if (!visible || !half) return;

            // Ease toward the hover speed rather than cutting to it.
            const targetFactor = hovering.current ? 0.25 : 1;
            factor += (targetFactor - factor) * Math.min(1, dt * 3.5);

            offset += (half / loopSeconds) * factor * dt;
            if (offset >= half) offset -= half;
            track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        };

        const ro = new ResizeObserver(() => {
            half = track.scrollWidth / 2;
            if (half) offset %= half;
        });
        ro.observe(track);

        const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '15% 0px' });
        io.observe(track);

        raf = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
        };
    }, []);

    return (
        <div
            className="work-marquee relative mt-12 overflow-hidden"
            onMouseEnter={() => { hovering.current = true; }}
            onMouseLeave={() => { hovering.current = false; }}
        >
            <div ref={trackRef} className="flex w-max gap-6 px-5 will-change-transform md:gap-10 md:px-8 xl:px-12">
                {[0, 1].map((copy) => (
                    <div key={copy} className="flex w-max shrink-0 gap-6 md:gap-10" aria-hidden={copy === 1}>
                        {ROW.map((r) => (
                            <Card key={`${copy}-${projects[r.index].slug}`} p={projects[r.index]} glow={glow} ratio={r.ratio} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function OurWork({ glow }) {

    return (
        <section id="work" className="relative overflow-hidden bg-[var(--bg-soft)] section-pad">
            <Stage variant="work" />
            <CursorGlow />
            <div className="container-x relative">
                <SectionLabel index="03" name="OUR WORK" />
                {/* intro */}
                <div className="lg:py-6">
                    <RevealText as="h2" className="display-lg uppercase text-[var(--ink-strong)]" lines={['Work that', 'creates impact.']} />
                    <p className="mt-4 max-w-lg text-[15px] text-[var(--mute)]">
                        Selected work across branding, digital products, UI/UX, campaigns, and growth-focused experiences.
                    </p>
                </div>
            </div>

            {/* continuous right-to-left card row */}
            <Marquee projects={FEATURED_PROJECTS} glow={glow} />

            <div className="container-x relative">
                <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-14">
                    <div className="flex flex-col justify-center">
                        <p className="font-display text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">Progression</p>
                        <p className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-[var(--ink-strong)] md:text-4xl">
                            Idea <span className="text-[#891FFB]">→</span> Experience <span className="text-[#507AF4]">→</span> Result <span className="text-[#1BE2EB]">→</span>
                        </p>
                        <div className="mt-6 h-[3px] w-full" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }} aria-hidden />
                        <p className="mt-6 max-w-md text-[14px] text-[var(--mute)]">Every engagement moves through the same operating system — sharp idea, crafted experience, measured result.</p>
                    </div>
                    <div className="flex flex-col justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 md:p-12">
                        <p className="font-display text-4xl font-extrabold uppercase leading-none text-[var(--ink-strong)]">Your brand<br /><span className="text-gradient">could be next.</span></p>
                        <Link href="/#contact" data-cursor="cta" className="btn-press mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white" style={{ background: 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)' }}>
                            Start a project ↗
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Link href="/work" className="btn-press link-underline text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)] hover:text-[var(--ink)]">
                        View all work →
                    </Link>
                </div>
            </div>
        </section>
    );
}
