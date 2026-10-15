import { _ as Tag, c as transitionTo, d as useBoxPointer, g as SectionLabel, h as GradientTitle, l as useTapIntent } from "../ssr.js";
import { t as ScrollHeading } from "./ScrollHeading-BhPAyGdL.js";
import { t as useMediaQuery } from "./useMediaQuery-UO1511g3.js";
import { t as ProjectMotion } from "./ProjectMotion-eUFFsKut.js";
import { i as isCharukothon, r as CharukothonCover, t as projectCardMedia } from "./projectHeroMedia-DRrWloKb.js";
import { t as MediaPlaceholder } from "./MediaPlaceholder-BAEKlLsR.js";
import { Head, Link, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
//#region resources/js/components/sections/WorkShowcase.jsx
var EASE = [
	.22,
	1,
	.36,
	1
];
var BRAND_GRADIENT = "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)";
var RICH_QUERY = "(min-width: 1024px)";
var COMPACT_QUERY = "(max-width: 1023px)";
/** Where a project leads: its own `href` when it has one, otherwise its case study. */
var projectLink = (project) => project.href ?? `/work/${project.slug}`;
/**
* The band, as a fraction of the viewport, that decides which project the
* fixed panel is describing: an item counts as the one being read while its
* box crosses the middle tenth of the screen.
*/
var FOCUS_BAND = "-45% 0px -45% 0px";
/**
* A visual's journey through the viewport, sampled at four points of its own
* pass: entering from below, arriving, holding, and leaving past the top.
* Phones use the flat set — same drift and fade, no perspective or depth.
*
* @type {Record<'rich'|'light', { stops: number[], y: string[], scale: number[], opacity: number[], tilt: number[], z: number[] }>}
*/
var FLOW = {
	rich: {
		stops: [
			0,
			.3,
			.7,
			1
		],
		y: [
			"13%",
			"0%",
			"0%",
			"-13%"
		],
		scale: [
			.9,
			1,
			1,
			.94
		],
		opacity: [
			.15,
			1,
			1,
			.2
		],
		tilt: [
			7.5,
			0,
			0,
			-5.5
		],
		z: [
			-190,
			0,
			0,
			-150
		]
	},
	light: {
		stops: [
			0,
			.3,
			.7,
			1
		],
		y: [
			"7%",
			"0%",
			"0%",
			"-7%"
		],
		scale: [
			.95,
			1,
			1,
			.97
		],
		opacity: [
			.3,
			1,
			1,
			.35
		],
		tilt: [
			0,
			0,
			0,
			0
		],
		z: [
			0,
			0,
			0,
			0
		]
	}
};
/**
* One project passing through the viewport.
*
* The whole appearance is derived from the item's own scroll progress, so the
* pass reverses exactly when the reader scrolls back up — there are no
* one-shot triggers to get stuck in the played state. The cursor adds a tilt
* on top of that, never instead of it.
*
* The item carries its own `perspective()` rather than inheriting a stage: the
* page clips horizontally, and a clipping ancestor forces `transform-style`
* back to flat, which would throw the depth away.
*
* @param {{
*   project: import('../../lib/projects').Project,
*   index: number,
*   rich: boolean,
*   reduce: boolean,
*   onFocus: (index: number) => void,
* }} props
*/
function FlowItem({ project, index, rich, reduce, onFocus }) {
	const ref = useRef(null);
	const cardMedia = projectCardMedia(project, "(max-width: 1023px) 46vw, 55vw");
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});
	const frames = rich ? FLOW.rich : FLOW.light;
	const y = useTransform(scrollYProgress, frames.stops, frames.y);
	const scale = useTransform(scrollYProgress, frames.stops, frames.scale);
	const opacity = useTransform(scrollYProgress, frames.stops, frames.opacity);
	const flowTilt = useTransform(scrollYProgress, frames.stops, frames.tilt);
	const z = useTransform(scrollYProgress, frames.stops, frames.z);
	const pointerX = useMotionValue(0);
	const pointerY = useMotionValue(0);
	const turnY = useSpring(pointerX, {
		stiffness: 120,
		damping: 20,
		mass: .4
	});
	const turnX = useSpring(pointerY, {
		stiffness: 120,
		damping: 20,
		mass: .4
	});
	const rotateX = useTransform([flowTilt, turnX], ([flow, hover]) => flow + hover);
	useEffect(() => {
		const box = ref.current;
		if (!box || typeof IntersectionObserver === "undefined") return void 0;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) onFocus(index);
		}, {
			rootMargin: FOCUS_BAND,
			threshold: 0
		});
		observer.observe(box);
		return () => observer.disconnect();
	}, [index, onFocus]);
	const applyTilt = useCallback((fx, fy) => {
		pointerX.set((fx - .5) * 13);
		pointerY.set((fy - .5) * -9);
	}, [pointerX, pointerY]);
	const pointer = useBoxPointer(applyTilt, { enabled: rich && !reduce });
	const onPointerLeave = (event) => {
		pointer.onPointerLeave(event);
		pointerX.set(0);
		pointerY.set(0);
	};
	const motionStyle = reduce ? void 0 : {
		y,
		scale,
		opacity,
		rotateX,
		...rich ? {
			z,
			rotateY: turnY,
			transformPerspective: 1500
		} : {}
	};
	return /* @__PURE__ */ jsx(motion.article, {
		ref,
		id: `work-${project.slug}`,
		style: motionStyle,
		className: "work-flow__item",
		onPointerEnter: pointer.onPointerEnter,
		onPointerMove: pointer.onPointerMove,
		onPointerLeave,
		children: /* @__PURE__ */ jsxs(Link, {
			href: projectLink(project),
			"data-cursor": "view",
			"aria-label": `${project.ctaLabel ?? "View case study"}: ${project.title}`,
			className: "group block",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--line)] bg-[#111116] min-[769px]:aspect-[16/10]",
				style: { containerType: "inline-size" },
				children: [
					isCharukothon(project.slug) ? /* @__PURE__ */ jsx(CharukothonCover, { image: project.thumb || project.image }) : !cardMedia.src ? /* @__PURE__ */ jsx(MediaPlaceholder, { label: `${project.title} - cover image placeholder` }) : /* @__PURE__ */ jsx("img", {
						src: cardMedia.src,
						srcSet: cardMedia.srcSet,
						sizes: cardMedia.sizes,
						alt: cardMedia.alt,
						loading: index < 2 ? "eager" : "lazy",
						fetchPriority: index === 0 ? "high" : void 0,
						decoding: "async",
						draggable: false,
						style: project.imagePosition ? { objectPosition: project.imagePosition } : void 0,
						className: `absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04] ${cardMedia.fit === "contain" ? "object-contain" : "object-cover"}`
					}),
					!isCharukothon(project.slug) && /* @__PURE__ */ jsx("div", {
						className: "pointer-events-none absolute inset-0 transition-opacity duration-500 group-hover:opacity-70",
						style: { background: `radial-gradient(120% 100% at 20% 10%, ${project.accent}1a, transparent 58%), linear-gradient(180deg, rgba(8,8,10,0.34) 0%, transparent 26%, transparent 56%, rgba(8,8,10,0.26) 80%, rgba(8,8,10,0.56) 100%)` },
						"aria-hidden": true
					}),
					/* @__PURE__ */ jsx(ProjectMotion, { slug: project.slug }),
					project.metric && /* @__PURE__ */ jsx("p", {
						className: "absolute right-2 top-2 font-display text-[13px] font-extrabold text-white min-[769px]:right-6 min-[769px]:top-6 min-[769px]:text-4xl",
						children: project.metric
					}),
					/* @__PURE__ */ jsx("span", {
						className: "pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100",
						style: { background: BRAND_GRADIENT },
						"aria-hidden": true
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0 pt-3 lg:hidden",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "text-[8px] tracking-[0.1em] truncate font-bold uppercase text-[var(--ink-faint)] min-[769px]:text-[11px] min-[769px]:tracking-[0.2em]",
						children: [
							project.client,
							" · ",
							project.year
						]
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-1 text-[13px] leading-[1.05] overflow-hidden font-display font-extrabold uppercase text-[var(--ink-strong)] min-[769px]:mt-1.5 min-[769px]:text-xl min-[769px]:leading-tight",
						children: /* @__PURE__ */ jsx(GradientTitle, { text: project.title })
					}),
					project.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "mt-2 gap-1 flex min-w-0 items-center min-[769px]:mt-3 min-[769px]:gap-1.5",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "gap-1 px-1.5 py-1 text-[7px] tracking-[0.08em] min-[769px]:gap-1.5 min-[769px]:px-2.5 min-[769px]:text-[9px] min-[769px]:tracking-[0.1em] inline-flex min-w-0 max-w-full items-center rounded-full border border-[var(--line)] bg-[var(--chip)] font-semibold uppercase text-[var(--ink)]",
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-1 w-1 shrink-0 rounded-full",
								style: { background: project.accent },
								"aria-hidden": true
							}), /* @__PURE__ */ jsx("span", {
								className: "truncate",
								children: project.tags[0]
							})]
						}), project.tags.length > 1 && /* @__PURE__ */ jsxs("span", {
							className: "text-[7px] shrink-0 font-bold text-[var(--ink-faint)] min-[769px]:text-[10px]",
							children: ["+", project.tags.length - 1]
						})]
					})
				]
			})]
		})
	});
}
/**
* The fixed half of the page: it stays put while the visuals travel past it,
* and swaps its copy to whichever project is currently crossing the reading
* band. Its title is a link to the same case study as the visual, so the
* written half is never a dead end.
*
* @param {{ project: import('../../lib/projects').Project, count: number, index: number, reduce: boolean }} props
*/
function FixedPanel({ project, count, index, reduce }) {
	return /* @__PURE__ */ jsx("div", {
		className: "hidden h-full lg:block",
		children: /* @__PURE__ */ jsxs("div", {
			className: "sticky top-32",
			children: [/* @__PURE__ */ jsxs("p", {
				className: "font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]",
				children: [/* @__PURE__ */ jsx("span", {
					style: { color: project.accent },
					children: String(index + 1).padStart(2, "0")
				}), /* @__PURE__ */ jsxs("span", {
					"aria-hidden": true,
					children: [" / ", String(count).padStart(2, "0")]
				})]
			}), /* @__PURE__ */ jsx(AnimatePresence, {
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
						y: -14
					},
					transition: {
						duration: reduce ? 0 : .38,
						ease: [...EASE]
					},
					children: [
						/* @__PURE__ */ jsxs("p", {
							className: "mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]",
							children: [
								project.client,
								" · ",
								project.year
							]
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-3 font-display text-[clamp(2rem,3.2vw,3.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[var(--ink-strong)]",
							children: /* @__PURE__ */ jsx(Link, {
								href: projectLink(project),
								"data-cursor": "view",
								className: "link-underline",
								children: /* @__PURE__ */ jsx(GradientTitle, { text: project.title })
							})
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-5 max-w-md text-[15px] leading-relaxed text-[var(--mute)]",
							children: project.description
						}),
						project.tags.length > 0 && /* @__PURE__ */ jsx("div", {
							className: "mt-6 flex flex-wrap gap-2",
							children: project.tags.map((t) => /* @__PURE__ */ jsx(Tag, {
								accent: project.accent,
								children: t
							}, t))
						}),
						project.metric && /* @__PURE__ */ jsxs("p", {
							className: "mt-7",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-display text-3xl font-extrabold",
								style: { color: project.accent },
								children: project.metric
							}), /* @__PURE__ */ jsx("span", {
								className: "ml-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
								children: project.metricLabel
							})]
						}),
						/* @__PURE__ */ jsxs(Link, {
							href: projectLink(project),
							"data-cursor": "cta",
							className: "btn-press group/link mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--field-line)] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.17em] text-[var(--ink)] hover:border-transparent hover:text-white",
							style: {
								backgroundImage: `linear-gradient(var(--bg), var(--bg)), ${BRAND_GRADIENT}`,
								backgroundOrigin: "border-box",
								backgroundClip: "padding-box, border-box"
							},
							children: [project.ctaLabel ?? "View case study", /* @__PURE__ */ jsx("span", {
								"data-arrow": true,
								"aria-hidden": true,
								children: "↗"
							})]
						})
					]
				}, project.slug)
			})]
		})
	});
}
/**
* Editorial portfolio showcase for the Our Work page, replacing the static
* grid: the written half holds still while the visuals float up through the
* screen, each one arriving from below with depth, settling as it is read, and
* receding as it leaves.
*
* Every visual and every title remains a link to the project's existing case
* study route — the animation is layered on top of the same navigation, never
* in place of it. A project may bring its own `href` and `ctaLabel` instead,
* which is how the UI/UX portfolio sends each project to its printer page.
*
* Large screens get the fixed panel, the 3D pass and the cursor tilt. Phones
* and tablets get a two-column grid of cards, each with its own caption,
* revealed as it scrolls into view; reduced motion renders the list plainly
* with no transforms at all.
*
* @param {{ projects: Array<import('../../lib/projects').Project>, mobileOptimized?: boolean }} props
*/
function WorkShowcase({ projects = [], mobileOptimized = false }) {
	const reduce = useReducedMotion();
	const [rich, setRich] = useState(false);
	const compact = useMediaQuery(COMPACT_QUERY);
	const [active, setActive] = useState(0);
	useEffect(() => {
		const query = window.matchMedia(RICH_QUERY);
		const update = () => setRich(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	if (projects.length === 0) return null;
	const focused = projects[Math.min(active, projects.length - 1)];
	return /* @__PURE__ */ jsxs("div", {
		className: `work-flow ${mobileOptimized ? "work-flow--uiux" : ""} mt-8 min-[769px]:mt-12 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16 xl:gap-24`,
		children: [/* @__PURE__ */ jsx(FixedPanel, {
			project: focused,
			count: projects.length,
			index: active,
			reduce
		}), /* @__PURE__ */ jsx("div", {
			className: "work-flow__track",
			children: projects.map((project, index) => {
				const reveal = compact && !reduce;
				return /* @__PURE__ */ jsx(motion.div, {
					className: "work-flow__reveal w-full min-w-0",
					initial: reveal ? {
						opacity: 0,
						y: 22,
						scale: .97
					} : false,
					whileInView: reveal ? {
						opacity: 1,
						y: 0,
						scale: 1
					} : void 0,
					viewport: {
						once: true,
						amount: .18
					},
					transition: {
						duration: mobileOptimized ? .32 : .48,
						delay: mobileOptimized ? 0 : index % 2 * .07,
						ease: [...EASE]
					},
					children: /* @__PURE__ */ jsx(FlowItem, {
						project,
						index,
						rich: !compact && rich && !reduce,
						reduce: compact ? reduce || mobileOptimized : reduce,
						onFocus: setActive
					})
				}, `${project.slug}-${compact ? "compact" : "wide"}`);
			})
		})]
	});
}
//#endregion
//#region resources/js/lib/uiuxShowcase.js
/** The UI/UX Portfolio page, where the six projects are previewed. */
var PORTFOLIO_HREF = "/work/portfolio/uiux";
/**
* A UI/UX project's own printer page.
*
* @param {string} slug
*/
var projectHref = (slug) => `${PORTFOLIO_HREF}/${slug}`;
//#endregion
//#region resources/js/pages/Work/Portfolio.jsx
/** The UI/UX portfolio's accent: the brand purple, so its visuals carry a purple shade. */
var UIUX_ACCENT = "#891FFB";
/**
* The six UI/UX showcase projects in the shape the Branding showcase uses.
*
* Each leads to its printer page rather than a case study, and lists every
* page designed where a Branding project lists its tags.
*
* @param {Array<{ slug: string, name: string, discipline: string, cover: ({ thumb: string, alt: string }|null), screens: Array<{ label: string }> }>} showcase
*/
function uiuxProjects(showcase) {
	return showcase.map((project) => {
		const pageCount = project.screens.length;
		const pages = `${pageCount} ${pageCount === 1 ? "page" : "pages"}`;
		return {
			slug: project.slug,
			href: projectHref(project.slug),
			ctaLabel: "See all pages",
			title: project.name,
			client: project.discipline,
			year: pages,
			description: `${pages} designed for ${project.name}. Open the project to print every page and view each one full size.`,
			tags: project.screens.map((screen) => screen.label),
			accent: UIUX_ACCENT,
			image: project.cover?.thumb ?? null,
			imagePosition: project.cover && project.cover.src !== project.screens[0]?.src ? "center" : "top",
			imageAlt: project.cover?.alt ?? project.name,
			metric: null,
			metricLabel: null
		};
	});
}
/**
* One portfolio: every project filed under that practice.
*
* The heading is the portfolio's own name, so the reader always knows which of
* the two they are inside. Both portfolios use the same showcase — the written
* half holds still while the visuals float up past it. Branding lists its
* published projects, each opening its case study; UI/UX lists its six
* showcase projects, each opening its printer page.
*/
function WorkPortfolio({ group, projects = [], showcase = null }) {
	const tapIntent = useTapIntent();
	const { url } = usePage();
	const listed = useMemo(() => showcase ? uiuxProjects(showcase) : projects, [showcase, projects]);
	useEffect(() => {
		const slug = new URLSearchParams(url.split("?")[1] ?? "").get("project");
		const item = slug ? document.getElementById(`work-${slug}`) : null;
		if (!item) return;
		const top = item.getBoundingClientRect().top + window.scrollY - window.innerHeight * .25;
		if (window.__lenis) window.__lenis.scrollTo(top, {
			immediate: true,
			force: true
		});
		else window.scrollTo(0, top);
	}, [url]);
	const goBack = (event) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (event.button !== void 0 && event.button !== 0) return;
		tapIntent.onClick(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		transitionTo("/work");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: `${group.heading} | Marketorr` }), /* @__PURE__ */ jsx("div", {
		className: "bg-[var(--bg)] pb-16 pt-24 md:pb-24 md:pt-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "OUR WORK" }),
				/* @__PURE__ */ jsx(ScrollHeading, {
					className: "mt-8",
					children: /* @__PURE__ */ jsx("h1", {
						className: "display-lg uppercase text-[var(--ink-strong)]",
						children: /* @__PURE__ */ jsx(GradientTitle, { text: group.heading })
					})
				}),
				/* @__PURE__ */ jsx(WorkShowcase, {
					projects: listed,
					mobileOptimized: Boolean(showcase)
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-12 md:mt-16",
					children: /* @__PURE__ */ jsx(Link, {
						href: "/work",
						"data-cursor": "explore",
						onPointerDown: tapIntent.onPointerDown,
						onPointerCancel: tapIntent.onPointerCancel,
						onClick: goBack,
						className: "btn-press inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--field-line)] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)] md:px-7 md:py-3.5 md:text-[13px] md:tracking-[0.16em]",
						children: "← All work"
					})
				})
			]
		})
	})] });
}
//#endregion
export { WorkPortfolio as default };
