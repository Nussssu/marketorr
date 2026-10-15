import { n as Button, o as Field, s as Input } from "./ui-Dv8OUCCw.js";
import { t as BrandMark } from "./BrandMark-BAVX8XkQ.js";
import { Head, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Auth/Login.jsx
function Login() {
	const { data, setData, post, processing, errors } = useForm({
		email: "",
		password: "",
		remember: false
	});
	const submit = (e) => {
		e.preventDefault();
		post("/admin/login");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Admin Login | Marketorr" }), /* @__PURE__ */ jsx("div", {
		className: "flex min-h-svh items-center justify-center bg-[var(--bg)] px-4 py-12",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(BrandMark, { size: "2rem" }), /* @__PURE__ */ jsxs("span", {
						className: "font-display text-xl font-extrabold tracking-tight text-[var(--ink-strong)]",
						children: ["MARKETORR", /* @__PURE__ */ jsx("span", {
							className: "text-gradient",
							children: "."
						})]
					})]
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-8 font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)]",
					children: "Admin sign in"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[13px] text-[var(--mute)]",
					children: "Manage projects, services, inquiries and site content."
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: submit,
					className: "mt-8 space-y-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Email",
							error: errors.email,
							required: true,
							children: /* @__PURE__ */ jsx(Input, {
								type: "email",
								value: data.email,
								onChange: (e) => setData("email", e.target.value),
								autoComplete: "username",
								autoFocus: true
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Password",
							error: errors.password,
							required: true,
							children: /* @__PURE__ */ jsx(Input, {
								type: "password",
								value: data.password,
								onChange: (e) => setData("password", e.target.value),
								autoComplete: "current-password"
							})
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "flex items-center gap-2 text-[12px] text-[var(--mute)]",
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: data.remember,
								onChange: (e) => setData("remember", e.target.checked),
								className: "h-4 w-4 rounded border-[var(--field-line)]"
							}), "Remember me"]
						}),
						/* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: processing,
							className: "w-full",
							children: processing ? "Signing in…" : "Sign in →"
						})
					]
				})
			]
		})
	})] });
}
Login.layout = (page) => page;
//#endregion
export { Login as default };
