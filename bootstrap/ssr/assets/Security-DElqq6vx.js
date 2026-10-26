import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { a as EmptyState, c as PageHeader, i as ConfirmDialog, l as Panel, n as Button, o as Field, s as Input, x as useConfirm } from "./ui-Dz4ZqU85.js";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Account/Security.jsx
function PasswordPanel() {
	const { data, setData, put, processing, errors, reset } = useForm({
		current_password: "",
		password: "",
		password_confirmation: ""
	});
	const submit = (e) => {
		e.preventDefault();
		put("/admin/account/password", {
			preserveScroll: true,
			onSuccess: () => reset(),
			onError: () => reset("current_password")
		});
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: "Password",
		description: "Use at least 10 characters, with letters and numbers.",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "space-y-5",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Current password",
					error: errors.current_password,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						type: "password",
						value: data.current_password,
						onChange: (e) => setData("current_password", e.target.value),
						autoComplete: "current-password"
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-5 sm:grid-cols-2",
					children: [/* @__PURE__ */ jsx(Field, {
						label: "New password",
						error: errors.password,
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							type: "password",
							value: data.password,
							onChange: (e) => setData("password", e.target.value),
							autoComplete: "new-password"
						})
					}), /* @__PURE__ */ jsx(Field, {
						label: "Confirm new password",
						error: errors.password_confirmation,
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							type: "password",
							value: data.password_confirmation,
							onChange: (e) => setData("password_confirmation", e.target.value),
							autoComplete: "new-password"
						})
					})]
				}),
				/* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					children: processing ? "Saving…" : "Change password"
				})
			]
		})
	});
}
/** A form asking for the current password before a sensitive change. */
function PasswordConfirmForm({ action, method = "post", label, variant = "secondary", onDone }) {
	const { data, setData, processing, errors, reset, submit } = useForm({ password: "" });
	const send = (e) => {
		e.preventDefault();
		submit(method, action, {
			preserveScroll: true,
			onSuccess: () => {
				reset();
				onDone?.();
			},
			onError: () => reset("password")
		});
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: send,
		className: "flex flex-wrap items-start gap-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "min-w-[220px] flex-1",
			children: [/* @__PURE__ */ jsx(Input, {
				type: "password",
				value: data.password,
				onChange: (e) => setData("password", e.target.value),
				placeholder: "Your current password",
				"aria-label": "Current password",
				autoComplete: "current-password"
			}), errors.password && /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[12px] text-[#ff6b6b]",
				children: errors.password
			})]
		}), /* @__PURE__ */ jsx(Button, {
			type: "submit",
			variant,
			disabled: processing || data.password === "",
			children: label
		})]
	});
}
function RecoveryCodes({ codes }) {
	const [copied, setCopied] = useState(false);
	const copy = () => {
		navigator.clipboard?.writeText(codes.join("\n")).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg border border-[var(--brand-3)]/40 bg-[var(--brand-3)]/5 p-4",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[13px] font-semibold text-[var(--ink)]",
				children: "Save your recovery codes"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-[12px] text-[var(--mute)]",
				children: "Each code signs you in once if you lose your phone. They are shown only now, so store them somewhere safe."
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "mt-3 grid grid-cols-2 gap-2 font-mono text-[13px] text-[var(--ink)]",
				children: codes.map((code) => /* @__PURE__ */ jsx("li", {
					className: "rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-center",
					children: code
				}, code))
			}),
			/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "secondary",
				className: "mt-3",
				onClick: copy,
				children: copied ? "Copied ✓" : "Copy codes"
			})
		]
	});
}
function TwoFactorPanel({ twoFactor, recoveryCodes }) {
	const confirmForm = useForm({ code: "" });
	const [showRegenerate, setShowRegenerate] = useState(false);
	const [showDisable, setShowDisable] = useState(false);
	const start = () => router.post("/admin/account/two-factor", {}, { preserveScroll: true });
	const cancel = () => router.delete("/admin/account/two-factor/pending", { preserveScroll: true });
	const confirm = (e) => {
		e.preventDefault();
		confirmForm.post("/admin/account/two-factor/confirm", {
			preserveScroll: true,
			onSuccess: () => confirmForm.reset()
		});
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: "Two-factor authentication",
		description: "A code from an authenticator app (Google Authenticator, Authy, 1Password, Microsoft Authenticator) is asked for after your password.",
		action: /* @__PURE__ */ jsx("span", {
			className: `rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${twoFactor.enabled ? "border-[var(--brand-3)]/40 text-[var(--brand-3)]" : "border-[var(--field-line)] text-[var(--ink-faint)]"}`,
			children: twoFactor.enabled ? "On" : "Off"
		}),
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-5",
			children: [
				recoveryCodes?.length > 0 && /* @__PURE__ */ jsx(RecoveryCodes, { codes: recoveryCodes }),
				!twoFactor.enabled && !twoFactor.pending && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[13px] text-[var(--mute)]",
						children: "Protect your account even if your password leaks."
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						onClick: start,
						children: "Set up two-factor"
					})]
				}),
				!twoFactor.enabled && twoFactor.pending && /* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsx("ol", {
							className: "list-decimal space-y-2 pl-5 text-[13px] text-[var(--mute)]",
							children: /* @__PURE__ */ jsxs("li", { children: [
								"In your authenticator app, add an account with this setup key",
								/* @__PURE__ */ jsxs("span", {
									className: "sm:hidden",
									children: [", or ", /* @__PURE__ */ jsx("a", {
										href: twoFactor.pending.uri,
										className: "text-[var(--brand-3)] underline",
										children: "open it in your app"
									})]
								}),
								":"
							] })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "select-all break-all rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-center font-mono text-[15px] tracking-[0.15em] text-[var(--ink-strong)]",
							children: twoFactor.pending.secret
						}),
						/* @__PURE__ */ jsx("ol", {
							start: 2,
							className: "list-decimal pl-5 text-[13px] text-[var(--mute)]",
							children: /* @__PURE__ */ jsx("li", { children: "Enter the 6-digit code it shows to finish." })
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: confirm,
							className: "flex flex-wrap items-start gap-3",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "w-40",
									children: /* @__PURE__ */ jsx(Input, {
										value: confirmForm.data.code,
										onChange: (e) => confirmForm.setData("code", e.target.value),
										inputMode: "numeric",
										autoComplete: "one-time-code",
										placeholder: "123456",
										maxLength: 7,
										"aria-label": "Authentication code",
										className: "text-center font-mono tracking-[0.3em]"
									})
								}),
								/* @__PURE__ */ jsx(Button, {
									type: "submit",
									disabled: confirmForm.processing,
									children: "Confirm"
								}),
								/* @__PURE__ */ jsx(Button, {
									type: "button",
									variant: "ghost",
									onClick: cancel,
									children: "Cancel"
								})
							]
						}),
						confirmForm.errors.code && /* @__PURE__ */ jsx("p", {
							className: "text-[12px] text-[#ff6b6b]",
							children: confirmForm.errors.code
						})
					]
				}),
				twoFactor.enabled && /* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsxs("p", {
							className: "text-[13px] text-[var(--mute)]",
							children: [
								twoFactor.recoveryCodesLeft,
								" recovery ",
								twoFactor.recoveryCodesLeft === 1 ? "code" : "codes",
								" left."
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap gap-3",
							children: [/* @__PURE__ */ jsx(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => {
									setShowRegenerate((v) => !v);
									setShowDisable(false);
								},
								children: "New recovery codes"
							}), /* @__PURE__ */ jsx(Button, {
								type: "button",
								variant: "danger",
								onClick: () => {
									setShowDisable((v) => !v);
									setShowRegenerate(false);
								},
								children: "Turn off"
							})]
						}),
						showRegenerate && /* @__PURE__ */ jsx(PasswordConfirmForm, {
							action: "/admin/account/two-factor/recovery-codes",
							label: "Create new codes",
							onDone: () => setShowRegenerate(false)
						}),
						showDisable && /* @__PURE__ */ jsx(PasswordConfirmForm, {
							action: "/admin/account/two-factor",
							method: "delete",
							label: "Turn off two-factor",
							variant: "danger",
							onDone: () => setShowDisable(false)
						})
					]
				})
			]
		})
	});
}
function SessionsPanel({ sessions }) {
	const { errors } = usePage().props;
	const [request, confirm, cancel, run] = useConfirm();
	const [showSignOutOthers, setShowSignOutOthers] = useState(false);
	const others = sessions.filter((session) => !session.current).length;
	const revoke = (session) => confirm({
		title: `Sign out ${session.device}?`,
		body: "That browser will need your password again.",
		confirmLabel: "Sign out",
		action: () => router.delete(`/admin/account/sessions/${session.id}`, { preserveScroll: true })
	});
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Where you're signed in",
		description: "Sign out any browser you do not recognise, then change your password.",
		action: others > 0 && /* @__PURE__ */ jsx(Button, {
			type: "button",
			variant: "secondary",
			onClick: () => setShowSignOutOthers((v) => !v),
			children: "Sign out others"
		}),
		children: [
			showSignOutOthers && /* @__PURE__ */ jsx("div", {
				className: "mb-4",
				children: /* @__PURE__ */ jsx(PasswordConfirmForm, {
					action: "/admin/account/sessions",
					method: "delete",
					label: `Sign out ${others} other${others === 1 ? "" : "s"}`,
					variant: "danger",
					onDone: () => setShowSignOutOthers(false)
				})
			}),
			errors?.session && /* @__PURE__ */ jsx("p", {
				className: "mb-3 text-[12px] text-[#ff6b6b]",
				children: errors.session
			}),
			sessions.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No tracked sessions yet." }) : /* @__PURE__ */ jsx("ul", {
				className: "divide-y divide-[var(--line)]",
				children: sessions.map((session) => /* @__PURE__ */ jsxs("li", {
					className: "flex items-center justify-between gap-3 py-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsxs("p", {
							className: "text-[13px] font-semibold text-[var(--ink)]",
							children: [session.device, session.current && /* @__PURE__ */ jsx("span", {
								className: "ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-3)]",
								children: "This browser"
							})]
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-0.5 text-[12px] text-[var(--mute)]",
							children: [
								session.ip ?? "Unknown IP",
								" · active ",
								session.lastActive ?? "never"
							]
						})]
					}), !session.current && /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "dangerGhost",
						className: "!px-2 !py-1",
						onClick: () => revoke(session),
						children: "Sign out"
					})]
				}, session.id))
			}),
			/* @__PURE__ */ jsx(ConfirmDialog, {
				open: !!request,
				title: request?.title ?? "",
				body: request?.body,
				confirmLabel: request?.confirmLabel,
				onConfirm: run,
				onCancel: cancel
			})
		]
	});
}
function AccountSecurity({ account, twoFactor, recoveryCodes, sessions }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "My Security | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "My security",
			subtitle: `${account.name} · ${account.email} · ${account.role}`,
			children: account.lastLoginAt && /* @__PURE__ */ jsxs("p", {
				className: "text-[12px] text-[var(--ink-faint)]",
				children: [
					"Last sign-in ",
					account.lastLoginAt,
					account.lastLoginIp && ` from ${account.lastLoginIp}`
				]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-6 xl:grid-cols-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsx(TwoFactorPanel, {
					twoFactor,
					recoveryCodes
				}), /* @__PURE__ */ jsx(PasswordPanel, {})]
			}), /* @__PURE__ */ jsx(SessionsPanel, { sessions })]
		})
	] });
}
AccountSecurity.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { AccountSecurity as default };
