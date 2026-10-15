import { a as MARK, o as markBarStyle, s as markGap } from "../ssr.js";
import { jsx } from "react/jsx-runtime";
//#region resources/js/components/ui/BrandMark.jsx
/**
* The logo's three-bar mark on its own, drawn in the logo's exact shape and
* colours. `size` is the height of the tallest bar, as any CSS length.
*
* @param {{ size?: string, className?: string }} props
*/
function BrandMark({ size = "1.25rem", className = "" }) {
	return /* @__PURE__ */ jsx("span", {
		className: `inline-flex shrink-0 items-end ${className}`.trimEnd(),
		style: {
			height: size,
			gap: markGap(size)
		},
		"aria-hidden": true,
		children: MARK.colors.map((color, index) => /* @__PURE__ */ jsx("span", {
			className: "block",
			style: {
				...markBarStyle(size, index),
				background: color
			}
		}, color))
	});
}
//#endregion
export { BrandMark as t };
