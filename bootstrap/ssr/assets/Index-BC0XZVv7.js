import { t as AdminLayout } from "./AdminLayout-DeYqDoJZ.js";
import { a as EmptyState, c as PageHeader, g as useConfirm, i as ConfirmDialog, l as Panel, n as Button, t as Badge } from "./ui-Dv8OUCCw.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Pages/Index.jsx
function PagesIndex({ pages }) {
	const [request, confirm, cancel, run] = useConfirm();
	const askDelete = (page) => {
		confirm({
			title: `Delete “${page.title}”?`,
			body: `Its ${page.sections_count} section(s) go with it. The page is soft-deleted and can be restored from the database.`,
			action: () => router.delete(`/admin/pages/${page.id}`, { preserveScroll: true })
		});
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
								className: "py-3 text-right",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex justify-end gap-3",
									children: [
										/* @__PURE__ */ jsx(Button, {
											as: "link",
											variant: "ghost",
											href: `/admin/pages/${page.id}/builder`,
											children: "Sections"
										}),
										/* @__PURE__ */ jsx(Button, {
											as: "link",
											variant: "ghost",
											href: `/admin/pages/${page.id}/edit`,
											children: "SEO"
										}),
										!page.is_system && /* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											onClick: () => askDelete(page),
											children: "Delete"
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
