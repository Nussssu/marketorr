import { t as PageMeta } from "./PageMeta-QhsyNps2.js";
import { a as MissionVision, i as Awards, n as Team, o as About, r as Story, t as SectionRenderer } from "./SectionRenderer-BPcuGTF3.js";
import { Fragment } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/About.jsx
/**
* About page sections that render as they always have here — the About intro
* as this page's hero, and the story, vision/mission and team sections
* without the scene wrapper the shared renderer adds. Any other section an
* editor adds goes through the shared renderer.
*/
var ABOUT_SECTIONS = {
	about: (section) => /* @__PURE__ */ jsx(About, {
		content: section.content,
		heroHeading: true
	}),
	story: (section) => /* @__PURE__ */ jsx(Story, { content: section.content }),
	mission_vision: (section) => /* @__PURE__ */ jsx(MissionVision, { content: section.content }),
	team: (section) => /* @__PURE__ */ jsx(Team, { content: section.content }),
	awards: (section) => /* @__PURE__ */ jsx(Awards, { content: section.content })
};
/**
* The About page is a CMS page: its sections, their order and every word and
* image in them come from the Pages module in the admin panel.
*/
function AboutPage({ page }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(PageMeta, {
		page,
		fallbackTitle: "About | Marketorr"
	}), (page?.sections ?? []).map((section) => {
		const render = ABOUT_SECTIONS[section.type];
		return render ? /* @__PURE__ */ jsx(Fragment, { children: render(section) }, section.id) : /* @__PURE__ */ jsx(SectionRenderer, { sections: [section] }, section.id);
	})] });
}
//#endregion
export { AboutPage as default };
