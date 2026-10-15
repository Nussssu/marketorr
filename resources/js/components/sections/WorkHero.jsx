import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import CharukothonCover, { isCharukothon } from '../media/CharukothonCover';
import { projectHeroMedia } from '../../lib/projectHeroMedia';
import { EASE, enter, heroMediaEntrance } from '../../lib/motion';

/**
 * The frame's stand-in for a project whose visuals are not uploaded yet: a
 * branded panel carrying the project's name, rather than the grey plate, so
 * the first thing on the page still looks finished.
 *
 * @param {{ title: string }} props
 */
function AwaitingVisuals({ title }) {
    return (
        <div
            className="absolute inset-0 overflow-hidden"
            role="img"
            aria-label={`${title} - visuals coming soon`}
            style={{ background: 'radial-gradient(120% 90% at 85% 15%, rgba(80, 122, 244, 0.28), transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(137, 31, 251, 0.3), transparent 60%), var(--bg-soft)' }}
        >
            <div className="grid-bg absolute inset-0" aria-hidden />
            <span
                className="absolute inset-x-[6%] bottom-[8%] font-display font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-transparent"
                style={{ fontSize: '9cqw', WebkitTextStroke: '1px var(--field-line)' }}
                aria-hidden
            >
                {title}
            </span>
            <span className="absolute left-[6%] top-[9%] rounded-full border border-[var(--field-line)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]" aria-hidden>
                Visuals coming soon
            </span>
        </div>
    );
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
    const reveal = heroMediaEntrance(reduce);

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
                    {project.image && (
                        <img
                            src={project.image}
                            alt=""
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            draggable={false}
                            aria-hidden
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    )}
                    {/* Scaled to cover the frame: the player keeps the film's own
                        ratio, so it is sized off whichever frame edge binds. */}
                    <motion.iframe
                        src={`https://player.vimeo.com/video/${media.id}?background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1${media.hash ? `&h=${media.hash}` : ''}`}
                        title={media.title}
                        allow="autoplay; fullscreen"
                        frameBorder="0"
                        tabIndex={-1}
                        aria-hidden
                        onLoad={() => setReady(true)}
                        initial={false}
                        animate={{ opacity: ready ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : 0.2, ease: [...EASE] }}
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            width: '100cqw',
                            height: `${100 / media.ratio}cqw`,
                            minHeight: '100cqh',
                            minWidth: `${100 * media.ratio}cqh`,
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
                    className={`h-full w-full ${media.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                />
            </motion.div>
        );
    }

    if (!project.image) {
        return <AwaitingVisuals title={project.title} />;
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
                    className="pointer-events-none absolute h-px w-px opacity-0"
                    aria-hidden
                />
                <CharukothonCover image={project.image} />
            </motion.div>
        );
    }

    // Grid copies are offered alongside the cover so a phone downloads one
    // sized to the frame (about the full content width) rather than the
    // full-resolution file.
    const candidates = [
        project.thumbSmall && project.thumbSmall !== project.image && `${project.thumbSmall} 480w`,
        project.thumb && project.thumb !== project.image && `${project.thumb} 900w`,
        project.thumb && project.thumb !== project.image && `${project.image} 1800w`,
    ].filter(Boolean);

    return (
        <motion.img
            src={project.image}
            srcSet={candidates.length ? candidates.join(', ') : undefined}
            sizes={candidates.length ? '(max-width: 1520px) 94vw, 1430px' : undefined}
            alt={project.imageAlt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            draggable={false}
            {...reveal}
            className="h-full w-full object-cover"
        />
    );
}

/**
 * Hero for every dedicated project page: a framed showcase.
 *
 * The project's name opens the page, and the work itself sits beneath it in a
 * large rounded frame — shown clean, with nothing laid over it — rising into
 * place like a board being presented. The client, category and year are left
 * to the details column below, so the hero carries only the name.
 *
 * Nothing moves on scroll; the only motion is the entrance (the title's
 * per-character rise and the frame lifting in), and reduced motion renders it
 * settled.
 *
 * @param {{ project: { slug: string, title: string, image: string, imageAlt: string, workGroupHeading?: string } }} props
 */
export default function WorkHero({ project }) {
    const reduce = useReducedMotion();

    const words = project.title.toUpperCase().split(' ');
    let charIndex = 0;

    return (
        <section className="relative overflow-hidden bg-[var(--bg)] pt-28 md:pt-36">
            <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[70svh]" aria-hidden />

            <div className="container-x relative">
                {project.workGroupHeading && (
                    <span {...enter('fade-up', { dur: 0.7, delay: 0.2, y: 10, className: 'mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--ink-faint)]' })}>
                        {project.workGroupHeading}
                    </span>
                )}
                <h1
                    className="heading-hero-size max-w-6xl font-display font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-[var(--ink-strong)]"
                    aria-label={project.title}
                >
                    {words.map((word, wordIndex) => (
                        <span key={wordIndex} className="mr-[0.24em] inline-block whitespace-nowrap last:mr-0" aria-hidden>
                            {word.split('').map((char) => {
                                const index = charIndex++;

                                return (
                                    <span key={index} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                                        <span {...enter('mask-up', { dur: 1, delay: 0.3 + Math.min(index, 14) * 0.045, y: '115%', className: 'inline-block will-change-transform' })}>
                                            {char}
                                        </span>
                                    </span>
                                );
                            })}
                        </span>
                    ))}
                </h1>

                <div
                    {...enter('lift', {
                        dur: 1.1,
                        delay: 0.55,
                        y: 72,
                        scale: 0.95,
                        className: 'relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] sm:aspect-[16/9] md:mt-14 md:rounded-[32px]',
                        style: { containerType: 'size' },
                    })}
                >
                    <HeroMedia key={project.slug} project={project} reduce={reduce} />
                </div>
            </div>
        </section>
    );
}
