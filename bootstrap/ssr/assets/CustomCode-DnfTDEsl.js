import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { c as PageHeader, l as Panel, n as Button, o as Field, p as Textarea } from "./ui-DUoJPW2G.js";
import { Head, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/CustomCode.jsx
/**
* Code injected into every public page — analytics, pixels, chat widgets —
* kept apart from the rest of the site settings.
*/
function CustomCode({ code }) {
	const { data, setData, put, processing, errors, isDirty } = useForm({
		head_scripts: code.head_scripts ?? "",
		body_scripts: code.body_scripts ?? ""
	});
	const submit = (e) => {
		e.preventDefault();
		put("/admin/custom-code", { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Custom Code | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Custom code",
			subtitle: "Code injected into every page of the site: analytics, Meta Pixel, live chat and verification tags."
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 p-4 text-[12px] text-[var(--ink)]",
					children: [/* @__PURE__ */ jsx("strong", {
						className: "font-bold text-[#6F91FF]",
						children: "Caution:"
					}), " Injected code runs verbatim in public visitor browsers. Only paste trusted verification tags and tracking scripts."]
				}),
				/* @__PURE__ */ jsx(Panel, {
					title: "Head code",
					description: "Rendered inside the HTML <head> of every page, immediately before the closing </head> tag.",
					children: /* @__PURE__ */ jsx(Field, {
						label: "<head> Code Injection (Google Analytics, GTM, Meta Pixel)",
						error: errors.head_scripts,
						children: /* @__PURE__ */ jsx(Textarea, {
							rows: 8,
							className: "font-mono text-[12px]",
							value: data.head_scripts,
							onChange: (e) => setData("head_scripts", e.target.value),
							placeholder: "<!-- Google tag (gtag.js) -->\\n<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXX'><\/script>"
						})
					})
				}),
				/* @__PURE__ */ jsx(Panel, {
					title: "Body code",
					description: "Rendered immediately before the closing </body> tag. Ideal for Intercom, Crisp, Drift or performance tracking scripts.",
					children: /* @__PURE__ */ jsx(Field, {
						label: "<body> / Footer Code Injection (Chat Widgets, Conversion Pixels)",
						error: errors.body_scripts,
						children: /* @__PURE__ */ jsx(Textarea, {
							rows: 8,
							className: "font-mono text-[12px]",
							value: data.body_scripts,
							onChange: (e) => setData("body_scripts", e.target.value),
							placeholder: "<!-- Live Chat Widget -->\\n<script>window.$crisp=[];window.CRISP_WEBSITE_ID='...';<\/script>"
						})
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)]/95 p-4 shadow-xl backdrop-blur-md",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[12px] text-[var(--mute)]",
						children: isDirty ? "You have unsaved changes." : "Changes apply to every page as soon as they are saved."
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						className: "min-w-[140px]",
						children: processing ? "Saving…" : "Save custom code"
					})]
				})
			]
		})
	] });
}
CustomCode.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { CustomCode as default };
