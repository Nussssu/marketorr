import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Seconds for one full loop of the column. Mobile runs slower and flatter. */
const RICH_SECONDS = 28;
const LIGHT_SECONDS = 36;
const RICH_QUERY = '(min-width: 768px)';

/** Peak depth (px) of the gentle translateZ wave running down the column. */
const DEPTH = 26;

/**
 * Vertical, continuously upward-scrolling showcase of one category's
 * sub-services, sitting beside that category's gateway card. Each tile pairs
 * the sub-service image with its name.
 *
 * The loop is seamless because the list is rendered twice and the track
 * travels exactly -50%: the end frame is pixel-identical to the start. Each
 * card mounts its own instance, so the two columns run independently.
 *
 * The travel is a CSS animation rather than a JS one. This is the only
 * genuinely continuous effect on the page, so it belongs on the compositor —
 * and `animation-play-state` then lets it be parked for free whenever the card
 * is off screen or the tab is in the background, instead of burning frames.
 *
 * The moving track is absolutely positioned so its full length never sets the
 * card's height — the strip only ever fills the height the card already has.
 *
 * Desktop adds a subtle 3D stage — a slight tilt plus a translateZ wave keyed
 * to each tile's position — while phones get the same upward cycle flat, and
 * reduced motion renders a static stack. Purely decorative: the whole column
 * is `pointer-events-none` and `aria-hidden`, so it never intercepts a tap or
 * affects navigation.
 *
 * @param {{
 *   category: { name: string, items: Array<{ slug: string, name: string, image: string, accent: string }> },
 *   mirrored?: boolean,
 * }} props
 *   `mirrored` tilts the stage the other way so the two cards don't read as
 *   copies of each other.
 */
export default function ServiceImageStack({ category, mirrored = false }) {
    const reduce = useReducedMotion();
    const boxRef = useRef(null);
    const [rich, setRich] = useState(false);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        const query = window.matchMedia(RICH_QUERY);
        const update = () => setRich(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    // Only animate while the card is actually on screen and the tab is visible.
    useEffect(() => {
        const box = boxRef.current;
        if (!box || typeof IntersectionObserver === 'undefined') return undefined;

        let onScreen = false;
        const sync = () => setRunning(onScreen && !document.hidden);
        const io = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
        }, { rootMargin: '10% 0px' });
        io.observe(box);
        document.addEventListener('visibilitychange', sync);

        return () => {
            io.disconnect();
            document.removeEventListener('visibilitychange', sync);
        };
    }, []);

    const items = category.items ?? [];
    if (items.length === 0) return null;

    const full = rich && !reduce;
    const tilt = mirrored ? 9 : -9;
    const loop = items.concat(items);

    return (
        <div
            ref={boxRef}
            className="service-stack pointer-events-none relative w-[76px] shrink-0 self-stretch overflow-hidden sm:w-[104px] lg:w-[96px] xl:w-[130px]"
            style={full ? { perspective: '900px' } : undefined}
            aria-hidden
        >
            <div
                className="absolute inset-x-0 top-0"
                style={full ? { transformStyle: 'preserve-3d', transform: `rotateY(${tilt}deg) rotateX(3deg)` } : undefined}
            >
                <div
                    className={`flex flex-col gap-3 ${reduce ? '' : 'service-stack__track'}`}
                    style={
                        reduce
                            ? undefined
                            : {
                                animationDuration: `${full ? RICH_SECONDS : LIGHT_SECONDS}s`,
                                animationPlayState: running ? 'running' : 'paused',
                            }
                    }
                >
                    {loop.map((item, i) => {
                        const depth = full ? Math.cos(((i % items.length) / items.length) * Math.PI * 2) * DEPTH : 0;

                        return (
                            <figure
                                key={`${item.slug}-${i}`}
                                className="service-stack__card relative aspect-[4/5] shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
                                style={{ transform: full ? `translateZ(${depth}px)` : undefined }}
                            >
                                <img
                                    src={item.image}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{ background: 'linear-gradient(180deg, transparent 38%, #05060Adb 100%)' }}
                                />
                                <figcaption className="absolute inset-x-0 bottom-0 p-2 text-[8px] font-bold uppercase leading-tight tracking-[0.12em] text-white/85 sm:p-2.5 sm:text-[9px]">
                                    {item.name}
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>
            </div>
            <div className="service-stack__fade absolute inset-0" />
        </div>
    );
}
