import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { _ as Toggle, c as PageHeader, f as Select, l as Panel, n as Button, o as Field, s as Input } from "./ui-BFNViBV5.js";
import { t as MailNav } from "./MailNav-DF9cU9GJ.js";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Mail/Edit.jsx
/** Sends a probe message through the saved settings. */
function TestPanel({ defaultRecipient }) {
	const { data, setData, post, processing, errors } = useForm({ recipient: defaultRecipient ?? "" });
	const submit = (e) => {
		e.preventDefault();
		post("/admin/mail/test", { preserveScroll: true });
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: "Send a test",
		description: "Proves the credentials before a real lead depends on them.",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-4",
			children: [/* @__PURE__ */ jsx(Field, {
				label: "Send to",
				error: errors.recipient,
				required: true,
				children: /* @__PURE__ */ jsx(Input, {
					type: "email",
					value: data.recipient,
					onChange: (e) => setData("recipient", e.target.value)
				})
			}), /* @__PURE__ */ jsx(Button, {
				type: "submit",
				variant: "secondary",
				disabled: processing,
				children: processing ? "Sending…" : "Send test email"
			})]
		})
	});
}
function MailEdit({ mail, encryptions, envMailer }) {
	const { auth } = usePage().props;
	const { data, setData, put, processing, errors, isDirty } = useForm({
		enabled: mail.enabled,
		host: mail.host ?? "",
		port: mail.port ?? 587,
		encryption: mail.encryption ?? "tls",
		username: mail.username ?? "",
		password: "",
		from_address: mail.fromAddress ?? "",
		from_name: mail.fromName ?? "",
		admin_notification_email: mail.adminNotificationEmail ?? ""
	});
	const submit = (e) => {
		e.preventDefault();
		put("/admin/mail", { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Email & SMTP | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Email & SMTP",
			subtitle: data.enabled ? "Stored SMTP settings are in use." : `Disabled: mail is going through the .env mailer (${envMailer}).`
		}),
		/* @__PURE__ */ jsx(MailNav, { activeTab: "smtp" }),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-6 pb-24 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "space-y-6 lg:col-span-2",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Server",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Toggle, {
										checked: data.enabled,
										onChange: (value) => setData("enabled", value),
										label: "Send through these SMTP settings",
										hint: "When off, the mailer configured in .env is used instead."
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Host",
									error: errors.host,
									required: data.enabled,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.host,
										onChange: (e) => setData("host", e.target.value),
										placeholder: "smtp.example.com"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Port",
									error: errors.port,
									required: data.enabled,
									children: /* @__PURE__ */ jsx(Input, {
										type: "number",
										min: "1",
										max: "65535",
										value: data.port,
										onChange: (e) => setData("port", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Encryption",
									error: errors.encryption,
									required: true,
									children: /* @__PURE__ */ jsx(Select, {
										value: data.encryption,
										onChange: (e) => setData("encryption", e.target.value),
										children: encryptions.map((option) => /* @__PURE__ */ jsx("option", {
											value: option.value,
											children: option.label
										}, option.value))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Username",
									error: errors.username,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.username,
										onChange: (e) => setData("username", e.target.value),
										autoComplete: "off"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Password",
									error: errors.password,
									hint: mail.hasPassword ? "A password is stored. Leave blank to keep it." : "No password stored yet.",
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Input, {
										type: "password",
										value: data.password,
										onChange: (e) => setData("password", e.target.value),
										autoComplete: "new-password",
										placeholder: mail.hasPassword ? "••••••••" : ""
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Addresses",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "From address",
									error: errors.from_address,
									hint: "Falls back to the .env sender.",
									children: /* @__PURE__ */ jsx(Input, {
										type: "email",
										value: data.from_address,
										onChange: (e) => setData("from_address", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "From name",
									error: errors.from_name,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.from_name,
										onChange: (e) => setData("from_name", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Lead notifications go to",
									error: errors.admin_notification_email,
									hint: "Falls back to the contact email in Settings.",
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Input, {
										type: "email",
										value: data.admin_notification_email,
										onChange: (e) => setData("admin_notification_email", e.target.value)
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:left-64",
						children: /* @__PURE__ */ jsxs("div", {
							className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("p", {
								className: `flex items-center gap-2 text-[13px] font-semibold ${isDirty ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`,
								children: [/* @__PURE__ */ jsx("span", {
									className: `h-2 w-2 rounded-full ${isDirty ? "bg-[#f5a524]" : "bg-[var(--field-line)]"}`,
									"aria-hidden": true
								}), isDirty ? "You have unsaved changes." : "No unsaved changes."]
							}), /* @__PURE__ */ jsx(Button, {
								type: "submit",
								disabled: processing,
								children: processing ? "Saving…" : "Save SMTP settings"
							})]
						})
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ jsx(TestPanel, { defaultRecipient: auth?.user?.email }),
					/* @__PURE__ */ jsx(Panel, {
						title: "Last test",
						children: mail.lastTestedAt ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
							className: "text-[13px] text-[var(--ink)]",
							children: mail.lastTestResult
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[11px] text-[var(--ink-faint)]",
							children: mail.lastTestedAt
						})] }) : /* @__PURE__ */ jsx("p", {
							className: "text-[13px] text-[var(--mute)]",
							children: "Never tested."
						})
					}),
					/* @__PURE__ */ jsxs(Panel, {
						title: "Email templates",
						description: "Automated notifications sent on new inquiries.",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-[12px] leading-relaxed text-[var(--mute)]",
							children: "Review, customize, and live-preview the transactional messages sent to both your team and inquiring leads."
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-4",
							children: /* @__PURE__ */ jsx(Button, {
								as: "link",
								href: "/admin/email-templates",
								variant: "secondary",
								className: "w-full",
								children: "Manage & preview templates →"
							})
						})]
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Security",
						children: /* @__PURE__ */ jsx("p", {
							className: "text-[12px] leading-relaxed text-[var(--mute)]",
							children: "The password is stored encrypted and is never sent back to this form. Only super admins can reach this page."
						})
					})
				]
			})]
		})
	] });
}
MailEdit.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { MailEdit as default };
