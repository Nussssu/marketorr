import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { _ as useConfirm, a as EmptyState, c as PageHeader, i as ConfirmDialog, l as Panel, n as Button, t as Badge } from "./ui-DUoJPW2G.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Categories/Index.jsx
function Row({ category, depth = 0, onDelete }) {
	return /* @__PURE__ */ jsxs("tr", {
		className: "border-t border-[var(--line)]",
		children: [
			/* @__PURE__ */ jsx("td", {
				className: "py-3 pr-4",
				children: /* @__PURE__ */ jsxs("span", {
					style: { paddingLeft: depth * 18 },
					className: "flex items-center gap-2",
					children: [
						depth > 0 && /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "text-[var(--ink-faint)]",
							children: "└"
						}),
						category.accent && /* @__PURE__ */ jsx("span", {
							className: "h-2.5 w-2.5 shrink-0 rounded-full",
							style: { background: category.accent },
							"aria-hidden": true
						}),
						/* @__PURE__ */ jsx("span", {
							className: "font-semibold text-[var(--ink-strong)]",
							children: category.name
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("td", {
				className: "py-3 pr-4 font-mono text-[12px] text-[var(--ink-faint)]",
				children: category.slug
			}),
			/* @__PURE__ */ jsx("td", {
				className: "py-3 pr-4 text-[var(--mute)]",
				children: category.projects_count
			}),
			/* @__PURE__ */ jsx("td", {
				className: "py-3 pr-4",
				children: /* @__PURE__ */ jsx(Badge, { tone: category.status })
			}),
			/* @__PURE__ */ jsx("td", {
				className: "py-3 text-right",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex justify-end gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						as: "link",
						variant: "ghost",
						href: `/admin/categories/${category.id}/edit`,
						children: "Edit"
					}), /* @__PURE__ */ jsx(Button, {
						variant: "dangerGhost",
						onClick: () => onDelete(category),
						children: "Delete"
					})]
				})
			})
		]
	});
}
function CategoriesIndex({ categories }) {
	const [request, confirm, cancel, run] = useConfirm();
	const askDelete = (category) => {
		const children = category.children?.length ?? 0;
		confirm({
			title: `Delete “${category.name}”?`,
			body: [
				category.projects_count > 0 && `${category.projects_count} project(s) will be left without a category.`,
				children > 0 && `${children} sub-categorie(s) will be moved to the top level.`,
				"The category itself is soft-deleted and can be restored from the database."
			].filter(Boolean).join(" "),
			action: () => router.delete(`/admin/categories/${category.id}`, { preserveScroll: true })
		});
	};
	const total = categories.reduce((sum, c) => sum + 1 + (c.children?.length ?? 0), 0);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Categories | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Categories",
			subtitle: `${total} categories. Projects are filed under these.`,
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/categories/create",
				children: "New category"
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: categories.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No categories yet, create the first one." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[720px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Name"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Slug"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Projects"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: categories.flatMap((parent) => [/* @__PURE__ */ jsx(Row, {
						category: parent,
						onDelete: askDelete
					}, parent.id), ...(parent.children ?? []).map((child) => /* @__PURE__ */ jsx(Row, {
						category: child,
						depth: 1,
						onDelete: askDelete
					}, child.id))]) })]
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
CategoriesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { CategoriesIndex as default };
