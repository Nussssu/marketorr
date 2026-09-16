import { useRef } from 'react';

/** Pointer travel (px) beyond which a press is treated as a scroll/drag, not a tap. */
const TAP_SLOP = 10;

/**
 * Guards a link against accidental activation. A touch that starts on the link
 * and then drags (the browser still fires `click` at the end of some scroll
 * gestures on Android) is swallowed, so navigation only happens on a real tap
 * or click. Keyboard activation fires no pointer event and always passes.
 *
 * @return {{onPointerDown: (event: PointerEvent) => void, onPointerMove: (event: PointerEvent) => void, onPointerCancel: () => void, onClick: (event: MouseEvent) => void}}
 */
export function useTapIntent() {
    const origin = useRef(null);

    return {
        onPointerDown: (event) => {
            origin.current = {
                pointerId: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                moved: false,
                cancelled: false,
            };
        },
        onPointerMove: (event) => {
            const start = origin.current;
            if (!start || start.pointerId !== event.pointerId || start.moved) return;

            if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) {
                start.moved = true;
            }
        },
        onPointerCancel: () => {
            if (origin.current) origin.current.cancelled = true;
        },
        onClick: (event) => {
            // Keyboard activation has no pointer gesture and remains valid.
            if (event.detail === 0) {
                origin.current = null;

                return;
            }

            const start = origin.current;
            origin.current = null;

            if (!start) {
                return;
            }

            if (
                start.cancelled
                || start.moved
                || Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP
            ) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
    };
}
