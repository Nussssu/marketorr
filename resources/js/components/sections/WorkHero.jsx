import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import CharukothonCover, { isCharukothon } from '../media/CharukothonCover';
import { projectHeroMedia } from '../../lib/projectHeroMedia';
import MediaPlaceholder from '../media/MediaPlaceholder';
import { EASE } from '../../lib/motion';

/** Rich scene only on pointer-fine tablet/desktop; phones get reduced travel. */
function useRichScene() {
    const [rich, setRich] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 768px) and (pointer: fine)');
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return rich;
}

/**
 * What fills the hero's back plane.
 *
 * In order: a slug-specific hero asset (an animated render, or the project's
 * own film embedded from Vimeo), then the Charukothon brand composite, then
 * the project's cover photograph, then a placeholder.
 *
 * Reduced motion falls all the way back to the still cover — an animated GIF
 * cannot be paused and an autoplaying film should not be forced on a reader
 * who asked for stillness.
 *
 * @param {{ project: object, reduce: boolean }} props
 */
function HeroMedia({ project, reduce }) {
    const media = projectHeroMedia(project.slug);
    const [ready, setReady] = useState(false);
    const reveal = {
        initial: false,
        animate: ready
            ? { scale: reduce ? 1 : 1.12, opacity: 1 }
            : { scale: reduce ? 1 : 1.3, opacity: 0 },
        transition: { duration: reduce ? 0 : 1.8, ease: [...EASE] },
    };

    const revealDecodedImage = (event) => {
        const image = event.currentTarget;

        if (typeof image.decode !== 'function') {
            setReady(true);

            return;
        }

        image.decode().catch(() => undefined).then(() => setReady(true));
    };

    if (media && !reduce) {
        if (media.kind === 'video') {
            return (
                <motion.div
                    {...reveal}
                    className="absolute inset-0 overflow-hidden"
                    style={{ background: media.background ?? '#000' }}
                >
                    {/* Self-hosted and decorative: muted so it may autoplay, looped
                        so it never ends on a dead frame, and posted with the still
                        cover so the stage is never empty while it buffers. */}
                    <video
                        src={media.src}
                        poster={media.poster ?? project.image ?? undefined}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        tabIndex={-1}
                        aria-hidden
                        onLoadedData={() => setReady(true)}
                        className={`h-full w-full ${media.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                    />
                </motion.div>
            );
        }

        if (media.kind === 'vimeo') {
            return (
                <motion.div
                    {...reveal}
                    className="absolute inset-0 overflow-hidden"
                    style={{ background: media.background ?? '#000' }}
                >
                    {/* Scaled to cover the stage: the player keeps the film's own
                        ratio, so it is sized off whichever viewport edge binds. */}
                    <iframe
                        src={`https://player.vimeo.com/video/${media.id}?background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1${media.hash ? `&h=${media.hash}` : ''}`}
                        title={media.title}
                        allow="autoplay; fullscreen"
                        frameBorder="0"
                        tabIndex={-1}
                        aria-hidden
                        onLoad={() => setReady(true)}
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            width: '100vw',
                            height: `${100 / media.ratio}vw`,
                            minHeight: '100svh',
                            minWidth: `${100 * media.ratio}svh`,
                        }}
                    />
                </motion.div>
            );
        }

        return (
            <motion.div
                {...reveal}
                className="absolute inset-0"
                style={{ background: media.background ?? '#000' }}
            >
                <img
                    src={media.src}
                    alt={media.alt}
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    onLoad={revealDecodedImage}
                    className={`h-full w-full ${media.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                />
            </motion.div>
        );
    }

    if (!project.image) {
        return <MediaPlaceholder label={`${project.title} - hero image placeholder`} />;
    }

    if (isCharukothon(project.slug)) {
        return (
            <motion.div {...reveal} className="absolute inset-0" style={{ containerType: 'inline-size' }}>
                <img
                    src={project.image}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onLoad={revealDecodedImage}
                    className="pointer-events-none absolute h-px w-px opacity-0"
                    aria-hidden
                />
                <CharukothonCover image={project.image} />
            </motion.div>
        );
    }

    return (
        <motion.img
            src={project.image}
            alt={project.imageAlt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            draggable={false}
            onLoad={revealDecodedImage}
            {...reveal}
            className="h-full w-full object-cover"
        />
    );
}

/**
 * Cinematic hero for every dedicated project page.
 *
 * Deliberately the same scene as `SubServiceHero`: one large visual with an
 * oversized title layered over it, split across depth planes, each travelling
 * on scroll at its own speed while the stage compresses and hands off to the
 * section below. Timings, easing, plane transforms and the per-character title
 * rise are all matched to that hero so opening a project and opening a
 * sub-service feel identical.
 *
 * The one difference is what the hero carries: only the project name sits over
 * the visual — no breadcrumb, no standfirst, no metric — so the work reads
 * first and the page stays clean.
 *
 * Motion is transform/scale/opacity only, and nothing here reacts to the
 * pointer; depth is scroll-driven only.
 *
 * @param {{ project: { slug: string, title: string, image: string, imageAlt: string } }} props
 */
export default function WorkHero({ project }) {
    const wrapRef = useRef(null);
    const reduce = useReducedMotion();
    const rich = useRichScene();
    const full = rich && !reduce;

    const words = project.title.toUpperCase().split(' ');
    let charIndex = 0;

    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

    const stageScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.93 : 0.97]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, full ? 1.14 : 1.06]);
    const bgShiftY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
    const titleShiftY = useTransform(scrollYProgress, [0, 1], ['0%', full ? '-38%' : '-16%']);
    const titleScale = useTransform(scrollYProgress, [0, 1], [1, full ? 0.9 : 0.96]);
    const titleFade = useTransform(scrollYProgress, [0.35, 0.8], [1, 0]);

    return (
        <div ref={wrapRef} className="relative" style={{ height: full ? '175svh' : '150svh' }}>
            <div className="sticky top-0 h-svh overflow-hidden bg-[#06060a]">
                {/* compress on scroll */}
                <motion.div style={reduce ? undefined : { scale: stageScale }} className="absolute inset-0">
                    {/* PLANE 1 — the work itself */}
                    <motion.div style={reduce ? undefined : { y: bgShiftY, scale: bgScale }} className="absolute inset-0">
                        <HeroMedia key={project.slug} project={project} reduce={reduce} />
                    </motion.div>

                    {/* Depth stage — keeps its perspective, never tilts. */}
                    <motion.div
                        style={full ? { transformStyle: 'preserve-3d', perspective: 1200 } : undefined}
                        className="absolute inset-0"
                    >
                        {/* PLANE 2 — the work's name, and nothing else */}
                        <motion.div
                            style={reduce ? undefined : { y: titleShiftY, scale: titleScale, opacity: titleFade }}
                            className="absolute inset-0 flex items-center"
                        >
                            <motion.div style={full ? { z: 90 } : undefined} className="container-x w-full">
                                {project.workGroupHeading && (
                                    <motion.span
                                        initial={reduce ? false : { opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: reduce ? 0 : 0.7, delay: 0.25, ease: [...EASE] }}
                                        className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-white/70"
                                    >
                                        <span className="h-px w-8 bg-white/40" aria-hidden />
                                        {project.workGroupHeading}
                                    </motion.span>
                                )}
                                <h1
                                    className="max-w-6xl font-display font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-white"
                                    style={{ fontSize: 'clamp(2.6rem, 10vw, 8.5rem)' }}
                                    aria-label={project.title}
                                >
                                    {words.map((word, w) => (
                                        <span key={w} className="mr-[0.24em] inline-block whitespace-nowrap last:mr-0" aria-hidden={w > 0}>
                                            {word.split('').map((char) => {
                                                const i = charIndex++;

                                                return (
                                                    <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                                                        <motion.span
                                                            className="inline-block will-change-transform"
                                                            initial={reduce ? false : { y: '115%' }}
                                                            animate={{ y: '0%' }}
                                                            transition={{ duration: reduce ? 0 : 1, delay: 0.35 + Math.min(i, 14) * 0.045, ease: [...EASE] }}
                                                        >
                                                            {char}
                                                        </motion.span>
                                                    </span>
                                                );
                                            })}
                                        </span>
                                    ))}
                                </h1>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
