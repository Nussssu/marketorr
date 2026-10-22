import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { a as EmptyState, b as tabClass, c as PageHeader, h as TAB_GRADIENT, i as ConfirmDialog, l as Panel, m as TAB_BAR_CLASS, n as Button, x as useConfirm } from "./ui-BFNViBV5.js";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/SubServices/Index.jsx
var ICON_PATHS = {
	edit: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" }), /* @__PURE__ */ jsx("path", { d: "m13.5 6.5 4 4" })] }),
	view: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" }), /* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "12",
		r: "2.75"
	})] }),
	copy: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
		x: "8.5",
		y: "8.5",
		width: "11",
		height: "11",
		rx: "2"
	}), /* @__PURE__ */ jsx("path", { d: "M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" })] }),
	delete: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" }), /* @__PURE__ */ jsx("path", { d: "M10 11.5v5M14 11.5v5" })] })
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
	const setStatus = (item, status) => {
		setRows((current) => current.map((row) => row.id === item.id ? {
			...row,
			status
		} : row));
		router.patch(`/admin/sub-services/${item.id}/status`, { status }, { preserveScroll: true });
	};
	const duplicate = (item) => router.post(`/admin/sub-services/${item.id}/duplicate`, {}, { preserveScroll: true });
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
			className: `mb-6 ${TAB_BAR_CLASS}`,
			children: groups.map((group) => {
				const selected = String(activeGroup) === String(group.id);
				return /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setActiveGroup(group.id),
					className: `text-[11px] font-bold uppercase tracking-[0.14em] ${tabClass(selected)}`,
					style: selected ? TAB_GRADIENT : void 0,
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
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 font-bold",
								children: "Action"
							})
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
								}), /* @__PURE__ */ jsxs("a", {
									href: `/services/${item.group_slug}/${item.slug}`,
									target: "_blank",
									rel: "noreferrer",
									className: "block truncate font-mono text-[12px] text-[var(--ink-faint)] hover:text-[var(--ink)] hover:underline",
									title: "Open on the site",
									children: [
										"/services/",
										item.group_slug,
										"/",
										item.slug,
										" ↗"
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
								children: /* @__PURE__ */ jsx("span", {
									className: "inline-flex items-center gap-2",
									children: /* @__PURE__ */ jsx("button", {
										type: "button",
										role: "switch",
										"aria-checked": item.status === "published",
										"aria-label": `${item.status === "published" ? "Unpublish" : "Publish"} ${item.name}`,
										title: item.status === "published" ? "Published, click to set as draft" : "Draft, click to publish",
										onClick: () => setStatus(item, item.status === "published" ? "draft" : "published"),
										className: "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
										style: { background: item.status === "published" ? "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" : "var(--field-line)" },
										children: /* @__PURE__ */ jsx("span", {
											className: `inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${item.status === "published" ? "translate-x-[18px]" : "translate-x-0.5"}`,
											"aria-hidden": true
										})
									})
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 whitespace-nowrap",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex gap-1",
									children: [
										/* @__PURE__ */ jsx(Link, {
											href: `/admin/sub-services/${item.id}/edit`,
											className: NEUTRAL_ICON,
											title: `Edit ${item.name}`,
											"aria-label": `Edit ${item.name}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "edit" })
										}),
										/* @__PURE__ */ jsx("a", {
											href: `/services/${item.group_slug}/${item.slug}`,
											target: "_blank",
											rel: "noreferrer",
											className: NEUTRAL_ICON,
											title: `View ${item.name}`,
											"aria-label": `View ${item.name}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "view" })
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => duplicate(item),
											className: NEUTRAL_ICON,
											title: `Copy ${item.name}`,
											"aria-label": `Copy ${item.name}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "copy" })
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => askDelete(item),
											className: `${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`,
											title: `Delete ${item.name}`,
											"aria-label": `Delete ${item.name}`,
											children: /* @__PURE__ */ jsx(ActionIcon, { name: "delete" })
										})
									]
								})
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
