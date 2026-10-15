import { t as Services } from "./Services-U6xqGZm3.js";
import { Head } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Services/Index.jsx
function ServicesIndex({ subservices }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Services | Marketorr" }), /* @__PURE__ */ jsx(Services, {
		heroHeading: true,
		subservices,
		solidHeadings: true
	})] });
}
//#endregion
export { ServicesIndex as default };
