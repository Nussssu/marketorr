import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { a as EmptyState, b as tabClass, c as PageHeader, f as Select, g as Textarea, h as TAB_GRADIENT, i as ConfirmDialog, l as Panel, m as TAB_BAR_CLASS, n as Button, o as Field, s as Input, x as useConfirm } from "./ui-Dz4ZqU85.js";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
//#region resources/js/pages/Admin/Users/Index.jsx
var GRADIENT = "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))";
var STATUS_TONES = {
	active: "border-[var(--brand-3)]/40 bg-[var(--brand-3)]/10 text-[var(--brand-3)]",
	invited: "border-[var(--brand-2)]/40 bg-[var(--brand-2)]/10 text-[#6F91FF]",
	suspended: "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]"
};
function StatusPill({ status, children }) {
	return /* @__PURE__ */ jsxs("span", {
		className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${STATUS_TONES[status] ?? STATUS_TONES.invited}`,
		children: [/* @__PURE__ */ jsx("span", {
			className: "h-1.5 w-1.5 rounded-full bg-current",
			"aria-hidden": true
		}), children]
	});
}
function Avatar({ name }) {
	const initials = (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
	return /* @__PURE__ */ jsx("span", {
		className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold text-white",
		style: { background: GRADIENT },
		"aria-hidden": true,
		children: initials
	});
}
/**
* A centred popup for a focused task (invite, edit, sessions, activity,
* role editor), with the list dimmed behind it.
*/
function Popup({ open, title, description, onClose, children, footer, wide = false }) {
	useEffect(() => {
		if (!open) return void 0;
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);
	if (!open) return null;
	return createPortal(/* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[150] flex items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Close popup",
			onClick: onClose,
			className: "absolute inset-0 bg-black/60 backdrop-blur-[2px]"
		}), /* @__PURE__ */ jsxs("aside", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			className: `relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`,
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "h-1 shrink-0",
					style: { background: GRADIENT },
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsxs("header", {
					className: "flex shrink-0 items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[17px] font-extrabold text-[var(--ink-strong)]",
							children: title
						}), description && /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[12px] text-[var(--mute)]",
							children: description
						})]
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]",
						children: "✕"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-6 py-5",
					children
				}),
				footer && /* @__PURE__ */ jsx("footer", {
					className: "shrink-0 border-t border-[var(--line)] px-6 py-4",
					children: footer
				})
			]
		})]
	}), document.body);
}
/** Stroke icons for the row's action menu. */
var MENU_ICONS = {
	edit: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" }), /* @__PURE__ */ jsx("path", { d: "m13.5 6.5 4 4" })] }),
	sessions: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
		x: "3",
		y: "4.5",
		width: "18",
		height: "12",
		rx: "2"
	}), /* @__PURE__ */ jsx("path", { d: "M8.5 20h7M12 16.5V20" })] }),
	activity: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "12",
		r: "8.5"
	}), /* @__PURE__ */ jsx("path", { d: "M12 7.5V12l3 2" })] }),
	invite: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
		x: "3",
		y: "5.5",
		width: "18",
		height: "13",
		rx: "2"
	}), /* @__PURE__ */ jsx("path", { d: "m3.5 7 8.5 6 8.5-6" })] }),
	password: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("circle", {
		cx: "8",
		cy: "14",
		r: "3.5"
	}), /* @__PURE__ */ jsx("path", { d: "m10.5 11.5 8-8M16 6l2.5 2.5M14 8l2 2" })] }),
	twoFactor: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5Z" }), /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" })] }),
	suspend: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "12",
		r: "8.5"
	}), /* @__PURE__ */ jsx("path", { d: "M10 9v6M14 9v6" })] }),
	reactivate: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "12",
		r: "8.5"
	}), /* @__PURE__ */ jsx("path", { d: "m10 8.5 5 3.5-5 3.5v-7Z" })] }),
	delete: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" }), /* @__PURE__ */ jsx("path", { d: "M10 11.5v5M14 11.5v5" })] })
};
function MenuIcon({ name }) {
	return /* @__PURE__ */ jsx("svg", {
		"aria-hidden": "true",
		className: "h-4 w-4 shrink-0",
		fill: "none",
		viewBox: "0 0 24 24",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: MENU_ICONS[name]
	});
}
/**
* A row's actions as icon buttons, each with a tooltip naming it.
*/
function RowActions({ user, items }) {
	const actions = items.filter((item) => item && item !== "divider");
	return /* @__PURE__ */ jsx("div", {
		className: "flex items-center justify-end gap-1",
		children: actions.map((item) => /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: item.onClick,
			disabled: item.disabled,
			title: item.disabled ? `${item.label}: ${item.reason}` : item.label,
			"aria-label": `${item.label}: ${user.name}`,
			className: `inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${item.danger ? "text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10" : "text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"}`,
			children: /* @__PURE__ */ jsx(MenuIcon, { name: item.icon })
		}, item.label))
	});
}
function StatTile({ label, value, accent }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-x-0 top-0 h-0.5",
				style: { background: accent ?? GRADIENT },
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--mute)]",
				children: label
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 font-display text-2xl font-black text-[var(--ink-strong)]",
				children: value
			})
		]
	});
}
/** JSON from one of the panel's read-only endpoints (sessions, activity). */
function useJson(url, key) {
	const [state, setState] = useState({
		loading: false,
		data: [],
		error: null
	});
	const load = useCallback(() => {
		if (!url) return void 0;
		const controller = new AbortController();
		setState((current) => ({
			...current,
			loading: true,
			error: null
		}));
		fetch(url, {
			headers: {
				Accept: "application/json",
				"X-Requested-With": "XMLHttpRequest"
			},
			signal: controller.signal
		}).then((response) => {
			if (!response.ok) throw new Error(`Request failed (${response.status})`);
			return response.json();
		}).then((json) => setState({
			loading: false,
			data: json[key] ?? [],
			error: null
		})).catch((error) => {
			if (error.name !== "AbortError") setState({
				loading: false,
				data: [],
				error: "Could not load this right now."
			});
		});
		return () => controller.abort();
	}, [url, key]);
	useEffect(() => load(), [load]);
	return [state, load];
}
/** Role <option>s, returned as elements so ThemedSelect can read them. */
function roleOptions(roles) {
	return roles.map((role) => /* @__PURE__ */ jsx("option", {
		value: role.value,
		children: role.label
	}, role.value));
}
function InvitePanel({ open, onClose, roles }) {
	const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
		name: "",
		email: "",
		role: roles.find((role) => role.value === "editor")?.value ?? roles[0]?.value ?? ""
	});
	const close = () => {
		reset();
		clearErrors();
		onClose();
	};
	const submit = (event) => {
		event.preventDefault();
		post("/admin/users", {
			preserveScroll: true,
			onSuccess: close
		});
	};
	const selected = roles.find((role) => role.value === data.role);
	return /* @__PURE__ */ jsx(Popup, {
		open,
		onClose: close,
		title: "Invite an admin",
		description: "They get a secure, single-use link by email to set their own password. The link expires in 7 days.",
		footer: /* @__PURE__ */ jsxs("div", {
			className: "flex justify-end gap-3",
			children: [/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "secondary",
				onClick: close,
				children: "Cancel"
			}), /* @__PURE__ */ jsx(Button, {
				type: "submit",
				form: "invite-admin",
				disabled: processing,
				children: processing ? "Sending…" : "Send invitation"
			})]
		}),
		children: /* @__PURE__ */ jsxs("form", {
			id: "invite-admin",
			onSubmit: submit,
			className: "space-y-5",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Full name",
					error: errors.name,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.name,
						onChange: (e) => setData("name", e.target.value),
						autoFocus: true
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Work email",
					error: errors.email,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						type: "email",
						value: data.email,
						onChange: (e) => setData("email", e.target.value)
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Role",
					error: errors.role,
					required: true,
					children: /* @__PURE__ */ jsx(Select, {
						value: data.role,
						onChange: (e) => setData("role", e.target.value),
						children: roleOptions(roles)
					})
				}),
				selected && /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 text-[12px] text-[var(--mute)]",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-semibold text-[var(--ink)]",
							children: selected.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1",
							children: selected.description || "No description."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[11px] text-[var(--ink-faint)]",
							children: selected.isSuperAdmin ? "Full access, including users, roles and custom code." : `${selected.permissions.length} permission${selected.permissions.length === 1 ? "" : "s"} granted.`
						})
					]
				})
			]
		})
	});
}
function EditPanel({ user, onClose, roles }) {
	const { data, setData, put, processing, errors, clearErrors } = useForm({
		name: user?.name ?? "",
		email: user?.email ?? "",
		role: user?.role ?? ""
	});
	useEffect(() => {
		if (user) {
			setData({
				name: user.name,
				email: user.email,
				role: user.role
			});
			clearErrors();
		}
	}, [user?.id]);
	const submit = (event) => {
		event.preventDefault();
		put(`/admin/users/${user.id}`, {
			preserveScroll: true,
			onSuccess: onClose
		});
	};
	const roleLocked = user?.isSelf || user?.isPrimary;
	return /* @__PURE__ */ jsx(Popup, {
		open: !!user,
		onClose,
		title: `Edit ${user?.name ?? "admin"}`,
		description: "Change their name, email or role. Role changes apply on their next page load.",
		footer: /* @__PURE__ */ jsxs("div", {
			className: "flex justify-end gap-3",
			children: [/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "secondary",
				onClick: onClose,
				children: "Cancel"
			}), /* @__PURE__ */ jsx(Button, {
				type: "submit",
				form: "edit-admin",
				disabled: processing,
				children: processing ? "Saving…" : "Save changes"
			})]
		}),
		children: user && /* @__PURE__ */ jsxs("form", {
			id: "edit-admin",
			onSubmit: submit,
			className: "space-y-5",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Full name",
					error: errors.name,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.name,
						onChange: (e) => setData("name", e.target.value)
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Email",
					error: errors.email,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						type: "email",
						value: data.email,
						onChange: (e) => setData("email", e.target.value)
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Role",
					error: errors.role || errors.user,
					hint: user.isPrimary ? "The primary Super Admin always stays a Super Admin." : user.isSelf ? "You cannot change your own role." : void 0,
					required: true,
					children: /* @__PURE__ */ jsx(Select, {
						value: data.role,
						onChange: (e) => setData("role", e.target.value),
						disabled: roleLocked,
						children: roleOptions(roles)
					})
				}),
				/* @__PURE__ */ jsxs("dl", {
					className: "grid grid-cols-2 gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 text-[12px]",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
							className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: "Status"
						}), /* @__PURE__ */ jsx("dd", {
							className: "mt-1",
							children: /* @__PURE__ */ jsx(StatusPill, {
								status: user.status,
								children: user.statusLabel
							})
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
							className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: "Two-factor"
						}), /* @__PURE__ */ jsx("dd", {
							className: "mt-1 text-[var(--ink)]",
							children: user.twoFactor ? "On" : "Off"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
							className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: "Last sign-in"
						}), /* @__PURE__ */ jsx("dd", {
							className: "mt-1 text-[var(--ink)]",
							children: user.lastLoginAt ?? "Never"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
							className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: "Added"
						}), /* @__PURE__ */ jsxs("dd", {
							className: "mt-1 text-[var(--ink)]",
							children: [user.createdAt, user.invitedBy && /* @__PURE__ */ jsxs("span", {
								className: "text-[var(--ink-faint)]",
								children: [" by ", user.invitedBy]
							})]
						})] })
					]
				})
			]
		})
	});
}
function SessionsPanel({ user, onClose, confirm }) {
	const [{ loading, data: sessions, error }, reload] = useJson(user ? `/admin/users/${user.id}/sessions` : null, "sessions");
	const revoke = (session) => router.delete(`/admin/users/${user.id}/sessions/${session.id}`, {
		preserveScroll: true,
		onSuccess: () => reload()
	});
	const revokeAll = () => confirm({
		title: `Sign ${user.name} out everywhere?`,
		body: user.isSelf ? "Every other browser is signed out. This one stays signed in." : "Every browser they are signed in on is signed out immediately.",
		confirmLabel: "Sign out all",
		action: () => router.delete(`/admin/users/${user.id}/sessions`, {
			preserveScroll: true,
			onSuccess: () => reload()
		})
	});
	const locked = user?.protected;
	return /* @__PURE__ */ jsxs(Popup, {
		open: !!user,
		onClose,
		title: "Active sessions",
		description: user ? `Browsers ${user.isSelf ? "you are" : `${user.name} is`} signed in on.` : void 0,
		footer: /* @__PURE__ */ jsxs("div", {
			className: "flex justify-between gap-3",
			children: [/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "secondary",
				onClick: onClose,
				children: "Close"
			}), /* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "danger",
				onClick: revokeAll,
				disabled: locked || sessions.length === 0,
				children: "Sign out all"
			})]
		}),
		children: [
			locked && /* @__PURE__ */ jsx("p", {
				className: "mb-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-[12px] text-[var(--mute)]",
				children: "Only the primary Super Admin can end their own sessions."
			}),
			loading && /* @__PURE__ */ jsx("p", {
				className: "py-8 text-center text-[13px] text-[var(--mute)]",
				children: "Loading sessions…"
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "py-8 text-center text-[13px] text-[#ff6b6b]",
				children: error
			}),
			!loading && !error && sessions.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No active sessions." }),
			/* @__PURE__ */ jsx("ul", {
				className: "space-y-3",
				children: sessions.map((session) => /* @__PURE__ */ jsxs("li", {
					className: "flex items-start justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ jsxs("p", {
								className: "text-[13px] font-semibold text-[var(--ink)]",
								children: [session.device, session.current && /* @__PURE__ */ jsx("span", {
									className: "ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-3)]",
									children: "This browser"
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-[12px] text-[var(--mute)]",
								children: [
									session.ip ?? "Unknown IP",
									" · active ",
									session.lastActive ?? "never"
								]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-0.5 text-[11px] text-[var(--ink-faint)]",
								children: ["Started ", session.startedAt]
							})
						]
					}), !session.current && /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "dangerGhost",
						className: "!px-2 !py-1",
						onClick: () => revoke(session),
						disabled: locked,
						children: "Sign out"
					})]
				}, session.id))
			})
		]
	});
}
function ActivityPanel({ user, onClose }) {
	const [{ loading, data: activity, error }] = useJson(user ? `/admin/users/${user.id}/activity` : null, "activity");
	return /* @__PURE__ */ jsxs(Popup, {
		open: !!user,
		onClose,
		title: "Activity",
		description: user ? `The latest 50 account events for and by ${user.name}.` : void 0,
		wide: true,
		children: [
			loading && /* @__PURE__ */ jsx("p", {
				className: "py-8 text-center text-[13px] text-[var(--mute)]",
				children: "Loading activity…"
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "py-8 text-center text-[13px] text-[#ff6b6b]",
				children: error
			}),
			!loading && !error && activity.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No activity recorded yet." }),
			/* @__PURE__ */ jsx("ol", {
				className: "relative space-y-4 border-l border-[var(--line)] pl-5",
				children: activity.map((entry) => /* @__PURE__ */ jsxs("li", {
					className: "relative",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: `absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[var(--surface)] ${entry.warning ? "bg-[#ff6b6b]" : "bg-[var(--brand-3)]"}`,
							"aria-hidden": true
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-[13px] font-semibold text-[var(--ink)]",
							children: [entry.label, entry.subject && entry.subject !== user?.name && /* @__PURE__ */ jsxs("span", {
								className: "font-normal text-[var(--mute)]",
								children: [" · ", entry.subject]
							})]
						}),
						entry.details && /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 break-words text-[12px] text-[var(--mute)]",
							children: entry.details
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-0.5 text-[11px] text-[var(--ink-faint)]",
							title: entry.at,
							children: [
								entry.ago,
								entry.actor && ` · by ${entry.actor}`,
								entry.ip && ` · ${entry.ip}`
							]
						})
					]
				}, entry.id))
			})
		]
	});
}
function RolePanel({ role, sections, onClose }) {
	const isNew = role === "new";
	const current = isNew ? null : role;
	const readOnly = !!current?.isSuperAdmin;
	const { data, setData, post, put, processing, errors, clearErrors } = useForm({
		name: current?.name ?? "",
		description: current?.description ?? "",
		permissions: current?.permissions ?? []
	});
	useEffect(() => {
		if (role) {
			setData({
				name: current?.name ?? "",
				description: current?.description ?? "",
				permissions: current?.permissions ?? []
			});
			clearErrors();
		}
	}, [role]);
	const has = (key) => data.permissions.includes(key);
	const toggle = (section, action) => {
		const key = `${section.key}.${action}`;
		let next = data.permissions.filter((permission) => permission !== key);
		if (!has(key)) {
			next = [...next, key];
			if (action === "manage" && !next.includes(`${section.key}.view`)) next.push(`${section.key}.view`);
		} else if (action === "view") next = next.filter((permission) => permission !== `${section.key}.manage`);
		setData("permissions", next);
	};
	const setAll = (on) => setData("permissions", on ? sections.flatMap((section) => section.actions.map((action) => `${section.key}.${action}`)) : []);
	const submit = (event) => {
		event.preventDefault();
		const options = {
			preserveScroll: true,
			onSuccess: onClose
		};
		isNew ? post("/admin/roles", options) : put(`/admin/roles/${current.id}`, options);
	};
	return /* @__PURE__ */ jsx(Popup, {
		open: !!role,
		onClose,
		wide: true,
		title: isNew ? "New role" : readOnly ? current.name : `Edit ${current?.name ?? "role"}`,
		description: readOnly ? "Super Admins always hold every permission, plus users, roles and custom code." : "Choose what this role can see and change. Manage includes view. The server enforces every permission.",
		footer: /* @__PURE__ */ jsxs("div", {
			className: "flex justify-end gap-3",
			children: [/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "secondary",
				onClick: onClose,
				children: readOnly ? "Close" : "Cancel"
			}), !readOnly && /* @__PURE__ */ jsx(Button, {
				type: "submit",
				form: "role-editor",
				disabled: processing,
				children: processing ? "Saving…" : isNew ? "Create role" : "Save role"
			})]
		}),
		children: /* @__PURE__ */ jsxs("form", {
			id: "role-editor",
			onSubmit: submit,
			className: "space-y-5",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ jsx(Field, {
					label: "Role name",
					error: errors.name,
					hint: current?.isSystem && !readOnly ? "System role names cannot change." : void 0,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.name,
						onChange: (e) => setData("name", e.target.value),
						disabled: readOnly || current?.isSystem
					})
				}), /* @__PURE__ */ jsx(Field, {
					label: "Description",
					error: errors.description,
					children: /* @__PURE__ */ jsx(Textarea, {
						rows: 1,
						value: data.description ?? "",
						onChange: (e) => setData("description", e.target.value),
						disabled: readOnly
					})
				})]
			}), /* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
						children: "Permissions"
					}), !readOnly && /* @__PURE__ */ jsxs("div", {
						className: "flex gap-3 text-[11px] font-bold uppercase tracking-[0.14em]",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setAll(true),
							className: "text-[var(--ink-faint)] hover:text-[var(--ink)]",
							children: "Grant all"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setAll(false),
							className: "text-[var(--ink-faint)] hover:text-[var(--ink)]",
							children: "Clear"
						})]
					})]
				}),
				errors.permissions && /* @__PURE__ */ jsx("p", {
					className: "mb-2 text-[12px] text-[#ff6b6b]",
					children: errors.permissions
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "overflow-hidden rounded-lg border border-[var(--line)]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-[1fr_64px_72px] gap-2 border-b border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("span", { children: "Section" }),
							/* @__PURE__ */ jsx("span", {
								className: "text-center",
								children: "View"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-center",
								children: "Manage"
							})
						]
					}), sections.map((section) => /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-[1fr_64px_72px] items-center gap-2 border-b border-[var(--line)] px-4 py-3 last:border-b-0",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-[13px] font-semibold text-[var(--ink)]",
								children: section.label
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-[11px] text-[var(--ink-faint)]",
								children: section.description
							})]
						}), ["view", "manage"].map((action) => /* @__PURE__ */ jsx("div", {
							className: "flex justify-center",
							children: section.actions.includes(action) ? /* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: readOnly || has(`${section.key}.${action}`),
								onChange: () => toggle(section, action),
								disabled: readOnly,
								"aria-label": `${section.label}: ${action}`,
								className: "h-4 w-4 cursor-pointer accent-[var(--brand-2)] disabled:cursor-not-allowed"
							}) : /* @__PURE__ */ jsx("span", {
								className: "text-[var(--ink-faint)]",
								"aria-hidden": true,
								children: "—"
							})
						}, action))]
					}, section.key))]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[11px] text-[var(--ink-faint)]",
					children: "User Management and Custom Code are always limited to Super Admins."
				})
			] })]
		})
	});
}
function RolesTab({ roles, sections, onEdit, onDelete }) {
	const total = sections.reduce((sum, section) => sum + section.actions.length, 0);
	return /* @__PURE__ */ jsx("div", {
		className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
		children: roles.map((role) => /* @__PURE__ */ jsxs("article", {
			className: "flex flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-display text-[15px] font-extrabold text-[var(--ink-strong)]",
							children: role.name
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[12px] text-[var(--mute)]",
							children: role.description || "No description."
						})]
					}), role.isSystem && /* @__PURE__ */ jsx("span", {
						className: "shrink-0 rounded-full border border-[var(--field-line)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: "System"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: "h-1.5 overflow-hidden rounded-full bg-[var(--chip)]",
						children: /* @__PURE__ */ jsx("div", {
							className: "h-full rounded-full",
							style: {
								width: `${role.isSuperAdmin ? 100 : Math.round(role.permissions.length / Math.max(total, 1) * 100)}%`,
								background: TAB_GRADIENT.background
							}
						})
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-2 text-[11px] text-[var(--ink-faint)]",
						children: [
							role.isSuperAdmin ? "Full access" : `${role.permissions.length} of ${total} permissions`,
							" · ",
							role.usersCount,
							" ",
							role.usersCount === 1 ? "admin" : "admins"
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-4",
					children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						className: "!px-3 !py-1.5",
						onClick: () => onEdit(role),
						children: role.isSuperAdmin ? "View" : "Edit permissions"
					}), !role.isSystem && /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "dangerGhost",
						className: "!px-3 !py-1.5",
						onClick: () => onDelete(role),
						disabled: role.usersCount > 0,
						title: role.usersCount > 0 ? "Move everyone with this role to another role first" : void 0,
						children: "Delete"
					})]
				})
			]
		}, role.id))
	});
}
function UsersIndex({ users, roles, sections = [], stats = {} }) {
	const { errors } = usePage().props;
	const [request, confirm, cancel, run] = useConfirm();
	const [tab, setTab] = useState("users");
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [inviting, setInviting] = useState(false);
	const [editing, setEditing] = useState(null);
	const [sessionsFor, setSessionsFor] = useState(null);
	const [activityFor, setActivityFor] = useState(null);
	const [roleEditing, setRoleEditing] = useState(null);
	const closeInvite = useCallback(() => setInviting(false), []);
	const closeEdit = useCallback(() => setEditing(null), []);
	const closeSessions = useCallback(() => setSessionsFor(null), []);
	const closeActivity = useCallback(() => setActivityFor(null), []);
	const closeRole = useCallback(() => setRoleEditing(null), []);
	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return users.filter((user) => (roleFilter === "all" || user.role === roleFilter) && (statusFilter === "all" || user.status === statusFilter) && (term === "" || `${user.name} ${user.email} ${user.roleLabel}`.toLowerCase().includes(term)));
	}, [
		users,
		search,
		roleFilter,
		statusFilter
	]);
	const activeSuperAdmins = users.filter((user) => user.isSuperAdmin && user.status === "active").length;
	const pageError = errors?.user || errors?.role;
	const act = (method, url, title, body, confirmLabel) => confirm({
		title,
		body,
		confirmLabel,
		action: () => method === "delete" ? router.delete(url, { preserveScroll: true }) : router[method](url, {}, { preserveScroll: true })
	});
	const menuFor = (user) => {
		const isLastSuperAdmin = user.isSuperAdmin && user.status === "active" && activeSuperAdmins === 1;
		const guarded = user.isSelf || user.isPrimary || isLastSuperAdmin;
		const guardReason = user.isSelf ? "You cannot do this to your own account" : user.isPrimary ? "The primary Super Admin is protected" : "At least one active Super Admin must remain";
		return [
			{
				label: "Edit details & role",
				icon: "edit",
				onClick: () => setEditing(user),
				disabled: user.protected,
				reason: "Only the primary Super Admin can change this account"
			},
			{
				label: "Manage sessions",
				icon: "sessions",
				onClick: () => setSessionsFor(user)
			},
			{
				label: "View activity",
				icon: "activity",
				onClick: () => setActivityFor(user)
			},
			"divider",
			user.status === "invited" && {
				label: "Resend invitation",
				icon: "invite",
				onClick: () => act("post", `/admin/users/${user.id}/invitation`, `Resend the invitation to ${user.name}?`, `A new link goes to ${user.email}. Any earlier invitation link stops working.`, "Resend")
			},
			user.status !== "invited" && {
				label: "Send password reset",
				icon: "password",
				disabled: user.protected,
				reason: "Only the primary Super Admin can change this account",
				onClick: () => act("post", `/admin/users/${user.id}/password-reset`, `Email ${user.name} a password reset link?`, `A link to choose a new password goes to ${user.email}. It expires in 60 minutes, and resetting signs them out everywhere.`, "Send link")
			},
			user.twoFactor && {
				label: "Reset two-factor",
				icon: "twoFactor",
				disabled: user.protected,
				reason: "Only the primary Super Admin can change this account",
				onClick: () => act("delete", `/admin/users/${user.id}/two-factor`, `Reset two-factor for ${user.name}?`, "Their authenticator app stops working for this account and they sign in with their password alone until they set it up again.", "Reset")
			},
			user.status === "suspended" ? {
				label: "Reactivate",
				icon: "reactivate",
				onClick: () => act("patch", `/admin/users/${user.id}/reactivate`, `Reactivate ${user.name}?`, "They can sign in again with their existing password.", "Reactivate")
			} : {
				label: "Suspend",
				icon: "suspend",
				danger: true,
				disabled: guarded,
				reason: guardReason,
				onClick: () => act("patch", `/admin/users/${user.id}/suspend`, `Suspend ${user.name}?`, "They are signed out everywhere and cannot sign in until reactivated. Nothing they made is removed.", "Suspend")
			},
			{
				label: "Delete",
				icon: "delete",
				danger: true,
				disabled: guarded,
				reason: guardReason,
				onClick: () => act("delete", `/admin/users/${user.id}`, `Delete ${user.name}?`, "Their admin access is removed immediately. This cannot be undone. Suspend instead to keep the account.", "Delete")
			}
		];
	};
	const deleteRole = (role) => confirm({
		title: `Delete the "${role.name}" role?`,
		body: "This cannot be undone.",
		action: () => router.delete(`/admin/roles/${role.id}`, { preserveScroll: true })
	});
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "User Management | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "User management",
			subtitle: "Invite admins, control what each role can do, and keep every account secure.",
			children: tab === "users" ? /* @__PURE__ */ jsx(Button, {
				type: "button",
				onClick: () => setInviting(true),
				children: "+ Invite admin"
			}) : /* @__PURE__ */ jsx(Button, {
				type: "button",
				onClick: () => setRoleEditing("new"),
				children: "+ New role"
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6",
			children: [
				/* @__PURE__ */ jsx(StatTile, {
					label: "Total admins",
					value: stats.total ?? users.length
				}),
				/* @__PURE__ */ jsx(StatTile, {
					label: "Active",
					value: stats.active ?? 0,
					accent: "var(--brand-3)"
				}),
				/* @__PURE__ */ jsx(StatTile, {
					label: "Invited",
					value: stats.invited ?? 0,
					accent: "var(--brand-2)"
				}),
				/* @__PURE__ */ jsx(StatTile, {
					label: "Suspended",
					value: stats.suspended ?? 0,
					accent: "#ff6b6b"
				}),
				/* @__PURE__ */ jsx(StatTile, {
					label: "Two-factor on",
					value: `${stats.twoFactor ?? 0}/${stats.total ?? users.length}`,
					accent: "var(--brand-1)"
				}),
				/* @__PURE__ */ jsx(StatTile, {
					label: "Super Admins",
					value: stats.superAdmins ?? 0
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: `${TAB_BAR_CLASS} mb-6 text-[11px] font-bold uppercase tracking-[0.14em]`,
			role: "tablist",
			children: [{
				key: "users",
				label: `Users (${users.length})`
			}, {
				key: "roles",
				label: `Roles & permissions (${roles.length})`
			}].map((item) => /* @__PURE__ */ jsx("button", {
				type: "button",
				role: "tab",
				"aria-selected": tab === item.key,
				onClick: () => setTab(item.key),
				className: tabClass(tab === item.key),
				style: tab === item.key ? TAB_GRADIENT : void 0,
				children: item.label
			}, item.key))
		}),
		pageError && /* @__PURE__ */ jsx("p", {
			role: "alert",
			className: "mb-4 rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-[13px] text-[#ff6b6b]",
			children: pageError
		}),
		tab === "users" ? /* @__PURE__ */ jsxs(Panel, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-4 grid gap-3 md:grid-cols-[1fr_200px_180px]",
				children: [
					/* @__PURE__ */ jsx(Input, {
						type: "search",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search by name, email or role…",
						"aria-label": "Search admins"
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: roleFilter,
						onChange: (e) => setRoleFilter(e.target.value),
						"aria-label": "Filter by role",
						children: [/* @__PURE__ */ jsx("option", {
							value: "all",
							children: "All roles"
						}), roleOptions(roles)]
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: statusFilter,
						onChange: (e) => setStatusFilter(e.target.value),
						"aria-label": "Filter by status",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "active",
								children: "Active"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "invited",
								children: "Invited"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "suspended",
								children: "Suspended"
							})
						]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "-mx-5 overflow-x-auto px-5",
				children: [/* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[940px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Admin"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Role"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "2FA"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Last sign-in"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Sessions"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 font-bold",
								children: /* @__PURE__ */ jsx("span", {
									className: "sr-only",
									children: "Actions"
								})
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: filtered.map((user) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-[var(--line)] align-middle",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx(Avatar, { name: user.name }), /* @__PURE__ */ jsxs("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ jsxs("p", {
											className: "flex flex-wrap items-center gap-2 font-semibold text-[var(--ink)]",
											children: [
												user.name,
												user.isSelf && /* @__PURE__ */ jsx("span", {
													className: "text-[11px] font-normal text-[var(--ink-faint)]",
													children: "(you)"
												}),
												user.isPrimary && /* @__PURE__ */ jsx("span", {
													className: "rounded-full border border-[var(--brand-1)]/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#A855F7]",
													title: "Protected: cannot be suspended, demoted or deleted",
													children: "Primary"
												})
											]
										}), /* @__PURE__ */ jsx("p", {
											className: "truncate text-[12px] text-[var(--ink-faint)]",
											children: user.email
										})]
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--ink)]",
								children: user.roleLabel
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 pr-4",
								children: [/* @__PURE__ */ jsx(StatusPill, {
									status: user.status,
									children: user.statusLabel
								}), user.status === "invited" && user.invitedAt && /* @__PURE__ */ jsxs("p", {
									className: "mt-1 text-[11px] text-[var(--ink-faint)]",
									children: ["Sent ", user.invitedAt]
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx("span", {
									className: `text-[12px] font-semibold ${user.twoFactor ? "text-[var(--brand-3)]" : "text-[var(--ink-faint)]"}`,
									children: user.twoFactor ? "On" : "Off"
								})
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 pr-4 whitespace-nowrap",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-[var(--ink)]",
									title: user.lastLoginAt ?? void 0,
									children: user.lastLogin ?? "Never"
								}), user.lastLoginIp && /* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-[var(--ink-faint)]",
									children: user.lastLoginIp
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: user.sessions
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 text-right",
								children: /* @__PURE__ */ jsx(RowActions, {
									user,
									items: menuFor(user)
								})
							})
						]
					}, user.id)) })]
				}), filtered.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No admins match these filters." })]
			})]
		}) : /* @__PURE__ */ jsx(RolesTab, {
			roles,
			sections,
			onEdit: setRoleEditing,
			onDelete: deleteRole
		}),
		/* @__PURE__ */ jsx(InvitePanel, {
			open: inviting,
			onClose: closeInvite,
			roles
		}),
		/* @__PURE__ */ jsx(EditPanel, {
			user: editing,
			onClose: closeEdit,
			roles
		}),
		/* @__PURE__ */ jsx(SessionsPanel, {
			user: sessionsFor,
			onClose: closeSessions,
			confirm
		}),
		/* @__PURE__ */ jsx(ActivityPanel, {
			user: activityFor,
			onClose: closeActivity
		}),
		/* @__PURE__ */ jsx(RolePanel, {
			role: roleEditing,
			sections,
			onClose: closeRole
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
UsersIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { UsersIndex as default };
