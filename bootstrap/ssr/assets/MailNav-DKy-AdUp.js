import { m as TAB_GRADIENT, p as TAB_BAR_CLASS, y as tabClass } from "./ui-B5Z9349N.js";
import { Link } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/admin/MailNav.jsx
/**
* Top pill tabs consolidating SMTP Settings and transactional Email Templates.
*/
function MailNav({ activeTab = "smtp" }) {
	return /* @__PURE__ */ jsx("div", {
		className: "mb-8",
		children: /* @__PURE__ */ jsxs("nav", {
			className: TAB_BAR_CLASS,
			"aria-label": "Email & SMTP pill tabs",
			children: [
				/* @__PURE__ */ jsx(Link, {
					href: "/admin/email-smtp",
					className: `flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] ${tabClass(activeTab === "smtp")}`,
					style: activeTab === "smtp" ? TAB_GRADIENT : void 0,
					children: /* @__PURE__ */ jsx("span", { children: "SMTP Settings" })
				}),
				/* @__PURE__ */ jsx(Link, {
					href: "/admin/email-templates",
					className: `flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] ${tabClass(activeTab === "templates")}`,
					style: activeTab === "templates" ? TAB_GRADIENT : void 0,
					children: /* @__PURE__ */ jsx("span", { children: "Email Templates" })
				}),
				/* @__PURE__ */ jsx(Link, {
					href: "/admin/email-logs",
					className: `flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] ${tabClass(activeTab === "logs")}`,
					style: activeTab === "logs" ? TAB_GRADIENT : void 0,
					children: /* @__PURE__ */ jsx("span", { children: "Email Logs" })
				})
			]
		})
	});
}
//#endregion
export { MailNav as t };
