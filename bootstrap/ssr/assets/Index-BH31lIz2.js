import { y as withAlpha } from "../ssr.js";
import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { a as EmptyState, c as PageHeader, i as ConfirmDialog, l as Panel, n as Button, s as Input, t as Badge, x as useConfirm } from "./ui-BFNViBV5.js";
import { Form, Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
//#region resources/js/pages/Admin/Inquiries/Index.jsx
var STATUS_THEME = {
	new: {
		label: "New",
		color: "var(--brand-1)",
		background: "rgba(var(--brand-1-rgb),0.1)"
	},
	in_progress: {
		label: "In Progress",
		color: "var(--brand-2)",
		background: "rgba(var(--brand-2-rgb),0.1)"
	},
	replied: {
		label: "Replied",
		color: "var(--brand-3)",
		background: "rgba(var(--brand-3-rgb),0.1)"
	},
	archived: {
		label: "Archived",
		color: "#8B98A8",
		background: "rgba(139,152,168,0.1)"
	}
};
function StatusSelect({ inquiry, statuses }) {
	const [open, setOpen] = useState(false);
	const [currentStatus, setCurrentStatus] = useState(inquiry.status);
	const [highlighted, setHighlighted] = useState(-1);
	const [menuPosition, setMenuPosition] = useState(null);
	const [saving, setSaving] = useState(false);
	const buttonRef = useRef(null);
	const menuRef = useRef(null);
	const theme = STATUS_THEME[currentStatus] ?? STATUS_THEME.archived;
	useEffect(() => {
		setCurrentStatus(inquiry.status);
	}, [inquiry.status]);
	useEffect(() => {
		if (!open) return void 0;
		const closeOnOutsidePress = (event) => {
			if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
		};
		const closeOnEscape = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		const closeOnViewportChange = () => setOpen(false);
		document.addEventListener("pointerdown", closeOnOutsidePress);
		document.addEventListener("keydown", closeOnEscape);
		window.addEventListener("resize", closeOnViewportChange);
		window.addEventListener("scroll", closeOnViewportChange, true);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePress);
			document.removeEventListener("keydown", closeOnEscape);
			window.removeEventListener("resize", closeOnViewportChange);
			window.removeEventListener("scroll", closeOnViewportChange, true);
		};
	}, [open]);
	const openList = () => {
		const bounds = buttonRef.current?.getBoundingClientRect();
		if (!bounds) return;
		const menuWidth = 144;
		const menuHeight = statuses.length * 37 + 12;
		const dropUp = window.innerHeight - bounds.bottom < menuHeight + 12 && bounds.top > menuHeight;
		setHighlighted(Math.max(0, statuses.indexOf(currentStatus)));
		setMenuPosition({
			left: Math.min(bounds.left, window.innerWidth - menuWidth - 8),
			top: dropUp ? bounds.top - 8 : bounds.bottom + 8,
			dropUp,
			width: Math.max(bounds.width, menuWidth)
		});
		setOpen(true);
	};
	const choose = (status) => {
		if (status === currentStatus) {
			setOpen(false);
			return;
		}
		const previousStatus = currentStatus;
		setCurrentStatus(status);
		setOpen(false);
		setSaving(true);
		router.patch(`/admin/inquiries/${inquiry.id}/status`, { status }, {
			preserveScroll: true,
			onError: () => setCurrentStatus(previousStatus),
			onFinish: () => setSaving(false)
		});
	};
	const onKeyDown = (event) => {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		if (!open) {
			openList();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			const step = event.key === "ArrowDown" ? 1 : -1;
			setHighlighted((index) => (index + step + statuses.length) % statuses.length);
		} else if (highlighted >= 0) choose(statuses[highlighted]);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("button", {
		ref: buttonRef,
		type: "button",
		"aria-haspopup": "listbox",
		"aria-expanded": open,
		"aria-label": `Change status for ${inquiry.name}`,
		disabled: saving,
		onClick: () => open ? setOpen(false) : openList(),
		onKeyDown,
		className: "flex h-9 w-[132px] items-center justify-between gap-2 rounded-lg border py-0 pr-3 pl-3 text-left text-[12px] font-semibold transition-all disabled:cursor-wait disabled:opacity-60",
		style: {
			borderColor: `${withAlpha(theme.color, "66")}`,
			color: theme.color,
			background: theme.background
		},
		children: [/* @__PURE__ */ jsx("span", {
			className: "min-w-0 truncate",
			children: saving ? "Saving…" : theme.label
		}), /* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 12 7",
			className: `h-[7px] w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`,
			fill: "none",
			"aria-hidden": true,
			children: /* @__PURE__ */ jsx("path", {
				d: "M1 1l5 5 5-5",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		})]
	}), open && menuPosition && typeof document !== "undefined" && createPortal(/* @__PURE__ */ jsx("ul", {
		ref: menuRef,
		role: "listbox",
		"aria-label": `Status for ${inquiry.name}`,
		className: "fixed z-[300] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]",
		style: {
			left: menuPosition.left,
			top: menuPosition.top,
			width: menuPosition.width,
			transform: menuPosition.dropUp ? "translateY(-100%)" : void 0
		},
		children: statuses.map((status, index) => {
			const optionTheme = STATUS_THEME[status] ?? STATUS_THEME.archived;
			const active = highlighted === index;
			const selected = currentStatus === status;
			return /* @__PURE__ */ jsxs("li", {
				role: "option",
				"aria-selected": selected,
				onPointerEnter: () => setHighlighted(index),
				onClick: () => choose(status),
				className: `flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors duration-150 ${active ? "text-white" : "text-[var(--ink)]"} ${selected ? "font-bold" : "font-medium"}`,
				style: active ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0,
				children: [/* @__PURE__ */ jsx("span", { children: optionTheme.label }), selected && /* @__PURE__ */ jsx("span", {
					className: "h-1.5 w-1.5 rounded-full",
					style: { background: active ? "#fff" : optionTheme.color },
					"aria-hidden": true
				})]
			}, status);
		})
	}), document.body)] });
}
/**
* A filter dropdown (All statuses / All types) whose open list matches the
* message-status menu: dark surface, brand-gradient highlight, a dot on the
* chosen option. The trigger keeps the look of the other filter fields.
*
* @param {{ value: string, onChange: (value: string) => void, options: Array<{ value: string, label: string }>, placeholder: string, label: string }} props
*/
function FilterSelect({ value, onChange, options, placeholder, label }) {
	const [open, setOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(-1);
	const [menuPosition, setMenuPosition] = useState(null);
	const buttonRef = useRef(null);
	const menuRef = useRef(null);
	const choices = [{
		value: "",
		label: placeholder
	}, ...options];
	const current = choices.find((choice) => choice.value === value) ?? choices[0];
	useEffect(() => {
		if (!open) return void 0;
		const closeOnOutsidePress = (event) => {
			if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
		};
		const closeOnEscape = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		const closeOnViewportChange = () => setOpen(false);
		document.addEventListener("pointerdown", closeOnOutsidePress);
		document.addEventListener("keydown", closeOnEscape);
		window.addEventListener("resize", closeOnViewportChange);
		window.addEventListener("scroll", closeOnViewportChange, true);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePress);
			document.removeEventListener("keydown", closeOnEscape);
			window.removeEventListener("resize", closeOnViewportChange);
			window.removeEventListener("scroll", closeOnViewportChange, true);
		};
	}, [open]);
	const openList = () => {
		const bounds = buttonRef.current?.getBoundingClientRect();
		if (!bounds) return;
		const menuHeight = choices.length * 37 + 12;
		const dropUp = window.innerHeight - bounds.bottom < menuHeight + 12 && bounds.top > menuHeight;
		setHighlighted(Math.max(0, choices.indexOf(current)));
		setMenuPosition({
			left: bounds.left,
			top: dropUp ? bounds.top - 8 : bounds.bottom + 8,
			dropUp,
			width: bounds.width
		});
		setOpen(true);
	};
	const choose = (choice) => {
		setOpen(false);
		if (choice.value !== value) onChange(choice.value);
	};
	const onKeyDown = (event) => {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		if (!open) {
			openList();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			const step = event.key === "ArrowDown" ? 1 : -1;
			setHighlighted((index) => (index + step + choices.length) % choices.length);
		} else if (highlighted >= 0) choose(choices[highlighted]);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("button", {
		ref: buttonRef,
		type: "button",
		"aria-haspopup": "listbox",
		"aria-expanded": open,
		"aria-label": `${label}: ${current.label}`,
		onClick: () => open ? setOpen(false) : openList(),
		onKeyDown,
		className: `flex min-w-[160px] items-center justify-between gap-3 rounded-lg border border-[var(--field-line)] bg-[var(--bg)] px-3 py-2.5 text-left text-[14px] transition-colors hover:border-[rgba(var(--brand-1-rgb),0.65)] ${value ? "text-[var(--ink)]" : "text-[var(--placeholder)]"}`,
		children: [/* @__PURE__ */ jsx("span", {
			className: "min-w-0 truncate capitalize",
			children: current.label
		}), /* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 12 7",
			className: `h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 ${open ? "rotate-180" : ""}`,
			fill: "none",
			"aria-hidden": true,
			children: /* @__PURE__ */ jsx("path", {
				d: "M1 1l5 5 5-5",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		})]
	}), open && menuPosition && typeof document !== "undefined" && createPortal(/* @__PURE__ */ jsx("ul", {
		ref: menuRef,
		role: "listbox",
		"aria-label": label,
		className: "fixed z-[300] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]",
		style: {
			left: menuPosition.left,
			top: menuPosition.top,
			width: menuPosition.width,
			transform: menuPosition.dropUp ? "translateY(-100%)" : void 0
		},
		children: choices.map((choice, index) => {
			const active = highlighted === index;
			const selected = current.value === choice.value;
			return /* @__PURE__ */ jsxs("li", {
				role: "option",
				"aria-selected": selected,
				onPointerEnter: () => setHighlighted(index),
				onClick: () => choose(choice),
				className: `flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px] capitalize transition-colors duration-150 ${active ? "text-white" : "text-[var(--ink)]"} ${selected ? "font-bold" : "font-medium"}`,
				style: active ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0,
				children: [/* @__PURE__ */ jsx("span", { children: choice.label }), selected && /* @__PURE__ */ jsx("span", {
					className: "h-1.5 w-1.5 rounded-full",
					style: { background: active ? "#fff" : "var(--ink-faint)" },
					"aria-hidden": true
				})]
			}, choice.value || "all");
		})
	}), document.body)] });
}
function EyeIcon() {
	return /* @__PURE__ */ jsxs("svg", {
		"aria-hidden": "true",
		className: "h-4 w-4",
		fill: "none",
		viewBox: "0 0 24 24",
		stroke: "currentColor",
		strokeWidth: "1.8",
		children: [/* @__PURE__ */ jsx("path", {
			strokeLinecap: "round",
			strokeLinejoin: "round",
			d: "M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z"
		}), /* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "2.75"
		})]
	});
}
function TrashIcon() {
	return /* @__PURE__ */ jsxs("svg", {
		"aria-hidden": "true",
		className: "h-4 w-4",
		fill: "none",
		viewBox: "0 0 24 24",
		stroke: "currentColor",
		strokeWidth: "1.8",
		children: [/* @__PURE__ */ jsx("path", {
			strokeLinecap: "round",
			strokeLinejoin: "round",
			d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7"
		}), /* @__PURE__ */ jsx("path", {
			strokeLinecap: "round",
			d: "M10 11.5v5M14 11.5v5"
		})]
	});
}
function Detail({ label, children }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
		className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
		children: label
	}), /* @__PURE__ */ jsx("p", {
		className: "mt-1 break-words text-[14px] text-[var(--ink)]",
		children: children || "-"
	})] });
}
function InquiryModal({ inquiry, onClose }) {
	useEffect(() => {
		if (!inquiry) return void 0;
		const onKeyDown = (event) => {
			if (event.key === "Escape") onClose();
		};
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = originalOverflow;
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [inquiry, onClose]);
	if (!inquiry) return null;
	const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your project inquiry: ${inquiry.type}`)}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[200] flex items-center justify-center p-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "inquiry-modal-title",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Close lead details",
			onClick: onClose,
			className: "absolute inset-0 bg-black/70 backdrop-blur-sm"
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ jsx("h2", {
							id: "inquiry-modal-title",
							className: "font-display text-xl font-extrabold text-[var(--ink-strong)]",
							children: inquiry.name
						}), /* @__PURE__ */ jsx(Badge, { tone: inquiry.status })]
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-[12px] text-[var(--mute)]",
						children: ["Received ", inquiry.createdAt]
					})] }), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--field-line)] text-xl text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]",
						children: "×"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "overflow-y-auto p-5 sm:p-6",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid gap-6 lg:grid-cols-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-6 lg:col-span-2",
							children: [/* @__PURE__ */ jsx(Panel, {
								title: "Message",
								children: /* @__PURE__ */ jsx("p", {
									className: "whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--ink)]",
									children: inquiry.message
								})
							}), /* @__PURE__ */ jsx(Panel, {
								title: "Contact details",
								children: /* @__PURE__ */ jsxs("div", {
									className: "grid gap-5 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ jsx(Detail, {
											label: "Email",
											children: inquiry.email
										}),
										/* @__PURE__ */ jsx(Detail, {
											label: "Phone",
											children: inquiry.phone
										}),
										/* @__PURE__ */ jsx(Detail, {
											label: "Company",
											children: inquiry.company
										}),
										/* @__PURE__ */ jsx(Detail, {
											label: "Project type",
											children: inquiry.type
										}),
										/* @__PURE__ */ jsx(Detail, {
											label: "Budget",
											children: inquiry.budget
										})
									]
								})
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ jsx(Panel, {
								title: "Request metadata",
								children: /* @__PURE__ */ jsxs("div", {
									className: "grid gap-5",
									children: [
										/* @__PURE__ */ jsx(Detail, {
											label: "Source page",
											children: inquiry.sourcePage
										}),
										/* @__PURE__ */ jsx(Detail, {
											label: "First replied",
											children: inquiry.respondedAt
										}),
										/* @__PURE__ */ jsx(Detail, {
											label: "IP address",
											children: inquiry.ipAddress
										}),
										/* @__PURE__ */ jsx(Detail, {
											label: "User agent",
											children: inquiry.userAgent
										})
									]
								})
							}), /* @__PURE__ */ jsx(Panel, {
								title: "Internal notes",
								children: /* @__PURE__ */ jsx("p", {
									className: "whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--ink)]",
									children: inquiry.adminNotes || "-"
								})
							})]
						})]
					})
				}),
				/* @__PURE__ */ jsxs("footer", {
					className: "flex justify-end gap-3 border-t border-[var(--line)] px-5 py-4 sm:px-6",
					children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: onClose,
						children: "Close"
					}), /* @__PURE__ */ jsx(Button, {
						as: "a",
						href: mailto,
						children: "Reply by email"
					})]
				})
			]
		})]
	});
}
function InquiriesIndex({ inquiries, filters, statuses, types }) {
	const [form, setForm] = useState(filters);
	const [selectedInquiry, setSelectedInquiry] = useState(null);
	const [request, confirm, cancel, run] = useConfirm();
	const askDelete = (inquiry) => confirm({
		title: `Delete lead from “${inquiry.name}”?`,
		body: "The submission is permanently removed from the inbox.",
		action: () => router.delete(`/admin/inquiries/${inquiry.id}`, { preserveScroll: true })
	});
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
		/* @__PURE__ */ jsxs(PageHeader, {
			title: "Leads",
			subtitle: `${inquiries.total} submission${inquiries.total === 1 ? "" : "s"} from the contact form.`,
			children: [/* @__PURE__ */ jsx(Form, {
				action: "/admin/inquiries/import",
				method: "post",
				resetOnSuccess: true,
				children: ({ errors, processing }) => /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-end gap-1",
					children: [/* @__PURE__ */ jsxs(Button, {
						as: "label",
						variant: "secondary",
						className: processing ? "pointer-events-none opacity-50" : "cursor-pointer",
						children: [processing ? "Importing..." : "Import CSV", /* @__PURE__ */ jsx("input", {
							type: "file",
							name: "csv",
							accept: ".csv,text/csv",
							className: "sr-only",
							disabled: processing,
							onChange: (event) => event.currentTarget.form?.requestSubmit()
						})]
					}), errors.csv && /* @__PURE__ */ jsx("span", {
						className: "max-w-xs text-right text-[11px] text-[#ff6b6b]",
						children: errors.csv
					})]
				})
			}), /* @__PURE__ */ jsx(Button, {
				as: "a",
				href: `/admin/inquiries/export?${new URLSearchParams(filters).toString()}`,
				variant: "secondary",
				children: "Export CSV"
			})]
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
					/* @__PURE__ */ jsx(FilterSelect, {
						label: "Filter by status",
						value: form.status ?? "",
						onChange: (status) => apply({
							...form,
							status
						}),
						placeholder: "All statuses",
						options: statuses.map((s) => ({
							value: s,
							label: STATUS_THEME[s]?.label ?? s.replace("_", " ")
						}))
					}),
					/* @__PURE__ */ jsx(FilterSelect, {
						label: "Filter by type",
						value: form.type ?? "",
						onChange: (type) => apply({
							...form,
							type
						}),
						placeholder: "All types",
						options: types.map((t) => ({
							value: t,
							label: t
						}))
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
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 font-bold",
								children: "Action"
							})
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
								children: /* @__PURE__ */ jsx(StatusSelect, {
									inquiry,
									statuses
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 whitespace-nowrap text-[var(--mute)]",
								children: inquiry.createdAt
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 whitespace-nowrap",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setSelectedInquiry(inquiry),
									"aria-label": `View ${inquiry.name}`,
									title: `View ${inquiry.name}`,
									className: "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--ink-faint)] transition-colors hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]",
									children: /* @__PURE__ */ jsx(EyeIcon, {})
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => askDelete(inquiry),
									"aria-label": `Delete ${inquiry.name}`,
									title: `Delete ${inquiry.name}`,
									className: "ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#ff6b6b] transition-colors hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10",
									children: /* @__PURE__ */ jsx(TrashIcon, {})
								})]
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
		}),
		/* @__PURE__ */ jsx(InquiryModal, {
			inquiry: selectedInquiry,
			onClose: () => setSelectedInquiry(null)
		}),
		/* @__PURE__ */ jsx(ConfirmDialog, {
			open: !!request,
			title: request?.title ?? "",
			body: request?.body,
			confirmLabel: "Delete",
			onConfirm: run,
			onCancel: cancel
		})
	] });
}
InquiriesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { InquiriesIndex as default };
