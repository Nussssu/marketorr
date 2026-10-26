import { t as BrandMark } from "./BrandMark-aHt5Zu4S.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/admin/AuthCard.jsx
/**
* The standalone frame of the admin sign-in pages (login, two-factor,
* invitation, password reset): brand mark, heading, and the form card.
*/
function AuthCard({ title, subtitle, children }) {
	return /* @__PURE__ */ jsx("div", {
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
					children: title
				}),
				subtitle && /* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[13px] text-[var(--mute)]",
					children: subtitle
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6",
					children
				})
			]
		})
	});
}
//#endregion
export { AuthCard as t };
