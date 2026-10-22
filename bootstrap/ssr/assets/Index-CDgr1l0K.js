import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { a as EmptyState, c as PageHeader, f as Select, l as Panel, s as Input } from "./ui-BFNViBV5.js";
import { t as MailNav } from "./MailNav-DF9cU9GJ.js";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/EmailLogs/Index.jsx
var STATUS_TONES = {
	sent: "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#16a34a]",
	failed: "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]",
	skipped: "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#d97706]",
	activity: "border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 text-[var(--brand-2)]"
};
function StatusBadge({ status, label }) {
	return /* @__PURE__ */ jsx("span", {
		className: `inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${STATUS_TONES[status] ?? ""}`,
		children: label
	});
}
/** The setting and template field names an activity entry lists. */
var FIELD_LABELS = {
	enabled: "SMTP on/off",
	host: "Host",
	port: "Port",
	encryption: "Encryption",
	username: "Username",
	password: "Password",
	from_address: "From address",
	from_name: "From name",
	admin_notification_email: "Admin notification email",
	subject: "Subject",
	body: "Body",
	enabled_template: "On/off"
};
/**
* One log entry in full: who and what, the error when there is one, and the
* message exactly as it was sent, shown in a sandboxed frame.
*/
function LogModal({ id, onClose }) {
	const [log, setLog] = useState(null);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		if (!id) return void 0;
		const controller = new AbortController();
		setLog(null);
		setFailed(false);
		fetch(`/admin/email-logs/${id}`, {
			headers: { Accept: "application/json" },
			signal: controller.signal
		}).then((response) => response.ok ? response.json() : Promise.reject(response)).then(setLog).catch((error) => {
			if (error?.name !== "AbortError") setFailed(true);
		});
		const onKey = (event) => event.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => {
			controller.abort();
			window.removeEventListener("keydown", onKey);
		};
	}, [id]);
	if (!id) return null;
	const rows = log ? [
		["Type", log.sourceLabel],
		["To", log.recipients],
		["From", log.from],
		["Subject", log.subject],
		["Mailer", log.mailer],
		["By", log.user ?? (log.status === "activity" ? null : "System (website)")],
		["Time", log.createdAt]
	].filter(([, value]) => value) : [];
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Email log entry",
			className: "w-full max-w-3xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl",
			onClick: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [log && /* @__PURE__ */ jsx(StatusBadge, {
						status: log.status,
						label: log.statusLabel
					}), /* @__PURE__ */ jsx("h2", {
						className: "font-display text-[14px] font-bold text-[var(--ink-strong)]",
						children: log?.subject ?? "Email log"
					})]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					className: "rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]",
					"aria-label": "Close",
					children: "✕"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-5 p-5",
				children: [
					failed && /* @__PURE__ */ jsx("p", {
						className: "text-[13px] text-[#ff6b6b]",
						children: "This entry could not be loaded."
					}),
					!log && !failed && /* @__PURE__ */ jsx("p", {
						className: "text-[13px] text-[var(--mute)]",
						children: "Loading…"
					}),
					log && /* @__PURE__ */ jsxs(Fragment$1, { children: [
						/* @__PURE__ */ jsxs("dl", {
							className: "grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-[8rem_1fr]",
							children: [rows.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
								className: "contents",
								children: [/* @__PURE__ */ jsx("dt", {
									className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:pt-0.5",
									children: label
								}), /* @__PURE__ */ jsx("dd", {
									className: "break-words text-[var(--ink)]",
									children: value
								})]
							}, label)), log.inquiryId && /* @__PURE__ */ jsxs("div", {
								className: "contents",
								children: [/* @__PURE__ */ jsx("dt", {
									className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:pt-0.5",
									children: "Lead"
								}), /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsxs(Link, {
									href: `/admin/inquiries/${log.inquiryId}`,
									className: "text-[var(--brand-2)] hover:underline",
									children: [
										"Open lead #",
										log.inquiryId,
										" →"
									]
								}) })]
							})]
						}),
						log.error && /* @__PURE__ */ jsxs("div", {
							className: `rounded-lg border px-4 py-3 text-[13px] ${log.status === "failed" ? "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]" : "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#d97706]"}`,
							children: [/* @__PURE__ */ jsx("p", {
								className: "mb-1 text-[11px] font-bold uppercase tracking-[0.14em]",
								children: log.status === "failed" ? "Error" : "Reason"
							}), /* @__PURE__ */ jsx("p", {
								className: "break-words",
								children: log.error
							})]
						}),
						log.meta?.changed?.length > 0 && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: "Changed"
						}), /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2",
							children: log.meta.changed.map((field) => /* @__PURE__ */ jsx("span", {
								className: "rounded-full border border-[var(--line)] bg-[var(--chip)] px-3 py-1 text-[12px] text-[var(--ink)]",
								children: FIELD_LABELS[field] ?? field
							}, field))
						})] }),
						log.body && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: "Message"
						}), /* @__PURE__ */ jsx("iframe", {
							title: "Email message",
							sandbox: "",
							srcDoc: /<[a-z][\s\S]*>/i.test(log.body) ? log.body : `<pre style="white-space:pre-wrap;font:14px/1.6 system-ui,sans-serif;margin:16px">${log.body.replace(/[&<>]/g, (c) => ({
								"&": "&amp;",
								"<": "&lt;",
								">": "&gt;"
							})[c])}</pre>`,
							className: "h-[28rem] w-full rounded-lg border border-[var(--line)] bg-white"
						})] })
					] })
				]
			})]
		})
	});
}
function EmailLogsIndex({ logs, filters, counts, statuses, sources }) {
	const [search, setSearch] = useState(filters.search ?? "");
	const [openId, setOpenId] = useState(null);
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
	const apply = (next) => {
		router.get("/admin/email-logs", Object.fromEntries(Object.entries({
			...filters,
			...next
		}).filter(([, value]) => value)), {
			preserveState: true,
			preserveScroll: true,
			replace: true
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Email logs | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Email & SMTP",
			subtitle: "Every email the site sends, fails or skips, and every change to the email setup."
		}),
		/* @__PURE__ */ jsx(MailNav, { activeTab: "logs" }),
		/* @__PURE__ */ jsx("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [{
				value: "",
				label: "All",
				count: total
			}, ...statuses.map((status) => ({
				...status,
				count: counts[status.value] ?? 0
			}))].map((option) => {
				const active = (filters.status ?? "") === option.value;
				return /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => apply({ status: option.value }),
					className: `inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${active ? "border-transparent text-white" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"}`,
					style: active ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0,
					children: [option.label, /* @__PURE__ */ jsx("span", {
						className: `rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-[var(--chip)]"}`,
						children: option.count
					})]
				}, option.value || "all");
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "mb-4",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: (event) => {
					event.preventDefault();
					apply({ search });
				},
				className: "grid gap-3 sm:grid-cols-[1fr_14rem]",
				children: [/* @__PURE__ */ jsx(Input, {
					value: search,
					onChange: (event) => setSearch(event.target.value),
					placeholder: "Search recipient or subject, then press Enter",
					"aria-label": "Search email logs"
				}), /* @__PURE__ */ jsxs(Select, {
					value: filters.source ?? "",
					onChange: (event) => apply({ source: event.target.value }),
					"aria-label": "Filter by type",
					children: [/* @__PURE__ */ jsx("option", {
						value: "",
						children: "All types"
					}), sources.map((source) => /* @__PURE__ */ jsx("option", {
						value: source.value,
						children: source.label
					}, source.value))]
				})]
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: logs.data.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: total === 0 ? "No email activity yet. Sends, failures and SMTP changes will appear here." : "Nothing matches these filters." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[820px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Time"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Type"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "To"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Subject / action"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "By"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 font-bold",
								children: "Action"
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", {
						className: "align-top",
						children: logs.data.map((log) => /* @__PURE__ */ jsxs("tr", {
							onClick: () => setOpenId(log.id),
							className: "cursor-pointer border-t border-[var(--line)] transition-colors hover:bg-[var(--chip)]/50",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap py-3 pr-4 text-[var(--mute)]",
									title: log.createdAt,
									children: log.createdAgo
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4",
									children: /* @__PURE__ */ jsx(StatusBadge, {
										status: log.status,
										label: log.statusLabel
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap py-3 pr-4 text-[var(--mute)]",
									children: log.sourceLabel
								}),
								/* @__PURE__ */ jsx("td", {
									className: "max-w-[14rem] truncate py-3 pr-4 text-[var(--ink)]",
									title: log.recipients ?? "",
									children: log.recipients ?? "-"
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "max-w-[18rem] py-3 pr-4",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate text-[var(--ink-strong)]",
										title: log.subject ?? "",
										children: log.subject ?? "-"
									}), log.error && /* @__PURE__ */ jsx("p", {
										className: `truncate text-[12px] ${log.status === "failed" ? "text-[#ff6b6b]" : "text-[#d97706]"}`,
										title: log.error,
										children: log.error
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap py-3 pr-4 text-[var(--mute)]",
									children: log.user ?? (log.status === "activity" ? "-" : "Website")
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3",
									children: /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: (event) => {
											event.stopPropagation();
											setOpenId(log.id);
										},
										className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
										children: "View"
									})
								})
							]
						}, log.id))
					})]
				})
			})
		}),
		logs.links?.length > 3 && /* @__PURE__ */ jsx("nav", {
			className: "mt-6 flex flex-wrap gap-2",
			"aria-label": "Pagination",
			children: logs.links.map((link, i) => /* @__PURE__ */ jsx(Link, {
				href: link.url ?? "#",
				disabled: !link.url,
				preserveScroll: true,
				className: `rounded-lg border px-3 py-2 text-[12px] font-bold ${link.active ? "border-transparent bg-[var(--chip)] text-[var(--ink-strong)]" : "border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]"} ${link.url ? "" : "pointer-events-none opacity-40"}`,
				dangerouslySetInnerHTML: { __html: link.label }
			}, i))
		}),
		/* @__PURE__ */ jsx(LogModal, {
			id: openId,
			onClose: () => setOpenId(null)
		})
	] });
}
EmailLogsIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { EmailLogsIndex as default };
