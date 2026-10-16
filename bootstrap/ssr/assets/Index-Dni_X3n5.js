import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { _ as useConfirm, c as PageHeader, f as Select, i as ConfirmDialog, l as Panel, n as Button, o as Field, s as Input } from "./ui-DUoJPW2G.js";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Users/Index.jsx
function UsersIndex({ users, roles }) {
	const currentUser = usePage().props.auth?.user;
	const [request, confirm, cancel, run] = useConfirm();
	const superAdmins = users.filter((u) => u.role === "super_admin").length;
	const { data, setData, post, processing, errors, reset } = useForm({
		name: "",
		email: "",
		role: "editor"
	});
	const submit = (e) => {
		e.preventDefault();
		post("/admin/users", {
			preserveScroll: true,
			onSuccess: () => reset()
		});
	};
	const changeRole = (user, role) => {
		router.put(`/admin/users/${user.id}`, {
			name: user.name,
			email: user.email,
			role
		}, { preserveScroll: true });
	};
	const askDelete = (user) => {
		confirm({
			title: `Delete ${user.name}?`,
			body: "Their admin access is removed immediately. This cannot be undone.",
			action: () => router.delete(`/admin/users/${user.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Admins | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Admins",
			subtitle: "Editors manage content. Super admins also manage settings and other admins."
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "lg:col-span-2",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						className: "overflow-hidden",
						children: /* @__PURE__ */ jsx("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full min-w-[600px] text-left text-[13px]",
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
											children: "Added"
										}),
										/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
									]
								}) }), /* @__PURE__ */ jsx("tbody", { children: users.map((user) => {
									const isSelf = user.id === currentUser?.id;
									const isLastSuperAdmin = user.role === "super_admin" && superAdmins === 1;
									return /* @__PURE__ */ jsxs("tr", {
										className: "border-t border-[var(--line)]",
										children: [
											/* @__PURE__ */ jsxs("td", {
												className: "py-3 pr-4",
												children: [/* @__PURE__ */ jsxs("p", {
													className: "font-semibold text-[var(--ink)]",
													children: [user.name, isSelf && /* @__PURE__ */ jsx("span", {
														className: "ml-2 text-[11px] text-[var(--ink-faint)]",
														children: "(you)"
													})]
												}), /* @__PURE__ */ jsx("p", {
													className: "text-[12px] text-[var(--ink-faint)]",
													children: user.email
												})]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 pr-4",
												children: /* @__PURE__ */ jsx(Select, {
													value: user.role,
													onChange: (e) => changeRole(user, e.target.value),
													disabled: isLastSuperAdmin,
													"aria-label": `Role for ${user.name}`,
													className: "max-w-[160px]",
													children: roles.map((role) => /* @__PURE__ */ jsx("option", {
														value: role.value,
														children: role.label
													}, role.value))
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 pr-4 whitespace-nowrap text-[var(--mute)]",
												children: user.createdAt
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 text-right",
												children: /* @__PURE__ */ jsx("button", {
													onClick: () => askDelete(user),
													disabled: isSelf || isLastSuperAdmin,
													title: isSelf ? "You cannot delete your own account" : isLastSuperAdmin ? "At least one super admin must remain" : void 0,
													className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30",
													children: "Delete"
												})
											})
										]
									}, user.id);
								}) })]
							})
						})
					}),
					errors.role && /* @__PURE__ */ jsx("p", {
						className: "mt-3 text-[12px] text-[#ff6b6b]",
						children: errors.role
					}),
					errors.user && /* @__PURE__ */ jsx("p", {
						className: "mt-3 text-[12px] text-[#ff6b6b]",
						children: errors.user
					})
				]
			}), /* @__PURE__ */ jsx(Panel, {
				title: "Invite an admin",
				description: "A temporary password is shown once after creating.",
				children: /* @__PURE__ */ jsxs("form", {
					onSubmit: submit,
					className: "space-y-5",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Name",
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
							error: errors.role,
							required: true,
							children: /* @__PURE__ */ jsx(Select, {
								value: data.role,
								onChange: (e) => setData("role", e.target.value),
								children: roles.map((role) => /* @__PURE__ */ jsx("option", {
									value: role.value,
									children: role.label
								}, role.value))
							})
						}),
						/* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: processing,
							className: "w-full",
							children: processing ? "Creating…" : "Create admin"
						})
					]
				})
			})]
		}),
		/* @__PURE__ */ jsx(ConfirmDialog, {
			open: !!request,
			title: request?.title ?? "",
			body: request?.body,
			onConfirm: run,
			onCancel: cancel
		})
	] });
}
UsersIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { UsersIndex as default };
