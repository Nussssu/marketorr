import { n as Button, o as Field, s as Input } from "./ui-Dz4ZqU85.js";
import { t as AuthCard } from "./AuthCard-C5xoFFCA.js";
import { Head, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Auth/AcceptInvitation.jsx
function AcceptInvitation({ name, email, action }) {
	const { data, setData, post, processing, errors } = useForm({
		name: name ?? "",
		password: "",
		password_confirmation: ""
	});
	const submit = (e) => {
		e.preventDefault();
		post(action);
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Accept invitation | Marketorr" }), /* @__PURE__ */ jsx(AuthCard, {
		title: "Welcome aboard",
		subtitle: `Set a password to activate the admin account for ${email}.`,
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "space-y-5",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Your name",
					error: errors.name,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.name,
						onChange: (e) => setData("name", e.target.value),
						autoComplete: "name"
					})
				}),
				/* @__PURE__ */ jsx("input", {
					type: "email",
					value: email,
					autoComplete: "username",
					readOnly: true,
					hidden: true
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Password",
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
					children: processing ? "Activating…" : "Activate account →"
				})
			]
		})
	})] });
}
AcceptInvitation.layout = (page) => page;
//#endregion
export { AcceptInvitation as default };
