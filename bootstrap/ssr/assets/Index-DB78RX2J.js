import { t as AdminLayout } from "./AdminLayout-Cz9lUOUz.js";
import { a as EmptyState, c as PageHeader, g as useConfirm, i as ConfirmDialog, l as Panel, n as Button, t as Badge } from "./ui-0XaBzweS.js";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/SubServices/Index.jsx
function SubServicesIndex({ groups, items }) {
	const [rows, setRows] = useState(items);
	const [activeGroup, setActiveGroup] = useState(() => groups[0]?.id ?? null);
	const [request, confirm, cancel, run] = useConfirm();
	useEffect(() => {
		setRows(items);
	}, [items]);
	const inActiveGroup = (item) => String(item.service_group_id) === String(activeGroup);
	const visible = rows.filter(inActiveGroup);
	const move = (visibleIndex, direction) => {
		const target = visibleIndex + direction;
		if (target < 0 || target >= visible.length) return;
		const reordered = [...visible];
		[reordered[visibleIndex], reordered[target]] = [reordered[target], reordered[visibleIndex]];
		let cursor = 0;
		const next = rows.map((row) => inActiveGroup(row) ? reordered[cursor++] : row);
		setRows(next);
		router.patch("/admin/sub-services/reorder", { ids: next.map((r) => r.id) }, { preserveScroll: true });
	};
	const askDelete = (item) => {
		confirm({
			title: `Delete “${item.name}”?`,
			body: "The sub-service page is removed from the public site. Related work keeps showing from the rest of the portfolio.",
			action: () => router.delete(`/admin/sub-services/${item.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Sub-services | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Sub-services",
			subtitle: `${rows.length} sub-services. Order here is the order inside each tab on the public site.`,
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/sub-services/create",
				children: "New sub-service"
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mb-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1",
			children: groups.map((group) => {
				const selected = String(activeGroup) === String(group.id);
				return /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setActiveGroup(group.id),
					className: `rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${selected ? "text-white shadow-sm" : "text-[var(--mute)] hover:text-[var(--ink)]"}`,
					style: selected ? { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" } : void 0,
					children: group.name
				}, group.id);
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: visible.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No sub-services here yet." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[760px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-3 font-bold",
								children: "Order"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Sub-service"
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
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: visible.map((item, index) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-[var(--line)]",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => move(index, -1),
										disabled: index === 0,
										title: `Move ${item.name} up`,
										"aria-label": `Move ${item.name} up`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↑"
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => move(index, 1),
										disabled: index === visible.length - 1,
										title: `Move ${item.name} down`,
										"aria-label": `Move ${item.name} down`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↓"
									})]
								})
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 pr-4",
								children: [/* @__PURE__ */ jsx("p", {
									className: "font-semibold text-[var(--ink)]",
									children: item.name
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-[12px] text-[var(--ink-faint)]",
									children: [
										"/",
										item.group_slug,
										"/",
										item.slug
									]
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: item.group_name
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: item.short || "—"
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "h-4 w-8 rounded",
										style: { background: item.accent },
										"aria-hidden": true
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[12px] text-[var(--ink-faint)]",
										children: item.accent
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx(Badge, { tone: item.status })
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 text-right whitespace-nowrap",
								children: [/* @__PURE__ */ jsx(Link, {
									href: `/admin/sub-services/${item.id}/edit`,
									className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
									children: "Edit"
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => askDelete(item),
									className: "ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80",
									children: "Delete"
								})]
							})
						]
					}, item.id)) })]
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
SubServicesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { SubServicesIndex as default };
