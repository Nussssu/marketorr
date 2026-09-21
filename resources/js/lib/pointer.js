import { useCallback, useEffect, useRef } from 'react';

/**
 * Pointer tracking that costs one layout read per entry and one write per
 * frame.
 *
 * A pointer can fire far more often than the screen refreshes — high-polling
 * mice and coalesced events routinely deliver several moves per frame — so
 * anything done straight inside a move handler runs several times for a single
 * painted result. Measuring the element there is worse again: reading a box
 * mid-event forces the browser to flush layout, so the reads and the writes
 * end up interleaved.
 *
 * These handlers measure the element once when the pointer arrives, keep the
 * latest position, and hand it to `apply` from a single animation frame.
 *
 * `apply` receives the position as fractions of the element's own box, where
 * (0, 0) is its top-left corner and (1, 1) its bottom-right.
 *
 * @param {(fx: number, fy: number) => void} apply
 * @param {{enabled?: boolean, mouseOnly?: boolean}} [options]
 * @return {{onPointerEnter: (event: PointerEvent) => void, onPointerMove: (event: PointerEvent) => void, onPointerLeave: (event: PointerEvent) => void}}
 */
export function useBoxPointer(apply, { enabled = true, mouseOnly = true } = {}) {
    const box = useRef(null);
    const next = useRef({ x: 0, y: 0 });
    const frame = useRef(0);
    const applyRef = useRef(apply);

    useEffect(() => {
        applyRef.current = apply;
    }, [apply]);

    useEffect(() => () => cancelAnimationFrame(frame.current), []);

    const measure = useCallback((event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        box.current = rect.width && rect.height ? rect : null;
    }, []);

    const onPointerEnter = useCallback((event) => {
        if (!enabled) return;
        if (mouseOnly && event.pointerType !== 'mouse') return;

        measure(event);
    }, [enabled, mouseOnly, measure]);

    const onPointerMove = useCallback((event) => {
        if (!enabled) return;
        if (mouseOnly && event.pointerType !== 'mouse') return;

        // The pointer can arrive without an enter event (entering during a
        // scroll, or a re-render under a resting cursor), so measure lazily.
        if (!box.current) {
            measure(event);
            if (!box.current) return;
        }

        const rect = box.current;
        next.current = {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
        };

        if (frame.current) return;

        frame.current = requestAnimationFrame(() => {
            frame.current = 0;
            applyRef.current(next.current.x, next.current.y);
        });
    }, [enabled, mouseOnly, measure]);

    const onPointerLeave = useCallback(() => {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        // The box is only valid while the pointer is inside: the page may have
        // scrolled or reflowed before it comes back.
        box.current = null;
    }, []);

    return { onPointerEnter, onPointerMove, onPointerLeave };
}

/**
 * A media query evaluated once and shared, rather than re-created per event.
 *
 * `window.matchMedia` allocates a new MediaQueryList on every call, so asking
 * it inside a pointer handler allocates on every move.
 *
 * @param {string} query
 * @return {boolean}
 */
const queryCache = new Map();

export function matchesCached(query) {
    let mql = queryCache.get(query);

    if (!mql) {
        mql = window.matchMedia(query);
        queryCache.set(query, mql);
    }

    return mql.matches;
}
