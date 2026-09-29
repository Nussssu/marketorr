import { gsap } from 'gsap';
import { useEffect, useLayoutEffect, useRef } from 'react';

/** Horizontal travel (px) that turns a touch drag into previous/next. */
const SWIPE_DISTANCE = 56;

/** Zoom range, as a multiple of the fitted width. */
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/** How far one press of + or − zooms. */
const ZOOM_STEP = 1.25;

/**
 * A larger, in-page view of one printed screen.
 *
 * Full-page designs are usually far taller than the viewport, so the screen is
 * shown at a readable width and scrolls inside the viewer. Arrow keys, the
 * side buttons and a horizontal swipe move through every screen in order;
 * Escape, the close button or the backdrop return to the showcase exactly
 * where the reader left it, since the page itself never moves.
 *
 * The screen zooms from its fitted width up to 4×: the −/+ buttons, the
 * +/−/0 keys, Ctrl/⌘ + wheel (a trackpad pinch arrives as this), a touch
 * pinch or a double-click. Zoom keeps the point under the pointer still;
 * once zoomed, the viewer scrolls both ways and a mouse drag pans.
 *
 * @param {{
 *   screens: Array<{ src: string, width: number, height: number, alt: string, label?: string, projectName: string, screenNumber: number, screenTotal: number }>,
 *   index: number|null,
 *   originRect: DOMRect|null,
 *   onChange: (index: number) => void,
 *   onClose: () => void,
 * }} props
 */
export default function ScreenLightbox({ screens, index, originRect, onChange, onClose }) {
    const open = index !== null && screens[index] !== undefined;
    const rootRef = useRef(null);
    const panelRef = useRef(null);
    const scrollerRef = useRef(null);
    const closeRef = useRef(null);
    const touch = useRef(null);
    const returnFocus = useRef(null);
    const imageRef = useRef(null);
    const zoomLabelRef = useRef(null);
    const zoom = useRef(MIN_ZOOM);
    const pointers = useRef(new Map());
    const pointerStarts = useRef(new Map());
    const pinch = useRef(null);
    const pan = useRef(null);
    const gestureWasPinch = useRef(false);
    const lastTap = useRef(null);
    const closing = useRef(false);

    /**
     * Set the zoom, keeping the point (ax, ay) — relative to the scroller's
     * visible box — over the same spot of the design.
     */
    const zoomTo = (target, ax, ay) => {
        const scroller = scrollerRef.current;
        const image = imageRef.current;
        if (!scroller || !image) return;
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, target));
        const anchorX = ax ?? scroller.clientWidth / 2;
        const anchorY = ay ?? scroller.clientHeight / 2;
        const ratio = next / zoom.current;
        const left = (scroller.scrollLeft + anchorX) * ratio - anchorX;
        const top = (scroller.scrollTop + anchorY) * ratio - anchorY;

        zoom.current = next;
        image.style.width = `${next * 100}%`;
        scroller.classList.toggle('is-zoomed', next > MIN_ZOOM);
        scroller.scrollLeft = left;
        scroller.scrollTop = top;
        if (zoomLabelRef.current) zoomLabelRef.current.textContent = `${Math.round(next * 100)}%`;
    };

    const resetZoom = () => zoomTo(MIN_ZOOM);

    const screen = open ? screens[index] : null;
    const go = (step) => {
        if (!open) return;
        onChange((index + step + screens.length) % screens.length);
    };

    const requestClose = () => {
        if (closing.current) return;
        closing.current = true;

        const root = rootRef.current;
        const panel = panelRef.current;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!root || reduce) {
            onClose();

            return;
        }

        const timeline = gsap.timeline({ onComplete: onClose });
        timeline.to(panel, { y: 4, scale: 0.99, duration: 0.16, ease: 'power2.in' }, 0);
        timeline.to(root, { autoAlpha: 0, duration: 0.16, ease: 'power2.in' }, 0);
    };

    useEffect(() => {
        if (!open) return undefined;

        closing.current = false;
        returnFocus.current = document.activeElement;
        closeRef.current?.focus({ preventScroll: true });

        const lenis = window.__lenis;
        lenis?.stop();
        const { overflow } = document.documentElement.style;
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = overflow;
            lenis?.start();
            returnFocus.current?.focus?.({ preventScroll: true });
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                requestClose();
            } else if (event.key === '+' || event.key === '=') {
                event.preventDefault();
                zoomTo(zoom.current * ZOOM_STEP);
            } else if (event.key === '-' || event.key === '_') {
                event.preventDefault();
                zoomTo(zoom.current / ZOOM_STEP);
            } else if (event.key === '0') {
                event.preventDefault();
                resetZoom();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                go(1);
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                go(-1);
            } else if (event.key === 'Tab') {
                const focusable = rootRef.current?.querySelectorAll('button');
                if (!focusable?.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    });

    // Open from the clicked sheet: the panel starts over the sheet's own box
    // and grows into place, so the screen visibly lifts out of the composition.
    // Only the opening frame animates; paging between screens swaps in place.
    useLayoutEffect(() => {
        if (!open || !rootRef.current) return undefined;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const panel = panelRef.current;
        const tweens = [gsap.fromTo(rootRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.25, ease: 'power2.out' })];

        if (!reduce && originRect && panel) {
            const box = panel.getBoundingClientRect();
            tweens.push(
                gsap.fromTo(
                    panel,
                    {
                        x: originRect.left + originRect.width / 2 - (box.left + box.width / 2),
                        y: originRect.top + originRect.height / 2 - (box.top + box.height / 2),
                        scale: Math.max(0.2, Math.min(1, originRect.width / box.width)),
                        transformOrigin: '50% 50%',
                    },
                    { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform' },
                ),
            );
        }

        return () => tweens.forEach((tween) => tween.kill());
    }, [open]);

    // Each screen opens at the fitted width, from the top, with its thumbnail
    // retained underneath until the full export has decoded.
    useLayoutEffect(() => {
        zoom.current = MIN_ZOOM;
        if (imageRef.current) imageRef.current.style.width = '100%';
        const scroller = scrollerRef.current;
        scroller?.classList.remove('is-zoomed', 'is-loaded');
        scroller?.scrollTo({ top: 0, left: 0 });
        if (zoomLabelRef.current) zoomLabelRef.current.textContent = '100%';
        if (!scroller) return undefined;

        const tween = gsap.fromTo(scroller, { autoAlpha: 0.72, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' });

        return () => tween.kill();
    }, [index]);

    // Ctrl/⌘ + wheel zooms (a trackpad pinch arrives as this); a plain wheel scrolls.
    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!open || !scroller) return undefined;

        const onWheel = (event) => {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            const box = scroller.getBoundingClientRect();
            const unit = event.deltaMode === 1 ? 16 : 1;
            zoomTo(zoom.current * Math.exp(-event.deltaY * unit * 0.0025), event.clientX - box.left, event.clientY - box.top);
        };
        scroller.addEventListener('wheel', onWheel, { passive: false });

        return () => scroller.removeEventListener('wheel', onWheel);
    }, [open]);

    const scrollerPoint = (event) => {
        const box = scrollerRef.current.getBoundingClientRect();

        return [event.clientX - box.left, event.clientY - box.top];
    };

    const onScrollerPointerDown = (event) => {
        const point = scrollerPoint(event);
        pointers.current.set(event.pointerId, point);
        pointerStarts.current.set(event.pointerId, point);
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = { distance: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, zoom: zoom.current };
            gestureWasPinch.current = true;
            pan.current = null;
        } else if (event.pointerType === 'mouse' && event.button === 0 && zoom.current > MIN_ZOOM) {
            const scroller = scrollerRef.current;
            pan.current = { x: event.clientX, y: event.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
            scroller.setPointerCapture?.(event.pointerId);
            scroller.classList.add('is-panning');
        }
    };

    const onScrollerPointerMove = (event) => {
        if (!pointers.current.has(event.pointerId)) return;
        pointers.current.set(event.pointerId, scrollerPoint(event));

        if (pinch.current && pointers.current.size >= 2) {
            const [a, b] = [...pointers.current.values()];
            const distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
            zoomTo(pinch.current.zoom * (distance / pinch.current.distance), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        } else if (pan.current) {
            const scroller = scrollerRef.current;
            scroller.scrollLeft = pan.current.left - (event.clientX - pan.current.x);
            scroller.scrollTop = pan.current.top - (event.clientY - pan.current.y);
        }
    };

    const onScrollerPointerUp = (event) => {
        const start = pointerStarts.current.get(event.pointerId);
        const point = scrollerPoint(event);
        const singleTouch = event.pointerType === 'touch' && pointers.current.size === 1 && !gestureWasPinch.current;
        pointers.current.delete(event.pointerId);
        pointerStarts.current.delete(event.pointerId);
        if (pointers.current.size < 2) pinch.current = null;
        if (pan.current) {
            pan.current = null;
            scrollerRef.current?.classList.remove('is-panning');
        }

        if (singleTouch && start && Math.hypot(point[0] - start[0], point[1] - start[1]) < 12) {
            const now = performance.now();
            const previous = lastTap.current;
            if (previous && now - previous.time < 300 && Math.hypot(point[0] - previous.x, point[1] - previous.y) < 32) {
                zoomTo(zoom.current > MIN_ZOOM ? MIN_ZOOM : 2, point[0], point[1]);
                lastTap.current = null;
            } else {
                lastTap.current = { time: now, x: point[0], y: point[1] };
            }
        }
    };

    const onScrollerDoubleClick = (event) => {
        const [x, y] = scrollerPoint(event);
        zoomTo(zoom.current > MIN_ZOOM ? MIN_ZOOM : 2, x, y);
    };

    if (!open) return null;

    return (
        <div
            ref={rootRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${screen.projectName}, screen ${screen.screenNumber} of ${screen.screenTotal}`}
            className="uiux-lightbox"
            onPointerDown={(event) => {
                if (event.pointerType === 'touch' && !touch.current) {
                    touch.current = { x: event.clientX, y: event.clientY };
                } else if (event.pointerType !== 'touch') {
                    touch.current = null;
                }
            }}
            onPointerUp={(event) => {
                const start = touch.current;
                touch.current = null;
                // A zoomed screen or a pinch is moving the design, not paging.
                if (gestureWasPinch.current) {
                    gestureWasPinch.current = false;

                    return;
                }
                if (!start || zoom.current > MIN_ZOOM || pointers.current.size > 0) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
            }}
        >
            <button type="button" className="uiux-lightbox__backdrop" aria-label="Close" tabIndex={-1} onClick={requestClose} />

            <div className="uiux-lightbox__bar">
                <p className="uiux-lightbox__title min-w-0 truncate">
                    <span className="font-display font-bold text-[var(--ink-strong)]">{screen.projectName}</span>
                    <span className="ml-3 text-[var(--ink-faint)]">
                        {String(screen.screenNumber).padStart(2, '0')} / {String(screen.screenTotal).padStart(2, '0')}
                    </span>
                </p>
                <div className="uiux-lightbox__controls flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => zoomTo(zoom.current / ZOOM_STEP)} className="uiux-lightbox__btn" aria-label="Zoom out">
                        <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M5 12h14" />
                        </svg>
                    </button>
                    <button type="button" onClick={resetZoom} className="uiux-lightbox__zoom" aria-label="Reset zoom" title="Reset zoom">
                        <span ref={zoomLabelRef}>100%</span>
                    </button>
                    <button type="button" onClick={() => zoomTo(zoom.current * ZOOM_STEP)} className="uiux-lightbox__btn" aria-label="Zoom in">
                        <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>
                    <button ref={closeRef} type="button" onClick={requestClose} className="uiux-lightbox__btn" aria-label="Close larger view">
                        <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
            </div>

            <div ref={panelRef} className="uiux-lightbox__panel">
                <div
                    ref={scrollerRef}
                    className="uiux-lightbox__scroller"
                    style={{ backgroundImage: screen.thumb ? `url(${screen.thumb})` : undefined }}
                    data-lenis-prevent
                    onPointerDown={onScrollerPointerDown}
                    onPointerMove={onScrollerPointerMove}
                    onPointerUp={onScrollerPointerUp}
                    onPointerCancel={onScrollerPointerUp}
                    onDoubleClick={onScrollerDoubleClick}
                >
                    <img
                        key={screen.src}
                        ref={imageRef}
                        src={screen.src}
                        alt={screen.alt}
                        width={screen.width}
                        height={screen.height}
                        decoding="async"
                        fetchPriority="high"
                        draggable={false}
                        className="uiux-lightbox__image"
                        onLoad={() => scrollerRef.current?.classList.add('is-loaded')}
                    />
                </div>
            </div>

            {screens.length > 1 && (
                <>
                    <button type="button" onClick={() => go(-1)} className="uiux-lightbox__btn uiux-lightbox__nav uiux-lightbox__nav--prev" aria-label="Previous screen">
                        <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M15 5l-7 7 7 7" />
                        </svg>
                    </button>
                    <button type="button" onClick={() => go(1)} className="uiux-lightbox__btn uiux-lightbox__nav uiux-lightbox__nav--next" aria-label="Next screen">
                        <svg viewBox="0 0 24 24" aria-hidden>
                            <path d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}
