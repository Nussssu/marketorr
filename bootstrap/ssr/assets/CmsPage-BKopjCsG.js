import { s as PageMeta, t as SectionRenderer } from "./SectionRenderer-DZMDzt4a.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/CmsPage.jsx
/**
* Any page created in the admin panel that has no hand-built route of its
* own — rendered entirely from its widget stack.
*/
function CmsPage({ page }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageMeta, { page }), /* @__PURE__ */ jsx(SectionRenderer, { sections: page?.sections ?? [] })] });
}
//#endregion
export { CmsPage as default };
