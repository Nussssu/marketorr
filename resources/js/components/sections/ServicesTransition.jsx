import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import MagneticButton from '../motion/MagneticButton';
import RevealText from '../motion/RevealText';
import { GradientButton, SectionLabel } from '../ui/primitives';

/**
 * Viewport tier for the transition's scroll choreography. Phones keep the
 * parallax but drop the 3D turn: perspective plus rotateX on a phone buys
 * jank, not depth.
 *
 * @return {{ compact: boolean, rich: boolean }}
 */
function useTransitionTier() {
    // Starts plain so the first mobile frame never receives the richer transform.
    const [tier, setTier] = useState({ compact: false, rich: false });

    useEffect(() => {
        const compactQuery = window.matchMedia('(max-width: 767px)');
        const richQuery = window.matchMedia('(min-width: 768px)');
        const update = () => setTier({ compact: compactQuery.matches, rich: richQuery.matches });
        update();
        compactQuery.addEventListener('change', update);
        richQuery.addEventListener('change', update);

        return () => {
            compactQuery.removeEventListener('change', update);
            richQuery.removeEventListener('change', update);
        };
    }, []);

    return tier;
}

/**
 * The cinematic hand-off between the two category gateways and the dedicated
 * Branding and UI/UX pages.
 *
 * One scroll progress value drives the whole passage. Everything it moves sits
 * at a different distance and therefore travels at a different rate — the grid
 * and the brand glows drift slowly behind, the headline turns out of depth on
 * its own axis, and the supporting line and the buttons trail it — so scrolling
 * through reads as moving through a space rather than past a block of copy.
 *
 * Only `transform` and `opacity` are animated, so the passage stays on the
 * compositor. Phones keep the parallax and drop the 3D turn; reduced motion
 * renders the section flat and static, with the copy and both links intact.
 *
 * @param {{ categories?: Array<{ slug: string, name: string }> }} props
 *   Unused for content — the section deliberately carries no cards or lists —
 *   but kept so the caller can pass the catalogue it already has.
 */
export default function ServicesTransition() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { compact, rich } = useTransitionTier();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

    // Phones travel half as far: the same distances on a short viewport read as
    // the section sliding around rather than settling.
    const k = compact ? 0.5 : 1;

    const gridY = useTransform(scrollYProgress, [0, 1], [-50 * k, 50 * k]);
    const glowY = useTransform(scrollYProgress, [0, 1], [110 * k, -110 * k]);
    const glowFade = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
    const headY = useTransform(scrollYProgress, [0, 1], [46 * k, -46 * k]);
    const headTurn = useTransform(scrollYProgress, [0, 0.5, 1], [9, 0, -6]);
    const headScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);
    const headFade = useTransform(scrollYProgress, [0, 0.3, 0.78, 1], [0.35, 1, 1, 0.3]);
    const copyY = useTransform(scrollYProgress, [0, 1], [78 * k, -78 * k]);
    const ctaY = useTransform(scrollYProgress, [0, 1], [112 * k, -112 * k]);
    const ruleScale = useTransform(scrollYProgress, [0.12, 0.45], [0, 1]);
    // The two glows drift apart as the section passes, which is what keeps the
    // background from reading as one flat wash sliding by.
    const counterGlowY = useTransform(glowY, (value) => -value);

    const motionProps = (style) => (reduce ? {} : { style });
    const headStyle = rich
        ? { y: headY, rotateX: headTurn, scale: headScale, opacity: headFade, transformPerspective: 1200 }
        : { y: headY, scale: headScale, opacity: headFade };

    return (
        <section ref={ref} className="services-transition relative isolate overflow-hidden bg-[var(--bg)] py-28 sm:py-36 lg:py-56">
            <motion.span
                aria-hidden
                className="services-transition__grid grid-bg pointer-events-none absolute inset-x-0 -top-24 -bottom-24"
                {...motionProps({ y: gridY })}
            />
            <motion.span
                aria-hidden
                className="services-transition__glow services-transition__glow--purple pointer-events-none absolute"
                {...motionProps({ y: glowY, opacity: glowFade })}
            />
            <motion.span
                aria-hidden
                className="services-transition__glow services-transition__glow--cyan pointer-events-none absolute"
                {...motionProps({ y: counterGlowY, opacity: glowFade })}
            />

            <div className="container-x relative flex flex-col items-center text-center">
                <div className="flex justify-center">
                    <SectionLabel index="03" name="WHERE TO NEXT" />
                </div>

                <motion.div
                    className="services-transition__head mt-9 w-full"
                    {...motionProps(headStyle)}
                >
                    <RevealText
                        as="h2"
                        className="display-xl uppercase text-[var(--ink-strong)]"
                        lines={['Go deeper', 'into the work.']}
                        lineClassName="services-transition__line"
                        duration={0.82}
                        stagger={0.12}
                    />
                </motion.div>

                <motion.span
                    aria-hidden
                    className="services-transition__rule mt-12 h-px w-40 origin-center rounded-full sm:w-56"
                    {...motionProps({ scaleX: ruleScale })}
                />

                <motion.p
                    className="mt-12 max-w-[18rem] text-[15px] leading-relaxed text-[var(--mute)] sm:max-w-xl sm:text-[17px]"
                    {...motionProps({ y: copyY })}
                >
                    Two disciplines, two dedicated worlds. See how the strategy, the craft and the
                    decisions behind each one actually come together — then bring us the thing you
                    are trying to build.
                </motion.p>

                <motion.div
                    className="mt-11 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
                    {...motionProps({ y: ctaY })}
                >
                    <div className="services-transition__cta relative">
                        <span className="services-transition__halo" aria-hidden />
                        <MagneticButton>
                            <GradientButton href="/services/branding">Explore Branding</GradientButton>
                        </MagneticButton>
                    </div>
                    <GradientButton href="/services/ui-ux" variant="ghost">Explore UI/UX</GradientButton>
                </motion.div>
            </div>
        </section>
    );
}
