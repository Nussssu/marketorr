import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { c as PageHeader, l as Panel } from "./ui-DUoJPW2G.js";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/AuditLogs/Index.jsx
var CATEGORIES = [
	{
		key: "all",
		label: "All Activity"
	},
	{
		key: "leads",
		label: "Leads & Inquiries"
	},
	{
		key: "system",
		label: "System & Mail"
	},
	{
		key: "users",
		label: "Users"
	},
	{
		key: "content",
		label: "Content"
	}
];
function AuditLogsIndex({ logs = [], filters = {}, stats = {} }) {
	const [search, setSearch] = useState(filters.search ?? "");
	const currentCategory = filters.category ?? "all";
	const handleCategoryChange = (key) => {
		router.get("/admin/audit-logs", {
			category: key,
			search: search || void 0
		}, {
			preserveState: true,
			preserveScroll: true
		});
	};
	const handleSearchSubmit = (e) => {
		e.preventDefault();
		router.get("/admin/audit-logs", {
			category: currentCategory,
			search: search || void 0
		}, {
			preserveState: true,
			preserveScroll: true
		});
	};
	const getLevelBadge = (level, status) => {
		switch (level) {
			case "success": return /* @__PURE__ */ jsx("span", {
				className: "inline-flex items-center rounded-md border border-[var(--brand-3)]/40 bg-[var(--brand-3)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-3)]",
				children: status || "Success"
			});
			case "warning": return /* @__PURE__ */ jsx("span", {
				className: "inline-flex items-center rounded-md border border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6F91FF]",
				children: status || "Warning"
			});
			case "error": return /* @__PURE__ */ jsx("span", {
				className: "inline-flex items-center rounded-md border border-[var(--brand-1)]/40 bg-[var(--brand-1)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#A855F7]",
				children: status || "Error"
			});
			default: return /* @__PURE__ */ jsx("span", {
				className: "inline-flex items-center rounded-md border border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6F91FF]",
				children: status || "Info"
			});
		}
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Audit Logs | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Audit logs",
			subtitle: "Chronological audit trail of customer inquiries, SMTP dispatches, system logs and administrative actions."
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]",
						children: "Total Events"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 font-display text-2xl font-black text-[var(--ink-strong)]",
						children: stats.total ?? logs.length
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]",
						children: "Lead Activity"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 font-display text-2xl font-black text-[var(--brand-3)]",
						children: stats.leads ?? 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]",
						children: "System & Mail"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 font-display text-2xl font-black text-[#A855F7]",
						children: stats.system ?? 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]",
						children: "User Changes"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 font-display text-2xl font-black text-[#6F91FF]",
						children: stats.users ?? 0
					})]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1",
				children: CATEGORIES.map((cat) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => handleCategoryChange(cat.key),
					className: `rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${currentCategory === cat.key ? "bg-[var(--chip)] text-[var(--ink-strong)] shadow-sm" : "text-[var(--mute)] hover:text-[var(--ink)]"}`,
					children: cat.label
				}, cat.key))
			}), /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSearchSubmit,
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx("input", {
						type: "text",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Filter audit logs...",
						className: "w-64 rounded-lg border border-[var(--field-line)] bg-[var(--surface)] px-3 py-1.5 text-[12px] text-[var(--ink)] placeholder-[var(--mute)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-3)] focus:border-[var(--brand-3)] transition-colors"
					}), search && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							setSearch("");
							router.get("/admin/audit-logs", { category: currentCategory }, { preserveState: true });
						},
						className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--mute)] hover:text-[var(--ink)]",
						children: "✕"
					})]
				}), /* @__PURE__ */ jsx("button", {
					type: "submit",
					className: "rounded-lg border border-[var(--line)] bg-[var(--chip)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] hover:bg-[var(--line)]",
					children: "Search"
				})]
			})]
		}),
		/* @__PURE__ */ jsx(Panel, {
			title: "Event Stream",
			description: "Live audit events recorded by application controllers and dispatchers.",
			children: logs.length === 0 ? /* @__PURE__ */ jsx("div", {
				className: "py-12 text-center",
				children: /* @__PURE__ */ jsx("p", {
					className: "text-[13px] font-medium text-[var(--mute)]",
					children: "No audit log records found for this criteria."
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "divide-y divide-[var(--line)]",
				children: logs.map((item) => /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "mt-0.5 shrink-0",
							children: getLevelBadge(item.level, item.status)
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] font-mono uppercase tracking-wider text-[var(--mute)]",
								children: [
									"[",
									item.type,
									"]"
								]
							}), /* @__PURE__ */ jsx("h3", {
								className: "text-[13px] font-semibold text-[var(--ink-strong)]",
								children: item.title
							})]
						}), item.description && /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 text-[12px] text-[var(--mute)]",
							children: item.description
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex shrink-0 items-center gap-4 text-left sm:text-right",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-[11px] font-medium text-[var(--ink-strong)]",
							children: item.actor
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-[10px] font-mono text-[var(--mute)]",
							children: ["IP: ", item.ip]
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "min-w-[90px]",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block text-[11px] font-semibold text-[var(--ink)]",
								children: item.time_for_humans
							}), /* @__PURE__ */ jsx("span", {
								className: "block text-[10px] font-mono text-[var(--mute)]",
								children: item.timestamp ? item.timestamp.split("T")[0] : ""
							})]
						})]
					})]
				}, item.id))
			})
		})
	] });
}
AuditLogsIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { AuditLogsIndex as default };
