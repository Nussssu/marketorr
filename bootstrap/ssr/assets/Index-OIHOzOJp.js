import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { _ as useConfirm, a as EmptyState, c as PageHeader, i as ConfirmDialog, l as Panel, n as Button, t as Badge } from "./ui-DUoJPW2G.js";
import { Head, Link, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Pages/Index.jsx
var ICON_PATHS = {
	edit: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("path", { d: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" }), /* @__PURE__ */ jsx("path", { d: "m13.5 6.5 4 4" })] }),
	view: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("path", { d: "M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" }), /* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "12",
		r: "2.75"
	})] }),
	duplicate: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("rect", {
		x: "8.5",
		y: "8.5",
		width: "11",
		height: "11",
		rx: "2"
	}), /* @__PURE__ */ jsx("path", { d: "M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" })] }),
	delete: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("path", { d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" }), /* @__PURE__ */ jsx("path", { d: "M10 11.5v5M14 11.5v5" })] })
};
var ICON_BUTTON = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors";
var NEUTRAL_ICON = `${ICON_BUTTON} text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]`;
function ActionIcon({ name }) {
	return /* @__PURE__ */ jsx("svg", {
		"aria-hidden": "true",
		className: "h-4 w-4",
		fill: "none",
		viewBox: "0 0 24 24",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: ICON_PATHS[name]
	});
}
function PagesIndex({ pages }) {
	const [request, confirm, cancel, run] = useConfirm();
	const askDelete = (page) => {
		confirm({
			title: `Delete “${page.title}”?`,
			body: `Its ${page.sections_count} section(s) go with it. The page is soft-deleted and can be restored from the database.`,
			action: () => router.delete(`/admin/pages/${page.id}`, { preserveScroll: true })
		});
	};
	const duplicate = (page) => router.post(`/admin/pages/${page.id}/duplicate`, {}, { preserveScroll: true });
	const toggleVisibility = (page) => {
		router.patch(`/admin/pages/${page.id}/visibility`, {}, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Pages | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Pages",
			subtitle: "Every page on the site. Build each one from sections, and override its SEO.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/pages/create",
				children: "New page"
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: pages.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No pages yet, create the first one." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[780px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Page"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "URL"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Sections"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Visibility"
							}),
							/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: pages.map((page) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-[var(--line)]",
						children: [
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 pr-4",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-semibold text-[var(--ink-strong)]",
									children: page.title
								}), page.is_system && /* @__PURE__ */ jsx("span", {
									className: "ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
									children: "System"
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 font-mono text-[12px] text-[var(--ink-faint)]",
								children: page.url
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: page.sections_count
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx(Badge, { tone: page.status })
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => toggleVisibility(page),
									role: "switch",
									"aria-checked": page.status === "published",
									"aria-label": `${page.status === "published" ? "Hide" : "Show"} ${page.title}`,
									className: `relative h-6 w-11 shrink-0 rounded-full border transition-colors ${page.status === "published" ? "border-transparent" : "border-[var(--field-line)] bg-[var(--chip)]"}`,
									style: page.status === "published" ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0,
									children: /* @__PURE__ */ jsx("span", { className: `absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${page.status === "published" ? "left-[25px]" : "left-[3px]"}` })
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 text-right",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex justify-end gap-1",
									children: [
										/* @__PURE__ */ jsx(Link, {
											href: `/admin/pages/${page.id}/builder`,
											className: NEUTRAL_ICON,
											title: `Edit ${page.title}`,
											"aria-label": `Edit ${page.title}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "edit" })
										}),
										/* @__PURE__ */ jsx("a", {
											href: page.url,
											target: "_blank",
											rel: "noreferrer",
											className: NEUTRAL_ICON,
											title: `View ${page.title}`,
											"aria-label": `View ${page.title}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "view" })
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => duplicate(page),
											className: NEUTRAL_ICON,
											title: `Duplicate ${page.title}`,
											"aria-label": `Duplicate ${page.title}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "duplicate" })
										}),
										!page.is_system && /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => askDelete(page),
											className: `${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`,
											title: `Delete ${page.title}`,
											"aria-label": `Delete ${page.title}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "delete" })
										})
									]
								})
							})
						]
					}, page.id)) })]
				})
			})
		}),
		/* @__PURE__ */ jsx(ConfirmDialog, {
			open: !!request,
			title: request?.title ?? "",
			body: request?.body,
			onConfirm: run,
			onCancel: cancel
		})
	] });
}
PagesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { PagesIndex as default };
