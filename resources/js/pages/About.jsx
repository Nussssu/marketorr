import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import PageMeta from '../components/PageMeta';
import LandingAbout from '../components/sections/About';
import RecognitionStrip from '../components/sections/RecognitionStrip';
import { GradientTitle, SectionLabel } from '../components/ui/primitives';
import { BRAND_SEQUENCE } from '../lib/tokens';
import { assetUrl } from '../lib/asset';

const BRAND_GRADIENT = 'linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)';

/* ------------------------------------------------------------------ */
/* Content — transcribed from marketorr.com.bd/about-us                */
/* ------------------------------------------------------------------ */

const TIMELINE = [
    {
        year: '2022',
        title: 'Two visionaries, one promise',
        copy: 'Marketorr is born from a shared vision: help businesses cut through the noise and achieve meaningful growth. The founding promise, “Just Results”, still runs every engagement.',
    },
    {
        year: 'Today',
        title: 'A full-stack growth crew',
        copy: 'Strategists, media buyers, SEO specialists, designers and writers across Bangladesh and beyond: one dedicated pod behind every brand, led by CEO Kamrul Hasan Naim.',
    },
    {
        year: 'Proof',
        title: 'Attention into revenue',
        copy: 'From zero-to-1M-BDT launches to 2100% organic-traffic turnarounds, the work compounds: 100+ brands now grow on Marketorr-built engines.',
    },
];

const MISSION = {
    title: 'Our Mission',
    copy: 'To help businesses grow through digital marketing that connects, engages and converts: blending creativity, technology and data into strategies that turn marketing into a true engine for growth.',
};

const VISION = {
    title: 'Our Vision',
    copy: 'To redefine digital marketing in Bangladesh and beyond: every campaign purposeful, data-driven and built for lasting growth, from the trusted partner businesses choose for clarity and measurable impact.',
};

const CEO = {
    name: 'Md Kamrul Hasan Naim',
    role: 'Founder & CEO',
    copy: 'Leads Marketorr with a performance-first mindset, turning fast action, practical solutions and clear strategy into measurable growth for ambitious brands.',
    image: assetUrl('/images/about/kamrul-hasan-naim.jpg'),
};

const RECOGNITION = [
    {
        name: 'GoodFirms',
        detail: 'Agency recognition',
        image: assetUrl('/images/about/recognition/goodfirms.png'),
    },
    {
        name: 'CrowdReviews',
        detail: 'Agency recognition',
        image: assetUrl('/images/about/recognition/crowdreviews.png'),
    },
    {
        name: 'NTV',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/ntv.png'),
    },
    {
        name: 'The Business Standard',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/business-standard.png'),
    },
    {
        name: 'Asian Online',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/asian-online.png'),
    },
    {
        name: 'Bangladesh Pratidin',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/bangladesh-pratidin.png'),
    },
    {
        name: 'Samakal',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/samakal.png'),
    },
    {
        name: 'Banglanews24',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/banglanews.jpg'),
    },
    {
        name: 'Daily Inqilab',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/inqilab.png'),
    },
    {
        name: 'Bhorer Kagoj',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/bhorer-kagoj.png'),
    },
    {
        name: 'Bangladesh Post',
        detail: 'Featured in',
        image: assetUrl('/images/about/recognition/bangladesh-post.png'),
    },
];

/* ------------------------------------------------------------------ */
/* Motion atoms (local — page-specific, transform/opacity only)        */
/* ------------------------------------------------------------------ */

/** Scroll-scrubbed rise + settle for section openers: drifts with the pass, never snaps. */
function ScrubRise({ children, className = '' }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 38%'] });
    const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
    const y = useTransform(eased, [0, 1], [reduce ? 0 : 46, 0]);
    const opacity = useTransform(eased, [0, 1], [0.15, 1]);

    if (reduce) return <div className={className}>{children}</div>;

    return (
        <motion.div ref={ref} style={{ y, opacity }} className={className}>
            {children}
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Story() {
    const sectionRef = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const progress = useSpring(scrollYProgress, { stiffness: 92, damping: 28, mass: 0.55 });
    const scaleY = useTransform(progress, [0.04, 0.78], [0, 1]);

    return (
        <section
            ref={sectionRef}
            aria-labelledby="story-title"
            className={`${reduce ? 'section-pad' : 'h-[260svh]'} relative border-t border-[var(--line)] bg-[var(--bg-soft)]`}
        >
            <div
                className={`container-x grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 ${
                    reduce
                        ? ''
                        : 'section-pad sticky top-16 min-h-[calc(100svh-4rem)] content-center lg:top-[72px] lg:min-h-[calc(100svh-72px)]'
                }`}
            >
                <div className="lg:sticky lg:top-32 lg:self-start">
                    <ScrubRise>
                        <SectionLabel name="Our story" />
                        <h2 id="story-title" className="display-md mt-6 uppercase text-[var(--ink-strong)]">
                            <GradientTitle text="Born to cut noise" highlightWords={2} />
                        </h2>
                        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--mute)]">
                            Marketorr was born in 2022 from a shared vision between two founders who had watched too
                            many good businesses drown in vanity metrics. The antidote became the company promise:
                        </p>
                        <p className="mt-6 border-l-2 pl-5 font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-3xl" style={{ borderImage: `${BRAND_GRADIENT} 1` }}>
                            Just <span className="text-gradient">Results.</span>
                        </p>
                    </ScrubRise>
                </div>

                <div className="relative pl-8 md:pl-10">
                    {/* Scroll-scrubbed progress rail — fills as the journey is read. */}
                    <span className="absolute inset-y-1 left-0 w-px bg-[var(--line)]" aria-hidden />
                    {!reduce && (
                        <motion.span
                            className="absolute inset-y-1 left-0 w-px origin-top"
                            style={{ scaleY, background: BRAND_GRADIENT }}
                            aria-hidden
                        />
                    )}
                    <ol className="flex flex-col gap-10">
                        {TIMELINE.map((stop, i) => (
                            <StoryPoint
                                key={stop.title}
                                stop={stop}
                                index={i}
                                progress={progress}
                                reduce={reduce}
                            />
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

function StoryPoint({ stop, index, progress, reduce }) {
    const revealStart = [0.03, 0.31, 0.59][index];
    const revealEnd = [0.18, 0.46, 0.74][index];
    const opacity = useTransform(progress, [revealStart, revealEnd], [0, 1]);
    const y = useTransform(progress, [revealStart, revealEnd], [28, 0]);
    const rotateX = useTransform(progress, [revealStart, revealEnd], [8, 0]);
    const scale = useTransform(progress, [revealStart, revealEnd], [0.97, 1]);

    return (
        <motion.li
            className="relative"
            style={reduce ? undefined : { opacity, y, rotateX, scale, transformPerspective: 900, transformOrigin: '50% 100%' }}
        >
            <span
                className="absolute top-1.5 left-[calc(-2rem+0.5px)] h-2.5 w-2.5 -translate-x-1/2 rounded-full md:left-[calc(-2.5rem+0.5px)]"
                style={{ background: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] }}
                aria-hidden
            />
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                {stop.year}
            </p>
            <h3 className="mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-2xl">
                {stop.title}
            </h3>
            <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-[var(--mute)]">{stop.copy}</p>
        </motion.li>
    );
}

/** How far into the pinned section one scroll carries the reader to Mission. */
const MISSION_THRESHOLD = 0.01;
const SCENE_EASE = [0.22, 1, 0.36, 1];

/**
 * Vision, then Mission, in one pinned frame. Scroll only decides WHICH card
 * shows — one scroll down brings Mission, scrolling back up returns Vision —
 * and the swap itself plays as a short timed animation: the outgoing card
 * leaves first, then the incoming one settles in. Nothing is scrubbed by the
 * wheel, so the two cards never sit half-overlapped while the reader reads.
 */
function MissionVision() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    const [active, setActive] = useState(0);

    useMotionValueEvent(scrollYProgress, 'change', (value) => {
        const next = value > MISSION_THRESHOLD ? 1 : 0;
        setActive((current) => (current === next ? current : next));
    });

    const sceneMotion = (index) => {
        const isActive = index === active;
        // The card that is not showing waits off to the side it left from:
        // Vision above, Mission below.
        const offset = index === 0 ? -28 : 28;

        return {
            initial: false,
            animate: { opacity: isActive ? 1 : 0, y: isActive || reduce ? 0 : offset },
            transition: reduce
                ? { duration: 0 }
                : { duration: isActive ? 0.6 : 0.35, delay: isActive ? 0.22 : 0, ease: SCENE_EASE },
            style: { pointerEvents: isActive ? 'auto' : 'none' },
            'aria-hidden': !isActive,
        };
    };

    const scenes = [
        {
            card: VISION,
            index: '03',
            label: 'Our vision',
            image: assetUrl('/images/about/vision-cartoon.png'),
            imageAlt: '3D character exploring ideas with a laptop',
        },
        {
            card: MISSION,
            index: '04',
            label: 'Our mission',
            image: assetUrl('/images/about/mission-cartoon.png'),
            imageAlt: '3D character carrying a laptop toward a goal',
        },
    ];

    return (
        <section ref={ref} aria-label="Mission and vision" className="relative h-[200svh] overflow-clip bg-[var(--bg-soft)]">
            <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden lg:top-[72px] lg:h-[calc(100svh-72px)]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                        background:
                            'radial-gradient(40% 70% at 8% 100%, rgba(137,31,251,0.14), transparent 68%), radial-gradient(36% 65% at 95% 0%, rgba(27,226,235,0.1), transparent 66%)',
                    }}
                    aria-hidden
                />
                <div className="container-x relative h-full">
                    <div className="grid h-full">
                        {scenes.map(({ card, label, image, imageAlt }, sceneIndex) => (
                            <motion.article
                                key={card.title}
                                {...sceneMotion(sceneIndex)}
                                className="relative col-start-1 row-start-1 grid h-full w-full content-center gap-6 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.78fr)] sm:items-center sm:gap-10 md:gap-14"
                            >
                                <div>
                                    <SectionLabel name={label} />
                                    <h3 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-5xl">
                                        <GradientTitle text={card.title} highlightWords={1} />
                                    </h3>
                                    <p className="mt-4 max-w-lg text-[15px] leading-[1.75] text-[var(--mute)] md:text-base">
                                        {card.copy}
                                    </p>
                                </div>
                                <img
                                    src={image}
                                    alt={imageAlt}
                                    loading="lazy"
                                    decoding="async"
                                    className="mx-auto max-h-[34svh] w-full max-w-[300px] object-contain sm:max-h-[58svh] sm:max-w-[520px]"
                                />
                            </motion.article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function LeadershipPortrait() {
    const reduce = useReducedMotion();

    return (
        <motion.figure
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.22, margin: '0px 0px -5% 0px' }}
            transition={reduce ? undefined : { type: 'spring', stiffness: 170, damping: 17, mass: 0.75 }}
            className="relative overflow-hidden rounded-[2rem]"
        >
            <img
                src={CEO.image}
                alt={`${CEO.name}, ${CEO.role} at Marketorr`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] h-full max-h-[620px] w-full object-cover object-top"
            />
        </motion.figure>
    );
}

function LeadershipCopy() {
    const reduce = useReducedMotion();

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3, margin: '0px 0px -5% 0px' }}
            transition={reduce ? undefined : { type: 'spring', stiffness: 175, damping: 18, mass: 0.72, delay: 0.1 }}
            className="flex flex-col justify-center"
        >
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#891FFB]">
                {CEO.role}
            </p>
            <h3 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-4xl">
                {CEO.name}
            </h3>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--mute)] md:text-base">
                {CEO.copy}
            </p>
        </motion.div>
    );
}

function Team() {
    return (
        <section aria-labelledby="team-title" className="section-pad relative border-t border-[var(--line)]">
            <div className="container-x">
                <ScrubRise>
                    <SectionLabel name="Leadership" />
                    <h2 id="team-title" className="display-md mt-6 max-w-3xl uppercase text-[var(--ink-strong)]">
                        <GradientTitle text="Minds behind the growth" highlightWords={2} />
                    </h2>
                </ScrubRise>

                <div className="mt-12 grid items-center gap-10 md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
                    <LeadershipPortrait />
                    <LeadershipCopy />
                </div>
            </div>

            <Awards />
        </section>
    );
}

function Awards() {
    return (
        <div aria-labelledby="awards-title" className="mt-24 overflow-hidden sm:mt-28 lg:mt-32">
            <div className="container-x text-center">
                <h3 id="awards-title" className="font-display text-lg font-extrabold uppercase tracking-[0.14em] text-[var(--ink-strong)] sm:text-xl md:text-2xl">
                    Awards &amp; Recognition
                </h3>
            </div>

            <div className="mt-8 md:mt-10">
                <RecognitionStrip items={RECOGNITION} />
            </div>
        </div>
    );
}

function StoryVisionSequence() {
    return (
        <div className="relative bg-[var(--bg-soft)]">
            <Story />
            <MissionVision />
        </div>
    );
}

export default function AboutPage({ page }) {
    const aboutContent = page?.sections?.find((section) => section.type === 'about')?.content;

    return (
        <>
            <PageMeta page={page} fallbackTitle="About | Marketorr" />
            <LandingAbout content={aboutContent} heroHeading />
            <main>
                <StoryVisionSequence />
                <Team />
            </main>
        </>
    );
}
