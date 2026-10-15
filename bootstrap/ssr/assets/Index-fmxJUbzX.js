import { t as AdminLayout } from "./AdminLayout-DeYqDoJZ.js";
import { a as EmptyState, c as PageHeader, g as useConfirm, i as ConfirmDialog, l as Panel, n as Button, t as Badge } from "./ui-Dv8OUCCw.js";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Services/Index.jsx
function ServicesIndex({ services }) {
	const [rows, setRows] = useState(services);
	const [request, confirm, cancel, run] = useConfirm();
	useEffect(() => {
		setRows(services);
	}, [services]);
	const move = (index, direction) => {
		const target = index + direction;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		setRows(next);
		router.patch("/admin/services/reorder", { ids: next.map((r) => r.id) }, { preserveScroll: true });
	};
	const askDelete = (service) => {
		confirm({
			title: `Delete “${service.name}”?`,
			body: "The service is soft-deleted and can be restored from the database.",
			action: () => router.delete(`/admin/services/${service.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Services | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Services",
			subtitle: `${rows.length} services. Order here is the order on the public site.`,
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/services/create",
				children: "New service"
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: rows.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No services yet, create the first one." }) : /* @__PURE__ */ jsx("div", {
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
								children: "Index"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Service"
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
					}) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((service, index) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-[var(--line)]",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => move(index, -1),
										disabled: index === 0,
										"aria-label": `Move ${service.name} up`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↑"
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => move(index, 1),
										disabled: index === rows.length - 1,
										"aria-label": `Move ${service.name} down`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↓"
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 font-display font-bold text-[var(--ink-faint)]",
								children: service.index_label
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 pr-4",
								children: [/* @__PURE__ */ jsx("p", {
									className: "font-semibold text-[var(--ink)]",
									children: service.name
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-[12px] text-[var(--ink-faint)]",
									children: ["/", service.slug]
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: service.short
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "h-4 w-8 rounded",
										style: { background: service.accent_to ? `linear-gradient(90deg, ${service.accent}, ${service.accent_to})` : service.accent },
										"aria-hidden": true
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[12px] text-[var(--ink-faint)]",
										children: service.accent
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx(Badge, { tone: service.status })
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 text-right whitespace-nowrap",
								children: [/* @__PURE__ */ jsx(Link, {
									href: `/admin/services/${service.id}/edit`,
									className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
									children: "Edit"
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => askDelete(service),
									className: "ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80",
									children: "Delete"
								})]
							})
						]
					}, service.id)) })]
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
ServicesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ServicesIndex as default };
