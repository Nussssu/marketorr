import { d as BrandLogo, s as transitionTo } from "../ssr.js";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion } from "framer-motion";
//#region resources/js/components/motion/BounceTitle.jsx
/** The brand gradient's three stops: purple, blue, cyan. */
var STOPS = [
	[
		137,
		31,
		251
	],
	[
		80,
		122,
		244
	],
	[
		27,
		226,
		235
	]
];
/**
* The brand gradient's colour at `t` (0–1).
*
* Each letter moves on its own, so the gradient is sampled per letter rather
* than clipped across the word — a clipped gradient would not follow letters
* that are mid-animation.
*
* @param {number} t
*/
function brandColor(t) {
	const scaled = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
	const index = Math.min(STOPS.length - 2, Math.floor(scaled));
	const local = scaled - index;
	const [a, b] = [STOPS[index], STOPS[index + 1]];
	const channel = (k) => Math.round(a[k] + (b[k] - a[k]) * local);
	return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}
/**
* A page title that slides down smoothly into place as one piece, every
* letter together, with no bounce or overshoot.
*
* The leading words keep the surrounding text colour, so they follow the
* theme; the last `highlightWords` words run through the brand's purple, blue
* and cyan, the same colouring as every other gradient title on the site.
* `highlightWords={0}` keeps every word in the text colour.
*
* With `onScroll` the letters wait until the title scrolls into view, then
* appear once; otherwise they appear as the page opens.
*
* @param {{ text: string, highlightWords?: number, delay?: number, uppercase?: boolean, onScroll?: boolean }} props
*/
function BounceTitle({ text, highlightWords = 1, delay = .3, uppercase = false, onScroll = false }) {
	const reduce = useReducedMotion();
	const words = String(text ?? "").trim().split(/\s+/).filter(Boolean).map((word) => uppercase ? word.toUpperCase() : word);
	const highlightFrom = highlightWords <= 0 ? words.length : Math.max(0, words.length - highlightWords);
	const highlightLength = words.slice(highlightFrom).join("").length;
	let charIndex = 0;
	let highlightIndex = 0;
	const settled = {
		y: 0,
		opacity: 1
	};
	const trigger = onScroll ? {
		whileInView: settled,
		viewport: {
			once: true,
			amount: .6
		}
	} : { animate: settled };
	return /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
		className: "sr-only",
		children: text
	}), words.map((word, w) => /* @__PURE__ */ jsx("span", {
		"aria-hidden": true,
		className: "mr-[0.24em] inline-block whitespace-nowrap last:mr-0",
		children: word.split("").map((char) => {
			const i = charIndex++;
			const color = w >= highlightFrom ? brandColor(highlightLength > 1 ? highlightIndex++ / (highlightLength - 1) : 0) : void 0;
			return /* @__PURE__ */ jsx(motion.span, {
				className: "inline-block will-change-transform",
				style: color ? { color } : void 0,
				initial: reduce ? false : {
					y: "-0.4em",
					opacity: 0
				},
				...trigger,
				transition: reduce ? { duration: 0 } : {
					duration: .8,
					ease: [
						.22,
						1,
						.36,
						1
					],
					delay
				},
				children: char
			}, i);
		})
	}, w))] });
}
//#endregion
//#region resources/js/lib/gsap.js
/**
* GSAP and its ScrollTrigger plugin, loaded on first use rather than with the
* page. Nothing GSAP drives is part of the server-rendered first paint, so the
* library stays out of the initial download and arrives once an effect asks.
*/
var loading = null;
var loaded = null;
/** @return {Promise<{ gsap: typeof import('gsap').gsap, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }>} */
function loadGsap() {
	loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([core, scroll]) => {
		core.gsap.registerPlugin(scroll.ScrollTrigger);
		loaded = {
			gsap: core.gsap,
			ScrollTrigger: scroll.ScrollTrigger
		};
		return loaded;
	});
	return loading;
}
/**
* GSAP if it has already loaded, otherwise null — for code that animates
* synchronously and can simply skip the animation in the rare case it is not
* there yet.
*/
function loadedGsap() {
	return loaded?.gsap ?? null;
}
//#endregion
//#region resources/js/components/ui/ScreenLightbox.jsx
/** Horizontal travel (px) that turns a touch drag into previous/next. */
var SWIPE_DISTANCE = 56;
/** Zoom range, as a multiple of the fitted width. */
var MIN_ZOOM = 1;
var MAX_ZOOM = 4;
/** How far one press of + or − zooms. */
var ZOOM_STEP = 1.25;
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
function ScreenLightbox({ screens, index, originRect, onChange, onClose }) {
	const open = index !== null && screens[index] !== void 0;
	const rootRef = useRef(null);
	const panelRef = useRef(null);
	const scrollerRef = useRef(null);
	const closeRef = useRef(null);
	const touch = useRef(null);
	const returnFocus = useRef(null);
	const imageRef = useRef(null);
	const zoomLabelRef = useRef(null);
	const zoom = useRef(MIN_ZOOM);
	const pointers = useRef(/* @__PURE__ */ new Map());
	const pointerStarts = useRef(/* @__PURE__ */ new Map());
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
		scroller.classList.toggle("is-zoomed", next > MIN_ZOOM);
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
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const gsap = loadedGsap();
		if (!root || reduce || !gsap) {
			onClose();
			return;
		}
		const timeline = gsap.timeline({ onComplete: onClose });
		timeline.to(panel, {
			y: 4,
			scale: .99,
			duration: .16,
			ease: "power2.in"
		}, 0);
		timeline.to(root, {
			autoAlpha: 0,
			duration: .16,
			ease: "power2.in"
		}, 0);
	};
	useEffect(() => {
		loadGsap();
	}, []);
	useEffect(() => {
		if (!open) return void 0;
		closing.current = false;
		returnFocus.current = document.activeElement;
		closeRef.current?.focus({ preventScroll: true });
		const lenis = window.__lenis;
		lenis?.stop();
		const { overflow } = document.documentElement.style;
		document.documentElement.style.overflow = "hidden";
		return () => {
			document.documentElement.style.overflow = overflow;
			lenis?.start();
			returnFocus.current?.focus?.({ preventScroll: true });
		};
	}, [open]);
	useEffect(() => {
		if (!open) return void 0;
		const onKey = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				requestClose();
			} else if (event.key === "+" || event.key === "=") {
				event.preventDefault();
				zoomTo(zoom.current * ZOOM_STEP);
			} else if (event.key === "-" || event.key === "_") {
				event.preventDefault();
				zoomTo(zoom.current / ZOOM_STEP);
			} else if (event.key === "0") {
				event.preventDefault();
				resetZoom();
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				go(1);
			} else if (event.key === "ArrowLeft") {
				event.preventDefault();
				go(-1);
			} else if (event.key === "Tab") {
				const focusable = rootRef.current?.querySelectorAll("button");
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
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	useLayoutEffect(() => {
		if (!open || !rootRef.current) return void 0;
		const gsap = loadedGsap();
		if (!gsap) return void 0;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const panel = panelRef.current;
		const tweens = [gsap.fromTo(rootRef.current, { autoAlpha: 0 }, {
			autoAlpha: 1,
			duration: reduce ? 0 : .25,
			ease: "power2.out"
		})];
		if (!reduce && originRect && panel) {
			const box = panel.getBoundingClientRect();
			tweens.push(gsap.fromTo(panel, {
				x: originRect.left + originRect.width / 2 - (box.left + box.width / 2),
				y: originRect.top + originRect.height / 2 - (box.top + box.height / 2),
				scale: Math.max(.2, Math.min(1, originRect.width / box.width)),
				transformOrigin: "50% 50%"
			}, {
				x: 0,
				y: 0,
				scale: 1,
				duration: .5,
				ease: "power3.out",
				clearProps: "transform"
			}));
		}
		return () => tweens.forEach((tween) => tween.kill());
	}, [open]);
	useLayoutEffect(() => {
		zoom.current = MIN_ZOOM;
		if (imageRef.current) imageRef.current.style.width = "100%";
		const scroller = scrollerRef.current;
		scroller?.classList.remove("is-zoomed", "is-loaded");
		scroller?.scrollTo({
			top: 0,
			left: 0
		});
		if (zoomLabelRef.current) zoomLabelRef.current.textContent = "100%";
		const gsap = loadedGsap();
		if (!scroller || !gsap) return void 0;
		const tween = gsap.fromTo(scroller, {
			autoAlpha: .72,
			y: 5
		}, {
			autoAlpha: 1,
			y: 0,
			duration: .18,
			ease: "power2.out"
		});
		return () => tween.kill();
	}, [index]);
	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!open || !scroller) return void 0;
		const onWheel = (event) => {
			if (!event.ctrlKey && !event.metaKey) return;
			event.preventDefault();
			const box = scroller.getBoundingClientRect();
			const unit = event.deltaMode === 1 ? 16 : 1;
			zoomTo(zoom.current * Math.exp(-event.deltaY * unit * .0025), event.clientX - box.left, event.clientY - box.top);
		};
		scroller.addEventListener("wheel", onWheel, { passive: false });
		return () => scroller.removeEventListener("wheel", onWheel);
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
			pinch.current = {
				distance: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1,
				zoom: zoom.current
			};
			gestureWasPinch.current = true;
			pan.current = null;
		} else if (event.pointerType === "mouse" && event.button === 0 && zoom.current > MIN_ZOOM) {
			const scroller = scrollerRef.current;
			pan.current = {
				x: event.clientX,
				y: event.clientY,
				left: scroller.scrollLeft,
				top: scroller.scrollTop
			};
			scroller.setPointerCapture?.(event.pointerId);
			scroller.classList.add("is-panning");
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
		const singleTouch = event.pointerType === "touch" && pointers.current.size === 1 && !gestureWasPinch.current;
		pointers.current.delete(event.pointerId);
		pointerStarts.current.delete(event.pointerId);
		if (pointers.current.size < 2) pinch.current = null;
		if (pan.current) {
			pan.current = null;
			scrollerRef.current?.classList.remove("is-panning");
		}
		if (singleTouch && start && Math.hypot(point[0] - start[0], point[1] - start[1]) < 12) {
			const now = performance.now();
			const previous = lastTap.current;
			if (previous && now - previous.time < 300 && Math.hypot(point[0] - previous.x, point[1] - previous.y) < 32) {
				zoomTo(zoom.current > MIN_ZOOM ? MIN_ZOOM : 2, point[0], point[1]);
				lastTap.current = null;
			} else lastTap.current = {
				time: now,
				x: point[0],
				y: point[1]
			};
		}
	};
	const onScrollerDoubleClick = (event) => {
		const [x, y] = scrollerPoint(event);
		zoomTo(zoom.current > MIN_ZOOM ? MIN_ZOOM : 2, x, y);
	};
	if (!open) return null;
	return /* @__PURE__ */ jsxs("div", {
		ref: rootRef,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `${screen.projectName}, screen ${screen.screenNumber} of ${screen.screenTotal}`,
		className: "uiux-lightbox",
		onPointerDown: (event) => {
			if (event.pointerType === "touch" && !touch.current) touch.current = {
				x: event.clientX,
				y: event.clientY
			};
			else if (event.pointerType !== "touch") touch.current = null;
		},
		onPointerUp: (event) => {
			const start = touch.current;
			touch.current = null;
			if (gestureWasPinch.current) {
				gestureWasPinch.current = false;
				return;
			}
			if (!start || zoom.current > MIN_ZOOM || pointers.current.size > 0) return;
			const dx = event.clientX - start.x;
			const dy = event.clientY - start.y;
			if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
		},
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "uiux-lightbox__backdrop",
				"aria-label": "Close",
				tabIndex: -1,
				onClick: requestClose
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "uiux-lightbox__bar",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "uiux-lightbox__title min-w-0 truncate",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display font-bold text-[var(--ink-strong)]",
						children: screen.projectName
					}), /* @__PURE__ */ jsxs("span", {
						className: "ml-3 text-[var(--ink-faint)]",
						children: [
							String(screen.screenNumber).padStart(2, "0"),
							" / ",
							String(screen.screenTotal).padStart(2, "0")
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "uiux-lightbox__controls flex shrink-0 items-center gap-1.5",
					children: [
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => zoomTo(zoom.current / ZOOM_STEP),
							className: "uiux-lightbox__btn",
							"aria-label": "Zoom out",
							children: /* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 24 24",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx("path", { d: "M5 12h14" })
							})
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: resetZoom,
							className: "uiux-lightbox__zoom",
							"aria-label": "Reset zoom",
							title: "Reset zoom",
							children: /* @__PURE__ */ jsx("span", {
								ref: zoomLabelRef,
								children: "100%"
							})
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => zoomTo(zoom.current * ZOOM_STEP),
							className: "uiux-lightbox__btn",
							"aria-label": "Zoom in",
							children: /* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 24 24",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" })
							})
						}),
						/* @__PURE__ */ jsx("button", {
							ref: closeRef,
							type: "button",
							onClick: requestClose,
							className: "uiux-lightbox__btn",
							"aria-label": "Close larger view",
							children: /* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 24 24",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				ref: panelRef,
				className: "uiux-lightbox__panel",
				children: /* @__PURE__ */ jsx("div", {
					ref: scrollerRef,
					className: "uiux-lightbox__scroller",
					style: { backgroundImage: screen.thumb ? `url(${screen.thumb})` : void 0 },
					"data-lenis-prevent": true,
					onPointerDown: onScrollerPointerDown,
					onPointerMove: onScrollerPointerMove,
					onPointerUp: onScrollerPointerUp,
					onPointerCancel: onScrollerPointerUp,
					onDoubleClick: onScrollerDoubleClick,
					children: /* @__PURE__ */ jsx("img", {
						ref: imageRef,
						src: screen.src,
						alt: screen.alt,
						width: screen.width,
						height: screen.height,
						decoding: "async",
						fetchPriority: "high",
						draggable: false,
						className: "uiux-lightbox__image",
						onLoad: () => scrollerRef.current?.classList.add("is-loaded")
					}, screen.src)
				})
			}),
			screens.length > 1 && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => go(-1),
				className: "uiux-lightbox__btn uiux-lightbox__nav uiux-lightbox__nav--prev",
				"aria-label": "Previous screen",
				children: /* @__PURE__ */ jsx("svg", {
					viewBox: "0 0 24 24",
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("path", { d: "M15 5l-7 7 7 7" })
				})
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => go(1),
				className: "uiux-lightbox__btn uiux-lightbox__nav uiux-lightbox__nav--next",
				"aria-label": "Next screen",
				children: /* @__PURE__ */ jsx("svg", {
					viewBox: "0 0 24 24",
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("path", { d: "M9 5l7 7-7 7" })
				})
			})] })
		]
	});
}
//#endregion
//#region resources/js/components/sections/UiuxPrinter.jsx
/** Sheets whose image is requested ahead of the one being printed. */
var LOOKAHEAD = 3;
/** Share of a sheet's step spent waiting for the previous sheet to clear the slot. */
var FEED_DELAY = .25;
/** Share of a step the row takes to shift one sheet to the left. */
var SHIFT_SPAN = .5;
/** Height of the caption strip printed under each screen (px). */
var CAPTION = 30;
/** Paper margin around the screen (px). */
var PAD = 8;
/** Height of a printed card's design window, as a multiple of its width: a tall portrait. */
var CARD_RATIO = 1.75;
var pad = (value) => String(value).padStart(2, "0");
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
	const printerWidth = Math.min(compact ? 380 : 460, Math.max(240, width * (wide ? .29 : mid ? .5 : .86)));
	const frontHeight = printerWidth * .27;
	const rearHeight = printerWidth * .09;
	const foot = Math.min(40, Math.max(16, height * .04));
	const slotY = height - foot - frontHeight;
	const sheetWidth = printerWidth * (compact ? .84 : .8);
	const gap = Math.min(28, Math.max(14, width * .018));
	const reserve = wide ? 190 : compact ? 138 : 156;
	return {
		width,
		height,
		printerWidth,
		frontHeight,
		rearHeight,
		foot,
		slotY,
		printerX: wide ? width * .68 : width / 2,
		sheetWidth,
		step: sheetWidth + gap,
		maxSheetHeight: Math.max(170, slotY - reserve)
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
* A screen with an `href` prints as a link to that page instead of opening
* the larger view, which is how the landing page prints one cover per
* project. `hint` replaces the instruction under the stage.
*
* @param {{
*   project: { slug: string, name: string, discipline: string, screens: Array<{ src: string, thumb: string, width: number, height: number, alt: string, label: string, href?: string }> },
*   hint?: { desktop: string, mobile: string },
* }} props
*/
function UiuxPrinter({ project, hint }) {
	const screens = useMemo(() => project.screens.map((screen, index) => ({
		...screen,
		projectName: project.name,
		screenNumber: index + 1,
		screenTotal: project.screens.length
	})), [project]);
	const total = screens.length;
	const sectionRef = useRef(null);
	const stageRef = useRef(null);
	const sheetRefs = useRef([]);
	const counterRef = useRef(null);
	const printerRef = useRef(null);
	const geometryRef = useRef(null);
	const sheetState = useRef([]);
	const [geometry, setGeometry] = useState(null);
	const [reach, setReach] = useState(4);
	const [activeScreen, setActiveScreen] = useState(0);
	const [lightbox, setLightbox] = useState({
		index: null,
		rect: null
	});
	useLayoutEffect(() => {
		const stage = stageRef.current;
		if (!stage) return void 0;
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
		const innerWidth = geometry.sheetWidth - 16;
		const maxImage = geometry.maxSheetHeight - CAPTION - 16;
		const cap = Math.min(maxImage, innerWidth * CARD_RATIO);
		return screens.map((screen) => {
			const image = Math.round(Math.min(cap, innerWidth * screen.height / screen.width));
			return {
				image,
				sheet: image + CAPTION + 16 + 2
			};
		});
	}, [geometry, screens]);
	const heightsRef = useRef(sheetHeights);
	heightsRef.current = sheetHeights;
	useEffect(() => {
		if (!geometry || total === 0) return void 0;
		let cancelled = false;
		let teardown = () => {};
		loadGsap().then(({ gsap, ScrollTrigger }) => {
			if (cancelled) return;
			const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			const compact = window.matchMedia("(max-width: 639px)").matches;
			const motion = {
				current: reduce || compact ? 1 : 0,
				target: 1,
				running: false
			};
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
						const feed = Math.min(1, Math.max(0, (u - FEED_DELAY) / .75));
						const eased = 1 - (1 - feed) * (1 - feed);
						y = (1 - eased) * heights[i].sheet;
						tilt = (1 - eased) * 12;
						visible = feed > 0;
					} else if (u >= 1) {
						const beats = u - 1;
						const whole = Math.floor(beats);
						const shift = Math.min(1, (beats - whole) / SHIFT_SPAN);
						const travel = whole + (shift < .5 ? 2 * shift * shift : 1 - Math.pow(-2 * shift + 2, 2) / 2);
						x = -travel * g.step;
						y = -10 * Math.min(1, travel);
						visible = g.printerX + x + g.sheetWidth / 2 > -40;
					}
					if (prev.visible !== visible) {
						prev.visible = visible;
						el.style.visibility = visible ? "visible" : "hidden";
					}
					const settled = u >= .97;
					if (prev.settled !== settled) {
						prev.settled = settled;
						el.style.pointerEvents = settled ? "auto" : "none";
						el.tabIndex = settled ? 0 : -1;
					}
					if (visible) el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotateX(${tilt.toFixed(2)}deg)`;
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
				const printing = p < total && fraction > .02 && fraction < .98;
				if (printing !== lastPrinting) {
					lastPrinting = printing;
					printerRef.current?.classList.toggle("is-printing", printing);
				}
			};
			const tick = (_time, deltaMs) => {
				const diff = motion.target - motion.current;
				if (reduce || Math.abs(diff) < 5e-4 || Math.abs(diff) > 3) {
					motion.current = motion.target;
					render();
					gsap.ticker.remove(tick);
					motion.running = false;
					return;
				}
				const ease = 1 - Math.pow(1 - (compact ? .22 : .16), Math.min(4, deltaMs / 16.667));
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
				start: "top top",
				end: "bottom bottom",
				onUpdate: (self) => setTarget(self.progress),
				onRefresh: (self) => setTarget(self.progress)
			});
			render();
			setTarget(trigger.progress);
			teardown = () => {
				trigger.kill();
				gsap.ticker.remove(tick);
			};
		});
		return () => {
			cancelled = true;
			teardown();
		};
	}, [
		geometry,
		total,
		screens
	]);
	if (total === 0) return /* @__PURE__ */ jsx("div", {
		className: "container-x",
		children: /* @__PURE__ */ jsx("p", {
			className: "mt-14 max-w-xl text-[15px] leading-relaxed text-[var(--mute)]",
			children: "The pages for this project are being prepared and will appear here shortly."
		})
	});
	const g = geometry;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("section", {
		ref: sectionRef,
		className: "uiux-printer",
		style: { "--uiux-steps": Math.max(0, total - 1) },
		"aria-label": `${project.name}: scroll to print each page`,
		children: /* @__PURE__ */ jsxs("div", {
			ref: stageRef,
			className: "uiux-printer__stage",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "uiux-printer__glow",
					style: g ? { left: g.printerX } : void 0,
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsx("div", {
					className: "uiux-printer__label container-x",
					children: /* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						"aria-live": "polite",
						children: [/* @__PURE__ */ jsx("p", {
							className: "truncate font-display text-[clamp(1.5rem,3vw,2.6rem)] font-bold leading-[1.05] text-[var(--ink-strong)]",
							children: screens[activeScreen]?.label
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1.5 truncate text-[12px] font-bold uppercase tracking-[0.16em]",
							children: /* @__PURE__ */ jsx("span", {
								className: "text-gradient",
								children: project.name
							})
						})]
					})
				}),
				g && /* @__PURE__ */ jsxs(Fragment$1, { children: [
					/* @__PURE__ */ jsx("div", {
						className: "uiux-printer__rear",
						style: {
							left: g.printerX - g.printerWidth / 2,
							width: g.printerWidth,
							height: g.rearHeight,
							bottom: g.foot + g.frontHeight
						},
						"aria-hidden": true
					}),
					/* @__PURE__ */ jsx("div", {
						className: "uiux-printer__rail",
						style: { height: g.slotY },
						children: screens.map((screen, index) => {
							const size = sheetHeights[index];
							const Sheet = screen.href ? "a" : "button";
							const behaviour = screen.href ? {
								href: screen.href,
								onClick: (event) => {
									if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
									event.preventDefault();
									transitionTo(screen.href);
								},
								"aria-label": `Open project: ${screen.label}`
							} : {
								type: "button",
								onClick: (event) => setLightbox({
									index,
									rect: event.currentTarget.getBoundingClientRect()
								}),
								"aria-label": `Open larger view: ${screen.alt}`
							};
							return /* @__PURE__ */ jsxs(Sheet, {
								ref: (el) => {
									sheetRefs.current[index] = el;
								},
								tabIndex: -1,
								"data-cursor": "view",
								...behaviour,
								className: "uiux-sheet",
								style: {
									left: g.printerX - g.sheetWidth / 2,
									width: g.sheetWidth,
									height: size.sheet,
									padding: PAD,
									visibility: "hidden",
									pointerEvents: "none"
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "uiux-sheet__screen",
									style: { height: size.image },
									children: index < reach && /* @__PURE__ */ jsx("img", {
										src: screen.thumb,
										alt: "",
										width: screen.width,
										height: screen.height,
										decoding: "async",
										draggable: false,
										fetchPriority: index < 2 ? "high" : "auto"
									})
								}), /* @__PURE__ */ jsxs("span", {
									className: "uiux-sheet__caption",
									style: { height: CAPTION },
									children: [/* @__PURE__ */ jsx("span", {
										className: "truncate",
										children: screen.label
									}), /* @__PURE__ */ jsxs("span", {
										className: "shrink-0",
										children: [
											pad(screen.screenNumber),
											"/",
											pad(screen.screenTotal)
										]
									})]
								})]
							}, screen.src);
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						ref: printerRef,
						className: "uiux-printer__front",
						style: {
							left: g.printerX - g.printerWidth / 2,
							width: g.printerWidth,
							height: g.frontHeight,
							bottom: g.foot
						},
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ jsx("span", { className: "uiux-printer__slot" }),
							/* @__PURE__ */ jsx(BrandLogo, {
								className: "uiux-printer__brand",
								height: Math.round(Math.min(13, Math.max(10, g.printerWidth * .029)))
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "uiux-printer__display",
								children: [/* @__PURE__ */ jsx("span", { className: "uiux-printer__led" }), /* @__PURE__ */ jsxs("span", {
									ref: counterRef,
									children: ["01 / ", pad(total)]
								})]
							})
						]
					})
				] }),
				/* @__PURE__ */ jsxs("p", {
					className: "uiux-printer__hint container-x",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "uiux-printer__hint-dot",
							"aria-hidden": true
						}),
						/* @__PURE__ */ jsx("span", {
							className: "uiux-printer__hint-desktop",
							children: hint?.desktop ?? "Click any page to view the full design"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "uiux-printer__hint-mobile",
							children: hint?.mobile ?? "Tap any page to view the full design"
						})
					]
				})
			]
		})
	}), /* @__PURE__ */ jsx(ScreenLightbox, {
		screens,
		index: lightbox.index,
		originRect: lightbox.rect,
		onChange: (index) => setLightbox({
			index,
			rect: null
		}),
		onClose: () => setLightbox({
			index: null,
			rect: null
		})
	})] });
}
//#endregion
export { BounceTitle as n, UiuxPrinter as t };
