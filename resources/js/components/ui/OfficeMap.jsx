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
        keepBuffer: coarse ? 1 : 2,
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
/** Tile size Leaflet and Esri use, in px. */
const TILE_PX = 256;

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
    const sin = Math.sin((lat * Math.PI) / 180);
    const cx = ((lng + 180) / 360) * scale;
    const cy = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
    const half = { narrow: [210, 115], wide: [440, 145] };
    const tiles = [];

    for (let x = Math.floor((cx - half.wide[0]) / TILE_PX); x <= Math.floor((cx + half.wide[0]) / TILE_PX); x++) {
        for (let y = Math.floor((cy - half.wide[1]) / TILE_PX); y <= Math.floor((cy + half.wide[1]) / TILE_PX); y++) {
            const left = Math.round(x * TILE_PX - cx);
            const top = Math.round(y * TILE_PX - cy);
            const wide = left + TILE_PX < -half.narrow[0] || left > half.narrow[0]
                || top + TILE_PX < -half.narrow[1] || top > half.narrow[1];
            tiles.push({ x, y, left, top, wide });
        }
    }

    return tiles;
}

const PREVIEW_TILES = previewTiles();

export default function OfficeMap({ address = '', directionsHref = '#', className = '' }) {
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
    // The tile preview stays up until the live map's first tiles have drawn.
    const [tilesShown, setTilesShown] = useState(false);
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

    // Keep Leaflet, its tile requests and its event system off the main thread
    // until the map is close enough to be seen. This matters most on Home,
    // where several animated sections appear before Contact.
    useEffect(() => {
        const host = hostRef.current;
        if (!host || shouldLoad) return undefined;
        if (typeof IntersectionObserver === 'undefined') {
            setShouldLoad(true);

            return undefined;
        }

        let idleId = 0;
        let timerId = 0;
        const loadMap = () => setShouldLoad(true);
        const scheduleLoad = () => {
            if ('requestIdleCallback' in window) {
                idleId = window.requestIdleCallback(loadMap, { timeout: 300 });
            } else {
                timerId = window.setTimeout(loadMap, 0);
            }
        };
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;

            observer.disconnect();
            scheduleLoad();
        }, { rootMargin: '160px 0px' });
        observer.observe(host);

        return () => {
            observer.disconnect();
            if (idleId) window.cancelIdleCallback(idleId);
            window.clearTimeout(timerId);
        };
    }, [shouldLoad]);

    useEffect(() => {
        if (!shouldLoad) return undefined;

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
                inertia: !coarse,
                inertiaDeceleration: 2600,
                easeLinearity: 0.22,
                zoomSnap: 0.25,
                zoomDelta: 0.5,
                wheelPxPerZoomLevel: 120,
                zoomAnimation: !reduce && !coarse,
                fadeAnimation: !reduce && !coarse,
                markerZoomAnimation: !reduce && !coarse,
            });
            mapRef.current = map;
            map.attributionControl.setPrefix(false);

            const url = TILES[theme] ?? TILES.dark;
            tileUrlRef.current = url;
            tileRef.current = L.tileLayer(url, tileOptions(coarse)).addTo(map);
            const reveal = () => setTilesShown(true);
            tileRef.current.once('load', reveal);
            const revealSafety = window.setTimeout(reveal, 2500);
            cleanups.push(() => {
                window.clearTimeout(revealSafety);
                tileRef.current?.off('load', reveal);
            });

            L.control
                .zoom({ position: 'bottomright', zoomInTitle: 'Zoom in', zoomOutTitle: 'Zoom out' })
                .addTo(map);

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
                `<p class="mk-map__popup-label">Marketorr</p><p class="mk-map__popup-address">${String(address ?? '').replace(/\b(Plot|Road|Sector|House|Block|Level) /g, '$1\u00a0')}</p><a class="mk-map__popup-link" href="${directionsHref}" target="_blank" rel="noreferrer">Get directions ↗</a>`,
                { className: 'mk-map__popup', closeButton: true, minWidth: 240, maxWidth: 260, autoPanPadding: [20, 20] },
            );

            // The popup is left closed: the address already sits beside the map,
            // and an open popup covers most of a 220–280px tall canvas.

            // Shows the studio's address: jumps straight back to the studio, with
            // the pin set low enough that the address box fits above it, so
            // nothing flies, zooms or pans while it opens.
            const Recenter = L.Control.extend({
                onAdd() {
                    const button = L.DomUtil.create('button', 'mk-map__recenter');
                    button.type = 'button';
                    button.title = 'Show the studio address';
                    button.setAttribute('aria-label', 'Show the studio address');
                    button.innerHTML = '<span aria-hidden="true">◎</span>';
                    L.DomEvent.disableClickPropagation(button);
                    L.DomEvent.on(button, 'click', (event) => {
                        L.DomEvent.preventDefault(event);
                        const lift = Math.min(90, map.getSize().y * 0.3);
                        const target = map.unproject(map.project(MAP_CENTER, MAP_ZOOM).subtract([0, lift]), MAP_ZOOM);
                        map.setView(target, MAP_ZOOM, { animate: false });
                        marker.openPopup();
                    });
                    return button;
                },
            });
            new Recenter({ position: 'bottomright' }).addTo(map);

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
        // Built once. The theme is applied to the live instance by the effect below,
        // which is what keeps switching instant instead of remounting the map.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldLoad]);

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
            {!tilesShown && (
                /* The opening view drawn straight from the basemap's own tiles,
                   so the map is on screen from first paint (server-rendered)
                   rather than after Leaflet has loaded. */
                <div className="mk-map__preview" aria-hidden>
                    {PREVIEW_TILES.map((tile) => (
                        <img
                            key={`${tile.x}-${tile.y}`}
                            src={(TILES[theme] ?? TILES.dark).replace('{z}', MAP_ZOOM).replace('{y}', tile.y).replace('{x}', tile.x)}
                            alt=""
                            width={TILE_PX}
                            height={TILE_PX}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className={tile.wide ? 'mk-map__preview-tile mk-map__preview-tile--wide' : 'mk-map__preview-tile'}
                            style={{ left: `calc(50% + ${tile.left}px)`, top: `calc(50% + ${tile.top}px)` }}
                        />
                    ))}
                </div>
            )}
            <p className="mk-map__hint" data-visible={hint ? 'true' : 'false'} aria-live="polite">
                {hint}
            </p>
        </div>
    );
}
