import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { projectMotion } from '../../lib/projectMotion';

/**
 * The moving version of a project cover, laid over the static one.
 *
 * It is deliberately additive: the card keeps its own `<img>` underneath and
 * this only fades in on top once the file has actually decoded, so the cover
 * is never blank, never pops, and a project with no motion entry renders
 * nothing at all here.
 *
 * Three things keep it cheap:
 *
 * - Nothing is requested until the card is near the viewport. The file is
 *   heavier than a cover photograph and a reader who never scrolls that far
 *   never pays for it.
 * - Once mounted it stays mounted, so scrolling back up does not re-fetch or
 *   restart it.
 * - Under `prefers-reduced-motion` it is never loaded at all. An animated GIF
 *   cannot be paused, so the only honest way to respect that setting is to
 *   leave the still cover in place.
 *
 * @param {{ slug?: string, className?: string, rounded?: string }} props
 */
export default function ProjectMotion({ slug, className = '' }) {
    const motionAsset = projectMotion(slug);
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const near = useInView(ref, { once: true, margin: '25% 0px' });
    const [loaded, setLoaded] = useState(false);
    // These files are heavy - the kind of weight that is fine on a desktop
    // connection and indefensible on a phone, where it would be the largest
    // download on the page for a decorative layer. Narrow screens keep the
    // still cover underneath instead.
    const [wideEnough, setWideEnough] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const update = () => setWideEnough(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    // A cached file can finish before React attaches onLoad, which would
    // otherwise leave it invisible forever.
    useEffect(() => {
        const node = ref.current?.querySelector('img');
        if (node?.complete && node.naturalWidth > 0) setLoaded(true);
    }, [near]);

    if (!motionAsset) {
        return null;
    }

    return (
        <span
            ref={ref}
            aria-hidden
            className={`pointer-events-none absolute inset-0 block transition-opacity duration-700 ease-out ${className}`}
            style={{
                opacity: loaded && !reduce && wideEnough ? 1 : 0,
                background: loaded && !reduce && wideEnough ? (motionAsset.background ?? '#000') : 'transparent',
            }}
        >
            {near && !reduce && wideEnough && (
                <img
                    src={motionAsset.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    // Decorative: never let it compete with real content for
                    // bandwidth on a page that is still painting.
                    fetchPriority="low"
                    draggable={false}
                    onLoad={() => setLoaded(true)}
                    className={`h-full w-full ${motionAsset.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                />
            )}
        </span>
    );
}
