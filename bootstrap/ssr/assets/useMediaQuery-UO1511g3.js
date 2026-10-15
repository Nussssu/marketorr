import { useEffect, useState } from "react";
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
export { useMediaQuery as t };
