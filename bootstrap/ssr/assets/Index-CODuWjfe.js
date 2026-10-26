import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { _ as Toggle, c as PageHeader, g as Textarea, n as Button, o as Field, s as Input, v as WidgetPanel } from "./ui-Dz4ZqU85.js";
import { t as MailNav } from "./MailNav-Dm4KKAWs.js";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/admin/EmailPreviewModal.jsx
function getFormattedDate() {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true
	}).format(/* @__PURE__ */ new Date());
}
/**
* Asks the server to render the editor's unsaved subject and widgets into
* the real email layout, with sample values, so the preview matches what is
* actually sent.
*/
async function fetchPreview(templateId, draft, signal) {
	const xsrfToken = decodeURIComponent(document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)?.[1] ?? "");
	const res = await fetch(`/admin/email-templates/${templateId}/preview`, {
		method: "POST",
		signal,
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"X-XSRF-TOKEN": xsrfToken,
			"X-Requested-With": "XMLHttpRequest"
		},
		body: JSON.stringify({
			subject: draft.subject,
			blocks: draft.blocks
		})
	});
	if (!res.ok) {
		const payload = await res.json().catch(() => ({}));
		throw new Error(payload.message || "The preview could not be rendered.");
	}
	return res.json();
}
/**
* Desktop & mobile mail-client frame around the server-rendered email.
*/
function EmailPreviewModal({ open, template, draft, onClose }) {
	const { props } = usePage();
	const rawSiteName = props?.settings?.siteName || "Marketorr";
	const [device, setDevice] = useState("desktop");
	const [preview, setPreview] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		if (!open) return void 0;
		const onKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = originalOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open, onClose]);
	useEffect(() => {
		if (!open || !template || !draft) return void 0;
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		fetchPreview(template.id, draft, controller.signal).then((result) => setPreview(result)).catch((err) => {
			if (err.name !== "AbortError") setError(err.message);
		}).finally(() => setLoading(false));
		return () => controller.abort();
	}, [
		open,
		template,
		draft
	]);
	const isNotification = template?.key?.startsWith("admin");
	const mockFrom = `${rawSiteName} <notifications@marketorr.com>`;
	const mockTo = isNotification ? "admin@marketorr.com" : "recipient@example.com";
	const formattedDate = useMemo(() => getFormattedDate(), []);
	if (!open || !template) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in",
		"aria-labelledby": "preview-modal-title",
		role: "dialog",
		"aria-modal": "true",
		children: [/* @__PURE__ */ jsx("div", {
			className: "fixed inset-0",
			onClick: onClose,
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-700/70 bg-[#0f172a] shadow-2xl overflow-hidden z-10",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "flex items-center justify-between border-b border-slate-800 bg-[#0b1120] px-5 py-3.5 select-none",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: onClose,
								title: "Close preview",
								className: "h-3 w-3 rounded-full bg-[#ff5f56] transition-opacity hover:opacity-80 focus:outline-none"
							}),
							/* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-[#ffbd2e]" }),
							/* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-[#27c93f]" }),
							/* @__PURE__ */ jsxs("span", {
								className: "ml-3 hidden font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:inline",
								children: ["Mail Client · ", template.label]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center rounded-lg border border-slate-700/80 bg-slate-800/80 p-0.5 text-[11px] font-bold uppercase tracking-[0.08em]",
							children: ["desktop", "mobile"].map((mode) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setDevice(mode),
								className: `rounded-md px-3 py-1 capitalize transition-all ${device === mode ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`,
								children: mode
							}, mode))
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							"aria-label": "Close modal",
							className: "flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white",
							children: "✕"
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "border-b border-slate-800 bg-[#0f172a] px-6 py-4 text-slate-200",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ jsx("h3", {
							id: "preview-modal-title",
							className: "text-[16px] font-bold leading-snug tracking-tight text-white",
							children: preview?.subject || (loading ? "Rendering…" : "(No Subject)")
						}), /* @__PURE__ */ jsx("span", {
							className: "font-mono text-[12px] text-slate-400",
							children: formattedDate
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid gap-1 pt-3 text-[13px]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "w-12 text-[11px] font-bold uppercase tracking-wider text-slate-400",
								children: "From:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-semibold text-slate-100",
								children: mockFrom
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "w-12 text-[11px] font-bold uppercase tracking-wider text-slate-400",
								children: "To:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium text-slate-300",
								children: mockTo
							})]
						})]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex-1 overflow-y-auto bg-[#0b0b0f]",
					children: error ? /* @__PURE__ */ jsx("p", {
						className: "p-8 text-center text-[13px] text-[#ff6b6b]",
						children: error
					}) : /* @__PURE__ */ jsx("div", {
						className: `mx-auto transition-all duration-300 ${device === "mobile" ? "max-w-[390px]" : "w-full"}`,
						children: /* @__PURE__ */ jsx("iframe", {
							title: `${template.label} preview`,
							srcDoc: preview?.html || "",
							sandbox: "",
							className: `block h-[60vh] w-full border-0 transition-opacity ${loading ? "opacity-40" : "opacity-100"}`
						})
					})
				}),
				/* @__PURE__ */ jsxs("footer", {
					className: "flex items-center justify-between border-t border-slate-800 bg-[#0b1120] px-6 py-3.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-[11px] text-slate-400",
						children: "Rendered by the server with sample values for every placeholder"
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: onClose,
						className: "border-slate-700 text-slate-200 hover:bg-slate-800",
						children: "Close Preview"
					})]
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/pages/Admin/EmailTemplates/Index.jsx
/** Room left below the text, about one extra line. */
var TEXTAREA_SPARE_PX = 22;
/**
* A textarea sized to its text plus about one spare line, growing and
* shrinking as the text changes, instead of a fixed tall box.
*/
function AutoTextarea({ value, className = "", ...props }) {
	const ref = useRef(null);
	const fit = () => {
		const el = ref.current;
		if (!el || el.offsetParent === null) return;
		el.style.height = "auto";
		const height = `${el.scrollHeight + TEXTAREA_SPARE_PX}px`;
		if (el.style.height !== height) el.style.height = height;
	};
	useLayoutEffect(fit, [value]);
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || typeof ResizeObserver === "undefined") return void 0;
		let lastWidth = 0;
		const observer = new ResizeObserver(([entry]) => {
			const width = Math.round(entry.contentRect.width);
			if (width !== lastWidth) {
				lastWidth = width;
				fit();
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return /* @__PURE__ */ jsx(Textarea, {
		ref,
		rows: 1,
		value: value ?? "",
		className: `overflow-hidden ${className}`,
		...props
	});
}
/**
* The widgets a template saves: unchanged when its Body was not edited, or
* the edited HTML as a single Custom HTML widget.
*/
var blocksFor = (template, row) => row.body_html === template.bodyHtml ? template.blocks : [{
	type: "html",
	html: row.body_html
}];
/** The first error about the template's body, wherever it was reported. */
var bodyError = (errors) => errors.blocks ?? Object.entries(errors).find(([key]) => key.startsWith("blocks."))?.[1];
/**
* One template's fields. Its values live in the page's single form, which
* the fixed save bar submits for every template at once.
*/
function TemplateEditor({ template, data, onChange, errors, onPreview, defaultOpen = false }) {
	const setData = (key, value) => onChange({
		...data,
		[key]: value
	});
	return /* @__PURE__ */ jsx(WidgetPanel, {
		defaultOpen,
		title: template.label,
		description: template.description,
		summary: `${data.subject}${template.canBeDisabled && !data.enabled ? " · switched off" : ""}`,
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Subject",
					error: errors.subject,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.subject,
						onChange: (e) => setData("subject", e.target.value)
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Body",
					error: bodyError(errors),
					required: true,
					hint: "HTML is allowed. Placeholder values are escaped before they are inserted.",
					children: /* @__PURE__ */ jsx(AutoTextarea, {
						className: "font-mono text-[12px]",
						value: data.body_html,
						onChange: (e) => setData("body_html", e.target.value)
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-[var(--field-line)] p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
						children: "Available placeholders"
					}), /* @__PURE__ */ jsx("ul", {
						className: "mt-3 grid gap-1.5 sm:grid-cols-2",
						children: template.placeholders.map((placeholder) => /* @__PURE__ */ jsxs("li", {
							className: "text-[12px] text-[var(--mute)]",
							children: [
								/* @__PURE__ */ jsx("code", {
									className: "text-[var(--ink)]",
									children: placeholder.token
								}),
								": ",
								placeholder.hint
							]
						}, placeholder.token))
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5",
					children: [template.canBeDisabled ? /* @__PURE__ */ jsx(Toggle, {
						checked: data.enabled,
						onChange: (value) => setData("enabled", value),
						label: "Send this email",
						hint: "Switching it off stops this message without affecting the others."
					}) : /* @__PURE__ */ jsx("p", {
						className: "text-[12px] text-[var(--mute)]",
						children: "This email is always sent: it cannot be switched off."
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => onPreview({
							subject: data.subject,
							blocks: blocksFor(template, data)
						}),
						children: "Preview Template"
					})]
				})
			]
		})
	});
}
function EmailTemplatesIndex({ templates }) {
	const [activePreview, setActivePreview] = useState(null);
	const { data, setData, transform, put, processing, errors, isDirty } = useForm({ templates: templates.map((template) => ({
		id: template.id,
		subject: template.subject,
		body_html: template.bodyHtml,
		enabled: template.enabled
	})) });
	transform((form) => ({ templates: form.templates.map((row, index) => ({
		id: row.id,
		subject: row.subject,
		enabled: row.enabled,
		blocks: blocksFor(templates[index], row)
	})) }));
	const submit = (e) => {
		e.preventDefault();
		put("/admin/email-templates", { preserveScroll: true });
	};
	const updateTemplate = (index, value) => setData("templates", data.templates.map((row, i) => i === index ? value : row));
	const errorsFor = (index) => Object.fromEntries(Object.entries(errors).filter(([key]) => key.startsWith(`templates.${index}.`)).map(([key, message]) => [key.slice(`templates.${index}.`.length), message]));
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Email templates | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Email & SMTP",
			subtitle: "Every email the site sends, inside the branded layout with the site logo."
		}),
		/* @__PURE__ */ jsx(MailNav, { activeTab: "templates" }),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "space-y-4 pb-24",
			children: [templates.map((template, index) => /* @__PURE__ */ jsx(TemplateEditor, {
				template,
				data: data.templates[index],
				onChange: (value) => updateTemplate(index, value),
				errors: errorsFor(index),
				onPreview: (draft) => setActivePreview({
					template,
					draft
				}),
				defaultOpen: index === 0
			}, template.id)), /* @__PURE__ */ jsx("div", {
				className: "fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-6 lg:left-64 lg:px-10",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("p", {
						className: `flex items-center gap-2 text-[13px] font-semibold ${isDirty ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`,
						children: [/* @__PURE__ */ jsx("span", {
							className: `h-2 w-2 rounded-full ${isDirty ? "bg-[#f5a524]" : "bg-[var(--field-line)]"}`,
							"aria-hidden": true
						}), isDirty ? "You have unsaved changes." : "No unsaved changes."]
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						children: processing ? "Saving…" : "Save templates"
					})]
				})
			})]
		}),
		/* @__PURE__ */ jsx(EmailPreviewModal, {
			open: !!activePreview,
			template: activePreview?.template,
			draft: activePreview?.draft,
			onClose: () => setActivePreview(null)
		})
	] });
}
EmailTemplatesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { EmailTemplatesIndex as default };
