import { t as AdminLayout } from "./AdminLayout-DeYqDoJZ.js";
import { a as EmptyState, c as PageHeader, f as Select, l as Panel, n as Button, s as Input, t as Badge } from "./ui-Dv8OUCCw.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Inquiries/Index.jsx
function InquiriesIndex({ inquiries, filters, statuses, types }) {
	const [form, setForm] = useState(filters);
	const apply = (next) => {
		setForm(next);
		router.get("/admin/inquiries", next, {
			preserveState: true,
			replace: true,
			preserveScroll: true
		});
	};
	const onSearch = (e) => {
		e.preventDefault();
		apply(form);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Inquiries | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Leads",
			subtitle: `${inquiries.total} submission${inquiries.total === 1 ? "" : "s"} from the contact form.`,
			children: /* @__PURE__ */ jsx(Button, {
				as: "a",
				href: `/admin/inquiries/export?${new URLSearchParams(filters).toString()}`,
				variant: "secondary",
				children: "Export CSV"
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: onSearch,
				className: "grid gap-4 sm:grid-cols-[1fr_auto_auto_auto]",
				children: [
					/* @__PURE__ */ jsx(Input, {
						value: form.search,
						onChange: (e) => setForm({
							...form,
							search: e.target.value
						}),
						placeholder: "Search name, email or company…",
						"aria-label": "Search inquiries"
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: form.status,
						onChange: (e) => apply({
							...form,
							status: e.target.value
						}),
						"aria-label": "Filter by status",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All statuses"
						}), statuses.map((s) => /* @__PURE__ */ jsx("option", {
							value: s,
							children: s.replace("_", " ")
						}, s))]
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: form.type,
						onChange: (e) => apply({
							...form,
							type: e.target.value
						}),
						"aria-label": "Filter by type",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All types"
						}), types.map((t) => /* @__PURE__ */ jsx("option", {
							value: t,
							children: t
						}, t))]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						variant: "secondary",
						children: "Search"
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: inquiries.data.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No inquiries match these filters." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[860px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Name"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Type"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Budget"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Source"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Submitted"
							}),
							/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: inquiries.data.map((inquiry) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-[var(--line)]",
						children: [
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 pr-4",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "font-semibold text-[var(--ink)]",
										children: inquiry.name
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-[12px] text-[var(--ink-faint)]",
										children: inquiry.email
									}),
									inquiry.phone && /* @__PURE__ */ jsx("p", {
										className: "text-[12px] text-[var(--ink-faint)]",
										children: inquiry.phone
									}),
									inquiry.company && /* @__PURE__ */ jsx("p", {
										className: "text-[12px] text-[var(--ink-faint)]",
										children: inquiry.company
									})
								]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: inquiry.type
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: inquiry.budget ?? "-"
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 font-mono text-[12px] text-[var(--ink-faint)]",
								children: inquiry.sourcePage ?? "-"
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx(Badge, { tone: inquiry.status })
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 whitespace-nowrap text-[var(--mute)]",
								children: inquiry.createdAt
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 text-right",
								children: /* @__PURE__ */ jsx(Link, {
									href: `/admin/inquiries/${inquiry.id}`,
									className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
									children: "View →"
								})
							})
						]
					}, inquiry.id)) })]
				})
			})
		}),
		inquiries.links?.length > 3 && /* @__PURE__ */ jsx("nav", {
			className: "mt-6 flex flex-wrap gap-2",
			"aria-label": "Pagination",
			children: inquiries.links.map((link, i) => /* @__PURE__ */ jsx(Link, {
				href: link.url ?? "#",
				disabled: !link.url,
				className: `rounded-lg border px-3 py-2 text-[12px] font-bold ${link.active ? "border-transparent bg-[var(--chip)] text-[var(--ink-strong)]" : "border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]"} ${link.url ? "" : "pointer-events-none opacity-40"}`,
				dangerouslySetInnerHTML: { __html: link.label }
			}, i))
		})
	] });
}
InquiriesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { InquiriesIndex as default };
