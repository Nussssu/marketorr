import { i as PageMeta } from "./motion-NShunF_K.js";
import { t as SectionRenderer } from "./SectionRenderer-DeL2rJI5.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Terms.jsx
function TermsPage({ page }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageMeta, {
		page,
		fallbackTitle: "Terms | Marketorr"
	}), /* @__PURE__ */ jsx(SectionRenderer, { sections: page?.sections ?? [] })] });
}
//#endregion
export { TermsPage as default };
