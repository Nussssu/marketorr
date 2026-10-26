import { n as Button, o as Field, s as Input } from "./ui-Dz4ZqU85.js";
import { t as AuthCard } from "./AuthCard-C5xoFFCA.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Auth/ResetPassword.jsx
function ResetPassword({ token, email }) {
	const { data, setData, post, processing, errors } = useForm({
		token,
		email: email ?? "",
		password: "",
		password_confirmation: ""
	});
	const submit = (e) => {
		e.preventDefault();
		post("/admin/reset-password");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Reset password | Marketorr" }), /* @__PURE__ */ jsx(AuthCard, {
		title: "New password",
		subtitle: "Choose a new password. Every browser signed in to this account is signed out.",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "space-y-5",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Email",
					error: errors.email,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						type: "email",
						value: data.email,
						onChange: (e) => setData("email", e.target.value),
						autoComplete: "username"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "New password",
					error: errors.password,
					hint: "At least 10 characters, with letters and numbers.",
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						type: "password",
						value: data.password,
						onChange: (e) => setData("password", e.target.value),
						autoComplete: "new-password",
						autoFocus: true
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Confirm password",
					error: errors.password_confirmation,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						type: "password",
						value: data.password_confirmation,
						onChange: (e) => setData("password_confirmation", e.target.value),
						autoComplete: "new-password"
					})
				}),
				/* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					className: "w-full",
					children: processing ? "Saving…" : "Set password →"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-center text-[12px]",
					children: /* @__PURE__ */ jsx(Link, {
						href: "/admin/login",
						className: "text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: "Back to sign in"
					})
				})
			]
		})
	})] });
}
ResetPassword.layout = (page) => page;
//#endregion
export { ResetPassword as default };
