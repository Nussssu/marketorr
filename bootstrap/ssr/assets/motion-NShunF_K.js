import { Head, usePage } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/PageMeta.jsx
/**
* Per-page head tags driven by the CMS: title, description, canonical, robots
* and Open Graph, each falling back to the site defaults from Settings.
*
* @param {{ page?: { title?: string, meta?: object }, fallbackTitle?: string }} props
*/
function PageMeta({ page, fallbackTitle }) {
	const { settings } = usePage().props;
	const meta = page?.meta ?? {};
	const title = meta.title || page?.title || fallbackTitle || settings.meta.title;
	const description = meta.description || settings.meta.description;
	const ogImage = meta.ogImage || settings.meta.ogImage;
	return /* @__PURE__ */ jsxs(Head, {
		title,
		children: [
			/* @__PURE__ */ jsx("meta", {
				name: "description",
				content: description,
				"head-key": "description"
			}),
			meta.robots && /* @__PURE__ */ jsx("meta", {
				name: "robots",
				content: meta.robots,
				"head-key": "robots"
			}),
			meta.canonical && /* @__PURE__ */ jsx("link", {
				rel: "canonical",
				href: meta.canonical,
				"head-key": "canonical"
			}),
			/* @__PURE__ */ jsx("meta", {
				property: "og:title",
				content: title,
				"head-key": "og:title"
			}),
			/* @__PURE__ */ jsx("meta", {
				property: "og:description",
				content: description,
				"head-key": "og:description"
			}),
			/* @__PURE__ */ jsx("meta", {
				property: "og:type",
				content: "website",
				"head-key": "og:type"
			}),
			ogImage && /* @__PURE__ */ jsx("meta", {
				property: "og:image",
				content: ogImage,
				"head-key": "og:image"
			}),
			/* @__PURE__ */ jsx("meta", {
				name: "twitter:card",
				content: ogImage ? "summary_large_image" : "summary",
				"head-key": "twitter:card"
			}),
			meta.schema && /* @__PURE__ */ jsx("script", {
				type: "application/ld+json",
				"head-key": "schema",
				children: JSON.stringify(meta.schema)
			})
		]
	});
}
//#endregion
//#region resources/js/lib/motion.js
var EASE = [
	.22,
	1,
	.36,
	1
];
/**
* A short, transform-only zoom-out used by every portfolio hero visual.
* The media starts slightly oversized, then settles at its exact rendered
* size without changing layout or waiting for image/video decoding.
*/
var heroMediaEntrance = (disabled = false) => ({
	initial: disabled ? false : { scale: 1.18 },
	animate: { scale: 1 },
	transition: {
		duration: disabled ? 0 : .95,
		delay: disabled ? 0 : .06,
		ease: [...EASE]
	}
});
/**
* A CSS-driven entrance (see `.enter` in app.css): the class and timing
* variables for one element. Used above the fold, where a server-rendered page
* must start its opening moves on first paint rather than after hydration.
*
* @param {'fade-up'|'mask-up'|'scale-x'|'grow-y'|'settle'|'lift'} kind
* @param {{ dur?: number, delay?: number, y?: number|string, to?: number, scale?: number, className?: string, style?: object }} [options]
*   `dur`/`delay` in seconds; `y` in px (or any CSS length); `to` is the end
*   opacity; `scale` the starting scale of a lift.
* @return {{ className: string, style: object }}
*/
var enter = (kind, { dur = .4, delay = 0, y, to, scale, className = "", style = {} } = {}) => ({
	className: `enter enter--${kind} ${className}`.trim(),
	style: {
		"--enter-dur": `${dur}s`,
		"--enter-delay": `${delay}s`,
		...y !== void 0 ? { "--enter-y": typeof y === "number" ? `${y}px` : y } : {},
		...to !== void 0 ? { "--enter-to": to } : {},
		...scale !== void 0 ? { "--enter-scale": scale } : {},
		...style
	}
});
//#endregion
export { PageMeta as i, enter as n, heroMediaEntrance as r, EASE as t };
