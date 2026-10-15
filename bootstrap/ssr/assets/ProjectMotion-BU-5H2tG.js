import { useEffect, useRef, useState } from "react";
import { jsx } from "react/jsx-runtime";
import { useInView, useReducedMotion } from "framer-motion";
//#region resources/js/lib/useMediaQuery.js
/**
* Whether a media query matches — `false` on the server and for the first
* (hydrating) render in the browser, then the real value straight after
* mount, kept in sync as the query changes.
*
* Starting from the server's answer keeps server-rendered markup and the
* hydration render identical: a value read from `window` during that render
* would differ, and React keeps the server's attributes when they do, leaving
* styles from the wrong layout stuck on the page.
*
* @param {string} query
* @return {boolean}
*/
function useMediaQuery(query) {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		const list = window.matchMedia(query);
		const update = () => setMatches(list.matches);
		update();
		list.addEventListener("change", update);
		return () => list.removeEventListener("change", update);
	}, [query]);
	return matches;
}
//#endregion
//#region resources/js/lib/projectMotion.js
/**
* Projects whose cover has a moving version.
*
* The static cover in the database stays the source of truth — it is what
* renders first, what shows while the motion file is still downloading, and
* what a reader on reduced motion keeps. The entry here is an optional layer
* laid over it, nothing more, so a project without one behaves exactly as
* before and a broken path costs a fade-in rather than a blank card.
*
* Keyed by project slug, so adding one is a single line and needs no
* migration or admin field.
*
* @type {Record<string, { src: string, alt: string, fit?: 'cover'|'contain', background?: string }>}
*/
var PROJECT_MOTION = {};
/**
* @param {string|undefined} slug
* @return {{ src: string, alt: string, fit?: string, background?: string }|null}
*/
function projectMotion(slug) {
	return slug && PROJECT_MOTION[slug] || null;
}
//#endregion
//#region resources/js/components/media/ProjectMotion.jsx
/**
* The moving version of a project cover, laid over the static one.
*
* It is deliberately additive: the card keeps its own `<img>` underneath and
* this only fades in on top once the file has actually decoded, so the cover
* is never blank, never pops, and a project with no motion entry renders
* nothing at all here.
*
* Three things keep it cheap:
*
* - Nothing is requested until the card is near the viewport. The file is
*   heavier than a cover photograph and a reader who never scrolls that far
*   never pays for it.
* - Once mounted it stays mounted, so scrolling back up does not re-fetch or
*   restart it.
* - Under `prefers-reduced-motion` it is never loaded at all. An animated GIF
*   cannot be paused, so the only honest way to respect that setting is to
*   leave the still cover in place.
*
* @param {{ slug?: string, className?: string, rounded?: string }} props
*/
function ProjectMotion({ slug, className = "" }) {
	const motionAsset = projectMotion(slug);
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const near = useInView(ref, {
		once: true,
		margin: "25% 0px"
	});
	const [loaded, setLoaded] = useState(false);
	const [wideEnough, setWideEnough] = useState(false);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const update = () => setWideEnough(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	useEffect(() => {
		const node = ref.current?.querySelector("img");
		if (node?.complete && node.naturalWidth > 0) setLoaded(true);
	}, [near]);
	if (!motionAsset) return null;
	return /* @__PURE__ */ jsx("span", {
		ref,
		"aria-hidden": true,
		className: `pointer-events-none absolute inset-0 block transition-opacity duration-700 ease-out ${className}`,
		style: {
			opacity: loaded && !reduce && wideEnough ? 1 : 0,
			background: loaded && !reduce && wideEnough ? motionAsset.background ?? "#000" : "transparent"
		},
		children: near && !reduce && wideEnough && /* @__PURE__ */ jsx("img", {
			src: motionAsset.src,
			alt: "",
			loading: "lazy",
			decoding: "async",
			fetchPriority: "low",
			draggable: false,
			onLoad: () => setLoaded(true),
			className: `h-full w-full ${motionAsset.fit === "contain" ? "object-contain" : "object-cover"}`
		})
	});
}
//#endregion
export { useMediaQuery as n, ProjectMotion as t };
