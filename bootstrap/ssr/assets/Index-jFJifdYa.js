import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { c as PageHeader, i as ConfirmDialog, l as Panel, x as useConfirm } from "./ui-Dz4ZqU85.js";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
/** Module group names, as the category tabs show them. */
var CATEGORY_LABELS = {
	leads: "Leads",
	system: "System",
	mail: "Mail",
	users: "Users",
	content: "Content"
};
/** Up to two initials for the user column's avatar. */
function initials(name) {
	return String(name || "?").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}
function descriptionPreview(description, maxLength = 48) {
	const text = String(description || "No additional details.");
	return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}
/** Up to five consecutive page numbers, centred on the current page. */
function paginationWindow(currentPage, lastPage) {
	const visiblePages = Math.min(5, lastPage);
	const firstPage = Math.min(Math.max(currentPage - Math.floor(visiblePages / 2), 1), lastPage - visiblePages + 1);
	return Array.from({ length: visiblePages }, (_, index) => firstPage + index);
}
function pageUrl(page, filters) {
	return `/admin/audit-logs?${new URLSearchParams({
		category: filters.category ?? "all",
		...filters.search ? { search: filters.search } : {},
		page: String(page)
	}).toString()}`;
}
function AuditLogModal({ item, onClose }) {
	useEffect(() => {
		if (!item) return void 0;
		const closeOnEscape = (event) => event.key === "Escape" && onClose();
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [item, onClose]);
	if (!item) return null;
	const details = [
		["User", item.actor],
		["Action", item.status],
		["Type", item.type],
		["Module", CATEGORY_LABELS[item.category] ?? item.category],
		["IP address", item.ip],
		["Time", item.timestamp]
	];
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Audit log details",
			className: "w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl",
			onClick: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ jsxs("header", {
				className: "flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
					children: "Audit event"
				}), /* @__PURE__ */ jsx("h2", {
					className: "mt-1 font-display text-[16px] font-bold text-[var(--ink-strong)]",
					children: item.title
				})] }), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					className: "rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]",
					"aria-label": "Close",
					children: "×"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-5 p-5",
				children: [/* @__PURE__ */ jsx("dl", {
					className: "grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-[8rem_1fr]",
					children: details.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
						className: "contents",
						children: [/* @__PURE__ */ jsx("dt", {
							className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: label
						}), /* @__PURE__ */ jsx("dd", {
							className: "break-words text-[var(--ink)]",
							children: value || "-"
						})]
					}, label))
				}), item.description && /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: "Description"
					}), /* @__PURE__ */ jsx("p", {
						className: "break-words text-[13px] leading-6 text-[var(--ink)]",
						children: item.description
					})]
				})]
			})]
		})
	});
}
function AuditLogsIndex({ logs = {
	data: [],
	links: []
}, filters = {}, stats = {} }) {
	const [search, setSearch] = useState(filters.search ?? "");
	const [selectedLog, setSelectedLog] = useState(null);
	const currentCategory = filters.category ?? "all";
	const [request, confirm, cancel, run] = useConfirm();
	const askClear = () => {
		const label = CATEGORIES.find((cat) => cat.key === currentCategory)?.label ?? "All Activity";
		confirm({
			title: currentCategory === "all" ? "Clear the whole audit log?" : `Clear “${label}”?`,
			body: "Every entry shown here is removed from the audit log and cannot be brought back. Inquiries, media files and settings themselves are not touched; new activity keeps being logged.",
			confirmLabel: "Clear",
			action: () => router.delete("/admin/audit-logs", {
				data: { category: currentCategory },
				preserveScroll: true
			})
		});
	};
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
				title: status || "Success",
				className: "inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-3)]/40 bg-[var(--brand-3)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-3)]",
				children: status || "Success"
			});
			case "warning": return /* @__PURE__ */ jsx("span", {
				title: status || "Warning",
				className: "inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6F91FF]",
				children: status || "Warning"
			});
			case "error": return /* @__PURE__ */ jsx("span", {
				title: status || "Error",
				className: "inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-1)]/40 bg-[var(--brand-1)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#A855F7]",
				children: status || "Error"
			});
			default: return /* @__PURE__ */ jsx("span", {
				title: status || "Info",
				className: "inline-flex max-w-full items-center truncate rounded-md border border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6F91FF]",
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
						children: stats.total ?? logs.total ?? 0
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
				children: [
					/* @__PURE__ */ jsxs("div", {
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
					}),
					/* @__PURE__ */ jsx("button", {
						type: "submit",
						className: "rounded-lg border border-[var(--line)] bg-[var(--chip)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] hover:bg-[var(--line)]",
						children: "Search"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: askClear,
						title: currentCategory === "all" ? "Clear the whole audit log" : "Clear this tab",
						className: "rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff6b6b] hover:bg-[#ff6b6b]/20",
						children: "Clear"
					})
				]
			})]
		}),
		/* @__PURE__ */ jsx(Panel, {
			title: "Event Stream",
			description: "Live audit events recorded by application controllers and dispatchers.",
			children: logs.data.length === 0 ? /* @__PURE__ */ jsx("div", {
				className: "py-12 text-center",
				children: /* @__PURE__ */ jsx("p", {
					className: "text-[13px] font-medium text-[var(--mute)]",
					children: "No audit log records found for this criteria."
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "-mx-5 overflow-hidden px-5",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full table-fixed text-left text-[13px]",
					children: [
						/* @__PURE__ */ jsxs("colgroup", { children: [
							/* @__PURE__ */ jsx("col", { className: "w-[16%]" }),
							/* @__PURE__ */ jsx("col", { className: "w-[17%]" }),
							/* @__PURE__ */ jsx("col", { className: "w-[16%]" }),
							/* @__PURE__ */ jsx("col", { className: "w-[24%]" }),
							/* @__PURE__ */ jsx("col", { className: "w-[11%]" }),
							/* @__PURE__ */ jsx("col", { className: "w-[10%]" }),
							/* @__PURE__ */ jsx("col", { className: "w-[6%]" })
						] }),
						/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: [
								/* @__PURE__ */ jsx("th", {
									className: "px-3 pb-3 font-bold",
									children: "User"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "px-3 pb-3 font-bold",
									children: "Action"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "px-3 pb-3 font-bold",
									children: "Module"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "px-3 pb-3 font-bold",
									children: "Description"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "px-3 pb-3 font-bold",
									children: "IP"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "px-3 pb-3 font-bold",
									children: "When"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "px-3 pb-3 text-right font-bold",
									children: /* @__PURE__ */ jsx("span", {
										className: "sr-only",
										children: "Action"
									})
								})
							]
						}) }),
						/* @__PURE__ */ jsx("tbody", { children: logs.data.map((item) => /* @__PURE__ */ jsxs("tr", {
							className: "border-t border-[var(--line)] align-top transition-colors hover:bg-[var(--chip)]/40",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "px-3 py-3.5",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex min-w-0 items-center gap-2.5",
										children: [/* @__PURE__ */ jsx("span", {
											className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white",
											style: { background: "linear-gradient(135deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
											"aria-hidden": true,
											children: initials(item.actor)
										}), /* @__PURE__ */ jsx("span", {
											className: "min-w-0 truncate font-semibold text-[var(--ink-strong)]",
											title: item.actor,
											children: item.actor || "—"
										})]
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-3 py-3.5",
									children: getLevelBadge(item.level, item.status)
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "px-3 py-3.5",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate font-semibold text-[var(--ink)]",
										title: item.type,
										children: item.type
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
										children: CATEGORY_LABELS[item.category] ?? item.category
									})]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "px-3 py-3.5",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate font-semibold text-[var(--ink-strong)]",
										title: item.title,
										children: item.title
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 truncate text-[12px] text-[var(--mute)]",
										title: item.description,
										children: descriptionPreview(item.description)
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "overflow-hidden whitespace-nowrap px-3 py-3.5 font-mono text-[12px] text-[var(--mute)]",
									children: /* @__PURE__ */ jsx("span", {
										className: "block truncate",
										title: item.ip,
										children: item.ip || "—"
									})
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "whitespace-nowrap px-3 py-3.5",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-semibold text-[var(--ink)]",
										children: item.time_for_humans
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 font-mono text-[11px] text-[var(--ink-faint)]",
										children: item.timestamp ? item.timestamp.split("T")[0] : ""
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-3 py-3.5 text-right",
									children: /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setSelectedLog(item),
										className: "inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]",
										"aria-label": `View ${item.title}`,
										title: "View details",
										children: /* @__PURE__ */ jsxs("svg", {
											viewBox: "0 0 24 24",
											className: "h-4 w-4",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "1.8",
											"aria-hidden": "true",
											children: [/* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												d: "M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12s-3.5 6.75-9.75 6.75S2.25 12 2.25 12Z"
											}), /* @__PURE__ */ jsx("circle", {
												cx: "12",
												cy: "12",
												r: "3"
											})]
										})
									})
								})
							]
						}, item.id)) })
					]
				})
			})
		}),
		logs.last_page > 1 && /* @__PURE__ */ jsxs("nav", {
			className: "mt-6 flex flex-wrap justify-end gap-2",
			"aria-label": "Pagination",
			children: [
				/* @__PURE__ */ jsx(Link, {
					href: logs.prev_page_url ?? "#",
					disabled: !logs.prev_page_url,
					preserveScroll: true,
					className: `rounded-lg border border-[var(--line)] px-3 py-2 text-[12px] font-bold text-[var(--ink-faint)] hover:text-[var(--ink)] ${logs.prev_page_url ? "" : "pointer-events-none opacity-40"}`,
					children: "Previous"
				}),
				paginationWindow(logs.current_page, logs.last_page).map((page) => /* @__PURE__ */ jsx(Link, {
					href: pageUrl(page, filters),
					preserveScroll: true,
					className: `rounded-lg border px-3 py-2 text-[12px] font-bold ${page === logs.current_page ? "border-transparent bg-[var(--chip)] text-[var(--ink-strong)]" : "border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]"}`,
					children: page
				}, page)),
				/* @__PURE__ */ jsx(Link, {
					href: logs.next_page_url ?? "#",
					disabled: !logs.next_page_url,
					preserveScroll: true,
					className: `rounded-lg border border-[var(--line)] px-3 py-2 text-[12px] font-bold text-[var(--ink-faint)] hover:text-[var(--ink)] ${logs.next_page_url ? "" : "pointer-events-none opacity-40"}`,
					children: "Next"
				})
			]
		}),
		/* @__PURE__ */ jsx(AuditLogModal, {
			item: selectedLog,
			onClose: () => setSelectedLog(null)
		}),
		/* @__PURE__ */ jsx(ConfirmDialog, {
			open: !!request,
			title: request?.title ?? "",
			body: request?.body,
			confirmLabel: request?.confirmLabel,
			onConfirm: run,
			onCancel: cancel
		})
	] });
}
AuditLogsIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { AuditLogsIndex as default };
