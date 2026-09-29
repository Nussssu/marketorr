import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ScreenLightbox from '../ui/ScreenLightbox';
import BrandLogo from '../layout/BrandLogo';

gsap.registerPlugin(ScrollTrigger);

/** Sheets whose image is requested ahead of the one being printed. */
const LOOKAHEAD = 3;

/** How far a finished sheet lifts off the slot as it moves into the row (px). */
const LIFT = 10;

/** Share of a sheet's step spent waiting for the previous sheet to clear the slot. */
const FEED_DELAY = 0.25;

/** Share of a step the row takes to shift one sheet to the left. */
const SHIFT_SPAN = 0.5;

/** Height of the caption strip printed under each screen (px). */
const CAPTION = 30;

/** Paper margin around the screen (px). */
const PAD = 8;

/** Height of a printed card's design window, as a multiple of its width: a tall portrait. */
const CARD_RATIO = 1.75;

const pad = (value) => String(value).padStart(2, '0');

/**
 * Stage geometry for the current viewport: where the printer sits, how wide a
 * sheet is and how tall one may grow before it would run under the heading.
 *
 * @param {number} width
 * @param {number} height
 */
function measureStage(width, height) {
    const wide = width >= 1024;
    const mid = width >= 640;
    const compact = width < 640;
    const printerWidth = Math.min(compact ? 380 : 460, Math.max(240, width * (wide ? 0.29 : mid ? 0.5 : 0.86)));
    const frontHeight = printerWidth * 0.27;
    const rearHeight = printerWidth * 0.09;
    const foot = Math.min(40, Math.max(16, height * 0.04));
    const slotY = height - foot - frontHeight;
    const sheetWidth = printerWidth * (compact ? 0.84 : 0.8);
    const gap = Math.min(28, Math.max(14, width * 0.018));
    // Room above the sheets for the page name and project name.
    const reserve = wide ? 190 : compact ? 138 : 156;

    return {
        width,
        height,
        printerWidth,
        frontHeight,
        rearHeight,
        foot,
        slotY,
        printerX: wide ? width * 0.68 : width / 2,
        sheetWidth,
        step: sheetWidth + gap,
        maxSheetHeight: Math.max(170, slotY - reserve),
    };
}

/**
 * One UI/UX project's printer: every exported page of the project fed out of
 * a printer, one after another, as the reader scrolls.
 *
 * Scroll position maps to a single number `p` running from 1 to the number of
 * pages. Page `i` is printing while `p - i` climbs from 0 to 1 — rising out of
 * the slot once the previous sheet has cleared it — and afterwards the row
 * shifts one sheet-width left per step, so each new page enters at the printer
 * while the earlier ones move along in order. `p` eases toward the scroll
 * position every frame, which keeps the motion continuous under wheel,
 * trackpad and touch alike, and the frame loop only runs while it is still
 * catching up.
 *
 * @param {{
 *   project: { slug: string, name: string, discipline: string, screens: Array<{ src: string, thumb: string, width: number, height: number, alt: string, label: string }> },
 * }} props
 */
export default function UiuxPrinter({ project }) {
    const screens = useMemo(
        () =>
            project.screens.map((screen, index) => ({
                ...screen,
                projectName: project.name,
                screenNumber: index + 1,
                screenTotal: project.screens.length,
            })),
        [project],
    );
    const total = screens.length;

    const sectionRef = useRef(null);
    const stageRef = useRef(null);
    const sheetRefs = useRef([]);
    const counterRef = useRef(null);
    const printerRef = useRef(null);
    const geometryRef = useRef(null);
    const sheetState = useRef([]);
    const [geometry, setGeometry] = useState(null);
    const [reach, setReach] = useState(LOOKAHEAD + 1);
    const [activeScreen, setActiveScreen] = useState(0);
    const [lightbox, setLightbox] = useState({ index: null, rect: null });

    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;

        const update = () => {
            const next = measureStage(stage.clientWidth, stage.clientHeight);
            geometryRef.current = next;
            setGeometry(next);
        };
        update();

        const observer = new ResizeObserver(update);
        observer.observe(stage);

        return () => observer.disconnect();
    }, []);

    const sheetHeights = useMemo(() => {
        if (!geometry) return [];
        const innerWidth = geometry.sheetWidth - PAD * 2;
        const maxImage = geometry.maxSheetHeight - CAPTION - PAD * 2;

        // Each printed page is a large portrait card showing the top of its
        // design; the full length opens in the viewer. A design shorter than
        // the card gets a card cut to its own height, so no card is ever left
        // with empty space. Recomputed on every resize, browser zoom included.
        const cap = Math.min(maxImage, innerWidth * CARD_RATIO);

        return screens.map((screen) => {
            const image = Math.round(Math.min(cap, (innerWidth * screen.height) / screen.width));

            return { image, sheet: image + CAPTION + PAD * 2 + 2 };
        });
    }, [geometry, screens]);
    const heightsRef = useRef(sheetHeights);
    heightsRef.current = sheetHeights;

    useEffect(() => {
        if (!geometry || total === 0) return undefined;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const compact = window.matchMedia('(max-width: 639px)').matches;
        const motion = { current: reduce || compact ? 1 : 0, target: 1, running: false };
        let lastIndex = -1;
        let lastPrinting = null;
        let reached = 0;

        const render = () => {
            const g = geometryRef.current;
            const heights = heightsRef.current;
            const p = motion.current;

            for (let i = 0; i < total; i += 1) {
                const el = sheetRefs.current[i];
                if (!el || !heights[i]) continue;

                const u = p - i;
                const prev = sheetState.current[i] ?? (sheetState.current[i] = {});
                let x = 0;
                let y = 0;
                let tilt = 0;
                let visible = u > 0;

                if (u > 0 && u < 1) {
                    // Feeding waits for the previous sheet to clear the slot.
                    const feed = Math.min(1, Math.max(0, (u - FEED_DELAY) / (1 - FEED_DELAY)));
                    const eased = 1 - (1 - feed) * (1 - feed);
                    y = (1 - eased) * heights[i].sheet;
                    tilt = (1 - eased) * 12;
                    visible = feed > 0;
                } else if (u >= 1) {
                    // Each step left happens in the first half of the next
                    // sheet's print, so the row moves in beats, not a crawl.
                    const beats = u - 1;
                    const whole = Math.floor(beats);
                    const shift = Math.min(1, (beats - whole) / SHIFT_SPAN);
                    const travel = whole + (shift < 0.5 ? 2 * shift * shift : 1 - Math.pow(-2 * shift + 2, 2) / 2);
                    x = -travel * g.step;
                    y = -LIFT * Math.min(1, travel);
                    visible = g.printerX + x + g.sheetWidth / 2 > -40;
                }

                if (prev.visible !== visible) {
                    prev.visible = visible;
                    el.style.visibility = visible ? 'visible' : 'hidden';
                }

                const settled = u >= 0.97;
                if (prev.settled !== settled) {
                    prev.settled = settled;
                    el.style.pointerEvents = settled ? 'auto' : 'none';
                    el.tabIndex = settled ? 0 : -1;
                }

                if (visible) {
                    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotateX(${tilt.toFixed(2)}deg)`;
                }
            }

            const index = Math.min(total - 1, Math.max(0, Math.ceil(p - 1.0001)));
            if (index !== lastIndex) {
                lastIndex = index;
                if (counterRef.current) counterRef.current.textContent = `${pad(index + 1)} / ${pad(total)}`;
                setActiveScreen(index);
                if (index + LOOKAHEAD + 1 > reached) {
                    reached = index + LOOKAHEAD + 1;
                    setReach((current) => Math.max(current, reached));
                }
            }

            const fraction = p - Math.floor(p);
            const printing = p < total && fraction > 0.02 && fraction < 0.98;
            if (printing !== lastPrinting) {
                lastPrinting = printing;
                printerRef.current?.classList.toggle('is-printing', printing);
            }

        };

        const tick = (_time, deltaMs) => {
            const diff = motion.target - motion.current;
            // A jump of several sheets at once lands directly instead of
            // fast-forwarding through everything in between.
            if (reduce || Math.abs(diff) < 0.0005 || Math.abs(diff) > 3) {
                motion.current = motion.target;
                render();
                gsap.ticker.remove(tick);
                motion.running = false;

                return;
            }
            const ease = 1 - Math.pow(1 - (compact ? 0.22 : 0.16), Math.min(4, deltaMs / 16.667));
            motion.current += diff * ease;
            render();
        };

        const setTarget = (progress) => {
            motion.target = total > 1 ? 1 + progress * (total - 1) : 1;
            if (!motion.running) {
                motion.running = true;
                gsap.ticker.add(tick);
            }
        };

        const trigger = ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => setTarget(self.progress),
            onRefresh: (self) => setTarget(self.progress),
        });

        render();
        setTarget(trigger.progress);

        return () => {
            trigger.kill();
            gsap.ticker.remove(tick);
        };
    }, [geometry, total, screens]);

    if (total === 0) {
        return (
            <div className="container-x">
                <p className="mt-14 max-w-xl text-[15px] leading-relaxed text-[var(--mute)]">
                    The pages for this project are being prepared and will appear here shortly.
                </p>
            </div>
        );
    }

    const g = geometry;

    return (
        <>
            <section
                ref={sectionRef}
                className="uiux-printer"
                style={{ '--uiux-steps': Math.max(0, total - 1) }}
                aria-label={`${project.name}: scroll to print each page`}
            >
                <div ref={stageRef} className="uiux-printer__stage">
                    <div className="uiux-printer__glow" style={g ? { left: g.printerX } : undefined} aria-hidden />

                    <div className="uiux-printer__label container-x">
                        <div className="min-w-0" aria-live="polite">
                            <p className="truncate font-display text-[clamp(1.5rem,3vw,2.6rem)] font-bold leading-[1.05] text-[var(--ink-strong)]">
                                {screens[activeScreen]?.label}
                            </p>
                            <p className="mt-1.5 truncate text-[12px] font-bold uppercase tracking-[0.16em]">
                                <span className="text-gradient">{project.name}</span>
                            </p>
                        </div>
                    </div>

                    {g && (
                        <>
                            <div
                                className="uiux-printer__rear"
                                style={{
                                    left: g.printerX - g.printerWidth / 2,
                                    width: g.printerWidth,
                                    height: g.rearHeight,
                                    bottom: g.foot + g.frontHeight,
                                }}
                                aria-hidden
                            />

                            <div className="uiux-printer__rail" style={{ height: g.slotY }}>
                                {screens.map((screen, index) => {
                                    const size = sheetHeights[index];

                                    return (
                                        <button
                                            key={screen.src}
                                            ref={(el) => {
                                                sheetRefs.current[index] = el;
                                            }}
                                            type="button"
                                            tabIndex={-1}
                                            data-cursor="view"
                                            onClick={(event) => setLightbox({ index, rect: event.currentTarget.getBoundingClientRect() })}
                                            aria-label={`Open larger view: ${screen.alt}`}
                                            className="uiux-sheet"
                                            style={{
                                                left: g.printerX - g.sheetWidth / 2,
                                                width: g.sheetWidth,
                                                height: size.sheet,
                                                padding: PAD,
                                                visibility: 'hidden',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <span className="uiux-sheet__screen" style={{ height: size.image }}>
                                                {index < reach && (
                                                    <img
                                                        src={screen.thumb}
                                                        alt=""
                                                        width={screen.width}
                                                        height={screen.height}
                                                        decoding="async"
                                                        draggable={false}
                                                        fetchPriority={index < 2 ? 'high' : 'auto'}
                                                    />
                                                )}
                                            </span>
                                            <span className="uiux-sheet__caption" style={{ height: CAPTION }}>
                                                <span className="truncate">{screen.label}</span>
                                                <span className="shrink-0">
                                                    {pad(screen.screenNumber)}/{pad(screen.screenTotal)}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div
                                ref={printerRef}
                                className="uiux-printer__front"
                                style={{
                                    left: g.printerX - g.printerWidth / 2,
                                    width: g.printerWidth,
                                    height: g.frontHeight,
                                    bottom: g.foot,
                                }}
                                aria-hidden
                            >
                                <span className="uiux-printer__slot" />
                                <BrandLogo className="uiux-printer__brand" height={Math.round(Math.min(13, Math.max(10, g.printerWidth * 0.029)))} />
                                <span className="uiux-printer__display">
                                    <span className="uiux-printer__led" />
                                    <span ref={counterRef}>01 / {pad(total)}</span>
                                </span>
                            </div>
                        </>
                    )}

                    <p className="uiux-printer__hint container-x">
                        <span className="uiux-printer__hint-dot" aria-hidden />
                        <span className="uiux-printer__hint-desktop">Click any page to view the full design</span>
                        <span className="uiux-printer__hint-mobile">Tap any page to view the full design</span>
                    </p>
                </div>
            </section>

            <ScreenLightbox
                screens={screens}
                index={lightbox.index}
                originRect={lightbox.rect}
                onChange={(index) => setLightbox({ index, rect: null })}
                onClose={() => setLightbox({ index: null, rect: null })}
            />
        </>
    );
}
