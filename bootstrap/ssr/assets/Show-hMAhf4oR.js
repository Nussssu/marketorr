import { _ as Tag, c as transitionTo, l as useTapIntent, u as MagneticButton } from "../ssr.js";
import { n as enter, r as heroMediaEntrance, t as EASE } from "./motion-DQVPQ9oM.js";
import { i as isCharukothon, n as projectHeroMedia, r as CharukothonCover } from "./projectHeroMedia-DRrWloKb.js";
import { t as MediaPlaceholder } from "./MediaPlaceholder-BAEKlLsR.js";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion } from "framer-motion";
//#region resources/js/components/sections/WorkHero.jsx
/**
* The frame's stand-in for a project whose visuals are not uploaded yet: a
* branded panel carrying the project's name, rather than the grey plate, so
* the first thing on the page still looks finished.
*
* @param {{ title: string }} props
*/
function AwaitingVisuals({ title }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "absolute inset-0 overflow-hidden",
		role: "img",
		"aria-label": `${title} - visuals coming soon`,
		style: { background: "radial-gradient(120% 90% at 85% 15%, rgba(80, 122, 244, 0.28), transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(137, 31, 251, 0.3), transparent 60%), var(--bg-soft)" },
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid-bg absolute inset-0",
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-x-[6%] bottom-[8%] font-display font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-transparent",
				style: {
					fontSize: "9cqw",
					WebkitTextStroke: "1px var(--field-line)"
				},
				"aria-hidden": true,
				children: title
			}),
			/* @__PURE__ */ jsx("span", {
				className: "absolute left-[6%] top-[9%] rounded-full border border-[var(--field-line)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]",
				"aria-hidden": true,
				children: "Visuals coming soon"
			})
		]
	});
}
/**
* What fills the hero's back plane.
*
* In order: a slug-specific hero asset (an animated render, or the project's
* own film embedded from Vimeo), then the Charukothon brand composite, then
* the project's cover photograph, then a placeholder.
*
* Reduced motion falls all the way back to the still cover — an animated GIF
* cannot be paused and an autoplaying film should not be forced on a reader
* who asked for stillness.
*
* @param {{ project: object, reduce: boolean }} props
*/
function HeroMedia({ project, reduce }) {
	const media = projectHeroMedia(project.slug);
	const [ready, setReady] = useState(false);
	const reveal = heroMediaEntrance(reduce);
	if (media && !reduce) {
		if (media.kind === "video") return /* @__PURE__ */ jsx(motion.div, {
			...reveal,
			className: "absolute inset-0 overflow-hidden",
			style: { background: media.background ?? "#000" },
			children: /* @__PURE__ */ jsx("video", {
				src: media.src,
				poster: media.poster ?? project.image ?? void 0,
				autoPlay: true,
				muted: true,
				loop: true,
				playsInline: true,
				preload: "auto",
				tabIndex: -1,
				"aria-hidden": true,
				className: `h-full w-full ${media.fit === "contain" ? "object-contain" : "object-cover"}`
			})
		});
		if (media.kind === "vimeo") return /* @__PURE__ */ jsxs(motion.div, {
			...reveal,
			className: "absolute inset-0 overflow-hidden",
			style: { background: media.background ?? "#000" },
			children: [project.image && /* @__PURE__ */ jsx("img", {
				src: project.image,
				alt: "",
				fetchPriority: "high",
				loading: "eager",
				decoding: "async",
				draggable: false,
				"aria-hidden": true,
				className: "absolute inset-0 h-full w-full object-cover"
			}), /* @__PURE__ */ jsx(motion.iframe, {
				src: `https://player.vimeo.com/video/${media.id}?background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1${media.hash ? `&h=${media.hash}` : ""}`,
				title: media.title,
				allow: "autoplay; fullscreen",
				frameBorder: "0",
				tabIndex: -1,
				"aria-hidden": true,
				onLoad: () => setReady(true),
				initial: false,
				animate: { opacity: ready ? 1 : 0 },
				transition: {
					duration: reduce ? 0 : .2,
					ease: [...EASE]
				},
				className: "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
				style: {
					width: "100cqw",
					height: `${100 / media.ratio}cqw`,
					minHeight: "100cqh",
					minWidth: `${100 * media.ratio}cqh`
				}
			})]
		});
		return /* @__PURE__ */ jsx(motion.div, {
			...reveal,
			className: "absolute inset-0",
			style: { background: media.background ?? "#000" },
			children: /* @__PURE__ */ jsx("img", {
				src: media.src,
				alt: media.alt,
				fetchPriority: "high",
				loading: "eager",
				decoding: "async",
				draggable: false,
				className: `h-full w-full ${media.fit === "contain" ? "object-contain" : "object-cover"}`
			})
		});
	}
	if (!project.image) return /* @__PURE__ */ jsx(AwaitingVisuals, { title: project.title });
	if (isCharukothon(project.slug)) return /* @__PURE__ */ jsxs(motion.div, {
		...reveal,
		className: "absolute inset-0",
		style: { containerType: "inline-size" },
		children: [/* @__PURE__ */ jsx("img", {
			src: project.image,
			alt: "",
			loading: "eager",
			fetchPriority: "high",
			decoding: "async",
			className: "pointer-events-none absolute h-px w-px opacity-0",
			"aria-hidden": true
		}), /* @__PURE__ */ jsx(CharukothonCover, { image: project.image })]
	});
	const candidates = [
		project.thumbSmall && project.thumbSmall !== project.image && `${project.thumbSmall} 480w`,
		project.thumb && project.thumb !== project.image && `${project.thumb} 900w`,
		project.thumb && project.thumb !== project.image && `${project.image} 1800w`
	].filter(Boolean);
	return /* @__PURE__ */ jsx(motion.img, {
		src: project.image,
		srcSet: candidates.length ? candidates.join(", ") : void 0,
		sizes: candidates.length ? "(max-width: 1520px) 94vw, 1430px" : void 0,
		alt: project.imageAlt,
		fetchPriority: "high",
		loading: "eager",
		decoding: "async",
		draggable: false,
		...reveal,
		className: "h-full w-full object-cover"
	});
}
/**
* Hero for every dedicated project page: a framed showcase.
*
* The project's name opens the page, and the work itself sits beneath it in a
* large rounded frame — shown clean, with nothing laid over it — rising into
* place like a board being presented. The client, category and year are left
* to the details column below, so the hero carries only the name.
*
* Nothing moves on scroll; the only motion is the entrance (the title's
* per-character rise and the frame lifting in), and reduced motion renders it
* settled.
*
* @param {{ project: { slug: string, title: string, image: string, imageAlt: string, workGroupHeading?: string } }} props
*/
function WorkHero({ project }) {
	const reduce = useReducedMotion();
	const words = project.title.toUpperCase().split(" ");
	let charIndex = 0;
	return /* @__PURE__ */ jsxs("section", {
		className: "relative overflow-hidden bg-[var(--bg)] pt-28 md:pt-36",
		children: [/* @__PURE__ */ jsx("div", {
			className: "grid-bg pointer-events-none absolute inset-x-0 top-0 h-[70svh]",
			"aria-hidden": true
		}), /* @__PURE__ */ jsxs("div", {
			className: "container-x relative",
			children: [
				project.workGroupHeading && /* @__PURE__ */ jsx("span", {
					...enter("fade-up", {
						dur: .7,
						delay: .2,
						y: 10,
						className: "mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--ink-faint)]"
					}),
					children: project.workGroupHeading
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "max-w-6xl font-display font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-[var(--ink-strong)]",
					style: { fontSize: "clamp(2.6rem, 8vw, 7.5rem)" },
					"aria-label": project.title,
					children: words.map((word, wordIndex) => /* @__PURE__ */ jsx("span", {
						className: "mr-[0.24em] inline-block whitespace-nowrap last:mr-0",
						"aria-hidden": true,
						children: word.split("").map((char) => {
							const index = charIndex++;
							return /* @__PURE__ */ jsx("span", {
								className: "inline-block overflow-hidden pb-[0.08em] align-bottom",
								children: /* @__PURE__ */ jsx("span", {
									...enter("mask-up", {
										dur: 1,
										delay: .3 + Math.min(index, 14) * .045,
										y: "115%",
										className: "inline-block will-change-transform"
									}),
									children: char
								})
							}, index);
						})
					}, wordIndex))
				}),
				/* @__PURE__ */ jsx("div", {
					...enter("lift", {
						dur: 1.1,
						delay: .55,
						y: 72,
						scale: .95,
						className: "relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--bg-soft)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] sm:aspect-[16/9] md:mt-14 md:rounded-[32px]",
						style: { containerType: "size" }
					}),
					children: /* @__PURE__ */ jsx(HeroMedia, {
						project,
						reduce
					}, project.slug)
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/pages/Work/Show.jsx
/**
* Dedicated project page.
*
* Opens with the colour-panel page cover on click, then `WorkHero` — the
* project's name over the work itself, shown clean in a large frame.
*
* Below the hero, the written detail sits in the left column and the
* project's own photographs run down the right. Everything in that detail is
* transcribed from the project's published page on marketorr.com.bd (see
* `Project::publicBrief()`); a project with no transcribed entry renders fewer
* blocks rather than inventing copy for them.
*/
/** One titled block of transcribed detail; renders nothing when it has no content. */
function DetailBlock({ title, children }) {
	if (!children) return null;
	return /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
		className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
		children: title
	}), /* @__PURE__ */ jsx("div", {
		className: "mt-4",
		children
	})] });
}
/**
* How many empty frames stand in for a project whose published images have not
* been sourced yet. Two keeps the column looking deliberate rather than broken,
* without pretending there is more work than there is.
*/
var PLACEHOLDER_FRAMES = 2;
var TAPMAD_BAR_EXPORTS = /* @__PURE__ */ new Set([
	"07.webp",
	"10.webp",
	"11.webp",
	"14.webp",
	"15.webp"
]);
/**
* Gallery films normally play only while visible. A project can opt into
* uninterrupted playback for motion-led case studies such as Amanah.
*
* Chrome will not autostart a muted video that mounts far below the fold, and
* decoding one out of sight is wasted work on a long gallery either way, so
* the element is driven by its own visibility instead of `autoplay`.
*/
function usePlayWhenVisible(reduce, alwaysPlay = false) {
	const ref = useRef(null);
	useEffect(() => {
		const video = ref.current;
		if (!video) return void 0;
		if (alwaysPlay) {
			video.play().catch(() => {});
			return;
		}
		if (reduce) {
			video.pause();
			return;
		}
		if (typeof IntersectionObserver === "undefined") {
			video.play().catch(() => {});
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) video.play().catch(() => {});
			else video.pause();
		}, { rootMargin: "150px 0px" });
		observer.observe(video);
		return () => observer.disconnect();
	}, [alwaysPlay, reduce]);
	return ref;
}
/** Every gallery frame shares one reveal, so the column reads as a single sequence. */
function GalleryFigure({ image, index, reduce, alwaysPlay = false }) {
	const videoRef = usePlayWhenVisible(reduce, alwaysPlay);
	return /* @__PURE__ */ jsx(motion.figure, {
		initial: reduce ? false : {
			opacity: 0,
			y: 28
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-12% 0px"
		},
		transition: {
			duration: reduce ? 0 : .8,
			delay: reduce ? 0 : Math.min(index, 3) * .06,
			ease: [...EASE]
		},
		className: "overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)]",
		children: image.vimeo ? /* @__PURE__ */ jsx("div", {
			className: "aspect-video w-full bg-black",
			children: /* @__PURE__ */ jsx("iframe", {
				src: `https://player.vimeo.com/video/${image.vimeo}?dnt=1${alwaysPlay ? "&background=1&autoplay=1&loop=1&muted=1&autopause=0" : ""}`,
				title: image.alt || "Project film",
				loading: "lazy",
				allow: "autoplay; fullscreen; picture-in-picture",
				allowFullScreen: true,
				className: "h-full w-full"
			})
		}) : image.video ? /* @__PURE__ */ jsx("video", {
			ref: videoRef,
			src: image.src,
			muted: true,
			loop: true,
			autoPlay: alwaysPlay,
			playsInline: true,
			preload: "metadata",
			className: "block w-full"
		}) : /* @__PURE__ */ jsx("img", {
			src: image.src,
			alt: image.alt,
			loading: "lazy",
			decoding: "async",
			draggable: false,
			className: "block w-full"
		})
	});
}
function CaseStudy({ project: p }) {
	const reduce = useReducedMotion();
	const tapIntent = useTapIntent();
	const brief = p.brief ?? null;
	const gallery = (p.caseStudy ?? []).flatMap((section) => section.images ?? []).filter((image) => p.slug !== "tapmad-media-ads" || !TAPMAD_BAR_EXPORTS.has(image.src?.split("/").pop()));
	const goTo = (event, url) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (event.button !== void 0 && event.button !== 0) return;
		tapIntent.onClick(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		transitionTo(url);
	};
	const hasDetails = Boolean(brief && (brief.overview || brief.workedOn.length || brief.services.length || brief.highlights.length));
	const details = /* @__PURE__ */ jsxs("div", {
		className: "space-y-12",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]",
				children: [
					p.client,
					p.category,
					p.year
				].filter(Boolean).join(" · ")
			}), p.tags.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: p.tags.map((t) => /* @__PURE__ */ jsx(Tag, {
					accent: p.accent,
					children: t
				}, t))
			})] }),
			hasDetails ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsx(DetailBlock, {
					title: "Overview",
					children: brief.overview ? /* @__PURE__ */ jsx("p", {
						className: "text-[16px] leading-[1.8] text-[var(--mute)]",
						children: brief.overview
					}) : null
				}),
				/* @__PURE__ */ jsx(DetailBlock, {
					title: "What Marketorr worked on",
					children: brief.workedOn.length > 0 ? /* @__PURE__ */ jsx("ul", {
						className: "space-y-3 text-[15px] leading-relaxed text-[var(--mute)]",
						children: brief.workedOn.map((row) => /* @__PURE__ */ jsxs("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full",
								style: { background: p.accent },
								"aria-hidden": true
							}), row]
						}, row))
					}) : null
				}),
				/* @__PURE__ */ jsx(DetailBlock, {
					title: `${p.workGroupName ?? ""} services delivered`.trim(),
					children: brief.services.length > 0 ? /* @__PURE__ */ jsx("ul", {
						className: "flex flex-wrap gap-2",
						children: brief.services.map((service) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Tag, {
							accent: p.accent,
							children: service
						}) }, service))
					}) : null
				}),
				/* @__PURE__ */ jsx(DetailBlock, {
					title: "Highlights",
					children: brief.highlights.length > 0 ? /* @__PURE__ */ jsx("dl", {
						className: "divide-y divide-[var(--line)] border-y border-[var(--line)]",
						children: brief.highlights.map((row) => /* @__PURE__ */ jsxs("div", {
							className: "py-4",
							children: [/* @__PURE__ */ jsx("dt", {
								className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
								children: row.label
							}), /* @__PURE__ */ jsx("dd", {
								className: "mt-1 text-[15px] leading-relaxed text-[var(--ink)]",
								children: row.value
							})]
						}, row.label))
					}) : null
				}),
				/* @__PURE__ */ jsx(DetailBlock, {
					title: "Client",
					children: brief.client ? /* @__PURE__ */ jsxs("p", {
						className: "text-[15px] leading-relaxed text-[var(--ink)]",
						children: [brief.client, brief.website && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsxs("a", {
							href: brief.website,
							target: "_blank",
							rel: "noreferrer noopener",
							className: "mt-1 inline-block text-[var(--mute)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--ink-strong)]",
							children: [brief.website.replace(/^https?:\/\//, "").replace(/\/$/, ""), " ↗"]
						})] })]
					}) : null
				}),
				brief.behanceUrl && /* @__PURE__ */ jsx(DetailBlock, {
					title: "Full project",
					children: /* @__PURE__ */ jsx("a", {
						href: brief.behanceUrl,
						target: "_blank",
						rel: "noreferrer noopener",
						className: "text-[15px] leading-relaxed text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--ink-strong)]",
						children: "See every piece on Behance ↗"
					})
				})
			] }) : p.description && /* @__PURE__ */ jsx("p", {
				className: "text-[16px] leading-[1.8] text-[var(--mute)]",
				children: p.description
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-4 pt-2",
				children: [/* @__PURE__ */ jsx(MagneticButton, { children: /* @__PURE__ */ jsx(Link, {
					href: "/#contact",
					"data-cursor": "cta",
					className: "btn-press inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white",
					style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
					children: "Start a project ↗"
				}) }), /* @__PURE__ */ jsx(Link, {
					href: "/work",
					"data-cursor": "explore",
					onPointerDown: tapIntent.onPointerDown,
					onPointerCancel: tapIntent.onPointerCancel,
					onClick: (event) => goTo(event, "/work"),
					className: "btn-press inline-flex items-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)]",
					children: "← All work"
				})]
			})
		]
	});
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: `${p.title} | Marketorr` }), /* @__PURE__ */ jsxs("article", {
		className: "bg-[var(--bg)] pb-28",
		children: [/* @__PURE__ */ jsx(WorkHero, { project: p }), /* @__PURE__ */ jsx("div", {
			className: "container-x pt-16 md:pt-20",
			children: /* @__PURE__ */ jsxs("div", {
				className: "grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-16",
				children: [/* @__PURE__ */ jsx("div", {
					className: "lg:sticky lg:top-28 lg:self-start",
					children: details
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-6 md:space-y-8",
					children: gallery.length > 0 ? gallery.map((image, index) => /* @__PURE__ */ jsx(GalleryFigure, {
						image,
						index,
						reduce,
						alwaysPlay: p.slug === "amanah-global-network"
					}, image.src)) : Array.from({ length: PLACEHOLDER_FRAMES }, (_, index) => /* @__PURE__ */ jsx(motion.div, {
						initial: reduce ? false : {
							opacity: 0,
							y: 28
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: {
							once: true,
							margin: "-12% 0px"
						},
						transition: {
							duration: reduce ? 0 : .8,
							delay: reduce ? 0 : index * .06,
							ease: [...EASE]
						},
						className: "relative aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)]",
						children: /* @__PURE__ */ jsx(MediaPlaceholder, { label: `${p.title} - project image placeholder` })
					}, `placeholder-${index}`))
				})]
			})
		})]
	})] });
}
//#endregion
export { CaseStudy as default };
