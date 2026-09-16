import { useCallback, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../lib/theme';

/**
 * Office coordinates — Natore Tower, Plot 32D & E, Road 2, Sector 3,
 * Uttara, Dhaka 1230. Geocoded to the midpoint of Road 2 in Sector 3;
 * OpenStreetMap has no plot-level entry for the tower itself, so nudge
 * these two numbers if the pin should sit on a specific plot.
 */
const MAP_CENTER = [23.8627, 90.3988];
const MAP_ZOOM = 16;
const MIN_ZOOM = 11;
/** Esri's Gray Canvas basemaps are only tiled to z16; beyond that Leaflet upscales. */
const MAX_NATIVE_ZOOM = 16;
const MAX_ZOOM = 17;

/**
 * Esri World Gray Canvas — a purpose-built light/dark pair, keyless and
 * unwatermarked. Note the {z}/{y}/{x} order, which is Esri's, not OSM's.
 */
const TILES = {
    light: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};

const ATTRIBUTION =
    '<a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>, HERE, Garmin, © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

const HINT_MS = 1900;
const FADE_MS = 420;

/** Coarse pointers get the touch gesture model; fine pointers get the desktop one. */
function isCoarsePointer() {
    return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * @param {boolean} coarse
 * @return {object} Tile layer options shared by the initial layer and every theme swap.
 */
function tileOptions(coarse) {
    return {
        maxZoom: MAX_ZOOM,
        maxNativeZoom: MAX_NATIVE_ZOOM,
        keepBuffer: 2,
        // Fewer tile requests mid-gesture keeps panning smooth on phones.
        updateWhenIdle: coarse,
        attribution: ATTRIBUTION,
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
export default function OfficeMap({ address = '', directionsHref = '#', className = '' }) {
    const { theme } = useTheme();
    const hostRef = useRef(null);
    const mapRef = useRef(null);
    const leafletRef = useRef(null);
    const tileRef = useRef(null);
    const tileUrlRef = useRef(null);
    const lenisPausedRef = useRef(false);
    const hintTimer = useRef(0);

    const [ready, setReady] = useState(false);
    const [hint, setHint] = useState('');

    const showHint = useCallback((message) => {
        window.clearTimeout(hintTimer.current);
        setHint(message);
        hintTimer.current = window.setTimeout(() => setHint(''), HINT_MS);
    }, []);

    // Lenis hijacks the wheel globally; pause it while the map owns the wheel.
    const setLenisPaused = useCallback((paused) => {
        const lenis = window.__lenis;
        if (!lenis || lenisPausedRef.current === paused) return;
        lenisPausedRef.current = paused;
        if (paused) {
            lenis.stop();
        } else {
            lenis.start();
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const host = hostRef.current;
        if (!host) {
            return undefined;
        }

        const coarse = isCoarsePointer();
        const reduce = prefersReducedMotion();
        const cleanups = [];

        import('leaflet').then((mod) => {
            const L = mod.default ?? mod;
            if (cancelled || !hostRef.current) {
                return;
            }
            leafletRef.current = L;

            const map = L.map(host, {
                center: MAP_CENTER,
                zoom: MAP_ZOOM,
                minZoom: MIN_ZOOM,
                maxZoom: MAX_ZOOM,
                zoomControl: false,
                attributionControl: true,
                // One finger must stay free for page scrolling on touch devices.
                dragging: !coarse,
                touchZoom: true,
                scrollWheelZoom: false,
                doubleClickZoom: true,
                keyboard: true,
                inertia: true,
                inertiaDeceleration: 2600,
                easeLinearity: 0.22,
                zoomSnap: 0.25,
                zoomDelta: 0.5,
                wheelPxPerZoomLevel: 120,
                zoomAnimation: !reduce,
                fadeAnimation: !reduce,
                markerZoomAnimation: !reduce,
            });
            mapRef.current = map;
            map.attributionControl.setPrefix(false);

            const url = TILES[theme] ?? TILES.dark;
            tileUrlRef.current = url;
            tileRef.current = L.tileLayer(url, tileOptions(coarse)).addTo(map);

            L.control
                .zoom({ position: 'bottomright', zoomInTitle: 'Zoom in', zoomOutTitle: 'Zoom out' })
                .addTo(map);

            const Recenter = L.Control.extend({
                onAdd() {
                    const button = L.DomUtil.create('button', 'mk-map__recenter');
                    button.type = 'button';
                    button.title = 'Recentre on the studio';
                    button.setAttribute('aria-label', 'Recentre on the studio');
                    button.innerHTML = '<span aria-hidden="true">◎</span>';
                    L.DomEvent.disableClickPropagation(button);
                    L.DomEvent.on(button, 'click', (event) => {
                        L.DomEvent.preventDefault(event);
                        map.flyTo(MAP_CENTER, MAP_ZOOM, { duration: reduce ? 0 : 0.7 });
                    });
                    return button;
                },
            });
            new Recenter({ position: 'bottomright' }).addTo(map);

            const marker = L.marker(MAP_CENTER, {
                keyboard: true,
                title: 'Marketorr studio',
                icon: L.divIcon({
                    className: 'mk-map__pin-icon',
                    html: '<span class="mk-map__pin"></span><span class="mk-map__pulse" aria-hidden="true"></span>',
                    iconSize: [26, 26],
                    iconAnchor: [13, 13],
                    popupAnchor: [0, -14],
                }),
            }).addTo(map);

            marker.bindPopup(
                `<p class="mk-map__popup-label">Marketorr</p><p class="mk-map__popup-address">${address}</p><a class="mk-map__popup-link" href="${directionsHref}" target="_blank" rel="noreferrer">Get directions ↗</a>`,
                { className: 'mk-map__popup', closeButton: true, maxWidth: 240, autoPanPadding: [18, 18] },
            );

            // The popup is left closed: the address already sits beside the map,
            // and an open popup covers most of a 220–280px tall canvas.

            if (coarse) {
                // Flag a one-finger drag so the two-finger rule is discoverable.
                let singleTouch = false;
                const onStart = (event) => {
                    singleTouch = event.touches.length === 1;
                };
                const onMove = (event) => {
                    if (!singleTouch || event.touches.length !== 1) {
                        return;
                    }
                    singleTouch = false;
                    showHint('Use two fingers to move the map');
                };
                host.addEventListener('touchstart', onStart, { passive: true });
                host.addEventListener('touchmove', onMove, { passive: true });
                cleanups.push(() => {
                    host.removeEventListener('touchstart', onStart);
                    host.removeEventListener('touchmove', onMove);
                });
            } else {
                const activate = () => {
                    if (map.scrollWheelZoom.enabled()) {
                        return;
                    }
                    map.scrollWheelZoom.enable();
                    setLenisPaused(true);
                    host.classList.add('is-wheel-active');
                };
                const deactivate = () => {
                    if (!map.scrollWheelZoom.enabled()) {
                        return;
                    }
                    map.scrollWheelZoom.disable();
                    setLenisPaused(false);
                    host.classList.remove('is-wheel-active');
                };
                const onWheel = () => {
                    if (!map.scrollWheelZoom.enabled()) {
                        showHint('Click the map to zoom');
                    }
                };
                host.addEventListener('click', activate);
                host.addEventListener('focusin', activate);
                host.addEventListener('mouseleave', deactivate);
                host.addEventListener('focusout', deactivate);
                host.addEventListener('wheel', onWheel, { passive: true });
                cleanups.push(() => {
                    host.removeEventListener('click', activate);
                    host.removeEventListener('focusin', activate);
                    host.removeEventListener('mouseleave', deactivate);
                    host.removeEventListener('focusout', deactivate);
                    host.removeEventListener('wheel', onWheel);
                });
            }

            const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
            observer.observe(host);
            cleanups.push(() => observer.disconnect());

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
        // Built once. The theme is applied to the live instance by the effect below,
        // which is what keeps switching instant instead of remounting the map.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Theme swap — crossfade a second tile layer in, then drop the old one.
    useEffect(() => {
        const map = mapRef.current;
        const L = leafletRef.current;
        const nextUrl = TILES[theme] ?? TILES.dark;
        if (!map || !L || !ready || tileUrlRef.current === nextUrl) {
            return undefined;
        }

        const previous = tileRef.current;
        const incoming = L.tileLayer(nextUrl, tileOptions(isCoarsePointer()));
        incoming.setOpacity(0);
        incoming.addTo(map);
        tileRef.current = incoming;
        tileUrlRef.current = nextUrl;

        let settled = false;
        let removeTimer = 0;
        const settle = () => {
            if (settled) {
                return;
            }
            settled = true;
            incoming.setOpacity(1);
            removeTimer = window.setTimeout(() => {
                if (previous && map.hasLayer(previous)) {
                    map.removeLayer(previous);
                }
            }, FADE_MS);
        };

        incoming.once('load', settle);
        // Fully cached tiles can resolve before the listener ever fires.
        const safety = window.setTimeout(settle, 600);

        return () => {
            window.clearTimeout(safety);
            window.clearTimeout(removeTimer);
            incoming.off('load', settle);
        };
    }, [theme, ready]);

    return (
        <div className={`mk-map ${className}`.trim()}>
            <div
                ref={hostRef}
                className="mk-map__canvas"
                role="application"
                aria-label="Map of the Marketorr studio in Uttara, Dhaka"
            />
            {!ready && <div className="mk-map__skeleton" aria-hidden />}
            <p className="mk-map__hint" data-visible={hint ? 'true' : 'false'} aria-live="polite">
                {hint}
            </p>
        </div>
    );
}
