import { _ as Tag, a as MARK, d as useBoxPointer, g as SectionLabel, h as GradientTitle, i as COLORS, l as useTapIntent, m as GradientButton, o as markBarStyle, r as BRAND_SEQUENCE, s as markGap, u as MagneticButton, y as useThemeMotion } from "../ssr.js";
import { i as CountUp, n as About, r as Stage, t as RecognitionStrip } from "./RecognitionStrip-C3UOsOmV.js";
import { t as EASE } from "./motion-DQVPQ9oM.js";
import { t as RevealText } from "./RevealText-Co3c_QNo.js";
import { t as ScrollHeading } from "./ScrollHeading-BhPAyGdL.js";
import { t as useMediaQuery } from "./useMediaQuery-UO1511g3.js";
import { n as FastCollapse, t as Contact } from "./Contact-CNHo9hDs.js";
import { t as ProjectMotion } from "./ProjectMotion-eUFFsKut.js";
import { i as isCharukothon, r as CharukothonCover, t as projectCardMedia } from "./projectHeroMedia-DRrWloKb.js";
import { t as Services } from "./Services-U6xqGZm3.js";
import { t as UiuxPrinter } from "./UiuxPrinter-Ap9RVics.js";
import { Link, usePage } from "@inertiajs/react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion, transform, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
//#region resources/js/components/motion/CinematicScene.jsx
var RICH_QUERY$1 = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
/**
* Travel applied while a scene is arriving (`in`) and while it is falling back
* behind the next one (`out`). Phones run the same choreography flattened:
* shorter travel, no perspective rotation, no depth.
*
* @type {Record<'rich'|'light', { yIn: number, yOut: number, scaleIn: number, scaleOut: number, opacityIn: number, opacityOut: number, rotateIn: number, rotateOut: number, zIn: number, zOut: number }>}
*/
var STAGE = {
	rich: {
		yIn: 110,
		yOut: -56,
		scaleIn: .9,
		scaleOut: .94,
		opacityIn: .2,
		opacityOut: .32,
		rotateIn: 7.5,
		rotateOut: -4.5,
		zIn: -210,
		zOut: -170
	},
	light: {
		yIn: 54,
		yOut: -24,
		scaleIn: .96,
		scaleOut: .985,
		opacityIn: .45,
		opacityOut: .6,
		rotateIn: 0,
		rotateOut: 0,
		zIn: 0,
		zOut: 0
	}
};
/**
* @param {number} a
* @param {number} b
* @param {number} t
* @return {number}
*/
function lerp(a, b, t) {
	return a + (b - a) * t;
}
/**
* Ease-out so a scene decelerates into its resting frame instead of arriving
* linearly with the scroll wheel.
*
* @param {number} t
* @return {number}
*/
function ease(t) {
	return 1 - Math.pow(1 - (t < 0 ? 0 : t > 1 ? 1 : t), 3);
}
/**
* True on tablet/desktop widths. Starts false for the server render and
* hydration (see `useMediaQuery`), then switches to the rich stage on mount.
*
* @return {boolean}
*/
function useRichStage() {
	return useMediaQuery(RICH_QUERY$1);
}
/**
* Wraps one home-page section so it reads as its own scene in a 3D stage: it
* comes forward out of depth as the viewer scrolls to it, rests perfectly flat
* and untransformed while it is being read, then falls back and dims as the
* next scene arrives.
*
* Two scroll ranges drive it instead of one progress over the whole section,
* so arrival and departure each take a fixed slice of viewport travel no
* matter how tall the section is — a short section and a very long one land
* with the same weight:
*
* - `enter`: the section's top travelling from the viewport bottom to 28% down
*   the viewport.
* - `leave`: the section's bottom travelling from 72% down the viewport to the
*   viewport top.
*
* The two are combined per property, so the resting state is genuinely
* identity — no residual fractional scale sitting under the text, which is
* what makes type look soft on scaled layers.
*
* The measured element never moves: the scroll ranges are read from the static
* outer wrapper and the transform is applied to the inner layer, so the effect
* can never feed back into its own progress.
*
* @param {{
*   children: import('react').ReactNode,
*   depth?: boolean,
*   className?: string,
* }} props
*   `depth` false keeps the scene's travel flat (no perspective rotation or
*   translateZ) for content that does not survive a 3D ancestor — an embedded
*   map, for example — while still moving with the rest of the page.
*/
function CinematicScene({ children, depth = true, className = "" }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const rich = useRichStage();
	const active = useInView(ref, { margin: "40% 0px" });
	const { scrollYProgress: enter } = useScroll({
		target: ref,
		offset: ["start end", "start 28%"]
	});
	const { scrollYProgress: leave } = useScroll({
		target: ref,
		offset: ["end 72%", "end start"]
	});
	const stage = rich ? STAGE.rich : STAGE.light;
	const dimensional = rich && depth;
	const y = useTransform([enter, leave], ([i, o]) => lerp(lerp(stage.yIn, 0, ease(i)), stage.yOut, ease(o)));
	const scale = useTransform([enter, leave], ([i, o]) => lerp(lerp(stage.scaleIn, 1, ease(i)), stage.scaleOut, ease(o)));
	const opacity = useTransform([enter, leave], ([i, o]) => lerp(lerp(stage.opacityIn, 1, ease(i)), stage.opacityOut, ease(o)));
	const rotateX = useTransform([enter, leave], ([i, o]) => dimensional ? lerp(lerp(stage.rotateIn, 0, ease(i)), stage.rotateOut, ease(o)) : 0);
	const z = useTransform([enter, leave], ([i, o]) => dimensional ? lerp(lerp(stage.zIn, 0, ease(i)), stage.zOut, ease(o)) : 0);
	if (reduce) return /* @__PURE__ */ jsx("div", {
		className,
		children
	});
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: `cine-scene ${className}`.trimEnd(),
		"data-active": active ? "true" : void 0,
		style: dimensional ? { perspective: "1600px" } : void 0,
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "cine-scene__layer",
			style: {
				y,
				z,
				rotateX,
				scale,
				opacity,
				transformOrigin: "50% 0%",
				transformStyle: dimensional ? "preserve-3d" : void 0
			},
			children
		})
	});
}
//#endregion
//#region resources/js/components/motion/SectionAppear.jsx
/**
* How a section arrives on the landing page.
*
* The alternative to `CinematicScene`: instead of a section flying forward
* out of 3D depth and then dimming and falling back as the next one arrives,
* it simply lifts into place once — a short rise, a soft fade, and then it is
* finished and completely still for as long as the reader is there.
*
* Two things matter about that:
*
* - It plays ONCE. Nothing re-animates on the way back up and nothing dims
*   while it is still on screen, so scrolling the page never feels like it is
*   taking the content away from you.
* - It never transforms the section in 3D. No perspective, no rotation, no
*   resting scale, which is what keeps type genuinely sharp rather than
*   resampled, and leaves the section free to hold `position: sticky`
*   children of its own.
*
* Each widget keeps its own internal motion exactly as it was — this only
* governs the arrival of the block as a whole.
*/
function SectionAppear({ children, className = "" }) {
	if (useReducedMotion()) return /* @__PURE__ */ jsx("div", {
		className,
		children
	});
	return /* @__PURE__ */ jsx(motion.div, {
		className,
		initial: {
			opacity: 0,
			y: 34
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			amount: .12,
			margin: "0px 0px -6% 0px"
		},
		transition: {
			duration: .8,
			ease: [...EASE]
		},
		children
	});
}
//#endregion
//#region resources/js/components/sections/Cta.jsx
/**
* @param {{ content?: { heading?: string, body?: string, buttonLabel?: string, buttonUrl?: string } }} props
*/
function Cta({ content }) {
	const { heading, body, buttonLabel, buttonUrl } = content ?? {};
	if (!heading && !body) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg-soft)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x max-w-3xl text-center",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "NEXT STEP" }),
				heading && /* @__PURE__ */ jsx("h2", {
					className: "display-md mt-8 uppercase text-[var(--ink-strong)]",
					children: /* @__PURE__ */ jsx(GradientTitle, { text: heading })
				}),
				body && /* @__PURE__ */ jsx("p", {
					className: "mt-5 text-[16px] leading-[1.75] text-[var(--mute)]",
					children: body
				}),
				buttonLabel && buttonUrl && /* @__PURE__ */ jsx("div", {
					className: "mt-9 flex justify-center",
					children: /* @__PURE__ */ jsx(GradientButton, {
						href: buttonUrl,
						children: buttonLabel
					})
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/sections/Faq.jsx
/**
* Expandable question list. One answer is open at a time; clicking the open
* question closes it.
*
* @param {{ content?: { heading?: string, items?: Array<{ question?: string, answer?: string }> } }} props
*/
function Faq({ content }) {
	const [openIndex, setOpenIndex] = useState(null);
	const items = content?.items ?? [];
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x max-w-3xl",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: content?.heading || "FAQ" }), /* @__PURE__ */ jsx("dl", {
				className: "mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]",
				children: items.map((item, index) => {
					const open = openIndex === index;
					const panelId = `faq-answer-${index}`;
					return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setOpenIndex(open ? null : index),
						"aria-expanded": open,
						"aria-controls": panelId,
						className: "flex w-full items-center justify-between gap-6 py-5 text-left",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-display text-[16px] font-bold text-[var(--ink-strong)]",
							children: item.question
						}), /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: `shrink-0 text-[18px] leading-none text-[var(--ink-faint)] transition-transform duration-[120ms] ease-out ${open ? "rotate-45" : ""}`,
							children: "+"
						})]
					}) }), /* @__PURE__ */ jsx(FastCollapse, {
						open,
						id: panelId,
						children: /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("p", {
							className: `pb-6 text-[15px] leading-[1.75] text-[var(--mute)] transition-opacity duration-100 motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`,
							children: item.answer
						}) })
					})] }, `${item.question}-${index}`);
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/components/sections/Features.jsx
/**
* @param {{ content?: { heading?: string, items?: Array<{ title?: string, body?: string, accent?: string }> } }} props
*/
function Features({ content }) {
	const reduce = useReducedMotion();
	const items = content?.items ?? [];
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: content?.heading || "Features" }), /* @__PURE__ */ jsx("div", {
				className: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: items.map((item, index) => /* @__PURE__ */ jsxs(motion.article, {
					initial: reduce ? { opacity: 0 } : {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-10% 0px"
					},
					transition: {
						duration: .45,
						delay: index * .06,
						ease: EASE
					},
					className: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "block h-1 w-10 rounded-full",
							style: { background: item.accent || BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] },
							"aria-hidden": true
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "mt-5 font-display text-[18px] font-bold text-[var(--ink-strong)]",
							children: /* @__PURE__ */ jsx(GradientTitle, { text: item.title })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2.5 text-[15px] leading-[1.7] text-[var(--mute)]",
							children: item.body
						})
					]
				}, `${item.title}-${index}`))
			})]
		})
	});
}
//#endregion
//#region resources/js/components/decor/DesignCanvas.jsx
var RICH_QUERY = "(min-width: 1024px)";
var COARSE_QUERY = "(pointer: coarse)";
var SWATCHES = [
	COLORS.grape,
	COLORS.iris,
	COLORS.frost
];
/** Wireframe copy lines inside the app window, as a fraction of its width. */
var COPY_LINES = [
	.78,
	.56,
	.66
];
/**
* One layer of the canvas, set at its own depth so the pointer tilt gives
* the stack parallax. Lengths inside are `cqw` of the canvas, so the whole
* piece scales with its box.
*/
function Layer({ depth, className = "", style, children }) {
	return /* @__PURE__ */ jsx("div", {
		className: `absolute ${className}`.trimEnd(),
		style: {
			...style,
			transform: `translateZ(${depth}px)`,
			transformStyle: "preserve-3d"
		},
		children
	});
}
/**
* The hero's design object: a working canvas caught mid-session. An app
* window wireframe builds itself (UI/UX), a brand card holds the type and
* the three brand colours (branding), a pen-tool curve draws in with its
* anchors and handles (the craft), a selection frame breathes around the
* brand card, and a named collaborator cursor moves between them.
*
* Three inputs move it, kept apart so none fights the others:
*
* - **Pointer** tilts the whole stage (spring-damped rotateX/rotateY), and
*   the layers' different depths give it parallax.
* - **Scroll** — the hero's own progress, passed in — rolls it, pushes it back
*   and fades it as the hero leaves.
* - **Ambient** CSS animations build the wireframe, draw the curve, pop the
*   swatches and move the cursor, all transform/opacity or a stroke offset,
*   so the canvas is alive while the page is still.
*
* No canvas, no WebGL, no per-frame React state. It is shown from desktop
* width up; there, coarse pointers drop the pointer tracking and the ambient
* motion and keep only the scroll response, and reduced motion renders it
* static.
*
* @param {{ progress?: import('framer-motion').MotionValue<number> }} props
*   `progress` is the hero's scroll progress (0 at rest, 1 once the hero has
*   scrolled away).
*/
function DesignCanvas({ progress }) {
	const reduce = useReducedMotion();
	const hostRef = useRef(null);
	const [rich, setRich] = useState(false);
	const [running, setRunning] = useState(true);
	const pointerX = useMotionValue(0);
	const pointerY = useMotionValue(0);
	const tiltY = useSpring(pointerX, {
		stiffness: 60,
		damping: 18,
		mass: .6
	});
	const tiltX = useSpring(pointerY, {
		stiffness: 60,
		damping: 18,
		mass: .6
	});
	useEffect(() => {
		const rq = window.matchMedia(RICH_QUERY);
		const cq = window.matchMedia(COARSE_QUERY);
		const update = () => setRich(rq.matches && !cq.matches);
		update();
		rq.addEventListener("change", update);
		cq.addEventListener("change", update);
		return () => {
			rq.removeEventListener("change", update);
			cq.removeEventListener("change", update);
		};
	}, []);
	useEffect(() => {
		if (!rich || reduce) return void 0;
		const onMove = (event) => {
			const nx = event.clientX / window.innerWidth * 2 - 1;
			const ny = event.clientY / window.innerHeight * 2 - 1;
			pointerX.set(nx * 16);
			pointerY.set(ny * -12);
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => window.removeEventListener("pointermove", onMove);
	}, [
		rich,
		reduce,
		pointerX,
		pointerY
	]);
	useEffect(() => {
		const host = hostRef.current;
		if (!host || typeof IntersectionObserver === "undefined") return void 0;
		let onScreen = true;
		const sync = () => setRunning(onScreen && !document.hidden);
		const io = new IntersectionObserver(([entry]) => {
			onScreen = entry.isIntersecting;
			sync();
		}, { rootMargin: "10% 0px" });
		io.observe(host);
		document.addEventListener("visibilitychange", sync);
		return () => {
			io.disconnect();
			document.removeEventListener("visibilitychange", sync);
		};
	}, []);
	const fallback = useMotionValue(0);
	const scroll = progress ?? fallback;
	const scrollRoll = useTransform(scroll, [0, 1], [0, 18]);
	const scrollY = useTransform(scroll, [0, 1], [0, -90]);
	const scrollZ = useTransform(scroll, [0, 1], [0, -260]);
	const scrollFade = useTransform(scroll, [0, .75], [1, 0]);
	const animated = !reduce;
	const ambient = animated && rich;
	const live = (name) => ambient ? name : "";
	const play = { animationPlayState: running ? "running" : "paused" };
	return /* @__PURE__ */ jsx("div", {
		ref: hostRef,
		className: "design-canvas pointer-events-none absolute right-[4%] top-[26%] hidden h-[min(32vw,430px)] w-[min(32vw,430px)] lg:block",
		style: {
			perspective: "900px",
			containerType: "size"
		},
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "relative h-full w-full",
			style: {
				transformStyle: "preserve-3d",
				rotateX: ambient ? tiltX : 0,
				rotateY: ambient ? tiltY : 0,
				rotateZ: animated ? scrollRoll : 0,
				y: animated ? scrollY : 0,
				z: animated ? scrollZ : 0,
				opacity: animated ? scrollFade : 1
			},
			children: /* @__PURE__ */ jsxs(motion.div, {
				className: "absolute inset-0",
				style: {
					transformStyle: "preserve-3d",
					rotateX: 8,
					rotateY: -14
				},
				initial: animated ? {
					opacity: 0,
					y: 24
				} : false,
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .9,
					delay: .35,
					ease: [...EASE]
				},
				children: [
					/* @__PURE__ */ jsxs(Layer, {
						depth: -40,
						className: "design-canvas__panel left-[2cqw] top-[6cqw] w-[66cqw] p-[3cqw]",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "mb-[3cqw] flex gap-[1.2cqw]",
								children: SWATCHES.map((color) => /* @__PURE__ */ jsx("span", {
									className: "h-[1.6cqw] w-[1.6cqw] rounded-full",
									style: { background: `${color}aa` }
								}, color))
							}),
							/* @__PURE__ */ jsx("div", {
								className: `design-canvas__build h-[15cqw] rounded-[1.4cqw] ${live("design-canvas__build--run")}`.trimEnd(),
								style: {
									...play,
									background: `linear-gradient(120deg, ${COLORS.grape}55, ${COLORS.iris}44 55%, ${COLORS.frost}33)`
								}
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-[3cqw] space-y-[1.6cqw]",
								children: COPY_LINES.map((width, index) => /* @__PURE__ */ jsx("div", {
									className: `design-canvas__build design-canvas__line h-[1.5cqw] rounded-full ${live("design-canvas__build--run")}`.trimEnd(),
									style: {
										...play,
										width: `${width * 100}%`,
										animationDelay: `${.25 + index * .2}s`
									}
								}, width))
							}),
							/* @__PURE__ */ jsx("div", {
								className: `design-canvas__build mt-[3.2cqw] h-[4.4cqw] w-[20cqw] rounded-full ${live("design-canvas__build--run")}`.trimEnd(),
								style: {
									...play,
									background: COLORS.gradient,
									animationDelay: "0.9s"
								}
							})
						]
					}),
					/* @__PURE__ */ jsxs(Layer, {
						depth: 40,
						className: "left-[42cqw] top-[40cqw] w-[50cqw]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: `design-canvas__select absolute inset-[-1.6cqw] ${live("design-canvas__select--run")}`.trimEnd(),
							style: play,
							children: [[
								"left-0 top-0",
								"right-0 top-0",
								"bottom-0 left-0",
								"bottom-0 right-0"
							].map((corner) => /* @__PURE__ */ jsx("span", { className: `design-canvas__handle absolute ${corner}` }, corner)), /* @__PURE__ */ jsx("span", {
								className: "design-canvas__size absolute left-1/2 top-full mt-[1.4cqw] -translate-x-1/2",
								children: "480 × 300"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "design-canvas__panel p-[3.2cqw]",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-end justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-display text-[12cqw] font-bold leading-[0.9] text-[var(--ink-strong)]",
									children: "Aa"
								}), /* @__PURE__ */ jsxs("span", {
									className: "pb-[0.8cqw] text-right text-[2.2cqw] font-bold uppercase leading-[1.5] tracking-[0.16em] text-[var(--ink-faint)]",
									children: [
										"Display",
										/* @__PURE__ */ jsx("br", {}),
										"Bold"
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-[3cqw] flex gap-[1.8cqw]",
								children: SWATCHES.map((color, index) => /* @__PURE__ */ jsx("span", {
									className: `design-canvas__swatch h-[7cqw] flex-1 rounded-[1.2cqw] ${live("design-canvas__swatch--run")}`.trimEnd(),
									style: {
										...play,
										background: color,
										boxShadow: `0 0 3cqw ${color}66`,
										animationDelay: `${index * .22}s`
									}
								}, color))
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Layer, {
						depth: 70,
						className: "inset-0",
						children: /* @__PURE__ */ jsxs("svg", {
							viewBox: "0 0 100 100",
							className: "h-full w-full overflow-visible",
							children: [
								/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
									id: "design-canvas-pen",
									x1: "0",
									x2: "1",
									y1: "0",
									y2: "0",
									children: [
										/* @__PURE__ */ jsx("stop", {
											offset: "0",
											stopColor: COLORS.grape
										}),
										/* @__PURE__ */ jsx("stop", {
											offset: "0.5",
											stopColor: COLORS.iris
										}),
										/* @__PURE__ */ jsx("stop", {
											offset: "1",
											stopColor: COLORS.frost
										})
									]
								}) }),
								/* @__PURE__ */ jsx("path", {
									d: "M70 34 C70 20 80 30 87 21 S94 6 97 8",
									pathLength: "1",
									fill: "none",
									stroke: "url(#design-canvas-pen)",
									strokeWidth: "0.7",
									strokeLinecap: "round",
									className: `design-canvas__pen ${live("design-canvas__pen--run")}`.trimEnd(),
									style: play
								}),
								/* @__PURE__ */ jsx("line", {
									x1: "80",
									y1: "30",
									x2: "94",
									y2: "12",
									className: "design-canvas__guide"
								}),
								[[80, 30], [94, 12]].map(([cx, cy]) => /* @__PURE__ */ jsx("circle", {
									cx,
									cy,
									r: "0.9",
									className: "design-canvas__knob"
								}, cx)),
								[
									[70, 34],
									[87, 21],
									[97, 8]
								].map(([x, y]) => /* @__PURE__ */ jsx("rect", {
									x: x - 1.3,
									y: y - 1.3,
									width: "2.6",
									height: "2.6",
									className: "design-canvas__anchor"
								}, x))
							]
						})
					}),
					/* @__PURE__ */ jsx(Layer, {
						depth: 100,
						className: "left-0 top-0",
						children: /* @__PURE__ */ jsxs("div", {
							className: `design-canvas__cursor ${live("design-canvas__cursor--run")}`.trimEnd(),
							style: play,
							children: [/* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 24 24",
								className: "h-[5cqw] w-[5cqw]",
								children: /* @__PURE__ */ jsx("path", {
									d: "M3 2l7.5 19 2.6-7.9L21 10.5z",
									fill: COLORS.grape,
									stroke: "#fff",
									strokeWidth: "1.4",
									strokeLinejoin: "round"
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "ml-[3.6cqw] mt-[-0.6cqw] block w-max rounded-full px-[1.8cqw] py-[0.6cqw] text-[2.2cqw] font-bold uppercase tracking-[0.12em] text-white",
								style: { background: COLORS.grape },
								children: "UI / UX"
							})]
						})
					})
				]
			})
		})
	});
}
//#endregion
//#region resources/js/components/sections/Hero.jsx
/**
* The bar cluster is the logo's own mark, so its geometry is taken straight
* from the artwork rather than chosen by eye. Measured off
* `marketorr-logo-on-light.png` (1000x118): the three bars are 38 / 75 / 112
* tall, 35 wide, set 19 apart — every one of those expressed below as a
* fraction of the tallest bar, which is the single number `--bar-h`.
*
* Sizing it this way keeps the hero mark in the logo's proportions at any
* viewport: change `BAR_HEIGHT` and the widths, gaps and corner radius follow.
*/
var BAR_STEPS = MARK.heights;
var BAR_WIDTH = MARK.width;
var BAR_GAP = MARK.gap;
/**
* Height of the tallest bar. A background brand mark, not a centrepiece: about
* a third of what it was, and it now stays clear of the headline block on
* every width instead of filling the lower hero.
*/
var BAR_HEIGHT = "clamp(4.5rem, 10vw, 8.25rem)";
function BarColumn({ bar, glow }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-2 sm:gap-2.5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "enter enter--grow-y",
			style: {
				"--enter-dur": "0.52s",
				"--enter-delay": `${bar.delay}s`,
				transformOrigin: "50% 100%",
				height: `calc(var(--bar-h) * ${bar.height})`,
				width: `calc(var(--bar-h) * ${BAR_WIDTH})`,
				borderRadius: `calc(var(--bar-h) * ${BAR_WIDTH}) 0 0 0`,
				background: `linear-gradient(180deg, ${bar.color}, ${bar.color}55)`,
				boxShadow: `${glow(bar.color, 42)}, ${glow(bar.color, 90)}`.replace(/, $/, ""),
				border: `1px solid ${bar.color}66`
			}
		}), /* @__PURE__ */ jsx("span", {
			style: {
				"--enter-dur": "0.2s",
				"--enter-delay": `${bar.delay + .28}s`,
				"--enter-y": "6px",
				"--enter-to": .75,
				"--enter-ease": "ease-out"
			},
			className: "enter enter--fade-up font-display text-[7px] font-bold tracking-[0.14em] text-[var(--ink-faint)] sm:text-[8px] sm:tracking-[0.18em]",
			children: bar.label
		})]
	});
}
function Bars({ glow, progress, rich, reduce }) {
	const bars = [
		{
			color: MARK.colors[0],
			height: BAR_STEPS[0],
			label: "IDEA",
			delay: .82
		},
		{
			color: MARK.colors[1],
			height: BAR_STEPS[1],
			label: "EXPERIENCE",
			delay: .9
		},
		{
			color: MARK.colors[2],
			height: BAR_STEPS[2],
			label: "RESULT",
			delay: .98
		}
	];
	const ref = useRef(null);
	const centreShift = useMotionValue(0);
	const width = useMotionValue(0);
	useEffect(() => {
		const element = ref.current;
		const row = element?.parentElement;
		if (!element || !row) return void 0;
		const measure = () => {
			const style = window.getComputedStyle(row);
			const rowWidth = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
			centreShift.set(Math.max(0, (rowWidth - element.offsetWidth) / 2));
			width.set(element.offsetWidth);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(row);
		return () => observer.disconnect();
	}, [centreShift, width]);
	const scale = useTransform(progress, [
		0,
		.32,
		.4
	], rich ? [
		2,
		1.04,
		1
	] : [
		1.5,
		1.02,
		1
	]);
	const x = useTransform(() => {
		const [start, near] = rich ? [.38, .02] : [.18, .01];
		const w = width.get();
		return transform(progress.get(), [
			0,
			.32,
			.4
		], [
			centreShift.get() + w * start,
			w * near,
			0
		]);
	});
	const y = useTransform(progress, [
		0,
		.32,
		.4
	], rich ? [
		"-18%",
		"-1%",
		"0%"
	] : [
		"-10%",
		"-1%",
		"0%"
	]);
	const opacity = useTransform(progress, [
		0,
		.28,
		.4
	], rich ? [
		.22,
		.85,
		1
	] : [
		.25,
		.9,
		1
	]);
	return /* @__PURE__ */ jsx(motion.div, {
		ref,
		style: {
			...reduce ? {} : {
				scale,
				x,
				y,
				opacity
			},
			"--bar-h": BAR_HEIGHT
		},
		className: "relative origin-bottom",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx("div", {
			className: "relative flex items-end",
			style: { gap: `calc(var(--bar-h) * ${BAR_GAP})` },
			children: bars.map((bar) => /* @__PURE__ */ jsx(BarColumn, {
				bar,
				glow
			}, bar.label))
		})
	});
}
/**
* @param {{ content?: { eyebrow?: string, headingLines?: string[], subtext?: string } }} props
*   Content from the page's Hero section. Falls back to the site-wide hero in
*   Settings, so the component still renders on a page with no Hero widget.
*/
function Hero({ content }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const fx = useThemeMotion();
	const [desktopMotion, setDesktopMotion] = useState(false);
	const [richMotion, setRichMotion] = useState(false);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"]
	});
	const contentY = useTransform(scrollYProgress, [0, 1], [0, -72]);
	const contentOpacity = useTransform(scrollYProgress, [0, .85], [1, .84]);
	const contentScale = useTransform(scrollYProgress, [0, 1], [1, .97]);
	const barsDim = useTransform(scrollYProgress, [.05, .4], [1, .35]);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const update = () => setDesktopMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 768px)");
		const update = () => setRichMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	const { settings } = usePage().props;
	const hero = {
		...settings.hero,
		...content?.eyebrow ? { eyebrow: content.eyebrow } : {},
		...content?.headingLines?.length ? { headingLines: content.headingLines } : {},
		...content?.subtext ? { subtext: content.subtext } : {}
	};
	const headingLines = hero.headingLines.map((line, index) => [line, index === hero.headingLines.length - 1 ? "text-gradient" : ""]);
	const exitMotion = desktopMotion && !reduce ? {
		y: contentY,
		opacity: contentOpacity,
		scale: contentScale
	} : void 0;
	return /* @__PURE__ */ jsxs("section", {
		ref,
		id: "home",
		className: "noise relative flex min-h-0 flex-col overflow-hidden bg-[var(--bg)] sm:min-h-svh",
		children: [
			/* @__PURE__ */ jsxs("div", {
				style: { "--enter-dur": "0.32s" },
				className: "enter enter--settle pointer-events-none absolute inset-0",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ jsx(Stage, { variant: "hero" }),
					/* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0" }),
					/* @__PURE__ */ jsx(DesignCanvas, { progress: scrollYProgress })
				]
			}),
			/* @__PURE__ */ jsxs(motion.div, {
				style: exitMotion,
				className: "container-x relative z-10 flex flex-none flex-col justify-start pb-4 pt-24 sm:flex-1 sm:justify-center sm:pt-32",
				children: [
					/* @__PURE__ */ jsx("p", {
						style: {
							"--enter-dur": "0.3s",
							"--enter-delay": "0.12s",
							"--enter-y": "14px"
						},
						className: "enter enter--fade-up mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] sm:mb-6 sm:text-[12px] sm:tracking-[0.28em]",
						children: hero.eyebrow
					}),
					/* @__PURE__ */ jsx(ScrollHeading, {
						intensity: .55,
						children: /* @__PURE__ */ jsx("h1", {
							className: "display-xl uppercase text-[var(--ink-strong)]",
							children: headingLines.map(([line, className], index) => /* @__PURE__ */ jsx("span", {
								className: "mask-line",
								children: /* @__PURE__ */ jsx("span", {
									className: `mask-inner enter enter--mask-up ${className}`,
									style: {
										"--enter-dur": "0.52s",
										"--enter-delay": `${.2 + index * .08}s`
									},
									children: line
								})
							}, line))
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "enter enter--scale-x mt-6 h-[3px] w-full max-w-xl origin-left sm:mt-8",
						style: {
							"--enter-dur": "0.42s",
							"--enter-delay": "0.48s",
							background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)"
						},
						"aria-hidden": true
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 flex flex-col gap-7 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10",
						children: [/* @__PURE__ */ jsx("p", {
							style: {
								"--enter-dur": "0.38s",
								"--enter-delay": "0.6s"
							},
							className: "enter enter--fade-up max-w-md text-[15px] leading-relaxed text-[var(--mute)] sm:text-[16px]",
							children: hero.subtext
						}), /* @__PURE__ */ jsxs("div", {
							style: {
								"--enter-dur": "0.38s",
								"--enter-delay": "0.7s"
							},
							className: "enter enter--fade-up flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4",
							children: [/* @__PURE__ */ jsx(MagneticButton, {
								className: "w-full sm:w-auto",
								children: /* @__PURE__ */ jsxs(Link, {
									href: "/work",
									"data-cursor": "cta",
									className: "btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white sm:w-auto",
									style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
									children: ["View our work ", /* @__PURE__ */ jsx("span", {
										"data-arrow": true,
										"aria-hidden": true,
										children: "↗"
									})]
								})
							}), /* @__PURE__ */ jsx(MagneticButton, {
								className: "w-full sm:w-auto",
								children: /* @__PURE__ */ jsxs(Link, {
									href: "/contact",
									"data-cursor": "cta",
									className: "btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)] sm:w-auto",
									children: ["Start a project ", /* @__PURE__ */ jsx("span", {
										"data-arrow": "horizontal",
										"aria-hidden": true,
										children: "→"
									})]
								})
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs(motion.div, {
				style: reduce ? void 0 : { opacity: barsDim },
				className: "container-x relative z-0 mt-24 flex items-end justify-start pb-8 sm:mt-10 sm:pb-10",
				children: [/* @__PURE__ */ jsx(Bars, {
					glow: fx.barGlow,
					progress: scrollYProgress,
					rich: richMotion,
					reduce
				}), /* @__PURE__ */ jsx("div", {
					className: "hidden flex-1 justify-end md:flex",
					children: /* @__PURE__ */ jsxs(Link, {
						href: "/about",
						className: "btn-press flex flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: ["Scroll to explore", /* @__PURE__ */ jsx("span", {
							className: "block h-10 w-[1px] bg-gradient-to-b from-[#891FFB] via-[#507AF4] to-[#1BE2EB]",
							"aria-hidden": true
						})]
					})
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/components/sections/Marquee.jsx
/**
* Looping strip of short words. The three brand colours cycle across the
* items, so any number of words stays on-palette.
*
* @param {{ content?: { items?: string[] } }} props
*/
function Marquee({ content }) {
	const words = content?.items?.length ? content.items : [
		"IDEA",
		"EXPERIENCE",
		"RESULT"
	];
	const items = Array.from({ length: 8 }).flatMap(() => words);
	return /* @__PURE__ */ jsx("div", {
		className: "relative overflow-hidden border-y border-[var(--line)] bg-[var(--surface)] py-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx("div", {
			className: "flex w-max animate-marquee gap-8 whitespace-nowrap",
			children: [0, 1].map((half) => /* @__PURE__ */ jsx("div", {
				className: "flex gap-8",
				children: items.map((word, index) => /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-8 font-display text-[13px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]",
					children: [word, /* @__PURE__ */ jsx("span", {
						className: "h-2 w-2 rounded-full",
						style: { background: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] }
					})]
				}, `${half}-${index}`))
			}, half))
		})
	});
}
//#endregion
//#region resources/js/components/sections/ProgressionBands.jsx
/**
* Full-width scroll-driven typography band under Our Work: what Marketorr
* designs, and who for.
*
* Two oversized rows set in the site's heavy display face - disciplines in
* solid ink, industries as a dim ghost of them - each with its own small caption, framed
* by hairlines and fading out at both edges. A small four-point star in
* the brand gradient separates the words. The rows drift slowly in opposite directions at a steady pace;
* scrolling the page does not move, speed up or reveal them. One word per
* row carries the brand gradient.
*
* Performance contract: a single requestAnimationFrame loop per mount,
* transform writes only, cached row widths (remeasured on resize and font
* load), IntersectionObserver gating so the loop idles off-screen, and full
* cleanup on unmount. Reduced-motion users get the same rows rendered
* statically.
*/
var ROWS = [{
	caption: "Disciplines",
	items: [
		"Branding",
		"UI/UX",
		"Web Design",
		"Mobile Apps",
		"SaaS Product",
		"Packaging",
		"Motion",
		"Design Systems"
	],
	highlight: "UI/UX",
	ghost: false
}, {
	caption: "Industries",
	items: [
		"E-Commerce",
		"Fintech",
		"Healthcare",
		"Real Estate",
		"Fashion",
		"Hospitality",
		"Startups",
		"Enterprise"
	],
	highlight: "Startups",
	ghost: true
}];
/** Steady drift speed, in px per second. */
var DRIFT_SPEED = 27;
/** The separator between words: a four-point star in the brand gradient. */
function Spark() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		className: "mx-[0.5em] h-[0.34em] w-[0.34em] shrink-0",
		"aria-hidden": true,
		children: [/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
			id: "progression-spark",
			x1: "0",
			y1: "0",
			x2: "1",
			y2: "1",
			children: [
				/* @__PURE__ */ jsx("stop", {
					offset: "0",
					stopColor: "#830DFD"
				}),
				/* @__PURE__ */ jsx("stop", {
					offset: "0.5",
					stopColor: "#4A76F8"
				}),
				/* @__PURE__ */ jsx("stop", {
					offset: "1",
					stopColor: "#10E2F1"
				})
			]
		}) }), /* @__PURE__ */ jsx("path", {
			d: "M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z",
			fill: "url(#progression-spark)"
		})]
	});
}
function RowContent({ items, highlight }) {
	return /* @__PURE__ */ jsx(Fragment$1, { children: items.map((word, i) => /* @__PURE__ */ jsxs("span", {
		className: "flex shrink-0 items-center",
		children: [/* @__PURE__ */ jsx("span", {
			className: word === highlight ? "progression-highlight inline-block" : void 0,
			children: word
		}), /* @__PURE__ */ jsx(Spark, {})]
	}, i)) });
}
function ProgressionBands() {
	const bandRef = useRef(null);
	const rowRefs = useRef([]);
	const reduceRef = useRef(false);
	useEffect(() => {
		reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const band = bandRef.current;
		if (!band || reduceRef.current) return void 0;
		const rows = rowRefs.current.filter(Boolean);
		if (rows.length === 0) return void 0;
		const count = rows.length;
		const positions = new Array(count).fill(0);
		const halves = new Array(count).fill(0);
		const directions = rows.map((_, i) => i % 2 === 0 ? -1 : 1);
		const measure = () => {
			rows.forEach((row, i) => {
				halves[i] = row.scrollWidth / 2 || 1;
			});
		};
		measure();
		if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
		let rafId = 0;
		let running = false;
		let lastTime = 0;
		const frame = (time) => {
			if (!running) return;
			const seconds = lastTime ? Math.min(.1, (time - lastTime) / 1e3) : 0;
			lastTime = time;
			for (let i = 0; i < count; i += 1) {
				positions[i] += directions[i] * DRIFT_SPEED * seconds;
				const half = halves[i] || 1;
				const wrapped = -((positions[i] % half + half) % half);
				const el = rows[i];
				if (el) el.style.transform = `translate3d(${wrapped.toFixed(2)}px,0,0)`;
			}
			rafId = requestAnimationFrame(frame);
		};
		const start = () => {
			if (running) return;
			running = true;
			lastTime = 0;
			rafId = requestAnimationFrame(frame);
		};
		const stop = () => {
			running = false;
			if (rafId) cancelAnimationFrame(rafId);
			rafId = 0;
		};
		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) start();
			else stop();
		}, { rootMargin: "20% 0px" });
		observer.observe(band);
		window.addEventListener("resize", measure);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
			stop();
		};
	}, []);
	return /* @__PURE__ */ jsx("section", {
		"aria-label": "What Marketorr designs, and who for",
		className: "relative overflow-hidden pb-12 pt-6 md:pb-16 md:pt-8",
		children: /* @__PURE__ */ jsx("div", {
			ref: bandRef,
			className: "border-y border-[var(--line)]",
			"aria-hidden": true,
			children: ROWS.map((row, i) => /* @__PURE__ */ jsxs("div", {
				className: i > 0 ? "border-t border-[var(--line)]" : void 0,
				children: [/* @__PURE__ */ jsx("p", {
					className: "container-x pt-5 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] md:pt-6",
					children: row.caption
				}), /* @__PURE__ */ jsx("div", {
					className: "progression-row overflow-hidden py-3 md:py-5",
					children: /* @__PURE__ */ jsxs("div", {
						ref: (node) => {
							rowRefs.current[i] = node;
						},
						className: `flex w-max whitespace-nowrap font-display text-[clamp(2.4rem,7vw,6.25rem)] font-extrabold uppercase leading-[1] tracking-[-0.035em] will-change-transform ${row.ghost ? "progression-ghost" : "text-[var(--ink-strong)]"}`,
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex shrink-0 items-center",
							children: /* @__PURE__ */ jsx(RowContent, {
								items: row.items,
								highlight: row.highlight
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "flex shrink-0 items-center",
							children: /* @__PURE__ */ jsx(RowContent, {
								items: row.items,
								highlight: row.highlight
							})
						})]
					})
				})]
			}, row.caption))
		})
	});
}
//#endregion
//#region resources/js/components/sections/OurWork.jsx
/** Every project card shares this ratio, so the strip is one set of equal objects. */
var CARD_RATIO = 16 / 10;
/** Parallax + cover-reveal are desktop/tablet only; phones keep a plain fade. */
function useRichMotion() {
	const [rich, setRich] = useState(false);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 768px)");
		const update = () => setRich(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return rich;
}
/** Sticky scroll runways are desktop mouse/trackpad interactions only. */
function useDesktopScrollStage() {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const update = () => setEnabled(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return enabled;
}
/**
* Real project cover: masked reveal on entry, slow scroll parallax, fast hover.
*
* @param {{ p: import('../../lib/projects').Project, glow: (color: string, size: number) => string, rich: boolean, progress: import('framer-motion').MotionValue<number> }} props
*/
function ProjectCover({ p, glow, rich, progress }) {
	const reduce = useReducedMotion();
	const cardMedia = projectCardMedia(p, "(max-width: 768px) 78vw, 50vw");
	const parallax = rich && !reduce;
	const y = useTransform(progress, [0, 1], parallax ? ["-3%", "3%"] : ["0%", "0%"]);
	const branded = isCharukothon(p.slug);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative h-full w-full overflow-hidden bg-[#111116]",
		style: { containerType: "inline-size" },
		children: [
			branded ? /* @__PURE__ */ jsx(motion.div, {
				className: "absolute inset-x-0 -top-[3%] h-[106%]",
				style: {
					y,
					willChange: parallax ? "transform" : void 0
				},
				initial: { scale: reduce ? 1 : 1.06 },
				whileInView: { scale: 1 },
				viewport: {
					once: true,
					margin: "-10% 0px"
				},
				transition: {
					duration: .9,
					ease: [...EASE]
				},
				children: /* @__PURE__ */ jsx(CharukothonCover, { image: p.thumb || p.image })
			}) : /* @__PURE__ */ jsx(motion.div, {
				className: "absolute inset-x-0 -top-[3%] h-[106%]",
				style: {
					y,
					willChange: parallax ? "transform" : void 0
				},
				initial: { scale: reduce ? 1 : 1.06 },
				whileInView: { scale: 1 },
				viewport: {
					once: true,
					margin: "-10% 0px"
				},
				transition: {
					duration: .9,
					ease: [...EASE]
				},
				children: /* @__PURE__ */ jsx("img", {
					src: cardMedia.src,
					srcSet: cardMedia.srcSet,
					sizes: cardMedia.sizes,
					alt: cardMedia.alt,
					loading: "lazy",
					decoding: "async",
					className: `h-full w-full transition-transform duration-200 ease-out group-hover:scale-[1.035] ${cardMedia.fit === "contain" ? "object-contain" : "object-cover"}`
				})
			}),
			!branded && /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-200 group-hover:opacity-70",
				style: { background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}1f, transparent 58%), linear-gradient(180deg, transparent 0%, transparent 50%, rgba(8,8,10,0.34) 76%, rgba(8,8,10,0.72) 100%)` },
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx(ProjectMotion, { slug: p.slug }),
			!reduce && /* @__PURE__ */ jsx(motion.span, {
				className: "absolute inset-0 origin-bottom bg-[var(--bg-soft)]",
				initial: { scaleY: 1 },
				whileInView: { scaleY: 0 },
				viewport: {
					once: true,
					margin: "-10% 0px"
				},
				transition: {
					duration: .6,
					ease: [...EASE]
				},
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "absolute bottom-4 left-4 flex max-w-[calc(100%-5rem)] items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 md:bottom-6 md:left-6 md:max-w-[calc(100%-6rem)]",
				style: { boxShadow: glow ? glow(p.accent, 26) : void 0 },
				"aria-hidden": true,
				children: [/* @__PURE__ */ jsx("span", {
					className: "h-1.5 w-1.5 rounded-full",
					style: { background: p.accent }
				}), /* @__PURE__ */ jsx("span", {
					className: "truncate font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/80",
					children: p.category
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black transition-transform duration-200 group-hover:scale-105 md:bottom-6 md:right-6 md:h-14 md:w-14",
				"aria-hidden": true,
				children: /* @__PURE__ */ jsx("span", {
					"data-arrow": true,
					children: "↗"
				})
			}),
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-200 group-hover:border-white/20",
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100",
				style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
				"aria-hidden": true
			})
		]
	});
}
/**
* One carousel slide. Every card now shares the same ratio and the same row
* height (`--mq-h`), so the strip reads as one set of equal objects — the
* per-card ratios and the vertical drift that used to stagger them are gone,
* since both are exactly what made the row look misaligned.
*
* The card keeps its pointer tilt: the carousel slot around it owns the
* travel, depth and focus, this owns the hover response.
*
* @param {{ p: import('../../lib/projects').Project, glow?: (color: string, size: number) => string, className?: string, ratio?: number }} props
*/
function Card({ p, glow, className = "", ratio = CARD_RATIO, focus }) {
	const ref = useRef(null);
	const rich = useRichMotion();
	const reduce = useReducedMotion();
	const tapIntent = useTapIntent();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});
	const tiltable = rich && !reduce;
	const pointerX = useMotionValue(0);
	const pointerY = useMotionValue(0);
	const tiltY = useSpring(pointerX, {
		stiffness: 150,
		damping: 20,
		mass: .4
	});
	const tiltX = useSpring(pointerY, {
		stiffness: 150,
		damping: 20,
		mass: .4
	});
	const applyTilt = useCallback((fx, fy) => {
		pointerX.set((fx - .5) * 11);
		pointerY.set((fy - .5) * -8);
	}, [pointerX, pointerY]);
	const pointer = useBoxPointer(applyTilt, { enabled: tiltable });
	const onPointerLeave = (event) => {
		pointer.onPointerLeave(event);
		pointerX.set(0);
		pointerY.set(0);
	};
	const meta = {
		hidden: {},
		show: { transition: {
			staggerChildren: .06,
			delayChildren: .12
		} }
	};
	const metaItem = {
		hidden: reduce ? { opacity: 0 } : {
			opacity: 0,
			y: 14
		},
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: .45,
				ease: [...EASE]
			}
		}
	};
	return /* @__PURE__ */ jsx(motion.div, {
		ref,
		whileTap: { scale: .985 },
		transition: { duration: .18 },
		onPointerEnter: pointer.onPointerEnter,
		onPointerMove: pointer.onPointerMove,
		onPointerLeave,
		className: `w-full ${className}`.trimEnd(),
		style: {
			rotateX: tiltable ? tiltX : 0,
			rotateY: tiltable ? tiltY : 0,
			transformPerspective: 1100
		},
		children: /* @__PURE__ */ jsxs(Link, {
			href: `/work/${p.slug}`,
			"data-cursor": "view",
			...tapIntent,
			className: "group block",
			"aria-label": `View ${p.title} case study`,
			children: [/* @__PURE__ */ jsx("div", {
				className: "w-full overflow-hidden rounded-2xl border border-[var(--line)]",
				style: {
					height: "var(--mq-h)",
					aspectRatio: ratio
				},
				children: /* @__PURE__ */ jsx(ProjectCover, {
					p,
					glow,
					rich,
					progress: scrollYProgress
				})
			}), /* @__PURE__ */ jsx(motion.div, {
				style: focus ? { opacity: focus } : void 0,
				children: /* @__PURE__ */ jsx(motion.div, {
					variants: meta,
					initial: "hidden",
					whileInView: "show",
					viewport: {
						once: true,
						margin: "-12% 0px"
					},
					className: "mt-5 flex flex-wrap items-start justify-between gap-4",
					children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(motion.h3, {
						variants: metaItem,
						className: "font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)] md:text-3xl",
						children: /* @__PURE__ */ jsx(GradientTitle, { text: p.title })
					}), /* @__PURE__ */ jsx(motion.div, {
						variants: metaItem,
						className: "mt-3 flex flex-wrap gap-2",
						children: p.tags.map((t) => /* @__PURE__ */ jsx(Tag, {
							accent: p.accent,
							children: t
						}, t))
					})] })
				})
			})]
		})
	});
}
/** Compact two-column card used only below the tablet breakpoint. */
function MobileCard({ p, focus }) {
	const reduce = useReducedMotion();
	const tapIntent = useTapIntent();
	const cardMedia = projectCardMedia(p, "78vw");
	return /* @__PURE__ */ jsx(motion.article, {
		initial: {
			opacity: 0,
			y: reduce ? 0 : 18
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		whileTap: { scale: .985 },
		viewport: {
			once: true,
			margin: "-8% 0px"
		},
		transition: {
			duration: reduce ? 0 : .35,
			ease: [...EASE]
		},
		className: "w-full",
		children: /* @__PURE__ */ jsxs(Link, {
			href: `/work/${p.slug}`,
			"data-cursor": "view",
			...tapIntent,
			className: "group block h-full min-w-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2",
			"aria-label": `View ${p.title} case study`,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative aspect-[4/3] overflow-hidden rounded-lg bg-[#111116]",
				style: { containerType: "inline-size" },
				children: [
					isCharukothon(p.slug) ? /* @__PURE__ */ jsx(CharukothonCover, { image: p.thumb || p.image }) : /* @__PURE__ */ jsx("img", {
						src: cardMedia.src,
						srcSet: cardMedia.srcSet,
						sizes: cardMedia.sizes,
						alt: cardMedia.alt,
						loading: "lazy",
						decoding: "async",
						className: `absolute inset-0 h-full w-full transition-transform duration-200 ease-out group-hover:scale-[1.035] ${cardMedia.fit === "contain" ? "object-contain" : "object-cover"}`
					}),
					/* @__PURE__ */ jsx("div", {
						className: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.30)_0%,transparent_24%,transparent_54%,rgba(8,8,10,0.28)_78%,rgba(8,8,10,0.58)_100%)] transition-opacity duration-200 group-hover:opacity-75",
						"aria-hidden": true
					}),
					/* @__PURE__ */ jsx(ProjectMotion, { slug: p.slug }),
					/* @__PURE__ */ jsx("div", {
						className: "absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-black transition-transform duration-200 group-hover:scale-105",
						"aria-hidden": true,
						children: /* @__PURE__ */ jsx("span", {
							"data-arrow": true,
							children: "↗"
						})
					})
				]
			}), /* @__PURE__ */ jsxs(motion.div, {
				className: "min-w-0 px-0.5 pb-0.5 pt-2",
				style: focus ? { opacity: focus } : void 0,
				children: [/* @__PURE__ */ jsx("h3", {
					className: "min-h-[2.25rem] overflow-hidden font-display text-[13px] font-extrabold uppercase leading-[1.05] text-[var(--ink-strong)]",
					children: /* @__PURE__ */ jsx(GradientTitle, { text: p.title })
				}), p.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex min-w-0 items-center gap-1",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--chip)] px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]",
						children: [/* @__PURE__ */ jsx("span", {
							className: "h-1 w-1 shrink-0 rounded-full",
							style: { background: p.accent },
							"aria-hidden": true
						}), /* @__PURE__ */ jsx("span", {
							className: "truncate",
							children: p.tags[0]
						})]
					}), p.tags.length > 1 && /* @__PURE__ */ jsxs("span", {
						className: "shrink-0 text-[7px] font-bold text-[var(--ink-faint)]",
						children: ["+", p.tags.length - 1]
					})]
				})]
			})]
		})
	});
}
/** Image-free final slide linking the showcase to the full branding portfolio. */
function SeeAllWorkCard({ focus }) {
	const tapIntent = useTapIntent();
	return /* @__PURE__ */ jsx(motion.div, {
		className: "w-full",
		style: focus ? { opacity: focus } : void 0,
		children: /* @__PURE__ */ jsxs(Link, {
			href: "/work/portfolio/branding",
			prefetch: true,
			"data-cursor": "cta",
			...tapIntent,
			className: "group relative flex h-[var(--mq-h)] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-[transform,border-color] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-[#507AF4]/50 focus-visible:-translate-y-1 sm:p-8",
			"aria-label": "See all branding work",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "absolute inset-x-0 top-0 h-[2px] origin-left scale-x-[0.18] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100",
					style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] sm:text-[11px]",
						children: "Branding portfolio"
					}), /* @__PURE__ */ jsxs("span", {
						className: "flex gap-1.5",
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#891FFB]" }),
							/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#507AF4]" }),
							/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#1BE2EB]" })
						]
					})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "max-w-[15rem] text-[10px] leading-relaxed text-[var(--mute)] sm:text-[13px]",
					children: "Explore the complete collection of identities, logos and packaging."
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "flex items-end justify-between gap-5",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-2 font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-strong)] sm:text-[13px]",
						children: ["See all branding", /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "transition-transform duration-300 group-hover:translate-x-1",
							children: "→"
						})]
					}), /* @__PURE__ */ jsx("span", {
						className: "see-all-work__arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-base text-[var(--ink)] transition-[opacity,transform,background-color,color,border-color] duration-300 group-hover:border-transparent group-hover:bg-[#507AF4] group-hover:text-white group-focus-visible:border-transparent group-focus-visible:bg-[#507AF4] group-focus-visible:text-white sm:h-12 sm:w-12 sm:text-lg",
						"aria-hidden": true,
						children: "↗"
					})]
				})
			]
		})
	});
}
/**
* How far a slide is allowed to recede before the effect stops deepening —
* past this many places from the focus it is already fully back and dim.
*/
var DEPTH_SPAN = 3;
/**
* Per-place cues. Phones get the flattened set: wider travel so slides clear
* each other without depth, and no rotation or Z at all — on a phone those buy
* a 3D rendering path and a repaint, not a sense of space.
*/
var CAROUSEL = {
	rich: {
		travel: 66,
		depth: 190,
		turn: 21,
		shrink: .085,
		fade: .3
	},
	light: {
		travel: 84,
		depth: 0,
		turn: 0,
		shrink: .06,
		fade: .26
	}
};
/** Seconds of projected travel granted to a flick after release. */
var INERTIA_SECONDS = .19;
/** A flick can carry at most this many places, so it never rockets past. */
var INERTIA_MAX = 2;
/** Pointer travel (px) after which a gesture counts as a drag, not a tap. */
var DRAG_SLOP = 6;
/**
* @param {number} value
* @param {number} min
* @param {number} max
* @return {number}
*/
function clamp(value, min, max) {
	return value < min ? min : value > max ? max : value;
}
/**
* One slide in the 3D stack. Its whole appearance is a function of how many
* places it sits from the focus, so nothing here has to know about drags,
* wheels or springs.
*
* Each slide carries its own perspective rather than inheriting one from a
* shared stage: the viewport has to clip, and an ancestor that clips forces
* `transform-style` back to flat, which would throw the depth away.
*
* @param {{
*   children: import('react').ReactNode,
*   index: number,
*   position: import('framer-motion').MotionValue<number>,
*   stage: { travel: number, depth: number, turn: number, shrink: number, fade: number },
*   flat: boolean,
* }} props
*/
function CarouselSlide({ render, index, position, stage, flat }) {
	const distance = useTransform(position, (value) => clamp(index - value, -3, DEPTH_SPAN));
	const x = useTransform(distance, (value) => `${value * stage.travel}%`);
	const z = useTransform(distance, (value) => -Math.abs(value) * stage.depth);
	const rotateY = useTransform(distance, (value) => -value * stage.turn);
	const scale = useTransform(distance, (value) => 1 - Math.abs(value) * stage.shrink);
	const opacity = useTransform(distance, (value) => Math.max(.08, 1 - Math.abs(value) * stage.fade));
	const zIndex = useTransform(distance, (value) => 100 - Math.round(Math.abs(value) * 10));
	const focus = useTransform(distance, (value) => clamp(1 - Math.abs(value) / .7, 0, 1));
	const pointerEvents = useTransform(distance, (value) => Math.abs(value) < .5 ? "auto" : "none");
	const depth = flat ? {} : {
		z,
		rotateY,
		transformPerspective: 1400
	};
	return /* @__PURE__ */ jsx(motion.li, {
		className: "work-carousel__slide",
		style: {
			x,
			scale,
			opacity,
			zIndex,
			pointerEvents,
			...depth
		},
		children: render(focus)
	});
}
/**
* User-driven 3D project carousel — nothing advances on its own.
*
* One motion value, `position`, is the carousel's whole state: the fractional
* place currently in focus. Every input writes to it and every slide reads
* from it, so the gestures compose instead of competing:
*
* - **Drag** (mouse or touch) moves it 1:1 with the gesture, then releases into
*   inertia: the flick's velocity is projected forward, capped, and snapped to
*   the nearest place, which the spring glides into.
* - **Wheel / trackpad** accumulates the dominant axis until it crosses a
*   slide, then steps. The event is never prevented, so vertical page scrolling
*   remains native while a wheel pass also moves the showcase.
* - **Moving the mouse** across the strip steers it: the outer thirds pull the
*   neighbouring project forward, while a dead zone in the middle leaves the
*   focused card still enough to click.
* - **Arrow keys** step it, which is what replaces the removed timer for
*   keyboard users.
*
* Travel is expressed as a percentage of a slide's own width, so the geometry
* needs no measurement and stays correct through every breakpoint; the one
* measured number is the slide's pixel width, used solely to convert pointer
* distance into places.
*
* Reduced motion gets a plain snap-scrolling row instead — no transforms, no
* gesture handling.
*
* @param {{ projects: Array<import('../../lib/projects').Project>, glow?: (color: string, size: number) => string }} props
*/
function WorkCarousel({ projects, glow, controlledPosition }) {
	const rich = useRichMotion();
	const reduce = useReducedMotion();
	const slideRef = useRef(null);
	const [active, setActive] = useState(0);
	const count = projects.length + 1;
	const last = Math.max(0, count - 1);
	const stage = rich ? CAROUSEL.rich : CAROUSEL.light;
	const settled = useMotionValue(0);
	const dragged = useMotionValue(0);
	const steered = useMotionValue(0);
	const steerSpring = useSpring(steered, {
		stiffness: 90,
		damping: 22,
		mass: .5
	});
	const target = useTransform([
		settled,
		dragged,
		steerSpring
	], ([base, drag, steer]) => clamp(base + drag + steer, 0, last));
	const position = useSpring(target, {
		stiffness: 260,
		damping: 34,
		mass: .5
	});
	useMotionValueEvent(position, "change", (value) => {
		const next = clamp(Math.round(value), 0, last);
		setActive((previous) => previous === next ? previous : next);
	});
	const pitch = useRef(1);
	useEffect(() => {
		const slide = slideRef.current;
		if (!slide || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => {
			pitch.current = Math.max(1, entry.contentRect.width * stage.travel / 100);
		});
		observer.observe(slide);
		return () => observer.disconnect();
	}, [stage.travel]);
	const gesture = useRef({
		id: null,
		startX: 0,
		lastX: 0,
		lastAt: 0,
		velocity: 0,
		moved: false
	});
	const dragging = useRef(false);
	/** Strip box, cached while the cursor is over it. */
	const hoverBox = useRef(null);
	useEffect(() => {
		if (!controlledPosition) return void 0;
		const sync = (value) => {
			if (dragging.current) return;
			settled.set(value);
		};
		sync(controlledPosition.get());
		return controlledPosition.on("change", sync);
	}, [controlledPosition, settled]);
	const stepTo = (place) => {
		settled.set(clamp(place, 0, last));
	};
	const onPointerDown = (event) => {
		if (reduce || count < 2) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		gesture.current = {
			id: event.pointerId,
			startX: event.clientX,
			lastX: event.clientX,
			lastAt: event.timeStamp,
			velocity: 0,
			moved: false
		};
		dragging.current = true;
		steered.set(0);
	};
	const onPointerMove = (event) => {
		if (reduce || count < 2) return;
		if (!dragging.current) {
			if (event.pointerType !== "mouse" || !rich) return;
			if (!hoverBox.current) {
				const rect = event.currentTarget.getBoundingClientRect();
				if (!rect.width) return;
				hoverBox.current = rect;
			}
			const box = hoverBox.current;
			const fromCentre = (event.clientX - box.left) / box.width - .5;
			const past = Math.max(0, Math.abs(fromCentre) - .2) / .3;
			steered.set(Math.sign(fromCentre) * past * .75);
			return;
		}
		const state = gesture.current;
		if (state.id !== event.pointerId) return;
		state.velocity = (event.clientX - state.lastX) / Math.max(1, event.timeStamp - state.lastAt);
		state.lastX = event.clientX;
		state.lastAt = event.timeStamp;
		if (!state.moved && Math.abs(event.clientX - state.startX) > DRAG_SLOP) {
			state.moved = true;
			event.currentTarget.setPointerCapture?.(event.pointerId);
		}
		if (!state.moved) return;
		dragged.set(-(event.clientX - state.startX) / pitch.current);
	};
	const endDrag = (event) => {
		if (!dragging.current) return;
		const state = gesture.current;
		dragging.current = false;
		if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
		if (!state.moved) return;
		const thrown = -state.velocity * 1e3 * INERTIA_SECONDS / pitch.current;
		const landing = Math.round(settled.get() + dragged.get() + clamp(thrown, -2, INERTIA_MAX));
		dragged.set(0);
		stepTo(landing);
	};
	const onPointerLeave = () => {
		hoverBox.current = null;
		steered.set(0);
	};
	const onClickCapture = (event) => {
		if (!gesture.current.moved) return;
		event.preventDefault();
		event.stopPropagation();
		gesture.current.moved = false;
	};
	const onKeyDown = (event) => {
		if (count < 2) return;
		if (event.key === "ArrowRight") stepTo(settled.get() + 1);
		else if (event.key === "ArrowLeft") stepTo(settled.get() - 1);
		else return;
		event.preventDefault();
	};
	const card = (project, focus) => rich ? /* @__PURE__ */ jsx(Card, {
		p: project,
		glow,
		focus
	}) : /* @__PURE__ */ jsx(MobileCard, {
		p: project,
		focus
	});
	if (reduce) return /* @__PURE__ */ jsx("div", {
		className: "work-carousel work-carousel--plain",
		role: "group",
		"aria-label": "Featured projects",
		children: /* @__PURE__ */ jsxs("ul", {
			className: "work-carousel__track work-carousel__track--plain",
			children: [projects.map((project) => /* @__PURE__ */ jsx("li", {
				className: "work-carousel__slide",
				children: card(project)
			}, project.slug)), /* @__PURE__ */ jsx("li", {
				className: "work-carousel__slide",
				children: /* @__PURE__ */ jsx(SeeAllWorkCard, {})
			})]
		})
	});
	return /* @__PURE__ */ jsx("div", {
		className: "work-carousel",
		role: "group",
		"aria-roledescription": "carousel",
		"aria-label": "Featured projects",
		onPointerDown,
		onPointerMove,
		onPointerUp: endDrag,
		onPointerCancel: endDrag,
		onPointerEnter: () => {
			hoverBox.current = null;
		},
		onPointerLeave,
		onClickCapture,
		onKeyDown,
		children: /* @__PURE__ */ jsxs("ul", {
			className: "work-carousel__track",
			children: [projects.map((project, index) => /* @__PURE__ */ jsx(CarouselSlide, {
				index,
				position,
				stage,
				flat: !rich,
				render: (focus) => /* @__PURE__ */ jsx("div", {
					ref: index === 0 ? slideRef : void 0,
					"aria-current": index === active ? "true" : void 0,
					children: card(project, focus)
				})
			}, project.slug)), /* @__PURE__ */ jsx(CarouselSlide, {
				index: projects.length,
				position,
				stage,
				flat: !rich,
				render: (focus) => /* @__PURE__ */ jsx("div", {
					"aria-current": projects.length === active ? "true" : void 0,
					children: /* @__PURE__ */ jsx(SeeAllWorkCard, { focus })
				})
			})]
		})
	});
}
function OurWork({ glow, projects = [] }) {
	const stageRef = useRef(null);
	const desktopStage = useDesktopScrollStage();
	const lastSlide = projects.length;
	const { scrollYProgress: stageProgress } = useScroll({
		target: stageRef,
		offset: ["start 72px", "end end"]
	});
	const controlledPosition = useTransform(stageProgress, [0, 1], [0, lastSlide], { clamp: true });
	return /* @__PURE__ */ jsxs("section", {
		id: "work",
		className: "relative overflow-x-clip bg-[var(--bg-soft)] section-pad",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "container-x relative",
				children: [/* @__PURE__ */ jsx(SectionLabel, { name: "BRANDING WORK" }), /* @__PURE__ */ jsxs("div", {
					className: "mt-10 md:mt-0 lg:py-6",
					children: [/* @__PURE__ */ jsx(RevealText, {
						as: "h2",
						className: "display-lg uppercase text-[var(--ink-strong)]",
						lines: ["Brands that", "create impact."],
						highlightedLines: [1]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-4 max-w-lg text-[15px] text-[var(--mute)]",
						children: "Selected branding work: identities, logos, packaging and the campaigns that carry them."
					})]
				})]
			}),
			projects.length > 0 && /* @__PURE__ */ jsx("div", {
				ref: stageRef,
				className: "work-scroll-stage mt-10 md:mt-12",
				"data-pinned": desktopStage ? "true" : void 0,
				style: { "--work-stage-height": `calc(100svh + ${lastSlide * 52}svh)` },
				children: /* @__PURE__ */ jsx("div", {
					className: "work-scroll-stage__sticky",
					children: /* @__PURE__ */ jsx("div", {
						className: "work-marquee w-full",
						children: /* @__PURE__ */ jsx(WorkCarousel, {
							projects,
							glow,
							controlledPosition: desktopStage ? controlledPosition : void 0
						})
					})
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-6 md:mt-8",
				children: /* @__PURE__ */ jsx(ProgressionBands, {})
			})
		]
	});
}
//#endregion
//#region resources/js/components/sections/Process.jsx
/** Height of the pinned frame's mark (its tallest bar); it keeps the logo's proportions. */
var PINNED_MARK_SIZE = "min(46svh, 22rem, 27vw)";
/** Height of the tallest bar beside each stage on phones. */
var STACKED_MARK_SIZE = "3.25rem";
/** Scroll distance each stage holds the pinned frame for, in viewport heights. */
var STAGE_SVH = 90;
/** Stages take the logo's bar colours in turn. */
var stageColor = (index) => MARK.colors[index % MARK.colors.length];
/**
* One bar of the growing mark, in the logo's shape: fills over its own
* stage's slice of the scroll.
*/
function StageBar({ index, total, progress }) {
	const scaleY = useTransform(progress, [index / total, (index + 1) / total], [.06, 1]);
	return /* @__PURE__ */ jsx("span", {
		className: "relative block overflow-hidden bg-[var(--line)]",
		style: markBarStyle(PINNED_MARK_SIZE, index),
		children: /* @__PURE__ */ jsx(motion.span, {
			className: "absolute inset-0 origin-bottom",
			style: {
				scaleY,
				background: stageColor(index)
			}
		})
	});
}
/**
* Desktop: the section pins for one stretch of scroll per stage. The stage
* word swaps through a mask, the logo's bars grow one after another, and the
* light behind the frame shifts into each stage's colour.
*/
function PinnedProcess({ heading, items }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const [active, setActive] = useState(0);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"]
	});
	const total = items.length;
	useMotionValueEvent(scrollYProgress, "change", (value) => {
		const next = Math.min(total - 1, Math.max(0, Math.floor(value * total)));
		setActive((current) => current === next ? current : next);
	});
	const item = items[active];
	const color = stageColor(active);
	const swap = reduce ? {
		initial: false,
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: 0 }
	} : {
		initial: { y: "105%" },
		animate: { y: "0%" },
		exit: { y: "-105%" },
		transition: {
			duration: .7,
			ease: [...EASE]
		}
	};
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: "relative hidden lg:block",
		style: { height: `${total * STAGE_SVH + 100}svh` },
		children: /* @__PURE__ */ jsxs("div", {
			className: "sticky top-0 flex h-[100svh] items-center overflow-hidden",
			children: [/* @__PURE__ */ jsx(motion.div, {
				"aria-hidden": true,
				className: "pointer-events-none absolute -right-40 top-1/2 h-[48rem] w-[48rem] -translate-y-1/2 rounded-full blur-[160px]",
				animate: {
					backgroundColor: color,
					opacity: .22
				},
				transition: {
					duration: reduce ? 0 : .9,
					ease: [...EASE]
				}
			}), /* @__PURE__ */ jsxs("div", {
				className: "container-x relative grid w-full grid-cols-12 items-center gap-10",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "col-span-7",
					children: [
						/* @__PURE__ */ jsx(SectionLabel, { name: "PROCESS" }),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-6 font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
							children: heading
						}),
						/* @__PURE__ */ jsx("div", {
							className: "relative mt-10 h-[clamp(4rem,7.8vw,8rem)] overflow-hidden",
							children: /* @__PURE__ */ jsx(AnimatePresence, {
								initial: false,
								children: /* @__PURE__ */ jsx(motion.p, {
									...swap,
									className: "absolute inset-0 whitespace-nowrap font-display text-[clamp(3.5rem,7.2vw,7.25rem)] font-extrabold uppercase leading-[1] tracking-[-0.045em]",
									style: { color },
									children: item.stage
								}, active)
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "relative mt-10 min-h-[9rem] max-w-xl",
							children: /* @__PURE__ */ jsx(AnimatePresence, {
								mode: "wait",
								initial: false,
								children: /* @__PURE__ */ jsxs(motion.div, {
									initial: reduce ? false : {
										opacity: 0,
										y: 18
									},
									animate: {
										opacity: 1,
										y: 0
									},
									exit: reduce ? void 0 : {
										opacity: 0,
										y: -12
									},
									transition: {
										duration: .45,
										ease: [...EASE]
									},
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-strong)]",
										children: item.title
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-4 text-[16px] leading-relaxed text-[var(--mute)]",
										children: item.body
									})]
								}, active)
							})
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "col-span-5 flex justify-end",
					children: /* @__PURE__ */ jsx("ol", {
						className: "flex items-start",
						style: { gap: markGap(PINNED_MARK_SIZE) },
						children: items.map((stage, index) => /* @__PURE__ */ jsxs("li", {
							"aria-current": index === active ? "step" : void 0,
							className: "flex flex-col items-center",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex items-end",
								style: { height: PINNED_MARK_SIZE },
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx(StageBar, {
									index,
									total,
									progress: scrollYProgress
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "mt-6 whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-500",
								style: { color: index <= active ? stageColor(index) : "var(--ink-faint)" },
								children: stage.stage
							})]
						}, index))
					})
				})]
			})]
		})
	});
}
/** Phones and tablets: the same stages as a plain column, each arriving in turn. */
function StackedProcess({ heading, items }) {
	const reduce = useReducedMotion();
	return /* @__PURE__ */ jsx("div", {
		className: "section-pad lg:hidden",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "PROCESS" }),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-6 font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
					children: heading
				}),
				/* @__PURE__ */ jsx("ol", {
					className: "mt-10 flex flex-col",
					children: items.map((item, index) => /* @__PURE__ */ jsxs(motion.li, {
						className: "border-t border-[var(--line)] py-10",
						initial: reduce ? false : {
							opacity: 0,
							y: 28
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: {
							once: true,
							margin: "-10% 0px"
						},
						transition: {
							duration: .7,
							ease: [...EASE]
						},
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-end gap-4",
								children: [/* @__PURE__ */ jsx("span", {
									"aria-hidden": true,
									className: "block shrink-0",
									style: {
										...markBarStyle(STACKED_MARK_SIZE, index),
										background: stageColor(index)
									}
								}), /* @__PURE__ */ jsx("p", {
									className: "min-w-0 whitespace-nowrap font-display text-[clamp(2.25rem,11.5vw,5.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.045em]",
									style: { color: stageColor(index) },
									children: item.stage
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-6 font-display text-[1.5rem] font-bold leading-[1.15] text-[var(--ink-strong)]",
								children: item.title
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-3 text-[15px] leading-relaxed text-[var(--mute)]",
								children: item.body
							})
						]
					}, index))
				})
			]
		})
	});
}
/**
* The landing page's Idea -> Experience -> Result story.
*
* @param {{ content?: { heading?: string, items?: Array<{ stage?: string, title?: string, body?: string }> } }} props
*/
function Process({ content }) {
	const items = (content?.items ?? []).filter((item) => item?.stage);
	const heading = content?.heading || "How we work";
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		id: "process",
		className: "noise relative bg-[var(--bg)]",
		children: [/* @__PURE__ */ jsx(PinnedProcess, {
			heading,
			items
		}), /* @__PURE__ */ jsx(StackedProcess, {
			heading,
			items
		})]
	});
}
//#endregion
//#region resources/js/components/sections/Recognition.jsx
/**
* Press and award logos, split across two rows drifting in opposite
* directions so the band reads as movement rather than a static wall.
*
* @param {{ content?: { heading?: string, items?: Array<{ name?: string, image?: string }> } }} props
*/
function Recognition({ content }) {
	const items = (content?.items ?? []).filter((item) => item?.name && item?.image);
	const heading = content?.heading || "Featured and recognised";
	if (items.length === 0) return null;
	const rows = items.length >= 8 ? [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)] : [items];
	return /* @__PURE__ */ jsxs("section", {
		id: "recognition",
		className: "relative overflow-hidden bg-[var(--bg)] section-pad",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: "RECOGNITION" }), /* @__PURE__ */ jsx(RevealText, {
				as: "h2",
				className: "display-md mt-8 max-w-3xl uppercase text-[var(--ink-strong)]",
				lines: [heading]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-10 md:mt-14",
			children: rows.map((row, index) => /* @__PURE__ */ jsx(RecognitionStrip, {
				items: row,
				duration: index === 0 ? 46 : 54,
				reverse: index === 1
			}, index))
		})]
	});
}
//#endregion
//#region resources/js/components/sections/Results.jsx
/**
* One result, set as an oversized number. It slides in from the side and
* counts up as it arrives; alternate rows come from alternate sides.
*/
function ResultRow({ item, index, reduce }) {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "center 55%"]
	});
	const from = index % 2 === 0 ? -8 : 8;
	const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [`${from}%`, "0%"]);
	const opacity = useTransform(scrollYProgress, [0, .6], reduce ? [1, 1] : [.15, 1]);
	const isInternal = item.url?.startsWith("/");
	return /* @__PURE__ */ jsxs("li", {
		ref,
		className: "grid gap-6 border-t border-[var(--line)] py-12 md:py-16 lg:grid-cols-12 lg:items-end lg:gap-10",
		children: [/* @__PURE__ */ jsxs(motion.p, {
			style: {
				x,
				opacity
			},
			className: "font-display text-[clamp(4.25rem,15vw,15rem)] font-extrabold leading-[0.82] tracking-[-0.055em] text-[var(--ink-strong)] lg:col-span-8",
			children: [/* @__PURE__ */ jsx(CountUp, {
				to: Number(item.value) || 0,
				prefix: item.prefix ?? ""
			}), item.suffix && /* @__PURE__ */ jsx("span", {
				className: "text-gradient text-[0.42em] tracking-[-0.03em]",
				children: item.suffix
			})]
		}), /* @__PURE__ */ jsxs(motion.div, {
			className: "lg:col-span-4 lg:pb-4",
			initial: reduce ? false : {
				opacity: 0,
				y: 20
			},
			whileInView: {
				opacity: 1,
				y: 0
			},
			viewport: {
				once: true,
				margin: "-15% 0px"
			},
			transition: {
				duration: .7,
				delay: .15,
				ease: [...EASE]
			},
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "font-display text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]",
					children: item.label
				}),
				item.context && /* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[15px] leading-relaxed text-[var(--mute)]",
					children: item.context
				}),
				item.url && (isInternal ? /* @__PURE__ */ jsx(Link, {
					href: item.url,
					"data-cursor": "view",
					className: "link-underline btn-press mt-5 inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
					children: "See the work ↗"
				}) : /* @__PURE__ */ jsx("a", {
					href: item.url,
					target: "_blank",
					rel: "noreferrer",
					"data-cursor": "view",
					className: "link-underline btn-press mt-5 inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
					children: "See the work ↗"
				}))
			]
		})]
	});
}
/**
* Client outcomes, one oversized number per row.
*
* @param {{ content?: { heading?: string, items?: Array<{ prefix?: string, value?: number, suffix?: string, label?: string, context?: string, url?: string }> } }} props
*/
function Results({ content }) {
	const reduce = useReducedMotion();
	const items = (content?.items ?? []).filter((item) => item?.label);
	const heading = content?.heading || "Results";
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		id: "results",
		className: "noise relative overflow-hidden bg-[var(--bg-soft)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x relative",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "RESULTS" }),
				/* @__PURE__ */ jsx(RevealText, {
					as: "h2",
					className: "display-md mt-8 max-w-3xl uppercase text-[var(--ink-strong)]",
					lines: [heading]
				}),
				/* @__PURE__ */ jsx("ul", {
					className: "mt-14 border-b border-[var(--line)] md:mt-20",
					children: items.map((item, index) => /* @__PURE__ */ jsx(ResultRow, {
						item,
						index,
						reduce
					}, index))
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/sections/RichText.jsx
/**
* Heading plus editor-authored rich text. The body is written in the admin
* panel by a signed-in editor, so it is rendered as HTML.
*
* @param {{ content?: { eyebrow?: string, heading?: string, body?: string } }} props
*/
function RichText({ content }) {
	const { eyebrow, heading, body } = content ?? {};
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg)] pb-24 pt-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x max-w-3xl",
			children: [
				eyebrow && /* @__PURE__ */ jsx(SectionLabel, { name: eyebrow }),
				heading && /* @__PURE__ */ jsx("h1", {
					className: "display-md mt-8 uppercase text-[var(--ink-strong)]",
					children: /* @__PURE__ */ jsx(GradientTitle, { text: heading })
				}),
				body && /* @__PURE__ */ jsx("div", {
					className: "prose-cms mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--mute)]",
					dangerouslySetInnerHTML: { __html: body }
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/sections/Testimonials.jsx
/**
* @param {{ content?: { heading?: string, items?: Array<{ quote?: string, author?: string, role?: string }> } }} props
*/
function Testimonials({ content }) {
	const reduce = useReducedMotion();
	const items = content?.items ?? [];
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg-soft)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: content?.heading || "Testimonials" }), /* @__PURE__ */ jsx("div", {
				className: "mt-10 grid gap-6 lg:grid-cols-3",
				children: items.map((item, index) => /* @__PURE__ */ jsxs(motion.figure, {
					initial: reduce ? { opacity: 0 } : {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-10% 0px"
					},
					transition: {
						duration: .45,
						delay: index * .06,
						ease: EASE
					},
					className: "flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-display text-[32px] leading-none",
							style: { color: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] },
							"aria-hidden": true,
							children: "“"
						}),
						/* @__PURE__ */ jsx("blockquote", {
							className: "mt-3 flex-1 text-[15px] leading-[1.75] text-[var(--mute)]",
							children: item.quote
						}),
						/* @__PURE__ */ jsxs("figcaption", {
							className: "mt-6 border-t border-[var(--line)] pt-4",
							children: [/* @__PURE__ */ jsx("p", {
								className: "font-display text-[14px] font-bold text-[var(--ink-strong)]",
								children: item.author
							}), item.role && /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-[12px] text-[var(--ink-faint)]",
								children: item.role
							})]
						})
					]
				}, `${item.author}-${index}`))
			})]
		})
	});
}
//#endregion
//#region resources/js/components/sections/UiuxWork.jsx
var PORTFOLIO_HREF = "/work/portfolio/uiux";
/**
* The landing page's UI/UX half of Our Work: the same printer the project
* pages use, printing one cover per project instead of one project's pages.
* Each printed sheet opens that project's own printer.
*
* @param {{
*   projects?: Array<{ slug: string, name: string, discipline: string, href: string, cover: { src: string, thumb: string, width: number, height: number, alt: string } }>,
* }} props
*/
function UiuxWork({ projects = [] }) {
	const printed = useMemo(() => ({
		slug: "uiux-portfolio",
		name: "UI/UX Portfolio",
		discipline: "UI/UX",
		screens: projects.map((project) => ({
			...project.cover,
			alt: project.cover.alt || project.name,
			label: project.name,
			href: project.href
		}))
	}), [projects]);
	if (projects.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		id: "uiux-work",
		className: "relative bg-[var(--bg)] pt-[clamp(5rem,9vw,9rem)]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: "UI/UX WORK" }), /* @__PURE__ */ jsxs("div", {
				className: "mt-10 flex flex-wrap items-end justify-between gap-8",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(RevealText, {
					as: "h2",
					className: "display-lg uppercase text-[var(--ink-strong)]",
					lines: ["Interfaces", "that convert."],
					highlightedLines: [1]
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-4 max-w-lg text-[15px] text-[var(--mute)]",
					children: "Websites, apps and SaaS products, printed one project at a time. Pick one to see every screen."
				})] }), /* @__PURE__ */ jsx(Link, {
					href: PORTFOLIO_HREF,
					"data-cursor": "explore",
					className: "link-underline btn-press text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
					children: "Full UI/UX portfolio →"
				})]
			})]
		}), /* @__PURE__ */ jsx(UiuxPrinter, {
			project: printed,
			hint: {
				desktop: "Click a project to see all its screens",
				mobile: "Tap a project to see all its screens"
			}
		})]
	});
}
//#endregion
//#region resources/js/components/sections/SectionRenderer.jsx
/**
* How each widget is wrapped for scroll animation. The three exceptions are
* not stylistic — each would visibly break inside the wrong wrapper:
*
* - `none` for Hero: it owns the opening frame and its own parallax, and a
*   scene that animated in on load would fight both.
* - `none` for Our Work, UI/UX Work and Process: each drives a sticky scroll stage, and a
*   transformed ancestor would move its supposedly fixed layer with the page.
* - `flat` for Contact: the office map does not survive a 3D ancestor.
*/
var SCENE = {
	None: "none",
	Depth: "depth",
	Flat: "flat"
};
/**
* The widget registry. A `type` with no entry here renders nothing rather
* than throwing, so a section added by a newer deploy cannot white-screen the
* page for a visitor on a stale bundle.
*/
var WIDGETS = {
	hero: {
		scene: SCENE.None,
		render: (section) => /* @__PURE__ */ jsx(Hero, { content: section.content })
	},
	marquee: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Marquee, { content: section.content })
	},
	about: {
		scene: SCENE.Depth,
		render: (section, { standalone, compactTop }) => /* @__PURE__ */ jsx(About, {
			content: section.content,
			variant: standalone ? "hero" : "manifesto",
			heroHeading: standalone,
			compactTop
		})
	},
	services: {
		scene: SCENE.Depth,
		render: (section, { props }) => /* @__PURE__ */ jsx(Services, {
			subservices: props.subservices ?? [],
			showTransition: false,
			scrollAnimation: true
		})
	},
	work: {
		scene: SCENE.None,
		render: (section, { props, fx }) => /* @__PURE__ */ jsx(OurWork, {
			glow: fx.barGlow,
			projects: props.featuredProjects ?? []
		})
	},
	uiux_work: {
		scene: SCENE.None,
		render: (section, { props }) => /* @__PURE__ */ jsx(UiuxWork, { projects: props.uiuxShowcase ?? [] })
	},
	contact: {
		scene: SCENE.Flat,
		render: (section, { standalone }) => /* @__PURE__ */ jsx(Contact, { heroHeading: standalone })
	},
	rich_text: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(RichText, { content: section.content })
	},
	features: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Features, { content: section.content })
	},
	testimonials: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Testimonials, { content: section.content })
	},
	faq: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Faq, { content: section.content })
	},
	cta: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Cta, { content: section.content })
	},
	process: {
		scene: SCENE.None,
		render: (section) => /* @__PURE__ */ jsx(Process, { content: section.content })
	},
	results: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Results, { content: section.content })
	},
	recognition: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Recognition, { content: section.content })
	}
};
/**
* Renders one page's widget stack.
*
* `appearance` chooses how a section arrives, and nothing else — every widget
* keeps its own internal motion either way:
*
* - `depth` (the default, and what every page other than the landing page
*   uses): the full `CinematicScene` stage, where a section comes forward out
*   of 3D depth, rests, then falls back and dims as the next one arrives.
* - `reveal`: the section lifts into place once and then holds still. No
*   perspective, no rotation, no dimming on the way out.
*
* Widgets registered as `SCENE.None` are unwrapped under both, so the hero
* and Our Work's sticky stage are untouched by this choice.
*
* @param {{
*   sections?: Array<{ id: number, type: string, content: object }>,
*   appearance?: 'depth'|'reveal',
* }} props
*/
function SectionRenderer({ sections = [], appearance = "depth" }) {
	const { props } = usePage();
	const fx = useThemeMotion();
	const standalone = sections.length === 1;
	return sections.map((section, index) => {
		const widget = WIDGETS[section.type];
		if (!widget) return null;
		const compactTop = appearance === "reveal" && sections[index - 1]?.type === "marquee";
		const element = widget.render(section, {
			props,
			fx,
			standalone,
			compactTop
		});
		if (widget.scene === SCENE.None) return /* @__PURE__ */ jsx(Fragment, { children: element }, section.id);
		if (appearance === "reveal") return /* @__PURE__ */ jsx(SectionAppear, { children: element }, section.id);
		return /* @__PURE__ */ jsx(CinematicScene, {
			depth: widget.scene === SCENE.Depth,
			children: element
		}, section.id);
	});
}
//#endregion
export { SectionRenderer as t };
