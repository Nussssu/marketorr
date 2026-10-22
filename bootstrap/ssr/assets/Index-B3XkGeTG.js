import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { C as MediaPickerField, _ as Toggle, c as PageHeader, l as Panel, n as Button, o as Field, r as ColorInput, s as Input } from "./ui-BFNViBV5.js";
import { Head, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Blocks/Index.jsx
/** Human labels for the content keys a block stores. */
var LABELS = {
	message: "Message",
	linkLabel: "Link label",
	linkUrl: "Link URL",
	accent: "Background colour",
	image: "Media asset",
	media: "Media asset"
};
function BlockEditor({ block }) {
	const { data, setData, put, processing, errors } = useForm({
		name: block.name,
		enabled: block.enabled,
		content: block.content ?? {}
	});
	const setContent = (key, value) => setData("content", {
		...data.content,
		[key]: value
	});
	const submit = (e) => {
		e.preventDefault();
		put(`/admin/blocks/${block.id}`, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: block.name,
		description: block.enabled ? "Currently showing on the site." : "Currently hidden.",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-5",
			children: [
				Object.entries(data.content).map(([key, value]) => /* @__PURE__ */ jsx("div", { children: key === "accent" ? /* @__PURE__ */ jsx(Field, {
					label: LABELS[key] ?? key,
					error: errors[`content.${key}`],
					children: /* @__PURE__ */ jsx(ColorInput, {
						value: value ?? "",
						onChange: (next) => setContent(key, next)
					})
				}) : key === "image" || key === "media" ? /* @__PURE__ */ jsx(MediaPickerField, {
					label: LABELS[key] ?? key,
					value: value ?? "",
					onChange: (next) => setContent(key, next),
					error: errors[`content.${key}`]
				}) : /* @__PURE__ */ jsx(Field, {
					label: LABELS[key] ?? key,
					error: errors[`content.${key}`],
					children: /* @__PURE__ */ jsx(Input, {
						value: value ?? "",
						onChange: (e) => setContent(key, e.target.value)
					})
				}) }, key)),
				data.content.image === void 0 && data.content.media === void 0 && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setContent("image", ""),
					className: "inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors",
					children: "+ Choose Media from Library"
				}) }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5",
					children: [/* @__PURE__ */ jsx(Toggle, {
						checked: data.enabled,
						onChange: (value) => setData("enabled", value),
						label: "Show on the site"
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						children: processing ? "Saving…" : "Save block"
					})]
				})
			]
		})
	});
}
function BlocksIndex({ blocks }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Global blocks | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Global blocks",
			subtitle: "Reusable content shown across the whole site."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "space-y-6",
			children: blocks.map((block) => /* @__PURE__ */ jsx(BlockEditor, { block }, block.id))
		})
	] });
}
BlocksIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { BlocksIndex as default };
