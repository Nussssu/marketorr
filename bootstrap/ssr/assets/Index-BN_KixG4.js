import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { a as EmptyState, b as useConfirm, c as PageHeader, f as Select, i as ConfirmDialog, l as Panel, n as Button, s as Input } from "./ui-B5Z9349N.js";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/CustomCode/Index.jsx
var GRADIENT = "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))";
var TYPE_TONES = {
	css: "border-[#0ea5c6]/40 text-[#0ea5c6]",
	js: "border-[#e08a0b]/40 text-[#e08a0b]",
	html: "border-[#e0457b]/40 text-[#e0457b]"
};
var ICONS = {
	edit: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" }), /* @__PURE__ */ jsx("path", { d: "m13.5 6.5 4 4" })] }),
	copy: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
		x: "8",
		y: "8",
		width: "12",
		height: "12",
		rx: "2"
	}), /* @__PURE__ */ jsx("path", { d: "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" })] }),
	delete: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" }), /* @__PURE__ */ jsx("path", { d: "M10 11.5v5M14 11.5v5" })] })
};
function Icon({ name }) {
	return /* @__PURE__ */ jsx("svg", {
		"aria-hidden": "true",
		className: "h-4 w-4",
		fill: "none",
		viewBox: "0 0 24 24",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: ICONS[name]
	});
}
var ACTION = "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink-faint)] transition-colors duration-200 hover:bg-[var(--chip)] hover:text-[var(--ink)]";
function Switch({ checked, onChange, label }) {
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		onClick: () => onChange(!checked),
		className: "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
		style: { background: checked ? GRADIENT : "var(--field-line)" },
		children: /* @__PURE__ */ jsx("span", {
			className: `inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`,
			"aria-hidden": true
		})
	});
}
var STATUS_FILTERS = [
	{
		value: "",
		label: "All"
	},
	{
		value: "live",
		label: "Live"
	},
	{
		value: "published",
		label: "Published"
	},
	{
		value: "draft",
		label: "Draft"
	},
	{
		value: "disabled",
		label: "Disabled"
	}
];
function CustomCodeIndex({ snippets, filters, masterEnabled, types, locations }) {
	const pageErrors = usePage().props.errors ?? {};
	const [search, setSearch] = useState(filters.search ?? "");
	const [request, confirm, cancel, run] = useConfirm();
	const apply = (next) => {
		router.get("/admin/custom-code", Object.fromEntries(Object.entries({
			...filters,
			...next
		}).filter(([, value]) => value)), {
			preserveState: true,
			preserveScroll: true,
			replace: true
		});
	};
	const setMaster = (enabled) => {
		if (enabled) {
			router.patch("/admin/custom-code/master", { enabled: true }, { preserveScroll: true });
			return;
		}
		confirm({
			title: "Switch off all custom code?",
			body: "Every snippet stops running on the site straight away. Nothing is deleted, and switching back on restores them all.",
			confirmLabel: "Switch off",
			action: () => router.patch("/admin/custom-code/master", { enabled: false }, { preserveScroll: true })
		});
	};
	const askDelete = (snippet) => {
		confirm({
			title: `Delete “${snippet.name}”?`,
			body: "The snippet and its whole version history are deleted permanently. To stop it running without losing it, switch it off instead.",
			confirmLabel: "Delete",
			action: () => router.delete(`/admin/custom-code/${snippet.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Custom code | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Custom Code",
			subtitle: "CSS, scripts, tracking pixels and third-party embeds, injected into the public site. Never into the admin panel.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/custom-code/create",
				children: "+ New snippet"
			})
		}),
		pageErrors.code && /* @__PURE__ */ jsxs("p", {
			role: "alert",
			className: "mb-4 rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-[13px] text-[#ff6b6b]",
			children: ["This snippet cannot go live until its code is fixed: ", pageErrors.code]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 ${masterEnabled ? "border-[var(--line)] bg-[var(--surface)]" : "border-[#ff6b6b]/40 bg-[#ff6b6b]/10"}`,
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-[13px] font-semibold text-[var(--ink-strong)]",
				children: masterEnabled ? "Custom code is running on the site" : "All custom code is switched off"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-0.5 text-[12px] text-[var(--mute)]",
				children: masterEnabled ? "If a snippet breaks the site, switch this off to stop every snippet at once, then find the culprit." : "No snippet runs on the site until this is switched back on. Snippets can still be edited."
			})] }), /* @__PURE__ */ jsx(Switch, {
				checked: masterEnabled,
				onChange: setMaster,
				label: "Run custom code on the site"
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: STATUS_FILTERS.map((option) => {
				const active = (filters.status ?? "") === option.value;
				return /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => apply({ status: option.value }),
					className: `rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${active ? "border-transparent text-white" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"}`,
					style: active ? { background: GRADIENT } : void 0,
					children: option.label
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
				className: "grid gap-3 sm:grid-cols-[1fr_11rem_11rem]",
				children: [
					/* @__PURE__ */ jsx(Input, {
						value: search,
						onChange: (event) => setSearch(event.target.value),
						placeholder: "Search name, description or code, then press Enter",
						"aria-label": "Search snippets"
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: filters.type ?? "",
						onChange: (event) => apply({ type: event.target.value }),
						"aria-label": "Filter by type",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All types"
						}), types.map((type) => /* @__PURE__ */ jsx("option", {
							value: type.value,
							children: type.label
						}, type.value))]
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: filters.location ?? "",
						onChange: (event) => apply({ location: event.target.value }),
						"aria-label": "Filter by placement",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All placements"
						}), locations.map((location) => /* @__PURE__ */ jsx("option", {
							value: location.value,
							children: location.label
						}, location.value))]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: snippets.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: Object.values(filters).some(Boolean) ? "No snippet matches these filters." : "No custom code yet. Add a snippet for analytics, a pixel, a chat widget or a CSS tweak." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[880px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Priority"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Snippet"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Type"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Placement"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Pages"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "On"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 font-bold",
								children: "Action"
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", {
						className: "align-top",
						children: snippets.map((snippet) => /* @__PURE__ */ jsxs("tr", {
							className: "border-t border-[var(--line)]",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4 font-mono text-[12px] text-[var(--mute)]",
									children: snippet.priority
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "max-w-[18rem] py-3 pr-4",
									children: [/* @__PURE__ */ jsx(Link, {
										href: `/admin/custom-code/${snippet.id}/edit`,
										className: "block truncate font-semibold text-[var(--ink-strong)] hover:underline",
										children: snippet.name
									}), /* @__PURE__ */ jsxs("p", {
										className: "truncate text-[12px] text-[var(--ink-faint)]",
										children: [snippet.description || `${snippet.size.toLocaleString()} characters`, snippet.updatedAt && ` · ${snippet.updatedAt}${snippet.updatedBy ? ` by ${snippet.updatedBy}` : ""}`]
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4",
									children: /* @__PURE__ */ jsx("span", {
										className: `inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${TYPE_TONES[snippet.type]}`,
										children: snippet.typeLabel
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap py-3 pr-4 text-[var(--mute)]",
									children: snippet.locationLabel
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "max-w-[12rem] py-3 pr-4 text-[var(--mute)]",
									children: [/* @__PURE__ */ jsx("p", { children: snippet.target === "all" ? "All pages" : snippet.target === "only" ? "Only" : "All except" }), snippet.targetPaths.length > 0 && /* @__PURE__ */ jsx("p", {
										className: "truncate font-mono text-[11px] text-[var(--ink-faint)]",
										title: snippet.targetPaths.join(", "),
										children: snippet.targetPaths.join(", ")
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4",
									children: /* @__PURE__ */ jsxs("span", {
										className: `inline-flex items-center gap-1.5 text-[12px] font-semibold ${snippet.live && masterEnabled ? "text-[#16a34a]" : "text-[var(--ink-faint)]"}`,
										children: [/* @__PURE__ */ jsx("span", {
											className: `h-2 w-2 rounded-full ${snippet.live && masterEnabled ? "bg-[#22c55e]" : "bg-[var(--field-line)]"}`,
											"aria-hidden": true
										}), snippet.status === "published" ? snippet.live && masterEnabled ? "Live" : "Published" : "Draft"]
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4",
									children: /* @__PURE__ */ jsx(Switch, {
										checked: snippet.enabled,
										onChange: (enabled) => router.patch(`/admin/custom-code/${snippet.id}/toggle`, { enabled }, { preserveScroll: true }),
										label: `${snippet.enabled ? "Switch off" : "Switch on"} ${snippet.name}`
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex gap-1.5",
										children: [
											/* @__PURE__ */ jsx(Link, {
												href: `/admin/custom-code/${snippet.id}/edit`,
												className: ACTION,
												title: "Edit",
												"aria-label": `Edit ${snippet.name}`,
												children: /* @__PURE__ */ jsx(Icon, { name: "edit" })
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => router.post(`/admin/custom-code/${snippet.id}/duplicate`),
												className: ACTION,
												title: "Duplicate",
												"aria-label": `Duplicate ${snippet.name}`,
												children: /* @__PURE__ */ jsx(Icon, { name: "copy" })
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => askDelete(snippet),
												className: `${ACTION} !text-[#ff6b6b] hover:!bg-[#ff6b6b]/10`,
												title: "Delete",
												"aria-label": `Delete ${snippet.name}`,
												children: /* @__PURE__ */ jsx(Icon, { name: "delete" })
											})
										]
									})
								})
							]
						}, snippet.id))
					})]
				})
			})
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
CustomCodeIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { Switch, CustomCodeIndex as default };
