import { t as PageMeta } from "./PageMeta-QhsyNps2.js";
import { t as SectionRenderer } from "./SectionRenderer-DSsEgSRg.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Privacy.jsx
function PrivacyPage({ page }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageMeta, {
		page,
		fallbackTitle: "Privacy | Marketorr"
	}), /* @__PURE__ */ jsx(SectionRenderer, { sections: page?.sections ?? [] })] });
}
//#endregion
export { PrivacyPage as default };
