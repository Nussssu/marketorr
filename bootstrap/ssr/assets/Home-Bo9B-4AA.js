import { t as PageMeta } from "./PageMeta-QhsyNps2.js";
import { t as SectionRenderer } from "./SectionRenderer-BPcuGTF3.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Home.jsx
/**
* The home page is a CMS page: its sections, their order and their copy all
* come from the Pages module in the admin panel.
*
* It is the one page that uses the `reveal` arrival: sections lift into
* place once and then stay still, rather than travelling through the 3D
* stage the rest of the site uses. The widgets themselves are unchanged.
*/
function Home({ page }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageMeta, { page }), /* @__PURE__ */ jsx(SectionRenderer, {
		sections: page?.sections ?? [],
		appearance: "reveal"
	})] });
}
//#endregion
export { Home as default };
