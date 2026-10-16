import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/admin/AdminLayout.jsx
/**
* Grouped so the panel stays readable as the module count grows: content an
* editor touches daily first, configuration a super admin touches rarely last.
*/
var NAV = [
	{
		group: "OVERVIEW",
		items: [{
			label: "Dashboard",
			href: "/admin/dashboard",
			exactMatch: true,
			matches: ["/admin/dashboard", "/admin"]
		}]
	},
	{
		group: "LEADS",
		items: [{
			label: "Inbox",
			href: "/admin/inbox",
			matches: [
				"/admin/inbox",
				"/admin/leads",
				"/admin/inquiries"
			]
		}]
	},
	{
		group: "CONTENT MANAGEMENT",
		items: [
			{
				label: "Pages",
				href: "/admin/pages"
			},
			{
				label: "Projects",
				href: "/admin/projects"
			},
			{
				label: "Services",
				href: "/admin/sub-services"
			},
			{
				label: "Media Library",
				href: "/admin/media"
			},
			{
				label: "Menus",
				href: "/admin/menus"
			}
		]
	},
	{
		group: "SYSTEM & ADMINISTRATION",
		items: [
			{
				label: "User Management",
				href: "/admin/users",
				superAdminOnly: true
			},
			{
				label: "Email & SMTP",
				href: "/admin/email-smtp",
				superAdminOnly: true,
				matches: [
					"/admin/email-smtp",
					"/admin/mail",
					"/admin/email-templates",
					"/admin/settings/email"
				]
			},
			{
				label: "Settings",
				href: "/admin/settings",
				superAdminOnly: true
			},
			{
				label: "Custom Code",
				href: "/admin/custom-code",
				superAdminOnly: true
			},
			{
				label: "Audit Logs",
				href: "/admin/audit-logs"
			}
		]
	}
];
function isActive(url, item) {
	const path = url.split("?")[0];
	if (item.exactMatch) {
		if (item.matches) return item.matches.some((exact) => path === exact);
		return path === item.href;
	}
	if (item.matches) return item.matches.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
	return path === item.href || path.startsWith(item.href + "/");
}
/**
* Dense, functional chrome for the admin panel — deliberately free of the
* marketing site's cursor, parallax and scroll effects.
*/
function AdminLayout({ children }) {
	const { url, props } = usePage();
	const user = props.auth?.user;
	const flash = props.flash?.success;
	const [open, setOpen] = useState(false);
	const [notice, setNotice] = useState(flash);
	useEffect(() => {
		setNotice(flash);
		if (!flash) return void 0;
		const timer = setTimeout(() => setNotice(null), 6e3);
		return () => clearTimeout(timer);
	}, [flash]);
	useEffect(() => {
		setOpen(false);
	}, [url]);
	const groups = NAV.map((group) => ({
		...group,
		items: group.items.filter((item) => !item.superAdminOnly || user?.isSuperAdmin)
	})).filter((group) => group.items.length > 0);
	const logout = () => router.post("/admin/logout");
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-svh bg-[var(--bg)] text-[var(--ink)]",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "sticky top-0 z-40 border-b border-slate-800 bg-slate-900 lg:hidden",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "font-display text-[15px] font-extrabold tracking-tight text-white",
						children: [
							"MARKETORR",
							/* @__PURE__ */ jsx("span", {
								className: "text-[var(--brand-3)]",
								children: "."
							}),
							" Admin"
						]
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => setOpen((v) => !v),
						"aria-expanded": open,
						className: "rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-200 hover:bg-slate-800",
						children: open ? "Close" : "Menu"
					})]
				})
			}),
			open && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
				onClick: () => setOpen(false),
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ jsxs("aside", {
				className: `fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800/60 bg-[#0b0f19] text-slate-300 transition-transform duration-200 ease-in-out lg:z-30 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex h-16 shrink-0 items-center justify-between border-b border-slate-800/40 px-4",
						children: [/* @__PURE__ */ jsxs(Link, {
							href: "/admin",
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsxs("svg", {
								width: "18",
								height: "20",
								viewBox: "0 0 18 20",
								fill: "none",
								xmlns: "http://www.w3.org/2000/svg",
								className: "shrink-0",
								"aria-hidden": "true",
								children: [
									/* @__PURE__ */ jsxs("defs", { children: [
										/* @__PURE__ */ jsxs("linearGradient", {
											id: "brand-bar-purple",
											x1: "0",
											y1: "0",
											x2: "0",
											y2: "1",
											children: [/* @__PURE__ */ jsx("stop", {
												offset: "0%",
												stopColor: "#A855F7"
											}), /* @__PURE__ */ jsx("stop", {
												offset: "100%",
												style: { stopColor: "var(--brand-1)" }
											})]
										}),
										/* @__PURE__ */ jsxs("linearGradient", {
											id: "brand-bar-blue",
											x1: "0",
											y1: "0",
											x2: "0",
											y2: "1",
											children: [/* @__PURE__ */ jsx("stop", {
												offset: "0%",
												stopColor: "#60A5FA"
											}), /* @__PURE__ */ jsx("stop", {
												offset: "100%",
												style: { stopColor: "var(--brand-2)" }
											})]
										}),
										/* @__PURE__ */ jsxs("linearGradient", {
											id: "brand-bar-cyan",
											x1: "0",
											y1: "0",
											x2: "0",
											y2: "1",
											children: [/* @__PURE__ */ jsx("stop", {
												offset: "0%",
												stopColor: "#22D3EE"
											}), /* @__PURE__ */ jsx("stop", {
												offset: "100%",
												style: { stopColor: "var(--brand-3)" }
											})]
										})
									] }),
									/* @__PURE__ */ jsx("rect", {
										x: "0.5",
										y: "10",
										width: "3.8",
										height: "10",
										rx: "1.9",
										fill: "url(#brand-bar-purple)"
									}),
									/* @__PURE__ */ jsx("rect", {
										x: "6.8",
										y: "5",
										width: "3.8",
										height: "15",
										rx: "1.9",
										fill: "url(#brand-bar-blue)"
									}),
									/* @__PURE__ */ jsx("rect", {
										x: "13.1",
										y: "0",
										width: "3.8",
										height: "20",
										rx: "1.9",
										fill: "url(#brand-bar-cyan)"
									})
								]
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-display text-[15px] font-extrabold tracking-tight text-white",
								children: ["MARKETORR", /* @__PURE__ */ jsx("span", {
									className: "text-[var(--brand-3)]",
									children: "."
								})]
							})]
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setOpen(false),
							className: "rounded-lg p-1 text-slate-400 hover:text-slate-100 lg:hidden",
							"aria-label": "Close sidebar",
							children: "✕"
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex-1 overflow-y-auto min-h-0 py-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800/80 [&::-webkit-scrollbar-thumb]:rounded-full",
						children: /* @__PURE__ */ jsx("nav", {
							className: "flex flex-col space-y-3",
							"aria-label": "Admin",
							children: groups.map((group) => /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ jsx("p", {
									className: "px-3.5 pt-2.5 pb-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase",
									children: group.group
								}), /* @__PURE__ */ jsx("div", {
									className: "space-y-0.5",
									children: group.items.map((item) => {
										const active = isActive(url, item);
										return /* @__PURE__ */ jsx(Link, {
											href: item.href,
											"aria-current": active ? "page" : void 0,
											className: `flex items-center rounded-md mx-2 px-3.5 py-2 text-sm font-medium transition-all ${active ? "bg-slate-800/50 text-white" : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"}`,
											children: /* @__PURE__ */ jsx("span", { children: item.label })
										}, item.href);
									})
								})]
							}, group.group))
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "shrink-0 border-t border-slate-800/60 bg-[#090d16] p-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "mb-3 px-1",
							children: /* @__PURE__ */ jsx("p", {
								className: "truncate text-xs font-semibold text-slate-200",
								children: user?.name || "Marketorr Admin"
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("a", {
								href: "/",
								target: "_blank",
								rel: "noreferrer",
								className: "flex-1 rounded-md border border-slate-800/80 bg-slate-900/60 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200 transition-all",
								children: "View site ↗"
							}), /* @__PURE__ */ jsx("button", {
								onClick: logout,
								className: "flex-1 rounded-md border border-slate-800/80 bg-slate-900/60 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200 transition-all",
								children: "Log out"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex min-h-screen flex-col lg:pl-64",
				children: /* @__PURE__ */ jsx("main", {
					className: "min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10",
					children
				})
			}),
			notice && /* @__PURE__ */ jsxs("div", {
				role: "status",
				className: "fixed bottom-5 right-5 z-[200] flex max-w-sm items-start gap-3 rounded-xl border border-[var(--brand-3)]/40 bg-[var(--surface)] px-4 py-3 text-[13px] text-[var(--ink)] shadow-2xl",
				children: [
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						className: "mt-0.5 text-[var(--brand-3)]",
						children: "✓"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "flex-1",
						children: notice
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setNotice(null),
						"aria-label": "Dismiss",
						className: "text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: "×"
					})
				]
			})
		]
	});
}
//#endregion
export { AdminLayout as t };
