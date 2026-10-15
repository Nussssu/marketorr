import { c as transitionTo, g as SectionLabel, h as GradientTitle, l as useTapIntent, m as GradientButton, u as MagneticButton } from "../ssr.js";
import { t as EASE } from "./motion-DQVPQ9oM.js";
import { t as RevealText } from "./RevealText-Co3c_QNo.js";
import { t as ScrollHeading } from "./ScrollHeading-BhPAyGdL.js";
import { t as useMediaQuery } from "./useMediaQuery-UO1511g3.js";
import { t as MediaPlaceholder } from "./MediaPlaceholder-BAEKlLsR.js";
import { Link } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
//#region resources/js/components/sections/ServiceShowcaseRail.jsx
/** Tight gap between screens — the strip stays continuous with no air in it. */
var GAP = 8;
/** Seconds for one screen to travel its own height — slow premium reel. */
var SECONDS_PER_SCREEN = 4.5;
var FRAME_INTERVAL = 1e3 / 30;
/**
* One compact version of the real dedicated-page sub-service card. Its image,
* name and short copy come from the same catalogue item rendered by the
* category page, so this rail cannot carry placeholder or stale content.
*
* `--svc-accent` carries the sub-service's brand colour into the frame's
* highlight hairline and caption dot. The image crop and content stack echo
* the dedicated cards at a scale that stays readable inside the narrow rail.
*/
function ShowcaseScreen({ item, solidTitle = false }) {
	return /* @__PURE__ */ jsx("figure", {
		className: "m-0",
		"data-screen": true,
		children: /* @__PURE__ */ jsxs("div", {
			className: "svc-screen relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]",
			style: { "--svc-accent": item.accent },
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "absolute inset-x-0 top-0 h-[48%] overflow-hidden bg-[#08080B]",
					children: [item.image ? /* @__PURE__ */ jsx("img", {
						src: item.image,
						alt: "",
						loading: "lazy",
						decoding: "async",
						draggable: false,
						className: "h-full w-full object-cover"
					}) : /* @__PURE__ */ jsx(MediaPlaceholder, { label: `${item.name} - image placeholder` }), /* @__PURE__ */ jsx("span", {
						className: "absolute inset-0",
						style: { background: "linear-gradient(180deg, transparent 46%, rgba(6,6,10,0.62) 100%)" },
						"aria-hidden": true
					})]
				}),
				/* @__PURE__ */ jsxs("figcaption", {
					className: "absolute inset-x-0 bottom-0 top-[48%] flex flex-col px-2 py-2 sm:px-2.5 sm:py-2.5",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "mb-1.5 flex items-center gap-1.5",
							"aria-hidden": true,
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-1 w-1 shrink-0 rounded-full",
								style: { background: item.accent }
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[6px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] sm:text-[7px]",
								children: "Service"
							})]
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "overflow-hidden font-display text-[clamp(7px,0.7vw,10px)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-[var(--ink-strong)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
							children: solidTitle ? item.name : /* @__PURE__ */ jsx(GradientTitle, { text: item.name })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1.5 overflow-hidden text-[clamp(6px,0.56vw,8px)] leading-[1.3] text-[var(--mute)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]",
							children: item.short
						})
					]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "absolute inset-x-0 bottom-0 h-0.5",
					style: { background: item.accent },
					"aria-hidden": true
				})
			]
		})
	});
}
/**
* The moving showcase that occupies the right side of a Branding or UI/UX
* gateway card.
*
* One continuous strip of screens rising inside a tight clipped frame — a
* slow infinite reel where new visuals keep entering from the bottom and
* drifting upward. A single rAF clock advances the strip and reports the
* screen at the frame's top edge through `onActive`, which is the same tick
* that moves the sub-service ticker below the title — image and name always
* change together, with no drift possible. Parking off-screen or hiding
* the tab freezes both at once and resumes seamlessly — hover never
* pauses the reel; it only drives the card's CSS hover effects.
*
* No second plane, no blur, no pointer tilt, no edge fade masks and no
* glow: the frame is always full, edges cut hard by `overflow-hidden`, and
* only one transform is written per frame. The doubled strip keeps the
* frame full at every offset.
*
* The whole rail is decorative: `pointer-events-none` and `aria-hidden`, so
* taps pass through to the card-level navigation target.
*
* @param {{
*   category: { slug: string, name: string, items: Array<{ slug: string, name: string, short: string, image: string, accent: string }> },
*   onActive?: (index: number) => void,
*   progress?: import('framer-motion').MotionValue<number> | null,
*   solidTitle?: boolean,
* }} props
*   `progress` receives the reel's continuous position in screens — a float
*   wrapped into [0, count) — every frame. The sub-service ticker beneath the
*   title rides that same value, so the name rises in lockstep with the image
*   instead of stepping between them, and neither can drift from the other.
*/
function ServiceShowcaseRail({ category, onActive = () => {}, progress = null, solidTitle = false }) {
	const reduce = useReducedMotion();
	const frameRef = useRef(null);
	const [step, setStep] = useState(0);
	const [visible, setVisible] = useState(true);
	const items = category.items ?? [];
	const count = items.length;
	const y = useMotionValue(0);
	const stepRef = useRef(0);
	const travelled = useRef(0);
	const lastActive = useRef(0);
	useEffect(() => {
		const frame = frameRef.current;
		if (!frame || typeof ResizeObserver === "undefined") return void 0;
		const measure = () => {
			const first = frame.querySelector("[data-screen]");
			if (!first) return;
			const next = first.getBoundingClientRect().height + GAP;
			stepRef.current = next;
			setStep(next);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(frame);
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		const frame = frameRef.current;
		if (!frame || typeof IntersectionObserver === "undefined") return void 0;
		const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "25% 0px" });
		observer.observe(frame);
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		if (reduce || count === 0 || !visible) return void 0;
		let raf = 0;
		let last = performance.now();
		let hidden = document.hidden;
		const onVisibility = () => {
			hidden = document.hidden;
			last = performance.now();
		};
		document.addEventListener("visibilitychange", onVisibility);
		const frame = (now) => {
			raf = requestAnimationFrame(frame);
			const elapsed = now - last;
			if (elapsed < FRAME_INTERVAL) return;
			const dt = Math.min(64, elapsed) / 1e3;
			last = now;
			if (hidden) return;
			travelled.current = (travelled.current + dt / SECONDS_PER_SCREEN) % count;
			y.set(-(travelled.current * stepRef.current));
			if (progress) progress.set(travelled.current);
			const active = Math.floor(travelled.current) % count;
			if (active !== lastActive.current) {
				lastActive.current = active;
				onActive(active);
			}
		};
		raf = requestAnimationFrame(frame);
		return () => {
			cancelAnimationFrame(raf);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [
		reduce,
		count,
		visible,
		onActive,
		progress,
		y
	]);
	if (count === 0) return null;
	if (reduce) return /* @__PURE__ */ jsx("div", {
		className: "pointer-events-none relative w-[96px] shrink-0 self-stretch overflow-hidden sm:w-[124px] lg:w-[136px] xl:w-[172px]",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx("div", {
			className: "absolute inset-x-0 top-1/2 -translate-y-1/2",
			children: /* @__PURE__ */ jsx(ShowcaseScreen, {
				item: items[0],
				solidTitle
			})
		})
	});
	const copies = [...items, ...items];
	return /* @__PURE__ */ jsx("div", {
		ref: frameRef,
		className: "pointer-events-none relative w-[96px] shrink-0 self-stretch overflow-hidden sm:w-[124px] lg:w-[136px] xl:w-[172px]",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "absolute inset-x-0 top-0 flex flex-col",
			style: {
				gap: GAP,
				y
			},
			children: copies.map((item, i) => /* @__PURE__ */ jsx(ShowcaseScreen, {
				item,
				solidTitle
			}, `${Math.floor(i / count)}-${item.slug}`))
		})
	});
}
//#endregion
//#region resources/js/components/sections/ServicesTransition.jsx
/**
* Viewport tier for the transition's scroll choreography. Phones keep the
* parallax but drop the 3D turn: perspective plus rotateX on a phone buys
* jank, not depth.
*
* @return {{ compact: boolean, rich: boolean }}
*/
function useTransitionTier() {
	const [tier, setTier] = useState({
		compact: false,
		rich: false
	});
	useEffect(() => {
		const compactQuery = window.matchMedia("(max-width: 767px)");
		const richQuery = window.matchMedia("(min-width: 768px)");
		const update = () => setTier({
			compact: compactQuery.matches,
			rich: richQuery.matches
		});
		update();
		compactQuery.addEventListener("change", update);
		richQuery.addEventListener("change", update);
		return () => {
			compactQuery.removeEventListener("change", update);
			richQuery.removeEventListener("change", update);
		};
	}, []);
	return tier;
}
/**
* The cinematic hand-off between the two category gateways and the dedicated
* Branding and UI/UX pages.
*
* One scroll progress value drives the whole passage. Everything it moves sits
* at a different distance and therefore travels at a different rate — the grid
* and the brand glows drift slowly behind, the headline turns out of depth on
* its own axis, and the supporting line and the buttons trail it — so scrolling
* through reads as moving through a space rather than past a block of copy.
*
* Only `transform` and `opacity` are animated, so the passage stays on the
* compositor. Phones keep the parallax and drop the 3D turn; reduced motion
* renders the section flat and static, with the copy and both links intact.
*
* @param {{ categories?: Array<{ slug: string, name: string }> }} props
*   Unused for content — the section deliberately carries no cards or lists —
*   but kept so the caller can pass the catalogue it already has.
*/
function ServicesTransition() {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const { compact, rich } = useTransitionTier();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});
	const k = compact ? .5 : 1;
	const gridY = useTransform(scrollYProgress, [0, 1], [-50 * k, 50 * k]);
	const glowY = useTransform(scrollYProgress, [0, 1], [110 * k, -110 * k]);
	const glowFade = useTransform(scrollYProgress, [
		0,
		.5,
		1
	], [
		0,
		1,
		0
	]);
	const headY = useTransform(scrollYProgress, [0, 1], [46 * k, -46 * k]);
	const headTurn = useTransform(scrollYProgress, [
		0,
		.5,
		1
	], [
		9,
		0,
		-6
	]);
	const headScale = useTransform(scrollYProgress, [
		0,
		.5,
		1
	], [
		.95,
		1,
		.98
	]);
	const headFade = useTransform(scrollYProgress, [
		0,
		.3,
		.78,
		1
	], [
		.35,
		1,
		1,
		.3
	]);
	const copyY = useTransform(scrollYProgress, [0, 1], [78 * k, -78 * k]);
	const ctaY = useTransform(scrollYProgress, [0, 1], [112 * k, -112 * k]);
	const ruleScale = useTransform(scrollYProgress, [.12, .45], [0, 1]);
	const counterGlowY = useTransform(glowY, (value) => -value);
	const motionProps = (style) => reduce ? {} : { style };
	const headStyle = rich ? {
		y: headY,
		rotateX: headTurn,
		scale: headScale,
		opacity: headFade,
		transformPerspective: 1200
	} : {
		y: headY,
		scale: headScale,
		opacity: headFade
	};
	return /* @__PURE__ */ jsxs("section", {
		ref,
		className: "services-transition relative isolate overflow-hidden bg-[var(--bg)] py-28 sm:py-36 lg:py-56",
		children: [
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "services-transition__grid grid-bg pointer-events-none absolute inset-x-0 -top-24 -bottom-24",
				...motionProps({ y: gridY })
			}),
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "services-transition__glow services-transition__glow--purple pointer-events-none absolute",
				...motionProps({
					y: glowY,
					opacity: glowFade
				})
			}),
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "services-transition__glow services-transition__glow--cyan pointer-events-none absolute",
				...motionProps({
					y: counterGlowY,
					opacity: glowFade
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "container-x relative flex flex-col items-center text-center",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex justify-center",
						children: /* @__PURE__ */ jsx(SectionLabel, { name: "WHERE TO NEXT" })
					}),
					/* @__PURE__ */ jsx(motion.div, {
						className: "services-transition__head mt-9 w-full",
						...motionProps(headStyle),
						children: /* @__PURE__ */ jsx(RevealText, {
							as: "h2",
							className: "display-xl uppercase text-[var(--ink-strong)]",
							lines: ["Go deeper", "into the work."],
							lineClassName: "services-transition__line",
							duration: .82,
							stagger: .12
						})
					}),
					/* @__PURE__ */ jsx(motion.span, {
						"aria-hidden": true,
						className: "services-transition__rule mt-12 h-px w-40 origin-center rounded-full sm:w-56",
						...motionProps({ scaleX: ruleScale })
					}),
					/* @__PURE__ */ jsx(motion.p, {
						className: "mt-12 max-w-[18rem] text-[15px] leading-relaxed text-[var(--mute)] sm:max-w-xl sm:text-[17px]",
						...motionProps({ y: copyY }),
						children: "Two disciplines, two dedicated worlds. See how the strategy, the craft and the decisions behind each one actually come together, then bring us the thing you are trying to build."
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						className: "mt-11 flex flex-col items-center gap-4 sm:flex-row sm:gap-5",
						...motionProps({ y: ctaY }),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "services-transition__cta relative",
							children: [/* @__PURE__ */ jsx("span", {
								className: "services-transition__halo",
								"aria-hidden": true
							}), /* @__PURE__ */ jsx(MagneticButton, { children: /* @__PURE__ */ jsx(GradientButton, {
								href: "/services/branding",
								children: "Explore Branding"
							}) })]
						}), /* @__PURE__ */ jsx(GradientButton, {
							href: "/services/ui-ux",
							variant: "ghost",
							children: "Explore UI/UX"
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/components/sections/SubServiceTicker.jsx
var ROW_H = 28;
/** Distance, in rows, at which a name has fully dissolved. */
var FADE_OUT = 1.35;
/**
* Signed distance of row `index` from the reel's current position, wrapped into
* [-count/2, count/2] so a row leaving the top re-enters from the bottom.
*
* @param {number} index
* @param {number} position
* @param {number} count
* @return {number}
*/
function rowOffset(index, position, count) {
	let off = ((index - position) % count + count) % count;
	if (off > count / 2) off -= count;
	return off;
}
/**
* One name in the ticker.
*
* Every visual property is a continuous function of the reel position, so the
* row rises, brightens, comes forward and recedes in one unbroken motion rather
* than snapping between an active and an inactive state. Each curve is written
* to land on the old step values at their old moments — dead centre reads
* exactly as the previous active row did, and one full row away reads exactly
* as the previous neighbour did — so the ticker's resting appearance is
* unchanged; only the travel between those points is now smooth.
*
* Rows live in their own component because each one needs its own hooks. All of
* them stay mounted and are driven entirely by `useTransform`, so a frame costs
* a compositor write per row and never a React render.
*
* @param {{
*   item: { slug: string, name: string, accent: string },
*   index: number,
*   count: number,
*   position: import('framer-motion').MotionValue<number>,
*   full: boolean,
* }} props
*/
function TickerRow({ item, index, count, position, full }) {
	const offset = useTransform(position, (p) => rowOffset(index, p, count));
	const y = useTransform(offset, (off) => off * ROW_H);
	const opacity = useTransform(offset, (off) => {
		const distance = Math.abs(off);
		if (distance >= FADE_OUT) return 0;
		if (distance <= 1) return 1 - distance * .62;
		return .38 * (1 - (distance - 1) / .3500000000000001);
	});
	const scale = useTransform(offset, (off) => 1 - Math.min(Math.abs(off), FADE_OUT) * .14);
	const z = useTransform(offset, (off) => 34 - Math.min(Math.abs(off), FADE_OUT) * 86);
	const rotateX = useTransform(offset, (off) => off * 16);
	return /* @__PURE__ */ jsx(motion.div, {
		style: full ? {
			y,
			z,
			rotateX,
			opacity,
			scale,
			transformStyle: "preserve-3d"
		} : {
			y,
			opacity,
			scale
		},
		className: "pointer-events-none absolute inset-x-0 top-[28px] flex h-[28px] items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
		children: /* @__PURE__ */ jsxs("span", {
			className: "pointer-events-none flex min-w-0 items-center gap-2.5",
			children: [/* @__PURE__ */ jsx("span", {
				className: "h-1.5 w-1.5 shrink-0 rounded-full",
				style: {
					background: item.accent,
					boxShadow: `0 0 10px ${item.accent}`
				},
				"aria-hidden": true
			}), /* @__PURE__ */ jsx("span", {
				className: "truncate",
				children: item.name
			})]
		})
	});
}
/**
* The dedicated sub-service's short copy, moving on the same clock as its
* ticker name and showcase screen. Keeping this text sourced from `item.short`
* means the landing widget cannot drift from the category page catalogue.
*/
function CopyRow({ item, index, count, position }) {
	const offset = useTransform(position, (p) => rowOffset(index, p, count));
	const y = useTransform(offset, (off) => off * 18);
	const opacity = useTransform(offset, (off) => Math.max(0, 1 - Math.abs(off) * 2));
	return /* @__PURE__ */ jsx(motion.p, {
		style: {
			y,
			opacity
		},
		className: "pointer-events-none absolute inset-x-0 top-0 text-[14px] leading-relaxed text-[var(--mute)] sm:text-[15px]",
		children: item.short
	});
}
/**
* Vertical 3D sub-service ticker that lives inside a Branding / UI-UX gateway
* card, beneath the dominant title.
*
* It rides the showcase rail's own clock — `position` is the reel's continuous
* offset in screens — so the names rise at exactly the speed the images beside
* them do, and the two can never drift apart. The motion is continuous and
* automatic: it is driven by time alone, never by the pointer, so the names
* neither shake nor follow the cursor, and hovering the card does not start,
* stop or steer them. Rows nearest the centre sit close and bright while those
* above and below recede into depth (translateZ + slight rotateX inside a
* perspective stage).
*
* The ticker is presentational only: every row is `pointer-events-none` and the
* moving stage is `aria-hidden`, so hovering it, moving across it, or pressing
* a row can never start a page visit. Navigation on this card belongs to the
* arrow and the "Explore …" CTA alone. A static list carries the same names to
* assistive technology, which is both more useful and more stable than
* announcing whichever row happens to be centred.
*
* Phones get the same upward rise without the 3D depth. Reduced motion leaves
* the column parked on its first name.
*
* @param {{
*   category: { slug: string, name: string, items: Array<{ slug: string, name: string, accent: string }> },
*   position: import('framer-motion').MotionValue<number>,
* }} props
*/
function SubServiceTicker({ category, position }) {
	const reduce = useReducedMotion();
	const [rich, setRich] = useState(false);
	const items = category.items ?? [];
	const count = items.length;
	useEffect(() => {
		const query = window.matchMedia("(min-width: 768px)");
		const update = () => setRich(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	if (count === 0) return null;
	const full = rich && !reduce;
	return /* @__PURE__ */ jsxs("div", {
		className: "relative mt-5 h-[84px]",
		children: [/* @__PURE__ */ jsx("ul", {
			className: "sr-only",
			children: items.map((item) => /* @__PURE__ */ jsxs("li", { children: [
				item.name,
				": ",
				item.short
			] }, item.slug))
		}), /* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 overflow-hidden",
			style: full ? { perspective: "520px" } : void 0,
			"aria-hidden": true,
			children: items.map((item, i) => /* @__PURE__ */ jsx(TickerRow, {
				item,
				index: i,
				count,
				position,
				full
			}, item.slug))
		})]
	});
}
/**
* Synchronized short copy for the active sub-service. This occupies the same
* space as the former static category tagline, so the card layout stays fixed
* while the real dedicated-page copy travels bottom-to-top with the reel.
*
* @param {{
*   category: { items: Array<{ slug: string, short: string }> },
*   position: import('framer-motion').MotionValue<number>,
* }} props
*/
function SubServiceCopy({ category, position }) {
	const items = category.items ?? [];
	const count = items.length;
	if (count === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "relative h-12 min-w-0 max-w-sm flex-1 overflow-hidden",
		"aria-hidden": true,
		children: items.map((item, index) => /* @__PURE__ */ jsx(CopyRow, {
			item,
			index,
			count,
			position
		}, item.slug))
	});
}
//#endregion
//#region resources/js/components/sections/Services.jsx
var BRAND_GRADIENT = "linear-gradient(90deg, #891FFB, #507AF4, #1BE2EB)";
function navigateWithCurtain(event, href, tapIntent) {
	if (event.defaultPrevented) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	if (event.button !== void 0 && event.button !== 0) return;
	tapIntent.onClick(event);
	if (event.defaultPrevented) return;
	event.preventDefault();
	transitionTo(href);
}
/**
* Home-page entrance choreography. It plays once, `compact` shortens the
* travel and timings on phones, and the whole thing is skipped when the user
* prefers reduced motion.
*/
var VIEWPORT = {
	once: true,
	margin: "-12% 0px -12% 0px"
};
/** Phones play the entrance once; replaying it on every pass is wasted work. */
var VIEWPORT_COMPACT = {
	once: true,
	margin: "-12% 0px -12% 0px"
};
var cardStagger = (compact) => ({
	hidden: {},
	show: { transition: {
		staggerChildren: compact ? .1 : .15,
		delayChildren: compact ? .05 : .12
	} }
});
/**
* Desktop cards arrive as panels standing in depth: they rise, un-tilt and
* come forward out of the stage's Z axis into a perfectly flat resting frame.
* `mirror` turns the second card's entry the other way so the pair opens like
* two leaves rather than two copies. Phones keep the existing flat rise —
* rotation and translateZ on a phone buy jank, not depth.
*
* @param {boolean} compact
* @param {boolean} mirror
*/
var cardVariants = (compact, mirror = false) => ({
	hidden: {
		opacity: 0,
		y: compact ? 34 : 66,
		scale: compact ? .98 : .94,
		rotateX: compact ? 0 : 13,
		rotateY: compact ? 0 : mirror ? -9 : 9,
		z: compact ? 0 : -240
	},
	show: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotateX: 0,
		rotateY: 0,
		z: 0,
		transition: {
			duration: compact ? .44 : .72,
			ease: [...EASE]
		}
	}
});
var COMPACT_QUERY = "(max-width: 767px)";
/**
* True on phone-width viewports, so the section can run a lighter version of
* the same choreography. It settles straight after hydration (see
* `useMediaQuery`); the card grid is keyed on it, so the cards — still hidden
* at that point — remount with the phone's entrance pose before they play.
*
* @return {boolean}
*/
function useCompactViewport() {
	return useMediaQuery(COMPACT_QUERY);
}
function CategoryGateway({ category, variants, solidHeadings = false }) {
	const cardTapIntent = useTapIntent();
	const arrowTapIntent = useTapIntent();
	const ctaTapIntent = useTapIntent();
	const exploreHref = `/services/${category.slug}`;
	const reel = useMotionValue(0);
	return /* @__PURE__ */ jsxs(motion.article, {
		"data-cursor": "explore",
		variants,
		style: variants ? { transformStyle: "preserve-3d" } : void 0,
		className: `group relative min-h-[340px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10 lg:p-12 ${variants ? "services-card" : ""}`.trimEnd(),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100",
				style: { background: BRAND_GRADIENT },
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx(Link, {
				href: exploreHref,
				prefetch: true,
				"aria-label": `Explore ${category.name} services`,
				...cardTapIntent,
				onClick: (event) => navigateWithCurtain(event, exploreHref, cardTapIntent),
				className: "absolute inset-0 z-0 rounded-3xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#507AF4]"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none relative z-0 flex h-full gap-4 sm:gap-7",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex h-full min-w-0 flex-1 flex-col justify-between gap-16",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "whitespace-nowrap font-display text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] md:whitespace-normal md:text-[11px] md:tracking-[0.24em]",
							children: "Category"
						}), /* @__PURE__ */ jsx(Link, {
							href: exploreHref,
							prefetch: true,
							"aria-label": `Explore ${category.name}`,
							...arrowTapIntent,
							onClick: (event) => navigateWithCurtain(event, exploreHref, arrowTapIntent),
							className: "services-card__arrow pointer-events-auto relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] text-xl text-[var(--ink)] transition-all duration-500 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-[#507AF4] group-hover:text-white",
							children: "↗"
						})]
					}), /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[clamp(2.1rem,8.6vw,3.9rem)] font-extrabold uppercase leading-[.88] tracking-[-.05em] text-[var(--ink-strong)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2",
							children: solidHeadings ? category.name : /* @__PURE__ */ jsx(GradientTitle, { text: category.name })
						}),
						/* @__PURE__ */ jsx(SubServiceTicker, {
							category,
							position: reel
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-5 flex items-end justify-between gap-6",
							children: [/* @__PURE__ */ jsx(SubServiceCopy, {
								category,
								position: reel
							}), /* @__PURE__ */ jsxs(Link, {
								href: exploreHref,
								prefetch: true,
								...ctaTapIntent,
								onClick: (event) => navigateWithCurtain(event, exploreHref, ctaTapIntent),
								className: "hidden pointer-events-auto relative z-10 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)] transition-colors duration-300 hover:text-[var(--ink)] sm:block",
								children: [
									"Explore ",
									category.items.length,
									" services"
								]
							})]
						})
					] })]
				}), /* @__PURE__ */ jsx(ServiceShowcaseRail, {
					category,
					progress: reel,
					solidTitle: solidHeadings
				})]
			})
		]
	});
}
/**
* @param {{
*   heroHeading?: boolean,
*   subservices?: Array<object>,
*   showTransition?: boolean,
*   scrollAnimation?: boolean,
*   solidHeadings?: boolean,
* }} props
*   `showTransition` false keeps the section to the two category gateways only
*   — the Home page wants a simple entry point and has its own onward flow,
*   while the Services page closes on the cinematic hand-off to the dedicated
*   Branding and UI/UX pages.
*   `scrollAnimation` opts into the Home-only entrance choreography and the
*   card hover treatment; every other mount renders exactly as before. The two
*   gateway cards themselves — layout, type scale and the moving showcase rail
*   in the composition area — are identical wherever the section mounts.
*   `solidHeadings` keeps every title in this section a single solid colour
*   (Services pages); elsewhere the key words carry the brand gradient.
*/
function Services({ heroHeading = false, subservices = [], showTransition = true, scrollAnimation = false, solidHeadings = false }) {
	const reduce = useReducedMotion();
	const compact = useCompactViewport();
	const animate = !reduce;
	const gridVariants = useMemo(() => cardStagger(compact), [compact]);
	const itemVariants = useMemo(() => cardVariants(compact), [compact]);
	const mirroredVariants = useMemo(() => cardVariants(compact, true), [compact]);
	return /* @__PURE__ */ jsxs("section", {
		id: "services",
		className: "relative overflow-x-clip bg-[var(--bg)] pt-24 lg:pt-32",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x relative pb-20 lg:pb-28",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "SERVICES" }),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
					children: [/* @__PURE__ */ jsx(ScrollHeading, {
						enabled: heroHeading || animate,
						intensity: heroHeading ? 1 : .85,
						children: /* @__PURE__ */ jsx(RevealText, {
							as: heroHeading ? "h1" : "h2",
							className: "display-lg uppercase text-[var(--ink-strong)]",
							lines: ["Two disciplines.", "One clear outcome."],
							highlightedLines: solidHeadings ? void 0 : [1],
							duration: animate ? .58 : void 0,
							stagger: animate ? .13 : void 0
						})
					}), /* @__PURE__ */ jsx(motion.p, {
						initial: {
							opacity: 0,
							y: 20
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: { once: true },
						transition: { duration: .7 },
						className: "max-w-md text-[15px] leading-relaxed text-[var(--mute)]",
						children: "We create brands and digital experiences that are clear, memorable, intuitive, and built for growth."
					})]
				}),
				/* @__PURE__ */ jsx(motion.div, {
					className: "mt-14 grid w-full gap-5 lg:grid-cols-2",
					style: animate && !compact ? { perspective: "1500px" } : void 0,
					...animate ? {
						initial: "hidden",
						whileInView: "show",
						viewport: compact || !scrollAnimation ? VIEWPORT_COMPACT : VIEWPORT,
						variants: gridVariants
					} : {},
					children: subservices.map((category, index) => /* @__PURE__ */ jsx(CategoryGateway, {
						category,
						variants: animate ? index % 2 === 1 ? mirroredVariants : itemVariants : void 0,
						solidHeadings
					}, category.slug))
				}, compact ? "compact" : "wide")
			]
		}), showTransition && /* @__PURE__ */ jsx(ServicesTransition, {})]
	});
}
//#endregion
export { Services as t };
