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
export { PageMeta as t };
