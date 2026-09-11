import { useEffect, useRef } from 'react';
import { GLOW, PIGMENTS, pigmentGradient } from '../../lib/glow';
import { useTheme } from '../../lib/theme';

/**
 * Shared cursor-reactive glow for any section.
 *
 * Three offset brand-coloured gradients ride the pointer on one composited
 * layer — no canvas, one transform write per frame, and only while the cursor
 * is actually inside the host section. Size, falloff and weight all come from
 * `lib/glow`, so every section glows identically.
 *
 * Sits behind the section's content (it renders before the content wrapper),
 * never takes pointer events, and stays off for touch, small screens and
 * reduced motion.
 */
export default function CursorGlow() {
    const hostRef = useRef(null);
    const blobRef = useRef(null);
    const { theme } = useTheme();
    const light = theme === 'light';

    useEffect(() => {
        const host = hostRef.current;
        const blob = blobRef.current;
        if (!host || !blob) return undefined;

        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const small = window.matchMedia('(max-width: 767px)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (coarse || small || reduced) return undefined;

        const section = host.parentElement ?? host;
        let rect = section.getBoundingClientRect();
        let target = null;
        const pos = { x: 0, y: 0 };
        let started = false;
        let raf = 0;

        const onMove = (e) => {
            rect = section.getBoundingClientRect();
            const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            if (!inside) {
                target = null;
                blob.style.opacity = '0';
                return;
            }
            target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            if (!started) {
                // Jump to the entry point so the glow doesn't sweep in from a corner.
                started = true;
                pos.x = target.x;
                pos.y = target.y;
            }
            blob.style.opacity = '1';
        };

        const frame = () => {
            raf = requestAnimationFrame(frame);
            if (!target) return;
            pos.x += (target.x - pos.x) * GLOW.lerp;
            pos.y += (target.y - pos.y) * GLOW.lerp;
            blob.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMove);
        };
    }, []);

    const alpha = light ? GLOW.alpha.light : GLOW.alpha.dark;
    // Three pigments, slightly offset, so they mix where they overlap.
    const layers = [
        pigmentGradient(PIGMENTS[0], alpha, 'circle at 42% 40%'),
        pigmentGradient(PIGMENTS[1], alpha * 0.9, 'circle at 58% 48%'),
        pigmentGradient(PIGMENTS[2], alpha * 0.8, 'circle at 50% 62%'),
    ].join(', ');

    return (
        <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div
                ref={blobRef}
                className="cursor-glow"
                style={{
                    '--glow-r': `${GLOW.radius}px`,
                    backgroundImage: layers,
                    filter: `blur(${light ? GLOW.blur.light : GLOW.blur.dark}px) saturate(${light ? GLOW.saturate.light : GLOW.saturate.dark})`,
                    mixBlendMode: light ? 'multiply' : 'screen',
                    opacity: 0,
                }}
            />
        </div>
    );
}
