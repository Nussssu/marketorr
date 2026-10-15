import { g as SectionLabel, h as GradientTitle, p as assetUrl, r as BRAND_SEQUENCE } from "../ssr.js";
import { t as PageMeta } from "./PageMeta-QhsyNps2.js";
import { n as About, t as RecognitionStrip } from "./RecognitionStrip-C3UOsOmV.js";
import { useRef } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
//#region resources/js/pages/About.jsx
var BRAND_GRADIENT = "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)";
var TIMELINE = [
	{
		year: "2022",
		title: "Two visionaries, one promise",
		copy: "Marketorr is born from a shared vision: help businesses cut through the noise and achieve meaningful growth. The founding promise, “Just Results”, still runs every engagement."
	},
	{
		year: "Today",
		title: "A full-stack growth crew",
		copy: "Strategists, media buyers, SEO specialists, designers and writers across Bangladesh and beyond: one dedicated pod behind every brand, led by CEO Kamrul Hasan Naim."
	},
	{
		year: "Proof",
		title: "Attention into revenue",
		copy: "From zero-to-1M-BDT launches to 2100% organic-traffic turnarounds, the work compounds: 100+ brands now grow on Marketorr-built engines."
	}
];
var MISSION = {
	title: "Our Mission",
	copy: "To help businesses grow through digital marketing that connects, engages and converts: blending creativity, technology and data into strategies that turn marketing into a true engine for growth."
};
var VISION = {
	title: "Our Vision",
	copy: "To redefine digital marketing in Bangladesh and beyond: every campaign purposeful, data-driven and built for lasting growth, from the trusted partner businesses choose for clarity and measurable impact."
};
var CEO = {
	name: "Md Kamrul Hasan Naim",
	role: "Founder & CEO",
	copy: "Leads Marketorr with a performance-first mindset, turning fast action, practical solutions and clear strategy into measurable growth for ambitious brands.",
	image: assetUrl("/images/about/kamrul-hasan-naim.jpg")
};
var RECOGNITION = [
	{
		name: "GoodFirms",
		detail: "Agency recognition",
		image: assetUrl("/images/about/recognition/goodfirms.png")
	},
	{
		name: "CrowdReviews",
		detail: "Agency recognition",
		image: assetUrl("/images/about/recognition/crowdreviews.png")
	},
	{
		name: "NTV",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/ntv.png")
	},
	{
		name: "The Business Standard",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/business-standard.png")
	},
	{
		name: "Asian Online",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/asian-online.png")
	},
	{
		name: "Bangladesh Pratidin",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/bangladesh-pratidin.png")
	},
	{
		name: "Samakal",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/samakal.png")
	},
	{
		name: "Banglanews24",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/banglanews.jpg")
	},
	{
		name: "Daily Inqilab",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/inqilab.png")
	},
	{
		name: "Bhorer Kagoj",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/bhorer-kagoj.png")
	},
	{
		name: "Bangladesh Post",
		detail: "Featured in",
		image: assetUrl("/images/about/recognition/bangladesh-post.png")
	}
];
/** Scroll-scrubbed rise + settle for section openers: drifts with the pass, never snaps. */
function ScrubRise({ children, className = "" }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 92%", "start 38%"]
	});
	const eased = useSpring(scrollYProgress, {
		stiffness: 90,
		damping: 26,
		mass: .5
	});
	const y = useTransform(eased, [0, 1], [reduce ? 0 : 46, 0]);
	const opacity = useTransform(eased, [0, 1], [.15, 1]);
	if (reduce) return /* @__PURE__ */ jsx("div", {
		className,
		children
	});
	return /* @__PURE__ */ jsx(motion.div, {
		ref,
		style: {
			y,
			opacity
		},
		className,
		children
	});
}
function Story() {
	const sectionRef = useRef(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end end"]
	});
	const progress = useSpring(scrollYProgress, {
		stiffness: 92,
		damping: 28,
		mass: .55
	});
	const scaleY = useTransform(progress, [.04, .78], [0, 1]);
	return /* @__PURE__ */ jsx("section", {
		ref: sectionRef,
		"aria-labelledby": "story-title",
		className: `${reduce ? "section-pad" : "h-[260svh]"} relative border-t border-[var(--line)] bg-[var(--bg-soft)]`,
		children: /* @__PURE__ */ jsxs("div", {
			className: `container-x grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 ${reduce ? "" : "section-pad sticky top-16 min-h-[calc(100svh-4rem)] content-center lg:top-[72px] lg:min-h-[calc(100svh-72px)]"}`,
			children: [/* @__PURE__ */ jsx("div", {
				className: "lg:sticky lg:top-32 lg:self-start",
				children: /* @__PURE__ */ jsxs(ScrubRise, { children: [
					/* @__PURE__ */ jsx(SectionLabel, { name: "Our story" }),
					/* @__PURE__ */ jsx("h2", {
						id: "story-title",
						className: "display-md mt-6 uppercase text-[var(--ink-strong)]",
						children: /* @__PURE__ */ jsx(GradientTitle, {
							text: "Born to cut noise",
							highlightWords: 2
						})
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-5 max-w-md text-[15px] leading-relaxed text-[var(--mute)]",
						children: "Marketorr was born in 2022 from a shared vision between two founders who had watched too many good businesses drown in vanity metrics. The antidote became the company promise:"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-6 border-l-2 pl-5 font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-3xl",
						style: { borderImage: `${BRAND_GRADIENT} 1` },
						children: ["“Just ", /* @__PURE__ */ jsx("span", {
							className: "text-gradient",
							children: "Results.”"
						})]
					})
				] })
			}), /* @__PURE__ */ jsxs("div", {
				className: "relative pl-8 md:pl-10",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "absolute inset-y-1 left-0 w-px bg-[var(--line)]",
						"aria-hidden": true
					}),
					!reduce && /* @__PURE__ */ jsx(motion.span, {
						className: "absolute inset-y-1 left-0 w-px origin-top",
						style: {
							scaleY,
							background: BRAND_GRADIENT
						},
						"aria-hidden": true
					}),
					/* @__PURE__ */ jsx("ol", {
						className: "flex flex-col gap-10",
						children: TIMELINE.map((stop, i) => /* @__PURE__ */ jsx(StoryPoint, {
							stop,
							index: i,
							progress,
							reduce
						}, stop.title))
					})
				]
			})]
		})
	});
}
function StoryPoint({ stop, index, progress, reduce }) {
	const revealStart = [
		.03,
		.31,
		.59
	][index];
	const revealEnd = [
		.18,
		.46,
		.74
	][index];
	const opacity = useTransform(progress, [revealStart, revealEnd], [0, 1]);
	const y = useTransform(progress, [revealStart, revealEnd], [28, 0]);
	const rotateX = useTransform(progress, [revealStart, revealEnd], [8, 0]);
	const scale = useTransform(progress, [revealStart, revealEnd], [.97, 1]);
	return /* @__PURE__ */ jsxs(motion.li, {
		className: "relative",
		style: reduce ? void 0 : {
			opacity,
			y,
			rotateX,
			scale,
			transformPerspective: 900,
			transformOrigin: "50% 100%"
		},
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "absolute top-1.5 h-2.5 w-2.5 rounded-full",
				style: {
					left: "-2.35rem",
					background: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length]
				},
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("p", {
				className: "font-display text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]",
				children: stop.year
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-2xl",
				children: stop.title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 max-w-lg text-[15px] leading-relaxed text-[var(--mute)]",
				children: stop.copy
			})
		]
	});
}
function MissionVision() {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"]
	});
	const progress = useSpring(scrollYProgress, {
		stiffness: 92,
		damping: 28,
		mass: .55
	});
	const visionY = useTransform(progress, [
		0,
		.42,
		.58,
		1
	], reduce ? [
		"0%",
		"0%",
		"0%",
		"0%"
	] : [
		"0%",
		"0%",
		"-10%",
		"-10%"
	]);
	const visionOpacity = useTransform(progress, [
		0,
		.42,
		.58,
		1
	], [
		1,
		1,
		0,
		0
	]);
	const visionScale = useTransform(progress, [
		0,
		.42,
		.58,
		1
	], [
		1,
		1,
		.99,
		.99
	]);
	const missionY = useTransform(progress, [
		0,
		.46,
		.62,
		1
	], reduce ? [
		"0%",
		"0%",
		"0%",
		"0%"
	] : [
		"10%",
		"10%",
		"0%",
		"0%"
	]);
	const missionOpacity = useTransform(progress, [
		0,
		.46,
		.62,
		1
	], [
		0,
		0,
		1,
		1
	]);
	const missionScale = useTransform(progress, [
		0,
		.46,
		.62,
		1
	], [
		.99,
		.99,
		1,
		1
	]);
	const scenes = [{
		card: VISION,
		index: "03",
		label: "Our vision",
		image: assetUrl("/images/about/vision-cartoon.png"),
		imageAlt: "3D character exploring ideas with a laptop",
		style: {
			y: visionY,
			opacity: visionOpacity,
			scale: visionScale
		}
	}, {
		card: MISSION,
		index: "04",
		label: "Our mission",
		image: assetUrl("/images/about/mission-cartoon.png"),
		imageAlt: "3D character carrying a laptop toward a goal",
		style: {
			y: missionY,
			opacity: missionOpacity,
			scale: missionScale
		}
	}];
	return /* @__PURE__ */ jsx("section", {
		ref,
		"aria-label": "Mission and vision",
		className: "relative h-[260svh] overflow-clip bg-[var(--bg-soft)]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "sticky top-16 h-[calc(100svh-4rem)] overflow-hidden lg:top-[72px] lg:h-[calc(100svh-72px)]",
			children: [/* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 opacity-70",
				style: { background: "radial-gradient(40% 70% at 8% 100%, rgba(137,31,251,0.14), transparent 68%), radial-gradient(36% 65% at 95% 0%, rgba(27,226,235,0.1), transparent 66%)" },
				"aria-hidden": true
			}), /* @__PURE__ */ jsx("div", {
				className: "container-x relative h-full",
				children: /* @__PURE__ */ jsx("div", {
					className: "grid h-full",
					children: scenes.map(({ card, index, label, image, imageAlt, style }) => /* @__PURE__ */ jsxs(motion.article, {
						style,
						className: "relative col-start-1 row-start-1 grid h-full w-full content-center gap-6 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.78fr)] sm:items-center sm:gap-10 md:gap-14",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(SectionLabel, { name: label }),
							/* @__PURE__ */ jsx("h3", {
								className: "mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-5xl",
								children: /* @__PURE__ */ jsx(GradientTitle, {
									text: card.title,
									highlightWords: 1
								})
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 max-w-lg text-[15px] leading-[1.75] text-[var(--mute)] md:text-base",
								children: card.copy
							})
						] }), /* @__PURE__ */ jsx("img", {
							src: image,
							alt: imageAlt,
							loading: "lazy",
							decoding: "async",
							className: "mx-auto max-h-[34svh] w-full max-w-[300px] object-contain sm:max-h-[58svh] sm:max-w-[520px]"
						})]
					}, card.title))
				})
			})]
		})
	});
}
function LeadershipPortrait() {
	const reduce = useReducedMotion();
	return /* @__PURE__ */ jsx(motion.figure, {
		initial: reduce ? false : {
			opacity: 0,
			y: 28,
			scale: .97
		},
		whileInView: reduce ? void 0 : {
			opacity: 1,
			y: 0,
			scale: 1
		},
		viewport: {
			once: true,
			amount: .22,
			margin: "0px 0px -5% 0px"
		},
		transition: reduce ? void 0 : {
			type: "spring",
			stiffness: 170,
			damping: 17,
			mass: .75
		},
		className: "relative overflow-hidden rounded-[2rem]",
		children: /* @__PURE__ */ jsx("img", {
			src: CEO.image,
			alt: `${CEO.name}, ${CEO.role} at Marketorr`,
			loading: "lazy",
			decoding: "async",
			className: "aspect-[4/5] h-full max-h-[620px] w-full object-cover object-top"
		})
	});
}
function LeadershipCopy() {
	const reduce = useReducedMotion();
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: reduce ? false : {
			opacity: 0,
			y: 24,
			scale: .985
		},
		whileInView: reduce ? void 0 : {
			opacity: 1,
			y: 0,
			scale: 1
		},
		viewport: {
			once: true,
			amount: .3,
			margin: "0px 0px -5% 0px"
		},
		transition: reduce ? void 0 : {
			type: "spring",
			stiffness: 175,
			damping: 18,
			mass: .72,
			delay: .1
		},
		className: "flex flex-col justify-center",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#891FFB]",
				children: CEO.role
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-4xl",
				children: CEO.name
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--mute)] md:text-base",
				children: CEO.copy
			})
		]
	});
}
function Team() {
	return /* @__PURE__ */ jsxs("section", {
		"aria-labelledby": "team-title",
		className: "section-pad relative border-t border-[var(--line)]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsxs(ScrubRise, { children: [/* @__PURE__ */ jsx(SectionLabel, { name: "Leadership" }), /* @__PURE__ */ jsx("h2", {
				id: "team-title",
				className: "display-md mt-6 max-w-3xl uppercase text-[var(--ink-strong)]",
				children: /* @__PURE__ */ jsx(GradientTitle, {
					text: "Minds behind the growth",
					highlightWords: 2
				})
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "mt-12 grid items-center gap-10 md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1fr)] md:gap-14 lg:gap-20",
				children: [/* @__PURE__ */ jsx(LeadershipPortrait, {}), /* @__PURE__ */ jsx(LeadershipCopy, {})]
			})]
		}), /* @__PURE__ */ jsx(Awards, {})]
	});
}
function Awards() {
	return /* @__PURE__ */ jsxs("div", {
		"aria-labelledby": "awards-title",
		className: "mt-24 overflow-hidden sm:mt-28 lg:mt-32",
		children: [/* @__PURE__ */ jsx("div", {
			className: "container-x text-center",
			children: /* @__PURE__ */ jsx("h3", {
				id: "awards-title",
				className: "font-display text-lg font-extrabold uppercase tracking-[0.14em] text-[var(--ink-strong)] sm:text-xl md:text-2xl",
				children: "Awards & Recognition"
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-8 md:mt-10",
			children: /* @__PURE__ */ jsx(RecognitionStrip, { items: RECOGNITION })
		})]
	});
}
function StoryVisionSequence() {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative bg-[var(--bg-soft)]",
		children: [/* @__PURE__ */ jsx(Story, {}), /* @__PURE__ */ jsx(MissionVision, {})]
	});
}
function AboutPage({ page }) {
	const aboutContent = page?.sections?.find((section) => section.type === "about")?.content;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(PageMeta, {
			page,
			fallbackTitle: "About | Marketorr"
		}),
		/* @__PURE__ */ jsx(About, {
			content: aboutContent,
			heroHeading: true
		}),
		/* @__PURE__ */ jsxs("main", { children: [/* @__PURE__ */ jsx(StoryVisionSequence, {}), /* @__PURE__ */ jsx(Team, {})] })
	] });
}
//#endregion
export { AboutPage as default };
