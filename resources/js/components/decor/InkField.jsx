import { useEffect, useRef, useState } from 'react';
import { GLOW, PIGMENTS } from '../../lib/glow';

/**
 * Mouse-reactive watercolour field.
 *
 * Paints soft brand-coloured blobs along a lerped cursor path on a
 * half-resolution canvas, smears each frame into the last (drawing the canvas
 * back onto itself along the travel vector) and lets a CSS blur do the wet
 * edges. Blends `screen` on the dark stage and `multiply` on paper, so the
 * pigments read as light or ink without changing the palette.
 *
 * Coarse pointers and reduced-motion get a static painted wash instead — no
 * canvas, no rAF.
 */
export default function InkField({ theme = 'dark' }) {
    const hostRef = useRef(null);
    const canvasRef = useRef(null);
    const [painting, setPainting] = useState(false);

    useEffect(() => {
        const host = hostRef.current;
        const canvas = canvasRef.current;
        if (!host || !canvas) return undefined;

        // Touch, small screens and reduced motion all fall back to the static wash.
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const small = window.matchMedia('(max-width: 1023px)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (coarse || small || reduced) return undefined;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return undefined;

        setPainting(true);

        // Half resolution + a capped DPR: the CSS blur hides every bit of it.
        const RES = 0.42;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        let w = 1;
        let h = 1;
        let rect = host.getBoundingClientRect();

        // Boxes: interactive and media zones are excluded by their full rect.
        const EXCLUDE_BOX = 'a, button, input, textarea, select, img, svg, form, [data-ink-exclude]';
        // Text: excluded per rendered line, so the gaps around short lines stay paintable.
        const EXCLUDE_TEXT = 'h1, h2, h3, h4, h5, p, li, label, span[class*="uppercase"]';
        const stage = host.parentElement ?? host;
        // Punched holes are inflated by the CSS blur radius so colour cannot bleed back over content.
        const PAD = 16;

        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');
        /** @type {{x: number, y: number, w: number, h: number}[]} */
        let holes = [];

        const buildMask = () => {
            if (!maskCtx) return;
            maskCanvas.width = w;
            maskCanvas.height = h;
            maskCtx.clearRect(0, 0, w, h);
            const sx = w / Math.max(1, rect.width);
            const sy = h / Math.max(1, rect.height);
            maskCtx.filter = `blur(${Math.max(4, Math.round(10 * sx))}px)`;
            maskCtx.fillStyle = '#000';
            holes = [];

            const punch = (r) => {
                if (r.width < 4 || r.height < 4) return;
                if (r.bottom < rect.top || r.top > rect.bottom) return;
                const x = r.left - rect.left;
                const y = r.top - rect.top;
                holes.push({ x, y, w: r.width, h: r.height });
                maskCtx.beginPath();
                maskCtx.roundRect((x - PAD) * sx, (y - PAD) * sy, (r.width + PAD * 2) * sx, (r.height + PAD * 2) * sy, Math.max(8, 26 * sx));
                maskCtx.fill();
            };

            stage.querySelectorAll(EXCLUDE_BOX).forEach((el) => {
                if (host.contains(el)) return; // decor layers are not content
                punch(el.getBoundingClientRect());
            });

            const range = document.createRange();
            stage.querySelectorAll(EXCLUDE_TEXT).forEach((el) => {
                if (host.contains(el)) return;
                if (el.closest(EXCLUDE_BOX)) return; // already punched as a box
                range.selectNodeContents(el);
                const lines = range.getClientRects();
                if (!lines.length) {
                    punch(el.getBoundingClientRect());
                    return;
                }
                for (let i = 0; i < lines.length; i += 1) {
                    punch(lines[i]);
                }
            });
            maskCtx.filter = 'none';
        };

        /** True when the brush sits over content, so no new pigment is laid down there. */
        const overContent = (bx, by) => {
            const px = (bx / w) * rect.width;
            const py = (by / h) * rect.height;
            return holes.some((r) => px >= r.x - 8 && px <= r.x + r.w + 8 && py >= r.y - 8 && py <= r.y + r.h + 8);
        };

        const resize = () => {
            rect = host.getBoundingClientRect();
            w = Math.max(1, Math.round(rect.width * RES * dpr));
            h = Math.max(1, Math.round(rect.height * RES * dpr));
            canvas.width = w;
            canvas.height = h;
            buildMask();
        };
        resize();

        const target = { x: w * 0.5, y: h * 0.45 };
        const brush = { x: target.x, y: target.y };
        let prevX = brush.x;
        let prevY = brush.y;
        let lastMove = -Infinity;
        let visible = true;
        let raf = 0;
        let lastPaint = 0;

        const onMove = (e) => {
            const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
            const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
            if (nx < -0.2 || nx > 1.2 || ny < -0.2 || ny > 1.2) return;
            target.x = nx * w;
            target.y = ny * h;
            lastMove = performance.now();
        };

        const frame = (time) => {
            raf = requestAnimationFrame(frame);
            if (!visible) return;
            if (time - lastMove > 2600 || time - lastPaint < 32) return;
            lastPaint = time;

            brush.x += (target.x - brush.x) * 0.075;
            brush.y += (target.y - brush.y) * 0.075;

            const vx = brush.x - prevX;
            const vy = brush.y - prevY;
            prevX = brush.x;
            prevY = brush.y;
            const speed = Math.hypot(vx, vy);

            // Smear + dry in one pass: `copy` replaces the layer with the previous
            // frame nudged along the travel vector and scaled down in alpha, so the
            // trail both drags and decays (source-over would re-add alpha and never fade).
            ctx.globalCompositeOperation = 'copy';
            ctx.globalAlpha = 0.95;
            ctx.drawImage(canvas, vx * 0.6, vy * 0.6, w, h);
            ctx.globalAlpha = 1;

            // Wet pigment: three offset blobs, stretched along the stroke.
            ctx.globalCompositeOperation = 'lighter';
            const angle = Math.atan2(vy, vx);
            const drag = Math.min(14, speed * 1.2);
            const radius = Math.min(w, h) * 0.12 + speed * 0.7;

            // Pigment only while the cursor is actually moving through whitespace;
            // once it stops, nothing new is laid down and the trail dries out.
            const active = time - lastMove < 180;
            if (active && !overContent(brush.x, brush.y)) {
                for (let i = 0; i < PIGMENTS.length; i += 1) {
                    const pigment = PIGMENTS[(i + Math.floor(time / 2600)) % PIGMENTS.length];
                    const spread = drag * (i - 1);
                    const px = brush.x + Math.cos(angle) * spread + Math.sin(time / 2200 + i) * 12;
                    const py = brush.y + Math.sin(angle) * spread + Math.cos(time / 2600 + i) * 12;
                    const alpha = 0.042 + Math.min(0.045, speed * 0.003);
                    // Stretch along the stroke so strokes read as brushed, not stamped.
                    const stretch = 1 + Math.min(0.85, speed * 0.05);

                    ctx.save();
                    ctx.translate(px, py);
                    ctx.rotate(angle);
                    ctx.scale(stretch, 1 / Math.sqrt(stretch));
                    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
                    // Shared falloff, so the canvas glow matches CursorGlow exactly.
                    GLOW.stops.forEach(([offset, weight]) => {
                        grad.addColorStop(offset, `rgba(${pigment[0]},${pigment[1]},${pigment[2]},${alpha * weight})`);
                    });
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            // Punch content zones back out of the paint layer.
            if (maskCanvas.width) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.drawImage(maskCanvas, 0, 0, w, h);
            }
            ctx.globalCompositeOperation = 'source-over';
        };

        const io = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
            },
            { rootMargin: '10% 0px' },
        );
        io.observe(host);

        const ro = new ResizeObserver(resize);
        ro.observe(host);

        const onScroll = () => {
            rect = host.getBoundingClientRect();
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const light = theme === 'light';

    return (
        <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <canvas
                ref={canvasRef}
                className="h-full w-full"
                style={{
                    display: painting ? 'block' : 'none',
                    filter: `blur(${light ? GLOW.blur.light : GLOW.blur.dark}px) saturate(${light ? GLOW.saturate.light : GLOW.saturate.dark})`,
                    mixBlendMode: light ? 'multiply' : 'screen',
                    opacity: light ? GLOW.opacity.light : GLOW.opacity.dark,
                    transform: 'scale(1.08)',
                }}
            />
            {/* static wash for coarse pointers and reduced motion */}
            {!painting && (
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(60% 50% at 22% 18%, rgba(137,31,251,0.16), transparent 70%), radial-gradient(55% 45% at 78% 30%, rgba(80,122,244,0.14), transparent 70%), radial-gradient(70% 55% at 45% 92%, rgba(27,226,235,0.12), transparent 72%)',
                        filter: 'blur(24px)',
                        opacity: light ? 0.6 : 0.9,
                    }}
                />
            )}
        </div>
    );
}
