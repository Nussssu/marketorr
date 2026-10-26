import { n as Button, o as Field, s as Input } from "./ui-Dz4ZqU85.js";
import { t as AuthCard } from "./AuthCard-C5xoFFCA.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Auth/TwoFactorChallenge.jsx
function TwoFactorChallenge() {
	const [recovery, setRecovery] = useState(false);
	const { data, setData, post, processing, errors, reset } = useForm({ code: "" });
	const submit = (e) => {
		e.preventDefault();
		post("/admin/two-factor", { onError: () => reset("code") });
	};
	const switchMode = () => {
		setRecovery((value) => !value);
		reset("code");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Two-factor sign in | Marketorr" }), /* @__PURE__ */ jsx(AuthCard, {
		title: "Two-factor check",
		subtitle: recovery ? "Enter one of your saved recovery codes. Each works once." : "Enter the 6-digit code from your authenticator app.",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "space-y-5",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: recovery ? "Recovery code" : "Authentication code",
					error: errors.code,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.code,
						onChange: (e) => setData("code", e.target.value),
						inputMode: recovery ? "text" : "numeric",
						autoComplete: "one-time-code",
						placeholder: recovery ? "XXXXX-XXXXX" : "123 456",
						maxLength: recovery ? 20 : 7,
						className: "text-center font-mono tracking-[0.3em]",
						autoFocus: true
					})
				}),
				/* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					className: "w-full",
					children: processing ? "Checking…" : "Verify →"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between text-[12px]",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: switchMode,
						className: "text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: recovery ? "Use an authenticator code" : "Use a recovery code"
					}), /* @__PURE__ */ jsx(Link, {
						href: "/admin/login",
						className: "text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: "Start over"
					})]
				})
			]
		})
	})] });
}
TwoFactorChallenge.layout = (page) => page;
//#endregion
export { TwoFactorChallenge as default };
