import { t as PageMeta } from "./PageMeta-QhsyNps2.js";
import { t as SectionRenderer } from "./SectionRenderer-BPcuGTF3.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/ContactPage.jsx
function ContactPage({ page }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageMeta, {
		page,
		fallbackTitle: "Contact | Marketorr"
	}), /* @__PURE__ */ jsx(SectionRenderer, { sections: page?.sections ?? [] })] });
}
//#endregion
export { ContactPage as default };
