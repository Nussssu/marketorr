import { n as transitionTo, r as useTapIntent, y as withAlpha } from "../ssr.js";
import { t as PageMeta } from "./PageMeta-QhsyNps2.js";
import { t as SectionRenderer } from "./SectionRenderer-BPcuGTF3.js";
import { n as enter } from "./motion-DQVPQ9oM.js";
import { t as ServiceScene } from "./ServiceScene-Cp6wqteA.js";
import { Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useReducedMotion } from "framer-motion";
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
* `blendTop` fades the accent glow in from the section's top edge, so a hero
* stacked under another one joins it without a visible seam.
*
* @param {{ category: { slug: string, name: string, tagline: string, accent: string, items: Array<{ slug: string, name: string, accent: string }> }, blendTop?: boolean }} props
*/
function CategoryHero({ category, blendTop = false }) {
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
		className: `relative overflow-hidden bg-[var(--bg)] pb-12 md:pt-32 lg:pb-16 ${blendTop ? "pt-8" : "pt-28"}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute left-1/2 top-[-260px] h-[560px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-full",
			style: {
				background: `radial-gradient(closest-side, ${withAlpha(category.accent, "2e")}, transparent)`,
				...blendTop ? {
					maskImage: "linear-gradient(to bottom, transparent 46%, black 78%)",
					WebkitMaskImage: "linear-gradient(to bottom, transparent 46%, black 78%)"
				} : {}
			},
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
				/* @__PURE__ */ jsx("div", {
					className: "mt-8 flex flex-col gap-6 md:mt-10 lg:flex-row lg:items-end lg:justify-between",
					children: /* @__PURE__ */ jsx("h1", {
						className: "heading-hero-size font-display font-extrabold uppercase leading-[0.85] tracking-[-0.04em] text-[var(--ink-strong)]",
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
					})
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
//#region resources/js/pages/Services/Index.jsx
function ServicesDirectory({ subservices }) {
	return /* @__PURE__ */ jsx("div", {
		className: "bg-[var(--bg)]",
		children: subservices.map((category, index) => /* @__PURE__ */ jsx("div", {
			id: category.slug,
			children: /* @__PURE__ */ jsx(CategoryHero, {
				category,
				blendTop: index > 0
			})
		}, category.slug))
	});
}
function ServicesIndex({ page, subservices }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageMeta, {
		page,
		fallbackTitle: "Services | Marketorr"
	}), (page?.sections ?? []).map((section) => section.type === "services" ? /* @__PURE__ */ jsx(ServicesDirectory, { subservices }, section.id) : /* @__PURE__ */ jsx(SectionRenderer, { sections: [section] }, section.id))] });
}
//#endregion
export { ServicesIndex as default };
