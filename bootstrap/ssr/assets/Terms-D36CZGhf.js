import { t as PageMeta } from "./PageMeta-QhsyNps2.js";
import { t as SectionRenderer } from "./SectionRenderer-DSsEgSRg.js";
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
