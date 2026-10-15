import { a as markBarStyle, g as Tag, h as SectionLabel, i as MARK, l as MagneticButton, o as markGap } from "../ssr.js";
import { Head, Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Services/Show.jsx
/** Height of the progression visual's tallest bar, in the logo's proportions. */
var PROGRESSION_SIZE = "clamp(190px, 20vw, 260px)";
function ServicePage({ service: s, services }) {
	const grad = s.accentTo ? `linear-gradient(90deg, ${s.accent}, ${s.accentTo})` : s.accent;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: `${s.name} | Marketorr` }), /* @__PURE__ */ jsx("article", {
		className: "bg-[var(--bg)] pb-24 pt-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: s.name.toUpperCase() }),
				/* @__PURE__ */ jsx("h1", {
					className: "display-lg mt-8 uppercase text-[var(--ink-strong)]",
					children: s.name
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-6 max-w-2xl text-lg text-[var(--mute)]",
					children: s.description
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-8 flex flex-wrap gap-4",
					children: [/* @__PURE__ */ jsx(MagneticButton, { children: /* @__PURE__ */ jsx(Link, {
						href: "/#contact",
						"data-cursor": "cta",
						className: "btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white",
						style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
						children: "Start a project ↗"
					}) }), /* @__PURE__ */ jsx(Link, {
						href: "/work",
						className: "btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]",
						children: "View work →"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-14 flex items-end",
					style: { gap: markGap(PROGRESSION_SIZE) },
					"aria-hidden": true,
					children: [MARK.colors.map((c, i) => /* @__PURE__ */ jsx("span", {
						className: "border",
						style: {
							...markBarStyle(PROGRESSION_SIZE, i),
							background: `linear-gradient(180deg, ${c}66, transparent)`,
							borderColor: `${c}44`
						}
					}, c)), /* @__PURE__ */ jsx("span", {
						className: "mb-2 ml-2 h-[3px] flex-1",
						style: { background: grad }
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-14 grid gap-10 lg:grid-cols-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-xl font-bold uppercase text-[var(--ink-strong)]",
							children: "Capabilities"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: s.capabilities.map((c) => /* @__PURE__ */ jsx(Tag, {
								accent: s.accent,
								children: c
							}, c))
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-display text-xl font-bold uppercase text-[var(--ink-strong)]",
								children: "What you get"
							}),
							/* @__PURE__ */ jsx("ul", {
								className: "mt-5 space-y-3 text-[15px] text-[var(--mute)]",
								children: s.deliverables.map((d) => /* @__PURE__ */ jsxs("li", {
									className: "flex items-center gap-3",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "h-2 w-2 rounded-full",
											style: { background: grad },
											"aria-hidden": true
										}),
										" ",
										d
									]
								}, d))
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-7 grid grid-cols-2 gap-4",
								children: s.outcomes.map((o) => /* @__PURE__ */ jsxs("div", {
									className: "rounded-xl bg-[var(--surface-2)] p-4",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-display text-2xl font-extrabold text-[var(--ink-strong)]",
										children: o.value
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
										children: o.label
									})]
								}, o.label))
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx("nav", {
					className: "mt-14 flex flex-wrap gap-3",
					"aria-label": "Other services",
					children: services.filter((x) => x.slug !== s.slug).map((o) => /* @__PURE__ */ jsxs(Link, {
						href: `/services/${o.slug}`,
						"data-cursor": "explore",
						className: "btn-press inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:text-[var(--ink)]",
						children: [o.name, " →"]
					}, o.slug))
				})
			]
		})
	})] });
}
//#endregion
export { ServicePage as default };
