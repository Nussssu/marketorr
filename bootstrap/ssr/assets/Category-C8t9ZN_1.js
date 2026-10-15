import { c as transitionTo, l as useTapIntent, n as expandTo } from "../ssr.js";
import { n as enter } from "./motion-DQVPQ9oM.js";
import { t as MediaPlaceholder } from "./MediaPlaceholder-BAEKlLsR.js";
import { t as ServiceScene } from "./ServiceScene-DTqtuVSy.js";
import { t as BounceTitle } from "./BounceTitle-BL7JffMi.js";
import { Head, Link } from "@inertiajs/react";
import { useCallback, useRef } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
//#region resources/js/components/sections/CategoryHero.jsx
/**
* Column spans of the six tiles on the desktop bento: two rows of twelve,
* with the wide tile moving from the left of the first row to the middle of
* the second so the grid never reads as a plain table.
*/
var SPANS = [
	"lg:col-span-5",
	"lg:col-span-4",
	"lg:col-span-3",
	"lg:col-span-3",
	"lg:col-span-5",
	"lg:col-span-4"
];
/**
* One service in the bento: its live scene above, its number and name below,
* and the whole tile a link to that service's page.
*/
function ServiceTile({ item, index, href, span, reduce, onOpen, tapIntent }) {
	return /* @__PURE__ */ jsx("li", {
		...enter("fade-up", {
			dur: .8,
			delay: .45 + index * .08,
			y: 36,
			className: span
		}),
		children: /* @__PURE__ */ jsxs(Link, {
			href,
			"data-cursor": "explore",
			onPointerDown: tapIntent.onPointerDown,
			onPointerCancel: tapIntent.onPointerCancel,
			onClick: (event) => onOpen(event, href),
			className: "category-tile group flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] transition-colors duration-300",
			style: { "--tile-accent": item.accent },
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative min-h-0 flex-1",
				children: [/* @__PURE__ */ jsx("div", {
					className: "grid-bg pointer-events-none absolute inset-0 opacity-60",
					"aria-hidden": true
				}), /* @__PURE__ */ jsx("div", {
					className: "absolute inset-y-0 left-1/2 aspect-square h-full -translate-x-1/2 transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.04]",
					children: /* @__PURE__ */ jsx(ServiceScene, {
						slug: item.slug,
						still: Boolean(reduce),
						className: "absolute inset-0"
					})
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex min-h-[52px] items-center gap-3 border-t border-[var(--line)] px-3.5 py-2.5 sm:px-5 sm:py-4",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "hidden text-[10px] font-bold tracking-[0.2em] text-[var(--ink-faint)] sm:inline",
						children: String(index + 1).padStart(2, "0")
					}),
					/* @__PURE__ */ jsx("span", {
						className: "line-clamp-2 min-w-0 flex-1 font-display text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[var(--ink)] sm:text-[14px] sm:tracking-[0.08em]",
						children: item.name
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[var(--ink-faint)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--ink)]",
						"aria-hidden": true,
						children: "→"
					})
				]
			})]
		})
	});
}
/**
* Hero for the Branding and UI/UX discipline pages: the discipline at a
* glance.
*
* The name and tagline open the page, and beneath them a bento of the
* discipline's services — each tile playing a small version of that service's
* own animated scene (`ServiceScene`, the same one its page opens with) and
* linking straight to it. The detailed showcase follows below.
*
* Nothing moves on scroll and nothing lies over the scenes; the only motion is
* the entrance and the scenes' own loops, each parked while off screen.
* Reduced motion renders it all settled.
*
* @param {{ category: { slug: string, name: string, tagline: string, accent: string, items: Array<{ slug: string, name: string, accent: string }> } }} props
*/
function CategoryHero({ category }) {
	const reduce = useReducedMotion();
	const tapIntent = useTapIntent();
	const title = category.name.toUpperCase();
	const items = category.items ?? [];
	const open = (event, href) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (event.button !== void 0 && event.button !== 0) return;
		tapIntent.onClick(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		transitionTo(href);
	};
	return /* @__PURE__ */ jsxs("section", {
		className: "relative overflow-hidden bg-[var(--bg)] pb-12 pt-28 md:pt-32 lg:pb-16",
		children: [/* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute left-1/2 top-[-260px] h-[560px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-full",
			style: { background: `radial-gradient(closest-side, ${category.accent}2e, transparent)` },
			"aria-hidden": true
		}), /* @__PURE__ */ jsxs("div", {
			className: "container-x relative",
			children: [
				/* @__PURE__ */ jsxs("nav", {
					...enter("fade-up", {
						dur: .7,
						delay: .1,
						y: -10,
						className: "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]"
					}),
					"aria-label": "Breadcrumb",
					children: [
						/* @__PURE__ */ jsx(Link, {
							href: "/services",
							className: "tap-area transition-colors duration-200 hover:text-[var(--ink)]",
							children: "Services"
						}),
						/* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							children: "/"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-[var(--ink)]",
							children: category.name
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-8 flex flex-col gap-6 md:mt-10 lg:flex-row lg:items-end lg:justify-between",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "font-display font-extrabold uppercase leading-[0.85] tracking-[-0.04em] text-[var(--ink-strong)]",
						style: { fontSize: "min(14vw, clamp(3.4rem, 12vw, 10.5rem))" },
						"aria-label": category.name,
						children: title.split("").map((char, i) => /* @__PURE__ */ jsx("span", {
							className: "inline-block overflow-hidden pb-[0.06em] align-bottom",
							"aria-hidden": true,
							children: /* @__PURE__ */ jsx("span", {
								...enter("mask-up", {
									dur: 1,
									delay: .2 + i * .05,
									y: "115%",
									className: "inline-block will-change-transform"
								}),
								children: char
							})
						}, i))
					}), /* @__PURE__ */ jsxs("div", {
						...enter("fade-up", {
							dur: .8,
							delay: .6,
							className: "max-w-sm lg:pb-4 lg:text-right"
						}),
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-[16px] leading-relaxed text-[var(--mute)] md:text-[17px]",
							children: category.tagline
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)] lg:justify-end",
							children: [items.length, " services"]
						})]
					})]
				}),
				items.length > 0 && /* @__PURE__ */ jsx("ul", {
					className: "mt-10 grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[240px] sm:gap-4 lg:mt-12 lg:auto-rows-[clamp(230px,30svh,320px)] lg:grid-cols-12",
					children: items.map((item, index) => /* @__PURE__ */ jsx(ServiceTile, {
						item,
						index,
						href: `/services/${category.slug}/${item.slug}`,
						span: SPANS[index % SPANS.length],
						reduce,
						onOpen: open,
						tapIntent
					}, item.slug))
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/components/sections/SubServiceShowcase.jsx
var BRAND_GRADIENT = "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)";
/** Pads a position for display: 1 -> "01". */
var pad = (n) => String(n).padStart(2, "0");
/**
* Hands a sub-service visual to the transition layer.
*
* Measures the visual at the moment of the click, so the flight starts from
* exactly where the reader is looking — mid-scroll, mid-scene, wherever it
* happens to be. Only this showcase calls `expandTo`, so the cinematic
* flight is scoped to the Branding / UI-UX showcase and never fires globally.
*/
function useOpenSubService(category, item) {
	const visualRef = useRef(null);
	const tapIntent = useTapIntent();
	const href = `/services/${category.slug}/${item.slug}`;
	return {
		visualRef,
		tapIntent,
		href,
		open: useCallback((event) => {
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			if (event.button !== void 0 && event.button !== 0) return;
			tapIntent.onClick(event);
			if (event.defaultPrevented) return;
			const node = visualRef.current;
			if (!node) return;
			event.preventDefault();
			if (!item.image) {
				transitionTo(href);
				return;
			}
			const rect = node.getBoundingClientRect();
			const radius = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
			expandTo(href, {
				src: item.image,
				alt: item.imageAlt ?? item.name,
				rect,
				radius,
				accent: item.accent
			});
		}, [
			href,
			item.image,
			item.imageAlt,
			item.name,
			item.accent,
			tapIntent
		])
	};
}
/**
* One sub-service as a single cinematic scene.
*
* Picture and copy are driven by ONE progress value, so they arrive as one
* move rather than as two effects that happen to overlap. That progress is
* read over a long window — from the row touching the bottom of the viewport
* until it sits 40% up the screen, roughly six tenths of a viewport of travel
* — and then smoothed through a spring, which is what removes the sense of
* the composition being dragged frame by frame with the wheel.
*
* Nothing snaps and nothing blinks: every layer moves on a soft curve from
* far to near — a gentle fade, defocus resolving to sharp, a small scale
* settling down, a short drift in from the side the layer belongs to, and a
* soft clip opening the frame. All of it completes while the row is still
* arriving, so by the time the reader is actually reading, the scene is
* settled and completely still.
*
* Sides alternate down the page (odd rows text-left, even rows text-right)
* and each layer drifts in from its own side, so the alternation is
* something you feel in the motion rather than only see in the layout.
*/
function DesktopScene({ category, item, index, count, reduce }) {
	const rowRef = useRef(null);
	const { visualRef, tapIntent, href, open } = useOpenSubService(category, item);
	const textFirst = index % 2 === 0;
	const side = textFirst ? 1 : -1;
	const { scrollYProgress } = useScroll({
		target: rowRef,
		offset: ["start end", "start 40%"]
	});
	const p = useSpring(scrollYProgress, {
		stiffness: 58,
		damping: 26,
		mass: .6
	});
	const imageOpacity = useTransform(p, [0, .45], [0, 1]);
	const imageBlurPx = useTransform(p, [0, .78], [10, 0]);
	const imageFilter = useTransform(imageBlurPx, (v) => v < .15 ? "none" : `blur(${v.toFixed(2)}px)`);
	const imageScale = useTransform(p, [0, 1], [1.09, 1]);
	const imageY = useTransform(p, [0, 1], [64, 0]);
	const imageX = useTransform(p, [0, 1], [26 * side, 0]);
	const imageInset = useTransform(p, [0, .72], [16, 0]);
	const imageClip = useTransform(imageInset, (v) => `inset(${v.toFixed(2)}% round 28px)`);
	const copyX = useTransform(p, [0, 1], [-22 * side, 0]);
	const copyBlurPx = useTransform(p, [.1, .8], [5, 0]);
	const copyFilter = useTransform(copyBlurPx, (v) => v < .12 ? "none" : `blur(${v.toFixed(2)}px)`);
	const titleY = useTransform(p, [0, .92], [52, 0]);
	const titleOpacity = useTransform(p, [.08, .52], [0, 1]);
	const descY = useTransform(p, [.06, 1], [46, 0]);
	const descOpacity = useTransform(p, [.16, .62], [0, 1]);
	const ctaY = useTransform(p, [.12, 1], [40, 0]);
	const ctaOpacity = useTransform(p, [.24, .72], [0, 1]);
	return /* @__PURE__ */ jsxs("article", {
		ref: rowRef,
		className: `grid grid-cols-1 items-center gap-10 xl:gap-14 ${textFirst ? "lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]"}`,
		"aria-label": `${item.name}, ${pad(index + 1)} of ${pad(count)}`,
		children: [/* @__PURE__ */ jsxs(motion.div, {
			style: reduce ? void 0 : {
				x: copyX,
				filter: copyFilter
			},
			className: `order-2 ${textFirst ? "lg:order-1" : "lg:order-2"}`,
			children: [
				/* @__PURE__ */ jsx(motion.h3, {
					style: reduce ? void 0 : {
						y: titleY,
						opacity: titleOpacity
					},
					className: "font-display text-[clamp(2.2rem,3.4vw,3.9rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] text-[var(--ink-strong)]",
					children: item.name
				}),
				/* @__PURE__ */ jsx(motion.p, {
					style: reduce ? void 0 : {
						y: descY,
						opacity: descOpacity
					},
					className: "mt-5 text-[15px] leading-relaxed text-[var(--mute)]",
					children: item.short
				}),
				/* @__PURE__ */ jsxs(motion.a, {
					style: reduce ? void 0 : {
						y: ctaY,
						opacity: ctaOpacity
					},
					href,
					"data-cursor": "cta",
					onPointerDown: tapIntent.onPointerDown,
					onPointerMove: tapIntent.onPointerMove,
					onPointerCancel: tapIntent.onPointerCancel,
					onClick: open,
					className: "group/cta mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--line)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-[var(--field-line)]",
					children: ["View service", /* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						className: "transition-transform duration-300 group-hover/cta:translate-x-1",
						children: "→"
					})]
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: `order-1 min-w-0 ${textFirst ? "lg:order-2" : "lg:order-1"}`,
			children: /* @__PURE__ */ jsxs(motion.a, {
				href,
				ref: visualRef,
				"data-cursor": "view",
				onPointerDown: tapIntent.onPointerDown,
				onPointerMove: tapIntent.onPointerMove,
				onPointerCancel: tapIntent.onPointerCancel,
				onClick: open,
				"aria-label": `Open ${item.name}`,
				style: reduce ? void 0 : {
					opacity: imageOpacity,
					filter: imageFilter,
					scale: imageScale,
					y: imageY,
					x: imageX,
					clipPath: imageClip
				},
				className: `group sticky top-[100px] block aspect-[16/10] w-full overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#08080B] ${textFirst ? "ml-auto" : "mr-auto"}`,
				children: [
					item.image ? /* @__PURE__ */ jsx("img", {
						src: item.image,
						alt: item.imageAlt ?? `${item.name} project visual`,
						loading: index === 0 ? "eager" : "lazy",
						decoding: "async",
						draggable: false,
						className: "absolute inset-0 h-full w-full object-cover"
					}) : /* @__PURE__ */ jsx(MediaPlaceholder, { label: `${item.name} - image placeholder` }),
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						className: "media-scrim-bottom"
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[10px] font-bold uppercase tracking-[0.24em] text-white/70",
						"aria-hidden": true,
						children: [/* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 backdrop-blur-sm",
							children: [/* @__PURE__ */ jsx("span", {
								className: "inline-block h-1.5 w-1.5 rounded-full",
								style: { background: item.accent }
							}), category.name]
						}), /* @__PURE__ */ jsxs("span", {
							className: "hidden rounded-full border border-white/20 bg-black/35 px-4 py-2 backdrop-blur-sm sm:inline-block",
							children: [pad(count), " scenes"]
						})]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 pb-6",
						"aria-hidden": true,
						children: [/* @__PURE__ */ jsx("span", {
							className: "max-w-sm text-[13px] font-medium leading-relaxed text-white/85",
							children: item.short
						}), /* @__PURE__ */ jsx("span", {
							className: "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg text-black transition-transform duration-500 group-hover:rotate-45",
							children: "↗"
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						className: "absolute inset-x-0 bottom-0 h-[3px]",
						style: { background: BRAND_GRADIENT }
					})
				]
			})
		})]
	});
}
/**
* The six rows as one editorial run down the page.
*
* There is no pinned stage and no single slot the scenes take turns in: each
* sub-service occupies its own place in the flow and reveals there, which is
* what makes the sequence read as an article rather than as a deck being
* clicked through. Scroll position is the only input to the picture reveals,
* so they scrub in both directions.
*/
function DesktopShowcase({ category }) {
	const reduce = useReducedMotion();
	const count = category.items.length;
	return /* @__PURE__ */ jsxs("div", {
		className: "relative hidden lg:block",
		children: [
			/* @__PURE__ */ jsx("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0",
				style: {
					backgroundImage: "linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
					backgroundSize: "140px 100%"
				}
			}),
			/* @__PURE__ */ jsx("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0",
				style: { background: "radial-gradient(46% 34% at 10% 8%, rgba(137,31,251,0.10), transparent 70%), radial-gradient(40% 32% at 90% 92%, rgba(27,226,235,0.08), transparent 70%)" }
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 px-6 py-24 md:px-8 xl:px-12 xl:py-32 2xl:px-16",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ink-faint)]",
					children: [category.name, " · the practice"]
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-16 flex flex-col gap-28 xl:mt-20 xl:gap-36",
					children: category.items.map((item, index) => /* @__PURE__ */ jsx(DesktopScene, {
						category,
						item,
						index,
						count,
						reduce
					}, item.slug))
				})]
			})
		]
	});
}
/**
* One card on a phone or tablet: the same scene, as a card in a two-column
* grid.
*
* The desktop's two columns become one card that simply takes its place in
* the grid — no pinning, no stacking, nothing overlapping. The motion is the
* desktop scene at phone amplitude and driven the same way: one spring
* smoothed progress feeding picture and copy together, so they still arrive
* as a single move. Only the distances shrink; there is no sideways drift to
* make in a grid of cards, and the defocus is lighter because a phone is
* holding a smaller, denser frame.
*/
function CompactScene({ category, item, index, count, reduce, innerRef }) {
	const ref = useRef(null);
	const { visualRef, tapIntent, href, open } = useOpenSubService(category, item);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "start 45%"]
	});
	const p = useSpring(scrollYProgress, {
		stiffness: 58,
		damping: 26,
		mass: .6
	});
	const mediaOpacity = useTransform(p, [0, .45], [0, 1]);
	const mediaBlurPx = useTransform(p, [0, .78], [7, 0]);
	const mediaFilter = useTransform(mediaBlurPx, (v) => v < .15 ? "none" : `blur(${v.toFixed(2)}px)`);
	const mediaScale = useTransform(p, [0, 1], [1.07, 1]);
	const mediaY = useTransform(p, [0, 1], [42, 0]);
	const mediaInset = useTransform(p, [0, .72], [14, 0]);
	const mediaClip = useTransform(mediaInset, (v) => `inset(${v.toFixed(2)}% round 16px)`);
	const copyY = useTransform(p, [.1, 1], [30, 0]);
	const copyOpacity = useTransform(p, [.2, .68], [0, 1]);
	const ctaY = useTransform(p, [.18, 1], [26, 0]);
	const ctaOpacity = useTransform(p, [.3, .78], [0, 1]);
	return /* @__PURE__ */ jsx("div", {
		ref: (node) => {
			ref.current = node;
			if (typeof innerRef === "function") innerRef(node, index);
		},
		className: "relative",
		children: /* @__PURE__ */ jsxs("article", {
			className: "relative h-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 sm:rounded-3xl sm:p-3",
			"aria-label": `${item.name}, ${pad(index + 1)} of ${pad(count)}`,
			children: [/* @__PURE__ */ jsxs(motion.a, {
				href,
				ref: visualRef,
				"data-cursor": "view",
				onPointerDown: tapIntent.onPointerDown,
				onPointerMove: tapIntent.onPointerMove,
				onPointerCancel: tapIntent.onPointerCancel,
				onClick: open,
				"aria-label": `Open ${item.name}`,
				style: reduce ? void 0 : {
					opacity: mediaOpacity,
					filter: mediaFilter,
					scale: mediaScale,
					y: mediaY,
					clipPath: mediaClip
				},
				className: "relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#08080B] sm:rounded-2xl",
				children: [
					item.image ? /* @__PURE__ */ jsx("img", {
						src: item.image,
						alt: item.imageAlt ?? `${item.name} project visual`,
						loading: "lazy",
						decoding: "async",
						draggable: false,
						className: "absolute inset-0 h-full w-full object-cover"
					}) : /* @__PURE__ */ jsx(MediaPlaceholder, { label: `${item.name} - image placeholder` }),
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						className: "media-scrim-bottom"
					}),
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						className: "absolute inset-x-0 bottom-0 h-[3px]",
						style: { background: BRAND_GRADIENT }
					}),
					/* @__PURE__ */ jsx("h3", {
						className: "absolute inset-x-3 bottom-3 font-display text-[clamp(0.95rem,4.2vw,1.6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-white sm:inset-x-4 sm:bottom-4",
						children: item.name
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "px-1 pb-1 pt-3 sm:px-3 sm:pb-3 sm:pt-5",
				children: [/* @__PURE__ */ jsx(motion.p, {
					style: reduce ? void 0 : {
						y: copyY,
						opacity: copyOpacity
					},
					className: "max-w-prose text-[12px] leading-snug text-[var(--mute)] sm:mt-3 sm:text-[14px] sm:leading-relaxed",
					children: item.short
				}), /* @__PURE__ */ jsxs(motion.a, {
					style: reduce ? void 0 : {
						y: ctaY,
						opacity: ctaOpacity
					},
					href,
					"data-cursor": "cta",
					onPointerDown: tapIntent.onPointerDown,
					onPointerMove: tapIntent.onPointerMove,
					onPointerCancel: tapIntent.onPointerCancel,
					onClick: open,
					className: "mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] sm:mt-5 sm:gap-3 sm:px-5 sm:py-3 sm:text-[11px] sm:tracking-[0.18em]",
					children: ["View service ", /* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						children: "→"
					})]
				})]
			})]
		})
	});
}
function CompactShowcase({ category, always = false }) {
	const reduce = useReducedMotion();
	const cardRefs = useRef([]);
	category.items.length;
	const collectRef = useCallback((node, index) => {
		cardRefs.current[index] = node;
	}, []);
	return /* @__PURE__ */ jsx("div", {
		className: `${always ? "" : "lg:hidden"}`,
		children: /* @__PURE__ */ jsx("div", {
			className: "container-x relative grid grid-cols-2 gap-3 py-16 sm:gap-5 md:gap-6",
			children: category.items.map((item, index) => /* @__PURE__ */ jsx(CompactScene, {
				category,
				item,
				index,
				count: category.items.length,
				reduce,
				innerRef: collectRef
			}, item.slug))
		})
	});
}
/**
* The sub-services of one discipline as one editorial run down the page.
*
* Every row works the same way at every width: the picture is scrubbed open
* by scroll — clip parting from the centre line, tilt unwinding, oversized
* crop settling — while the copy beside it plays a short one-shot reveal as
* the row comes into view. Two columns on desktop with a sticky picture, and
* a two-column grid of cards below it. Clicking a row hands its visual to the transition layer,
* which carries it into that sub-service's own page. This component mounts
* only on the Branding and UI/UX category pages, so the sequence — and its
* flight transition — never affects Home, About, Work or Contact.
*/
function SubServiceShowcase({ category }) {
	const reduce = useReducedMotion();
	if (!category?.items?.length) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "relative bg-[var(--bg)]",
		"aria-label": `${category.name} sub-services`,
		children: reduce ? /* @__PURE__ */ jsx(CompactShowcase, {
			category,
			always: true
		}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(DesktopShowcase, { category }), /* @__PURE__ */ jsx(CompactShowcase, { category })] })
	});
}
//#endregion
//#region resources/js/pages/Services/Category.jsx
function ServiceCategory({ category }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: `${category.name} Services | Marketorr` }), /* @__PURE__ */ jsxs("article", {
		className: "bg-[var(--bg)]",
		children: [
			/* @__PURE__ */ jsx(CategoryHero, { category }),
			/* @__PURE__ */ jsx(SubServiceShowcase, { category }),
			/* @__PURE__ */ jsx("section", {
				className: "container-x pb-24 pt-8 min-[769px]:py-24 lg:py-32",
				children: /* @__PURE__ */ jsxs("div", {
					className: "rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-7 py-16 text-center sm:px-12 lg:py-24",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
							children: "Have a project in mind?"
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "display-md mx-auto mt-5 max-w-4xl uppercase text-[var(--ink-strong)]",
							children: /* @__PURE__ */ jsx(BounceTitle, {
								text: "Let’s make it matter.",
								highlightWords: 0,
								delay: .1,
								onScroll: true
							})
						}),
						/* @__PURE__ */ jsxs(Link, {
							href: "/contact",
							className: "btn-press mt-8 inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.17em] text-white",
							style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
							children: ["Start a project ", /* @__PURE__ */ jsx("span", {
								"aria-hidden": true,
								children: "↗"
							})]
						})
					]
				})
			})
		]
	})] });
}
//#endregion
export { ServiceCategory as default };
