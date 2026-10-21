import { i as MagneticButton, n as transitionTo, r as useTapIntent, t as consumeShowcaseArrival, y as withAlpha } from "../ssr.js";
import { i as PageMeta, n as enter, t as EASE } from "./motion-NShunF_K.js";
import { t as MediaPlaceholder } from "./MediaPlaceholder-BAEKlLsR.js";
import { t as ServiceScene } from "./ServiceScene-Cp6wqteA.js";
import { Link } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion } from "framer-motion";
//#region resources/js/components/sections/SubServiceHero.jsx
/**
* Hero for every sub-service page (Brand Strategy … Design System).
*
* The copy sits on the left — breadcrumb, place in the practice, title,
* standfirst and deliverables — and the right shows the service itself: an
* animated scene built for that service (`ServiceScene`), held in a framed
* stage. When a sub-service has its own photograph, the frame shows that
* instead.
*
* Nothing moves on scroll and nothing lies over the visual; the page simply
* scrolls on. The only motion is the entrance and the scene's own loop, and
* reduced motion renders both settled.
*
* @param {{ item: { slug: string, name: string, short: string, image: string|null, imageAlt?: string, accent: string, deliverables: string[], position: number, total: number, category: { slug: string, name: string } }, parentHref: string }} props
*/
function SubServiceHero({ item, parentHref }) {
	const reduce = useReducedMotion();
	/**
	* Arrived by clicking this sub-service's photograph in the category
	* showcase: that picture is already in flight to the frame, so the frame
	* appears in place instead of playing its own entrance.
	*/
	const [arrived] = useState(consumeShowcaseArrival);
	const frameClass = "relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--bg-soft)]";
	const words = item.name.toUpperCase().split(" ");
	let charIndex = 0;
	const rise = (delay, className, y = 18) => enter("fade-up", {
		dur: .8,
		delay,
		y,
		className
	});
	return /* @__PURE__ */ jsxs("section", {
		className: "relative overflow-hidden bg-[var(--bg)] pb-12 pt-28 md:pb-16 md:pt-32 lg:min-h-svh lg:pb-20",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid-bg pointer-events-none absolute inset-0",
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute right-[-10%] top-[10%] h-[620px] w-[620px] rounded-full",
				style: { background: `radial-gradient(closest-side, ${withAlpha(item.accent, "26")}, transparent)` },
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "container-x relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("nav", {
						...rise(.1, "flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]", -10),
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
							/* @__PURE__ */ jsx(Link, {
								href: parentHref,
								className: "tap-area transition-colors duration-200 hover:text-[var(--ink)]",
								children: item.category.name
							}),
							/* @__PURE__ */ jsx("span", {
								"aria-hidden": true,
								children: "/"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "truncate text-[var(--ink)]",
								children: item.name
							})
						]
					}),
					/* @__PURE__ */ jsxs("p", {
						...rise(.2, "mt-10 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--ink-faint)] md:mt-14"),
						children: [
							String(item.position).padStart(2, "0"),
							" / ",
							String(item.total).padStart(2, "0"),
							" · ",
							item.category.name
						]
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-6 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-[var(--ink-strong)]",
						style: { fontSize: "clamp(2.6rem, 6.4vw, 6.25rem)" },
						"aria-label": item.name,
						children: words.map((word, w) => /* @__PURE__ */ jsx("span", {
							className: "mr-[0.24em] inline-block whitespace-nowrap last:mr-0",
							"aria-hidden": true,
							children: word.split("").map((char) => {
								const i = charIndex++;
								return /* @__PURE__ */ jsx("span", {
									className: "inline-block overflow-hidden pb-[0.08em] align-bottom",
									children: /* @__PURE__ */ jsx("span", {
										...enter("mask-up", {
											dur: 1,
											delay: .3 + Math.min(i, 14) * .045,
											y: "115%",
											className: "inline-block will-change-transform"
										}),
										children: char
									})
								}, i);
							})
						}, w))
					}),
					/* @__PURE__ */ jsx("p", {
						...rise(.75, "mt-6 max-w-md text-[17px] leading-relaxed text-[var(--mute)] md:text-lg"),
						children: item.short
					}),
					item.deliverables?.length > 0 && /* @__PURE__ */ jsx("ul", {
						...rise(.9, "mt-8 flex flex-wrap gap-2"),
						children: item.deliverables.map((deliverable) => /* @__PURE__ */ jsx("li", {
							className: "rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: deliverable
						}, deliverable))
					})
				] }), /* @__PURE__ */ jsx("div", {
					...arrived ? { className: frameClass } : enter("lift", {
						dur: 1,
						delay: .35,
						y: 48,
						scale: .96,
						className: frameClass
					}),
					children: item.image ? /* @__PURE__ */ jsx("img", {
						src: item.image,
						alt: item.imageAlt ?? `${item.name} featured visual`,
						fetchPriority: "high",
						decoding: "async",
						draggable: false,
						className: "h-full w-full object-cover"
					}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
						className: "grid-bg pointer-events-none absolute inset-0 opacity-70",
						"aria-hidden": true
					}), /* @__PURE__ */ jsx(ServiceScene, {
						slug: item.slug,
						still: Boolean(reduce),
						className: "absolute inset-0"
					})] })
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/components/sections/SubServiceCaseStudy.jsx
/**
* About / case-study narrative for a dedicated sub-service page.
*
* Each block pairs one idea (eyebrow, heading, body) with the exact Behance
* visuals that document it — every image appears once, in its natural aspect
* ratio, lazy-loaded below the fold. Headings stay a single solid colour, in
* line with the Services pages. Purely presentational motion: fade and rise
* on entry, parked under reduced motion.
*
* @param {{ study: { meta?: string, sections: Array<{ eyebrow: string, heading: string, body: string, images: Array<{ src: string, alt: string }> }> } }} props
*/
function SubServiceCaseStudy({ study }) {
	const reduce = useReducedMotion();
	const sections = study?.sections ?? [];
	if (sections.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "container-x pb-24 pt-4 lg:pb-32",
		"aria-label": "Case study",
		children: [study.meta && /* @__PURE__ */ jsx("p", {
			className: "border-t border-[var(--line)] pt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
			children: study.meta
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-4 flex flex-col gap-16 sm:gap-20",
			children: sections.map((section, sectionIndex) => /* @__PURE__ */ jsxs(motion.article, {
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
					margin: "-8% 0px"
				},
				transition: {
					duration: reduce ? 0 : .7,
					ease: [...EASE]
				},
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]",
						children: section.eyebrow
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "font-display mt-3 max-w-3xl text-[clamp(1.6rem,4.5vw,2.75rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-[var(--ink-strong)]",
						children: section.heading
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--mute)] sm:text-base",
						children: section.body
					}),
					(section.images ?? []).length > 0 && /* @__PURE__ */ jsx("div", {
						className: section.images.length > 2 ? "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "mt-8 grid gap-4 sm:grid-cols-2",
						children: section.images.map((image, imageIndex) => image.src ? /* @__PURE__ */ jsx("img", {
							src: image.src,
							alt: image.alt,
							loading: sectionIndex === 0 && imageIndex === 0 ? "eager" : "lazy",
							decoding: "async",
							draggable: false,
							className: "h-auto w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
						}, image.src) : /* @__PURE__ */ jsx("span", {
							className: "relative block aspect-video w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]",
							children: /* @__PURE__ */ jsx(MediaPlaceholder, { label: image.alt ?? "Case study image placeholder" })
						}, `slot-${imageIndex}`))
					})
				]
			}, `${section.eyebrow}-${sectionIndex}`))
		})]
	});
}
//#endregion
//#region resources/js/lib/subServicePage.js
/**
* Fills a sub-service page's editable copy: `{name}` becomes the
* sub-service's name and `{category}` its tab's name, as set in the admin.
*
* @param {string|undefined|null} text
* @param {{ name: string, category: { name: string } }} item
* @return {string}
*/
function fillPageText(text, item) {
	return String(text ?? "").replaceAll("{name}", item.name).replaceAll("{category}", item.category?.name ?? "");
}
//#endregion
//#region resources/js/components/sections/SubServiceWork.jsx
/**
* One piece of related work: its cover, name and discipline, linking to the
* project (a Branding project page, or the UI/UX portfolio opened on it).
*/
function WorkCard({ work, index, reduce, onOpen, tapIntent }) {
	return /* @__PURE__ */ jsx(motion.li, {
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
			duration: reduce ? 0 : .7,
			delay: reduce ? 0 : index * .08,
			ease: [...EASE]
		},
		children: /* @__PURE__ */ jsxs(Link, {
			href: work.href,
			"data-cursor": "view",
			onPointerDown: tapIntent.onPointerDown,
			onPointerCancel: tapIntent.onPointerCancel,
			onClick: (event) => onOpen(event, work.href),
			className: "group block",
			children: [/* @__PURE__ */ jsx("div", {
				className: "relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)]",
				children: /* @__PURE__ */ jsx("img", {
					src: work.image,
					alt: work.imageAlt,
					loading: "lazy",
					decoding: "async",
					draggable: false,
					className: "h-full w-full object-cover transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.04]"
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-2.5 flex items-start justify-between gap-2 sm:mt-4 sm:gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "font-display text-[12px] font-bold uppercase leading-tight tracking-[0.03em] text-[var(--ink-strong)] sm:text-[15px] sm:leading-normal sm:tracking-[0.04em]",
						children: work.title
					}), work.meta && /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)] sm:text-[11px] sm:tracking-[0.16em]",
						children: work.meta
					})]
				}), /* @__PURE__ */ jsx("span", {
					className: "mt-0.5 text-[12px] text-[var(--ink-faint)] transition-transform sm:text-base duration-300 group-hover:translate-x-1 group-hover:text-[var(--ink)]",
					"aria-hidden": true,
					children: "→"
				})]
			})]
		})
	});
}
/**
* Real Marketorr work related to this sub-service, picked on the server by
* `App\Services\SubServiceRelatedWork` from the portfolio that presents the
* discipline — Branding projects for Branding services, the UI/UX showcase
* for UI/UX services. Each card opens the project.
*
* @param {{ item: { name: string, category: { slug: string, name: string }, relatedWork?: Array<{ slug: string, title: string, meta: string, image: string, imageAlt: string, href: string }> } }} props
*/
function SubServiceWork({ item }) {
	const reduce = useReducedMotion();
	const tapIntent = useTapIntent();
	const work = item.relatedWork ?? [];
	if (work.length === 0) return null;
	const portfolioHref = `/work/portfolio/${item.category.slug === "ui-ux" ? "uiux" : "branding"}`;
	const open = (event, href) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (event.button !== void 0 && event.button !== 0) return;
		tapIntent.onClick(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		transitionTo(href);
	};
	return /* @__PURE__ */ jsxs("section", {
		className: "mt-14",
		"aria-labelledby": "related-work-heading",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
				children: fillPageText(item.page?.work_label, item)
			}), /* @__PURE__ */ jsx("h2", {
				id: "related-work-heading",
				className: "mt-3 font-display text-2xl font-bold uppercase text-[var(--ink-strong)] md:text-3xl",
				children: fillPageText(item.page?.work_heading, item)
			})] }), /* @__PURE__ */ jsxs(Link, {
				href: portfolioHref,
				"data-cursor": "explore",
				onPointerDown: tapIntent.onPointerDown,
				onPointerCancel: tapIntent.onPointerCancel,
				onClick: (event) => open(event, portfolioHref),
				className: "btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]",
				children: [fillPageText(item.page?.portfolio_label, item), " →"]
			})]
		}), /* @__PURE__ */ jsx("ul", {
			className: "mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4",
			children: work.map((entry, index) => /* @__PURE__ */ jsx(WorkCard, {
				work: entry,
				index,
				reduce,
				onOpen: open,
				tapIntent
			}, entry.slug))
		})]
	});
}
//#endregion
//#region resources/js/pages/Services/SubShow.jsx
function SubServicePage({ item, siblings, parentHref, parentName }) {
	const tapIntent = useTapIntent();
	const goSibling = (event, url) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (event.button !== void 0 && event.button !== 0) return;
		tapIntent.onClick(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		transitionTo(url);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(PageMeta, {
		page: {
			title: item.meta?.title,
			meta: item.meta ?? {}
		},
		fallbackTitle: `${item.name} | Marketorr`
	}), /* @__PURE__ */ jsxs("article", {
		className: "bg-[var(--bg)] pb-24",
		children: [/* @__PURE__ */ jsx(SubServiceHero, {
			item,
			parentHref
		}), /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "mt-6 max-w-2xl text-lg leading-relaxed text-[var(--mute)]",
					children: item.description
				}),
				/* @__PURE__ */ jsx(SubServiceWork, { item }),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-14 grid gap-10 lg:grid-cols-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-xl font-bold uppercase text-[var(--ink-strong)]",
							children: fillPageText(item.page?.deliverables_heading, item)
						}), /* @__PURE__ */ jsx("ul", {
							className: "mt-5 space-y-3 text-[15px] text-[var(--mute)]",
							children: item.deliverables.map((d) => /* @__PURE__ */ jsxs("li", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "h-2 w-2 shrink-0 rounded-full",
										style: { background: item.accent },
										"aria-hidden": true
									}),
									" ",
									d
								]
							}, d))
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-xl font-bold uppercase text-[var(--ink-strong)]",
							children: fillPageText(item.page?.practice_heading, item)
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-4 max-w-md text-[15px] leading-relaxed text-[var(--mute)]",
							children: [
								item.short,
								" ",
								fillPageText(item.page?.practice_body, item)
							]
						})] }), /* @__PURE__ */ jsxs(Link, {
							href: item.page?.discuss_url || "/contact",
							"data-cursor": "cta",
							className: "btn-press mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white",
							style: { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
							children: [fillPageText(item.page?.discuss_label, item), " ↗"]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-8 flex flex-wrap gap-4",
					children: [/* @__PURE__ */ jsx(MagneticButton, { children: /* @__PURE__ */ jsxs(Link, {
						href: item.page?.start_url || "/#contact",
						"data-cursor": "cta",
						className: "btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white",
						style: { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
						children: [fillPageText(item.page?.start_label, item), " ↗"]
					}) }), /* @__PURE__ */ jsxs(Link, {
						href: parentHref,
						className: "btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]",
						children: ["← ", parentName]
					})]
				}),
				item.case_study && /* @__PURE__ */ jsx(SubServiceCaseStudy, { study: item.case_study }),
				siblings.length > 0 && /* @__PURE__ */ jsx("nav", {
					className: "mt-14 flex flex-wrap gap-3",
					"aria-label": "Related sub-services",
					children: siblings.map((s) => /* @__PURE__ */ jsxs(Link, {
						href: s.url,
						"data-cursor": "explore",
						onPointerDown: tapIntent.onPointerDown,
						onPointerCancel: tapIntent.onPointerCancel,
						onClick: (event) => goSibling(event, s.url),
						className: "btn-press inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:text-[var(--ink)]",
						children: [s.name, " →"]
					}, s.slug))
				})
			]
		})]
	})] });
}
//#endregion
export { SubServicePage as default };
