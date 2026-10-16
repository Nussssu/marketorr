import { Link, createInertiaApp, router, usePage } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import Lenis from "lenis";
//#region resources/js/lib/tokens.js
var COLORS = {
	grape: "#891FFB",
	iris: "#507AF4",
	frost: "#1BE2EB",
	gradient: "linear-gradient(90deg, #891FFB 0%, #507AF4 50%, #1BE2EB 100%)"
};
/**
* A colour at a given two-digit hex alpha (`'88'` = 53%), for brand colours
* and plain hex colours alike: `withAlpha(COLORS.iris, '88')`.
*
* @param {string} color
* @param {string} alphaHex
* @return {string}
*/
function withAlpha(color, alphaHex) {
	return `${color}${alphaHex}`;
}
COLORS.grape, COLORS.iris, COLORS.frost;
/** The brand colours in order, for cycling accents across a variable list. */
var BRAND_SEQUENCE = [
	COLORS.grape,
	COLORS.iris,
	COLORS.frost
];
/**
* The logo's three-bar mark, measured off the artwork itself
* (`marketorr-logo-on-*.png`, 1000x118): bars 38 / 75 / 112 tall, 35 wide,
* 19 apart, in exactly these colours. Every size is a fraction of the
* tallest bar, so the mark keeps its proportions at any size.
*
* Each bar is square except its top-left corner, which curves through the
* bar's full width - the shortest bar is very nearly a quarter circle.
*/
var MARK = {
	colors: [
		"#830DFD",
		"#4A76F8",
		"#10E2F1"
	],
	heights: [
		.34,
		.67,
		1
	],
	width: .3125,
	gap: .17
};
/**
* Size and shape of one mark bar, for a mark whose tallest bar is `tallest`
* (any CSS length).
*
* @param {string} tallest
* @param {number} index
* @return {{ width: string, height: string, borderRadius: string }}
*/
function markBarStyle(tallest, index) {
	const width = `calc(${tallest} * ${MARK.width})`;
	return {
		width,
		height: `calc(${tallest} * ${MARK.heights[index % MARK.heights.length]})`,
		borderRadius: `${width} 0 0 0`
	};
}
/**
* The gap between mark bars, for a mark whose tallest bar is `tallest`.
*
* @param {string} tallest
* @return {string}
*/
var markGap = (tallest) => `calc(${tallest} * ${MARK.gap})`;
//#endregion
//#region resources/js/lib/theme.jsx
var STORAGE_KEY = "theme";
var LEGACY_KEY = "marketorr-theme";
function readStoredTheme() {
	if (typeof window === "undefined") return "light";
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
		return stored === "light" || stored === "dark" ? stored : "light";
	} catch {
		return "light";
	}
}
function applyTheme(choice) {
	const root = document.documentElement;
	root.setAttribute("data-theme", choice);
	root.classList.toggle("dark", choice === "dark");
}
var ThemeContext = createContext({
	theme: "light",
	choice: "light",
	toggle: () => {},
	setChoice: () => {}
});
/** Mirror the choice to the cookie the server reads to render the same theme. */
function writeThemeCookie(value) {
	try {
		document.cookie = value ? `theme=${value};path=/;max-age=31536000;SameSite=Lax` : "theme=;path=/;max-age=0;SameSite=Lax";
	} catch {}
}
/**
* @param {{ initial?: 'light'|'dark', children: import('react').ReactNode }} props
*   `initial` is the theme the server rendered (from the `theme` cookie). The
*   first render uses it so hydration matches the server-rendered markup, and
*   the stored choice takes over straight after.
*/
function ThemeProvider({ initial, children }) {
	const [choice, setChoiceState] = useState(() => initial ?? readStoredTheme());
	const [theme, setTheme] = useState(choice);
	useEffect(() => {
		const stored = readStoredTheme();
		if (stored !== choice) setChoiceState(stored);
	}, []);
	useEffect(() => {
		setTheme(choice);
		try {
			applyTheme(choice);
		} catch {}
	}, [choice]);
	const setChoice = useCallback((next) => {
		setChoiceState(next);
		try {
			if (next === "system") {
				window.localStorage.removeItem(STORAGE_KEY);
				window.localStorage.removeItem(LEGACY_KEY);
				writeThemeCookie(null);
			} else {
				window.localStorage.setItem(STORAGE_KEY, next);
				window.localStorage.removeItem(LEGACY_KEY);
				writeThemeCookie(next);
			}
		} catch {}
	}, []);
	const toggle = useCallback(() => {
		setChoice(theme === "dark" ? "light" : "dark");
	}, [theme, setChoice]);
	return /* @__PURE__ */ jsx(ThemeContext.Provider, {
		value: {
			theme,
			choice,
			toggle,
			setChoice
		},
		children
	});
}
function useTheme() {
	return useContext(ThemeContext);
}
/**
* Per-theme animation adjustments.
* Dark keeps the full cinematic treatment; light softens glow-heavy
* motion so it stays premium on a paper background.
*/
function useThemeMotion() {
	const { theme } = useTheme();
	const light = theme === "light";
	return {
		theme,
		glow: light ? .45 : 1,
		orb: light ? .65 : 1,
		float: light ? .55 : 1,
		orbBlur: light ? 100 : 140,
		barGlow: (color, base) => `0 0 ${Math.round(base * (light ? .5 : 1))}px ${withAlpha(color, "55")}`
	};
}
//#endregion
//#region resources/js/components/layout/AnnouncementBanner.jsx
var DISMISS_KEY = "announcement-dismissed";
/**
* Site-wide banner from the Global Blocks module. Dismissal is remembered per
* browser and keyed on the message, so editing the banner shows it again to
* someone who dismissed the previous one.
*/
function AnnouncementBanner() {
	const { announcement } = usePage().props;
	const [dismissed, setDismissed] = useState(true);
	useEffect(() => {
		if (!announcement?.message) return;
		try {
			setDismissed(window.localStorage.getItem(DISMISS_KEY) === announcement.message);
		} catch {
			setDismissed(false);
		}
	}, [announcement?.message]);
	if (!announcement?.message || dismissed) return null;
	const dismiss = () => {
		setDismissed(true);
		try {
			window.localStorage.setItem(DISMISS_KEY, announcement.message);
		} catch {}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative z-[130] flex items-center justify-center gap-4 px-4 py-2.5 text-center text-[12px] font-semibold text-white",
		style: { background: announcement.accent || "#891FFB" },
		role: "status",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "flex flex-wrap items-center justify-center gap-x-3 gap-y-1",
			children: [/* @__PURE__ */ jsx("span", { children: announcement.message }), announcement.linkLabel && announcement.linkUrl && /* @__PURE__ */ jsx(Link, {
				href: announcement.linkUrl,
				className: "underline underline-offset-4",
				children: announcement.linkLabel
			})]
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: dismiss,
			"aria-label": "Dismiss announcement",
			className: "absolute right-3 top-1/2 -translate-y-1/2 text-[15px] leading-none opacity-80 transition-opacity hover:opacity-100",
			children: "×"
		})]
	});
}
//#endregion
//#region resources/js/components/ui/primitives.jsx
/**
* A section's eyebrow: its name and a short brand rule. `data-section-label`
* is what the sticky header reads to show which section the reader is in.
*/
function SectionLabel({ name }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex items-center gap-4",
		"data-section-label": name,
		children: /* @__PURE__ */ jsx("span", {
			className: "font-display text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
			children: name
		})
	});
}
/**
* Keeps a dynamic heading's leading words in the theme ink colour and gives
* its closing phrase the shared Marketorr purple-to-cyan treatment.
*/
function GradientTitle({ text, highlightWords = 1 }) {
	const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return null;
	const splitAt = Math.max(0, words.length - Math.max(1, highlightWords));
	const primary = words.slice(0, splitAt).join(" ");
	const highlight = words.slice(splitAt).join(" ");
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [primary && /* @__PURE__ */ jsxs(Fragment$1, { children: [primary, " "] }), /* @__PURE__ */ jsx("span", {
		className: "text-gradient",
		children: highlight
	})] });
}
function Tag({ children, accent = "var(--brand-1)" }) {
	return /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)]",
		children: [/* @__PURE__ */ jsx("span", {
			className: "h-1.5 w-1.5 rounded-full",
			style: { background: accent },
			"aria-hidden": true
		}), children]
	});
}
function GradientButton({ href, children, variant = "primary" }) {
	if (variant === "ghost") return /* @__PURE__ */ jsxs(Link, {
		href,
		"data-cursor": "cta",
		className: "btn-press group inline-flex items-center gap-3 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]",
		children: [children, /* @__PURE__ */ jsx("span", {
			"aria-hidden": true,
			className: "transition-transform duration-300 group-hover:translate-x-1",
			children: "→"
		})]
	});
	return /* @__PURE__ */ jsxs(Link, {
		href,
		"data-cursor": "cta",
		className: "btn-press group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] text-white",
		style: { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/15",
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("span", {
				className: "relative",
				children
			}),
			/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				className: "relative transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5",
				children: "↗"
			})
		]
	});
}
//#endregion
//#region resources/js/lib/asset.js
/**
* Base URL for files under `public/` — the server's `asset()` base
* (`ASSET_URL`, otherwise the app URL), shared as the `assetBase` prop and set
* once when the app boots.
*/
var base = "";
/** @param {string|null|undefined} value */
function setAssetBase(value) {
	base = (value ?? "").replace(/\/+$/, "");
}
/**
* A root-relative public path (`/images/...`) on the configured asset base.
* Absolute and data URLs pass through untouched.
*
* @param {string|null|undefined} path
* @return {string|null|undefined}
*/
function assetUrl(path) {
	if (!path || !path.startsWith("/") || path.startsWith("//")) return path;
	return `${base}${path}`;
}
//#endregion
//#region resources/js/components/layout/BrandLogo.jsx
/** Shipped lockups, used until an editor uploads their own in Settings. */
var ON_LIGHT = "/images/logo/marketorr-logo-on-light.png";
var ON_DARK = "/images/logo/marketorr-logo-on-dark.png";
/** Intrinsic size of both files, so the box never reflows while they load. */
var NATURAL_WIDTH = 1e3;
var NATURAL_HEIGHT = 118;
/**
* The Marketorr wordmark, swapped between the two supplied files by the active
* theme.
*
* Both variants are rendered and CSS picks one off `data-theme` on the root
* element — that attribute is set by the blocking script in `app.blade.php`
* before first paint, so the correct lockup is on screen immediately. Choosing
* in JS from `useTheme()` would instead swap after hydration and flash the
* wrong lockup on a light-theme load.
*
* Both files are decorative here — the lockup's text is repeated as a
* screen-reader-only label, so the name is announced once whichever variant is
* on screen.
*
* An uploaded logo replaces the shipped artwork. When only one variant has
* been uploaded it is used for both themes, so a half-finished upload never
* leaves one theme with no logo at all.
*
* @param {{ className?: string, height?: number, draggable?: boolean, source?: string|null }} props
*   `height` is the rendered height in px; the width follows the artwork's
*   own aspect ratio. `priority` marks the header instance, which is often
*   the first image on screen, for an early high-priority fetch. `draggable`
*   false stops the browser lifting a ghost copy of the logo on drag.
*/
function BrandLogo({ className = "", height = 26, priority = false, draggable, source = null }) {
	const { settings } = usePage().props;
	const style = {
		height,
		width: "auto"
	};
	const isLockup = (url) => [ON_LIGHT, ON_DARK].some((path) => String(url ?? "").endsWith(path));
	const override = source && !isLockup(source) ? source : null;
	const uploadedLight = override ?? settings?.logo ?? settings?.logoDark ?? null;
	const uploadedDark = override ?? settings?.logoDark ?? settings?.logo ?? null;
	const onLight = uploadedLight ?? assetUrl(ON_LIGHT);
	const onDark = uploadedDark ?? assetUrl(ON_DARK);
	const siteName = settings?.siteName ?? "Marketorr";
	const isShipped = (url) => !url || [ON_LIGHT, ON_DARK].some((path) => String(url).endsWith(path));
	const intrinsic = isShipped(onLight) && isShipped(onDark) ? {
		width: NATURAL_WIDTH,
		height: NATURAL_HEIGHT
	} : {};
	return /* @__PURE__ */ jsxs("span", {
		className: `brand-logo inline-flex items-center ${className}`.trimEnd(),
		children: [
			/* @__PURE__ */ jsx("img", {
				src: onDark,
				alt: "",
				...intrinsic,
				style,
				className: "brand-logo__img",
				draggable,
				"data-variant": "dark",
				fetchPriority: priority ? "high" : void 0,
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("img", {
				src: onLight,
				alt: "",
				...intrinsic,
				style,
				className: "brand-logo__img",
				draggable,
				"data-variant": "light",
				fetchPriority: priority ? "high" : void 0,
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: siteName
			})
		]
	});
}
//#endregion
//#region resources/js/lib/pointer.js
/**
* Pointer tracking that costs one layout read per entry and one write per
* frame.
*
* A pointer can fire far more often than the screen refreshes — high-polling
* mice and coalesced events routinely deliver several moves per frame — so
* anything done straight inside a move handler runs several times for a single
* painted result. Measuring the element there is worse again: reading a box
* mid-event forces the browser to flush layout, so the reads and the writes
* end up interleaved.
*
* These handlers measure the element once when the pointer arrives, keep the
* latest position, and hand it to `apply` from a single animation frame.
*
* `apply` receives the position as fractions of the element's own box, where
* (0, 0) is its top-left corner and (1, 1) its bottom-right.
*
* @param {(fx: number, fy: number) => void} apply
* @param {{enabled?: boolean, mouseOnly?: boolean}} [options]
* @return {{onPointerEnter: (event: PointerEvent) => void, onPointerMove: (event: PointerEvent) => void, onPointerLeave: (event: PointerEvent) => void}}
*/
function useBoxPointer(apply, { enabled = true, mouseOnly = true } = {}) {
	const box = useRef(null);
	const next = useRef({
		x: 0,
		y: 0
	});
	const frame = useRef(0);
	const applyRef = useRef(apply);
	useEffect(() => {
		applyRef.current = apply;
	}, [apply]);
	useEffect(() => () => cancelAnimationFrame(frame.current), []);
	const measure = useCallback((event) => {
		const rect = event.currentTarget.getBoundingClientRect();
		box.current = rect.width && rect.height ? rect : null;
	}, []);
	return {
		onPointerEnter: useCallback((event) => {
			if (!enabled) return;
			if (mouseOnly && event.pointerType !== "mouse") return;
			measure(event);
		}, [
			enabled,
			mouseOnly,
			measure
		]),
		onPointerMove: useCallback((event) => {
			if (!enabled) return;
			if (mouseOnly && event.pointerType !== "mouse") return;
			if (!box.current) {
				measure(event);
				if (!box.current) return;
			}
			const rect = box.current;
			next.current = {
				x: (event.clientX - rect.left) / rect.width,
				y: (event.clientY - rect.top) / rect.height
			};
			if (frame.current) return;
			frame.current = requestAnimationFrame(() => {
				frame.current = 0;
				applyRef.current(next.current.x, next.current.y);
			});
		}, [
			enabled,
			mouseOnly,
			measure
		]),
		onPointerLeave: useCallback(() => {
			cancelAnimationFrame(frame.current);
			frame.current = 0;
			box.current = null;
		}, [])
	};
}
/**
* A media query evaluated once and shared, rather than re-created per event.
*
* `window.matchMedia` allocates a new MediaQueryList on every call, so asking
* it inside a pointer handler allocates on every move.
*
* @param {string} query
* @return {boolean}
*/
var queryCache = /* @__PURE__ */ new Map();
function matchesCached(query) {
	let mql = queryCache.get(query);
	if (!mql) {
		mql = window.matchMedia(query);
		queryCache.set(query, mql);
	}
	return mql.matches;
}
//#endregion
//#region resources/js/components/motion/MagneticButton.jsx
var COARSE_QUERY = "(max-width: 1023px), (pointer: coarse)";
/**
* Button that leans toward the cursor.
*
* The offset lives in motion values rather than state: the pull is a transform
* on one element, so pushing it through React would re-render the button and
* everything inside it on every mouse move for a result the compositor can
* handle on its own.
*/
function MagneticButton({ children, strength = 10, className = "", onClick }) {
	const reduce = useReducedMotion();
	const limit = Math.min(strength, 6);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const pullX = useSpring(x, {
		stiffness: 260,
		damping: 26,
		mass: .4
	});
	const pullY = useSpring(y, {
		stiffness: 260,
		damping: 26,
		mass: .4
	});
	const pointer = useBoxPointer(useCallback((fx, fy) => {
		if (matchesCached(COARSE_QUERY)) return;
		x.set(Math.max(-limit, Math.min(limit, (fx - .5) * 2 * limit)));
		y.set(Math.max(-limit, Math.min(limit, (fy - .5) * 2 * limit)));
	}, [
		limit,
		x,
		y
	]), { enabled: !reduce });
	const release = (event) => {
		pointer.onPointerLeave(event);
		x.set(0);
		y.set(0);
	};
	return /* @__PURE__ */ jsx(motion.div, {
		className: `inline-block ${className}`,
		style: {
			x: pullX,
			y: pullY
		},
		onPointerEnter: pointer.onPointerEnter,
		onPointerMove: pointer.onPointerMove,
		onPointerLeave: release,
		onClick,
		whileTap: { scale: .97 },
		children
	});
}
//#endregion
//#region resources/js/components/layout/ThemeToggle.jsx
function ThemeToggle({ compact = false }) {
	const { theme, toggle } = useTheme();
	const dark = theme === "dark";
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: toggle,
		"aria-pressed": !dark,
		"aria-label": dark ? "Switch to light theme" : "Switch to dark theme",
		title: dark ? "Switch to light theme" : "Switch to dark theme",
		className: `btn-press relative flex items-center rounded-full border border-[var(--line)] bg-[var(--chip)] ${compact ? "h-9 w-9 justify-center" : "h-10 gap-2 px-3"}`,
		children: [/* @__PURE__ */ jsxs("span", {
			className: "relative block h-4 w-4",
			"aria-hidden": true,
			children: [
				/* @__PURE__ */ jsx(motion.span, {
					className: "absolute inset-0 rounded-full bg-[var(--brand-3)]",
					initial: false,
					animate: {
						scale: dark ? 0 : 1,
						opacity: dark ? 0 : 1
					},
					transition: {
						duration: .3,
						ease: [
							.22,
							1,
							.36,
							1
						]
					}
				}),
				/* @__PURE__ */ jsx(motion.span, {
					className: "absolute inset-0 rounded-full bg-[var(--brand-1)]",
					initial: false,
					animate: {
						scale: dark ? 1 : 0,
						opacity: dark ? 1 : 0
					},
					transition: {
						duration: .3,
						ease: [
							.22,
							1,
							.36,
							1
						]
					}
				}),
				/* @__PURE__ */ jsx(motion.span, {
					className: "absolute inset-[3px] rounded-full bg-[var(--bg)]",
					initial: false,
					animate: {
						x: dark ? 3 : -3,
						opacity: dark ? 1 : 0
					},
					transition: {
						duration: .3,
						ease: [
							.22,
							1,
							.36,
							1
						]
					}
				})
			]
		}), !compact && /* @__PURE__ */ jsx("span", {
			className: "text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]",
			children: dark ? "Light" : "Dark"
		})]
	});
}
//#endregion
//#region resources/js/lib/tapIntent.js
/** Pointer travel (px) beyond which a press is treated as a scroll/drag, not a tap. */
var TAP_SLOP = 10;
/**
* Guards a link against accidental activation. A touch that starts on the link
* and then drags (the browser still fires `click` at the end of some scroll
* gestures on Android) is swallowed, so navigation only happens on a real tap
* or click. Keyboard activation fires no pointer event and always passes.
*
* @return {{onPointerDown: (event: PointerEvent) => void, onPointerMove: (event: PointerEvent) => void, onPointerCancel: () => void, onClick: (event: MouseEvent) => void}}
*/
function useTapIntent() {
	const origin = useRef(null);
	return {
		onPointerDown: (event) => {
			origin.current = {
				pointerId: event.pointerId,
				x: event.clientX,
				y: event.clientY,
				moved: false,
				cancelled: false
			};
		},
		onPointerMove: (event) => {
			const start = origin.current;
			if (!start || start.pointerId !== event.pointerId || start.moved) return;
			if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) start.moved = true;
		},
		onPointerCancel: () => {
			if (origin.current) origin.current.cancelled = true;
		},
		onClick: (event) => {
			if (event.detail === 0) {
				origin.current = null;
				return;
			}
			const start = origin.current;
			origin.current = null;
			if (!start) return;
			if (start.cancelled || start.moved || Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	};
}
//#endregion
//#region resources/js/components/motion/PageTransition.jsx
var PANELS = [
	"var(--brand-1)",
	"var(--brand-2)",
	"var(--brand-3)"
];
/**
* Whether a visit is a reader actually going to another page.
*
* Prefetches and polls are always async, which a reader-initiated page visit
* is not. These visits are the only ones that should raise the curtain.
*/
function isPageNavigation(visit) {
	return visit.method === "get" && !visit.prefetch && !visit.async;
}
function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function scrollAfterNav() {
	try {
		let element = null;
		if (window.location.hash) {
			try {
				element = document.querySelector(window.location.hash);
			} catch {
				element = null;
			}
			if (element) {
				if (window.__lenis) window.__lenis.scrollTo(element, {
					offset: -72,
					immediate: true
				});
				else element.scrollIntoView();
				return;
			}
		}
		if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
		else window.scrollTo(0, 0);
	} catch {
		try {
			window.scrollTo(0, 0);
		} catch {}
	}
}
/** Seconds for panels to cover and uncover the viewport. */
var PANEL_COVER_SECONDS = .16;
var PANEL_REVEAL_SECONDS = .18;
/** Seconds each panel starts after the one before it. */
var PANEL_STAGGER = .018;
/** Finish the entrance before revealing a destination that loaded immediately. */
var COVER_ENTRANCE_MS = Math.round((PANEL_COVER_SECONDS + (PANELS.length - 1) * PANEL_STAGGER) * 1e3);
var REVEAL_AFTER_NAV_MS = Math.round(216);
/** Absolute backstop: frozen full-screen panels are never acceptable. */
var CURTAIN_SAFETY_MS = 6e3;
/**
* Set when another layer is already carrying the reader across, so the cover
* would hide the thing they are watching. Consumed by the next visit only.
*/
var coverSuppressed = false;
/**
* Let the next visit run without the colour cover.
*
* Used by the showcase transition, which flies the clicked visual into the
* next page's hero and needs that visual to stay visible throughout.
*/
function skipCoverForNextVisit() {
	coverSuppressed = true;
}
/**
* Ask the PageTransition layer to animate a full-screen 3-color cover while
* the destination loads. Resolves new-tab/modifier clicks by doing nothing —
* callers must let those fall through to the browser. Hover, mousemove and
* scroll must never call this; wire it to click only.
*
* @param {string} href
*/
function transitionTo(href) {
	if (!href || typeof href !== "string") return;
	window.dispatchEvent(new CustomEvent("marketorr:transition-to", { detail: { href } }));
}
function PageTransition({ children }) {
	const [cover, setCover] = useState(false);
	const [phase, setPhase] = useState("idle");
	const [cycle, setCycle] = useState(0);
	const coverRef = useRef(false);
	const cycleRef = useRef(0);
	const timers = useRef([]);
	const suppressedVisits = useRef(/* @__PURE__ */ new WeakSet());
	const coverStartedAt = useRef(0);
	/**
	* Visits this layer decided to animate, judged at `start` while the visit
	* still says what it is. `finish` acts only on a visit in here, so a
	* prefetch can never reach the cover or the scroll reset.
	*/
	const navigating = useRef(/* @__PURE__ */ new WeakSet());
	/** How many of those visits are still in flight. */
	const inFlight = useRef(0);
	/**
	* Raise the cover. `restart` replays it from the top even if one is already
	* on screen, so a reader clicking through quickly still gets the full
	* animation rather than a bare route change.
	*/
	const showCover = (restart = false) => {
		if (coverRef.current && !restart) return;
		coverRef.current = true;
		cycleRef.current += 1;
		const id = cycleRef.current;
		coverStartedAt.current = performance.now();
		setCycle(id);
		setPhase("covering");
		setCover(true);
		timers.current.push(setTimeout(() => {
			if (cycleRef.current === id) hideCover();
		}, CURTAIN_SAFETY_MS));
	};
	useEffect(() => {
		coverRef.current = cover;
	}, [cover]);
	/**
	* Component scope (refs + stable setters only) so both the safety timer
	* and the router handlers share one teardown with no stale closures.
	*/
	const hideCover = () => {
		timers.current.forEach(clearTimeout);
		timers.current = [];
		coverRef.current = false;
		setPhase("idle");
		setCover(false);
	};
	useEffect(() => {
		const clear = () => {
			timers.current.forEach(clearTimeout);
			timers.current = [];
		};
		const revealCover = () => {
			const id = cycleRef.current;
			const reveal = () => {
				if (cycleRef.current !== id) return;
				setPhase("revealing");
				timers.current.push(setTimeout(() => {
					if (cycleRef.current === id) hideCover();
				}, REVEAL_AFTER_NAV_MS));
			};
			const entranceRemaining = Math.max(0, COVER_ENTRANCE_MS - (performance.now() - coverStartedAt.current));
			if (entranceRemaining === 0) reveal();
			else timers.current.push(setTimeout(reveal, entranceRemaining));
		};
		const offBefore = router.on("before", (event) => {
			const { visit } = event.detail;
			if (!isPageNavigation(visit)) return;
			if (coverSuppressed) {
				coverSuppressed = false;
				suppressedVisits.current.add(visit);
				return;
			}
		});
		const offStart = router.on("start", (event) => {
			const { visit } = event.detail;
			if (!isPageNavigation(visit)) return;
			if (suppressedVisits.current.has(visit)) {
				suppressedVisits.current.delete(visit);
				return;
			}
			if (prefersReducedMotion()) return;
			navigating.current.add(visit);
			inFlight.current += 1;
			clear();
			showCover();
			const id = cycleRef.current;
			timers.current.push(setTimeout(() => {
				if (cycleRef.current === id) hideCover();
			}, CURTAIN_SAFETY_MS));
		});
		const offFinish = router.on("finish", (event) => {
			const { visit } = event.detail;
			if (!navigating.current.has(visit)) return;
			navigating.current.delete(visit);
			inFlight.current = Math.max(0, inFlight.current - 1);
			if (!visit.completed || visit.cancelled || visit.interrupted) {
				clear();
				revealCover();
				return;
			}
			clear();
			try {
				scrollAfterNav();
			} finally {
				revealCover();
			}
		});
		const offNavigate = router.on("navigate", () => {
			if (!coverRef.current || inFlight.current > 0) return;
			clear();
			try {
				scrollAfterNav();
			} finally {
				revealCover();
			}
		});
		return () => {
			offBefore();
			offStart();
			offFinish();
			offNavigate();
			clear();
		};
	}, []);
	useEffect(() => {
		const clearNavTimer = () => {
			timers.current.forEach(clearTimeout);
			timers.current = [];
		};
		const onRequest = (event) => {
			const href = event?.detail?.href;
			if (!href || typeof href !== "string") return;
			if (prefersReducedMotion()) {
				router.visit(href);
				return;
			}
			clearNavTimer();
			showCover(true);
			try {
				router.visit(href);
			} catch {
				hideCover();
			}
		};
		window.addEventListener("marketorr:transition-to", onRequest);
		return () => {
			window.removeEventListener("marketorr:transition-to", onRequest);
		};
	}, []);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [cover && /* @__PURE__ */ jsx("div", {
		className: "pointer-events-auto fixed inset-0 z-[10010] flex",
		"aria-hidden": true,
		children: PANELS.map((color, index) => /* @__PURE__ */ jsx(motion.div, {
			className: "h-full flex-1 origin-top",
			style: { background: color },
			initial: { scaleY: 0 },
			animate: { scaleY: phase === "revealing" ? 0 : 1 },
			transition: {
				duration: phase === "revealing" ? PANEL_REVEAL_SECONDS : PANEL_COVER_SECONDS,
				delay: phase === "revealing" ? (PANELS.length - 1 - index) * PANEL_STAGGER : index * PANEL_STAGGER,
				ease: [
					.22,
					1,
					.36,
					1
				]
			}
		}, color))
	}, cycle), children] });
}
//#endregion
//#region resources/js/components/layout/Header.jsx
/**
* Used only when the Header menu has been emptied in the admin panel — the
* site should never be left with no way to navigate.
*/
var FALLBACK_LINKS = [
	{
		label: "Home",
		href: "/"
	},
	{
		label: "About",
		href: "/about"
	},
	{
		label: "Services",
		href: "/services"
	},
	{
		label: "Our Work",
		href: "/work"
	},
	{
		label: "Contact",
		href: "/contact"
	}
];
function menuTreeToMegaGroups(items, fallbackGroups) {
	return items.map((parent) => {
		const fallback = fallbackGroups.find((group) => group.href === parent.url || `/services#${group.slug}` === parent.url || group.name === parent.label);
		return {
			...fallback,
			slug: fallback?.slug ?? `menu-${parent.id}`,
			name: parent.label,
			href: parent.url,
			short: parent.description ?? fallback?.short,
			newTab: parent.newTab,
			items: (parent.children ?? []).map((child) => {
				const fallbackItem = fallback?.items?.find((item) => item.href === child.url || `/services/${fallback.slug}/${item.slug}` === child.url || item.name === child.label);
				return {
					...fallbackItem,
					slug: fallbackItem?.slug ?? `menu-${child.id}`,
					name: child.label,
					href: child.url,
					newTab: child.newTab
				};
			})
		};
	});
}
function isActive(url, href) {
	if (href === "/") return url === "/";
	return url === href || url.startsWith(`${href}/`);
}
function navigateWithCurtain(event, href, onNavigate) {
	if (event.defaultPrevented) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	if (event.button !== void 0 && event.button !== 0) return;
	event.preventDefault();
	onNavigate?.();
	transitionTo(href);
}
/** `compact` shrinks the mark to suit the floating pill the header becomes once scrolled. */
function Logo({ compact = false }) {
	return /* @__PURE__ */ jsx(Link, {
		href: "/",
		onClick: (event) => navigateWithCurtain(event, "/"),
		className: "btn-press group flex items-center",
		"aria-label": "Marketorr home",
		children: /* @__PURE__ */ jsx(BrandLogo, {
			priority: true,
			height: 19,
			className: `transition-transform duration-300 ease-out group-hover:scale-[1.03] [&_img]:transition-[height] [&_img]:duration-300 [&_img]:ease-[cubic-bezier(0.22,1,0.36,1)] ${compact ? "[&_img]:!h-[16px] sm:[&_img]:!h-[19px] lg:[&_img]:!h-[20px]" : "sm:[&_img]:!h-[24px] lg:[&_img]:!h-[26px]"}`
		})
	});
}
var EASE$2 = [
	.22,
	1,
	.36,
	1
];
/** Height of the docked header's mark: its tallest bar. */
var DOCKED_MARK_SIZE = "20px";
/** A section counts as current once its label passes this share of the viewport. */
var READOUT_LINE = .42;
/**
* One bar of the docked mark, in the logo's shape. It fills over its own
* third of the page: Idea, then Experience, then Result.
*/
function MarkBar({ index, progress }) {
	const scaleY = useTransform(progress, [index / 3, (index + 1) / 3], [.14, 1]);
	return /* @__PURE__ */ jsx("span", {
		className: "relative block overflow-hidden bg-[var(--line)]",
		style: markBarStyle(DOCKED_MARK_SIZE, index),
		children: /* @__PURE__ */ jsx(motion.span, {
			className: "absolute inset-0 origin-bottom",
			style: {
				background: MARK.colors[index],
				scaleY
			}
		})
	});
}
/**
* The docked header's logo: the brand mark on its own, doubling as the page's
* scroll meter.
*/
function BrandMark() {
	const { scrollYProgress } = useScroll();
	const progress = useSpring(scrollYProgress, {
		stiffness: 140,
		damping: 28,
		mass: .4
	});
	return /* @__PURE__ */ jsx("span", {
		className: "flex items-end",
		style: {
			height: DOCKED_MARK_SIZE,
			gap: markGap(DOCKED_MARK_SIZE)
		},
		"aria-hidden": true,
		children: MARK.colors.map((color, index) => /* @__PURE__ */ jsx(MarkBar, {
			index,
			progress
		}, color))
	});
}
/**
* The label of the section the reader is currently in, read from
* the page's own section eyebrows. Null above the first one.
*
* @param {string} url
* @return {string|null}
*/
function useCurrentSectionLabel(url) {
	const [label, setLabel] = useState(null);
	useEffect(() => {
		let ticking = false;
		const update = () => {
			ticking = false;
			const line = window.innerHeight * READOUT_LINE;
			let current = null;
			document.querySelectorAll("main [data-section-label]").forEach((element) => {
				if (element.getClientRects().length === 0) return;
				if (element.getBoundingClientRect().top <= line) current = element.getAttribute("data-section-label");
			});
			setLabel(current);
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [url]);
	return label;
}
/** The current section's label, rolling up to the next one as it changes. */
function SectionReadout({ label }) {
	const reduce = useReducedMotion();
	return /* @__PURE__ */ jsx("span", {
		className: "relative block h-4 min-w-0 overflow-hidden",
		"aria-live": "off",
		children: /* @__PURE__ */ jsx(AnimatePresence, {
			initial: false,
			mode: "popLayout",
			children: /* @__PURE__ */ jsx(motion.span, {
				className: "block whitespace-nowrap font-display text-[11px] font-bold uppercase leading-4 tracking-[0.22em] text-[var(--ink)]",
				initial: reduce ? false : {
					y: "100%",
					opacity: 0
				},
				animate: {
					y: "0%",
					opacity: 1
				},
				exit: reduce ? void 0 : {
					y: "-100%",
					opacity: 0
				},
				transition: {
					duration: .45,
					ease: EASE$2
				},
				children: label
			}, label)
		})
	});
}
/**
* The docked header's first pod: the mark, then where the reader is.
*/
function DockedBrand({ label }) {
	return /* @__PURE__ */ jsxs(Link, {
		href: "/",
		onClick: (event) => navigateWithCurtain(event, "/"),
		className: "btn-press group flex min-w-0 items-center gap-3",
		"aria-label": "Marketorr home",
		children: [/* @__PURE__ */ jsx(motion.span, {
			initial: {
				opacity: 0,
				scale: .6
			},
			animate: {
				opacity: 1,
				scale: 1
			},
			transition: {
				duration: .4,
				ease: EASE$2
			},
			className: "flex",
			children: /* @__PURE__ */ jsx(BrandMark, {})
		}), label && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
			className: "h-4 w-px shrink-0 bg-[var(--line)]",
			"aria-hidden": true
		}), /* @__PURE__ */ jsx(SectionReadout, { label })] })]
	});
}
/**
* Mobile menu rows arrive one after another rather than as a single block, and
* leave together so closing stays quick. The panel itself still does the fade
* and slide; this is the beat inside it.
*/
var MOBILE_MENU = {
	hidden: { transition: {
		staggerChildren: .03,
		staggerDirection: -1
	} },
	show: { transition: {
		staggerChildren: .055,
		delayChildren: .04
	} }
};
var MOBILE_MENU_ITEM = {
	hidden: {
		opacity: 0,
		y: -10
	},
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: .32,
			ease: [...EASE$2]
		}
	}
};
/** Rolling two-line label shared by desktop nav links. */
function NavLabel({ label }) {
	return /* @__PURE__ */ jsxs("span", {
		className: "relative block overflow-hidden",
		children: [/* @__PURE__ */ jsx("span", {
			className: "block transition-transform duration-200 group-hover:-translate-y-full",
			children: label
		}), /* @__PURE__ */ jsx("span", {
			"aria-hidden": true,
			className: "absolute inset-0 block translate-y-full text-gradient transition-transform duration-200 group-hover:translate-y-0",
			children: label
		})]
	});
}
/**
* Reveal beat for the full-screen menu. The surface wipes down from under the
* navbar, then the rail, sections and rows arrive just behind it. Closing
* skips the stagger so the overlay never lingers once the pointer leaves.
*/
function megaVariants(reduce) {
	return {
		scrim: {
			hidden: {
				opacity: 0,
				transition: {
					duration: .2,
					ease: [...EASE$2]
				}
			},
			show: {
				opacity: 1,
				transition: {
					duration: .34,
					ease: [...EASE$2]
				}
			}
		},
		panel: {
			hidden: {
				opacity: 0,
				clipPath: reduce ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
				transition: {
					duration: .24,
					ease: [...EASE$2]
				}
			},
			show: {
				opacity: 1,
				clipPath: "inset(0% 0% 0% 0%)",
				transition: {
					duration: reduce ? .2 : .52,
					ease: [...EASE$2],
					staggerChildren: reduce ? 0 : .045,
					delayChildren: reduce ? 0 : .12
				}
			}
		},
		item: {
			hidden: {
				opacity: 0,
				y: reduce ? 0 : 14,
				transition: { duration: .12 }
			},
			show: {
				opacity: 1,
				y: 0,
				transition: {
					duration: .46,
					ease: [...EASE$2]
				}
			}
		},
		row: {
			hidden: {
				opacity: 0,
				y: reduce ? 0 : 10,
				transition: { duration: .1 }
			},
			show: {
				opacity: 1,
				y: 0,
				transition: {
					duration: .4,
					ease: [...EASE$2]
				}
			}
		}
	};
}
/**
* One sub-service row inside a discipline section. Ruled top and bottom so the
* list reads as a set; the accent bar and arrow only appear under the pointer.
* Navigates on a real tap/click only - the tap-intent guard swallows drags.
*/
function MegaSubLink({ category, item, variants, onNavigate }) {
	const tapIntent = useTapIntent();
	const href = item.href ?? `/services/${category.slug}/${item.slug}`;
	return /* @__PURE__ */ jsx(motion.li, {
		variants,
		className: "border-b border-[var(--line-soft)] last:border-b-0",
		children: /* @__PURE__ */ jsxs(Link, {
			href,
			prefetch: true,
			target: item.newTab ? "_blank" : void 0,
			rel: item.newTab ? "noreferrer" : void 0,
			"data-cursor": "explore",
			...tapIntent,
			onClick: (event) => {
				tapIntent.onClick(event);
				if (!item.newTab) navigateWithCurtain(event, href, onNavigate);
			},
			className: "group/row flex items-center gap-4 py-3.5 focus-visible:outline-none",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "h-[2px] w-0 shrink-0 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:w-5 group-focus-visible/row:w-5",
					style: { background: item.accent ?? category.accent },
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsx("span", {
					className: "min-w-0 flex-1 truncate text-[15px] font-medium leading-snug text-[var(--mute)] transition-colors duration-300 group-hover/row:text-[var(--ink)] group-focus-visible/row:text-[var(--ink)]",
					children: item.name
				}),
				/* @__PURE__ */ jsx("span", {
					"aria-hidden": true,
					className: "shrink-0 -translate-x-2 text-[14px] leading-none text-[var(--ink-faint)] opacity-0 transition-all duration-300 group-hover/row:translate-x-0 group-hover/row:opacity-100 group-focus-visible/row:translate-x-0 group-focus-visible/row:opacity-100",
					children: "→"
				})
			]
		})
	});
}
/**
* One discipline section: an oversized heading, which is a plain label rather
* than a link, and every sub-service ruled out beneath it.
*/
function MegaSection({ category, index, variants, onNavigate }) {
	const items = category.items ?? [];
	return /* @__PURE__ */ jsxs("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ jsx(motion.div, {
			variants: variants.item,
			children: /* @__PURE__ */ jsxs("div", {
				className: "block",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "flex items-center gap-3",
						children: /* @__PURE__ */ jsxs("span", {
							className: "font-display text-[11px] font-bold tracking-[0.22em] text-[var(--ink-faint)]",
							"aria-hidden": true,
							children: ["0", index + 1]
						})
					}),
					/* @__PURE__ */ jsx("span", {
						className: "mt-4 flex items-baseline gap-3",
						children: /* @__PURE__ */ jsx("span", {
							className: "min-w-0 font-display text-[clamp(1.5rem,2vw,2.15rem)] font-bold leading-[1.05] tracking-[-0.01em] text-[var(--ink)]",
							children: category.name
						})
					}),
					category.short && /* @__PURE__ */ jsx("span", {
						className: "mt-2.5 block max-w-[30ch] text-[13px] leading-relaxed text-[var(--mute)]",
						children: category.short
					})
				]
			})
		}), /* @__PURE__ */ jsx("ul", {
			className: "mt-7 list-none border-t border-[var(--line-soft)]",
			children: items.map((item) => /* @__PURE__ */ jsx(MegaSubLink, {
				category,
				item,
				variants: variants.row,
				onNavigate
			}, item.slug))
		})]
	});
}
/**
* One Our Work column: the portfolio's name, and its projects as a slow
* horizontal strip of covers rather than a list of titles.
*
* The strip is two identical halves travelling exactly one half-width, so the
* wrap is invisible and the gallery reads as continuous. Reduced motion gets
* the same covers, still. `compact` is the mobile menu's version: the same
* block with type and covers scaled down for a phone.
*/
function WorkMegaSection({ category, index, variants, onNavigate, compact = false }) {
	const tapIntent = useTapIntent();
	const reduce = useReducedMotion();
	const href = category.href ?? "/work";
	const items = category.items ?? [];
	return /* @__PURE__ */ jsxs("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ jsx(motion.div, {
			variants: variants.item,
			children: /* @__PURE__ */ jsxs(Link, {
				href,
				prefetch: true,
				target: category.newTab ? "_blank" : void 0,
				rel: category.newTab ? "noreferrer" : void 0,
				"data-cursor": "explore",
				...tapIntent,
				onClick: (event) => {
					tapIntent.onClick(event);
					if (!category.newTab) navigateWithCurtain(event, href, onNavigate);
				},
				className: `group/head block focus-visible:outline-none ${compact ? "!block" : ""}`.trimEnd(),
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "flex items-center gap-3",
						children: /* @__PURE__ */ jsxs("span", {
							className: `font-display ${compact ? "text-[10px]" : "text-[11px]"} font-bold tracking-[0.22em] text-[var(--ink-faint)]`,
							"aria-hidden": true,
							children: ["0", index + 1]
						})
					}),
					/* @__PURE__ */ jsxs("span", {
						className: `${compact ? "mt-3" : "mt-4"} flex items-baseline gap-3`,
						children: [/* @__PURE__ */ jsx("span", {
							className: `min-w-0 font-display ${compact ? "text-[1.35rem]" : "text-[clamp(1.5rem,2vw,2.15rem)]"} font-bold leading-[1.05] tracking-[-0.01em] text-[var(--ink)]`,
							children: /* @__PURE__ */ jsx(GradientTitle, { text: category.name })
						}), /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "shrink-0 -translate-x-1 text-[14px] leading-none text-[var(--ink-faint)] opacity-0 transition-all duration-300 group-hover/head:translate-x-0 group-hover/head:opacity-100",
							children: "↗"
						})]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: `mt-2.5 block ${compact ? "text-[10.5px]" : "text-[12px]"} font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]`,
						children: [
							items.length,
							" ",
							items.length === 1 ? "project" : "projects"
						]
					})
				]
			})
		}), /* @__PURE__ */ jsx(motion.div, {
			variants: variants.row,
			className: `${compact ? "mt-5" : "mt-7"} overflow-hidden`,
			children: /* @__PURE__ */ jsx(motion.div, {
				className: "flex w-max",
				animate: reduce ? void 0 : { x: ["0%", "-50%"] },
				transition: reduce ? void 0 : {
					duration: 42,
					ease: "linear",
					repeat: Infinity
				},
				children: [false, true].map((duplicate) => /* @__PURE__ */ jsx("ul", {
					className: "flex shrink-0 list-none gap-3 pr-3",
					"aria-hidden": duplicate || void 0,
					children: items.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
						href: item.href,
						prefetch: true,
						target: item.newTab ? "_blank" : void 0,
						rel: item.newTab ? "noreferrer" : void 0,
						"data-cursor": "view",
						tabIndex: duplicate ? -1 : void 0,
						...tapIntent,
						onClick: (event) => {
							tapIntent.onClick(event);
							if (!item.newTab) navigateWithCurtain(event, item.href, onNavigate);
						},
						"aria-label": item.name,
						className: "group/tile block overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] focus-visible:outline-none",
						children: item.image ? /* @__PURE__ */ jsx("img", {
							src: item.image,
							alt: "",
							loading: "lazy",
							decoding: "async",
							draggable: false,
							className: `${compact ? "h-16 w-24" : "h-20 w-32"} object-cover transition-transform duration-500 ease-out group-hover/tile:scale-[1.06]`
						}) : /* @__PURE__ */ jsx("span", {
							className: `${compact ? "h-16 w-24" : "h-20 w-32"} flex items-center justify-center bg-[var(--chip)] px-3 text-center text-[11px] font-bold text-[var(--ink)]`,
							children: item.name
						})
					}) }, `${duplicate ? "duplicate-" : ""}${item.slug}`))
				}, duplicate ? "duplicate" : "primary"))
			})
		})]
	});
}
/**
* Full-screen Services menu. A full-bleed surface drops from under the navbar
* with the two disciplines side by side and every sub-service ruled out
* beneath them; the rest of the viewport dims behind it. Data-driven, so new
* sub-services appear automatically. Desktop only - small screens use the
* Services panel inside the mobile menu.
*/
function ServicesMegaMenu({ categories, onNavigate, onPointerOpen, onPointerClose, ariaLabel = "Services menu", eyebrow = "What we do", headline = /* @__PURE__ */ jsxs(Fragment$1, { children: [
	"Design that ",
	/* @__PURE__ */ jsx("span", {
		className: "text-gradient",
		children: "compounds"
	}),
	"."
] }), blurb = "Two disciplines, one standard. Pick a practice, or go straight to the specialism you need.", allHref = "/services", allLabel = "View all services", showAllLink = true, Section = MegaSection }) {
	const variants = megaVariants(useReducedMotion());
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-0 hidden lg:block",
		children: [/* @__PURE__ */ jsx(motion.div, {
			variants: variants.scrim,
			initial: "hidden",
			animate: "show",
			exit: "hidden",
			"aria-hidden": true,
			onMouseEnter: onPointerClose,
			onClick: onNavigate,
			className: "absolute inset-0 backdrop-blur-[3px]",
			style: { background: "color-mix(in srgb, var(--bg) 62%, transparent)" }
		}), /* @__PURE__ */ jsxs(motion.div, {
			variants: variants.panel,
			initial: "hidden",
			animate: "show",
			exit: "hidden",
			onMouseEnter: onPointerOpen,
			onMouseLeave: onPointerClose,
			className: "absolute inset-x-0 top-0 overflow-hidden border-b border-[var(--line)] bg-[var(--bg)]",
			role: "group",
			"aria-label": ariaLabel,
			children: [
				/* @__PURE__ */ jsx("div", {
					"aria-hidden": true,
					className: "pointer-events-none absolute inset-0",
					style: {
						backgroundImage: "linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
						backgroundSize: "120px 100%"
					}
				}),
				/* @__PURE__ */ jsx("div", {
					"aria-hidden": true,
					className: "pointer-events-none absolute inset-0",
					style: { background: "radial-gradient(70% 120% at 12% 0%, var(--glow-purple), transparent 62%), radial-gradient(60% 110% at 88% 10%, var(--glow-cyan), transparent 60%)" }
				}),
				/* @__PURE__ */ jsx("div", {
					className: "container-x relative pb-12 pt-[104px] xl:pb-16",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-12 gap-x-10 xl:gap-x-16",
						children: [/* @__PURE__ */ jsxs(motion.div, {
							variants: variants.item,
							className: "col-span-4 flex min-w-0 flex-col justify-between",
							children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("span", {
									className: "block text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink-faint)]",
									children: eyebrow
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-6 max-w-[16ch] font-display text-[clamp(1.75rem,2.6vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--ink)]",
									children: headline
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-5 max-w-[34ch] text-[13.5px] leading-relaxed text-[var(--mute)]",
									children: blurb
								})
							] }), showAllLink && /* @__PURE__ */ jsxs(Link, {
								href: allHref,
								prefetch: true,
								"data-cursor": "explore",
								onClick: (event) => navigateWithCurtain(event, allHref, onNavigate),
								className: "group/all mt-10 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--line)] px-5 py-3 transition-colors duration-300 hover:border-[var(--field-line)] focus-visible:outline-none",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
									children: allLabel
								}), /* @__PURE__ */ jsx("span", {
									"aria-hidden": true,
									className: "text-[13px] leading-none text-[var(--ink-faint)] transition-transform duration-300 group-hover/all:translate-x-1",
									children: "→"
								})]
							})]
						}), categories.map((category, index) => /* @__PURE__ */ jsx("div", {
							className: "col-span-4 min-w-0 border-l border-[var(--line-soft)] pl-10 xl:pl-14",
							children: /* @__PURE__ */ jsx(Section, {
								category,
								index,
								variants,
								onNavigate
							})
						}, category.slug))]
					})
				}),
				/* @__PURE__ */ jsx("span", {
					"aria-hidden": true,
					className: "absolute inset-x-0 bottom-0 h-px opacity-90",
					style: { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" }
				})
			]
		})]
	});
}
function MegaMenuHeadline({ before = "", highlight = "", after = "" }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		before,
		before && highlight ? " " : "",
		highlight && /* @__PURE__ */ jsx("span", {
			className: "text-gradient",
			children: highlight
		}),
		after
	] });
}
/** Small chevron toggle used by the mobile Services accordion. */
function AccordionChevron({ expanded }) {
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": true,
		className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`,
		children: /* @__PURE__ */ jsx("svg", {
			width: "12",
			height: "7",
			viewBox: "0 0 12 7",
			fill: "none",
			className: "block",
			children: /* @__PURE__ */ jsx("path", {
				d: "M1 1l5 5 5-5",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		})
	});
}
/**
* One group inside a mobile accordion (a Services discipline or an Our Work
* portfolio) - the small-screen reading of the full-screen menu. The heading
* links to the group's page and every entry is ruled out under it, so nothing
* hides behind a second tap and the list still has room to breathe.
*/
function MobileServiceGroup({ category, index, onNavigate }) {
	const items = category.items ?? [];
	const groupHref = category.href;
	const itemHref = (item) => item.href ?? `/services/${category.slug}/${item.slug}`;
	const heading = /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("span", {
			className: "flex items-center gap-3",
			children: /* @__PURE__ */ jsxs("span", {
				className: "font-display text-[10px] font-bold tracking-[0.22em] text-[var(--ink-faint)]",
				"aria-hidden": true,
				children: ["0", index + 1]
			})
		}),
		/* @__PURE__ */ jsxs("span", {
			className: "mt-3 flex items-baseline gap-2.5",
			children: [/* @__PURE__ */ jsx("span", {
				className: "min-w-0 truncate font-display text-[1.5rem] font-bold leading-[1.1] tracking-[-0.01em] text-[var(--ink)]",
				children: category.name
			}), groupHref && /* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				className: "shrink-0 text-[13px] leading-none text-[var(--ink-faint)]",
				children: "↗"
			})]
		}),
		category.short && /* @__PURE__ */ jsx("span", {
			className: "mt-2 block text-[12.5px] leading-relaxed text-[var(--mute)]",
			children: category.short
		})
	] });
	return /* @__PURE__ */ jsxs("div", {
		className: "pb-7 pl-11 pr-2 pt-5",
		children: [groupHref ? /* @__PURE__ */ jsx(Link, {
			href: groupHref,
			target: category.newTab ? "_blank" : void 0,
			rel: category.newTab ? "noreferrer" : void 0,
			onClick: category.newTab ? void 0 : (event) => navigateWithCurtain(event, groupHref, onNavigate),
			className: "block",
			children: heading
		}) : /* @__PURE__ */ jsx("div", {
			className: "block",
			children: heading
		}), /* @__PURE__ */ jsx("ul", {
			className: "mt-5 list-none border-t border-[var(--line-soft)]",
			children: items.map((item) => /* @__PURE__ */ jsx("li", {
				className: "border-b border-[var(--line-soft)] last:border-b-0",
				children: /* @__PURE__ */ jsxs(Link, {
					href: itemHref(item),
					target: item.newTab ? "_blank" : void 0,
					rel: item.newTab ? "noreferrer" : void 0,
					onClick: item.newTab ? void 0 : (event) => navigateWithCurtain(event, itemHref(item), onNavigate),
					className: "flex items-center gap-3.5 py-3.5 active:opacity-70",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "h-[2px] w-4 shrink-0 rounded-full",
							style: { background: item.accent ?? category.accent },
							"aria-hidden": true
						}),
						/* @__PURE__ */ jsx("span", {
							className: "min-w-0 flex-1 truncate text-[15px] font-medium text-[var(--ink)]",
							children: item.name
						}),
						/* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "shrink-0 text-[13px] text-[var(--ink-faint)]",
							children: "→"
						})
					]
				})
			}, item.slug))
		})]
	});
}
function Header() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const [mega, setMega] = useState(false);
	const [workMega, setWorkMega] = useState(false);
	const workMenuVariants = megaVariants(useReducedMotion());
	/** Which mobile accordion is expanded ('/services', '/work' or null); one at a time. */
	const [mobileSection, setMobileSection] = useState(null);
	const closeTimer = useRef(null);
	const workCloseTimer = useRef(null);
	const { url, props } = usePage();
	const serviceCategories = props.serviceCategories ?? [];
	const workGroups = props.workGroups ?? [];
	const serviceMegaGroups = Object.prototype.hasOwnProperty.call(props.menus ?? {}, "mega_services") ? menuTreeToMegaGroups(props.menus.mega_services, serviceCategories) : serviceCategories;
	const workMegaGroups = Object.prototype.hasOwnProperty.call(props.menus ?? {}, "mega_work") ? menuTreeToMegaGroups(props.menus.mega_work, workGroups) : workGroups;
	const serviceMenuContent = props.menuContent?.mega_services ?? {};
	const workMenuContent = props.menuContent?.mega_work ?? {};
	const hasManagedHeader = Object.prototype.hasOwnProperty.call(props.menus ?? {}, "header");
	const managedHeaderItems = props.menus?.header ?? [];
	const mapMenuLink = (item) => ({
		label: item.label,
		href: item.url,
		newTab: item.newTab,
		children: item.children ?? []
	});
	const LINKS = hasManagedHeader ? managedHeaderItems.filter((item) => item.showOnDesktop !== false).map(mapMenuLink) : FALLBACK_LINKS;
	const MOBILE_LINKS = hasManagedHeader ? managedHeaderItems.filter((item) => item.showOnMobile !== false).map(mapMenuLink) : FALLBACK_LINKS;
	const settings = props.settings;
	const isSticky = settings?.headerSticky !== false;
	const ctaLink = settings?.headerCtaLink || "/contact";
	const ctaText = settings?.headerCtaText || "Start a Project";
	/** Hover intent: open instantly, close after a short grace period. */
	const openMega = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		setWorkMega(false);
		setMega(true);
	};
	const scheduleMegaClose = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		closeTimer.current = setTimeout(() => setMega(false), 140);
	};
	const handleMegaBlur = (e) => {
		if (!e.currentTarget.contains(e.relatedTarget)) scheduleMegaClose();
	};
	/** Same hover intent for Our Work; opening one menu closes the other. */
	const openWorkMega = () => {
		if (workCloseTimer.current) clearTimeout(workCloseTimer.current);
		setMega(false);
		setWorkMega(true);
	};
	const scheduleWorkMegaClose = () => {
		if (workCloseTimer.current) clearTimeout(workCloseTimer.current);
		workCloseTimer.current = setTimeout(() => setWorkMega(false), 140);
	};
	const handleWorkMegaBlur = (e) => {
		if (!e.currentTarget.contains(e.relatedTarget)) scheduleWorkMegaClose();
	};
	useEffect(() => () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
	}, []);
	useEffect(() => {
		if (!mega) return void 0;
		const onKeyDown = (event) => {
			if (event.key === "Escape") {
				setMega(false);
				setWorkMega(false);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [mega]);
	useEffect(() => {
		if (!open) return void 0;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.__lenis?.stop();
		return () => {
			document.body.style.overflow = previousOverflow;
			window.__lenis?.start();
		};
	}, [open]);
	useEffect(() => {
		setOpen(false);
		setMega(false);
		setWorkMega(false);
		setMobileSection(null);
	}, [url]);
	useEffect(() => {
		if (!open) setMobileSection(null);
	}, [open]);
	useEffect(() => {
		let ticking = false;
		const update = () => {
			ticking = false;
			setScrolled(Math.max(0, window.scrollY) > 24);
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	/** Scrolled and not mid-menu: the bar docks, splitting into separate pods. */
	const floating = scrolled && !open;
	const readout = useCurrentSectionLabel(url) ?? LINKS.find((l) => l.href !== "/" && isActive(url, l.href))?.label ?? null;
	return /* @__PURE__ */ jsxs("header", {
		className: `${isSticky ? "fixed" : "relative"} inset-x-0 top-0 z-[9999]`,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: `header-shell mobile-header-shell relative z-10 ${floating ? "header-shell--docked" : ""}`,
				children: /* @__PURE__ */ jsxs("div", {
					className: `flex h-16 items-center justify-between gap-3 transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${floating ? "lg:h-[52px]" : "lg:h-[72px]"}`,
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: `header-pod header-pod--brand flex min-w-0 items-center ${floating ? "lg:h-full lg:pl-4 lg:pr-5" : ""}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: floating ? "lg:hidden" : void 0,
								children: /* @__PURE__ */ jsx(Logo, { compact: floating })
							}), floating && /* @__PURE__ */ jsx("span", {
								className: "hidden min-w-0 lg:flex",
								children: /* @__PURE__ */ jsx(DockedBrand, { label: readout })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: `hidden items-center lg:flex ${floating ? "h-full gap-2" : "gap-5 xl:gap-8"}`,
							children: [/* @__PURE__ */ jsxs("nav", {
								className: `header-pod header-pod--nav flex items-center transition-[gap] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${floating ? "h-full gap-4 pl-5 pr-2 xl:gap-6 xl:pl-6" : "gap-5 xl:gap-8"}`,
								"aria-label": "Primary",
								children: [LINKS.map((l) => {
									const linkClass = `link-underline btn-press group relative whitespace-nowrap py-2 text-[13px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${isActive(url, l.href) ? "text-[var(--ink)]" : "text-[var(--ink-faint)] hover:text-[var(--ink)]"}`;
									if (l.href === "/services" || l.href === "/work") {
										const isWork = l.href === "/work";
										const enterMenu = isWork ? openWorkMega : openMega;
										const leaveMenu = isWork ? scheduleWorkMegaClose : scheduleMegaClose;
										const blurMenu = isWork ? handleWorkMegaBlur : handleMegaBlur;
										const menuOpen = isWork ? workMega : mega;
										return /* @__PURE__ */ jsx("div", {
											onMouseEnter: enterMenu,
											onMouseLeave: leaveMenu,
											onFocus: enterMenu,
											onBlur: blurMenu,
											className: "relative",
											children: /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: enterMenu,
												"aria-haspopup": "true",
												"aria-expanded": menuOpen,
												className: `${linkClass} cursor-pointer`,
												children: /* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1.5",
													children: [/* @__PURE__ */ jsx(NavLabel, { label: l.label }), /* @__PURE__ */ jsx("span", {
														"aria-hidden": true,
														className: `transition-transform duration-200 ease-out ${menuOpen ? "rotate-180" : "group-hover:translate-y-[1px]"}`,
														children: /* @__PURE__ */ jsx("svg", {
															width: "10",
															height: "6",
															viewBox: "0 0 10 6",
															fill: "none",
															className: "block",
															children: /* @__PURE__ */ jsx("path", {
																d: "M1 1l4 4 4-4",
																stroke: "currentColor",
																strokeWidth: "1.6",
																strokeLinecap: "round",
																strokeLinejoin: "round"
															})
														})
													})]
												})
											})
										}, l.href);
									}
									if (l.children?.length > 0) return /* @__PURE__ */ jsxs("div", {
										className: "group/menu relative py-2",
										children: [/* @__PURE__ */ jsx(Link, {
											href: l.href,
											target: l.newTab ? "_blank" : void 0,
											rel: l.newTab ? "noreferrer" : void 0,
											onClick: l.newTab ? void 0 : (event) => navigateWithCurtain(event, l.href),
											className: linkClass,
											children: /* @__PURE__ */ jsxs("span", {
												className: "flex items-center gap-1.5",
												children: [/* @__PURE__ */ jsx(NavLabel, { label: l.label }), /* @__PURE__ */ jsx("span", {
													"aria-hidden": true,
													className: "transition-transform duration-200 group-hover/menu:rotate-180",
													children: /* @__PURE__ */ jsx("svg", {
														width: "10",
														height: "6",
														viewBox: "0 0 10 6",
														fill: "none",
														className: "block",
														children: /* @__PURE__ */ jsx("path", {
															d: "M1 1l4 4 4-4",
															stroke: "currentColor",
															strokeWidth: "1.6",
															strokeLinecap: "round",
															strokeLinejoin: "round"
														})
													})
												})]
											})
										}), /* @__PURE__ */ jsx("ul", {
											className: "invisible absolute left-1/2 top-full min-w-52 -translate-x-1/2 translate-y-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 opacity-0 shadow-xl transition-all group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:translate-y-0 group-focus-within/menu:opacity-100",
											children: l.children.map((child) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
												href: child.url,
												target: child.newTab ? "_blank" : void 0,
												rel: child.newTab ? "noreferrer" : void 0,
												onClick: child.newTab ? void 0 : (event) => navigateWithCurtain(event, child.url),
												className: "block rounded-lg px-3 py-2.5 text-[12px] font-semibold text-[var(--mute)] transition-colors hover:bg-[var(--chip)] hover:text-[var(--ink)]",
												children: child.label
											}) }, child.id))
										})]
									}, l.href);
									return /* @__PURE__ */ jsx(Link, {
										href: l.href,
										target: l.newTab ? "_blank" : void 0,
										rel: l.newTab ? "noreferrer" : void 0,
										onClick: l.newTab ? void 0 : (event) => navigateWithCurtain(event, l.href),
										className: linkClass,
										children: /* @__PURE__ */ jsx(NavLabel, { label: l.label })
									}, l.href);
								}), /* @__PURE__ */ jsx(ThemeToggle, {})]
							}), /* @__PURE__ */ jsx("div", {
								className: `header-pod header-pod--cta flex items-center ${floating ? "h-full px-1" : ""}`,
								children: /* @__PURE__ */ jsx(MagneticButton, { children: /* @__PURE__ */ jsxs(Link, {
									href: ctaLink,
									onClick: (event) => navigateWithCurtain(event, ctaLink),
									"data-cursor": "cta",
									className: "btn-press inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-[12px] xl:px-6 font-bold uppercase tracking-[0.16em] text-white",
									style: { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
									children: [
										ctaText,
										" ",
										/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											children: "↗"
										})
									]
								}) })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 lg:hidden",
							children: [/* @__PURE__ */ jsx(ThemeToggle, { compact: true }), /* @__PURE__ */ jsx("button", {
								className: "btn-press flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)]",
								onClick: () => setOpen((v) => !v),
								"aria-expanded": open,
								"aria-label": open ? "Close menu" : "Open menu",
								children: /* @__PURE__ */ jsxs("span", {
									className: "relative block h-3 w-5",
									children: [/* @__PURE__ */ jsx("span", { className: `absolute left-0 top-0 h-[2px] w-full bg-[var(--ink)] transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}` }), /* @__PURE__ */ jsx("span", { className: `absolute bottom-0 left-0 h-[2px] w-full bg-[var(--ink)] transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}` })]
								})
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(AnimatePresence, {
				initial: false,
				children: mega && /* @__PURE__ */ jsx(ServicesMegaMenu, {
					categories: serviceMegaGroups,
					onNavigate: () => setMega(false),
					onPointerOpen: openMega,
					onPointerClose: scheduleMegaClose,
					eyebrow: serviceMenuContent.eyebrow ?? "",
					headline: /* @__PURE__ */ jsx(MegaMenuHeadline, {
						before: serviceMenuContent.headline_before ?? "",
						highlight: serviceMenuContent.headline_highlight ?? "",
						after: serviceMenuContent.headline_after ?? ""
					}),
					blurb: serviceMenuContent.blurb ?? "",
					allLabel: serviceMenuContent.all_label ?? "",
					allHref: serviceMenuContent.all_url ?? "",
					showAllLink: Boolean(serviceMenuContent.all_label && serviceMenuContent.all_url)
				}, "services-mega-menu")
			}),
			/* @__PURE__ */ jsx(AnimatePresence, {
				initial: false,
				children: workMega && /* @__PURE__ */ jsx(ServicesMegaMenu, {
					categories: workMegaGroups,
					onNavigate: () => setWorkMega(false),
					onPointerOpen: openWorkMega,
					onPointerClose: scheduleWorkMegaClose,
					Section: WorkMegaSection,
					ariaLabel: "Our Work menu",
					eyebrow: workMenuContent.eyebrow ?? "",
					headline: /* @__PURE__ */ jsx(MegaMenuHeadline, {
						before: workMenuContent.headline_before ?? "",
						highlight: workMenuContent.headline_highlight ?? "",
						after: workMenuContent.headline_after ?? ""
					}),
					blurb: workMenuContent.blurb ?? "",
					showAllLink: false
				}, "work-mega-menu")
			}),
			/* @__PURE__ */ jsx(AnimatePresence, {
				initial: false,
				children: open && /* @__PURE__ */ jsx(motion.nav, {
					initial: {
						opacity: 0,
						y: -12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					exit: {
						opacity: 0,
						y: -8
					},
					transition: {
						duration: .24,
						ease: [
							.22,
							1,
							.36,
							1
						]
					},
					className: "fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain border-t border-[var(--line)] bg-[var(--bg)] lg:hidden",
					"aria-label": "Mobile",
					children: /* @__PURE__ */ jsx(motion.ul, {
						className: "flex list-none flex-col px-5 pb-10 pt-2",
						initial: "hidden",
						animate: "show",
						exit: "hidden",
						variants: MOBILE_MENU,
						children: MOBILE_LINKS.map((l, i) => {
							const active = isActive(url, l.href);
							const accordion = l.href === "/services" ? {
								groups: serviceMegaGroups,
								label: "services"
							} : l.href === "/work" ? {
								groups: workMegaGroups,
								label: "work"
							} : l.children?.length > 0 ? {
								groups: [{
									slug: `menu-${l.href}`,
									name: l.label,
									href: l.href,
									newTab: l.newTab,
									items: l.children.map((child) => ({
										slug: `menu-${child.id}`,
										name: child.label,
										href: child.url,
										newTab: child.newTab
									}))
								}],
								label: l.label
							} : null;
							if (accordion && accordion.groups.length > 0) {
								const expanded = mobileSection === l.href;
								return /* @__PURE__ */ jsxs(motion.li, {
									variants: MOBILE_MENU_ITEM,
									className: "w-full",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex h-16 w-full items-center gap-4 border-b border-[var(--line-soft)]",
										children: [
											/* @__PURE__ */ jsxs("span", {
												className: "w-7 shrink-0 font-display text-[10px] font-bold tracking-[0.16em] text-[var(--ink-faint)]",
												"aria-hidden": true,
												children: ["0", i + 1]
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setMobileSection(l.href),
												"aria-expanded": expanded,
												"aria-current": active ? "page" : void 0,
												className: "flex min-w-0 flex-1 cursor-pointer items-center text-left",
												children: /* @__PURE__ */ jsx("span", {
													className: `truncate font-display text-[clamp(1.35rem,7vw,1.75rem)] font-bold leading-none ${active ? "text-gradient" : "text-[var(--ink)]"}`,
													children: l.label
												})
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setMobileSection((current) => current === l.href ? null : l.href),
												"aria-expanded": expanded,
												"aria-label": `${expanded ? "Collapse" : "Expand"} ${accordion.label}`,
												className: "btn-press shrink-0 p-1",
												children: /* @__PURE__ */ jsx(AccordionChevron, { expanded })
											})
										]
									}), /* @__PURE__ */ jsx(AnimatePresence, {
										initial: false,
										children: expanded && /* @__PURE__ */ jsx(motion.div, {
											initial: {
												height: 0,
												opacity: 0
											},
											animate: {
												height: "auto",
												opacity: 1
											},
											exit: {
												height: 0,
												opacity: 0
											},
											transition: {
												duration: .28,
												ease: [...EASE$2]
											},
											className: "overflow-hidden",
											children: l.href === "/work" ? /* @__PURE__ */ jsx(motion.div, {
												initial: "hidden",
												animate: "show",
												variants: { show: { transition: { staggerChildren: .06 } } },
												className: "space-y-8 pb-8 pt-6",
												children: accordion.groups.map((category, categoryIndex) => /* @__PURE__ */ jsx("div", {
													className: "min-w-0 border-l border-[var(--line-soft)] pl-4",
													children: /* @__PURE__ */ jsx(WorkMegaSection, {
														compact: true,
														category,
														index: categoryIndex,
														variants: workMenuVariants,
														onNavigate: () => setOpen(false)
													})
												}, category.slug))
											}) : accordion.groups.map((category, categoryIndex) => /* @__PURE__ */ jsx(MobileServiceGroup, {
												category,
												index: categoryIndex,
												onNavigate: () => setOpen(false)
											}, category.slug))
										})
									})]
								}, l.href);
							}
							return /* @__PURE__ */ jsx(motion.li, {
								variants: MOBILE_MENU_ITEM,
								className: "w-full",
								children: /* @__PURE__ */ jsxs(Link, {
									href: l.href,
									onClick: (event) => navigateWithCurtain(event, l.href, () => setOpen(false)),
									"aria-current": active ? "page" : void 0,
									className: "flex h-16 w-full items-center gap-4 border-b border-[var(--line-soft)]",
									children: [
										/* @__PURE__ */ jsxs("span", {
											className: "w-7 shrink-0 font-display text-[10px] font-bold tracking-[0.16em] text-[var(--ink-faint)]",
											"aria-hidden": true,
											children: ["0", i + 1]
										}),
										/* @__PURE__ */ jsx("span", {
											className: `min-w-0 flex-1 truncate font-display text-[clamp(1.35rem,7vw,1.75rem)] font-bold leading-none ${active ? "text-gradient" : "text-[var(--ink)]"}`,
											children: l.label
										}),
										/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											className: "shrink-0 text-[var(--ink-faint)]",
											children: "→"
										})
									]
								})
							}, l.href);
						})
					})
				})
			})
		]
	});
}
//#endregion
//#region resources/js/components/layout/Footer.jsx
var EASE$1 = [
	.22,
	1,
	.36,
	1
];
var BRAND_GRADIENT = "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))";
var MOTTO_COLORS = [
	"var(--brand-1)",
	"var(--brand-2)",
	"var(--brand-3)"
];
function ColumnHeading({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
		children
	});
}
function FooterMenuLink({ item, className = "" }) {
	if (item.newTab) return /* @__PURE__ */ jsx("a", {
		href: item.url,
		target: "_blank",
		rel: "noreferrer",
		className,
		children: item.label
	});
	return /* @__PURE__ */ jsx(Link, {
		href: item.url,
		className,
		children: item.label
	});
}
function FooterMenuItems({ items }) {
	return items.map((item) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(FooterMenuLink, {
		item,
		className: "footer-link block"
	}), item.children?.length > 0 && /* @__PURE__ */ jsx("ul", {
		className: "mt-2 flex flex-col gap-2 border-l border-[var(--line)] pl-3 text-[13px] font-medium text-[var(--mute)]",
		children: item.children.map((child) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(FooterMenuLink, {
			item: child,
			className: "footer-link block"
		}) }, `${child.label}-${child.url}`))
	})] }, `${item.label}-${item.url}`));
}
function Footer() {
	const reduce = useReducedMotion();
	const { settings, menus, menuLabels = {}, menuContent = {} } = usePage().props;
	const socials = (menus?.footer_social ?? []).map((item) => ({
		label: item.label,
		href: item.url
	}));
	const sitemap = menus?.footer_sitemap ?? [];
	const serviceLinks = menus?.footer_services ?? [];
	const legalLinks = menus?.footer_legal ?? [];
	const intro = menuContent.footer_social?.intro ?? "";
	const mottoItems = menuContent.footer_legal?.motto_items ?? [];
	const copyright = (menuContent.footer_legal?.copyright ?? "").replaceAll("{year}", String((/* @__PURE__ */ new Date()).getFullYear())).replaceAll("{site}", settings.siteName ?? "");
	const container = {
		hidden: {},
		show: { transition: {
			staggerChildren: .07,
			delayChildren: .08
		} }
	};
	const item = {
		hidden: reduce ? { opacity: 0 } : {
			opacity: 0,
			y: 18
		},
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: .42,
				ease: EASE$1
			}
		}
	};
	return /* @__PURE__ */ jsxs("footer", {
		className: "relative bg-[var(--bg)]",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "relative h-[3px] w-full overflow-hidden",
				"aria-hidden": true,
				children: [/* @__PURE__ */ jsx(motion.div, {
					initial: reduce ? false : { scaleX: 0 },
					whileInView: { scaleX: 1 },
					viewport: {
						once: true,
						margin: "-5% 0px"
					},
					transition: {
						duration: .9,
						ease: EASE$1
					},
					className: "h-full w-full origin-left",
					style: { background: BRAND_GRADIENT }
				}), !reduce && /* @__PURE__ */ jsx(motion.div, {
					initial: { x: "-130%" },
					whileInView: { x: "130%" },
					viewport: {
						once: true,
						margin: "-5% 0px"
					},
					transition: {
						duration: 1.1,
						delay: .35,
						ease: EASE$1
					},
					className: "absolute inset-y-0 w-1/3",
					style: { background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)" }
				})]
			}),
			/* @__PURE__ */ jsxs(motion.div, {
				variants: reduce ? void 0 : container,
				initial: reduce ? false : "hidden",
				whileInView: "show",
				viewport: {
					once: true,
					margin: "-8% 0px"
				},
				className: "container-x grid grid-cols-2 gap-x-6 gap-y-12 pt-14 pb-12 sm:gap-x-10 lg:grid-cols-12 lg:gap-x-14 lg:pt-20 lg:pb-16",
				children: [
					/* @__PURE__ */ jsxs(motion.div, {
						variants: item,
						className: "col-span-2 lg:col-span-4 lg:max-w-md",
						children: [
							settings.footerLogoVisible !== false && /* @__PURE__ */ jsx("div", {
								className: "flex items-center",
								children: /* @__PURE__ */ jsx(BrandLogo, {
									source: settings.footerLogo,
									height: 28,
									draggable: false
								})
							}),
							intro && /* @__PURE__ */ jsx("p", {
								className: "mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--mute)]",
								children: intro
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-7",
								children: [/* @__PURE__ */ jsx(ColumnHeading, { children: menuLabels.footer_social ?? "" }), /* @__PURE__ */ jsx("div", {
									className: "mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] font-bold tracking-[0.16em]",
									children: socials.map((s) => /* @__PURE__ */ jsx("a", {
										href: s.href,
										target: "_blank",
										rel: "noreferrer",
										"data-social-platform": s.label,
										className: "footer-link",
										children: s.label
									}, s.label))
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs(motion.nav, {
						variants: item,
						"aria-label": "Footer",
						className: "lg:col-span-3 lg:col-start-6",
						children: [/* @__PURE__ */ jsx(ColumnHeading, { children: menuLabels.footer_sitemap ?? "" }), /* @__PURE__ */ jsx("ul", {
							className: "mt-5 flex flex-col gap-3 text-[15px] font-semibold",
							children: /* @__PURE__ */ jsx(FooterMenuItems, { items: sitemap })
						})]
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						variants: item,
						className: "lg:col-span-3 lg:col-start-10",
						children: [/* @__PURE__ */ jsx(ColumnHeading, { children: menuLabels.footer_services ?? "" }), /* @__PURE__ */ jsx("ul", {
							className: "mt-5 flex flex-col gap-3 text-[15px] font-semibold",
							children: /* @__PURE__ */ jsx(FooterMenuItems, { items: serviceLinks })
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "border-t border-[var(--line)]",
				children: /* @__PURE__ */ jsxs(motion.div, {
					variants: reduce ? void 0 : item,
					initial: reduce ? false : "hidden",
					whileInView: "show",
					viewport: {
						once: true,
						margin: "-4% 0px"
					},
					className: "container-x flex flex-col items-start gap-4 py-6 text-[12px] text-[var(--ink-faint)] md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "md:justify-self-start",
							children: copyright
						}),
						mottoItems.length > 0 && /* @__PURE__ */ jsx("p", {
							className: "footer-motto font-display text-[12px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] md:justify-self-center",
							children: mottoItems.map((word, index) => /* @__PURE__ */ jsxs("span", { children: [index > 0 && /* @__PURE__ */ jsx("span", {
								"aria-hidden": true,
								className: "bg-clip-text px-1.5 text-transparent sm:px-2.5",
								style: { backgroundImage: BRAND_GRADIENT },
								children: "→"
							}), /* @__PURE__ */ jsx("span", {
								style: { color: MOTTO_COLORS[index % MOTTO_COLORS.length] },
								children: word
							})] }, `${word}-${index}`))
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-self-end",
							children: legalLinks.map((item) => /* @__PURE__ */ jsx(FooterMenuLink, {
								item,
								className: "footer-link footer-link--inline"
							}, `${item.label}-${item.url}`))
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/components/motion/SmoothScroll.jsx
function SmoothScroll() {
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches) return;
		if (window.__lenis) return;
		const lenis = new Lenis({
			duration: .82,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true,
			wheelMultiplier: .92,
			syncTouch: false
		});
		let raf = 0;
		let running = false;
		let deepLinkRaf = 0;
		const loop = (time) => {
			lenis.raf(time);
			if (lenis.isScrolling === "smooth" || Math.abs(lenis.velocity) > .01) raf = requestAnimationFrame(loop);
			else {
				raf = 0;
				running = false;
			}
		};
		const startLoop = () => {
			if (running || document.hidden) return;
			running = true;
			raf = requestAnimationFrame(loop);
		};
		window.addEventListener("wheel", startLoop, { passive: true });
		const onClick = (e) => {
			const a = e.target.closest?.("a[href*='#']");
			if (!a) return;
			const raw = a.getAttribute("href");
			if (!raw || raw === "#") return;
			const hashIndex = raw.indexOf("#");
			if (hashIndex === -1) return;
			const path = raw.slice(0, hashIndex);
			if (path !== "" && path !== window.location.pathname) return;
			const id = raw.slice(hashIndex);
			if (id === "#") return;
			let el = null;
			try {
				el = document.querySelector(id);
			} catch {
				return;
			}
			if (!el) return;
			e.preventDefault();
			lenis.scrollTo(el, {
				offset: -72,
				duration: .65
			});
			startLoop();
		};
		document.addEventListener("click", onClick);
		window.__lenis = lenis;
		if (window.location.hash) {
			let el = null;
			try {
				el = document.querySelector(window.location.hash);
			} catch {}
			if (el) deepLinkRaf = requestAnimationFrame(() => {
				lenis.scrollTo(el, {
					offset: -72,
					immediate: true
				});
			});
		}
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			cancelAnimationFrame(deepLinkRaf);
			window.removeEventListener("wheel", startLoop);
			document.removeEventListener("click", onClick);
			lenis.destroy();
			if (window.__lenis === lenis) window.__lenis = void 0;
		};
	}, []);
	return null;
}
//#endregion
//#region resources/js/components/motion/CustomCursor.jsx
function SocialIcon({ platform }) {
	const commonProps = {
		className: "h-full w-full",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.8,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true
	};
	if (platform === "LinkedIn") return /* @__PURE__ */ jsxs("svg", {
		...commonProps,
		children: [/* @__PURE__ */ jsx("rect", {
			x: "3",
			y: "3",
			width: "18",
			height: "18",
			rx: "2.5"
		}), /* @__PURE__ */ jsx("path", { d: "M7.5 10v7M7.5 7.25v.1M11.5 17v-4a3 3 0 0 1 6 0v4M11.5 10v7" })]
	});
	if (platform === "Facebook") return /* @__PURE__ */ jsxs("svg", {
		...commonProps,
		children: [/* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "9"
		}), /* @__PURE__ */ jsx("path", { d: "M13.5 20.8v-7h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.7-.1-1.4-.2-2.1-.2-2.1 0-3.6 1.3-3.6 3.8V11H8.3v2.8h2.4v7" })]
	});
	if (platform === "Behance") return /* @__PURE__ */ jsxs("svg", {
		...commonProps,
		children: [/* @__PURE__ */ jsx("path", { d: "M3.5 6.5h5a3 3 0 0 1 0 6h-5zM3.5 12.5h5.75a3.25 3.25 0 0 1 0 6.5H3.5zM14.5 7h5" }), /* @__PURE__ */ jsx("path", { d: "M20.5 15.5h-7a3.5 3.5 0 1 0 6.35 2" })]
	});
	if (platform === "Dribbble") return /* @__PURE__ */ jsxs("svg", {
		...commonProps,
		children: [/* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "9"
		}), /* @__PURE__ */ jsx("path", { d: "M7.2 4.4c3.1 3.8 5.8 8.2 7.5 14.8M3.2 10.4c4.7.1 9.2-1.2 12.5-4.1M5.4 17.8c2.5-3.6 6.7-5.4 15.4-4.4" })]
	});
	return /* @__PURE__ */ jsxs("svg", {
		...commonProps,
		children: [
			/* @__PURE__ */ jsx("rect", {
				x: "3",
				y: "3",
				width: "18",
				height: "18",
				rx: "5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "4"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "17.4",
				cy: "6.7",
				r: ".8",
				fill: "currentColor",
				stroke: "none"
			})
		]
	});
}
var DESKTOP_CURSOR_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
var TOUCH_POINTER_QUERY = "(any-pointer: coarse)";
/**
* The hover layer over the native pointer. The pointer itself is the logo
* mark (see `--cursor-default` in app.css) and nothing follows it around the
* page; this only appears over something interactive: a gradient ring on
* links and buttons, a larger one on calls to action, a VIEW disc on work
* cards, an EXPLORE pill, and the platform's icon on social links. While a
* labelled disc or pill is showing, the native pointer steps aside so it
* never sits on top of the label.
*/
function CustomCursor() {
	const reduce = useReducedMotion();
	const [enabled, setEnabled] = useState(false);
	const [state, setState] = useState("default");
	const [ripple, setRipple] = useState(0);
	const x = useMotionValue(-100);
	const y = useMotionValue(-100);
	const rx = useSpring(x, {
		stiffness: 420,
		damping: 38,
		mass: .6
	});
	const ry = useSpring(y, {
		stiffness: 420,
		damping: 38,
		mass: .6
	});
	useEffect(() => {
		const desktopCursor = window.matchMedia(DESKTOP_CURSOR_QUERY);
		const touchPointer = window.matchMedia(TOUCH_POINTER_QUERY);
		const updateCapability = () => {
			const hasTouchInput = navigator.maxTouchPoints > 0;
			const shouldEnable = desktopCursor.matches && !touchPointer.matches && !hasTouchInput && !reduce;
			setEnabled(shouldEnable);
			if (!shouldEnable) {
				document.documentElement.classList.remove("has-hover-cursor", "cursor-bubble");
				x.set(-100);
				y.set(-100);
				setState("default");
			}
		};
		updateCapability();
		desktopCursor.addEventListener("change", updateCapability);
		touchPointer.addEventListener("change", updateCapability);
		return () => {
			desktopCursor.removeEventListener("change", updateCapability);
			touchPointer.removeEventListener("change", updateCapability);
			document.documentElement.classList.remove("has-hover-cursor", "cursor-bubble");
		};
	}, [
		reduce,
		x,
		y
	]);
	useEffect(() => {
		if (!enabled) return void 0;
		document.documentElement.classList.add("has-hover-cursor");
		const hide = () => {
			x.set(-100);
			y.set(-100);
			setState("default");
		};
		const move = (event) => {
			if (event.pointerType !== "mouse") {
				hide();
				return;
			}
			x.set(event.clientX);
			y.set(event.clientY);
		};
		const down = (event) => {
			if (event.pointerType !== "mouse") {
				hide();
				return;
			}
			setRipple((current) => current + 1);
		};
		const onVisibilityChange = () => {
			if (document.hidden) hide();
		};
		window.addEventListener("pointermove", move, { passive: true });
		window.addEventListener("pointerdown", down, { passive: true });
		window.addEventListener("pointercancel", hide, { passive: true });
		window.addEventListener("blur", hide);
		document.documentElement.addEventListener("mouseleave", hide);
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerdown", down);
			window.removeEventListener("pointercancel", hide);
			window.removeEventListener("blur", hide);
			document.documentElement.removeEventListener("mouseleave", hide);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			document.documentElement.classList.remove("has-hover-cursor", "cursor-bubble");
			hide();
		};
	}, [
		enabled,
		x,
		y
	]);
	useEffect(() => {
		if (!enabled) return void 0;
		const resolve = (target) => {
			const social = target.closest?.("[data-social-platform]");
			if (social) return `social:${social.dataset.socialPlatform}`;
			const marked = target.closest?.("[data-cursor]");
			if (marked) {
				const kind = marked.dataset.cursor;
				if (kind === "view" || kind === "explore") return kind;
			}
			return "default";
		};
		let frame = 0;
		let pending = null;
		const over = (event) => {
			pending = event.target;
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const next = resolve(pending);
				setState((current) => current === next ? current : next);
			});
		};
		window.addEventListener("mouseover", over, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("mouseover", over);
		};
	}, [enabled]);
	const isView = state === "view";
	const isExplore = state === "explore";
	const socialPlatform = state.startsWith("social:") ? state.slice(7) : null;
	const isSocial = Boolean(socialPlatform);
	const isLabel = isView || isExplore;
	const active = state !== "default";
	const covering = isLabel || isSocial;
	useEffect(() => {
		if (!enabled) return void 0;
		document.documentElement.classList.toggle("cursor-bubble", covering);
		return () => document.documentElement.classList.remove("cursor-bubble");
	}, [enabled, covering]);
	if (!enabled) return null;
	const auraOpacity = !active ? 0 : isLabel ? .32 : state === "cta" ? .8 : state === "hover" ? .65 : .4;
	const auraScale = isLabel ? 1.15 : state === "cta" ? 1.4 : state === "hover" ? 1.25 : isSocial ? 1.3 : 1.05;
	const width = isSocial ? 52 : isExplore ? 132 : isView ? 88 : state === "hover" ? 52 : state === "cta" ? 64 : 36;
	const height = isSocial ? 52 : isExplore ? 44 : isView ? 88 : state === "hover" ? 52 : state === "cta" ? 64 : 36;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(motion.div, {
		className: "pointer-events-none fixed left-0 top-0 z-[10018] h-28 w-28 rounded-full blur-2xl",
		style: {
			x: rx,
			y: ry,
			translateX: "-50%",
			translateY: "-50%",
			background: "linear-gradient(135deg, rgba(var(--brand-1-rgb),0.5), rgba(var(--brand-2-rgb),0.4), rgba(var(--brand-3-rgb),0.4))"
		},
		animate: {
			opacity: auraOpacity,
			scale: auraScale
		},
		transition: { duration: .25 }
	}), /* @__PURE__ */ jsxs(motion.div, {
		className: "pointer-events-none fixed left-0 top-0 z-[10020] flex items-center justify-center rounded-full",
		style: {
			x: rx,
			y: ry,
			translateX: "-50%",
			translateY: "-50%"
		},
		animate: {
			opacity: active ? 1 : 0,
			width,
			height,
			backgroundColor: isView ? "var(--ink)" : "rgba(255,255,255,0)",
			borderColor: isSocial ? "rgba(255,255,255,0)" : isView ? "var(--ink)" : state === "default" ? "var(--ink-faint)" : "var(--brand-1)",
			scale: ripple ? [
				1,
				1.35,
				1
			] : 1
		},
		transition: {
			type: "spring",
			stiffness: 320,
			damping: 26
		},
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-0 rounded-full",
				style: {
					background: state === "hover" || state === "cta" ? "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" : "transparent",
					filter: "blur(10px)",
					opacity: state === "default" || isLabel ? 0 : .7
				}
			}),
			(isExplore || isSocial) && /* @__PURE__ */ jsx(motion.span, {
				className: "absolute inset-0 rounded-full",
				initial: {
					opacity: 0,
					backgroundPositionX: "0%"
				},
				animate: {
					opacity: 1,
					backgroundPositionX: "100%"
				},
				transition: {
					duration: .2,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				style: {
					backgroundImage: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))",
					backgroundSize: "160% 100%",
					boxShadow: "0 10px 30px -10px rgba(var(--brand-1-rgb),0.55), 0 6px 20px -8px rgba(var(--brand-3-rgb),0.45)"
				}
			}),
			/* @__PURE__ */ jsxs(motion.span, {
				className: `absolute inset-0 flex items-center justify-center gap-1.5 font-display text-[10px] font-bold tracking-[0.12em] ${isExplore ? "text-white" : "text-[var(--bg)]"}`,
				animate: {
					opacity: isLabel ? 1 : 0,
					scale: isLabel ? 1 : .75
				},
				transition: {
					duration: .2,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				children: [isView ? "VIEW" : isExplore ? "EXPLORE" : "", isExplore && /* @__PURE__ */ jsx(motion.span, {
					"aria-hidden": true,
					className: "text-[11px] leading-none",
					initial: { x: 0 },
					animate: { x: 5 },
					transition: {
						duration: .2,
						ease: [
							.22,
							1,
							.36,
							1
						]
					},
					children: "↗"
				})]
			}),
			isSocial && /* @__PURE__ */ jsx(motion.span, {
				className: "absolute h-5 w-5 text-white",
				initial: {
					opacity: 0,
					scale: .65
				},
				animate: {
					opacity: 1,
					scale: 1
				},
				transition: {
					duration: .2,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				children: /* @__PURE__ */ jsx(SocialIcon, { platform: socialPlatform })
			}, socialPlatform),
			!isLabel && !isSocial && /* @__PURE__ */ jsx("span", { className: "absolute inset-[3px] rounded-full border border-[var(--ink-faint)]" })
		]
	})] });
}
//#endregion
//#region resources/js/components/motion/ScrollProgress.jsx
/**
* Whether this is a discipline page - /services/branding, /services/ui-ux.
*
* Those pages run a pinned showcase that carries its own position indicator,
* so a second bar reading the same scroll at the top of the screen says
* nothing extra and competes with it. The services index and the individual
* sub-service pages keep the bar.
*
* @param {string} url
* @return {boolean}
*/
function isDisciplinePage(url) {
	const segments = url.split(/[?#]/)[0].split("/").filter(Boolean);
	return segments.length === 2 && segments[0] === "services";
}
function ScrollProgress() {
	const { url } = usePage();
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 140,
		damping: 28,
		mass: .4
	});
	if (isDisciplinePage(url)) return null;
	return /* @__PURE__ */ jsx(motion.div, {
		className: "fixed left-0 top-0 z-[10000] h-[3px] w-full origin-left",
		style: {
			scaleX,
			background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))"
		},
		"aria-hidden": true
	});
}
//#endregion
//#region resources/js/components/motion/ShowcaseTransition.jsx
var EASE = [
	.22,
	1,
	.36,
	1
];
/** Flight length, and how far into it the route swaps underneath the visual. */
var FLIGHT_MS = 780;
var NAV_AT_MS = 400;
/** Never strand the overlay if a visit stalls or never finishes. */
var SAFETY_MS = 3200;
/**
* The scale the sub-service hero holds its photograph at once it has settled.
* The flying copy finishes on this exact value, so handing over is a fade
* between two identical frames rather than a jump in crop.
*/
var HERO_RESTING_SCALE = 1;
/**
* True when the visit now in flight was started by a showcase click, so the
* hero about to mount knows to appear already in place instead of playing its
* own entrance into a picture that is on screen.
*/
var arrivingFromShowcase = false;
/** Read once by the hero that mounts next; clears itself. */
function consumeShowcaseArrival() {
	const value = arrivingFromShowcase;
	arrivingFromShowcase = false;
	return value;
}
/**
* The layer that performs the flight. Mounted once, beside the page.
*
* Nothing here navigates on its own: it only ever runs in response to
* `expandTo`, which is wired to click.
*/
function ShowcaseTransition() {
	const [flight, setFlight] = useState(null);
	const [landed, setLanded] = useState(false);
	const timers = useRef([]);
	const frames = useRef([]);
	/**
	* Whether a flight is already under way. Held in a ref, not in state: the
	* listener below must be installed exactly once, because its cleanup
	* cancels the pending timers — including the one that performs the visit.
	*/
	const inFlight = useRef(false);
	useEffect(() => {
		const clearTimers = () => {
			timers.current.forEach(clearTimeout);
			timers.current = [];
			frames.current.forEach(cancelAnimationFrame);
			frames.current = [];
		};
		const onExpand = (event) => {
			const detail = event.detail;
			if (!detail) return;
			if (inFlight.current) return;
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				router.visit(detail.href);
				return;
			}
			inFlight.current = true;
			clearTimers();
			setLanded(false);
			setFlight(detail);
			document.documentElement.style.overflow = "hidden";
			timers.current.push(setTimeout(() => {
				skipCoverForNextVisit();
				arrivingFromShowcase = true;
				router.visit(detail.href, { onFinish: () => {
					if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
					else window.scrollTo(0, 0);
					frames.current.push(requestAnimationFrame(() => {
						frames.current.push(requestAnimationFrame(() => setLanded(true)));
					}));
				} });
			}, NAV_AT_MS));
			timers.current.push(setTimeout(() => {
				inFlight.current = false;
				setFlight(null);
				setLanded(false);
				document.documentElement.style.overflow = "";
			}, SAFETY_MS));
		};
		window.addEventListener("marketorr:showcase-expand", onExpand);
		return () => {
			window.removeEventListener("marketorr:showcase-expand", onExpand);
			clearTimers();
		};
	}, []);
	useEffect(() => {
		if (!landed) return void 0;
		const done = setTimeout(() => {
			inFlight.current = false;
			setFlight(null);
			setLanded(false);
			document.documentElement.style.overflow = "";
		}, 420);
		return () => clearTimeout(done);
	}, [landed]);
	return /* @__PURE__ */ jsx(AnimatePresence, { children: flight && /* @__PURE__ */ jsxs(motion.div, {
		className: "pointer-events-none fixed z-[10015] overflow-hidden",
		initial: {
			top: flight.rect.top,
			left: flight.rect.left,
			width: flight.rect.width,
			height: flight.rect.height,
			borderRadius: flight.radius
		},
		animate: {
			top: 0,
			left: 0,
			width: window.innerWidth,
			height: window.innerHeight,
			borderRadius: 0,
			transition: {
				duration: FLIGHT_MS / 1e3,
				ease: [...EASE]
			}
		},
		exit: {
			opacity: 0,
			transition: {
				duration: .34,
				ease: [...EASE]
			}
		},
		children: [
			/* @__PURE__ */ jsx(motion.img, {
				src: flight.src,
				alt: "",
				"aria-hidden": true,
				draggable: false,
				className: "h-full w-full object-cover",
				initial: { scale: 1.04 },
				animate: {
					scale: HERO_RESTING_SCALE,
					transition: {
						duration: FLIGHT_MS / 1e3,
						ease: [...EASE]
					}
				}
			}),
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "absolute inset-0",
				style: { background: "linear-gradient(180deg, rgba(5,5,10,0.68) 0%, rgba(5,5,10,0.38) 32%, rgba(5,5,10,0.42) 62%, rgba(5,5,10,0.84) 100%)" },
				initial: { opacity: 0 },
				animate: {
					opacity: 1,
					transition: {
						duration: FLIGHT_MS / 1e3,
						ease: [...EASE]
					}
				}
			}),
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "absolute inset-0",
				style: { background: `radial-gradient(90% 55% at 50% 108%, ${withAlpha(flight.accent ?? "#891FFB", "55")}, transparent 65%)` },
				initial: { opacity: 0 },
				animate: {
					opacity: 1,
					transition: {
						duration: FLIGHT_MS / 1e3,
						ease: [...EASE]
					}
				}
			}),
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "absolute inset-x-0 bottom-0 h-[4px]",
				style: { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
				initial: { scaleX: 0 },
				animate: {
					scaleX: 1,
					transition: {
						duration: FLIGHT_MS / 1e3,
						ease: [...EASE]
					}
				}
			})
		]
	}, "showcase-flight") });
}
//#endregion
//#region resources/js/components/Layout.jsx
function navigateToContact(event) {
	if (event.defaultPrevented) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	if (event.button !== void 0 && event.button !== 0) return;
	event.preventDefault();
	transitionTo("/contact");
}
/**
* Phone-only vertical CTA, pinned to the middle of the right edge.
*
* Anchored from the top at 50% with a half-height pull-back rather than from
* the bottom: the centre of the viewport is the one point that stays put on
* every phone size and as the browser chrome collapses, so the button sits in
* the same place on a small device as on a tall one and never drifts down over
* the content it is floating above.
*/
function MobileProjectButton() {
	return /* @__PURE__ */ jsxs(Link, {
		href: "/contact",
		onClick: navigateToContact,
		"data-cursor": "cta",
		"aria-label": "Start a project",
		className: "btn-press fixed right-2 top-1/2 z-[120] flex w-10 -translate-y-1/2 flex-col items-center rounded-full py-3.5 text-white shadow-[0_10px_28px_-12px_rgba(var(--brand-2-rgb),0.75)] lg:hidden",
		style: { background: "linear-gradient(180deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
		children: [/* @__PURE__ */ jsx("span", {
			className: "rotate-180 text-[9px] font-extrabold uppercase leading-none tracking-[0.16em] [writing-mode:vertical-rl]",
			children: "Start a Project"
		}), /* @__PURE__ */ jsx("span", {
			"aria-hidden": true,
			className: "mt-2 text-xs leading-none",
			children: "↗"
		})]
	});
}
function Layout({ children }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("a", {
			href: "#main",
			className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black",
			children: "Skip to content"
		}),
		/* @__PURE__ */ jsx(ScrollProgress, {}),
		/* @__PURE__ */ jsx(CustomCursor, {}),
		/* @__PURE__ */ jsx(SmoothScroll, {}),
		/* @__PURE__ */ jsx(AnnouncementBanner, {}),
		/* @__PURE__ */ jsx(Header, {}),
		/* @__PURE__ */ jsx(MobileProjectButton, {}),
		/* @__PURE__ */ jsxs(PageTransition, { children: [/* @__PURE__ */ jsx("main", {
			id: "main",
			children
		}), /* @__PURE__ */ jsx(Footer, {})] }),
		/* @__PURE__ */ jsx(ShowcaseTransition, {})
	] });
}
//#endregion
//#region resources/js/ssr.jsx
/**
* Server-side rendering entry, run by `php artisan inertia:start-ssr`.
*
* Mirrors app.jsx — same page resolution, default layout and theme provider —
* so the HTML the server sends is exactly what the client hydrates.
*/
createServer((page) => {
	setAssetBase(page.props?.assetBase);
	return createInertiaApp({
		page,
		render: ReactDOMServer.renderToString,
		resolve: async (name) => {
			const resolved = await (/* @__PURE__ */ Object.assign({
				"./pages/About.jsx": () => import("./assets/About-DC0tl0Zx.js"),
				"./pages/Admin/AuditLogs/Index.jsx": () => import("./assets/Index-DRoJV_23.js"),
				"./pages/Admin/Auth/Login.jsx": () => import("./assets/Login-Cwa7vBsO.js"),
				"./pages/Admin/Blocks/Index.jsx": () => import("./assets/Index-Bt-BOhSJ.js"),
				"./pages/Admin/Categories/Form.jsx": () => import("./assets/Form-CDd7U8Vr.js"),
				"./pages/Admin/Categories/Index.jsx": () => import("./assets/Index-LPIto3b-.js"),
				"./pages/Admin/CustomCode.jsx": () => import("./assets/CustomCode-DnfTDEsl.js"),
				"./pages/Admin/Dashboard.jsx": () => import("./assets/Dashboard-CydxuR7e.js"),
				"./pages/Admin/EmailTemplates/Index.jsx": () => import("./assets/Index-Ua61_hZC.js"),
				"./pages/Admin/Inquiries/Index.jsx": () => import("./assets/Index-C8yU0uCv.js"),
				"./pages/Admin/Inquiries/Show.jsx": () => import("./assets/Show-yrxK5r7h.js"),
				"./pages/Admin/Mail/Edit.jsx": () => import("./assets/Edit-DqiU9dEn.js"),
				"./pages/Admin/Media/Form.jsx": () => import("./assets/Form-BxAl8YW7.js"),
				"./pages/Admin/Media/Index.jsx": () => import("./assets/Index-sApY3N7E.js"),
				"./pages/Admin/Menus/Index.jsx": () => import("./assets/Index-CxsvxJit.js"),
				"./pages/Admin/Pages/Builder.jsx": () => import("./assets/Builder-BYNVwetX.js"),
				"./pages/Admin/Pages/Form.jsx": () => import("./assets/Form-BdM7l1l8.js"),
				"./pages/Admin/Pages/Index.jsx": () => import("./assets/Index-OIHOzOJp.js"),
				"./pages/Admin/Projects/Form.jsx": () => import("./assets/Form-ChNeeXzm.js"),
				"./pages/Admin/Projects/Index.jsx": () => import("./assets/Index-DF71nLTN.js"),
				"./pages/Admin/ServiceGroups/Form.jsx": () => import("./assets/Form-CEpC3OlF.js"),
				"./pages/Admin/ServiceGroups/Index.jsx": () => import("./assets/Index-CKjOnQaQ.js"),
				"./pages/Admin/Services/Form.jsx": () => import("./assets/Form-n-9RZLED.js"),
				"./pages/Admin/Services/Index.jsx": () => import("./assets/Index-Gln-b-SE.js"),
				"./pages/Admin/Settings.jsx": () => import("./assets/Settings-CBhkjuQC.js"),
				"./pages/Admin/SubServices/Form.jsx": () => import("./assets/Form-Cksr65Wd.js"),
				"./pages/Admin/SubServices/Index.jsx": () => import("./assets/Index-COUwzFzV.js"),
				"./pages/Admin/Users/Index.jsx": () => import("./assets/Index-Dni_X3n5.js"),
				"./pages/CmsPage.jsx": () => import("./assets/CmsPage-B8rUEjLf.js"),
				"./pages/ContactPage.jsx": () => import("./assets/ContactPage-DyUM6PBA.js"),
				"./pages/Home.jsx": () => import("./assets/Home-Bo9B-4AA.js"),
				"./pages/Privacy.jsx": () => import("./assets/Privacy-DlIbhwzm.js"),
				"./pages/Services/Index.jsx": () => import("./assets/Index-C1zwoYz4.js"),
				"./pages/Services/Show.jsx": () => import("./assets/Show-CielSNap.js"),
				"./pages/Services/SubShow.jsx": () => import("./assets/SubShow-CdZql8oE.js"),
				"./pages/Terms.jsx": () => import("./assets/Terms-CJg_fEax.js"),
				"./pages/Work/Index.jsx": () => import("./assets/Index-DwDYZJjY.js"),
				"./pages/Work/Portfolio.jsx": () => import("./assets/Portfolio-PlDRwHVS.js"),
				"./pages/Work/Show.jsx": () => import("./assets/Show-DenWPOWp.js"),
				"./pages/Work/UiuxProject.jsx": () => import("./assets/UiuxProject-BIxbjmys.js")
			}))[`./pages/${name}.jsx`]();
			resolved.default.layout = resolved.default.layout || ((children) => /* @__PURE__ */ jsx(Layout, { children }));
			return resolved;
		},
		setup: ({ App, props }) => /* @__PURE__ */ jsx(ThemeProvider, {
			initial: props.initialPage?.props?.theme,
			children: /* @__PURE__ */ jsx(App, { ...props })
		})
	});
});
//#endregion
export { markBarStyle as _, useBoxPointer as a, GradientButton as c, Tag as d, useTheme as f, MARK as g, COLORS as h, MagneticButton as i, GradientTitle as l, BRAND_SEQUENCE as m, transitionTo as n, BrandLogo as o, useThemeMotion as p, useTapIntent as r, assetUrl as s, consumeShowcaseArrival as t, SectionLabel as u, markGap as v, withAlpha as y };
