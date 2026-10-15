import { t as AdminLayout } from "./AdminLayout-Cz9lUOUz.js";
import { a as EmptyState, c as PageHeader, g as useConfirm, i as ConfirmDialog, l as Panel, n as Button, t as Badge } from "./ui-0XaBzweS.js";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/ServiceGroups/Index.jsx
function ServiceGroupsIndex({ groups }) {
	const [rows, setRows] = useState(groups);
	const [request, confirm, cancel, run] = useConfirm();
	useEffect(() => {
		setRows(groups);
	}, [groups]);
	const move = (index, direction) => {
		const target = index + direction;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		setRows(next);
		router.patch("/admin/service-groups/reorder", { ids: next.map((r) => r.id) }, { preserveScroll: true });
	};
	const askDelete = (group) => {
		confirm({
			title: `Delete “${group.name}”?`,
			body: group.sub_services_count > 0 ? `This also removes the ${group.sub_services_count} sub-service(s) filed under it from the public site.` : "The tab is removed from the public Services page.",
			action: () => router.delete(`/admin/service-groups/${group.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Service Tabs | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Service Tabs",
			subtitle: `${rows.length} tabs. These are the tabs on the public Services page, in order.`,
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/service-groups/create",
				children: "New tab"
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: rows.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No service tabs yet, create the first one." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[720px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-3 font-bold",
								children: "Order"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Tab"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Tagline"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Accent"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Sub-services"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((group, index) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-[var(--line)]",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => move(index, -1),
										disabled: index === 0,
										"aria-label": `Move ${group.name} up`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↑"
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => move(index, 1),
										disabled: index === rows.length - 1,
										"aria-label": `Move ${group.name} down`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↓"
									})]
								})
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 pr-4",
								children: [/* @__PURE__ */ jsx("p", {
									className: "font-semibold text-[var(--ink)]",
									children: group.name
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-[12px] text-[var(--ink-faint)]",
									children: ["/", group.slug]
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: group.tagline || "—"
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "h-4 w-8 rounded",
										style: { background: group.accent },
										"aria-hidden": true
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[12px] text-[var(--ink-faint)]",
										children: group.accent
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 font-display font-bold text-[var(--ink)]",
								children: group.sub_services_count
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx(Badge, { tone: group.status })
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 text-right whitespace-nowrap",
								children: [/* @__PURE__ */ jsx(Link, {
									href: `/admin/service-groups/${group.id}/edit`,
									className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
									children: "Edit"
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => askDelete(group),
									className: "ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80",
									children: "Delete"
								})]
							})
						]
					}, group.id)) })]
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
ServiceGroupsIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ServiceGroupsIndex as default };
