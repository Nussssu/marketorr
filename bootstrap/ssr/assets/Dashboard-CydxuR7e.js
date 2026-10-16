import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { a as EmptyState, c as PageHeader, l as Panel, t as Badge } from "./ui-DUoJPW2G.js";
import { Head, Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Dashboard.jsx
function Stat({ label, value, accent }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "font-display text-3xl font-extrabold text-[var(--ink-strong)]",
				children: value
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
				children: label
			}),
			/* @__PURE__ */ jsx("span", {
				className: "mt-3 block h-[2px] w-10",
				style: { background: accent },
				"aria-hidden": true
			})
		]
	});
}
function Dashboard({ stats, recentInquiries }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Dashboard | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Dashboard",
			subtitle: "What's live and what needs a reply."
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(Stat, {
					label: "Published projects",
					value: stats.publishedProjects,
					accent: "var(--brand-1)"
				}),
				/* @__PURE__ */ jsx(Stat, {
					label: "Draft projects",
					value: stats.draftProjects,
					accent: "var(--brand-2)"
				}),
				/* @__PURE__ */ jsx(Stat, {
					label: "Services",
					value: stats.services,
					accent: "var(--brand-3)"
				}),
				/* @__PURE__ */ jsx(Stat, {
					label: "Pages",
					value: stats.pages,
					accent: "var(--brand-2)"
				}),
				/* @__PURE__ */ jsx(Stat, {
					label: "Categories",
					value: stats.categories,
					accent: "var(--brand-3)"
				}),
				/* @__PURE__ */ jsx(Stat, {
					label: "New leads",
					value: stats.newInquiries,
					accent: "var(--brand-1)"
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-8",
			children: /* @__PURE__ */ jsx(Panel, {
				title: "Latest inquiries",
				className: "overflow-hidden",
				children: recentInquiries.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No inquiries yet." }) : /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full min-w-[560px] text-left text-[13px]",
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
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "pb-3 pr-4 font-bold",
									children: "Received"
								}),
								/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
							]
						}) }), /* @__PURE__ */ jsx("tbody", {
							className: "align-top",
							children: recentInquiries.map((inquiry) => /* @__PURE__ */ jsxs("tr", {
								className: "border-t border-[var(--line)]",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 pr-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold text-[var(--ink)]",
											children: inquiry.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[12px] text-[var(--ink-faint)]",
											children: inquiry.email
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 pr-4 text-[var(--mute)]",
										children: inquiry.type
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 pr-4",
										children: /* @__PURE__ */ jsx(Badge, { tone: inquiry.status })
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 pr-4 text-[var(--mute)]",
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
							}, inquiry.id))
						})]
					})
				})
			})
		})
	] });
}
Dashboard.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { Dashboard as default };
