import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Phones count up once; desktop keeps replaying on every viewport re-entry. */
const COUNTER_ONCE_QUERY = '(max-width: 767px)';

/**
 * A number that counts up from a small non-zero floor whenever it scrolls
 * into view. Large values are grouped ("2,100").
 *
 * @param {{ to: number, prefix?: string, suffix?: string, decimals?: number }} props
 */
export default function CountUp({ to, prefix = '', suffix = '', decimals = 0 }) {
    const ref = useRef(null);
    // Each frame of the count sets React state, so a replay re-renders four
    // counters at 60fps for 1.6s. That is affordable once, but not every time
    // a thumb scrolls the section back into view on a phone.
    const [once] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(COUNTER_ONCE_QUERY).matches,
    );
    const inView = useInView(ref, { margin: '-15% 0px', once });
    const reduce = useReducedMotion();
    // Never render zero: the pre-animation state is the final value, and each
    // replay counts up from a small non-zero floor instead of resetting.
    const [val, setVal] = useState(to);

    useEffect(() => {
        // Leaving the viewport keeps the final value visible; entering replays.
        if (!inView) return;
        const floor = Math.min(to, Math.max(1, Math.floor(to * 0.08)));
        if (reduce || floor >= to) {
            // Intentional: jump straight to final value when motion is reduced
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVal(to);
            return;
        }
        let raf = 0;
        const start = performance.now();
        const dur = 1600;
        const tick = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(2, -10 * p);
            setVal(floor + (to - floor) * (p === 1 ? 1 : eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, to, reduce]);

    return (
        <span ref={ref}>
            {prefix}
            {val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            {suffix}
        </span>
    );
}
