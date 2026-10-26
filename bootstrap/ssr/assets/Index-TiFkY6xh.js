import { l as GradientTitle, n as transitionTo, r as useTapIntent, u as SectionLabel } from "../ssr.js";
import { i as PageMeta, n as enter, t as EASE } from "./motion-NShunF_K.js";
import { t as SectionRenderer } from "./SectionRenderer-vVIEK50L.js";
import { t as ScrollHeading } from "./ScrollHeading-BhPAyGdL.js";
import { Link, router } from "@inertiajs/react";
import { useRef } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
//#region resources/js/pages/Work/Index.jsx
/**
* The All Work landing page.
*
* Two doors, nothing else: the practices are the choice here, and the projects
* themselves live one level down inside whichever portfolio the reader picks.
* Each door is a full-width panel that pins while the next one slides over it,
* and previews its own work as a drifting cover mosaic rather than describing
* it, so the reader knows what is behind it before clicking.
*/
/** How many covers a door's mosaic shows, split across its two columns. */
var MOSAIC_COVERS = 8;
/** Stacked doors pin below the header, each a step lower than the last. */
var PIN_TOP_PX = 104;
var PIN_STEP_PX = 20;
function MosaicColumn({ items, y, offset = false }) {
	return /* @__PURE__ */ jsx(motion.div, {
		style: { y },
		className: `flex flex-col gap-3 md:gap-4 ${offset ? "pt-16" : ""}`.trimEnd(),
		children: [...items, ...items].map((item, i) => /* @__PURE__ */ jsx("span", {
			className: "block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-[var(--line-soft)] bg-[var(--bg-soft)] md:rounded-2xl",
			children: /* @__PURE__ */ jsx("img", {
				src: item.image,
				alt: "",
				loading: "lazy",
				decoding: "async",
				draggable: false,
				className: "h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/door:scale-[1.04]"
			})
		}, `${item.slug}-${i}`))
	});
}
/**
* @param {{ progress: import('framer-motion').MotionValue<number> }} props
*   `progress` runs 0 -> 1 across the whole stack of doors. Each door owns an
*   equal slice of it: over that slice its mosaic drifts and, once the next
*   door starts sliding over it, it sinks back and dims underneath.
*/
function PortfolioDoor({ group, index, total, reduce, progress, content = {} }) {
	const tapIntent = useTapIntent();
	const destinationPreloaded = useRef(false);
	const previews = (group.items ?? []).filter((item) => item.image).slice(0, MOSAIC_COVERS);
	const count = (group.items ?? []).length;
	const title = content[`${group.slug}Title`] || group.name;
	const countText = String((count === 1 ? content.countLabelOne : content.countLabel) || (count === 1 ? "{count} project" : "{count} projects")).replaceAll("{count}", String(count));
	const openLabel = content.openLabel || "Open portfolio";
	const isLast = index === total - 1;
	const sliceStart = index / total;
	const sliceEnd = (index + 1) / total;
	const columnUp = useTransform(progress, [sliceStart - .5 / total, sliceEnd], reduce ? [0, 0] : [60, -160]);
	const columnDown = useTransform(progress, [sliceStart - .5 / total, sliceEnd], reduce ? [0, 0] : [-140, 40]);
	const sink = useTransform(progress, [sliceStart, sliceEnd], reduce || isLast ? [1, 1] : [1, .92]);
	const dim = useTransform(progress, [sliceStart, sliceEnd], reduce || isLast ? [0, 0] : [0, .6]);
	const preloadDestination = () => {
		if (destinationPreloaded.current) return;
		destinationPreloaded.current = true;
		router.prefetch(group.href, {}, { cacheFor: "1m" });
		import("./Portfolio-DiI-Nlb_.js").catch((error) => {
			destinationPreloaded.current = false;
			console.error("Unable to preload the work portfolio page.", error);
		});
	};
	const go = (event) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (event.button !== void 0 && event.button !== 0) return;
		tapIntent.onClick(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		transitionTo(group.href);
	};
	const left = previews.filter((_, i) => i % 2 === 0);
	const right = previews.filter((_, i) => i % 2 === 1);
	return /* @__PURE__ */ jsx(motion.div, {
		className: "lg:sticky",
		style: {
			top: PIN_TOP_PX + index * PIN_STEP_PX,
			scale: sink,
			transformOrigin: "50% 0%"
		},
		initial: reduce ? false : {
			opacity: 0,
			y: 48
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
			duration: reduce ? 0 : .8,
			ease: [...EASE]
		},
		children: /* @__PURE__ */ jsxs(Link, {
			href: group.href,
			"data-cursor": "explore",
			onPointerEnter: preloadDestination,
			onFocus: preloadDestination,
			onPointerDown: (event) => {
				preloadDestination();
				tapIntent.onPointerDown(event);
			},
			onPointerCancel: tapIntent.onPointerCancel,
			onClick: go,
			"aria-label": `${title}, ${countText}`,
			className: "group/door relative grid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] transition-colors duration-500 hover:border-[var(--field-line)] focus-visible:outline-none lg:h-[min(76svh,720px)] lg:grid-cols-12",
			children: [
				/* @__PURE__ */ jsx("span", {
					"aria-hidden": true,
					className: "pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-25 blur-[120px] transition-opacity duration-700 group-hover/door:opacity-45",
					style: { background: group.accent }
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "relative flex flex-col justify-between gap-10 p-8 md:p-12 lg:col-span-5",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "flex items-center gap-3",
							children: /* @__PURE__ */ jsx("span", {
								className: "h-px w-8 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/door:w-16",
								style: { background: group.accent },
								"aria-hidden": true
							})
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "block",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block font-display text-[clamp(2.4rem,5.2vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-[var(--ink-strong)]",
								children: /* @__PURE__ */ jsx(GradientTitle, { text: title })
							}), /* @__PURE__ */ jsx("span", {
								className: "mt-5 block text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]",
								children: countText
							})]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "inline-flex w-max items-center gap-3 rounded-full border border-[var(--field-line)] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 group-hover/door:border-transparent group-hover/door:bg-[var(--invert-btn-hover)] group-hover/door:text-[var(--bg)]",
							children: [openLabel, /* @__PURE__ */ jsx("span", {
								"aria-hidden": true,
								className: "transition-transform duration-300 group-hover/door:-translate-y-0.5 group-hover/door:translate-x-0.5",
								children: "↗"
							})]
						})
					]
				}),
				previews.length > 0 && /* @__PURE__ */ jsxs("span", {
					"aria-hidden": true,
					className: "relative block h-[22rem] overflow-hidden border-t border-[var(--line-soft)] md:h-[28rem] lg:col-span-7 lg:h-auto lg:border-l lg:border-t-0",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "absolute inset-x-5 -top-10 grid grid-cols-2 gap-3 md:inset-x-8 md:gap-4",
							children: [/* @__PURE__ */ jsx(MosaicColumn, {
								items: left,
								y: columnUp
							}), /* @__PURE__ */ jsx(MosaicColumn, {
								items: right,
								y: columnDown,
								offset: true
							})]
						}),
						/* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--surface)] to-transparent" }),
						/* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--surface)] to-transparent" })
					]
				}),
				/* @__PURE__ */ jsx(motion.span, {
					"aria-hidden": true,
					className: "pointer-events-none absolute inset-0 bg-[var(--bg)]",
					style: { opacity: dim }
				})
			]
		})
	});
}
/** The page title, set as one oversized word whose letters rise in turn. */
function WorkTitle({ reduce, text }) {
	const letters = [...text];
	return /* @__PURE__ */ jsxs("h1", {
		className: "heading-hero-size mt-8 font-display font-extrabold uppercase leading-[0.8] tracking-[-0.055em] text-[var(--ink-strong)]",
		children: [/* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: text
		}), /* @__PURE__ */ jsx("span", {
			"aria-hidden": true,
			className: "flex overflow-hidden pb-[0.04em]",
			children: [...letters, "."].map((letter, i) => /* @__PURE__ */ jsx("span", {
				...enter("mask-up", {
					dur: 1,
					delay: .12 + i * .07,
					y: "105%",
					className: `inline-block ${letter === "." ? "text-gradient" : ""}`
				}),
				children: letter
			}, i))
		})]
	});
}
function WorkDirectory({ groups = [], content = {} }) {
	const reduce = useReducedMotion();
	const stackRef = useRef(null);
	const { scrollYProgress: stackProgress } = useScroll({
		target: stackRef,
		offset: ["start start", "end end"]
	});
	const totalProjects = groups.reduce((sum, group) => sum + (group.items ?? []).length, 0);
	const intro = String(content.intro ?? "").replaceAll("{projects}", String(totalProjects)).replaceAll("{practices}", String(groups.length));
	return /* @__PURE__ */ jsx("div", {
		className: "bg-[var(--bg)] pb-28 pt-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [
				content.heading && /* @__PURE__ */ jsx(SectionLabel, { name: content.heading.toUpperCase() }),
				/* @__PURE__ */ jsx(ScrollHeading, { children: /* @__PURE__ */ jsx(WorkTitle, {
					reduce,
					text: content.title || content.heading || ""
				}) }),
				/* @__PURE__ */ jsxs("div", {
					...enter("fade-up", {
						dur: .8,
						delay: .5,
						className: "mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-[var(--line)] pt-6"
					}),
					children: [/* @__PURE__ */ jsx("p", {
						className: "max-w-md text-[16px] leading-relaxed text-[var(--mute)]",
						children: intro
					}), content.scrollHint && /* @__PURE__ */ jsx("p", {
						className: "font-display text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
						children: content.scrollHint
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					ref: stackRef,
					className: "relative mt-16 flex flex-col gap-6 md:mt-24 lg:gap-[34svh]",
					children: groups.map((group, index) => /* @__PURE__ */ jsx(PortfolioDoor, {
						group,
						index,
						total: groups.length,
						reduce,
						progress: stackProgress,
						content
					}, group.slug))
				})
			]
		})
	});
}
function WorkIndex({ groups = [], page }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(PageMeta, {
		page,
		fallbackTitle: "Our Work | Marketorr"
	}), (page?.sections ?? []).map((section) => section.type === "work" ? /* @__PURE__ */ jsx(WorkDirectory, {
		groups,
		content: section.content
	}, section.id) : /* @__PURE__ */ jsx(SectionRenderer, { sections: [section] }, section.id))] });
}
//#endregion
export { WorkIndex as default };
