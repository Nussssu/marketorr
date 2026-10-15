import { g as Tag, h as SectionLabel } from "../ssr.js";
import { t as ScrollHeading } from "./ScrollHeading-BhPAyGdL.js";
import { n as BounceTitle, t as UiuxPrinter } from "./UiuxPrinter-Qynryw3d.js";
import { Head } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Work/UiuxProject.jsx
/** The UI/UX accent, matching the portfolio's purple. */
var ACCENT = "#891FFB";
/**
* One UI/UX project's own page, opened from "See all pages" in the portfolio.
*
* The project's name heads the page, with a line or two on the project and
* what Marketorr worked on beneath it, then the project's printer; every
* printed page opens larger in place.
*/
function UiuxProject({ project }) {
	const services = project.services ?? [];
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: `${project.name} | Marketorr` }), /* @__PURE__ */ jsxs("div", {
		className: "bg-[var(--bg)] pb-16 pt-24 md:pb-24 md:pt-32",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "UI/UX PORTFOLIO" }),
				/* @__PURE__ */ jsx(ScrollHeading, {
					className: "mt-6 md:mt-8",
					children: /* @__PURE__ */ jsx("h1", {
						className: "display-lg uppercase text-[var(--ink-strong)]",
						children: /* @__PURE__ */ jsx(BounceTitle, { text: project.name })
					})
				}),
				project.summary && /* @__PURE__ */ jsx("p", {
					className: "mt-5 max-w-2xl text-sm leading-relaxed text-[var(--mute)] md:mt-6 md:text-base",
					children: project.summary
				}),
				services.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "mt-5 md:mt-6",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
						children: "What Marketorr worked on"
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: services.map((service) => /* @__PURE__ */ jsx(Tag, {
							accent: ACCENT,
							children: service
						}, service))
					})]
				})
			]
		}), /* @__PURE__ */ jsx(UiuxPrinter, { project })]
	})] });
}
//#endregion
export { UiuxProject as default };
