/**
 * GSAP and its ScrollTrigger plugin, loaded on first use rather than with the
 * page. Nothing GSAP drives is part of the server-rendered first paint, so the
 * library stays out of the initial download and arrives once an effect asks.
 */
let loading = null;
let loaded = null;

/** @return {Promise<{ gsap: typeof import('gsap').gsap, ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }>} */
export function loadGsap() {
    loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([core, scroll]) => {
        core.gsap.registerPlugin(scroll.ScrollTrigger);

        loaded = { gsap: core.gsap, ScrollTrigger: scroll.ScrollTrigger };

        return loaded;
    });

    return loading;
}

/**
 * GSAP if it has already loaded, otherwise null — for code that animates
 * synchronously and can simply skip the animation in the rare case it is not
 * there yet.
 */
export function loadedGsap() {
    return loaded?.gsap ?? null;
}
