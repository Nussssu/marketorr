import { s as assetUrl } from "../ssr.js";
import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { c as PageHeader, l as Panel, m as Toggle, n as Button, o as Field, p as Textarea, s as Input } from "./ui-DUoJPW2G.js";
import { t as MailNav } from "./MailNav-ICufBW_l.js";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
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
var DUMMY_LEAD_DATA = {
	name: "John Doe",
	email: "john@example.com",
	phone: "+1 (555) 234-5678",
	company: "Acme Corporation",
	type: "Web Development",
	budget: "$5,000 - $10,000",
	source_page: "/contact",
	submitted_at: getFormattedDate(),
	message: "We are looking to rebuild our marketing site...",
	site_name: "Marketorr",
	contact_email: "hello@marketorr.com"
};
function escapeHtml(str) {
	if (str === null || str === void 0) return "";
	return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function compileSubject(templateSubject, data = DUMMY_LEAD_DATA) {
	if (!templateSubject) return "";
	return templateSubject.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, token) => {
		const key = token.toLowerCase();
		return key in data ? data[key] : match;
	});
}
function compileBodyHtml(templateBody, data = DUMMY_LEAD_DATA) {
	if (!templateBody) return "";
	return templateBody.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, token) => {
		const key = token.toLowerCase();
		if (key in data) return escapeHtml(data[key]).replace(/\n/g, "<br>");
		return match;
	});
}
/**
* Professional desktop & mobile email client frame modal with dynamic agency branding.
*/
function EmailPreviewModal({ open, template, onClose }) {
	const { props } = usePage();
	const settings = props?.settings;
	const rawSiteName = settings?.siteName || "Marketorr";
	const previewLogo = settings?.logo ?? settings?.logoDark ?? assetUrl("/images/logo/marketorr-logo-on-light.png");
	const contactEmail = settings?.contactEmail || "hello@marketorr.com";
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const copyrightText = settings?.copyright || `© ${currentYear} ${rawSiteName}. All rights reserved.`;
	const [device, setDevice] = useState("desktop");
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
	const isNotification = template?.key === "admin_lead_notification" || template?.key?.includes("admin");
	const mockFrom = `${rawSiteName} System <notifications@marketorr.com>`;
	const mockTo = isNotification ? "admin@marketorr.com" : "lead@example.com";
	const formattedDate = useMemo(() => getFormattedDate(), []);
	const previewData = useMemo(() => ({
		...DUMMY_LEAD_DATA,
		site_name: rawSiteName,
		contact_email: contactEmail
	}), [rawSiteName, contactEmail]);
	const compiledSubject = useMemo(() => compileSubject(template?.subject, previewData), [template?.subject, previewData]);
	const compiledBody = useMemo(() => compileBodyHtml(template?.bodyHtml, previewData), [template?.bodyHtml, previewData]);
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
								className: "ml-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400",
								children: ["Mail Client · ", template.label]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center rounded-lg border border-slate-700/80 bg-slate-800/80 p-0.5 text-[11px] font-bold uppercase tracking-[0.08em]",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setDevice("desktop"),
								className: `flex items-center gap-1.5 rounded-md px-3 py-1 transition-all ${device === "desktop" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`,
								children: [/* @__PURE__ */ jsx("svg", {
									className: "h-3.5 w-3.5",
									fill: "none",
									viewBox: "0 0 24 24",
									stroke: "currentColor",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: 2,
										d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									})
								}), /* @__PURE__ */ jsx("span", { children: "Desktop" })]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setDevice("mobile"),
								className: `flex items-center gap-1.5 rounded-md px-3 py-1 transition-all ${device === "mobile" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`,
								children: [/* @__PURE__ */ jsx("svg", {
									className: "h-3.5 w-3.5",
									fill: "none",
									viewBox: "0 0 24 24",
									stroke: "currentColor",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: 2,
										d: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
									})
								}), /* @__PURE__ */ jsx("span", { children: "Mobile" })]
							})]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							"aria-label": "Close modal",
							className: "flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white",
							children: "✕"
						})]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-b border-slate-800 bg-[#0f172a] px-6 py-4 text-slate-200",
					children: /* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ jsx("h3", {
								id: "preview-modal-title",
								className: "text-[16px] font-bold text-white tracking-tight leading-snug",
								children: compiledSubject || "(No Subject)"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[12px] font-mono text-slate-400",
								children: formattedDate
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "grid gap-1 pt-1 text-[13px]",
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
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8",
					children: /* @__PURE__ */ jsx("div", {
						className: `mx-auto transition-all duration-300 ${device === "mobile" ? "max-w-[390px]" : "w-full"}`,
						children: /* @__PURE__ */ jsxs("div", {
							className: "bg-white max-w-xl mx-auto rounded-lg shadow-sm border border-slate-200/80 p-8 text-slate-800",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between border-b border-slate-100 pb-5 mb-6",
									children: [/* @__PURE__ */ jsx("div", {
										className: "flex items-center gap-2.5",
										children: /* @__PURE__ */ jsx("img", {
											src: previewLogo,
											alt: rawSiteName,
											style: {
												height: 20,
												width: "auto",
												display: "block"
											}
										})
									}), /* @__PURE__ */ jsx("span", {
										className: "rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100",
										children: isNotification ? "Internal Alert" : "Confirmation"
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "email-canvas-body",
									dangerouslySetInnerHTML: { __html: compiledBody || "<p style=\"color: #94a3b8; font-style: italic;\">(Empty message body)</p>" }
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-8 border-t border-slate-100 pt-6",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[12px] text-slate-400 text-center sm:text-left",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center justify-center sm:justify-start gap-2",
											children: [
												/* @__PURE__ */ jsxs("span", {
													className: "font-semibold text-slate-600",
													children: ["Sent by ", rawSiteName]
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-slate-300",
													children: "·"
												}),
												/* @__PURE__ */ jsx("a", {
													href: `mailto:${contactEmail}`,
													className: "text-[var(--brand-2)] hover:underline transition-colors",
													children: contactEmail
												})
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "text-[11px] text-slate-400",
											children: copyrightText
										})]
									})
								})
							]
						})
					})
				}),
				/* @__PURE__ */ jsxs("footer", {
					className: "border-t border-slate-800 bg-[#0b1120] px-6 py-3.5 flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-[11px] text-slate-400",
						children: "Rendered with simulated dummy data for all placeholders"
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
function TemplateEditor({ template, onPreview }) {
	const { data, setData, put, processing, errors } = useForm({
		subject: template.subject,
		body_html: template.bodyHtml,
		enabled: template.enabled
	});
	const submit = (e) => {
		e.preventDefault();
		put(`/admin/email-templates/${template.id}`, { preserveScroll: true });
	};
	const triggerPreview = () => {
		onPreview({
			...template,
			subject: data.subject,
			bodyHtml: data.body_html
		});
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: template.label,
		description: template.description,
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
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
					error: errors.body_html,
					required: true,
					hint: "HTML is allowed. Placeholder values are escaped before they are inserted.",
					children: /* @__PURE__ */ jsx(Textarea, {
						rows: 14,
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
					children: [/* @__PURE__ */ jsx(Toggle, {
						checked: data.enabled,
						onChange: (value) => setData("enabled", value),
						label: "Send this email",
						hint: "Switching it off stops this message without affecting the other."
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: triggerPreview,
							children: "Preview Template"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: processing,
							children: processing ? "Saving…" : "Save template"
						})]
					})]
				})
			]
		})
	});
}
function EmailTemplatesIndex({ templates }) {
	const [activePreview, setActivePreview] = useState(null);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Email templates | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Email & SMTP",
			subtitle: "Transactional email templates triggered by new inquiries."
		}),
		/* @__PURE__ */ jsx(MailNav, { activeTab: "templates" }),
		/* @__PURE__ */ jsx("div", {
			className: "space-y-6",
			children: templates.map((template) => /* @__PURE__ */ jsx(TemplateEditor, {
				template,
				onPreview: (item) => setActivePreview(item)
			}, template.id))
		}),
		/* @__PURE__ */ jsx(EmailPreviewModal, {
			open: !!activePreview,
			template: activePreview,
			onClose: () => setActivePreview(null)
		})
	] });
}
EmailTemplatesIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { EmailTemplatesIndex as default };
