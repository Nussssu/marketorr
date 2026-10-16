import { s as assetUrl } from "../ssr.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/media/CharukothonCover.jsx
/**
* Authentic Charukothon brand cover.
*
* Replaces the old generic "CASE STUDY / Bangladeshi Cloth Company / Learn
* More" composite with the real brand's world: the brand's mint shade theme
* melting into deep plum from the jam-purple saree, minimal fashion-house
* typography (monogram, name, motto), and the actual saree photography.
*
* The source file still contains the baked generic panel on its left half, so
* the photography is shown cropped to its right side only and the left is an
* opaque brand panel — the old text can never peek through.
*
* Sizing/positioning contract: fills its relatively-positioned parent
* (`absolute inset-0`), so card size, carousel slot and interaction stay
* exactly as before. Type scales in `cqw`, which needs the parent (or an
* ancestor) to carry `container-type: inline-size` — every usage below does.
*/
var CHARUKOTHON_SLUG = "charukothon-meta-ads";
/** @param {string|undefined} slug */
function isCharukothon(slug) {
	return slug === CHARUKOTHON_SLUG;
}
var BLOCK_PRINT_TILE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cg fill='none' stroke='%238DEBC6' stroke-opacity='0.32'%3E%3Cpath d='M28 30l5.5 7.5L28 45l-5.5-7.5z'/%3E%3Ccircle cx='28' cy='37.5' r='1.4' fill='%238DEBC6' fill-opacity='0.5' stroke='none'/%3E%3C/g%3E%3Cg fill='%238DEBC6' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='10' r='1.2'/%3E%3Ccircle cx='47' cy='12' r='1'/%3E%3Ccircle cx='12' cy='48' r='1'/%3E%3Ccircle cx='48' cy='46' r='1.2'/%3E%3C/g%3E%3C/svg%3E\")";
/**
* @param {{ image: string }} props
*/
function CharukothonCover({ image }) {
	return /* @__PURE__ */ jsxs("div", {
		"aria-hidden": true,
		className: "absolute inset-0 overflow-hidden bg-[#2A0E28]",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-y-0 right-0 w-[64%]",
				style: {
					backgroundImage: `url("${image}")`,
					backgroundSize: "cover",
					backgroundPosition: "72% 50%"
				}
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-0",
				style: { background: "linear-gradient(90deg, rgba(42,14,40,0) 36%, rgba(42,14,40,0.6) 52%, rgba(42,14,40,0) 72%), linear-gradient(180deg, rgba(42,14,40,0.28) 0%, transparent 30%, transparent 60%, rgba(20,6,19,0.6) 100%)" }
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "absolute inset-y-0 left-0 flex w-[57%] flex-col justify-center",
				style: {
					background: "linear-gradient(135deg, #331239 0%, #3B2A4D 38%, #17453D 100%)",
					padding: "7% 7% 7% 7%"
				},
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "absolute inset-0",
						style: {
							backgroundImage: BLOCK_PRINT_TILE,
							opacity: .5
						}
					}),
					/* @__PURE__ */ jsx("div", {
						className: "absolute inset-0",
						style: { background: "radial-gradient(90% 60% at 15% 0%, rgba(141,235,198,0.18), transparent 60%)" }
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "flex items-center justify-center rounded-full border border-[#8DEBC6]/70 text-[#D9F7E8]",
								style: {
									width: "11cqw",
									height: "11cqw",
									fontSize: "5.5cqw",
									fontFamily: "'Tiro Bangla', Georgia, serif"
								},
								children: "চ"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-[#F9F1E3]",
								style: {
									marginTop: "4cqw",
									fontSize: "9cqw",
									lineHeight: 1.02,
									letterSpacing: "0.01em",
									fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
									fontWeight: 700
								},
								children: ["Charu", /* @__PURE__ */ jsx("span", {
									style: {
										fontStyle: "italic",
										fontWeight: 400
									},
									children: "kothon"
								})]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "block bg-gradient-to-r from-[#8DEBC6] to-[#8DEBC6]/10",
								style: {
									marginTop: "3.4cqw",
									height: "0.55cqw",
									width: "22%"
								}
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-[#F9F1E3]/85",
								style: {
									marginTop: "2.8cqw",
									fontSize: "3.5cqw",
									fontStyle: "italic",
									fontFamily: "Georgia, 'Times New Roman', serif"
								},
								children: "Style with art & elegance"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "absolute inset-y-0",
				style: { left: "57%" },
				children: [/* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 block w-px bg-gradient-to-b from-[#8DEBC6]/0 via-[#8DEBC6]/80 to-[#8DEBC6]/0" }), /* @__PURE__ */ jsx("span", {
					className: "absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#8DEBC6] bg-[#123B34] text-[#D9F7E8]",
					style: {
						width: "6.5cqw",
						height: "6.5cqw",
						minWidth: 22,
						minHeight: 22,
						fontSize: "3cqw"
					},
					children: "✦"
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/lib/projectHeroMedia.js
/**
* Projects whose dedicated page opens on something other than the flat cover.
*
* The cover in the database stays the source of truth: it is what the card,
* the work listing and the page's own fallback use, it is what shows while
* this loads, and it is what a reader on `prefers-reduced-motion` keeps. An
* Image entries are also reused by project cards so the card and hero never
* disagree or visibly swap assets during navigation. A project without one
* behaves exactly as before.
*
* Keyed by project slug, so adding one is a few lines and needs no migration
* or admin field.
*
* `kind: 'image'` is any still or animated file served from `public/`.
* `kind: 'video'` plays a file served from `public/` — muted, looped and
* posterless-safe, so it can autoplay as a hero backdrop.
* `kind: 'vimeo'` embeds the official player in Vimeo's chromeless background
* mode — the film itself stays hosted by Vimeo and is never copied into the
* repository.
*
* @type {Record<string, (
*   { kind: 'image', src: string, alt: string, fit?: 'cover'|'contain', background?: string, card?: boolean, cardSrcSet?: string }
*   | { kind: 'vimeo', id: string, title: string, ratio: number, background?: string }
* )>}
*/
var PROJECT_HERO_MEDIA = {
	"imperial-jute-b2b-seo": {
		kind: "image",
		src: assetUrl("/images/work/imperial-jute-logo.webp"),
		cardSrcSet: `${assetUrl("/images/opt/thumbs-sm/work/imperial-jute-logo.webp.webp")} 480w, ${assetUrl("/images/opt/thumbs/work/imperial-jute-logo.webp.webp")} 900w, ${assetUrl("/images/work/imperial-jute-logo.webp")} 1400w`,
		alt: "Imperial Jute 3D logo animation",
		fit: "contain",
		background: "#000000"
	},
	"imperial-jute-brand-design": {
		kind: "image",
		src: assetUrl("/images/work/imperial-jute-logo.webp"),
		cardSrcSet: `${assetUrl("/images/opt/thumbs-sm/work/imperial-jute-logo.webp.webp")} 480w, ${assetUrl("/images/opt/thumbs/work/imperial-jute-logo.webp.webp")} 900w, ${assetUrl("/images/work/imperial-jute-logo.webp")} 1400w`,
		alt: "Imperial Jute 3D logo animation",
		fit: "contain",
		background: "#000000"
	},
	"city-online-brand-design": {
		kind: "video",
		src: assetUrl("/videos/city-online-hero.mp4"),
		poster: assetUrl("/images/opt/work/city-online-hero-poster.jpg.webp"),
		background: "#191919"
	},
	"microters-web": {
		kind: "vimeo",
		id: "900435156",
		hash: "a7411ba746",
		title: "Microters case study film",
		ratio: 640 / 360,
		background: "#10131c"
	},
	"un-point-brand-design": {
		kind: "image",
		src: assetUrl("/images/work/un-point-logo.webp"),
		alt: "Un Point 5 logo animation",
		fit: "cover",
		background: "#0b0b0e",
		card: false
	},
	"shuddhomart-branding": {
		kind: "image",
		src: assetUrl("/images/work/shuddhomart-hero.webp"),
		alt: "ShuddhoMart brand identity",
		fit: "cover",
		background: "#0b0b0e",
		card: false
	},
	"virgin-trend": {
		kind: "vimeo",
		id: "848291117",
		title: "Virgin Trend brand intro",
		ratio: 426 / 240,
		background: "#050507"
	},
	"amanah-global-network": {
		kind: "vimeo",
		id: "1223960078",
		title: "Amanah brand film",
		ratio: 16 / 9,
		background: "#0a2426"
	},
	"medica-lifecare-brand-identity": {
		kind: "vimeo",
		id: "1230249552",
		title: "Medica Lifecare PLC brand identity film",
		ratio: 16 / 9,
		background: "#062d43"
	},
	"smilez-logo-design": {
		kind: "image",
		src: assetUrl("/images/work/gallery/smilez-logo-design/03.webp"),
		alt: "Smilez silver foil emboss on dark paper",
		fit: "cover",
		background: "#0b0b0e",
		card: false
	},
	"tapmad-media-ads": {
		kind: "image",
		src: assetUrl("/images/work/gallery/tapmad-media-ads/02.webp"),
		alt: "Tapmad All in 1 press ad on newspaper",
		fit: "cover",
		background: "#0b0b0e",
		card: false
	}
};
/**
* @param {string|undefined} slug
* @return {object|null}
*/
function projectHeroMedia(slug) {
	return slug && PROJECT_HERO_MEDIA[slug] || null;
}
/**
* Use an image-based hero as the matching card cover. Video heroes retain the
* project's still cover so cards never embed or autoplay a remote player.
*
* @param {{ slug?: string, image?: string, thumb?: string, thumbSmall?: string, imageAlt?: string }|undefined} project
* @param {string} [sizes] The card's rendered width, as an `<img sizes>` value.
* @return {{ src: string|undefined, srcSet?: string, sizes?: string, alt: string, fit: 'cover'|'contain' }}
*/
function projectCardMedia(project, sizes = "(max-width: 768px) 92vw, 50vw") {
	const heroMedia = projectHeroMedia(project?.slug);
	if (heroMedia?.kind === "image" && heroMedia.card !== false) return {
		src: heroMedia.src,
		srcSet: heroMedia.cardSrcSet,
		sizes: heroMedia.cardSrcSet ? sizes : void 0,
		alt: heroMedia.alt,
		fit: heroMedia.fit ?? "cover"
	};
	const thumb = project?.thumb && project.thumb !== project?.image ? project.thumb : null;
	const small = thumb && project?.thumbSmall && project.thumbSmall !== thumb ? project.thumbSmall : null;
	return {
		src: thumb ?? project?.image,
		srcSet: thumb ? [
			small && `${small} 480w`,
			`${thumb} 900w`,
			`${project.image} 1800w`
		].filter(Boolean).join(", ") : void 0,
		sizes: thumb ? sizes : void 0,
		alt: project?.imageAlt ?? "",
		fit: "cover"
	};
}
//#endregion
export { isCharukothon as i, projectHeroMedia as n, CharukothonCover as r, projectCardMedia as t };
