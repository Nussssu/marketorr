import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { GradientTitle, SectionLabel } from '../ui/primitives';
import RevealText from '../motion/RevealText';
import ScrollHeading from '../motion/ScrollHeading';
import ServiceShowcaseRail from './ServiceShowcaseRail';
import ServicesTransition from './ServicesTransition';
import SubServiceTicker, { SubServiceCopy } from './SubServiceTicker';
import { useTapIntent } from '../../lib/tapIntent';
import { EASE } from '../../lib/motion';
import { transitionTo } from '../motion/PageTransition';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { gradientLines } from '../../lib/headingLines';

const BRAND_GRADIENT = 'linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3))';

function navigateWithCurtain(event, href, tapIntent) {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== undefined && event.button !== 0) return;

    tapIntent.onClick(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    transitionTo(href);
}

/**
 * Home-page entrance choreography. It plays once, `compact` shortens the
 * travel and timings on phones, and the whole thing is skipped when the user
 * prefers reduced motion.
 */
const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' };

/** Phones play the entrance once; replaying it on every pass is wasted work. */
const VIEWPORT_COMPACT = { once: true, margin: '-12% 0px -12% 0px' };

const cardStagger = (compact) => ({
    hidden: {},
    show: { transition: { staggerChildren: compact ? 0.1 : 0.15, delayChildren: compact ? 0.05 : 0.12 } },
});

/**
 * Desktop cards arrive as panels standing in depth: they rise, un-tilt and
 * come forward out of the stage's Z axis into a perfectly flat resting frame.
 * `mirror` turns the second card's entry the other way so the pair opens like
 * two leaves rather than two copies. Phones keep the existing flat rise —
 * rotation and translateZ on a phone buy jank, not depth.
 *
 * @param {boolean} compact
 * @param {boolean} mirror
 */
const cardVariants = (compact, mirror = false) => ({
    hidden: {
        opacity: 0,
        y: compact ? 34 : 66,
        scale: compact ? 0.98 : 0.94,
        rotateX: compact ? 0 : 13,
        rotateY: compact ? 0 : (mirror ? -9 : 9),
        z: compact ? 0 : -240,
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        z: 0,
        transition: { duration: compact ? 0.44 : 0.72, ease: [...EASE] },
    },
});

const COMPACT_QUERY = '(max-width: 767px)';

/**
 * True on phone-width viewports, so the section can run a lighter version of
 * the same choreography. It settles straight after hydration (see
 * `useMediaQuery`); the card grid is keyed on it, so the cards — still hidden
 * at that point — remount with the phone's entrance pose before they play.
 *
 * @return {boolean}
 */
function useCompactViewport() {
    return useMediaQuery(COMPACT_QUERY);
}

function CategoryGateway({ category, variants, solidHeadings = false }) {
    const cardTapIntent = useTapIntent();
    const arrowTapIntent = useTapIntent();
    // Sections on the Services page: Branding → /services#branding, UI/UX → /services#ui-ux.
    const exploreHref = `/services#${category.slug}`;

    // The rail's clock owns the motion. It writes its continuous position — a
    // float in screens — into this value every frame, and the ticker below the
    // title reads the same value, so the name rises in lockstep with the image
    // and the two can never drift apart. A motion value rather than state on
    // purpose: the reel updates it every frame, and re-rendering the card 60
    // times a second to move two decorative columns would be absurd.
    //
    // The reel never pauses for hover, and nothing here reads the pointer;
    // hover only drives the card's visual effects (border, arrow, CTA) via CSS.
    const reel = useMotionValue(0);

    // The full card is a navigation target; its decorative content lets clicks
    // pass through while the arrow and CTA remain independently interactive.

    return (
        <motion.article
            data-cursor="explore"
            variants={variants}
            style={variants ? { transformStyle: 'preserve-3d' } : undefined}
            className={`group relative min-h-[340px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10 lg:p-12 ${variants ? 'services-card' : ''}`.trimEnd()}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" style={{ background: BRAND_GRADIENT }} aria-hidden />
            <Link
                href={exploreHref}
                prefetch
                aria-label={`Explore ${category.name} services`}
                {...cardTapIntent}
                onClick={(event) => navigateWithCurtain(event, exploreHref, cardTapIntent)}
                className="absolute inset-0 z-0 rounded-3xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-2)]"
            />
            <div className="pointer-events-none relative z-0 flex h-full gap-4 sm:gap-7">
                <div className="flex h-full min-w-0 flex-1 flex-col justify-between gap-8">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="font-display text-[calc(clamp(2.1rem,8.6vw,3.9rem)*var(--heading-scale,1))] font-extrabold uppercase leading-[.88] tracking-[-.05em] text-[var(--ink-strong)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2">
                            {solidHeadings ? category.name : <GradientTitle text={category.name} />}
                        </h2>
                        <Link
                            href={exploreHref}
                            prefetch
                            aria-label={`Explore ${category.name}`}
                            {...arrowTapIntent}
                            onClick={(event) => navigateWithCurtain(event, exploreHref, arrowTapIntent)}
                            className="services-card__arrow pointer-events-auto relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-xl text-[var(--ink)] transition-all duration-500 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-[var(--brand-2)] group-hover:text-white"
                        >
                            ↗
                        </Link>
                    </div>
                    <SubServiceTicker category={category} position={reel} />
                    <div className="flex">
                        <SubServiceCopy category={category} position={reel} />
                    </div>
                </div>
                <ServiceShowcaseRail category={category} progress={reel} solidTitle={solidHeadings} />
            </div>
        </motion.article>
    );
}

/**
 * @param {{
 *   heroHeading?: boolean,
 *   subservices?: Array<object>,
 *   showTransition?: boolean,
 *   scrollAnimation?: boolean,
 *   solidHeadings?: boolean,
 * }} props
 *   `showTransition` false keeps the section to the two category gateways only
 *   — the Home page wants a simple entry point and has its own onward flow,
 *   while the Services page closes on the cinematic hand-off to the dedicated
 *   Branding and UI/UX pages.
 *   `scrollAnimation` opts into the Home-only entrance choreography and the
 *   card hover treatment; every other mount renders exactly as before. The two
 *   gateway cards themselves — layout, type scale and the moving showcase rail
 *   in the composition area — are identical wherever the section mounts.
 *   `solidHeadings` keeps every title in this section a single solid colour
 *   (Services pages); elsewhere the key words carry the brand gradient.
 */
export default function Services({
    content = {},
    heroHeading = false,
    subservices = [],
    showTransition = true,
    scrollAnimation = false,
    solidHeadings = false,
}) {
    const reduce = useReducedMotion();
    const compact = useCompactViewport();
    const animate = !reduce;
    // Stable identities: a fresh variants object every render makes Framer
    // re-resolve targets mid-flight.
    const gridVariants = useMemo(() => cardStagger(compact), [compact]);
    const itemVariants = useMemo(() => cardVariants(compact), [compact]);
    const mirroredVariants = useMemo(() => cardVariants(compact, true), [compact]);

    return (
        <section id="services" className="relative overflow-x-clip bg-[var(--bg)] pt-24 lg:pt-32">
            <div className="container-x relative pb-20 lg:pb-28">
                {content.heading && <SectionLabel name={content.heading.toUpperCase()} />}
                <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <ScrollHeading enabled={heroHeading || animate} intensity={heroHeading ? 1 : 0.85}>
                        <RevealText
                            as={heroHeading ? 'h1' : 'h2'}
                            className="display-lg uppercase text-[var(--ink-strong)]"
                            lines={content.titleLines ?? []}
                            lineClassName="whitespace-nowrap"
                            highlightedLines={solidHeadings ? undefined : gradientLines(content.titleLines, content.titleHighlight)}
                            duration={animate ? 0.58 : undefined}
                            stagger={animate ? 0.13 : undefined}
                        />
                    </ScrollHeading>
                    {content.intro && (
                        <p className="max-w-lg text-[15px] leading-relaxed text-[var(--mute)]">{content.intro}</p>
                    )}
                </div>

                <motion.div
                    // Remounts once the viewport is known after hydration, so the
                    // still-hidden cards take the entrance pose for that viewport.
                    key={compact ? 'compact' : 'wide'}
                    className="mt-14 grid w-full gap-5 lg:grid-cols-2"
                    style={animate && !compact ? { perspective: '1500px' } : undefined}
                    {...(animate
                        ? {
                            initial: 'hidden',
                            whileInView: 'show',
                            viewport: compact || !scrollAnimation ? VIEWPORT_COMPACT : VIEWPORT,
                            variants: gridVariants,
                        }
                        : {})}
                >
                    {subservices.map((category, index) => (
                        <CategoryGateway
                            key={category.slug}
                            category={category}
                            variants={animate ? (index % 2 === 1 ? mirroredVariants : itemVariants) : undefined}
                            solidHeadings={solidHeadings}
                        />
                    ))}
                </motion.div>

            </div>

            {showTransition && <ServicesTransition />}
        </section>
    );
}
