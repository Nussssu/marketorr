import { a as MARK, g as SectionLabel, o as markBarStyle, s as markGap, v as useTheme, y as useThemeMotion } from "../ssr.js";
import { useForm, usePage } from "@inertiajs/react";
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion } from "framer-motion";
//#region resources/js/components/ui/FastCollapse.jsx
/**
* A disclosure panel whose natural height is cached before interaction.
*
* Animating an explicit pixel height avoids the repeated intrinsic grid-track
* calculation caused by `0fr`/`1fr`. ResizeObserver keeps the cache accurate
* when copy wraps differently, fonts settle, or the viewport changes, without
* doing a synchronous measurement in the click handler.
*/
function FastCollapse({ open, id, children, className = "" }) {
	const panelRef = useRef(null);
	const contentRef = useRef(null);
	useLayoutEffect(() => {
		const panel = panelRef.current;
		const content = contentRef.current;
		if (!panel || !content) return void 0;
		const cacheHeight = () => {
			panel.style.setProperty("--collapse-height", `${content.getBoundingClientRect().height}px`);
		};
		cacheHeight();
		if (typeof ResizeObserver === "undefined") {
			window.addEventListener("resize", cacheHeight, { passive: true });
			return () => window.removeEventListener("resize", cacheHeight);
		}
		const observer = new ResizeObserver(cacheHeight);
		observer.observe(content);
		return () => observer.disconnect();
	}, []);
	return /* @__PURE__ */ jsx("div", {
		ref: panelRef,
		id,
		"aria-hidden": !open,
		className: "overflow-hidden transition-[height] duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
		style: {
			height: open ? "var(--collapse-height, auto)" : "0px",
			contain: "layout paint"
		},
		children: /* @__PURE__ */ jsx("div", {
			ref: contentRef,
			className,
			children
		})
	});
}
//#endregion
//#region resources/js/components/ui/OfficeMap.jsx
/**
* Office coordinates — Natore Tower, Plot 32D & E, Road 2, Sector 3,
* Uttara, Dhaka 1230. Geocoded to the midpoint of Road 2 in Sector 3;
* OpenStreetMap has no plot-level entry for the tower itself, so nudge
* these two numbers if the pin should sit on a specific plot.
*/
var MAP_CENTER = [23.8627, 90.3988];
var MAP_ZOOM = 16;
var MIN_ZOOM = 11;
/** Esri's Gray Canvas basemaps are only tiled to z16; beyond that Leaflet upscales. */
var MAX_NATIVE_ZOOM = 16;
var MAX_ZOOM = 17;
/**
* Esri World Gray Canvas — a purpose-built light/dark pair, keyless and
* unwatermarked. Note the {z}/{y}/{x} order, which is Esri's, not OSM's.
*/
var TILES = {
	light: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
	dark: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
};
var ATTRIBUTION = "<a href=\"https://www.esri.com/\" target=\"_blank\" rel=\"noreferrer\">Esri</a>, HERE, Garmin, © <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noreferrer\">OpenStreetMap</a>";
var HINT_MS = 1900;
var FADE_MS = 420;
/** Coarse pointers get the touch gesture model; fine pointers get the desktop one. */
function isCoarsePointer() {
	return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}
function prefersReducedMotion() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/**
* @param {boolean} coarse
* @return {object} Tile layer options shared by the initial layer and every theme swap.
*/
function tileOptions(coarse) {
	return {
		maxZoom: MAX_ZOOM,
		maxNativeZoom: MAX_NATIVE_ZOOM,
		keepBuffer: coarse ? 1 : 2,
		updateWhenIdle: coarse,
		attribution: ATTRIBUTION
	};
}
/**
* Themed Leaflet map of the studio. Tiles crossfade between the CARTO light
* and dark basemaps when the theme flips — the map instance itself is never
* torn down, so the view, zoom and open popup all survive the switch.
*
* Gesture model, chosen so the map never traps the page scroll:
* - touch: one finger scrolls the page, two fingers pan and pinch the map
* - mouse: wheel zoom stays off until the map is clicked, and turns back off
*   when the pointer leaves
*
* @param {{address?: string, directionsHref?: string, className?: string}} props
*/
/** Tile size Leaflet and Esri use, in px. */
var TILE_PX = 256;
/**
* The basemap tiles that cover the map box at its opening view, and where
* each sits relative to the box's centre — the same arithmetic Leaflet uses
* to lay out `MAP_CENTER` at `MAP_ZOOM`, so the preview lines up exactly with
* the live map that replaces it. `wide` tiles only show on wider boxes.
*
* @return {Array<{ x: number, y: number, left: number, top: number, wide: boolean }>}
*/
function previewTiles() {
	const scale = TILE_PX * 2 ** MAP_ZOOM;
	const [lat, lng] = MAP_CENTER;
	const sin = Math.sin(lat * Math.PI / 180);
	const cx = (lng + 180) / 360 * scale;
	const cy = (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
	const half = {
		narrow: [210, 115],
		wide: [440, 145]
	};
	const tiles = [];
	for (let x = Math.floor((cx - half.wide[0]) / TILE_PX); x <= Math.floor((cx + half.wide[0]) / TILE_PX); x++) for (let y = Math.floor((cy - half.wide[1]) / TILE_PX); y <= Math.floor((cy + half.wide[1]) / TILE_PX); y++) {
		const left = Math.round(x * TILE_PX - cx);
		const top = Math.round(y * TILE_PX - cy);
		const wide = left + TILE_PX < -half.narrow[0] || left > half.narrow[0] || top + TILE_PX < -half.narrow[1] || top > half.narrow[1];
		tiles.push({
			x,
			y,
			left,
			top,
			wide
		});
	}
	return tiles;
}
var PREVIEW_TILES = previewTiles();
function OfficeMap({ address = "", directionsHref = "#", className = "" }) {
	const { theme } = useTheme();
	const hostRef = useRef(null);
	const mapRef = useRef(null);
	const leafletRef = useRef(null);
	const tileRef = useRef(null);
	const tileUrlRef = useRef(null);
	const lenisPausedRef = useRef(false);
	const hintTimer = useRef(0);
	const [shouldLoad, setShouldLoad] = useState(false);
	const [ready, setReady] = useState(false);
	const [tilesShown, setTilesShown] = useState(false);
	const [hint, setHint] = useState("");
	const showHint = useCallback((message) => {
		window.clearTimeout(hintTimer.current);
		setHint(message);
		hintTimer.current = window.setTimeout(() => setHint(""), HINT_MS);
	}, []);
	const setLenisPaused = useCallback((paused) => {
		const lenis = window.__lenis;
		if (!lenis || lenisPausedRef.current === paused) return;
		lenisPausedRef.current = paused;
		if (paused) lenis.stop();
		else lenis.start();
	}, []);
	useEffect(() => {
		const host = hostRef.current;
		if (!host || shouldLoad) return void 0;
		if (typeof IntersectionObserver === "undefined") {
			setShouldLoad(true);
			return;
		}
		let idleId = 0;
		let timerId = 0;
		const loadMap = () => setShouldLoad(true);
		const scheduleLoad = () => {
			if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(loadMap, { timeout: 300 });
			else timerId = window.setTimeout(loadMap, 0);
		};
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			observer.disconnect();
			scheduleLoad();
		}, { rootMargin: "160px 0px" });
		observer.observe(host);
		return () => {
			observer.disconnect();
			if (idleId) window.cancelIdleCallback(idleId);
			window.clearTimeout(timerId);
		};
	}, [shouldLoad]);
	useEffect(() => {
		if (!shouldLoad) return void 0;
		let cancelled = false;
		const host = hostRef.current;
		if (!host) return;
		const coarse = isCoarsePointer();
		const reduce = prefersReducedMotion();
		const cleanups = [];
		import("leaflet").then((mod) => {
			const L = mod.default ?? mod;
			if (cancelled || !hostRef.current) return;
			leafletRef.current = L;
			const map = L.map(host, {
				center: MAP_CENTER,
				zoom: MAP_ZOOM,
				minZoom: MIN_ZOOM,
				maxZoom: MAX_ZOOM,
				zoomControl: false,
				attributionControl: true,
				dragging: !coarse,
				touchZoom: true,
				scrollWheelZoom: false,
				doubleClickZoom: true,
				keyboard: true,
				inertia: !coarse,
				inertiaDeceleration: 2600,
				easeLinearity: .22,
				zoomSnap: .25,
				zoomDelta: .5,
				wheelPxPerZoomLevel: 120,
				zoomAnimation: !reduce && !coarse,
				fadeAnimation: !reduce && !coarse,
				markerZoomAnimation: !reduce && !coarse
			});
			mapRef.current = map;
			map.attributionControl.setPrefix(false);
			const url = TILES[theme] ?? TILES.dark;
			tileUrlRef.current = url;
			tileRef.current = L.tileLayer(url, tileOptions(coarse)).addTo(map);
			const reveal = () => setTilesShown(true);
			tileRef.current.once("load", reveal);
			const revealSafety = window.setTimeout(reveal, 2500);
			cleanups.push(() => {
				window.clearTimeout(revealSafety);
				tileRef.current?.off("load", reveal);
			});
			L.control.zoom({
				position: "bottomright",
				zoomInTitle: "Zoom in",
				zoomOutTitle: "Zoom out"
			}).addTo(map);
			new (L.Control.extend({ onAdd() {
				const button = L.DomUtil.create("button", "mk-map__recenter");
				button.type = "button";
				button.title = "Recentre on the studio";
				button.setAttribute("aria-label", "Recentre on the studio");
				button.innerHTML = "<span aria-hidden=\"true\">◎</span>";
				L.DomEvent.disableClickPropagation(button);
				L.DomEvent.on(button, "click", (event) => {
					L.DomEvent.preventDefault(event);
					map.flyTo(MAP_CENTER, MAP_ZOOM, { duration: reduce ? 0 : .7 });
				});
				return button;
			} }))({ position: "bottomright" }).addTo(map);
			L.marker(MAP_CENTER, {
				keyboard: true,
				title: "Marketorr studio",
				icon: L.divIcon({
					className: "mk-map__pin-icon",
					html: "<span class=\"mk-map__pin\"></span><span class=\"mk-map__pulse\" aria-hidden=\"true\"></span>",
					iconSize: [26, 26],
					iconAnchor: [13, 13],
					popupAnchor: [0, -14]
				})
			}).addTo(map).bindPopup(`<p class="mk-map__popup-label">Marketorr</p><p class="mk-map__popup-address">${address}</p><a class="mk-map__popup-link" href="${directionsHref}" target="_blank" rel="noreferrer">Get directions ↗</a>`, {
				className: "mk-map__popup",
				closeButton: true,
				maxWidth: 240,
				autoPanPadding: [18, 18]
			});
			if (coarse) {
				let singleTouch = false;
				const onStart = (event) => {
					singleTouch = event.touches.length === 1;
				};
				const onMove = (event) => {
					if (!singleTouch || event.touches.length !== 1) return;
					singleTouch = false;
					showHint("Use two fingers to move the map");
				};
				host.addEventListener("touchstart", onStart, { passive: true });
				host.addEventListener("touchmove", onMove, { passive: true });
				cleanups.push(() => {
					host.removeEventListener("touchstart", onStart);
					host.removeEventListener("touchmove", onMove);
				});
			} else {
				const activate = () => {
					if (map.scrollWheelZoom.enabled()) return;
					map.scrollWheelZoom.enable();
					setLenisPaused(true);
					host.classList.add("is-wheel-active");
				};
				const deactivate = () => {
					if (!map.scrollWheelZoom.enabled()) return;
					map.scrollWheelZoom.disable();
					setLenisPaused(false);
					host.classList.remove("is-wheel-active");
				};
				const onWheel = () => {
					if (!map.scrollWheelZoom.enabled()) showHint("Click the map to zoom");
				};
				host.addEventListener("click", activate);
				host.addEventListener("focusin", activate);
				host.addEventListener("mouseleave", deactivate);
				host.addEventListener("focusout", deactivate);
				host.addEventListener("wheel", onWheel, { passive: true });
				cleanups.push(() => {
					host.removeEventListener("click", activate);
					host.removeEventListener("focusin", activate);
					host.removeEventListener("mouseleave", deactivate);
					host.removeEventListener("focusout", deactivate);
					host.removeEventListener("wheel", onWheel);
				});
			}
			let resizeFrame = 0;
			const observer = new ResizeObserver(() => {
				cancelAnimationFrame(resizeFrame);
				resizeFrame = requestAnimationFrame(() => map.invalidateSize({ animate: false }));
			});
			observer.observe(host);
			cleanups.push(() => {
				cancelAnimationFrame(resizeFrame);
				observer.disconnect();
			});
			setReady(true);
		});
		return () => {
			cancelled = true;
			window.clearTimeout(hintTimer.current);
			cleanups.forEach((fn) => fn());
			setLenisPaused(false);
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
			tileRef.current = null;
			tileUrlRef.current = null;
		};
	}, [shouldLoad]);
	useEffect(() => {
		const map = mapRef.current;
		const L = leafletRef.current;
		const nextUrl = TILES[theme] ?? TILES.dark;
		if (!map || !L || !ready || tileUrlRef.current === nextUrl) return;
		const previous = tileRef.current;
		const incoming = L.tileLayer(nextUrl, tileOptions(isCoarsePointer()));
		incoming.setOpacity(0);
		incoming.addTo(map);
		tileRef.current = incoming;
		tileUrlRef.current = nextUrl;
		let settled = false;
		let removeTimer = 0;
		const settle = () => {
			if (settled) return;
			settled = true;
			incoming.setOpacity(1);
			removeTimer = window.setTimeout(() => {
				if (previous && map.hasLayer(previous)) map.removeLayer(previous);
			}, FADE_MS);
		};
		incoming.once("load", settle);
		const safety = window.setTimeout(settle, 600);
		return () => {
			window.clearTimeout(safety);
			window.clearTimeout(removeTimer);
			incoming.off("load", settle);
		};
	}, [theme, ready]);
	return /* @__PURE__ */ jsxs("div", {
		className: `mk-map ${className}`.trim(),
		children: [
			/* @__PURE__ */ jsx("div", {
				ref: hostRef,
				className: "mk-map__canvas",
				role: "application",
				"aria-label": "Map of the Marketorr studio in Uttara, Dhaka"
			}),
			!tilesShown && /* @__PURE__ */ jsx("div", {
				className: "mk-map__preview",
				"aria-hidden": true,
				children: PREVIEW_TILES.map((tile) => /* @__PURE__ */ jsx("img", {
					src: (TILES[theme] ?? TILES.dark).replace("{z}", MAP_ZOOM).replace("{y}", tile.y).replace("{x}", tile.x),
					alt: "",
					width: TILE_PX,
					height: TILE_PX,
					loading: "lazy",
					decoding: "async",
					draggable: false,
					className: tile.wide ? "mk-map__preview-tile mk-map__preview-tile--wide" : "mk-map__preview-tile",
					style: {
						left: `calc(50% + ${tile.left}px)`,
						top: `calc(50% + ${tile.top}px)`
					}
				}, `${tile.x}-${tile.y}`))
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mk-map__hint",
				"data-visible": hint ? "true" : "false",
				"aria-live": "polite",
				children: hint
			})
		]
	});
}
//#endregion
//#region resources/js/lib/glow.js
/**
* Shared cursor-glow tuning.
*
* Every cursor-reactive background in the site reads these numbers, so the
* glow's size, falloff and weight stay identical in every section and can be
* retuned from one place.
*/
/** Marketorr pigments as raw channels, so alpha can be mixed per layer. */
var PIGMENTS = [
	[
		137,
		31,
		251
	],
	[
		80,
		122,
		244
	],
	[
		27,
		226,
		235
	]
];
var GLOW = {
	/** Tight radius: the colour stays near the cursor instead of washing the section. */
	radius: 150,
	/** Most of the energy sits inside the first third of the radius. */
	stops: [
		[0, 1],
		[.28, .45],
		[.6, .1],
		[1, 0]
	],
	/** Per-theme core alpha — enough presence to read, low enough to stay dark. */
	alpha: {
		light: .17,
		dark: .24
	},
	/** Small blur only: heavy blur is what used to spread the colour everywhere. */
	blur: {
		light: 12,
		dark: 10
	},
	/** Layer opacity, kept restrained so the glow never turns neon. */
	opacity: {
		light: .3,
		dark: .55
	},
	/** Saturation stays close to 1 — brand hues, not fluorescent ones. */
	saturate: {
		light: 1.02,
		dark: 1.08
	},
	/** Cursor easing; low value = soft, trailing follow. */
	lerp: .14
};
//#endregion
//#region resources/js/components/decor/InkField.jsx
/**
* Mouse-reactive watercolour field.
*
* Paints soft brand-coloured blobs along a lerped cursor path on a
* half-resolution canvas, smears each frame into the last (drawing the canvas
* back onto itself along the travel vector) and lets a CSS blur do the wet
* edges. Blends `screen` on the dark stage and `multiply` on paper, so the
* pigments read as light or ink without changing the palette.
*
* Coarse pointers and reduced-motion get a static painted wash instead — no
* canvas, no rAF.
*/
function InkField({ theme = "dark" }) {
	const hostRef = useRef(null);
	const canvasRef = useRef(null);
	const [painting, setPainting] = useState(false);
	useEffect(() => {
		const host = hostRef.current;
		const canvas = canvasRef.current;
		if (!host || !canvas) return void 0;
		const coarse = window.matchMedia("(pointer: coarse)").matches;
		const small = window.matchMedia("(max-width: 1023px)").matches;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (coarse || small || reduced) return void 0;
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return void 0;
		setPainting(true);
		const RES = .42;
		const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
		let w = 1;
		let h = 1;
		let rect = host.getBoundingClientRect();
		const EXCLUDE_BOX = "a, button, input, textarea, select, img, svg, form, [data-ink-exclude]";
		const EXCLUDE_TEXT = "h1, h2, h3, h4, h5, p, li, label, span[class*=\"uppercase\"]";
		const stage = host.parentElement ?? host;
		const PAD = 16;
		const maskCanvas = document.createElement("canvas");
		const maskCtx = maskCanvas.getContext("2d");
		/** @type {{x: number, y: number, w: number, h: number}[]} */
		let holes = [];
		const buildMask = () => {
			if (!maskCtx) return;
			maskCanvas.width = w;
			maskCanvas.height = h;
			maskCtx.clearRect(0, 0, w, h);
			const sx = w / Math.max(1, rect.width);
			const sy = h / Math.max(1, rect.height);
			maskCtx.filter = `blur(${Math.max(4, Math.round(10 * sx))}px)`;
			maskCtx.fillStyle = "#000";
			holes = [];
			const punch = (r) => {
				if (r.width < 4 || r.height < 4) return;
				if (r.bottom < rect.top || r.top > rect.bottom) return;
				const x = r.left - rect.left;
				const y = r.top - rect.top;
				holes.push({
					x,
					y,
					w: r.width,
					h: r.height
				});
				maskCtx.beginPath();
				maskCtx.roundRect((x - PAD) * sx, (y - PAD) * sy, (r.width + 32) * sx, (r.height + 32) * sy, Math.max(8, 26 * sx));
				maskCtx.fill();
			};
			stage.querySelectorAll(EXCLUDE_BOX).forEach((el) => {
				if (host.contains(el)) return;
				punch(el.getBoundingClientRect());
			});
			const range = document.createRange();
			stage.querySelectorAll(EXCLUDE_TEXT).forEach((el) => {
				if (host.contains(el)) return;
				if (el.closest(EXCLUDE_BOX)) return;
				range.selectNodeContents(el);
				const lines = range.getClientRects();
				if (!lines.length) {
					punch(el.getBoundingClientRect());
					return;
				}
				for (let i = 0; i < lines.length; i += 1) punch(lines[i]);
			});
			maskCtx.filter = "none";
		};
		/** True when the brush sits over content, so no new pigment is laid down there. */
		const overContent = (bx, by) => {
			const px = bx / w * rect.width;
			const py = by / h * rect.height;
			return holes.some((r) => px >= r.x - 8 && px <= r.x + r.w + 8 && py >= r.y - 8 && py <= r.y + r.h + 8);
		};
		const resize = () => {
			rect = host.getBoundingClientRect();
			w = Math.max(1, Math.round(rect.width * RES * dpr));
			h = Math.max(1, Math.round(rect.height * RES * dpr));
			canvas.width = w;
			canvas.height = h;
			buildMask();
		};
		resize();
		const target = {
			x: w * .5,
			y: h * .45
		};
		const brush = {
			x: target.x,
			y: target.y
		};
		let prevX = brush.x;
		let prevY = brush.y;
		let lastMove = -Infinity;
		let visible = true;
		let raf = 0;
		let lastPaint = 0;
		const onMove = (e) => {
			const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
			const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
			if (nx < -.2 || nx > 1.2 || ny < -.2 || ny > 1.2) return;
			target.x = nx * w;
			target.y = ny * h;
			lastMove = performance.now();
		};
		const frame = (time) => {
			raf = requestAnimationFrame(frame);
			if (!visible) return;
			if (time - lastMove > 2600 || time - lastPaint < 32) return;
			lastPaint = time;
			brush.x += (target.x - brush.x) * .075;
			brush.y += (target.y - brush.y) * .075;
			const vx = brush.x - prevX;
			const vy = brush.y - prevY;
			prevX = brush.x;
			prevY = brush.y;
			const speed = Math.hypot(vx, vy);
			ctx.globalCompositeOperation = "copy";
			ctx.globalAlpha = .95;
			ctx.drawImage(canvas, vx * .6, vy * .6, w, h);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "lighter";
			const angle = Math.atan2(vy, vx);
			const drag = Math.min(14, speed * 1.2);
			const radius = Math.min(w, h) * .12 + speed * .7;
			if (time - lastMove < 180 && !overContent(brush.x, brush.y)) for (let i = 0; i < PIGMENTS.length; i += 1) {
				const pigment = PIGMENTS[(i + Math.floor(time / 2600)) % PIGMENTS.length];
				const spread = drag * (i - 1);
				const px = brush.x + Math.cos(angle) * spread + Math.sin(time / 2200 + i) * 12;
				const py = brush.y + Math.sin(angle) * spread + Math.cos(time / 2600 + i) * 12;
				const alpha = .042 + Math.min(.045, speed * .003);
				const stretch = 1 + Math.min(.85, speed * .05);
				ctx.save();
				ctx.translate(px, py);
				ctx.rotate(angle);
				ctx.scale(stretch, 1 / Math.sqrt(stretch));
				const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
				GLOW.stops.forEach(([offset, weight]) => {
					grad.addColorStop(offset, `rgba(${pigment[0]},${pigment[1]},${pigment[2]},${alpha * weight})`);
				});
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(0, 0, radius, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}
			if (maskCanvas.width) {
				ctx.globalCompositeOperation = "destination-out";
				ctx.drawImage(maskCanvas, 0, 0, w, h);
			}
			ctx.globalCompositeOperation = "source-over";
		};
		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			canvas.style.visibility = visible ? "" : "hidden";
		}, { rootMargin: "10% 0px" });
		io.observe(host);
		const ro = new ResizeObserver(resize);
		ro.observe(host);
		const onScroll = () => {
			rect = host.getBoundingClientRect();
		};
		window.addEventListener("mousemove", onMove, { passive: true });
		window.addEventListener("scroll", onScroll, { passive: true });
		raf = requestAnimationFrame(frame);
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			ro.disconnect();
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);
	const light = theme === "light";
	return /* @__PURE__ */ jsxs("div", {
		ref: hostRef,
		className: "pointer-events-none absolute inset-0 overflow-hidden",
		"aria-hidden": true,
		children: [/* @__PURE__ */ jsx("canvas", {
			ref: canvasRef,
			className: "h-full w-full",
			style: {
				display: painting ? "block" : "none",
				filter: `blur(${light ? GLOW.blur.light : GLOW.blur.dark}px) saturate(${light ? GLOW.saturate.light : GLOW.saturate.dark})`,
				mixBlendMode: light ? "multiply" : "screen",
				opacity: light ? GLOW.opacity.light : GLOW.opacity.dark,
				transform: "scale(1.08)"
			}
		}), !painting && /* @__PURE__ */ jsx("div", {
			className: "absolute inset-0",
			style: {
				background: "radial-gradient(60% 50% at 22% 18%, rgba(137,31,251,0.16), transparent 70%), radial-gradient(55% 45% at 78% 30%, rgba(80,122,244,0.14), transparent 70%), radial-gradient(70% 55% at 45% 92%, rgba(27,226,235,0.12), transparent 72%)",
				filter: "blur(24px)",
				opacity: light ? .6 : .9
			}
		})]
	});
}
//#endregion
//#region resources/js/components/decor/BrandBars.jsx
/** Height of the tallest bar: the logo's proportions set the rest. */
var MARK_SIZE = "clamp(200px, 26vw, 300px)";
/**
* The Marketorr mark's three bars, rising from the bottom edge and drifting
* slowly — the background that closes the landing page just above the footer.
*
* Positioned absolutely against its nearest positioned ancestor and purely
* decorative. Motion follows the theme's float strength and stops under
* reduced motion. `className` adds to the wrapper, e.g. to layer it.
*
* @param {{ className?: string }} props
*/
function BrandBars({ className = "" }) {
	const reduce = useReducedMotion();
	const fx = useThemeMotion();
	return /* @__PURE__ */ jsx("div", {
		className: `pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center opacity-30 ${className}`.trimEnd(),
		style: { gap: markGap(MARK_SIZE) },
		"aria-hidden": true,
		children: MARK.colors.map((color, index) => /* @__PURE__ */ jsx(motion.span, {
			animate: reduce ? void 0 : { y: [
				20 * fx.float,
				-10 * fx.float,
				20 * fx.float
			] },
			transition: {
				duration: 7 + index * 2,
				repeat: Infinity,
				ease: "easeInOut"
			},
			className: "border",
			style: {
				...markBarStyle(MARK_SIZE, index),
				background: `linear-gradient(180deg, ${color}44, transparent)`,
				borderColor: `${color}33`
			}
		}, color))
	});
}
//#endregion
//#region resources/js/components/sections/Contact.jsx
/** Project types offered by the inquiry form. */
var TYPES = ["Branding", "UI/UX"];
/** Budget bands offered by the inquiry form. */
var BUDGETS = [
	"$10k - $25k",
	"Under $10k",
	"$25k - $50k",
	"$50k+",
	"Not sure yet"
];
var BRAND_GRADIENT = "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)";
/**
* A blank inquiry: the form's starting state, and what "Send another message"
* returns it to.
*
* The form is reset to this explicitly rather than with `reset()`: after a
* successful submit Inertia keeps the submitted values as the form's new
* defaults, so `reset()` would bring the previous inquiry straight back.
*/
var BLANK_INQUIRY = {
	name: "",
	email: "",
	phone: "",
	company: "",
	type: "",
	budget: "",
	message: "",
	nickname: ""
};
/**
* Omnira-style reveal choreography, retuned for Marketorr's tokens.
*
* The reference runs one scroll-based sequence everywhere: a short rise +
* fade, lines unmasked top-to-bottom, children staggered so a block reads in
* order, sections arriving once and then holding still. Everything below is
* transform + opacity only (no blur, no scroll-linked parallax, no canvas),
* so it stays on the compositor at 60fps on desktop and mobile.
*/
/**
* Soft spring entrances: every block rises a short distance and settles with
* one small, controlled overshoot — the premium bounce. Springs are tuned
* stiff with high damping so there is exactly one gentle settle, never a
* wobble, and each animation is over in well under a second. Transform and
* opacity only, so everything stays on the compositor.
*/
var SPRING_RISE = {
	type: "spring",
	stiffness: 280,
	damping: 30,
	mass: 1
};
var SPRING_LINE = {
	type: "spring",
	stiffness: 330,
	damping: 33,
	mass: 1
};
var SPRING_BOX = {
	type: "spring",
	stiffness: 250,
	damping: 26,
	mass: .95
};
/** Children of a group arrive in sequence, so a block reads top-to-bottom. */
var omniGroup = {
	hidden: {},
	show: { transition: { staggerChildren: .06 } }
};
/** Heading lines unmask a touch faster than the block rise around them. */
var lineGroup = {
	hidden: {},
	show: { transition: { staggerChildren: .06 } }
};
/** The page's reveal: a short spring rise that bounces once and settles. */
var omniRise = {
	hidden: {
		opacity: 0,
		y: 22
	},
	show: {
		opacity: 1,
		y: 0,
		transition: SPRING_RISE
	}
};
/** Masked heading lines: each line springs up out of its own mask. */
var omniLine = {
	hidden: { y: "110%" },
	show: {
		y: "0%",
		transition: SPRING_LINE
	}
};
var faqBox = {
	hidden: {
		opacity: 0,
		y: 24
	},
	show: {
		opacity: 1,
		y: 0,
		transition: SPRING_BOX
	}
};
/** Below-fold groups trigger the moment they enter, play once, then rest. */
var revealViewport = {
	once: true,
	amount: .15,
	margin: "0px 0px -5% 0px"
};
/**
* The questions are drawn only from what the site already states: the two
* practices and their sub-services, the reply window and NDA note carried by
* this form, and the studio address in settings. Nothing here asserts a
* timeline, a price or a capability that Marketorr has not published.
*/
var FAQS = [
	{
		q: "What does Marketorr do?",
		a: "Two practices. Branding: identities that demand attention. UI/UX: interfaces engineered to convert."
	},
	{
		q: "What sits under Branding?",
		a: "Brand Strategy, Brand Identity Design, Rebranding, Packaging Design, Motion Branding and Brand Guidelines."
	},
	{
		q: "What sits under UI/UX?",
		a: "Website UI/UX Design, Mobile App UI/UX, SaaS Product Design, UX Research & Strategy, Wireframing & Prototyping and Design Systems."
	},
	{
		q: "How soon will you reply?",
		a: "We reply within 24–48 hours of receiving an inquiry."
	},
	{
		q: "What do you need to start?",
		a: "Your name and email, the project type, a budget range, and a note on your goals, timeline and what success looks like."
	},
	{
		q: "Do you work with NDAs?",
		a: "Yes, inquiries are NDA-friendly, and we never pass your details on."
	},
	{
		q: "Where is the studio?",
		a: "Remote-first and working worldwide, from Natore Tower, Plot 32D & E, Road 2, Sector 3, Uttara, Dhaka 1230."
	}
];
/** Small ruled chip that opens each block, as the section labels do elsewhere. */
function BlockChip({ children }) {
	return /* @__PURE__ */ jsxs(motion.span, {
		variants: omniRise,
		className: "inline-flex h-7 w-fit shrink-0 select-none items-center gap-2 self-start rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]",
		children: [/* @__PURE__ */ jsx("span", {
			className: "h-1.5 w-1.5 rounded-full",
			style: { background: BRAND_GRADIENT },
			"aria-hidden": true
		}), children]
	});
}
/**
* One question. The answer opens with a pure-CSS grid-rows transition, so
* toggling never measures layout in JS and the motion stays smooth even
* mid-scroll: the panel glides open while its text fades and drifts up a
* few pixels, and the plus rotates into a cross. Only one answer is open
* at a time; clicking the open row closes it.
*/
var FaqRow = memo(function FaqRow({ item, index, open, onToggle, reduce }) {
	const id = `faq-panel-${index}`;
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: reduce ? false : "hidden",
		whileInView: "show",
		viewport: revealViewport,
		variants: reduce ? void 0 : faqBox,
		className: "overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => onToggle(index),
			"aria-expanded": open,
			"aria-controls": id,
			"data-cursor": "explore",
			className: "group flex h-14 w-full items-center gap-5 px-5 text-left",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: `font-display text-[12px] font-bold tracking-[0.18em] transition-colors duration-100 ${open ? "bg-clip-text text-transparent" : "text-[var(--ink-faint)]"}`,
					style: open ? { backgroundImage: BRAND_GRADIENT } : void 0,
					"aria-hidden": true,
					children: String(index + 1).padStart(2, "0")
				}),
				/* @__PURE__ */ jsx("span", {
					className: "min-w-0 flex-1 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-[var(--ink)] md:text-[17px]",
					children: item.q
				}),
				/* @__PURE__ */ jsx("span", {
					className: "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-colors duration-100 group-hover:border-transparent",
					style: open ? {
						background: BRAND_GRADIENT,
						borderColor: "transparent"
					} : void 0,
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("span", {
						className: `text-[16px] font-light leading-none transition-transform duration-[120ms] ease-out motion-reduce:transition-none ${open ? "rotate-45 text-white" : "rotate-0 text-[var(--ink)]"}`,
						children: "+"
					})
				})
			]
		}), /* @__PURE__ */ jsx(FastCollapse, {
			open,
			id,
			children: /* @__PURE__ */ jsx("p", {
				className: `max-w-[58ch] pb-5 pl-[4.4rem] pr-8 text-[14px] leading-[22px] text-[var(--mute)] transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none ${open ? "translate-y-0 opacity-100" : "-translate-y-0.5 opacity-0"}`,
				children: item.a
			})
		})]
	});
});
/**
* Keep accordion state inside the FAQ subtree. Toggling an answer must not
* re-render the contact form and map above it.
*/
function FaqList({ reduce }) {
	const [openFaq, setOpenFaq] = useState(-1);
	const toggleFaq = useCallback((index) => {
		setOpenFaq((current) => current === index ? -1 : index);
	}, []);
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-3 lg:h-full lg:justify-between",
		children: FAQS.map((item, index) => /* @__PURE__ */ jsx(FaqRow, {
			item,
			index,
			open: openFaq === index,
			onToggle: toggleFaq,
			reduce
		}, item.q))
	});
}
/** Live studio time. Seconds tick, so the strip reads as a signal, not a label. */
function StudioClock() {
	const [now, setNow] = useState(() => /* @__PURE__ */ new Date());
	useEffect(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	const time = new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
		timeZone: "Asia/Dhaka"
	}).format(now);
	return /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "h-1.5 w-1.5 rounded-full",
				style: { background: BRAND_GRADIENT },
				"aria-hidden": true
			}),
			"Local time",
			/* @__PURE__ */ jsx("span", {
				className: "tabular-nums text-[var(--ink)]",
				suppressHydrationWarning: true,
				children: time
			})
		]
	});
}
function Contact({ heroHeading = false }) {
	const reduce = useReducedMotion();
	const fx = useThemeMotion();
	const [showSuccess, setShowSuccess] = useState(false);
	const scrollReveal = reduce ? {} : {
		initial: "hidden",
		whileInView: "show",
		viewport: revealViewport
	};
	const { settings } = usePage().props;
	const { contactEmail, contactPhone, locationText, socials, address, directionsUrl } = settings;
	const socialLinks = [
		{
			label: "LinkedIn",
			href: socials.linkedin
		},
		{
			label: "Behance",
			href: socials.behance
		},
		{
			label: "Dribbble",
			href: socials.dribbble
		},
		{
			label: "Instagram",
			href: socials.instagram
		},
		{
			label: "Facebook",
			href: socials.facebook
		}
	].filter((s) => s.href);
	const { data, setData, post, processing, errors, clearErrors } = useForm({ ...BLANK_INQUIRY });
	const submit = (e) => {
		e.preventDefault();
		post("/contact", {
			preserveScroll: true,
			onSuccess: () => {
				setShowSuccess(true);
			}
		});
	};
	return /* @__PURE__ */ jsx(Fragment$1, { children: /* @__PURE__ */ jsxs("section", {
		id: "contact",
		className: "noise relative overflow-hidden bg-[var(--bg)] pt-[clamp(5rem,9vw,9rem)] pb-16 lg:pb-20",
		children: [
			/* @__PURE__ */ jsx(InkField, { theme: fx.theme }),
			/* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none absolute inset-0",
				"aria-hidden": true,
				children: [/* @__PURE__ */ jsx(motion.span, {
					whileInView: reduce ? void 0 : {
						x: [
							0,
							40,
							0
						],
						opacity: [
							.5,
							.75,
							.5
						]
					},
					viewport: {
						once: false,
						margin: "10% 0px"
					},
					transition: {
						duration: 15,
						repeat: Infinity,
						ease: "easeInOut"
					},
					className: "absolute -left-32 top-[8%] h-[26rem] w-[26rem] rounded-full blur-3xl",
					style: { background: "radial-gradient(circle, rgba(137,31,251,0.12), transparent 65%)" }
				}), /* @__PURE__ */ jsx(motion.span, {
					whileInView: reduce ? void 0 : {
						x: [
							0,
							-44,
							0
						],
						opacity: [
							.45,
							.7,
							.45
						]
					},
					viewport: {
						once: false,
						margin: "10% 0px"
					},
					transition: {
						duration: 18,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 2
					},
					className: "absolute -right-32 bottom-[4%] h-[28rem] w-[28rem] rounded-full blur-3xl",
					style: { background: "radial-gradient(circle, rgba(27,226,235,0.10), transparent 65%)" }
				})]
			}),
			/* @__PURE__ */ jsx(BrandBars, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "container-x relative",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid gap-12 lg:grid-cols-[minmax(0,1fr)_600px] lg:grid-rows-[auto_1fr_auto] lg:items-stretch lg:gap-x-10 lg:gap-y-0",
					children: [
						/* @__PURE__ */ jsx(motion.div, {
							...scrollReveal,
							variants: reduce ? void 0 : omniRise,
							className: "lg:col-start-1 lg:row-start-1",
							children: /* @__PURE__ */ jsx(SectionLabel, { name: "CONTACT" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col lg:col-start-1 lg:row-start-2",
							children: [
								/* @__PURE__ */ jsxs(motion.h2, {
									...scrollReveal,
									variants: reduce ? void 0 : lineGroup,
									className: "display-lg mt-7 uppercase text-[var(--ink-strong)]",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "mask-line",
											children: /* @__PURE__ */ jsx(motion.span, {
												variants: reduce ? void 0 : omniLine,
												className: "mask-inner",
												children: "Have a project?"
											})
										}),
										/* @__PURE__ */ jsx("span", {
											className: "mask-line",
											children: /* @__PURE__ */ jsx(motion.span, {
												variants: reduce ? void 0 : omniLine,
												className: "mask-inner text-gradient",
												children: "Let’s make"
											})
										}),
										/* @__PURE__ */ jsx("span", {
											className: "mask-line",
											children: /* @__PURE__ */ jsx(motion.span, {
												variants: reduce ? void 0 : omniLine,
												className: "mask-inner text-gradient",
												children: "it matter."
											})
										})
									]
								}),
								/* @__PURE__ */ jsx(motion.p, {
									...scrollReveal,
									variants: reduce ? void 0 : omniRise,
									className: "mt-7 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]",
									children: "Tell us about the work and we will come back with a clear direction, scope and next steps. Two practices: Branding, and UI/UX."
								}),
								/* @__PURE__ */ jsxs(motion.div, {
									...scrollReveal,
									variants: reduce ? void 0 : omniRise,
									className: "mt-9 grid gap-6 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ jsx("span", {
												className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
												style: { background: "color-mix(in srgb, #891FFB 14%, transparent)" },
												"aria-hidden": true,
												children: /* @__PURE__ */ jsxs("svg", {
													viewBox: "0 0 24 24",
													className: "h-[18px] w-[18px]",
													fill: "none",
													stroke: "#891FFB",
													strokeWidth: "1.8",
													strokeLinecap: "round",
													strokeLinejoin: "round",
													children: [/* @__PURE__ */ jsx("rect", {
														x: "2.5",
														y: "4.5",
														width: "19",
														height: "15",
														rx: "2.5"
													}), /* @__PURE__ */ jsx("path", { d: "m3 6.5 9 6 9-6" })]
												})
											}), /* @__PURE__ */ jsxs("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ jsx("span", {
													className: "block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]",
													children: "Email"
												}), /* @__PURE__ */ jsx("a", {
													href: `mailto:${contactEmail}`,
													className: "link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]",
													children: contactEmail
												})]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ jsx("span", {
												className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
												style: { background: "color-mix(in srgb, #507AF4 14%, transparent)" },
												"aria-hidden": true,
												children: /* @__PURE__ */ jsxs("svg", {
													viewBox: "0 0 24 24",
													className: "h-[18px] w-[18px]",
													fill: "none",
													stroke: "#507AF4",
													strokeWidth: "1.8",
													strokeLinecap: "round",
													strokeLinejoin: "round",
													children: [/* @__PURE__ */ jsx("path", { d: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" }), /* @__PURE__ */ jsx("circle", {
														cx: "12",
														cy: "10",
														r: "2.6"
													})]
												})
											}), /* @__PURE__ */ jsxs("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ jsx("span", {
													className: "block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]",
													children: "Location"
												}), /* @__PURE__ */ jsx("span", {
													className: "mt-1 block text-[14px] font-semibold text-[var(--ink)]",
													children: locationText
												})]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ jsx("span", {
												className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
												style: { background: "color-mix(in srgb, #1BE2EB 16%, transparent)" },
												"aria-hidden": true,
												children: /* @__PURE__ */ jsxs("svg", {
													viewBox: "0 0 24 24",
													className: "h-[18px] w-[18px]",
													fill: "none",
													stroke: "#1BE2EB",
													strokeWidth: "1.8",
													strokeLinecap: "round",
													strokeLinejoin: "round",
													children: [
														/* @__PURE__ */ jsx("circle", {
															cx: "9",
															cy: "9",
															r: "3"
														}),
														/* @__PURE__ */ jsx("path", { d: "M2.8 19a6.4 6.4 0 0 1 12.4 0" }),
														/* @__PURE__ */ jsx("path", { d: "M16.5 7.2a3 3 0 0 1 0 5.6M18.4 19a6.3 6.3 0 0 0-2.1-4" })
													]
												})
											}), /* @__PURE__ */ jsxs("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ jsx("span", {
													className: "block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]",
													children: "Socials"
												}), /* @__PURE__ */ jsx("span", {
													className: "mt-1 flex gap-3 text-[14px] font-semibold text-[var(--ink)]",
													children: socialLinks.slice(0, 2).map((social) => /* @__PURE__ */ jsx("a", {
														href: social.href,
														target: "_blank",
														rel: "noreferrer",
														className: "link-underline btn-press",
														children: social.label
													}, social.label))
												})]
											})]
										})
									]
								}),
								/* @__PURE__ */ jsx(motion.div, {
									...scrollReveal,
									variants: reduce ? void 0 : omniRise,
									className: "mt-9 w-full",
									children: /* @__PURE__ */ jsx(OfficeMap, {
										address,
										directionsHref: directionsUrl
									})
								}),
								/* @__PURE__ */ jsx("a", {
									href: directionsUrl,
									target: "_blank",
									rel: "noreferrer",
									className: "link-underline btn-press mt-3 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)] lg:hidden",
									children: "Open in Google Maps →"
								}),
								contactPhone && /* @__PURE__ */ jsx(motion.p, {
									...scrollReveal,
									variants: reduce ? void 0 : omniRise,
									className: "mt-3 text-[14px] font-semibold text-[var(--ink)] lg:hidden",
									children: /* @__PURE__ */ jsx("a", {
										href: `tel:${contactPhone.replace(/[^+\d]/g, "")}`,
										className: "link-underline btn-press",
										children: contactPhone
									})
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "hidden lg:col-start-1 lg:row-start-3 lg:block",
							children: [/* @__PURE__ */ jsx("a", {
								href: directionsUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "link-underline btn-press mt-4 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
								children: "Open in Google Maps →"
							}), contactPhone && /* @__PURE__ */ jsx(motion.p, {
								...scrollReveal,
								variants: reduce ? void 0 : omniRise,
								className: "mt-4 text-[14px] font-semibold text-[var(--ink)]",
								children: /* @__PURE__ */ jsx("a", {
									href: `tel:${contactPhone.replace(/[^+\d]/g, "")}`,
									className: "link-underline btn-press",
									children: contactPhone
								})
							})]
						}),
						/* @__PURE__ */ jsxs(motion.form, {
							...scrollReveal,
							id: "project-inquiry",
							onSubmit: submit,
							variants: reduce ? void 0 : omniRise,
							className: "scroll-mt-28 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-7 md:p-9 lg:col-start-2 lg:row-start-2 lg:mt-7 lg:flex lg:h-[calc(100%-1.75rem)] lg:flex-col",
							"aria-label": "Project inquiry form",
							children: [/* @__PURE__ */ jsx("div", {
								className: "absolute left-[-9999px] top-auto h-px w-px overflow-hidden",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsxs("label", { children: ["Nickname", /* @__PURE__ */ jsx("input", {
									type: "text",
									name: "nickname",
									value: data.nickname,
									onChange: (e) => setData("nickname", e.target.value),
									tabIndex: -1,
									autoComplete: "off"
								})] })
							}), showSuccess ? /* @__PURE__ */ jsxs("div", {
								className: "flex flex-1 flex-col items-center justify-center py-12 text-center",
								role: "status",
								"aria-live": "polite",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "grid h-16 w-16 place-items-center rounded-full text-white",
										style: { background: BRAND_GRADIENT },
										"aria-hidden": true,
										children: /* @__PURE__ */ jsx("svg", {
											viewBox: "0 0 24 24",
											className: "h-8 w-8",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "2.2",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											children: /* @__PURE__ */ jsx("path", { d: "m5 12 4 4L19 6" })
										})
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "mt-6 font-display text-[clamp(1.3rem,1.8vw,26px)] font-extrabold tracking-[-0.01em] text-[var(--ink-strong)]",
										children: "Thank you — your inquiry is in"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-3 max-w-[38ch] text-[14px] leading-[22px] text-[var(--mute)]",
										children: [
											"We’ve received your details and will reply within 24–48 hours. A copy of the conversation will come from ",
											contactEmail,
											"."
										]
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => {
											setData({ ...BLANK_INQUIRY });
											clearErrors();
											setShowSuccess(false);
										},
										"data-cursor": "cta",
										className: "btn-press mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--field-line)] px-7 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition-colors duration-300 hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]",
										children: "Send another message"
									})
								]
							}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
								/* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]",
									children: [/* @__PURE__ */ jsx("span", {
										className: "h-1.5 w-1.5 rounded-full",
										style: { background: BRAND_GRADIENT },
										"aria-hidden": true
									}), "Send us a message"]
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "mt-4 font-display text-[clamp(1.4rem,2vw,28px)] font-extrabold tracking-[-0.01em] text-[var(--ink-strong)]",
									children: "Let’s build something great"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-[14px] leading-[22px] text-[var(--mute)]",
									children: "Share a few details and we will get in touch shortly."
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-7 grid gap-5 sm:grid-cols-2 lg:flex-1 lg:grid-rows-[auto_auto_auto_1fr]",
									children: [
										[
											{
												key: "name",
												label: "Your name*",
												type: "text",
												ph: "Jane Cooper"
											},
											{
												key: "email",
												label: "Email*",
												type: "email",
												ph: "jane@company.com"
											},
											{
												key: "phone",
												label: "Phone",
												type: "tel",
												ph: "+880 1700 000000"
											},
											{
												key: "company",
												label: "Company",
												type: "text",
												ph: "Company Inc."
											}
										].map((f) => /* @__PURE__ */ jsxs("label", {
											className: "block",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
													children: f.label
												}),
												/* @__PURE__ */ jsx("input", {
													type: f.type,
													value: data[f.key],
													onChange: (e) => setData(f.key, e.target.value),
													placeholder: f.ph,
													className: "field-box h-12 w-full rounded-xl px-4 text-[14px]"
												}),
												errors[f.key] && /* @__PURE__ */ jsx("span", {
													className: "mt-1 block text-[12px] text-[#ff6b6b]",
													children: errors[f.key]
												})
											]
										}, f.key)),
										/* @__PURE__ */ jsxs("label", {
											className: "block",
											children: [/* @__PURE__ */ jsx("span", {
												className: "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
												children: "Budget range"
											}), /* @__PURE__ */ jsxs("select", {
												value: data.budget,
												onChange: (e) => setData("budget", e.target.value),
												className: `field-box h-12 w-full rounded-xl px-4 text-[14px] ${data.budget ? "" : "is-empty"}`,
												children: [/* @__PURE__ */ jsx("option", {
													value: "",
													disabled: true,
													hidden: true,
													children: "Select a budget"
												}), BUDGETS.map((b) => /* @__PURE__ */ jsx("option", {
													value: b,
													className: "bg-[var(--surface)]",
													children: b
												}, b))]
											})]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "block",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
													children: "Project type"
												}),
												/* @__PURE__ */ jsxs("select", {
													value: data.type,
													onChange: (e) => setData("type", e.target.value),
													className: `field-box h-12 w-full rounded-xl px-4 text-[14px] ${data.type ? "" : "is-empty"}`,
													children: [/* @__PURE__ */ jsx("option", {
														value: "",
														disabled: true,
														hidden: true,
														children: "Select a project type"
													}), TYPES.map((t) => /* @__PURE__ */ jsx("option", {
														value: t,
														className: "bg-[var(--surface)]",
														children: t
													}, t))]
												}),
												errors.type && /* @__PURE__ */ jsx("span", {
													className: "mt-1 block text-[12px] text-[#ff6b6b]",
													children: errors.type
												})
											]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "flex flex-col sm:col-span-2 lg:min-h-0 lg:h-full",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
													children: "Message*"
												}),
												/* @__PURE__ */ jsx("textarea", {
													rows: 4,
													value: data.message,
													onChange: (e) => setData("message", e.target.value),
													placeholder: "Tell us about your goals, timeline, and what success looks like...",
													className: "field-box w-full resize-none rounded-xl p-4 text-[14px] lg:min-h-[120px] lg:flex-1"
												}),
												errors.message && /* @__PURE__ */ jsx("span", {
													className: "mt-1 block text-[12px] text-[#ff6b6b]",
													children: errors.message
												})
											]
										})
									]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: processing,
									"data-cursor": "cta",
									className: "btn-press btn-3d mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full text-[13px] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60",
									style: { background: BRAND_GRADIENT },
									children: processing ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
										className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white",
										"aria-hidden": true
									}), "Sending..."] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: ["Send inquiry ", /* @__PURE__ */ jsx("span", {
										"aria-hidden": true,
										children: "→"
									})] })
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-3 text-center text-[12px] text-[var(--ink-faint)]",
									children: "No spam. NDA-friendly."
								})
							] })]
						})
					]
				}), heroHeading && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
					className: "mt-28 grid gap-12 lg:mt-32 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-stretch lg:gap-x-12 lg:gap-y-0",
					children: [/* @__PURE__ */ jsxs(motion.div, {
						...scrollReveal,
						variants: reduce ? void 0 : omniGroup,
						className: "flex flex-col",
						children: [
							/* @__PURE__ */ jsx(BlockChip, { children: "FAQs" }),
							/* @__PURE__ */ jsxs(motion.h2, {
								variants: reduce ? void 0 : lineGroup,
								className: "display-lg mt-4 uppercase text-[var(--ink-strong)]",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mask-line",
									children: /* @__PURE__ */ jsx(motion.span, {
										variants: reduce ? void 0 : omniLine,
										className: "mask-inner",
										children: "Clear answers"
									})
								}), /* @__PURE__ */ jsx("span", {
									className: "mask-line",
									children: /* @__PURE__ */ jsx(motion.span, {
										variants: reduce ? void 0 : omniLine,
										className: "mask-inner text-gradient",
										children: "before we start"
									})
								})]
							}),
							/* @__PURE__ */ jsx(motion.span, {
								variants: reduce ? void 0 : omniRise,
								className: "mt-4 block h-[3px] w-10 rounded-full",
								style: { background: BRAND_GRADIENT },
								"aria-hidden": true
							}),
							/* @__PURE__ */ jsx(motion.p, {
								variants: reduce ? void 0 : omniRise,
								className: "mt-5 max-w-[44ch] text-[14px] leading-[22px] text-[var(--mute)]",
								children: "What we do, what we need from you, and how quickly you will hear back."
							}),
							/* @__PURE__ */ jsx("div", {
								className: "hidden flex-1 lg:block",
								"aria-hidden": true
							}),
							/* @__PURE__ */ jsxs(motion.div, {
								variants: reduce ? void 0 : omniRise,
								className: "mt-10 flex items-start gap-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6",
								children: [/* @__PURE__ */ jsx("span", {
									className: "grid h-14 w-14 shrink-0 place-items-center rounded-md border border-[var(--line)] text-[var(--ink)]",
									"aria-hidden": true,
									children: /* @__PURE__ */ jsx("svg", {
										viewBox: "0 0 24 24",
										className: "h-6 w-6",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "1.6",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: /* @__PURE__ */ jsx("path", { d: "M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-4.2A8.4 8.4 0 1 1 21 11.5Z" })
									})
								}), /* @__PURE__ */ jsxs("span", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "block font-display text-[15px] font-bold uppercase tracking-[0.03em] text-[var(--ink)]",
											children: "Still have questions?"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "mt-1 block text-[13px] text-[var(--mute)]",
											children: "Send the details and we will come back to you."
										}),
										/* @__PURE__ */ jsxs("a", {
											href: "#project-inquiry",
											"data-cursor": "cta",
											className: "link-underline btn-press mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-gradient",
											children: ["Contact us ", /* @__PURE__ */ jsx("span", {
												"aria-hidden": true,
												children: "→"
											})]
										})
									]
								})]
							})
						]
					}), /* @__PURE__ */ jsx(FaqList, { reduce })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-28 lg:mt-32",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grid gap-12 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-start lg:gap-x-12 lg:gap-y-0",
						children: [/* @__PURE__ */ jsxs(motion.div, {
							...scrollReveal,
							variants: reduce ? void 0 : omniGroup,
							className: "flex flex-col",
							children: [
								/* @__PURE__ */ jsx(BlockChip, { children: "Let’s connect" }),
								/* @__PURE__ */ jsxs(motion.h2, {
									variants: reduce ? void 0 : lineGroup,
									className: "display-lg mt-4 uppercase text-[var(--ink-strong)]",
									children: [/* @__PURE__ */ jsx("span", {
										className: "mask-line",
										children: /* @__PURE__ */ jsx(motion.span, {
											variants: reduce ? void 0 : omniLine,
											className: "mask-inner",
											children: "Let’s build"
										})
									}), /* @__PURE__ */ jsx("span", {
										className: "mask-line",
										children: /* @__PURE__ */ jsx(motion.span, {
											variants: reduce ? void 0 : omniLine,
											className: "mask-inner text-gradient",
											children: "something"
										})
									})]
								}),
								/* @__PURE__ */ jsx(motion.span, {
									variants: reduce ? void 0 : omniRise,
									className: "mt-6 block h-[3px] w-10 rounded-full",
									style: { background: BRAND_GRADIENT },
									"aria-hidden": true
								}),
								/* @__PURE__ */ jsx(motion.p, {
									variants: reduce ? void 0 : omniRise,
									className: "mt-6 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]",
									children: "We’re currently available for select projects and collaborations. Let’s create digital experiences that leave a lasting impact."
								})
							]
						}), /* @__PURE__ */ jsxs(motion.div, {
							...scrollReveal,
							variants: reduce ? void 0 : omniRise,
							className: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 lg:mt-[44px]",
							children: [/* @__PURE__ */ jsx("ul", {
								className: "list-none border-b border-[var(--line)]",
								children: [{
									label: contactEmail,
									href: `mailto:${contactEmail}`,
									type: "email",
									ext: false
								}, ...socials.linkedin ? [{
									label: "LinkedIn",
									href: socials.linkedin,
									type: "linkedin",
									ext: true
								}] : []].map((row) => /* @__PURE__ */ jsx("li", {
									className: "border-b border-[var(--line)] last:border-b-0",
									children: /* @__PURE__ */ jsxs("a", {
										href: row.href,
										...row.ext ? {
											target: "_blank",
											rel: "noreferrer"
										} : {},
										"data-cursor": "explore",
										className: "group flex items-center gap-4 py-4 text-[var(--ink)]",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--ink)]",
												"aria-hidden": true,
												children: row.type === "linkedin" ? /* @__PURE__ */ jsx("span", {
													className: "font-display text-[11px] font-extrabold lowercase",
													children: "in"
												}) : /* @__PURE__ */ jsxs("svg", {
													viewBox: "0 0 24 24",
													className: "h-[15px] w-[15px]",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "1.7",
													strokeLinecap: "round",
													strokeLinejoin: "round",
													children: [/* @__PURE__ */ jsx("rect", {
														x: "2.5",
														y: "4.5",
														width: "19",
														height: "15",
														rx: "2.5"
													}), /* @__PURE__ */ jsx("path", { d: "m3 6.5 9 6 9-6" })]
												})
											}),
											/* @__PURE__ */ jsx("span", {
												className: "min-w-0 flex-1 truncate text-[15px]",
												children: row.label
											}),
											/* @__PURE__ */ jsx("span", {
												className: "text-[13px] text-[var(--ink-faint)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[var(--ink)]",
												"aria-hidden": true,
												children: "↗"
											})
										]
									})
								}, row.label))
							}), /* @__PURE__ */ jsxs("a", {
								href: "#project-inquiry",
								"data-cursor": "cta",
								className: "btn-press btn-3d mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full text-[13px] font-bold uppercase tracking-[0.18em] text-white",
								style: { background: BRAND_GRADIENT },
								children: ["Start a project ", /* @__PURE__ */ jsx("span", {
									"aria-hidden": true,
									children: "→"
								})]
							})]
						})]
					}), /* @__PURE__ */ jsxs(motion.div, {
						...scrollReveal,
						variants: reduce ? void 0 : omniRise,
						className: "mt-12 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-14",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
							children: ["Marketorr · ", /* @__PURE__ */ jsx("span", {
								className: "text-gradient",
								children: locationText
							})]
						}), /* @__PURE__ */ jsx(StudioClock, {})]
					})]
				})] })]
			})
		]
	}) });
}
//#endregion
export { FastCollapse as n, Contact as t };
