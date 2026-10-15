import { _ as useTheme, a as markBarStyle, c as useTapIntent, f as assetUrl, g as Tag, h as SectionLabel, i as MARK, l as MagneticButton, m as GradientTitle, n as BRAND_SEQUENCE, o as markGap, p as GradientButton, r as COLORS, s as transitionTo, u as useBoxPointer, v as useThemeMotion } from "../ssr.js";
import { t as EASE } from "./motion-DQVPQ9oM.js";
import { t as ScrollHeading } from "./ScrollHeading-BhPAyGdL.js";
import { n as useMediaQuery, t as ProjectMotion } from "./ProjectMotion-BU-5H2tG.js";
import { n as BounceTitle, t as UiuxPrinter } from "./UiuxPrinter-Qynryw3d.js";
import { i as isCharukothon, r as CharukothonCover, t as projectCardMedia } from "./projectHeroMedia-BMtu9RG3.js";
import { t as MediaPlaceholder } from "./MediaPlaceholder-BAEKlLsR.js";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Fragment, memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion, transform, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
//#region resources/js/components/PageMeta.jsx
/**
* Per-page head tags driven by the CMS: title, description, canonical, robots
* and Open Graph, each falling back to the site defaults from Settings.
*
* @param {{ page?: { title?: string, meta?: object }, fallbackTitle?: string }} props
*/
function PageMeta({ page, fallbackTitle }) {
	const { settings } = usePage().props;
	const meta = page?.meta ?? {};
	const title = meta.title || page?.title || fallbackTitle || settings.meta.title;
	const description = meta.description || settings.meta.description;
	const ogImage = meta.ogImage || settings.meta.ogImage;
	return /* @__PURE__ */ jsxs(Head, {
		title,
		children: [
			/* @__PURE__ */ jsx("meta", {
				name: "description",
				content: description,
				"head-key": "description"
			}),
			meta.robots && /* @__PURE__ */ jsx("meta", {
				name: "robots",
				content: meta.robots,
				"head-key": "robots"
			}),
			meta.canonical && /* @__PURE__ */ jsx("link", {
				rel: "canonical",
				href: meta.canonical,
				"head-key": "canonical"
			}),
			/* @__PURE__ */ jsx("meta", {
				property: "og:title",
				content: title,
				"head-key": "og:title"
			}),
			/* @__PURE__ */ jsx("meta", {
				property: "og:description",
				content: description,
				"head-key": "og:description"
			}),
			/* @__PURE__ */ jsx("meta", {
				property: "og:type",
				content: "website",
				"head-key": "og:type"
			}),
			ogImage && /* @__PURE__ */ jsx("meta", {
				property: "og:image",
				content: ogImage,
				"head-key": "og:image"
			}),
			/* @__PURE__ */ jsx("meta", {
				name: "twitter:card",
				content: ogImage ? "summary_large_image" : "summary",
				"head-key": "twitter:card"
			}),
			meta.schema && /* @__PURE__ */ jsx("script", {
				type: "application/ld+json",
				"head-key": "schema",
				children: JSON.stringify(meta.schema)
			})
		]
	});
}
//#endregion
//#region resources/js/components/motion/CountUp.jsx
/** Phones count up once; desktop keeps replaying on every viewport re-entry. */
var COUNTER_ONCE_QUERY = "(max-width: 767px)";
/**
* A number that counts up from a small non-zero floor whenever it scrolls
* into view. Large values are grouped ("2,100").
*
* @param {{ to: number, prefix?: string, suffix?: string, decimals?: number }} props
*/
function CountUp({ to, prefix = "", suffix = "", decimals = 0 }) {
	const ref = useRef(null);
	const [once] = useState(() => typeof window !== "undefined" && window.matchMedia(COUNTER_ONCE_QUERY).matches);
	const inView = useInView(ref, {
		margin: "-15% 0px",
		once
	});
	const reduce = useReducedMotion();
	const [val, setVal] = useState(to);
	useEffect(() => {
		if (!inView) return;
		const floor = Math.min(to, Math.max(1, Math.floor(to * .08)));
		if (reduce || floor >= to) {
			setVal(to);
			return;
		}
		let raf = 0;
		const start = performance.now();
		const dur = 1600;
		const tick = (t) => {
			const p = Math.min(1, (t - start) / dur);
			const eased = 1 - Math.pow(2, -10 * p);
			setVal(floor + (to - floor) * (p === 1 ? 1 : eased));
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [
		inView,
		to,
		reduce
	]);
	return /* @__PURE__ */ jsxs("span", {
		ref,
		children: [
			prefix,
			val.toLocaleString("en-US", {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals
			}),
			suffix
		]
	});
}
//#endregion
//#region resources/js/components/motion/RevealText.jsx
/**
* Masked line-by-line reveal. `duration` and `stagger` are exposed so a
* section can run a punchier version without changing the default cadence
* every other heading on the site already uses.
*/
function RevealText({ lines, className = "", lineClassName = "", delay = 0, stagger = .08, duration = .9, as: Tag = "span", highlightedLines = [] }) {
	const reduce = useReducedMotion();
	const MTag = motion[Tag] ?? motion.span;
	return /* @__PURE__ */ jsx(MTag, {
		className,
		initial: reduce ? false : "hidden",
		whileInView: "show",
		viewport: {
			once: true,
			margin: "-10% 0px"
		},
		variants: reduce ? void 0 : {
			hidden: {},
			show: { transition: {
				staggerChildren: stagger,
				delayChildren: delay
			} }
		},
		children: lines.map((line, i) => /* @__PURE__ */ jsx("span", {
			className: `mask-line ${lineClassName}`,
			children: /* @__PURE__ */ jsx(motion.span, {
				className: `mask-inner ${highlightedLines.includes(i) ? "text-gradient" : ""}`.trimEnd(),
				variants: reduce ? void 0 : {
					hidden: { y: reduce ? "0%" : "110%" },
					show: {
						y: "0%",
						transition: {
							duration,
							ease: [...EASE]
						}
					}
				},
				children: line
			})
		}, i))
	});
}
//#endregion
//#region resources/js/components/decor/Stage.jsx
/**
* Reusable cinematic background stage.
*
* Composes layered radial glows, an optional faint grid, a dynamic
* atmosphere wash (driven by `--atmo`), logo-inspired three-bar motif
* and a gradient hairline — without ever duplicating the
* CSS in every section. Always `aria-hidden` + pointer-events-none so
* decor can never cover text or intercept clicks.
*
* Variants encode intent: hero = strongest tricolor lighting,
* about = clean + dark, services = reactive atmosphere,
* contact = full convergence. The Our Work section runs undecorated.
*/
var VARIANTS = {
	hero: {
		grid: false,
		orbs: [
			{
				color: "var(--glow-purple)",
				cls: "-left-40 top-[28%] h-[480px] w-[480px]"
			},
			{
				color: "var(--glow-blue)",
				cls: "right-[-160px] top-[6%] h-[430px] w-[430px]"
			},
			{
				color: "var(--glow-cyan)",
				cls: "bottom-[-130px] left-1/3 h-[300px] w-[540px]"
			}
		],
		beam: true
	},
	about: {
		grid: false,
		orbs: [{
			color: "var(--glow-blue)",
			cls: "right-[-140px] top-[4%] h-[340px] w-[340px]"
		}],
		motif: "right-[5%] top-[10%]"
	},
	services: {
		grid: true,
		orbs: [],
		atmosphere: true
	},
	contact: {
		grid: false,
		orbs: [{
			color: "var(--glow-purple)",
			cls: "left-[-120px] top-[6%] h-[400px] w-[400px]"
		}, {
			color: "var(--glow-cyan)",
			cls: "bottom-[-140px] left-[30%] h-[300px] w-[560px]"
		}],
		hairline: true
	}
};
/** Height of the background motif's tallest bar. */
var MOTIF_SIZE = "96px";
function Motif({ cls = "" }) {
	return /* @__PURE__ */ jsx("div", {
		className: `absolute hidden items-end opacity-50 sm:flex ${cls}`,
		style: { gap: markGap(MOTIF_SIZE) },
		"aria-hidden": true,
		children: MARK.colors.map((color, index) => /* @__PURE__ */ jsx("span", {
			className: "motif-bar",
			style: {
				...markBarStyle(MOTIF_SIZE, index),
				background: `linear-gradient(180deg, ${color}59, transparent)`
			}
		}, color))
	});
}
function Stage({ variant = "about", atmo = null, atmoKey = "base" }) {
	const fx = useThemeMotion();
	const v = VARIANTS[variant] ?? VARIANTS.about;
	return /* @__PURE__ */ jsxs("div", {
		className: "pointer-events-none absolute inset-0 overflow-hidden",
		"aria-hidden": true,
		children: [
			v.grid && /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0" }),
			v.beam && /* @__PURE__ */ jsx("div", {
				className: "absolute left-1/2 top-[-220px] h-[380px] w-[720px] max-w-none -translate-x-1/2 rounded-[100%]",
				style: {
					background: "radial-gradient(ellipse, var(--glow-purple), transparent 70%)",
					opacity: fx.orb
				}
			}),
			(v.orbs ?? []).map((o, i) => /* @__PURE__ */ jsx("div", {
				className: `absolute rounded-full ${o.cls}`,
				style: {
					background: `radial-gradient(closest-side, ${o.color}, transparent)`,
					opacity: fx.orb
				}
			}, i)),
			v.atmosphere && atmo && /* @__PURE__ */ jsx("div", {
				className: "atmo-wash absolute inset-0",
				style: { background: `radial-gradient(55% 45% at 72% 18%, ${atmo}2e, transparent 70%)` }
			}, atmoKey),
			v.motif && /* @__PURE__ */ jsx(Motif, { cls: v.motif }),
			v.hairline && /* @__PURE__ */ jsx("div", { className: "hairline-brand hairline-fade absolute inset-x-0 top-0 opacity-70" })
		]
	});
}
//#endregion
//#region resources/js/lib/headingLines.js
/**
* Indexes of the last `count` lines of a multi-line heading — the lines that
* carry the brand gradient, as an editor sets them in the admin.
*
* @param {string[]|undefined|null} lines
* @param {number|string|undefined|null} count
* @return {number[]}
*/
function gradientLines(lines = [], count = 0) {
	const total = (lines ?? []).length;
	return Array.from({ length: Math.min(total, Number(count || 0)) }, (_, i) => total - 1 - i);
}
//#endregion
//#region resources/js/components/sections/About.jsx
/** Tagline phrase colours, in order: purple, blue, cyan. */
var TAGLINE_COLORS = [
	"#891FFB",
	"#507AF4",
	"#1BE2EB"
];
/** Accent bar under each stat block, repeating if more metrics are configured. */
var METRIC_ACCENTS = [
	"#891FFB",
	"#891FFB",
	"#507AF4",
	"#1BE2EB"
];
function MetricsGrid({ metrics }) {
	return /* @__PURE__ */ jsx("div", {
		className: "mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4",
		children: metrics.map((m, i) => /* @__PURE__ */ jsxs("div", {
			className: "bg-[var(--surface)] p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "font-display text-4xl font-extrabold text-[var(--ink-strong)] md:text-5xl",
					children: /* @__PURE__ */ jsx(CountUp, {
						to: Number(m.value),
						suffix: m.suffix ?? ""
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]",
					children: m.label
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mt-4 block h-[2px] w-10",
					style: { background: METRIC_ACCENTS[i % METRIC_ACCENTS.length] },
					"aria-hidden": true
				})
			]
		}, m.label))
	});
}
/** How many closing words of the manifesto take the brand gradient once lit. */
var MANIFESTO_ACCENT_WORDS = 4;
/**
* One word of the manifesto. It owns its slice of the scroll range, so the
* statement lights up word by word as the reader moves through it rather than
* all at once.
*/
function ManifestoWord({ word, progress, start, end, accent }) {
	const opacity = useTransform(progress, [start, end], [.16, 1]);
	return /* @__PURE__ */ jsxs(motion.span, {
		style: { opacity },
		className: accent ? "text-gradient" : void 0,
		children: [word, " "]
	});
}
/**
* The landing page's About: the agency statement itself, set large and lit
* word by word on scroll. The About page opens with the headline version
* instead, so the two no longer repeat each other.
*/
function ManifestoAbout({ label, text, metrics, tagline, compactTop }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 85%", "end 45%"]
	});
	const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
	const accentFrom = words.length - MANIFESTO_ACCENT_WORDS;
	return /* @__PURE__ */ jsxs("section", {
		id: "about",
		className: `noise relative overflow-hidden bg-[var(--bg-soft)] ${compactTop ? "pb-[clamp(5rem,9vw,9rem)] pt-16 sm:pt-[clamp(5rem,9vw,9rem)]" : "section-pad"}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute inset-0",
			"aria-hidden": true,
			children: /* @__PURE__ */ jsx(Stage, { variant: "about" })
		}), /* @__PURE__ */ jsxs("div", {
			className: "container-x relative",
			children: [
				label && /* @__PURE__ */ jsx(SectionLabel, { name: label.toUpperCase() }),
				/* @__PURE__ */ jsx("h2", {
					className: "sr-only",
					children: label
				}),
				/* @__PURE__ */ jsx("p", {
					className: "sr-only",
					children: text
				}),
				/* @__PURE__ */ jsx("p", {
					ref,
					"aria-hidden": true,
					className: "mt-10 max-w-[68rem] font-display text-[clamp(1.6rem,3.4vw,3.1rem)] font-bold leading-[1.14] tracking-[-0.025em] text-[var(--ink-strong)]",
					children: words.map((word, i) => reduce ? /* @__PURE__ */ jsxs("span", {
						className: i >= accentFrom ? "text-gradient" : void 0,
						children: [word, " "]
					}, i) : /* @__PURE__ */ jsx(ManifestoWord, {
						word,
						progress: scrollYProgress,
						start: i / words.length,
						end: (i + 1) / words.length,
						accent: i >= accentFrom
					}, i))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-10 flex flex-wrap items-center justify-between gap-6",
					children: [tagline.length > 0 && /* @__PURE__ */ jsx("p", {
						className: "font-display text-[12px] font-bold uppercase tracking-[0.22em]",
						children: tagline.map((phrase, index) => /* @__PURE__ */ jsxs("span", {
							style: { color: TAGLINE_COLORS[index % TAGLINE_COLORS.length] },
							children: [phrase, index < tagline.length - 1 ? " " : ""]
						}, `${phrase}-${index}`))
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap gap-8",
						children: [/* @__PURE__ */ jsx(Link, {
							href: "/about",
							"data-cursor": "explore",
							className: "link-underline btn-press inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
							children: "Our story →"
						}), /* @__PURE__ */ jsx(Link, {
							href: "/services",
							"data-cursor": "explore",
							className: "link-underline btn-press inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
							children: "Explore our services →"
						})]
					})]
				}),
				/* @__PURE__ */ jsx(MetricsGrid, { metrics })
			]
		})]
	});
}
/**
* @param {{
*   variant?: 'hero'|'manifesto',
*   heroHeading?: boolean,
*   compactTop?: boolean,
*   content?: { text?: string, metrics?: Array<object> },
* }} props
*   Content from the page's About section, falling back to Settings.
*   `manifesto` is the landing page's scroll-lit statement; `hero` is the
*   headline version the About page opens with.
*/
function About({ variant = "hero", heroHeading = false, compactTop = false, content }) {
	const { settings } = usePage().props;
	const text = content?.text || settings.about.text;
	const metrics = content?.metrics?.length ? content.metrics : settings.about.metrics;
	const tagline = (content?.tagline ?? []).filter(Boolean);
	if (variant === "manifesto") return /* @__PURE__ */ jsx(ManifestoAbout, {
		label: content?.heading,
		text,
		metrics,
		tagline,
		compactTop
	});
	return /* @__PURE__ */ jsxs("section", {
		id: "about",
		className: `noise relative overflow-hidden bg-[var(--bg-soft)] ${compactTop ? "pb-[clamp(5rem,9vw,9rem)] pt-16 sm:pt-[clamp(5rem,9vw,9rem)]" : "section-pad"}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute inset-0",
			"aria-hidden": true,
			children: /* @__PURE__ */ jsx(Stage, { variant: "about" })
		}), /* @__PURE__ */ jsxs("div", {
			className: "container-x relative",
			children: [
				content?.heading && /* @__PURE__ */ jsx(SectionLabel, { name: content.heading.toUpperCase() }),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-10 grid gap-12 lg:grid-cols-12",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-7",
						children: [/* @__PURE__ */ jsx(ScrollHeading, {
							enabled: heroHeading,
							children: /* @__PURE__ */ jsx(RevealText, {
								as: "h2",
								className: "display-lg uppercase text-[var(--ink-strong)]",
								lines: content?.titleLines ?? [],
								highlightedLines: gradientLines(content?.titleLines, content?.titleHighlight)
							})
						}), /* @__PURE__ */ jsx(motion.div, {
							initial: { scaleX: 0 },
							whileInView: { scaleX: 1 },
							viewport: { once: true },
							transition: {
								duration: 1,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							className: "mt-8 h-[3px] w-48 origin-left",
							style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
							"aria-hidden": true
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-5 lg:pt-4",
						children: [
							/* @__PURE__ */ jsx(motion.p, {
								initial: {
									opacity: 0,
									y: 24
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: { once: true },
								transition: {
									duration: .75,
									ease: [
										.22,
										1,
										.36,
										1
									]
								},
								className: "text-[16px] leading-relaxed text-[var(--mute)]",
								children: text
							}),
							tagline.length > 0 && /* @__PURE__ */ jsx("p", {
								className: "mt-5 font-display text-[12px] font-bold uppercase tracking-[0.22em]",
								children: tagline.map((phrase, index) => /* @__PURE__ */ jsxs("span", {
									style: { color: TAGLINE_COLORS[index % TAGLINE_COLORS.length] },
									children: [phrase, index < tagline.length - 1 ? " " : ""]
								}, `${phrase}-${index}`))
							}),
							content?.linkLabel && /* @__PURE__ */ jsx(Link, {
								href: content.linkUrl || "/services",
								"data-cursor": "explore",
								className: "link-underline btn-press mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
								children: content.linkLabel
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx(MetricsGrid, { metrics })
			]
		})]
	});
}
//#endregion
//#region resources/js/components/sections/MissionVision.jsx
/** How far into the pinned section one scroll carries the reader to the next card. */
var FIRST_SWAP = .01;
var SCENE_EASE = [
	.22,
	1,
	.36,
	1
];
/**
* Which card the scroll position shows: the first until one scroll past the
* pin point, then the rest spread evenly over the remaining pinned travel.
*
* @param {number} value scroll progress, 0–1
* @param {number} count number of cards
*/
function cardAt(value, count) {
	if (count < 2 || value <= FIRST_SWAP) return 0;
	const step = .99 / (count - 1);
	return Math.min(count - 1, 1 + Math.floor((value - FIRST_SWAP) / step));
}
/**
* Cards (e.g. Vision, then Mission) in one pinned frame. Scroll only decides
* WHICH card shows — one scroll down brings the next, scrolling back up
* returns the previous — and the swap itself plays as a short timed
* animation: the outgoing card leaves first, then the incoming one settles
* in. Nothing is scrubbed by the wheel, so two cards never sit half-overlapped
* while the reader reads.
*
* @param {{ content?: { highlight?: number, items?: Array<{ label?: string, title?: string, copy?: string, image?: string, imageAlt?: string }> } }} props
*/
function MissionVision({ content = {} }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"]
	});
	const [active, setActive] = useState(0);
	const items = (content.items ?? []).filter((item) => item?.title);
	const highlight = Number(content.highlight ?? 0);
	useMotionValueEvent(scrollYProgress, "change", (value) => {
		const next = cardAt(value, items.length);
		setActive((current) => current === next ? current : next);
	});
	if (items.length === 0) return null;
	const sceneMotion = (index) => {
		const isActive = index === active;
		return {
			initial: false,
			animate: {
				opacity: isActive ? 1 : 0,
				y: isActive || reduce ? 0 : index < active ? -28 : 28
			},
			transition: reduce ? { duration: 0 } : {
				duration: isActive ? .6 : .35,
				delay: isActive ? .22 : 0,
				ease: SCENE_EASE
			},
			style: { pointerEvents: isActive ? "auto" : "none" },
			"aria-hidden": !isActive
		};
	};
	return /* @__PURE__ */ jsx("section", {
		ref,
		"aria-label": "Mission and vision",
		className: "relative h-[200svh] overflow-clip bg-[var(--bg-soft)]",
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
					children: items.map((card, sceneIndex) => /* @__PURE__ */ jsxs(motion.article, {
						...sceneMotion(sceneIndex),
						className: "relative col-start-1 row-start-1 grid h-full w-full content-center gap-6 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.78fr)] sm:items-center sm:gap-10 md:gap-14",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							card.label && /* @__PURE__ */ jsx(SectionLabel, { name: card.label }),
							/* @__PURE__ */ jsx("h3", {
								className: "mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-5xl",
								children: /* @__PURE__ */ jsx(GradientTitle, {
									text: card.title,
									highlightWords: highlight
								})
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 max-w-lg text-[15px] leading-[1.75] text-[var(--mute)] md:text-base",
								children: card.copy
							})
						] }), card.image && /* @__PURE__ */ jsx("img", {
							src: assetUrl(card.image),
							alt: card.imageAlt ?? "",
							loading: "lazy",
							decoding: "async",
							className: "mx-auto max-h-[34svh] w-full max-w-[300px] object-contain sm:max-h-[58svh] sm:max-w-[520px]"
						})]
					}, `${card.title}-${sceneIndex}`))
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/components/motion/CinematicScene.jsx
var RICH_QUERY$1 = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
/**
* Travel applied while a scene is arriving (`in`) and while it is falling back
* behind the next one (`out`). Phones run the same choreography flattened:
* shorter travel, no perspective rotation, no depth.
*
* @type {Record<'rich'|'light', { yIn: number, yOut: number, scaleIn: number, scaleOut: number, opacityIn: number, opacityOut: number, rotateIn: number, rotateOut: number, zIn: number, zOut: number }>}
*/
var STAGE = {
	rich: {
		yIn: 110,
		yOut: -56,
		scaleIn: .9,
		scaleOut: .94,
		opacityIn: .2,
		opacityOut: .32,
		rotateIn: 7.5,
		rotateOut: -4.5,
		zIn: -210,
		zOut: -170
	},
	light: {
		yIn: 54,
		yOut: -24,
		scaleIn: .96,
		scaleOut: .985,
		opacityIn: .45,
		opacityOut: .6,
		rotateIn: 0,
		rotateOut: 0,
		zIn: 0,
		zOut: 0
	}
};
/**
* @param {number} a
* @param {number} b
* @param {number} t
* @return {number}
*/
function lerp(a, b, t) {
	return a + (b - a) * t;
}
/**
* Ease-out so a scene decelerates into its resting frame instead of arriving
* linearly with the scroll wheel.
*
* @param {number} t
* @return {number}
*/
function ease(t) {
	return 1 - Math.pow(1 - (t < 0 ? 0 : t > 1 ? 1 : t), 3);
}
/**
* True on tablet/desktop widths. Starts false for the server render and
* hydration (see `useMediaQuery`), then switches to the rich stage on mount.
*
* @return {boolean}
*/
function useRichStage() {
	return useMediaQuery(RICH_QUERY$1);
}
/**
* Wraps one home-page section so it reads as its own scene in a 3D stage: it
* comes forward out of depth as the viewer scrolls to it, rests perfectly flat
* and untransformed while it is being read, then falls back and dims as the
* next scene arrives.
*
* Two scroll ranges drive it instead of one progress over the whole section,
* so arrival and departure each take a fixed slice of viewport travel no
* matter how tall the section is — a short section and a very long one land
* with the same weight:
*
* - `enter`: the section's top travelling from the viewport bottom to 28% down
*   the viewport.
* - `leave`: the section's bottom travelling from 72% down the viewport to the
*   viewport top.
*
* The two are combined per property, so the resting state is genuinely
* identity — no residual fractional scale sitting under the text, which is
* what makes type look soft on scaled layers.
*
* The measured element never moves: the scroll ranges are read from the static
* outer wrapper and the transform is applied to the inner layer, so the effect
* can never feed back into its own progress.
*
* @param {{
*   children: import('react').ReactNode,
*   depth?: boolean,
*   className?: string,
* }} props
*   `depth` false keeps the scene's travel flat (no perspective rotation or
*   translateZ) for content that does not survive a 3D ancestor — an embedded
*   map, for example — while still moving with the rest of the page.
*/
function CinematicScene({ children, depth = true, className = "" }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const rich = useRichStage();
	const active = useInView(ref, { margin: "40% 0px" });
	const { scrollYProgress: enter } = useScroll({
		target: ref,
		offset: ["start end", "start 28%"]
	});
	const { scrollYProgress: leave } = useScroll({
		target: ref,
		offset: ["end 72%", "end start"]
	});
	const stage = rich ? STAGE.rich : STAGE.light;
	const dimensional = rich && depth;
	const y = useTransform([enter, leave], ([i, o]) => lerp(lerp(stage.yIn, 0, ease(i)), stage.yOut, ease(o)));
	const scale = useTransform([enter, leave], ([i, o]) => lerp(lerp(stage.scaleIn, 1, ease(i)), stage.scaleOut, ease(o)));
	const opacity = useTransform([enter, leave], ([i, o]) => lerp(lerp(stage.opacityIn, 1, ease(i)), stage.opacityOut, ease(o)));
	const rotateX = useTransform([enter, leave], ([i, o]) => dimensional ? lerp(lerp(stage.rotateIn, 0, ease(i)), stage.rotateOut, ease(o)) : 0);
	const z = useTransform([enter, leave], ([i, o]) => dimensional ? lerp(lerp(stage.zIn, 0, ease(i)), stage.zOut, ease(o)) : 0);
	if (reduce) return /* @__PURE__ */ jsx("div", {
		className,
		children
	});
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: `cine-scene ${className}`.trimEnd(),
		"data-active": active ? "true" : void 0,
		style: dimensional ? { perspective: "1600px" } : void 0,
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "cine-scene__layer",
			style: {
				y,
				z,
				rotateX,
				scale,
				opacity,
				transformOrigin: "50% 0%",
				transformStyle: dimensional ? "preserve-3d" : void 0
			},
			children
		})
	});
}
//#endregion
//#region resources/js/components/motion/SectionAppear.jsx
/**
* How a section arrives on the landing page.
*
* The alternative to `CinematicScene`: instead of a section flying forward
* out of 3D depth and then dimming and falling back as the next one arrives,
* it simply lifts into place once — a short rise, a soft fade, and then it is
* finished and completely still for as long as the reader is there.
*
* Two things matter about that:
*
* - It plays ONCE. Nothing re-animates on the way back up and nothing dims
*   while it is still on screen, so scrolling the page never feels like it is
*   taking the content away from you.
* - It never transforms the section in 3D. No perspective, no rotation, no
*   resting scale, which is what keeps type genuinely sharp rather than
*   resampled, and leaves the section free to hold `position: sticky`
*   children of its own.
*
* Each widget keeps its own internal motion exactly as it was — this only
* governs the arrival of the block as a whole.
*/
function SectionAppear({ children, className = "" }) {
	if (useReducedMotion()) return /* @__PURE__ */ jsx("div", {
		className,
		children
	});
	return /* @__PURE__ */ jsx(motion.div, {
		className,
		initial: {
			opacity: 0,
			y: 34
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			amount: .12,
			margin: "0px 0px -6% 0px"
		},
		transition: {
			duration: .8,
			ease: [...EASE]
		},
		children
	});
}
//#endregion
//#region resources/js/components/sections/RecognitionStrip.jsx
/**
* Fewest plates in one half of the loop. A short list is repeated until it
* reaches this, so a half is always wider than even a very wide screen and
* the row never runs out before it wraps (about 224px per plate at desktop,
* so 16 covers screens beyond 3,500px).
*/
var MIN_PLATES_PER_HALF = 16;
/**
* An endless row of logo plates. Two identical halves travel exactly one
* half-width, so the wrap is invisible; `reverse` runs it the other way.
* `duration` is the time one pass of `items` takes, so repeating a short
* list to fill the row keeps the same speed.
*
* @param {{
*   items: Array<{ name: string, image: string }>,
*   duration?: number,
*   reverse?: boolean,
* }} props
*/
function RecognitionStrip({ items, duration = 58, reverse = false }) {
	const reduce = useReducedMotion();
	const repeats = Math.max(1, Math.ceil(MIN_PLATES_PER_HALF / Math.max(1, items.length)));
	const plates = Array.from({ length: repeats }, (_, round) => items.map((item) => ({
		...item,
		round
	}))).flat();
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-hidden py-4 md:py-6",
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "flex w-max",
			animate: reduce ? void 0 : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] },
			transition: reduce ? void 0 : {
				duration: duration * repeats,
				ease: "linear",
				repeat: Infinity
			},
			children: [false, true].map((duplicate) => /* @__PURE__ */ jsx("ul", {
				className: "flex shrink-0 gap-4 pr-4 sm:gap-6 sm:pr-6 md:gap-8 md:pr-8",
				"aria-hidden": duplicate || void 0,
				children: plates.map((item) => /* @__PURE__ */ jsx("li", {
					className: "award-plate flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl px-5 sm:h-24 sm:w-44 md:w-48 md:px-6",
					children: /* @__PURE__ */ jsx("img", {
						src: item.image,
						alt: duplicate || item.round > 0 ? "" : item.name,
						loading: "lazy",
						decoding: "async",
						className: "max-h-9 w-full max-w-[124px] object-contain sm:max-h-11 sm:max-w-[140px] md:max-w-[150px]"
					})
				}, `${duplicate ? "duplicate-" : ""}${item.round}-${item.name}`))
			}, duplicate ? "duplicate" : "primary"))
		})
	});
}
//#endregion
//#region resources/js/components/sections/Awards.jsx
/**
* A heading over a drifting strip of award and press logos. It closes the
* section padding the leadership section above it leaves open, so the two
* read as they always have.
*
* @param {{ content?: { heading?: string, items?: Array<{ name?: string, detail?: string, image?: string }> } }} props
*/
function Awards({ content = {} }) {
	const items = (content.items ?? []).filter((award) => award?.name && award?.image).map((award) => ({
		...award,
		image: assetUrl(award.image)
	}));
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		"aria-labelledby": "awards-title",
		className: "relative overflow-hidden pb-[clamp(5rem,9vw,9rem)]",
		children: [content.heading && /* @__PURE__ */ jsx("div", {
			className: "container-x text-center",
			children: /* @__PURE__ */ jsx("h3", {
				id: "awards-title",
				className: "font-display text-lg font-extrabold uppercase tracking-[0.14em] text-[var(--ink-strong)] sm:text-xl md:text-2xl",
				children: content.heading
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-8 md:mt-10",
			children: /* @__PURE__ */ jsx(RecognitionStrip, { items })
		})]
	});
}
//#endregion
//#region resources/js/components/sections/ClosingPanel.jsx
var BRAND_GRADIENT$3 = "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)";
/**
* A centred closing panel: a small label, a heading and one button.
*
* @param {{ content?: { label?: string, heading?: string, buttonLabel?: string, buttonUrl?: string } }} props
*/
function ClosingPanel({ content = {} }) {
	if (!content.heading && !content.buttonLabel) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "container-x pb-24 pt-8 min-[769px]:py-24 lg:py-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-7 py-16 text-center sm:px-12 lg:py-24",
			children: [
				content.label && /* @__PURE__ */ jsx("p", {
					className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
					children: content.label
				}),
				content.heading && /* @__PURE__ */ jsx("h2", {
					className: "display-md mx-auto mt-5 max-w-4xl uppercase text-[var(--ink-strong)]",
					children: /* @__PURE__ */ jsx(BounceTitle, {
						text: content.heading,
						highlightWords: 0,
						delay: .1,
						onScroll: true
					})
				}),
				content.buttonLabel && /* @__PURE__ */ jsxs(Link, {
					href: content.buttonUrl || "/contact",
					className: "btn-press mt-8 inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.17em] text-white",
					style: { background: BRAND_GRADIENT$3 },
					children: [
						content.buttonLabel,
						" ",
						/* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							children: "↗"
						})
					]
				})
			]
		})
	});
}
//#endregion
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
			const marker = L.marker(MAP_CENTER, {
				keyboard: true,
				title: "Marketorr studio",
				icon: L.divIcon({
					className: "mk-map__pin-icon",
					html: "<span class=\"mk-map__pin\"></span><span class=\"mk-map__pulse\" aria-hidden=\"true\"></span>",
					iconSize: [26, 26],
					iconAnchor: [13, 13],
					popupAnchor: [0, -14]
				})
			}).addTo(map);
			marker.bindPopup(`<p class="mk-map__popup-label">Marketorr</p><p class="mk-map__popup-address">${String(address ?? "").replace(/\b(Plot|Road|Sector|House|Block|Level) /g, "$1\xA0")}</p><a class="mk-map__popup-link" href="${directionsHref}" target="_blank" rel="noreferrer">Get directions ↗</a>`, {
				className: "mk-map__popup",
				closeButton: true,
				minWidth: 240,
				maxWidth: 260,
				autoPanPadding: [20, 20]
			});
			new (L.Control.extend({ onAdd() {
				const button = L.DomUtil.create("button", "mk-map__recenter");
				button.type = "button";
				button.title = "Show the studio address";
				button.setAttribute("aria-label", "Show the studio address");
				button.innerHTML = "<span aria-hidden=\"true\">◎</span>";
				L.DomEvent.disableClickPropagation(button);
				L.DomEvent.on(button, "click", (event) => {
					L.DomEvent.preventDefault(event);
					const lift = Math.min(90, map.getSize().y * .3);
					const target = map.unproject(map.project(MAP_CENTER, MAP_ZOOM).subtract([0, lift]), MAP_ZOOM);
					map.setView(target, MAP_ZOOM, { animate: false });
					marker.openPopup();
				});
				return button;
			} }))({ position: "bottomright" }).addTo(map);
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
//#region resources/js/components/sections/Contact.jsx
var BRAND_GRADIENT$2 = "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)";
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
* A masked, multi-line heading: each line rises out of its own mask, and the
* last `highlight` lines carry the brand gradient. The lines come from the
* section's content, so editors write them in the admin.
*
* @param {{ lines?: string[], highlight?: number, reduce: boolean }} props
*/
function TitleLines({ lines = [], highlight = 0, reduce }) {
	const visible = lines.filter(Boolean);
	const gradientFrom = visible.length - Number(highlight || 0);
	return visible.map((line, index) => /* @__PURE__ */ jsx("span", {
		className: "mask-line",
		children: /* @__PURE__ */ jsx(motion.span, {
			variants: reduce ? void 0 : omniLine,
			className: `mask-inner${index >= gradientFrom ? " text-gradient" : ""}`,
			children: line
		})
	}, `${line}-${index}`));
}
/** Small ruled chip that opens each block, as the section labels do elsewhere. */
function BlockChip({ children }) {
	return /* @__PURE__ */ jsxs(motion.span, {
		variants: omniRise,
		className: "inline-flex h-7 w-fit shrink-0 select-none items-center gap-2 self-start rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]",
		children: [/* @__PURE__ */ jsx("span", {
			className: "h-1.5 w-1.5 rounded-full",
			style: { background: BRAND_GRADIENT$2 },
			"aria-hidden": true
		}), children]
	});
}
/**
* One question. The answer opens with a pure-CSS grid-rows transition, so
* toggling never measures layout in JS and the motion stays smooth even
* mid-scroll: the panel glides open while its text fades and drifts up a
* few pixels, and the plus gives way to a cross. Only one answer is open
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
			className: "group flex h-14 w-full items-center gap-5 px-5 text-left",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: `font-display text-[12px] font-bold tracking-[0.18em] transition-colors duration-100 ${open ? "bg-clip-text text-transparent" : "text-[var(--ink-faint)]"}`,
					style: open ? { backgroundImage: BRAND_GRADIENT$2 } : void 0,
					"aria-hidden": true,
					children: String(index + 1).padStart(2, "0")
				}),
				/* @__PURE__ */ jsx("span", {
					className: "min-w-0 flex-1 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-[var(--ink)] md:text-[17px]",
					children: item.question
				}),
				/* @__PURE__ */ jsx("span", {
					className: "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-colors duration-100 group-hover:border-transparent",
					style: open ? {
						background: BRAND_GRADIENT$2,
						backgroundOrigin: "border-box",
						borderColor: "transparent"
					} : void 0,
					"aria-hidden": true,
					children: open ? /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 12 12",
						className: "h-3 w-3 text-white",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.4",
						strokeLinecap: "round",
						children: /* @__PURE__ */ jsx("path", { d: "M2.5 2.5l7 7M9.5 2.5l-7 7" })
					}) : /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 12 12",
						className: "h-3 w-3 text-[var(--ink)]",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.4",
						strokeLinecap: "round",
						children: /* @__PURE__ */ jsx("path", { d: "M6 1.5v9M1.5 6h9" })
					})
				})
			]
		}), /* @__PURE__ */ jsx(FastCollapse, {
			open,
			id,
			children: /* @__PURE__ */ jsx("p", {
				className: `max-w-[58ch] pb-5 pl-[4.4rem] pr-8 text-[14px] leading-[22px] text-[var(--mute)] transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none ${open ? "translate-y-0 opacity-100" : "-translate-y-0.5 opacity-0"}`,
				children: item.answer
			})
		})]
	});
});
/**
* Keep accordion state inside the FAQ subtree. Toggling an answer must not
* re-render the contact form and map above it.
*/
function FaqList({ items, reduce }) {
	const [openFaq, setOpenFaq] = useState(-1);
	const toggleFaq = useCallback((index) => {
		setOpenFaq((current) => current === index ? -1 : index);
	}, []);
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col gap-3 lg:h-full lg:justify-between",
		children: items.map((item, index) => /* @__PURE__ */ jsx(FaqRow, {
			item,
			index,
			open: openFaq === index,
			onToggle: toggleFaq,
			reduce
		}, `${item.question}-${index}`))
	});
}
/** Live studio time. Seconds tick, so the strip reads as a signal, not a label. */
/**
* The inquiry form's dropdown, drawn in the site theme instead of the
* browser's native list. The list floats over the form, so nothing around it
* shifts or jumps when it opens. It opens below the field, or above it when
* there is not room below for the whole list, so every option stays visible.
*
* @param {{ value: string, onChange: (value: string) => void, options: string[], placeholder: string, label: string }} props
*/
function ThemedSelect({ value, onChange, options, placeholder, label }) {
	const [open, setOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(-1);
	const [dropUp, setDropUp] = useState(false);
	const rootRef = useRef(null);
	const listRef = useRef(null);
	const listId = useId();
	useLayoutEffect(() => {
		if (!open || !rootRef.current || !listRef.current) return;
		const field = rootRef.current.getBoundingClientRect();
		const needed = listRef.current.offsetHeight + 12;
		const below = window.innerHeight - field.bottom;
		const above = field.top;
		setDropUp(below < needed && above > below);
	}, [open]);
	useEffect(() => {
		if (!open) return void 0;
		const onPointerDown = (event) => {
			if (!rootRef.current?.contains(event.target)) setOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [open]);
	const openList = () => {
		setHighlighted(Math.max(0, options.indexOf(value)));
		setOpen(true);
	};
	const choose = (option) => {
		onChange(option);
		setOpen(false);
	};
	const onKeyDown = (event) => {
		if (event.key === "Escape") {
			setOpen(false);
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!open) {
				openList();
				return;
			}
			const step = event.key === "ArrowDown" ? 1 : -1;
			setHighlighted((current) => (current + step + options.length) % options.length);
			return;
		}
		if ((event.key === "Enter" || event.key === " ") && open && highlighted >= 0) {
			event.preventDefault();
			choose(options[highlighted]);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		ref: rootRef,
		className: "relative",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			"aria-haspopup": "listbox",
			"aria-expanded": open,
			"aria-controls": listId,
			"aria-label": `${label}: ${value || placeholder}`,
			onClick: () => open ? setOpen(false) : openList(),
			onKeyDown,
			className: `field-box flex h-12 w-full items-center justify-between gap-3 rounded-xl px-4 text-left text-[14px] ${value ? "" : "is-empty"}`.trimEnd(),
			style: open ? {
				borderColor: "transparent",
				boxShadow: "0 0 0 1px #507af4"
			} : void 0,
			children: [/* @__PURE__ */ jsx("span", {
				className: "min-w-0 truncate",
				children: value || placeholder
			}), /* @__PURE__ */ jsx("svg", {
				viewBox: "0 0 12 7",
				className: `h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-300 ${open ? "rotate-180" : ""}`,
				fill: "none",
				"aria-hidden": true,
				children: /* @__PURE__ */ jsx("path", {
					d: "M1 1l5 5 5-5",
					stroke: "currentColor",
					strokeWidth: "1.6",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			})]
		}), open && /* @__PURE__ */ jsx("ul", {
			ref: listRef,
			id: listId,
			role: "listbox",
			"aria-label": label,
			className: `absolute inset-x-0 z-30 ${dropUp ? "bottom-full mb-2" : "top-full mt-2"} overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]`,
			children: options.map((option, index) => {
				const selected = option === value;
				const active = index === highlighted;
				return /* @__PURE__ */ jsxs("li", {
					role: "option",
					"aria-selected": selected,
					onPointerEnter: () => setHighlighted(index),
					onClick: () => choose(option),
					className: `flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors duration-150 ${active ? "text-white" : "text-[var(--ink)]"} ${selected ? "font-semibold" : ""}`.trimEnd(),
					style: active ? { background: BRAND_GRADIENT$2 } : void 0,
					children: [/* @__PURE__ */ jsx("span", {
						className: "min-w-0 truncate",
						children: option
					}), selected && /* @__PURE__ */ jsx("span", {
						className: "h-1.5 w-1.5 shrink-0 rounded-full",
						style: { background: active ? "#fff" : BRAND_GRADIENT$2 },
						"aria-hidden": true
					})]
				}, option);
			})
		})]
	});
}
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
				style: { background: BRAND_GRADIENT$2 },
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
function Contact({ content = {} }) {
	const reduce = useReducedMotion();
	const fx = useThemeMotion();
	const [showSuccess, setShowSuccess] = useState(false);
	const scrollReveal = reduce ? {} : {
		initial: "hidden",
		whileInView: "show",
		viewport: revealViewport
	};
	const { settings, inquiryTypes = [] } = usePage().props;
	const { contactEmail, contactPhone, address, directionsUrl } = settings;
	const { data, setData, post, processing, errors, clearErrors } = useForm({ ...BLANK_INQUIRY });
	const budgets = (content.budgets ?? []).filter(Boolean);
	const projectTypes = (content.projectTypes ?? []).filter((type) => inquiryTypes.includes(type));
	const successBody = String(content.successBody ?? "").replace("{email}", contactEmail ?? "");
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
			/* @__PURE__ */ jsx("div", {
				className: "container-x relative",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid gap-12 lg:grid-cols-[minmax(0,1fr)_600px] lg:grid-rows-[auto_1fr_auto] lg:items-stretch lg:gap-x-10 lg:gap-y-0",
					children: [
						/* @__PURE__ */ jsx(motion.div, {
							...scrollReveal,
							variants: reduce ? void 0 : omniRise,
							className: "lg:col-start-1 lg:row-start-1",
							children: content.heading && /* @__PURE__ */ jsx(SectionLabel, { name: content.heading.toUpperCase() })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col lg:col-start-1 lg:row-start-2",
							children: [
								/* @__PURE__ */ jsx(motion.h2, {
									...scrollReveal,
									variants: reduce ? void 0 : lineGroup,
									className: "display-lg mt-7 uppercase text-[var(--ink-strong)]",
									children: /* @__PURE__ */ jsx(TitleLines, {
										lines: content.titleLines,
										highlight: content.titleHighlight,
										reduce
									})
								}),
								content.intro && /* @__PURE__ */ jsx(motion.p, {
									...scrollReveal,
									variants: reduce ? void 0 : omniRise,
									className: "mt-7 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]",
									children: content.intro
								}),
								/* @__PURE__ */ jsxs(motion.div, {
									...scrollReveal,
									variants: reduce ? void 0 : omniRise,
									className: "mt-9 grid gap-6 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-start gap-3",
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
													children: content.emailTileLabel
												}), /* @__PURE__ */ jsx("a", {
													href: `mailto:${contactEmail}`,
													className: "link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]",
													children: contactEmail
												})]
											})]
										}),
										contactPhone && /* @__PURE__ */ jsxs("div", {
											className: "flex items-start gap-3",
											children: [/* @__PURE__ */ jsx("span", {
												className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
												style: { background: "color-mix(in srgb, #507AF4 14%, transparent)" },
												"aria-hidden": true,
												children: /* @__PURE__ */ jsx("svg", {
													viewBox: "0 0 24 24",
													className: "h-[18px] w-[18px]",
													fill: "none",
													stroke: "#507AF4",
													strokeWidth: "1.8",
													strokeLinecap: "round",
													strokeLinejoin: "round",
													children: /* @__PURE__ */ jsx("path", { d: "M5 3.5h3.2l1.6 4.3-2.1 1.4a11 11 0 0 0 5.1 5.1l1.4-2.1 4.3 1.6V17a2.5 2.5 0 0 1-2.7 2.5A15.5 15.5 0 0 1 2.5 6.2 2.5 2.5 0 0 1 5 3.5Z" })
												})
											}), /* @__PURE__ */ jsxs("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ jsx("span", {
													className: "block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]",
													children: content.phoneTileLabel
												}), /* @__PURE__ */ jsx("a", {
													href: `tel:${contactPhone.replace(/[^+\d]/g, "")}`,
													className: "link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]",
													children: contactPhone
												})]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-start gap-3",
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
													children: content.locationTileLabel
												}), /* @__PURE__ */ jsx("a", {
													href: directionsUrl,
													target: "_blank",
													rel: "noreferrer",
													className: "link-underline btn-press mt-1 block break-words text-[14px] font-semibold text-[var(--ink)]",
													children: address
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
									children: content.mapLinkLabel
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "hidden lg:col-start-1 lg:row-start-3 lg:block",
							children: /* @__PURE__ */ jsx("a", {
								href: directionsUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "link-underline btn-press mt-4 inline-block text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
								children: content.mapLinkLabel
							})
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
										style: { background: BRAND_GRADIENT$2 },
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
										children: content.successHeading
									}),
									successBody && /* @__PURE__ */ jsx("p", {
										className: "mt-3 max-w-[38ch] text-[14px] leading-[22px] text-[var(--mute)]",
										children: successBody
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
										children: content.sendAnotherLabel
									})
								]
							}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
								content.formLabel && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-faint)]",
									children: [/* @__PURE__ */ jsx("span", {
										className: "h-1.5 w-1.5 rounded-full",
										style: { background: BRAND_GRADIENT$2 },
										"aria-hidden": true
									}), content.formLabel]
								}),
								content.formHeading && /* @__PURE__ */ jsx("h3", {
									className: "mt-4 font-display text-[clamp(1.4rem,2vw,28px)] font-extrabold tracking-[-0.01em] text-[var(--ink-strong)]",
									children: content.formHeading
								}),
								content.formIntro && /* @__PURE__ */ jsx("p", {
									className: "mt-2 text-[14px] leading-[22px] text-[var(--mute)]",
									children: content.formIntro
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-7 grid gap-5 sm:grid-cols-2 lg:flex-1 lg:grid-rows-[auto_auto_auto_1fr]",
									children: [
										[
											{
												key: "name",
												label: content.nameLabel,
												type: "text",
												ph: content.namePlaceholder
											},
											{
												key: "email",
												label: content.emailLabel,
												type: "email",
												ph: content.emailPlaceholder
											},
											{
												key: "phone",
												label: content.phoneLabel,
												type: "tel",
												ph: content.phonePlaceholder
											},
											{
												key: "company",
												label: content.companyLabel,
												type: "text",
												ph: content.companyPlaceholder
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
										/* @__PURE__ */ jsxs("div", {
											className: "block",
											children: [/* @__PURE__ */ jsx("span", {
												className: "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
												children: content.budgetLabel
											}), /* @__PURE__ */ jsx(ThemedSelect, {
												label: content.budgetLabel ?? "",
												value: data.budget,
												onChange: (value) => setData("budget", value),
												options: budgets,
												placeholder: content.budgetPlaceholder ?? ""
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "block",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
													children: content.typeLabel
												}),
												/* @__PURE__ */ jsx(ThemedSelect, {
													label: content.typeLabel ?? "",
													value: data.type,
													onChange: (value) => setData("type", value),
													options: projectTypes,
													placeholder: content.typePlaceholder ?? ""
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
													children: content.messageLabel
												}),
												/* @__PURE__ */ jsx("textarea", {
													rows: 4,
													value: data.message,
													onChange: (e) => setData("message", e.target.value),
													placeholder: content.messagePlaceholder ?? "",
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
									style: { background: BRAND_GRADIENT$2 },
									children: processing ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
										className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white",
										"aria-hidden": true
									}), content.sendingLabel] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
										content.submitLabel,
										" ",
										/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											children: "→"
										})
									] })
								}),
								content.formNote && /* @__PURE__ */ jsx("p", {
									className: "mt-3 text-center text-[12px] text-[var(--ink-faint)]",
									children: content.formNote
								})
							] })]
						})
					]
				})
			})
		]
	}) });
}
/**
* Shared setup for the Contact page's follow-on sections: the same reveal and
* reduced-motion handling as the main Contact block.
*/
function useSectionReveal() {
	const reduce = useReducedMotion();
	return {
		reduce,
		scrollReveal: reduce ? {} : {
			initial: "hidden",
			whileInView: "show",
			viewport: revealViewport
		}
	};
}
/**
* The Contact page's questions: heading, intro and a help box beside the
* accordion. Its top padding keeps the same gap below the Contact block that
* the page has always had.
*
* @param {{ content?: { label?: string, titleLines?: string[], titleHighlight?: number, intro?: string, items?: Array<{ question?: string, answer?: string }>, helpHeading?: string, helpBody?: string, helpLinkLabel?: string } }} props
*/
function ContactFaq({ content = {} }) {
	const { reduce, scrollReveal } = useSectionReveal();
	const faqs = (content.items ?? []).filter((item) => item?.question);
	return /* @__PURE__ */ jsx("section", {
		className: "noise relative overflow-hidden bg-[var(--bg)] pt-12",
		children: /* @__PURE__ */ jsx("div", {
			className: "container-x relative",
			children: /* @__PURE__ */ jsxs("div", {
				className: "grid gap-12 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-stretch lg:gap-x-12 lg:gap-y-0",
				children: [/* @__PURE__ */ jsxs(motion.div, {
					...scrollReveal,
					variants: reduce ? void 0 : omniGroup,
					className: "flex flex-col",
					children: [
						content.label && /* @__PURE__ */ jsx(BlockChip, { children: content.label }),
						/* @__PURE__ */ jsx(motion.h2, {
							variants: reduce ? void 0 : lineGroup,
							className: "display-lg mt-4 uppercase text-[var(--ink-strong)]",
							children: /* @__PURE__ */ jsx(TitleLines, {
								lines: content.titleLines,
								highlight: content.titleHighlight,
								reduce
							})
						}),
						/* @__PURE__ */ jsx(motion.span, {
							variants: reduce ? void 0 : omniRise,
							className: "mt-4 block h-[3px] w-10 rounded-full",
							style: { background: BRAND_GRADIENT$2 },
							"aria-hidden": true
						}),
						content.intro && /* @__PURE__ */ jsx(motion.p, {
							variants: reduce ? void 0 : omniRise,
							className: "mt-5 max-w-[44ch] text-[14px] leading-[22px] text-[var(--mute)]",
							children: content.intro
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
										children: content.helpHeading
									}),
									content.helpBody && /* @__PURE__ */ jsx("span", {
										className: "mt-1 block text-[13px] text-[var(--mute)]",
										children: content.helpBody
									}),
									content.helpLinkLabel && /* @__PURE__ */ jsxs("a", {
										href: "#project-inquiry",
										"data-cursor": "cta",
										className: "link-underline btn-press mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-gradient",
										children: [
											content.helpLinkLabel,
											" ",
											/* @__PURE__ */ jsx("span", {
												"aria-hidden": true,
												children: "→"
											})
										]
									})
								]
							})]
						})
					]
				}), /* @__PURE__ */ jsx(FaqList, {
					items: faqs,
					reduce
				})]
			})
		})
	});
}
/**
* The Contact page's closing block: heading and copy beside the social links
* and a call to action, then the reply-time line and studio clock.
*
* @param {{ content?: { label?: string, titleLines?: string[], titleHighlight?: number, body?: string, buttonLabel?: string, closingNote?: string } }} props
*/
function ContactConnect({ content = {} }) {
	const { reduce, scrollReveal } = useSectionReveal();
	const { settings } = usePage().props;
	const { socials } = settings;
	return /* @__PURE__ */ jsx("section", {
		className: "noise relative overflow-hidden bg-[var(--bg)] pb-16 pt-28 lg:pb-20 lg:pt-32",
		children: /* @__PURE__ */ jsx("div", {
			className: "container-x relative",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "grid gap-12 lg:grid-cols-[minmax(0,1fr)_534px] lg:items-start lg:gap-x-12 lg:gap-y-0",
				children: [/* @__PURE__ */ jsxs(motion.div, {
					...scrollReveal,
					variants: reduce ? void 0 : omniGroup,
					className: "flex flex-col",
					children: [
						content.label && /* @__PURE__ */ jsx(BlockChip, { children: content.label }),
						/* @__PURE__ */ jsx(motion.h2, {
							variants: reduce ? void 0 : lineGroup,
							className: "display-lg mt-4 uppercase text-[var(--ink-strong)]",
							children: /* @__PURE__ */ jsx(TitleLines, {
								lines: content.titleLines,
								highlight: content.titleHighlight,
								reduce
							})
						}),
						/* @__PURE__ */ jsx(motion.span, {
							variants: reduce ? void 0 : omniRise,
							className: "mt-6 block h-[3px] w-10 rounded-full",
							style: { background: BRAND_GRADIENT$2 },
							"aria-hidden": true
						}),
						content.body && /* @__PURE__ */ jsx(motion.p, {
							variants: reduce ? void 0 : omniRise,
							className: "mt-6 max-w-[46ch] text-[14px] leading-[22px] text-[var(--mute)]",
							children: content.body
						})
					]
				}), /* @__PURE__ */ jsxs(motion.div, {
					...scrollReveal,
					variants: reduce ? void 0 : omniRise,
					className: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 lg:mt-[44px]",
					children: [/* @__PURE__ */ jsx("ul", {
						className: "list-none border-b border-[var(--line)]",
						children: [
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
							}
						].filter((row) => row.href).map((row) => /* @__PURE__ */ jsx("li", {
							className: "border-b border-[var(--line)] last:border-b-0",
							children: /* @__PURE__ */ jsxs("a", {
								href: row.href,
								target: "_blank",
								rel: "noreferrer",
								"data-social-platform": row.label,
								className: "group flex items-center gap-4 py-4 text-[var(--ink)]",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--ink)]",
										"aria-hidden": true,
										children: /* @__PURE__ */ jsxs("svg", {
											viewBox: "0 0 24 24",
											className: "h-[15px] w-[15px]",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "1.7",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											children: [
												row.label === "LinkedIn" && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
													x: "3",
													y: "3",
													width: "18",
													height: "18",
													rx: "2.5"
												}), /* @__PURE__ */ jsx("path", { d: "M7.5 10v7M7.5 7.25v.1M11.5 17v-4a3 3 0 0 1 6 0v4M11.5 10v7" })] }),
												row.label === "Behance" && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M3.5 6.5h5a3 3 0 0 1 0 6h-5zM3.5 12.5h5.75a3.25 3.25 0 0 1 0 6.5H3.5zM14.5 7h5" }), /* @__PURE__ */ jsx("path", { d: "M20.5 15.5h-7a3.5 3.5 0 1 0 6.35 2" })] }),
												row.label === "Dribbble" && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("circle", {
													cx: "12",
													cy: "12",
													r: "9"
												}), /* @__PURE__ */ jsx("path", { d: "M7.2 4.4c3.1 3.8 5.8 8.2 7.5 14.8M3.2 10.4c4.7.1 9.2-1.2 12.5-4.1M5.4 17.8c2.5-3.6 6.7-5.4 15.4-4.4" })] }),
												row.label === "Instagram" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
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
												] })
											]
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
						style: { background: BRAND_GRADIENT$2 },
						children: [
							content.buttonLabel,
							" ",
							/* @__PURE__ */ jsx("span", {
								"aria-hidden": true,
								children: "→"
							})
						]
					})]
				})]
			}), /* @__PURE__ */ jsxs(motion.div, {
				...scrollReveal,
				variants: reduce ? void 0 : omniRise,
				className: "mt-12 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-14",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
					children: ["Marketorr", content.closingNote && /* @__PURE__ */ jsxs(Fragment$1, { children: [" · ", /* @__PURE__ */ jsx("span", {
						className: "text-gradient",
						children: content.closingNote
					})] })]
				}), /* @__PURE__ */ jsx(StudioClock, {})]
			})] })
		})
	});
}
//#endregion
//#region resources/js/components/sections/Cta.jsx
/**
* @param {{ content?: { heading?: string, body?: string, buttonLabel?: string, buttonUrl?: string } }} props
*/
function Cta({ content }) {
	const { heading, body, buttonLabel, buttonUrl } = content ?? {};
	if (!heading && !body) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg-soft)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x max-w-3xl text-center",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "NEXT STEP" }),
				heading && /* @__PURE__ */ jsx("h2", {
					className: "display-md mt-8 uppercase text-[var(--ink-strong)]",
					children: /* @__PURE__ */ jsx(GradientTitle, { text: heading })
				}),
				body && /* @__PURE__ */ jsx("p", {
					className: "mt-5 text-[16px] leading-[1.75] text-[var(--mute)]",
					children: body
				}),
				buttonLabel && buttonUrl && /* @__PURE__ */ jsx("div", {
					className: "mt-9 flex justify-center",
					children: /* @__PURE__ */ jsx(GradientButton, {
						href: buttonUrl,
						children: buttonLabel
					})
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/sections/Faq.jsx
/**
* Expandable question list. One answer is open at a time; clicking the open
* question closes it.
*
* @param {{ content?: { heading?: string, items?: Array<{ question?: string, answer?: string }> } }} props
*/
function Faq({ content }) {
	const [openIndex, setOpenIndex] = useState(null);
	const items = content?.items ?? [];
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x max-w-3xl",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: content?.heading || "FAQ" }), /* @__PURE__ */ jsx("dl", {
				className: "mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]",
				children: items.map((item, index) => {
					const open = openIndex === index;
					const panelId = `faq-answer-${index}`;
					return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setOpenIndex(open ? null : index),
						"aria-expanded": open,
						"aria-controls": panelId,
						className: "flex w-full items-center justify-between gap-6 py-5 text-left",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-display text-[16px] font-bold text-[var(--ink-strong)]",
							children: item.question
						}), /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "shrink-0 text-[var(--ink-faint)]",
							children: open ? /* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 12 12",
								className: "h-3.5 w-3.5",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.4",
								strokeLinecap: "round",
								children: /* @__PURE__ */ jsx("path", { d: "M2.5 2.5l7 7M9.5 2.5l-7 7" })
							}) : /* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 12 12",
								className: "h-3.5 w-3.5",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.4",
								strokeLinecap: "round",
								children: /* @__PURE__ */ jsx("path", { d: "M6 1.5v9M1.5 6h9" })
							})
						})]
					}) }), /* @__PURE__ */ jsx(FastCollapse, {
						open,
						id: panelId,
						children: /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("p", {
							className: `pb-6 text-[15px] leading-[1.75] text-[var(--mute)] transition-opacity duration-100 motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`,
							children: item.answer
						}) })
					})] }, `${item.question}-${index}`);
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/components/sections/Features.jsx
/**
* @param {{ content?: { heading?: string, items?: Array<{ title?: string, body?: string, accent?: string }> } }} props
*/
function Features({ content }) {
	const reduce = useReducedMotion();
	const items = content?.items ?? [];
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: content?.heading || "Features" }), /* @__PURE__ */ jsx("div", {
				className: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: items.map((item, index) => /* @__PURE__ */ jsxs(motion.article, {
					initial: reduce ? { opacity: 0 } : {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-10% 0px"
					},
					transition: {
						duration: .45,
						delay: index * .06,
						ease: EASE
					},
					className: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "block h-1 w-10 rounded-full",
							style: { background: item.accent || BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] },
							"aria-hidden": true
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "mt-5 font-display text-[18px] font-bold text-[var(--ink-strong)]",
							children: /* @__PURE__ */ jsx(GradientTitle, { text: item.title })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2.5 text-[15px] leading-[1.7] text-[var(--mute)]",
							children: item.body
						})
					]
				}, `${item.title}-${index}`))
			})]
		})
	});
}
//#endregion
//#region resources/js/components/decor/DesignCanvas.jsx
var RICH_QUERY = "(min-width: 1024px)";
var COARSE_QUERY = "(pointer: coarse)";
var SWATCHES = [
	COLORS.grape,
	COLORS.iris,
	COLORS.frost
];
/** Wireframe copy lines inside the app window, as a fraction of its width. */
var COPY_LINES = [
	.78,
	.56,
	.66
];
/**
* One layer of the canvas, set at its own depth so the pointer tilt gives
* the stack parallax. Lengths inside are `cqw` of the canvas, so the whole
* piece scales with its box.
*/
function Layer({ depth, className = "", style, children }) {
	return /* @__PURE__ */ jsx("div", {
		className: `absolute ${className}`.trimEnd(),
		style: {
			...style,
			transform: `translateZ(${depth}px)`,
			transformStyle: "preserve-3d"
		},
		children
	});
}
/**
* The hero's design object: a working canvas caught mid-session. An app
* window wireframe builds itself (UI/UX), a brand card holds the type and
* the three brand colours (branding), a pen-tool curve draws in with its
* anchors and handles (the craft), a selection frame breathes around the
* brand card, and a named collaborator cursor moves between them.
*
* Three inputs move it, kept apart so none fights the others:
*
* - **Pointer** tilts the whole stage (spring-damped rotateX/rotateY), and
*   the layers' different depths give it parallax.
* - **Scroll** — the hero's own progress, passed in — rolls it, pushes it back
*   and fades it as the hero leaves.
* - **Ambient** CSS animations build the wireframe, draw the curve, pop the
*   swatches and move the cursor, all transform/opacity or a stroke offset,
*   so the canvas is alive while the page is still.
*
* No canvas, no WebGL, no per-frame React state. It is shown from desktop
* width up; there, coarse pointers drop the pointer tracking and the ambient
* motion and keep only the scroll response, and reduced motion renders it
* static.
*
* @param {{ progress?: import('framer-motion').MotionValue<number> }} props
*   `progress` is the hero's scroll progress (0 at rest, 1 once the hero has
*   scrolled away).
*/
function DesignCanvas({ progress }) {
	const reduce = useReducedMotion();
	const hostRef = useRef(null);
	const [rich, setRich] = useState(false);
	const [running, setRunning] = useState(true);
	const pointerX = useMotionValue(0);
	const pointerY = useMotionValue(0);
	const tiltY = useSpring(pointerX, {
		stiffness: 60,
		damping: 18,
		mass: .6
	});
	const tiltX = useSpring(pointerY, {
		stiffness: 60,
		damping: 18,
		mass: .6
	});
	useEffect(() => {
		const rq = window.matchMedia(RICH_QUERY);
		const cq = window.matchMedia(COARSE_QUERY);
		const update = () => setRich(rq.matches && !cq.matches);
		update();
		rq.addEventListener("change", update);
		cq.addEventListener("change", update);
		return () => {
			rq.removeEventListener("change", update);
			cq.removeEventListener("change", update);
		};
	}, []);
	useEffect(() => {
		if (!rich || reduce) return void 0;
		const onMove = (event) => {
			const nx = event.clientX / window.innerWidth * 2 - 1;
			const ny = event.clientY / window.innerHeight * 2 - 1;
			pointerX.set(nx * 16);
			pointerY.set(ny * -12);
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => window.removeEventListener("pointermove", onMove);
	}, [
		rich,
		reduce,
		pointerX,
		pointerY
	]);
	useEffect(() => {
		const host = hostRef.current;
		if (!host || typeof IntersectionObserver === "undefined") return void 0;
		let onScreen = true;
		const sync = () => setRunning(onScreen && !document.hidden);
		const io = new IntersectionObserver(([entry]) => {
			onScreen = entry.isIntersecting;
			sync();
		}, { rootMargin: "10% 0px" });
		io.observe(host);
		document.addEventListener("visibilitychange", sync);
		return () => {
			io.disconnect();
			document.removeEventListener("visibilitychange", sync);
		};
	}, []);
	const fallback = useMotionValue(0);
	const scroll = progress ?? fallback;
	const scrollRoll = useTransform(scroll, [0, 1], [0, 18]);
	const scrollY = useTransform(scroll, [0, 1], [0, -90]);
	const scrollZ = useTransform(scroll, [0, 1], [0, -260]);
	const scrollFade = useTransform(scroll, [0, .75], [1, 0]);
	const animated = !reduce;
	const ambient = animated && rich;
	const live = (name) => ambient ? name : "";
	const play = { animationPlayState: running ? "running" : "paused" };
	return /* @__PURE__ */ jsx("div", {
		ref: hostRef,
		className: "design-canvas pointer-events-none absolute right-[4%] top-[26%] hidden h-[min(32vw,430px)] w-[min(32vw,430px)] lg:block",
		style: {
			perspective: "900px",
			containerType: "size"
		},
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "relative h-full w-full",
			style: {
				transformStyle: "preserve-3d",
				rotateX: ambient ? tiltX : 0,
				rotateY: ambient ? tiltY : 0,
				rotateZ: animated ? scrollRoll : 0,
				y: animated ? scrollY : 0,
				z: animated ? scrollZ : 0,
				opacity: animated ? scrollFade : 1
			},
			children: /* @__PURE__ */ jsxs(motion.div, {
				className: "absolute inset-0",
				style: {
					transformStyle: "preserve-3d",
					rotateX: 8,
					rotateY: -14
				},
				initial: animated ? {
					opacity: 0,
					y: 24
				} : false,
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .9,
					delay: .35,
					ease: [...EASE]
				},
				children: [
					/* @__PURE__ */ jsxs(Layer, {
						depth: -40,
						className: "design-canvas__panel left-[2cqw] top-[6cqw] w-[66cqw] p-[3cqw]",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "mb-[3cqw] flex gap-[1.2cqw]",
								children: SWATCHES.map((color) => /* @__PURE__ */ jsx("span", {
									className: "h-[1.6cqw] w-[1.6cqw] rounded-full",
									style: { background: `${color}aa` }
								}, color))
							}),
							/* @__PURE__ */ jsx("div", {
								className: `design-canvas__build h-[15cqw] rounded-[1.4cqw] ${live("design-canvas__build--run")}`.trimEnd(),
								style: {
									...play,
									background: `linear-gradient(120deg, ${COLORS.grape}55, ${COLORS.iris}44 55%, ${COLORS.frost}33)`
								}
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-[3cqw] space-y-[1.6cqw]",
								children: COPY_LINES.map((width, index) => /* @__PURE__ */ jsx("div", {
									className: `design-canvas__build design-canvas__line h-[1.5cqw] rounded-full ${live("design-canvas__build--run")}`.trimEnd(),
									style: {
										...play,
										width: `${width * 100}%`,
										animationDelay: `${.25 + index * .2}s`
									}
								}, width))
							}),
							/* @__PURE__ */ jsx("div", {
								className: `design-canvas__build mt-[3.2cqw] h-[4.4cqw] w-[20cqw] rounded-full ${live("design-canvas__build--run")}`.trimEnd(),
								style: {
									...play,
									background: COLORS.gradient,
									animationDelay: "0.9s"
								}
							})
						]
					}),
					/* @__PURE__ */ jsxs(Layer, {
						depth: 40,
						className: "left-[42cqw] top-[40cqw] w-[50cqw]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: `design-canvas__select absolute inset-[-1.6cqw] ${live("design-canvas__select--run")}`.trimEnd(),
							style: play,
							children: [[
								"left-0 top-0",
								"right-0 top-0",
								"bottom-0 left-0",
								"bottom-0 right-0"
							].map((corner) => /* @__PURE__ */ jsx("span", { className: `design-canvas__handle absolute ${corner}` }, corner)), /* @__PURE__ */ jsx("span", {
								className: "design-canvas__size absolute left-1/2 top-full mt-[1.4cqw] -translate-x-1/2",
								children: "480 × 300"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "design-canvas__panel p-[3.2cqw]",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-end justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-display text-[12cqw] font-bold leading-[0.9] text-[var(--ink-strong)]",
									children: "Aa"
								}), /* @__PURE__ */ jsxs("span", {
									className: "pb-[0.8cqw] text-right text-[2.2cqw] font-bold uppercase leading-[1.5] tracking-[0.16em] text-[var(--ink-faint)]",
									children: [
										"Display",
										/* @__PURE__ */ jsx("br", {}),
										"Bold"
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-[3cqw] flex gap-[1.8cqw]",
								children: SWATCHES.map((color, index) => /* @__PURE__ */ jsx("span", {
									className: `design-canvas__swatch h-[7cqw] flex-1 rounded-[1.2cqw] ${live("design-canvas__swatch--run")}`.trimEnd(),
									style: {
										...play,
										background: color,
										boxShadow: `0 0 3cqw ${color}66`,
										animationDelay: `${index * .22}s`
									}
								}, color))
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Layer, {
						depth: 70,
						className: "inset-0",
						children: /* @__PURE__ */ jsxs("svg", {
							viewBox: "0 0 100 100",
							className: "h-full w-full overflow-visible",
							children: [
								/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
									id: "design-canvas-pen",
									x1: "0",
									x2: "1",
									y1: "0",
									y2: "0",
									children: [
										/* @__PURE__ */ jsx("stop", {
											offset: "0",
											stopColor: COLORS.grape
										}),
										/* @__PURE__ */ jsx("stop", {
											offset: "0.5",
											stopColor: COLORS.iris
										}),
										/* @__PURE__ */ jsx("stop", {
											offset: "1",
											stopColor: COLORS.frost
										})
									]
								}) }),
								/* @__PURE__ */ jsx("path", {
									d: "M70 34 C70 20 80 30 87 21 S94 6 97 8",
									pathLength: "1",
									fill: "none",
									stroke: "url(#design-canvas-pen)",
									strokeWidth: "0.7",
									strokeLinecap: "round",
									className: `design-canvas__pen ${live("design-canvas__pen--run")}`.trimEnd(),
									style: play
								}),
								/* @__PURE__ */ jsx("line", {
									x1: "80",
									y1: "30",
									x2: "94",
									y2: "12",
									className: "design-canvas__guide"
								}),
								[[80, 30], [94, 12]].map(([cx, cy]) => /* @__PURE__ */ jsx("circle", {
									cx,
									cy,
									r: "0.9",
									className: "design-canvas__knob"
								}, cx)),
								[
									[70, 34],
									[87, 21],
									[97, 8]
								].map(([x, y]) => /* @__PURE__ */ jsx("rect", {
									x: x - 1.3,
									y: y - 1.3,
									width: "2.6",
									height: "2.6",
									className: "design-canvas__anchor"
								}, x))
							]
						})
					}),
					/* @__PURE__ */ jsx(Layer, {
						depth: 100,
						className: "left-0 top-0",
						children: /* @__PURE__ */ jsxs("div", {
							className: `design-canvas__cursor ${live("design-canvas__cursor--run")}`.trimEnd(),
							style: play,
							children: [/* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 24 24",
								className: "h-[5cqw] w-[5cqw]",
								children: /* @__PURE__ */ jsx("path", {
									d: "M3 2l7.5 19 2.6-7.9L21 10.5z",
									fill: COLORS.grape,
									stroke: "#fff",
									strokeWidth: "1.4",
									strokeLinejoin: "round"
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "ml-[3.6cqw] mt-[-0.6cqw] block w-max rounded-full px-[1.8cqw] py-[0.6cqw] text-[2.2cqw] font-bold uppercase tracking-[0.12em] text-white",
								style: { background: COLORS.grape },
								children: "UI / UX"
							})]
						})
					})
				]
			})
		})
	});
}
//#endregion
//#region resources/js/components/sections/Hero.jsx
/**
* The bar cluster is the logo's own mark, so its geometry is taken straight
* from the artwork rather than chosen by eye. Measured off
* `marketorr-logo-on-light.png` (1000x118): the three bars are 38 / 75 / 112
* tall, 35 wide, set 19 apart — every one of those expressed below as a
* fraction of the tallest bar, which is the single number `--bar-h`.
*
* Sizing it this way keeps the hero mark in the logo's proportions at any
* viewport: change `BAR_HEIGHT` and the widths, gaps and corner radius follow.
*/
var BAR_STEPS = MARK.heights;
var BAR_WIDTH = MARK.width;
var BAR_GAP = MARK.gap;
/**
* Height of the tallest bar. A background brand mark, not a centrepiece: about
* a third of what it was, and it now stays clear of the headline block on
* every width instead of filling the lower hero.
*/
var BAR_HEIGHT = "clamp(4.5rem, 10vw, 8.25rem)";
function BarColumn({ bar, glow }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-2 sm:gap-2.5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "enter enter--grow-y",
			style: {
				"--enter-dur": "0.52s",
				"--enter-delay": `${bar.delay}s`,
				transformOrigin: "50% 100%",
				height: `calc(var(--bar-h) * ${bar.height})`,
				width: `calc(var(--bar-h) * ${BAR_WIDTH})`,
				borderRadius: `calc(var(--bar-h) * ${BAR_WIDTH}) 0 0 0`,
				background: `linear-gradient(180deg, ${bar.color}, ${bar.color}55)`,
				boxShadow: `${glow(bar.color, 42)}, ${glow(bar.color, 90)}`.replace(/, $/, ""),
				border: `1px solid ${bar.color}66`
			}
		}), /* @__PURE__ */ jsx("span", {
			style: {
				"--enter-dur": "0.2s",
				"--enter-delay": `${bar.delay + .28}s`,
				"--enter-y": "6px",
				"--enter-to": .75,
				"--enter-ease": "ease-out"
			},
			className: "enter enter--fade-up font-display text-[7px] font-bold tracking-[0.14em] text-[var(--ink-faint)] sm:text-[8px] sm:tracking-[0.18em]",
			children: bar.label
		})]
	});
}
function Bars({ glow, progress, rich, reduce }) {
	const bars = [
		{
			color: MARK.colors[0],
			height: BAR_STEPS[0],
			label: "IDEA",
			delay: .82
		},
		{
			color: MARK.colors[1],
			height: BAR_STEPS[1],
			label: "EXPERIENCE",
			delay: .9
		},
		{
			color: MARK.colors[2],
			height: BAR_STEPS[2],
			label: "RESULT",
			delay: .98
		}
	];
	const ref = useRef(null);
	const centreShift = useMotionValue(0);
	const width = useMotionValue(0);
	useEffect(() => {
		const element = ref.current;
		const row = element?.parentElement;
		if (!element || !row) return void 0;
		const measure = () => {
			const style = window.getComputedStyle(row);
			const rowWidth = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
			centreShift.set(Math.max(0, (rowWidth - element.offsetWidth) / 2));
			width.set(element.offsetWidth);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(row);
		return () => observer.disconnect();
	}, [centreShift, width]);
	const scale = useTransform(progress, [
		0,
		.32,
		.4
	], rich ? [
		2,
		1.04,
		1
	] : [
		1.5,
		1.02,
		1
	]);
	const x = useTransform(() => {
		const [start, near] = rich ? [.38, .02] : [.18, .01];
		const w = width.get();
		return transform(progress.get(), [
			0,
			.32,
			.4
		], [
			centreShift.get() + w * start,
			w * near,
			0
		]);
	});
	const y = useTransform(progress, [
		0,
		.32,
		.4
	], rich ? [
		"-18%",
		"-1%",
		"0%"
	] : [
		"-10%",
		"-1%",
		"0%"
	]);
	const opacity = useTransform(progress, [
		0,
		.28,
		.4
	], rich ? [
		.22,
		.85,
		1
	] : [
		.25,
		.9,
		1
	]);
	return /* @__PURE__ */ jsx(motion.div, {
		ref,
		style: {
			...reduce ? {} : {
				scale,
				x,
				y,
				opacity
			},
			"--bar-h": BAR_HEIGHT
		},
		className: "relative origin-bottom",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx("div", {
			className: "relative flex items-end",
			style: { gap: `calc(var(--bar-h) * ${BAR_GAP})` },
			children: bars.map((bar) => /* @__PURE__ */ jsx(BarColumn, {
				bar,
				glow
			}, bar.label))
		})
	});
}
/**
* @param {{ content?: { eyebrow?: string, headingLines?: string[], subtext?: string } }} props
*   Content from the page's Hero section. Falls back to the site-wide hero in
*   Settings, so the component still renders on a page with no Hero widget.
*/
function Hero({ content }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const fx = useThemeMotion();
	const [desktopMotion, setDesktopMotion] = useState(false);
	const [richMotion, setRichMotion] = useState(false);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"]
	});
	const contentY = useTransform(scrollYProgress, [0, 1], [0, -72]);
	const contentOpacity = useTransform(scrollYProgress, [0, .85], [1, .84]);
	const contentScale = useTransform(scrollYProgress, [0, 1], [1, .97]);
	const barsDim = useTransform(scrollYProgress, [.05, .4], [1, .35]);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const update = () => setDesktopMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 768px)");
		const update = () => setRichMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	const { settings } = usePage().props;
	const hero = {
		...settings.hero,
		...content?.eyebrow ? { eyebrow: content.eyebrow } : {},
		...content?.headingLines?.length ? { headingLines: content.headingLines } : {},
		...content?.subtext ? { subtext: content.subtext } : {}
	};
	const headingLines = hero.headingLines.map((line, index) => [line, index === hero.headingLines.length - 1 ? "text-gradient" : ""]);
	const exitMotion = desktopMotion && !reduce ? {
		y: contentY,
		opacity: contentOpacity,
		scale: contentScale
	} : void 0;
	return /* @__PURE__ */ jsxs("section", {
		ref,
		id: "home",
		className: "noise relative flex min-h-0 flex-col overflow-hidden bg-[var(--bg)] sm:min-h-svh",
		children: [
			/* @__PURE__ */ jsxs("div", {
				style: { "--enter-dur": "0.32s" },
				className: "enter enter--settle pointer-events-none absolute inset-0",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ jsx(Stage, { variant: "hero" }),
					/* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0" }),
					/* @__PURE__ */ jsx(DesignCanvas, { progress: scrollYProgress })
				]
			}),
			/* @__PURE__ */ jsxs(motion.div, {
				style: exitMotion,
				className: "container-x relative z-10 flex flex-none flex-col justify-start pb-4 pt-24 sm:flex-1 sm:justify-center sm:pt-32",
				children: [
					/* @__PURE__ */ jsx("p", {
						style: {
							"--enter-dur": "0.3s",
							"--enter-delay": "0.12s",
							"--enter-y": "14px"
						},
						className: "enter enter--fade-up mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] sm:mb-6 sm:text-[12px] sm:tracking-[0.28em]",
						children: hero.eyebrow
					}),
					/* @__PURE__ */ jsx(ScrollHeading, {
						intensity: .55,
						children: /* @__PURE__ */ jsx("h1", {
							className: "display-xl uppercase text-[var(--ink-strong)]",
							children: headingLines.map(([line, className], index) => /* @__PURE__ */ jsx("span", {
								className: "mask-line",
								children: /* @__PURE__ */ jsx("span", {
									className: `mask-inner enter enter--mask-up ${className}`,
									style: {
										"--enter-dur": "0.52s",
										"--enter-delay": `${.2 + index * .08}s`
									},
									children: line
								})
							}, line))
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "enter enter--scale-x mt-6 h-[3px] w-full max-w-xl origin-left sm:mt-8",
						style: {
							"--enter-dur": "0.42s",
							"--enter-delay": "0.48s",
							background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)"
						},
						"aria-hidden": true
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 flex flex-col gap-7 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10",
						children: [/* @__PURE__ */ jsx("p", {
							style: {
								"--enter-dur": "0.38s",
								"--enter-delay": "0.6s"
							},
							className: "enter enter--fade-up max-w-md text-[15px] leading-relaxed text-[var(--mute)] sm:text-[16px]",
							children: hero.subtext
						}), /* @__PURE__ */ jsxs("div", {
							style: {
								"--enter-dur": "0.38s",
								"--enter-delay": "0.7s"
							},
							className: "enter enter--fade-up flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4",
							children: [/* @__PURE__ */ jsx(MagneticButton, {
								className: "w-full sm:w-auto",
								children: /* @__PURE__ */ jsxs(Link, {
									href: "/work",
									"data-cursor": "cta",
									className: "btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-white sm:w-auto",
									style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
									children: ["View our work ", /* @__PURE__ */ jsx("span", {
										"data-arrow": true,
										"aria-hidden": true,
										children: "↗"
									})]
								})
							}), /* @__PURE__ */ jsx(MagneticButton, {
								className: "w-full sm:w-auto",
								children: /* @__PURE__ */ jsxs(Link, {
									href: "/contact",
									"data-cursor": "cta",
									className: "btn-press group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--field-line)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)] hover:border-transparent hover:bg-[var(--invert-btn-hover)] hover:text-[var(--bg)] sm:w-auto",
									children: ["Start a project ", /* @__PURE__ */ jsx("span", {
										"data-arrow": "horizontal",
										"aria-hidden": true,
										children: "→"
									})]
								})
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs(motion.div, {
				style: reduce ? void 0 : { opacity: barsDim },
				className: "container-x relative z-0 mt-24 flex items-end justify-start pb-8 sm:mt-10 sm:pb-10",
				children: [/* @__PURE__ */ jsx(Bars, {
					glow: fx.barGlow,
					progress: scrollYProgress,
					rich: richMotion,
					reduce
				}), /* @__PURE__ */ jsx("div", {
					className: "hidden flex-1 justify-end md:flex",
					children: /* @__PURE__ */ jsxs(Link, {
						href: "/about",
						className: "btn-press flex flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: ["Scroll to explore", /* @__PURE__ */ jsx("span", {
							className: "block h-10 w-[1px] bg-gradient-to-b from-[#891FFB] via-[#507AF4] to-[#1BE2EB]",
							"aria-hidden": true
						})]
					})
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/components/sections/Marquee.jsx
/**
* Looping strip of short words. The three brand colours cycle across the
* items, so any number of words stays on-palette.
*
* @param {{ content?: { items?: string[] } }} props
*/
function Marquee({ content }) {
	const words = content?.items?.length ? content.items : [
		"IDEA",
		"EXPERIENCE",
		"RESULT"
	];
	const items = Array.from({ length: 8 }).flatMap(() => words);
	return /* @__PURE__ */ jsx("div", {
		className: "relative overflow-hidden border-y border-[var(--line)] bg-[var(--surface)] py-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx("div", {
			className: "flex w-max animate-marquee gap-8 whitespace-nowrap",
			children: [0, 1].map((half) => /* @__PURE__ */ jsx("div", {
				className: "flex gap-8",
				children: items.map((word, index) => /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-8 font-display text-[13px] font-bold uppercase tracking-[0.24em] text-[var(--ink-faint)]",
					children: [word, /* @__PURE__ */ jsx("span", {
						className: "h-2 w-2 rounded-full",
						style: { background: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] }
					})]
				}, `${half}-${index}`))
			}, half))
		})
	});
}
//#endregion
//#region resources/js/components/sections/ProgressionBands.jsx
/**
* Full-width scroll-driven typography band under Our Work: what Marketorr
* designs, and who for.
*
* Two oversized rows set in the site's heavy display face - disciplines in
* solid ink, industries as a dim ghost of them - each with its own small caption, framed
* by hairlines and fading out at both edges. A small four-point star in
* the brand gradient separates the words. The rows drift slowly in opposite directions at a steady pace;
* scrolling the page does not move, speed up or reveal them. One word per
* row carries the brand gradient.
*
* Performance contract: a single requestAnimationFrame loop per mount,
* transform writes only, cached row widths (remeasured on resize and font
* load), IntersectionObserver gating so the loop idles off-screen, and full
* cleanup on unmount. Reduced-motion users get the same rows rendered
* statically.
*/
var ROWS = [{
	caption: "Disciplines",
	items: [
		"Branding",
		"UI/UX",
		"Web Design",
		"Mobile Apps",
		"SaaS Product",
		"Packaging",
		"Motion",
		"Design Systems"
	],
	highlight: "UI/UX",
	ghost: false
}, {
	caption: "Industries",
	items: [
		"E-Commerce",
		"Fintech",
		"Healthcare",
		"Real Estate",
		"Fashion",
		"Hospitality",
		"Startups",
		"Enterprise"
	],
	highlight: "Startups",
	ghost: true
}];
/** Steady drift speed, in px per second. */
var DRIFT_SPEED = 27;
/** The separator between words: a four-point star in the brand gradient. */
function Spark() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		className: "mx-[0.5em] h-[0.34em] w-[0.34em] shrink-0",
		"aria-hidden": true,
		children: [/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
			id: "progression-spark",
			x1: "0",
			y1: "0",
			x2: "1",
			y2: "1",
			children: [
				/* @__PURE__ */ jsx("stop", {
					offset: "0",
					stopColor: "#830DFD"
				}),
				/* @__PURE__ */ jsx("stop", {
					offset: "0.5",
					stopColor: "#4A76F8"
				}),
				/* @__PURE__ */ jsx("stop", {
					offset: "1",
					stopColor: "#10E2F1"
				})
			]
		}) }), /* @__PURE__ */ jsx("path", {
			d: "M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z",
			fill: "url(#progression-spark)"
		})]
	});
}
function RowContent({ items, highlight }) {
	return /* @__PURE__ */ jsx(Fragment$1, { children: items.map((word, i) => /* @__PURE__ */ jsxs("span", {
		className: "flex shrink-0 items-center",
		children: [/* @__PURE__ */ jsx("span", {
			className: word === highlight ? "progression-highlight inline-block" : void 0,
			children: word
		}), /* @__PURE__ */ jsx(Spark, {})]
	}, i)) });
}
function ProgressionBands() {
	const bandRef = useRef(null);
	const rowRefs = useRef([]);
	const reduceRef = useRef(false);
	useEffect(() => {
		reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const band = bandRef.current;
		if (!band || reduceRef.current) return void 0;
		const rows = rowRefs.current.filter(Boolean);
		if (rows.length === 0) return void 0;
		const count = rows.length;
		const positions = new Array(count).fill(0);
		const halves = new Array(count).fill(0);
		const directions = rows.map((_, i) => i % 2 === 0 ? -1 : 1);
		const measure = () => {
			rows.forEach((row, i) => {
				halves[i] = row.scrollWidth / 2 || 1;
			});
		};
		measure();
		if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
		let rafId = 0;
		let running = false;
		let lastTime = 0;
		const frame = (time) => {
			if (!running) return;
			const seconds = lastTime ? Math.min(.1, (time - lastTime) / 1e3) : 0;
			lastTime = time;
			for (let i = 0; i < count; i += 1) {
				positions[i] += directions[i] * DRIFT_SPEED * seconds;
				const half = halves[i] || 1;
				const wrapped = -((positions[i] % half + half) % half);
				const el = rows[i];
				if (el) el.style.transform = `translate3d(${wrapped.toFixed(2)}px,0,0)`;
			}
			rafId = requestAnimationFrame(frame);
		};
		const start = () => {
			if (running) return;
			running = true;
			lastTime = 0;
			rafId = requestAnimationFrame(frame);
		};
		const stop = () => {
			running = false;
			if (rafId) cancelAnimationFrame(rafId);
			rafId = 0;
		};
		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) start();
			else stop();
		}, { rootMargin: "20% 0px" });
		observer.observe(band);
		window.addEventListener("resize", measure);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
			stop();
		};
	}, []);
	return /* @__PURE__ */ jsx("section", {
		"aria-label": "What Marketorr designs, and who for",
		className: "relative overflow-hidden pb-12 pt-6 md:pb-16 md:pt-8",
		children: /* @__PURE__ */ jsx("div", {
			ref: bandRef,
			className: "border-y border-[var(--line)]",
			"aria-hidden": true,
			children: ROWS.map((row, i) => /* @__PURE__ */ jsxs("div", {
				className: i > 0 ? "border-t border-[var(--line)]" : void 0,
				children: [/* @__PURE__ */ jsx("p", {
					className: "container-x pt-5 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] md:pt-6",
					children: row.caption
				}), /* @__PURE__ */ jsx("div", {
					className: "progression-row overflow-hidden py-3 md:py-5",
					children: /* @__PURE__ */ jsxs("div", {
						ref: (node) => {
							rowRefs.current[i] = node;
						},
						className: `flex w-max whitespace-nowrap font-display text-[clamp(2.4rem,7vw,6.25rem)] font-extrabold uppercase leading-[1] tracking-[-0.035em] will-change-transform ${row.ghost ? "progression-ghost" : "text-[var(--ink-strong)]"}`,
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex shrink-0 items-center",
							children: /* @__PURE__ */ jsx(RowContent, {
								items: row.items,
								highlight: row.highlight
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "flex shrink-0 items-center",
							children: /* @__PURE__ */ jsx(RowContent, {
								items: row.items,
								highlight: row.highlight
							})
						})]
					})
				})]
			}, row.caption))
		})
	});
}
//#endregion
//#region resources/js/components/sections/OurWork.jsx
/** Every project card shares this ratio, so the strip is one set of equal objects. */
var CARD_RATIO = 16 / 10;
/** Parallax + cover-reveal are desktop/tablet only; phones keep a plain fade. */
function useRichMotion() {
	const [rich, setRich] = useState(false);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 768px)");
		const update = () => setRich(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return rich;
}
/** Sticky scroll runways are desktop mouse/trackpad interactions only. */
function useDesktopScrollStage() {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const update = () => setEnabled(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return enabled;
}
/**
* Real project cover: masked reveal on entry, slow scroll parallax, fast hover.
*
* @param {{ p: import('../../lib/projects').Project, glow: (color: string, size: number) => string, rich: boolean, progress: import('framer-motion').MotionValue<number> }} props
*/
function ProjectCover({ p, glow, rich, progress }) {
	const reduce = useReducedMotion();
	const cardMedia = projectCardMedia(p, "(max-width: 768px) 78vw, 50vw");
	const parallax = rich && !reduce;
	const y = useTransform(progress, [0, 1], parallax ? ["-3%", "3%"] : ["0%", "0%"]);
	const branded = isCharukothon(p.slug);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative h-full w-full overflow-hidden bg-[#111116]",
		style: { containerType: "inline-size" },
		children: [
			branded ? /* @__PURE__ */ jsx(motion.div, {
				className: "absolute inset-x-0 -top-[3%] h-[106%]",
				style: {
					y,
					willChange: parallax ? "transform" : void 0
				},
				initial: { scale: reduce ? 1 : 1.06 },
				whileInView: { scale: 1 },
				viewport: {
					once: true,
					margin: "-10% 0px"
				},
				transition: {
					duration: .9,
					ease: [...EASE]
				},
				children: /* @__PURE__ */ jsx(CharukothonCover, { image: p.thumb || p.image })
			}) : /* @__PURE__ */ jsx(motion.div, {
				className: "absolute inset-x-0 -top-[3%] h-[106%]",
				style: {
					y,
					willChange: parallax ? "transform" : void 0
				},
				initial: { scale: reduce ? 1 : 1.06 },
				whileInView: { scale: 1 },
				viewport: {
					once: true,
					margin: "-10% 0px"
				},
				transition: {
					duration: .9,
					ease: [...EASE]
				},
				children: /* @__PURE__ */ jsx("img", {
					src: cardMedia.src,
					srcSet: cardMedia.srcSet,
					sizes: cardMedia.sizes,
					alt: cardMedia.alt,
					loading: "lazy",
					decoding: "async",
					className: `h-full w-full transition-transform duration-200 ease-out group-hover:scale-[1.035] ${cardMedia.fit === "contain" ? "object-contain" : "object-cover"}`
				})
			}),
			!branded && /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-200 group-hover:opacity-70",
				style: { background: `radial-gradient(120% 100% at 20% 10%, ${p.accent}1f, transparent 58%), linear-gradient(180deg, transparent 0%, transparent 50%, rgba(8,8,10,0.34) 76%, rgba(8,8,10,0.72) 100%)` },
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx(ProjectMotion, { slug: p.slug }),
			!reduce && /* @__PURE__ */ jsx(motion.span, {
				className: "absolute inset-0 origin-bottom bg-[var(--bg-soft)]",
				initial: { scaleY: 1 },
				whileInView: { scaleY: 0 },
				viewport: {
					once: true,
					margin: "-10% 0px"
				},
				transition: {
					duration: .6,
					ease: [...EASE]
				},
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black transition-transform duration-200 group-hover:scale-105 md:bottom-6 md:right-6 md:h-14 md:w-14",
				"aria-hidden": true,
				children: /* @__PURE__ */ jsx("span", {
					"data-arrow": true,
					children: "↗"
				})
			}),
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-200 group-hover:border-white/20",
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100",
				style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
				"aria-hidden": true
			})
		]
	});
}
/**
* One carousel slide. Every card now shares the same ratio and the same row
* height (`--mq-h`), so the strip reads as one set of equal objects — the
* per-card ratios and the vertical drift that used to stagger them are gone,
* since both are exactly what made the row look misaligned.
*
* The card keeps its pointer tilt: the carousel slot around it owns the
* travel, depth and focus, this owns the hover response.
*
* @param {{ p: import('../../lib/projects').Project, glow?: (color: string, size: number) => string, className?: string, ratio?: number }} props
*/
function Card({ p, glow, className = "", ratio = CARD_RATIO, focus }) {
	const ref = useRef(null);
	const rich = useRichMotion();
	const reduce = useReducedMotion();
	const tapIntent = useTapIntent();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});
	const tiltable = rich && !reduce;
	const pointerX = useMotionValue(0);
	const pointerY = useMotionValue(0);
	const tiltY = useSpring(pointerX, {
		stiffness: 150,
		damping: 20,
		mass: .4
	});
	const tiltX = useSpring(pointerY, {
		stiffness: 150,
		damping: 20,
		mass: .4
	});
	const applyTilt = useCallback((fx, fy) => {
		pointerX.set((fx - .5) * 11);
		pointerY.set((fy - .5) * -8);
	}, [pointerX, pointerY]);
	const pointer = useBoxPointer(applyTilt, { enabled: tiltable });
	const onPointerLeave = (event) => {
		pointer.onPointerLeave(event);
		pointerX.set(0);
		pointerY.set(0);
	};
	const meta = {
		hidden: {},
		show: { transition: {
			staggerChildren: .06,
			delayChildren: .12
		} }
	};
	const metaItem = {
		hidden: reduce ? { opacity: 0 } : {
			opacity: 0,
			y: 14
		},
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: .45,
				ease: [...EASE]
			}
		}
	};
	return /* @__PURE__ */ jsx(motion.div, {
		ref,
		whileTap: { scale: .985 },
		transition: { duration: .18 },
		onPointerEnter: pointer.onPointerEnter,
		onPointerMove: pointer.onPointerMove,
		onPointerLeave,
		className: `w-full ${className}`.trimEnd(),
		style: {
			rotateX: tiltable ? tiltX : 0,
			rotateY: tiltable ? tiltY : 0,
			transformPerspective: 1100
		},
		children: /* @__PURE__ */ jsxs(Link, {
			href: `/work/${p.slug}`,
			"data-cursor": "view",
			...tapIntent,
			className: "group block",
			"aria-label": `View ${p.title} case study`,
			children: [/* @__PURE__ */ jsx("div", {
				className: "w-full overflow-hidden rounded-2xl border border-[var(--line)]",
				style: {
					height: "var(--mq-h)",
					aspectRatio: ratio
				},
				children: /* @__PURE__ */ jsx(ProjectCover, {
					p,
					glow,
					rich,
					progress: scrollYProgress
				})
			}), /* @__PURE__ */ jsx(motion.div, {
				style: focus ? { opacity: focus } : void 0,
				children: /* @__PURE__ */ jsx(motion.div, {
					variants: meta,
					initial: "hidden",
					whileInView: "show",
					viewport: {
						once: true,
						margin: "-12% 0px"
					},
					className: "mt-5 flex flex-wrap items-start justify-between gap-4",
					children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(motion.h3, {
						variants: metaItem,
						className: "font-display text-2xl font-extrabold uppercase text-[var(--ink-strong)] md:text-3xl",
						children: /* @__PURE__ */ jsx(GradientTitle, { text: p.title })
					}), /* @__PURE__ */ jsx(motion.div, {
						variants: metaItem,
						className: "mt-3 flex flex-wrap gap-2",
						children: p.tags.map((t) => /* @__PURE__ */ jsx(Tag, {
							accent: p.accent,
							children: t
						}, t))
					})] })
				})
			})]
		})
	});
}
/** Compact two-column card used only below the tablet breakpoint. */
function MobileCard({ p, focus }) {
	const reduce = useReducedMotion();
	const tapIntent = useTapIntent();
	const cardMedia = projectCardMedia(p, "78vw");
	return /* @__PURE__ */ jsx(motion.article, {
		initial: {
			opacity: 0,
			y: reduce ? 0 : 18
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		whileTap: { scale: .985 },
		viewport: {
			once: true,
			margin: "-8% 0px"
		},
		transition: {
			duration: reduce ? 0 : .35,
			ease: [...EASE]
		},
		className: "w-full",
		children: /* @__PURE__ */ jsxs(Link, {
			href: `/work/${p.slug}`,
			"data-cursor": "view",
			...tapIntent,
			className: "group block h-full min-w-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2",
			"aria-label": `View ${p.title} case study`,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative aspect-[4/3] overflow-hidden rounded-lg bg-[#111116]",
				style: { containerType: "inline-size" },
				children: [
					isCharukothon(p.slug) ? /* @__PURE__ */ jsx(CharukothonCover, { image: p.thumb || p.image }) : /* @__PURE__ */ jsx("img", {
						src: cardMedia.src,
						srcSet: cardMedia.srcSet,
						sizes: cardMedia.sizes,
						alt: cardMedia.alt,
						loading: "lazy",
						decoding: "async",
						className: `absolute inset-0 h-full w-full transition-transform duration-200 ease-out group-hover:scale-[1.035] ${cardMedia.fit === "contain" ? "object-contain" : "object-cover"}`
					}),
					/* @__PURE__ */ jsx("div", {
						className: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.30)_0%,transparent_24%,transparent_54%,rgba(8,8,10,0.28)_78%,rgba(8,8,10,0.58)_100%)] transition-opacity duration-200 group-hover:opacity-75",
						"aria-hidden": true
					}),
					/* @__PURE__ */ jsx(ProjectMotion, { slug: p.slug }),
					/* @__PURE__ */ jsx("div", {
						className: "absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-black transition-transform duration-200 group-hover:scale-105",
						"aria-hidden": true,
						children: /* @__PURE__ */ jsx("span", {
							"data-arrow": true,
							children: "↗"
						})
					})
				]
			}), /* @__PURE__ */ jsxs(motion.div, {
				className: "min-w-0 px-0.5 pb-0.5 pt-2",
				style: focus ? { opacity: focus } : void 0,
				children: [/* @__PURE__ */ jsx("h3", {
					className: "min-h-[2.25rem] overflow-hidden font-display text-[13px] font-extrabold uppercase leading-[1.05] text-[var(--ink-strong)]",
					children: /* @__PURE__ */ jsx(GradientTitle, { text: p.title })
				}), p.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex min-w-0 items-center gap-1",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--chip)] px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]",
						children: [/* @__PURE__ */ jsx("span", {
							className: "h-1 w-1 shrink-0 rounded-full",
							style: { background: p.accent },
							"aria-hidden": true
						}), /* @__PURE__ */ jsx("span", {
							className: "truncate",
							children: p.tags[0]
						})]
					}), p.tags.length > 1 && /* @__PURE__ */ jsxs("span", {
						className: "shrink-0 text-[7px] font-bold text-[var(--ink-faint)]",
						children: ["+", p.tags.length - 1]
					})]
				})]
			})]
		})
	});
}
/** Image-free final slide linking the showcase to the full branding portfolio. */
function SeeAllWorkCard({ focus }) {
	const tapIntent = useTapIntent();
	return /* @__PURE__ */ jsx(motion.div, {
		className: "w-full",
		style: focus ? { opacity: focus } : void 0,
		children: /* @__PURE__ */ jsxs(Link, {
			href: "/work/portfolio/branding",
			prefetch: true,
			"data-cursor": "view",
			"data-see-all-work": true,
			...tapIntent,
			className: "group relative flex h-[var(--mq-h)] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-[transform,border-color] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-[#507AF4]/50 focus-visible:-translate-y-1 sm:p-8",
			"aria-label": "See all branding work",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "absolute inset-x-0 top-0 h-[2px] origin-left scale-x-[0.18] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100",
					style: { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" },
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)] sm:text-[11px]",
						children: "Branding portfolio"
					}), /* @__PURE__ */ jsxs("span", {
						className: "flex gap-1.5",
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#891FFB]" }),
							/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#507AF4]" }),
							/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#1BE2EB]" })
						]
					})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "max-w-[15rem] text-[10px] leading-relaxed text-[var(--mute)] sm:text-[13px]",
					children: "Explore the complete collection of identities, logos and packaging."
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "flex items-end justify-between gap-5",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-2 font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-strong)] sm:text-[13px]",
						children: ["See all branding", /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "transition-transform duration-300 group-hover:translate-x-1",
							children: "→"
						})]
					}), /* @__PURE__ */ jsx("span", {
						className: "see-all-work__arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-base text-[var(--ink)] transition-[opacity,transform,background-color,color,border-color] duration-300 group-hover:border-transparent group-hover:bg-[#507AF4] group-hover:text-white group-focus-visible:border-transparent group-focus-visible:bg-[#507AF4] group-focus-visible:text-white sm:h-12 sm:w-12 sm:text-lg",
						"aria-hidden": true,
						children: "↗"
					})]
				})
			]
		})
	});
}
/**
* How far a slide is allowed to recede before the effect stops deepening —
* past this many places from the focus it is already fully back and dim.
*/
var DEPTH_SPAN = 3;
/**
* Per-place cues. Phones get the flattened set: wider travel so slides clear
* each other without depth, and no rotation or Z at all — on a phone those buy
* a 3D rendering path and a repaint, not a sense of space.
*/
var CAROUSEL = {
	rich: {
		travel: 66,
		depth: 190,
		turn: 21,
		shrink: .085,
		fade: .3
	},
	light: {
		travel: 84,
		depth: 0,
		turn: 0,
		shrink: .06,
		fade: .26
	}
};
/** Seconds of projected travel granted to a flick after release. */
var INERTIA_SECONDS = .19;
/** A flick can carry at most this many places, so it never rockets past. */
var INERTIA_MAX = 2;
/** Pointer travel (px) after which a gesture counts as a drag, not a tap. */
var DRAG_SLOP = 6;
/**
* @param {number} value
* @param {number} min
* @param {number} max
* @return {number}
*/
function clamp(value, min, max) {
	return value < min ? min : value > max ? max : value;
}
/**
* One slide in the 3D stack. Its whole appearance is a function of how many
* places it sits from the focus, so nothing here has to know about drags,
* wheels or springs.
*
* Each slide carries its own perspective rather than inheriting one from a
* shared stage: the viewport has to clip, and an ancestor that clips forces
* `transform-style` back to flat, which would throw the depth away.
*
* @param {{
*   children: import('react').ReactNode,
*   index: number,
*   position: import('framer-motion').MotionValue<number>,
*   stage: { travel: number, depth: number, turn: number, shrink: number, fade: number },
*   flat: boolean,
* }} props
*/
function CarouselSlide({ render, index, position, stage, flat }) {
	const distance = useTransform(position, (value) => clamp(index - value, -3, DEPTH_SPAN));
	const x = useTransform(distance, (value) => `${value * stage.travel}%`);
	const z = useTransform(distance, (value) => -Math.abs(value) * stage.depth);
	const rotateY = useTransform(distance, (value) => -value * stage.turn);
	const scale = useTransform(distance, (value) => 1 - Math.abs(value) * stage.shrink);
	const opacity = useTransform(distance, (value) => Math.max(.08, 1 - Math.abs(value) * stage.fade));
	const zIndex = useTransform(distance, (value) => 100 - Math.round(Math.abs(value) * 10));
	const focus = useTransform(distance, (value) => clamp(1 - Math.abs(value) / .7, 0, 1));
	const pointerEvents = useTransform(distance, (value) => Math.abs(value) < .5 ? "auto" : "none");
	const depth = flat ? {} : {
		z,
		rotateY,
		transformPerspective: 1400
	};
	return /* @__PURE__ */ jsx(motion.li, {
		className: "work-carousel__slide",
		style: {
			x,
			scale,
			opacity,
			zIndex,
			pointerEvents,
			...depth
		},
		children: render(focus)
	});
}
/**
* User-driven 3D project carousel — nothing advances on its own.
*
* One motion value, `position`, is the carousel's whole state: the fractional
* place currently in focus. Every input writes to it and every slide reads
* from it, so the gestures compose instead of competing:
*
* - **Drag** (mouse or touch) moves it 1:1 with the gesture, then releases into
*   inertia: the flick's velocity is projected forward, capped, and snapped to
*   the nearest place, which the spring glides into.
* - **Wheel / trackpad** accumulates the dominant axis until it crosses a
*   slide, then steps. The event is never prevented, so vertical page scrolling
*   remains native while a wheel pass also moves the showcase.
* - **Moving the mouse** across the strip steers it: the outer thirds pull the
*   neighbouring project forward, while a dead zone in the middle leaves the
*   focused card still enough to click.
* - **Arrow keys** step it, which is what replaces the removed timer for
*   keyboard users.
*
* Travel is expressed as a percentage of a slide's own width, so the geometry
* needs no measurement and stays correct through every breakpoint; the one
* measured number is the slide's pixel width, used solely to convert pointer
* distance into places.
*
* Reduced motion gets a plain snap-scrolling row instead — no transforms, no
* gesture handling.
*
* @param {{ projects: Array<import('../../lib/projects').Project>, glow?: (color: string, size: number) => string }} props
*/
function WorkCarousel({ projects, glow, controlledPosition }) {
	const rich = useRichMotion();
	const reduce = useReducedMotion();
	const slideRef = useRef(null);
	const [active, setActive] = useState(0);
	const count = projects.length + 1;
	const last = Math.max(0, count - 1);
	const stage = rich ? CAROUSEL.rich : CAROUSEL.light;
	const settled = useMotionValue(0);
	const dragged = useMotionValue(0);
	const steered = useMotionValue(0);
	const steerSpring = useSpring(steered, {
		stiffness: 90,
		damping: 22,
		mass: .5
	});
	const target = useTransform([
		settled,
		dragged,
		steerSpring
	], ([base, drag, steer]) => clamp(base + drag + steer, 0, last));
	const position = useSpring(target, {
		stiffness: 260,
		damping: 34,
		mass: .5
	});
	useMotionValueEvent(position, "change", (value) => {
		const next = clamp(Math.round(value), 0, last);
		setActive((previous) => previous === next ? previous : next);
	});
	const pitch = useRef(1);
	useEffect(() => {
		const slide = slideRef.current;
		if (!slide || typeof ResizeObserver === "undefined") return void 0;
		const observer = new ResizeObserver(([entry]) => {
			pitch.current = Math.max(1, entry.contentRect.width * stage.travel / 100);
		});
		observer.observe(slide);
		return () => observer.disconnect();
	}, [stage.travel]);
	const gesture = useRef({
		id: null,
		startX: 0,
		lastX: 0,
		lastAt: 0,
		velocity: 0,
		moved: false
	});
	const dragging = useRef(false);
	/** Strip box, cached while the cursor is over it. */
	const hoverBox = useRef(null);
	useEffect(() => {
		if (!controlledPosition) return void 0;
		const sync = (value) => {
			if (dragging.current) return;
			settled.set(value);
		};
		sync(controlledPosition.get());
		return controlledPosition.on("change", sync);
	}, [controlledPosition, settled]);
	const stepTo = (place) => {
		settled.set(clamp(place, 0, last));
	};
	const onPointerDown = (event) => {
		if (reduce || count < 2) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;
		gesture.current = {
			id: event.pointerId,
			startX: event.clientX,
			lastX: event.clientX,
			lastAt: event.timeStamp,
			velocity: 0,
			moved: false
		};
		dragging.current = true;
		steered.set(0);
	};
	const onPointerMove = (event) => {
		if (reduce || count < 2) return;
		if (!dragging.current) {
			if (event.pointerType !== "mouse" || !rich) return;
			if (event.target.closest?.("[data-see-all-work]")) {
				steered.set(0);
				return;
			}
			if (!hoverBox.current) {
				const rect = event.currentTarget.getBoundingClientRect();
				if (!rect.width) return;
				hoverBox.current = rect;
			}
			const box = hoverBox.current;
			const fromCentre = (event.clientX - box.left) / box.width - .5;
			const past = Math.max(0, Math.abs(fromCentre) - .2) / .3;
			steered.set(Math.sign(fromCentre) * past * .75);
			return;
		}
		const state = gesture.current;
		if (state.id !== event.pointerId) return;
		state.velocity = (event.clientX - state.lastX) / Math.max(1, event.timeStamp - state.lastAt);
		state.lastX = event.clientX;
		state.lastAt = event.timeStamp;
		if (!state.moved && Math.abs(event.clientX - state.startX) > DRAG_SLOP) {
			state.moved = true;
			event.currentTarget.setPointerCapture?.(event.pointerId);
		}
		if (!state.moved) return;
		dragged.set(-(event.clientX - state.startX) / pitch.current);
	};
	const endDrag = (event) => {
		if (!dragging.current) return;
		const state = gesture.current;
		dragging.current = false;
		if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
		if (!state.moved) return;
		const thrown = -state.velocity * 1e3 * INERTIA_SECONDS / pitch.current;
		const landing = Math.round(settled.get() + dragged.get() + clamp(thrown, -2, INERTIA_MAX));
		dragged.set(0);
		stepTo(landing);
	};
	const onPointerLeave = () => {
		hoverBox.current = null;
		steered.set(0);
	};
	const onClickCapture = (event) => {
		if (!gesture.current.moved) return;
		event.preventDefault();
		event.stopPropagation();
		gesture.current.moved = false;
	};
	const onKeyDown = (event) => {
		if (count < 2) return;
		if (event.key === "ArrowRight") stepTo(settled.get() + 1);
		else if (event.key === "ArrowLeft") stepTo(settled.get() - 1);
		else return;
		event.preventDefault();
	};
	const card = (project, focus) => rich ? /* @__PURE__ */ jsx(Card, {
		p: project,
		glow,
		focus
	}) : /* @__PURE__ */ jsx(MobileCard, {
		p: project,
		focus
	});
	if (reduce) return /* @__PURE__ */ jsx("div", {
		className: "work-carousel work-carousel--plain",
		role: "group",
		"aria-label": "Featured projects",
		children: /* @__PURE__ */ jsxs("ul", {
			className: "work-carousel__track work-carousel__track--plain",
			children: [projects.map((project) => /* @__PURE__ */ jsx("li", {
				className: "work-carousel__slide",
				children: card(project)
			}, project.slug)), /* @__PURE__ */ jsx("li", {
				className: "work-carousel__slide",
				children: /* @__PURE__ */ jsx(SeeAllWorkCard, {})
			})]
		})
	});
	return /* @__PURE__ */ jsx("div", {
		className: "work-carousel",
		role: "group",
		"aria-roledescription": "carousel",
		"aria-label": "Featured projects",
		onPointerDown,
		onPointerMove,
		onPointerUp: endDrag,
		onPointerCancel: endDrag,
		onPointerEnter: () => {
			hoverBox.current = null;
		},
		onPointerLeave,
		onClickCapture,
		onKeyDown,
		children: /* @__PURE__ */ jsxs("ul", {
			className: "work-carousel__track",
			children: [projects.map((project, index) => /* @__PURE__ */ jsx(CarouselSlide, {
				index,
				position,
				stage,
				flat: !rich,
				render: (focus) => /* @__PURE__ */ jsx("div", {
					ref: index === 0 ? slideRef : void 0,
					"aria-current": index === active ? "true" : void 0,
					children: card(project, focus)
				})
			}, project.slug)), /* @__PURE__ */ jsx(CarouselSlide, {
				index: projects.length,
				position,
				stage,
				flat: !rich,
				render: (focus) => /* @__PURE__ */ jsx("div", {
					"aria-current": projects.length === active ? "true" : void 0,
					children: /* @__PURE__ */ jsx(SeeAllWorkCard, { focus })
				})
			})]
		})
	});
}
function OurWork({ content = {}, glow, projects = [] }) {
	const stageRef = useRef(null);
	const desktopStage = useDesktopScrollStage();
	const lastSlide = projects.length;
	const { scrollYProgress: stageProgress } = useScroll({
		target: stageRef,
		offset: ["start 72px", "end end"]
	});
	const controlledPosition = useTransform(stageProgress, [0, 1], [0, lastSlide], { clamp: true });
	return /* @__PURE__ */ jsxs("section", {
		id: "work",
		className: "relative overflow-x-clip bg-[var(--bg-soft)] section-pad",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "container-x relative",
				children: [content.heading && /* @__PURE__ */ jsx(SectionLabel, { name: content.heading.toUpperCase() }), /* @__PURE__ */ jsxs("div", {
					className: "mt-10 md:mt-0 lg:py-6",
					children: [/* @__PURE__ */ jsx(RevealText, {
						as: "h2",
						className: "display-lg uppercase text-[var(--ink-strong)]",
						lines: content.titleLines ?? [],
						highlightedLines: gradientLines(content.titleLines, content.titleHighlight)
					}), content.intro && /* @__PURE__ */ jsx("p", {
						className: "mt-4 max-w-lg text-[15px] text-[var(--mute)]",
						children: content.intro
					})]
				})]
			}),
			projects.length > 0 && /* @__PURE__ */ jsx("div", {
				ref: stageRef,
				className: "work-scroll-stage mt-10 md:mt-12",
				"data-pinned": desktopStage ? "true" : void 0,
				style: { "--work-stage-height": `calc(100svh + ${lastSlide * 52}svh)` },
				children: /* @__PURE__ */ jsx("div", {
					className: "work-scroll-stage__sticky",
					children: /* @__PURE__ */ jsx("div", {
						className: "work-marquee w-full",
						children: /* @__PURE__ */ jsx(WorkCarousel, {
							projects,
							glow,
							controlledPosition: desktopStage ? controlledPosition : void 0
						})
					})
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-6 md:mt-8",
				children: /* @__PURE__ */ jsx(ProgressionBands, {})
			})
		]
	});
}
//#endregion
//#region resources/js/components/sections/Process.jsx
/** Height of the pinned frame's mark (its tallest bar); it keeps the logo's proportions. */
var PINNED_MARK_SIZE = "min(46svh, 22rem, 27vw)";
/** Height of the tallest bar beside each stage on phones. */
var STACKED_MARK_SIZE = "3.25rem";
/** Scroll distance each stage holds the pinned frame for, in viewport heights. */
var STAGE_SVH = 90;
/** Stages take the logo's bar colours in turn. */
var stageColor = (index) => MARK.colors[index % MARK.colors.length];
/**
* One bar of the growing mark, in the logo's shape: fills over its own
* stage's slice of the scroll.
*/
function StageBar({ index, total, progress }) {
	const scaleY = useTransform(progress, [index / total, (index + 1) / total], [.06, 1]);
	return /* @__PURE__ */ jsx("span", {
		className: "relative block overflow-hidden bg-[var(--line)]",
		style: markBarStyle(PINNED_MARK_SIZE, index),
		children: /* @__PURE__ */ jsx(motion.span, {
			className: "absolute inset-0 origin-bottom",
			style: {
				scaleY,
				background: stageColor(index)
			}
		})
	});
}
/**
* Desktop: the section pins for one stretch of scroll per stage. The stage
* word swaps through a mask, the logo's bars grow one after another, and the
* light behind the frame shifts into each stage's colour.
*/
function PinnedProcess({ heading, items }) {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const [active, setActive] = useState(0);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"]
	});
	const total = items.length;
	useMotionValueEvent(scrollYProgress, "change", (value) => {
		const next = Math.min(total - 1, Math.max(0, Math.floor(value * total)));
		setActive((current) => current === next ? current : next);
	});
	const item = items[active];
	const color = stageColor(active);
	const swap = reduce ? {
		initial: false,
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: 0 }
	} : {
		initial: { y: "105%" },
		animate: { y: "0%" },
		exit: { y: "-105%" },
		transition: {
			duration: .7,
			ease: [...EASE]
		}
	};
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: "relative hidden lg:block",
		style: { height: `${total * STAGE_SVH + 100}svh` },
		children: /* @__PURE__ */ jsxs("div", {
			className: "sticky top-0 flex h-[100svh] items-center overflow-hidden",
			children: [/* @__PURE__ */ jsx(motion.div, {
				"aria-hidden": true,
				className: "pointer-events-none absolute -right-40 top-1/2 h-[48rem] w-[48rem] -translate-y-1/2 rounded-full blur-[160px]",
				animate: {
					backgroundColor: color,
					opacity: .22
				},
				transition: {
					duration: reduce ? 0 : .9,
					ease: [...EASE]
				}
			}), /* @__PURE__ */ jsxs("div", {
				className: "container-x relative grid w-full grid-cols-12 items-center gap-10",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "col-span-7",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
							children: heading
						}),
						/* @__PURE__ */ jsx("div", {
							className: "relative mt-10 h-[clamp(4rem,7.8vw,8rem)] overflow-hidden",
							children: /* @__PURE__ */ jsx(AnimatePresence, {
								initial: false,
								children: /* @__PURE__ */ jsx(motion.p, {
									...swap,
									className: "absolute inset-0 whitespace-nowrap font-display text-[clamp(3.5rem,7.2vw,7.25rem)] font-extrabold uppercase leading-[1] tracking-[-0.045em]",
									style: { color },
									children: item.stage
								}, active)
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "relative mt-10 min-h-[9rem] max-w-xl",
							children: /* @__PURE__ */ jsx(AnimatePresence, {
								mode: "wait",
								initial: false,
								children: /* @__PURE__ */ jsxs(motion.div, {
									initial: reduce ? false : {
										opacity: 0,
										y: 18
									},
									animate: {
										opacity: 1,
										y: 0
									},
									exit: reduce ? void 0 : {
										opacity: 0,
										y: -12
									},
									transition: {
										duration: .45,
										ease: [...EASE]
									},
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-strong)]",
										children: item.title
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-4 text-[16px] leading-relaxed text-[var(--mute)]",
										children: item.body
									})]
								}, active)
							})
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "col-span-5 flex justify-end",
					children: /* @__PURE__ */ jsx("ol", {
						className: "flex items-start",
						style: { gap: markGap(PINNED_MARK_SIZE) },
						children: items.map((stage, index) => /* @__PURE__ */ jsxs("li", {
							"aria-current": index === active ? "step" : void 0,
							className: "flex flex-col items-center",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex items-end",
								style: { height: PINNED_MARK_SIZE },
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx(StageBar, {
									index,
									total,
									progress: scrollYProgress
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "mt-6 whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-500",
								style: { color: index <= active ? stageColor(index) : "var(--ink-faint)" },
								children: stage.stage
							})]
						}, index))
					})
				})]
			})]
		})
	});
}
/** Phones and tablets: the same stages as a plain column, each arriving in turn. */
function StackedProcess({ heading, items }) {
	const reduce = useReducedMotion();
	return /* @__PURE__ */ jsx("div", {
		className: "section-pad lg:hidden",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--ink-faint)]",
				children: heading
			}), /* @__PURE__ */ jsx("ol", {
				className: "mt-10 flex flex-col",
				children: items.map((item, index) => /* @__PURE__ */ jsxs(motion.li, {
					className: "border-t border-[var(--line)] py-10",
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
						margin: "-10% 0px"
					},
					transition: {
						duration: .7,
						ease: [...EASE]
					},
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-end gap-4",
							children: [/* @__PURE__ */ jsx("span", {
								"aria-hidden": true,
								className: "block shrink-0",
								style: {
									...markBarStyle(STACKED_MARK_SIZE, index),
									background: stageColor(index)
								}
							}), /* @__PURE__ */ jsx("p", {
								className: "min-w-0 whitespace-nowrap font-display text-[clamp(2.25rem,11.5vw,5.5rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.045em]",
								style: { color: stageColor(index) },
								children: item.stage
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-6 font-display text-[1.5rem] font-bold leading-[1.15] text-[var(--ink-strong)]",
							children: item.title
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-3 text-[15px] leading-relaxed text-[var(--mute)]",
							children: item.body
						})
					]
				}, index))
			})]
		})
	});
}
/**
* The landing page's Idea -> Experience -> Result story.
*
* @param {{ content?: { heading?: string, items?: Array<{ stage?: string, title?: string, body?: string }> } }} props
*/
function Process({ content }) {
	const items = (content?.items ?? []).filter((item) => item?.stage);
	const heading = content?.heading ?? "";
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		id: "process",
		className: "noise relative bg-[var(--bg)]",
		children: [/* @__PURE__ */ jsx(PinnedProcess, {
			heading,
			items
		}), /* @__PURE__ */ jsx(StackedProcess, {
			heading,
			items
		})]
	});
}
//#endregion
//#region resources/js/components/sections/Recognition.jsx
/**
* Press and award logos, split across two rows drifting in opposite
* directions so the band reads as movement rather than a static wall.
*
* @param {{ content?: { heading?: string, items?: Array<{ name?: string, image?: string }> } }} props
*/
function Recognition({ content }) {
	const items = (content?.items ?? []).filter((item) => item?.name && item?.image);
	const heading = content?.heading ?? "";
	if (items.length === 0) return null;
	const rows = items.length >= 8 ? [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)] : [items];
	return /* @__PURE__ */ jsxs("section", {
		id: "recognition",
		className: "relative overflow-hidden bg-[var(--bg)] section-pad",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: "RECOGNITION" }), /* @__PURE__ */ jsx(RevealText, {
				as: "h2",
				className: "display-md mt-8 max-w-3xl uppercase text-[var(--ink-strong)]",
				lines: heading ? [heading] : []
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-10 md:mt-14",
			children: rows.map((row, index) => /* @__PURE__ */ jsx(RecognitionStrip, {
				items: row,
				duration: index === 0 ? 46 : 54,
				reverse: index === 1
			}, index))
		})]
	});
}
//#endregion
//#region resources/js/components/sections/Results.jsx
/**
* One result, set as an oversized number. It slides in from the side and
* counts up as it arrives; alternate rows come from alternate sides.
*/
function ResultRow({ item, index, reduce }) {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "center 55%"]
	});
	const from = index % 2 === 0 ? -8 : 8;
	const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [`${from}%`, "0%"]);
	const opacity = useTransform(scrollYProgress, [0, .6], reduce ? [1, 1] : [.15, 1]);
	const isInternal = item.url?.startsWith("/");
	return /* @__PURE__ */ jsxs("li", {
		ref,
		className: "grid gap-6 border-t border-[var(--line)] py-12 md:py-16 lg:grid-cols-12 lg:items-end lg:gap-10",
		children: [/* @__PURE__ */ jsxs(motion.p, {
			style: {
				x,
				opacity
			},
			className: "font-display text-[clamp(4.25rem,15vw,15rem)] font-extrabold leading-[0.82] tracking-[-0.055em] text-[var(--ink-strong)] lg:col-span-8",
			children: [/* @__PURE__ */ jsx(CountUp, {
				to: Number(item.value) || 0,
				prefix: item.prefix ?? ""
			}), item.suffix && /* @__PURE__ */ jsx("span", {
				className: "text-gradient text-[0.42em] tracking-[-0.03em]",
				children: item.suffix
			})]
		}), /* @__PURE__ */ jsxs(motion.div, {
			className: "lg:col-span-4 lg:pb-4",
			initial: reduce ? false : {
				opacity: 0,
				y: 20
			},
			whileInView: {
				opacity: 1,
				y: 0
			},
			viewport: {
				once: true,
				margin: "-15% 0px"
			},
			transition: {
				duration: .7,
				delay: .15,
				ease: [...EASE]
			},
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "font-display text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]",
					children: item.label
				}),
				item.context && /* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[15px] leading-relaxed text-[var(--mute)]",
					children: item.context
				}),
				item.url && (isInternal ? /* @__PURE__ */ jsx(Link, {
					href: item.url,
					"data-cursor": "view",
					className: "link-underline btn-press mt-5 inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
					children: "See the work ↗"
				}) : /* @__PURE__ */ jsx("a", {
					href: item.url,
					target: "_blank",
					rel: "noreferrer",
					"data-cursor": "view",
					className: "link-underline btn-press mt-5 inline-block text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
					children: "See the work ↗"
				}))
			]
		})]
	});
}
/**
* Client outcomes, one oversized number per row.
*
* @param {{ content?: { heading?: string, items?: Array<{ prefix?: string, value?: number, suffix?: string, label?: string, context?: string, url?: string }> } }} props
*/
function Results({ content }) {
	const reduce = useReducedMotion();
	const items = (content?.items ?? []).filter((item) => item?.label);
	const heading = content?.heading || "Results";
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		id: "results",
		className: "noise relative overflow-hidden bg-[var(--bg-soft)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x relative",
			children: [
				/* @__PURE__ */ jsx(SectionLabel, { name: "RESULTS" }),
				/* @__PURE__ */ jsx(RevealText, {
					as: "h2",
					className: "display-md mt-8 max-w-3xl uppercase text-[var(--ink-strong)]",
					lines: [heading]
				}),
				/* @__PURE__ */ jsx("ul", {
					className: "mt-14 border-b border-[var(--line)] md:mt-20",
					children: items.map((item, index) => /* @__PURE__ */ jsx(ResultRow, {
						item,
						index,
						reduce
					}, index))
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/sections/RichText.jsx
/**
* Heading plus editor-authored rich text. The body is written in the admin
* panel by a signed-in editor, so it is rendered as HTML.
*
* @param {{ content?: { eyebrow?: string, heading?: string, body?: string } }} props
*/
function RichText({ content }) {
	const { eyebrow, heading, body } = content ?? {};
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg)] pb-24 pt-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x max-w-3xl",
			children: [
				eyebrow && /* @__PURE__ */ jsx(SectionLabel, { name: eyebrow }),
				heading && /* @__PURE__ */ jsx("h1", {
					className: "display-md mt-8 uppercase text-[var(--ink-strong)]",
					children: /* @__PURE__ */ jsx(GradientTitle, { text: heading })
				}),
				body && /* @__PURE__ */ jsx("div", {
					className: "prose-cms mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--mute)]",
					dangerouslySetInnerHTML: { __html: body }
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/sections/ServiceShowcaseRail.jsx
/** Tight gap between screens — the strip stays continuous with no air in it. */
var GAP = 8;
/** Seconds for one screen to travel its own height — slow premium reel. */
var SECONDS_PER_SCREEN = 4.5;
var FRAME_INTERVAL = 1e3 / 30;
/**
* Real project visuals for the rail only, keyed by sub-service slug. Kept
* here rather than in the catalogue so the sub-service pages and the header
* menu are unaffected.
*/
var RAIL_IMAGES = {
	"brand-strategy": "/images/work/sabdita/brand-positioning.jpg",
	"brand-identity-design": "/images/work/sabdita/logo-presentation.jpg",
	rebranding: "/images/work/sabdita/logo-backgrounds.jpg",
	"packaging-design": "/images/work/sabdita/packaging.jpg",
	"motion-branding": "/images/work/sabdita/logo-animation.webp",
	"brand-guidelines": "/images/work/sabdita/logo-explainer.jpg",
	"website-ui-ux-design": "/images/work/uiux/amco/thumbs/01-home.webp",
	"mobile-app-ui-ux": "/images/work/uiux/city-online/thumbs/15-bill-pay.webp",
	"saas-product-design": "/images/work/uiux/adlbl/thumbs/01-dashboard.webp",
	"ux-research-strategy": "/images/work/uiux/microters/thumbs/07-case-study.webp",
	"wireframing-prototyping": "/images/work/uiux/adlbl/thumbs/05-add-member-form.webp",
	"design-system": "/images/work/uiux/adlbl/thumbs/13-setup-profile-branding.webp"
};
/**
* One compact version of the real dedicated-page sub-service card. Its image,
* name and short copy come from the same catalogue item rendered by the
* category page, so this rail cannot carry placeholder or stale content.
*
* `--svc-accent` carries the sub-service's brand colour into the frame's
* highlight hairline and caption dot. The image crop and content stack echo
* the dedicated cards at a scale that stays readable inside the narrow rail.
*/
function ShowcaseScreen({ item, solidTitle = false }) {
	const image = item.image ?? assetUrl(RAIL_IMAGES[item.slug]);
	return /* @__PURE__ */ jsx("figure", {
		className: "m-0",
		"data-screen": true,
		children: /* @__PURE__ */ jsxs("div", {
			className: "svc-screen relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]",
			style: { "--svc-accent": item.accent },
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "absolute inset-x-0 top-0 h-[48%] overflow-hidden bg-[#08080B]",
					children: [image ? /* @__PURE__ */ jsx("img", {
						src: image,
						alt: "",
						loading: "lazy",
						decoding: "async",
						draggable: false,
						className: "h-full w-full object-cover"
					}) : /* @__PURE__ */ jsx(MediaPlaceholder, { label: `${item.name} - image placeholder` }), /* @__PURE__ */ jsx("span", {
						className: "absolute inset-0",
						style: { background: "linear-gradient(180deg, transparent 46%, rgba(6,6,10,0.62) 100%)" },
						"aria-hidden": true
					})]
				}),
				/* @__PURE__ */ jsxs("figcaption", {
					className: "absolute inset-x-0 bottom-0 top-[48%] flex flex-col px-2 py-2 sm:px-2.5 sm:py-2.5",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "mb-1.5 flex items-center gap-1.5",
							"aria-hidden": true,
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-1 w-1 shrink-0 rounded-full",
								style: { background: item.accent }
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[6px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)] sm:text-[7px]",
								children: "Service"
							})]
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "overflow-hidden font-display text-[clamp(7px,0.7vw,10px)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-[var(--ink-strong)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
							children: solidTitle ? item.name : /* @__PURE__ */ jsx(GradientTitle, { text: item.name })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1.5 overflow-hidden text-[clamp(6px,0.56vw,8px)] leading-[1.3] text-[var(--mute)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]",
							children: item.short
						})
					]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "absolute inset-x-0 bottom-0 h-0.5",
					style: { background: item.accent },
					"aria-hidden": true
				})
			]
		})
	});
}
/**
* The moving showcase that occupies the right side of a Branding or UI/UX
* gateway card.
*
* One continuous strip of screens rising inside a tight clipped frame — a
* slow infinite reel where new visuals keep entering from the bottom and
* drifting upward. A single rAF clock advances the strip and reports the
* screen at the frame's top edge through `onActive`, which is the same tick
* that moves the sub-service ticker below the title — image and name always
* change together, with no drift possible. Parking off-screen or hiding
* the tab freezes both at once and resumes seamlessly — hover never
* pauses the reel; it only drives the card's CSS hover effects.
*
* No second plane, no blur, no pointer tilt, no edge fade masks and no
* glow: the frame is always full, edges cut hard by `overflow-hidden`, and
* only one transform is written per frame. The doubled strip keeps the
* frame full at every offset.
*
* The whole rail is decorative: `pointer-events-none` and `aria-hidden`, so
* taps pass through to the card-level navigation target.
*
* @param {{
*   category: { slug: string, name: string, items: Array<{ slug: string, name: string, short: string, image: string, accent: string }> },
*   onActive?: (index: number) => void,
*   progress?: import('framer-motion').MotionValue<number> | null,
*   solidTitle?: boolean,
* }} props
*   `progress` receives the reel's continuous position in screens — a float
*   wrapped into [0, count) — every frame. The sub-service ticker beneath the
*   title rides that same value, so the name rises in lockstep with the image
*   instead of stepping between them, and neither can drift from the other.
*/
function ServiceShowcaseRail({ category, onActive = () => {}, progress = null, solidTitle = false }) {
	const reduce = useReducedMotion();
	const frameRef = useRef(null);
	const [step, setStep] = useState(0);
	const [visible, setVisible] = useState(true);
	const items = category.items ?? [];
	const count = items.length;
	const y = useMotionValue(0);
	const stepRef = useRef(0);
	const travelled = useRef(0);
	const lastActive = useRef(0);
	useEffect(() => {
		const frame = frameRef.current;
		if (!frame || typeof ResizeObserver === "undefined") return void 0;
		const measure = () => {
			const first = frame.querySelector("[data-screen]");
			if (!first) return;
			const next = first.getBoundingClientRect().height + GAP;
			stepRef.current = next;
			setStep(next);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(frame);
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		const frame = frameRef.current;
		if (!frame || typeof IntersectionObserver === "undefined") return void 0;
		const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "25% 0px" });
		observer.observe(frame);
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		if (reduce || count === 0 || !visible) return void 0;
		let raf = 0;
		let last = performance.now();
		let hidden = document.hidden;
		const onVisibility = () => {
			hidden = document.hidden;
			last = performance.now();
		};
		document.addEventListener("visibilitychange", onVisibility);
		const frame = (now) => {
			raf = requestAnimationFrame(frame);
			const elapsed = now - last;
			if (elapsed < FRAME_INTERVAL) return;
			const dt = Math.min(64, elapsed) / 1e3;
			last = now;
			if (hidden) return;
			travelled.current = (travelled.current + dt / SECONDS_PER_SCREEN) % count;
			y.set(-(travelled.current * stepRef.current));
			if (progress) progress.set(travelled.current);
			const active = Math.floor(travelled.current) % count;
			if (active !== lastActive.current) {
				lastActive.current = active;
				onActive(active);
			}
		};
		raf = requestAnimationFrame(frame);
		return () => {
			cancelAnimationFrame(raf);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [
		reduce,
		count,
		visible,
		onActive,
		progress,
		y
	]);
	if (count === 0) return null;
	if (reduce) return /* @__PURE__ */ jsx("div", {
		className: "pointer-events-none relative w-[96px] shrink-0 self-stretch overflow-hidden sm:w-[124px] lg:w-[136px] xl:w-[172px]",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx("div", {
			className: "absolute inset-x-0 top-1/2 -translate-y-1/2",
			children: /* @__PURE__ */ jsx(ShowcaseScreen, {
				item: items[0],
				solidTitle
			})
		})
	});
	const copies = [...items, ...items];
	return /* @__PURE__ */ jsx("div", {
		ref: frameRef,
		className: "pointer-events-none relative w-[96px] shrink-0 self-stretch overflow-hidden sm:w-[124px] lg:w-[136px] xl:w-[172px]",
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx(motion.div, {
			className: "absolute inset-x-0 top-0 flex flex-col",
			style: {
				gap: GAP,
				y
			},
			children: copies.map((item, i) => /* @__PURE__ */ jsx(ShowcaseScreen, {
				item,
				solidTitle
			}, `${Math.floor(i / count)}-${item.slug}`))
		})
	});
}
//#endregion
//#region resources/js/components/sections/ServicesTransition.jsx
/**
* Viewport tier for the transition's scroll choreography. Phones keep the
* parallax but drop the 3D turn: perspective plus rotateX on a phone buys
* jank, not depth.
*
* @return {{ compact: boolean, rich: boolean }}
*/
function useTransitionTier() {
	const [tier, setTier] = useState({
		compact: false,
		rich: false
	});
	useEffect(() => {
		const compactQuery = window.matchMedia("(max-width: 767px)");
		const richQuery = window.matchMedia("(min-width: 768px)");
		const update = () => setTier({
			compact: compactQuery.matches,
			rich: richQuery.matches
		});
		update();
		compactQuery.addEventListener("change", update);
		richQuery.addEventListener("change", update);
		return () => {
			compactQuery.removeEventListener("change", update);
			richQuery.removeEventListener("change", update);
		};
	}, []);
	return tier;
}
/**
* The cinematic hand-off between the two category gateways and the dedicated
* Branding and UI/UX pages.
*
* One scroll progress value drives the whole passage. Everything it moves sits
* at a different distance and therefore travels at a different rate — the grid
* and the brand glows drift slowly behind, the headline turns out of depth on
* its own axis, and the supporting line and the buttons trail it — so scrolling
* through reads as moving through a space rather than past a block of copy.
*
* Only `transform` and `opacity` are animated, so the passage stays on the
* compositor. Phones keep the parallax and drop the 3D turn; reduced motion
* renders the section flat and static, with the copy and both links intact.
*
* @param {{ categories?: Array<{ slug: string, name: string }> }} props
*   Unused for content — the section deliberately carries no cards or lists —
*   but kept so the caller can pass the catalogue it already has.
*/
function ServicesTransition() {
	const ref = useRef(null);
	const reduce = useReducedMotion();
	const { compact, rich } = useTransitionTier();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});
	const k = compact ? .5 : 1;
	const gridY = useTransform(scrollYProgress, [0, 1], [-50 * k, 50 * k]);
	const glowY = useTransform(scrollYProgress, [0, 1], [110 * k, -110 * k]);
	const glowFade = useTransform(scrollYProgress, [
		0,
		.5,
		1
	], [
		0,
		1,
		0
	]);
	const headY = useTransform(scrollYProgress, [0, 1], [46 * k, -46 * k]);
	const headTurn = useTransform(scrollYProgress, [
		0,
		.5,
		1
	], [
		9,
		0,
		-6
	]);
	const headScale = useTransform(scrollYProgress, [
		0,
		.5,
		1
	], [
		.95,
		1,
		.98
	]);
	const headFade = useTransform(scrollYProgress, [
		0,
		.3,
		.78,
		1
	], [
		.35,
		1,
		1,
		.3
	]);
	const copyY = useTransform(scrollYProgress, [0, 1], [78 * k, -78 * k]);
	const ctaY = useTransform(scrollYProgress, [0, 1], [112 * k, -112 * k]);
	const ruleScale = useTransform(scrollYProgress, [.12, .45], [0, 1]);
	const counterGlowY = useTransform(glowY, (value) => -value);
	const motionProps = (style) => reduce ? {} : { style };
	const headStyle = rich ? {
		y: headY,
		rotateX: headTurn,
		scale: headScale,
		opacity: headFade,
		transformPerspective: 1200
	} : {
		y: headY,
		scale: headScale,
		opacity: headFade
	};
	return /* @__PURE__ */ jsxs("section", {
		ref,
		className: "services-transition relative isolate overflow-hidden bg-[var(--bg)] py-28 sm:py-36 lg:py-56",
		children: [
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "services-transition__grid grid-bg pointer-events-none absolute inset-x-0 -top-24 -bottom-24",
				...motionProps({ y: gridY })
			}),
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "services-transition__glow services-transition__glow--purple pointer-events-none absolute",
				...motionProps({
					y: glowY,
					opacity: glowFade
				})
			}),
			/* @__PURE__ */ jsx(motion.span, {
				"aria-hidden": true,
				className: "services-transition__glow services-transition__glow--cyan pointer-events-none absolute",
				...motionProps({
					y: counterGlowY,
					opacity: glowFade
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "container-x relative flex flex-col items-center text-center",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex justify-center",
						children: /* @__PURE__ */ jsx(SectionLabel, { name: "WHERE TO NEXT" })
					}),
					/* @__PURE__ */ jsx(motion.div, {
						className: "services-transition__head mt-9 w-full",
						...motionProps(headStyle),
						children: /* @__PURE__ */ jsx(RevealText, {
							as: "h2",
							className: "display-xl uppercase text-[var(--ink-strong)]",
							lines: ["Go deeper", "into the work."],
							lineClassName: "services-transition__line",
							duration: .82,
							stagger: .12
						})
					}),
					/* @__PURE__ */ jsx(motion.span, {
						"aria-hidden": true,
						className: "services-transition__rule mt-12 h-px w-40 origin-center rounded-full sm:w-56",
						...motionProps({ scaleX: ruleScale })
					}),
					/* @__PURE__ */ jsx(motion.p, {
						className: "mt-12 max-w-[18rem] text-[15px] leading-relaxed text-[var(--mute)] sm:max-w-xl sm:text-[17px]",
						...motionProps({ y: copyY }),
						children: "Two disciplines, two dedicated worlds. See how the strategy, the craft and the decisions behind each one actually come together, then bring us the thing you are trying to build."
					}),
					/* @__PURE__ */ jsxs(motion.div, {
						className: "mt-11 flex flex-col items-center gap-4 sm:flex-row sm:gap-5",
						...motionProps({ y: ctaY }),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "services-transition__cta relative",
							children: [/* @__PURE__ */ jsx("span", {
								className: "services-transition__halo",
								"aria-hidden": true
							}), /* @__PURE__ */ jsx(MagneticButton, { children: /* @__PURE__ */ jsx(GradientButton, {
								href: "/services#branding",
								children: "Explore Branding"
							}) })]
						}), /* @__PURE__ */ jsx(GradientButton, {
							href: "/services#ui-ux",
							variant: "ghost",
							children: "Explore UI/UX"
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/components/sections/SubServiceTicker.jsx
var ROW_H = 28;
/** Distance, in rows, at which a name has fully dissolved. */
var FADE_OUT = 1.35;
/**
* Signed distance of row `index` from the reel's current position, wrapped into
* [-count/2, count/2] so a row leaving the top re-enters from the bottom.
*
* @param {number} index
* @param {number} position
* @param {number} count
* @return {number}
*/
function rowOffset(index, position, count) {
	let off = ((index - position) % count + count) % count;
	if (off > count / 2) off -= count;
	return off;
}
/**
* One name in the ticker.
*
* Every visual property is a continuous function of the reel position, so the
* row rises, brightens, comes forward and recedes in one unbroken motion rather
* than snapping between an active and an inactive state. Each curve is written
* to land on the old step values at their old moments — dead centre reads
* exactly as the previous active row did, and one full row away reads exactly
* as the previous neighbour did — so the ticker's resting appearance is
* unchanged; only the travel between those points is now smooth.
*
* Rows live in their own component because each one needs its own hooks. All of
* them stay mounted and are driven entirely by `useTransform`, so a frame costs
* a compositor write per row and never a React render.
*
* @param {{
*   item: { slug: string, name: string, accent: string },
*   index: number,
*   count: number,
*   position: import('framer-motion').MotionValue<number>,
*   full: boolean,
* }} props
*/
function TickerRow({ item, index, count, position, full }) {
	const offset = useTransform(position, (p) => rowOffset(index, p, count));
	const y = useTransform(offset, (off) => off * ROW_H);
	const opacity = useTransform(offset, (off) => {
		const distance = Math.abs(off);
		if (distance >= FADE_OUT) return 0;
		if (distance <= 1) return 1 - distance * .62;
		return .38 * (1 - (distance - 1) / .3500000000000001);
	});
	const scale = useTransform(offset, (off) => 1 - Math.min(Math.abs(off), FADE_OUT) * .14);
	const z = useTransform(offset, (off) => 34 - Math.min(Math.abs(off), FADE_OUT) * 86);
	const rotateX = useTransform(offset, (off) => off * 16);
	return /* @__PURE__ */ jsx(motion.div, {
		style: full ? {
			y,
			z,
			rotateX,
			opacity,
			scale,
			transformStyle: "preserve-3d"
		} : {
			y,
			opacity,
			scale
		},
		className: "pointer-events-none absolute inset-x-0 top-[28px] flex h-[28px] items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
		children: /* @__PURE__ */ jsxs("span", {
			className: "pointer-events-none flex min-w-0 items-center gap-2.5",
			children: [/* @__PURE__ */ jsx("span", {
				className: "h-1.5 w-1.5 shrink-0 rounded-full",
				style: {
					background: item.accent,
					boxShadow: `0 0 10px ${item.accent}`
				},
				"aria-hidden": true
			}), /* @__PURE__ */ jsx("span", {
				className: "truncate",
				children: item.name
			})]
		})
	});
}
/**
* The dedicated sub-service's short copy, moving on the same clock as its
* ticker name and showcase screen. Keeping this text sourced from `item.short`
* means the landing widget cannot drift from the category page catalogue.
*/
function CopyRow({ item, index, count, position }) {
	const offset = useTransform(position, (p) => rowOffset(index, p, count));
	const y = useTransform(offset, (off) => off * 18);
	const opacity = useTransform(offset, (off) => Math.max(0, 1 - Math.abs(off) * 2));
	return /* @__PURE__ */ jsx(motion.p, {
		style: {
			y,
			opacity
		},
		className: "pointer-events-none absolute inset-x-0 top-0 text-[14px] leading-relaxed text-[var(--mute)] sm:text-[15px]",
		children: item.short
	});
}
/**
* Vertical 3D sub-service ticker that lives inside a Branding / UI-UX gateway
* card, beneath the dominant title.
*
* It rides the showcase rail's own clock — `position` is the reel's continuous
* offset in screens — so the names rise at exactly the speed the images beside
* them do, and the two can never drift apart. The motion is continuous and
* automatic: it is driven by time alone, never by the pointer, so the names
* neither shake nor follow the cursor, and hovering the card does not start,
* stop or steer them. Rows nearest the centre sit close and bright while those
* above and below recede into depth (translateZ + slight rotateX inside a
* perspective stage).
*
* The ticker is presentational only: every row is `pointer-events-none` and the
* moving stage is `aria-hidden`, so hovering it, moving across it, or pressing
* a row can never start a page visit. Navigation on this card belongs to the
* arrow and the "Explore …" CTA alone. A static list carries the same names to
* assistive technology, which is both more useful and more stable than
* announcing whichever row happens to be centred.
*
* Phones get the same upward rise without the 3D depth. Reduced motion leaves
* the column parked on its first name.
*
* @param {{
*   category: { slug: string, name: string, items: Array<{ slug: string, name: string, accent: string }> },
*   position: import('framer-motion').MotionValue<number>,
* }} props
*/
function SubServiceTicker({ category, position }) {
	const reduce = useReducedMotion();
	const [rich, setRich] = useState(false);
	const items = category.items ?? [];
	const count = items.length;
	useEffect(() => {
		const query = window.matchMedia("(min-width: 768px)");
		const update = () => setRich(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	if (count === 0) return null;
	const full = rich && !reduce;
	return /* @__PURE__ */ jsxs("div", {
		className: "relative mt-5 h-[84px]",
		children: [/* @__PURE__ */ jsx("ul", {
			className: "sr-only",
			children: items.map((item) => /* @__PURE__ */ jsxs("li", { children: [
				item.name,
				": ",
				item.short
			] }, item.slug))
		}), /* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 overflow-hidden",
			style: full ? { perspective: "520px" } : void 0,
			"aria-hidden": true,
			children: items.map((item, i) => /* @__PURE__ */ jsx(TickerRow, {
				item,
				index: i,
				count,
				position,
				full
			}, item.slug))
		})]
	});
}
/**
* Synchronized short copy for the active sub-service. This occupies the same
* space as the former static category tagline, so the card layout stays fixed
* while the real dedicated-page copy travels bottom-to-top with the reel.
*
* @param {{
*   category: { items: Array<{ slug: string, short: string }> },
*   position: import('framer-motion').MotionValue<number>,
* }} props
*/
function SubServiceCopy({ category, position }) {
	const items = category.items ?? [];
	const count = items.length;
	if (count === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "relative h-12 min-w-0 max-w-sm flex-1 overflow-hidden",
		"aria-hidden": true,
		children: items.map((item, index) => /* @__PURE__ */ jsx(CopyRow, {
			item,
			index,
			count,
			position
		}, item.slug))
	});
}
//#endregion
//#region resources/js/components/sections/Services.jsx
var BRAND_GRADIENT$1 = "linear-gradient(90deg, #891FFB, #507AF4, #1BE2EB)";
function navigateWithCurtain(event, href, tapIntent) {
	if (event.defaultPrevented) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	if (event.button !== void 0 && event.button !== 0) return;
	tapIntent.onClick(event);
	if (event.defaultPrevented) return;
	event.preventDefault();
	transitionTo(href);
}
/**
* Home-page entrance choreography. It plays once, `compact` shortens the
* travel and timings on phones, and the whole thing is skipped when the user
* prefers reduced motion.
*/
var VIEWPORT = {
	once: true,
	margin: "-12% 0px -12% 0px"
};
/** Phones play the entrance once; replaying it on every pass is wasted work. */
var VIEWPORT_COMPACT = {
	once: true,
	margin: "-12% 0px -12% 0px"
};
var cardStagger = (compact) => ({
	hidden: {},
	show: { transition: {
		staggerChildren: compact ? .1 : .15,
		delayChildren: compact ? .05 : .12
	} }
});
/**
* Desktop cards arrive as panels standing in depth: they rise, un-tilt and
* come forward out of the stage's Z axis into a perfectly flat resting frame.
* `mirror` turns the second card's entry the other way so the pair opens like
* two leaves rather than two copies. Phones keep the existing flat rise —
* rotation and translateZ on a phone buy jank, not depth.
*
* @param {boolean} compact
* @param {boolean} mirror
*/
var cardVariants = (compact, mirror = false) => ({
	hidden: {
		opacity: 0,
		y: compact ? 34 : 66,
		scale: compact ? .98 : .94,
		rotateX: compact ? 0 : 13,
		rotateY: compact ? 0 : mirror ? -9 : 9,
		z: compact ? 0 : -240
	},
	show: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotateX: 0,
		rotateY: 0,
		z: 0,
		transition: {
			duration: compact ? .44 : .72,
			ease: [...EASE]
		}
	}
});
var COMPACT_QUERY = "(max-width: 767px)";
/**
* True on phone-width viewports, so the section can run a lighter version of
* the same choreography. It settles straight after hydration (see
* `useMediaQuery`); the card grid is keyed on it, so the cards — still hidden
* at that point — remount with the phone's entrance pose before they play.
*
* @return {boolean}
*/
function useCompactViewport() {
	return useMediaQuery(COMPACT_QUERY);
}
function CategoryGateway({ category, variants, solidHeadings = false }) {
	const cardTapIntent = useTapIntent();
	const arrowTapIntent = useTapIntent();
	const exploreHref = `/services#${category.slug}`;
	const reel = useMotionValue(0);
	return /* @__PURE__ */ jsxs(motion.article, {
		"data-cursor": "explore",
		variants,
		style: variants ? { transformStyle: "preserve-3d" } : void 0,
		className: `group relative min-h-[340px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10 lg:p-12 ${variants ? "services-card" : ""}`.trimEnd(),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100",
				style: { background: BRAND_GRADIENT$1 },
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx(Link, {
				href: exploreHref,
				prefetch: true,
				"aria-label": `Explore ${category.name} services`,
				...cardTapIntent,
				onClick: (event) => navigateWithCurtain(event, exploreHref, cardTapIntent),
				className: "absolute inset-0 z-0 rounded-3xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#507AF4]"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none relative z-0 flex h-full gap-4 sm:gap-7",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex h-full min-w-0 flex-1 flex-col justify-between gap-8",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "font-display text-[calc(clamp(2.1rem,8.6vw,3.9rem)*var(--heading-scale,1))] font-extrabold uppercase leading-[.88] tracking-[-.05em] text-[var(--ink-strong)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2",
								children: solidHeadings ? category.name : /* @__PURE__ */ jsx(GradientTitle, { text: category.name })
							}), /* @__PURE__ */ jsx(Link, {
								href: exploreHref,
								prefetch: true,
								"aria-label": `Explore ${category.name}`,
								...arrowTapIntent,
								onClick: (event) => navigateWithCurtain(event, exploreHref, arrowTapIntent),
								className: "services-card__arrow pointer-events-auto relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-xl text-[var(--ink)] transition-all duration-500 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-[#507AF4] group-hover:text-white",
								children: "↗"
							})]
						}),
						/* @__PURE__ */ jsx(SubServiceTicker, {
							category,
							position: reel
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex",
							children: /* @__PURE__ */ jsx(SubServiceCopy, {
								category,
								position: reel
							})
						})
					]
				}), /* @__PURE__ */ jsx(ServiceShowcaseRail, {
					category,
					progress: reel,
					solidTitle: solidHeadings
				})]
			})
		]
	});
}
/**
* @param {{
*   heroHeading?: boolean,
*   subservices?: Array<object>,
*   showTransition?: boolean,
*   scrollAnimation?: boolean,
*   solidHeadings?: boolean,
* }} props
*   `showTransition` false keeps the section to the two category gateways only
*   — the Home page wants a simple entry point and has its own onward flow,
*   while the Services page closes on the cinematic hand-off to the dedicated
*   Branding and UI/UX pages.
*   `scrollAnimation` opts into the Home-only entrance choreography and the
*   card hover treatment; every other mount renders exactly as before. The two
*   gateway cards themselves — layout, type scale and the moving showcase rail
*   in the composition area — are identical wherever the section mounts.
*   `solidHeadings` keeps every title in this section a single solid colour
*   (Services pages); elsewhere the key words carry the brand gradient.
*/
function Services({ content = {}, heroHeading = false, subservices = [], showTransition = true, scrollAnimation = false, solidHeadings = false }) {
	const reduce = useReducedMotion();
	const compact = useCompactViewport();
	const animate = !reduce;
	const gridVariants = useMemo(() => cardStagger(compact), [compact]);
	const itemVariants = useMemo(() => cardVariants(compact), [compact]);
	const mirroredVariants = useMemo(() => cardVariants(compact, true), [compact]);
	return /* @__PURE__ */ jsxs("section", {
		id: "services",
		className: "relative overflow-x-clip bg-[var(--bg)] pt-24 lg:pt-32",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x relative pb-20 lg:pb-28",
			children: [
				content.heading && /* @__PURE__ */ jsx(SectionLabel, { name: content.heading.toUpperCase() }),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
					children: [/* @__PURE__ */ jsx(ScrollHeading, {
						enabled: heroHeading || animate,
						intensity: heroHeading ? 1 : .85,
						children: /* @__PURE__ */ jsx(RevealText, {
							as: heroHeading ? "h1" : "h2",
							className: "display-lg uppercase text-[var(--ink-strong)]",
							lines: content.titleLines ?? [],
							lineClassName: "whitespace-nowrap",
							highlightedLines: solidHeadings ? void 0 : gradientLines(content.titleLines, content.titleHighlight),
							duration: animate ? .58 : void 0,
							stagger: animate ? .13 : void 0
						})
					}), content.intro && /* @__PURE__ */ jsx("p", {
						className: "max-w-lg text-[15px] leading-relaxed text-[var(--mute)]",
						children: content.intro
					})]
				}),
				/* @__PURE__ */ jsx(motion.div, {
					className: "mt-14 grid w-full gap-5 lg:grid-cols-2",
					style: animate && !compact ? { perspective: "1500px" } : void 0,
					...animate ? {
						initial: "hidden",
						whileInView: "show",
						viewport: compact || !scrollAnimation ? VIEWPORT_COMPACT : VIEWPORT,
						variants: gridVariants
					} : {},
					children: subservices.map((category, index) => /* @__PURE__ */ jsx(CategoryGateway, {
						category,
						variants: animate ? index % 2 === 1 ? mirroredVariants : itemVariants : void 0,
						solidHeadings
					}, category.slug))
				}, compact ? "compact" : "wide")
			]
		}), showTransition && /* @__PURE__ */ jsx(ServicesTransition, {})]
	});
}
//#endregion
//#region resources/js/components/motion/ScrubRise.jsx
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
//#endregion
//#region resources/js/components/sections/Story.jsx
var BRAND_GRADIENT = "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)";
/** Where the first timeline entry starts revealing, and how far apart the rest are spread. */
var REVEAL_FIRST = .03;
var REVEAL_SPREAD = .56;
var REVEAL_LENGTH = .15;
function StoryPoint({ stop, index, total, progress, reduce }) {
	const revealStart = REVEAL_FIRST + (total > 1 ? index * REVEAL_SPREAD / (total - 1) : 0);
	const revealEnd = revealStart + REVEAL_LENGTH;
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
				className: "absolute top-1.5 left-[calc(-2rem+0.5px)] h-2.5 w-2.5 -translate-x-1/2 rounded-full md:left-[calc(-2.5rem+0.5px)]",
				style: { background: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] },
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
/**
* A pull quote whose last word carries the brand gradient, e.g. "Just Results."
*
* @param {{ text: string }} props
*/
function PullQuote({ text }) {
	const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return null;
	const last = words.pop();
	return /* @__PURE__ */ jsxs("p", {
		className: "mt-6 border-l-2 pl-5 font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-3xl",
		style: { borderImage: `${BRAND_GRADIENT} 1` },
		children: [words.length > 0 && `${words.join(" ")} `, /* @__PURE__ */ jsx("span", {
			className: "text-gradient",
			children: last
		})]
	});
}
/**
* The pinned "Our story" section: label, heading, intro and pull quote on the
* left; a timeline on the right whose entries arrive, and whose rail fills,
* as the reader scrolls through it.
*
* @param {{ content?: { label?: string, heading?: string, highlight?: number, intro?: string, quote?: string, items?: Array<{ year?: string, title?: string, copy?: string }> } }} props
*/
function Story({ content = {} }) {
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
	const items = (content.items ?? []).filter((item) => item?.title);
	return /* @__PURE__ */ jsx("section", {
		ref: sectionRef,
		"aria-labelledby": "story-title",
		className: `${reduce ? "section-pad" : "h-[260svh]"} relative border-t border-[var(--line)] bg-[var(--bg-soft)]`,
		children: /* @__PURE__ */ jsxs("div", {
			className: `container-x grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 ${reduce ? "" : "section-pad sticky top-16 min-h-[calc(100svh-4rem)] content-center lg:top-[72px] lg:min-h-[calc(100svh-72px)]"}`,
			children: [/* @__PURE__ */ jsx("div", {
				className: "lg:sticky lg:top-32 lg:self-start",
				children: /* @__PURE__ */ jsxs(ScrubRise, { children: [
					content.label && /* @__PURE__ */ jsx(SectionLabel, { name: content.label }),
					/* @__PURE__ */ jsx("h2", {
						id: "story-title",
						className: "display-md mt-6 uppercase text-[var(--ink-strong)]",
						children: /* @__PURE__ */ jsx(GradientTitle, {
							text: content.heading ?? "",
							highlightWords: Number(content.highlight ?? 0)
						})
					}),
					content.intro && /* @__PURE__ */ jsx("p", {
						className: "mt-5 max-w-md text-[15px] leading-relaxed text-[var(--mute)]",
						children: content.intro
					}),
					/* @__PURE__ */ jsx(PullQuote, { text: content.quote })
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
						children: items.map((stop, i) => /* @__PURE__ */ jsx(StoryPoint, {
							stop,
							index: i,
							total: items.length,
							progress,
							reduce
						}, `${stop.title}-${i}`))
					})
				]
			})]
		})
	});
}
//#endregion
//#region resources/js/components/sections/Team.jsx
function LeadershipPortrait({ image, alt }) {
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
			src: assetUrl(image),
			alt,
			loading: "lazy",
			decoding: "async",
			className: "aspect-[4/5] h-full max-h-[620px] w-full object-cover object-top"
		})
	});
}
function LeadershipCopy({ name, role, bio }) {
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
			role && /* @__PURE__ */ jsx("p", {
				className: "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-[#891FFB]",
				children: role
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--ink-strong)] md:text-4xl",
				children: name
			}),
			bio && /* @__PURE__ */ jsx("p", {
				className: "mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--mute)] md:text-base",
				children: bio
			})
		]
	});
}
/**
* Leadership: a heading, then the leader's portrait beside their name, role
* and bio. The awards strip follows as its own section.
*
* @param {{ content?: { label?: string, heading?: string, highlight?: number, name?: string, role?: string, bio?: string, image?: string } }} props
*/
function Team({ content = {} }) {
	const hasLeader = Boolean(content.name || content.image);
	return /* @__PURE__ */ jsx("section", {
		"aria-labelledby": "team-title",
		className: "section-pad relative border-t border-[var(--line)]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsxs(ScrubRise, { children: [content.label && /* @__PURE__ */ jsx(SectionLabel, { name: content.label }), /* @__PURE__ */ jsx("h2", {
				id: "team-title",
				className: "display-md mt-6 max-w-3xl uppercase text-[var(--ink-strong)]",
				children: /* @__PURE__ */ jsx(GradientTitle, {
					text: content.heading ?? "",
					highlightWords: Number(content.highlight ?? 0)
				})
			})] }), hasLeader && /* @__PURE__ */ jsxs("div", {
				className: "mt-12 grid items-center gap-10 md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1fr)] md:gap-14 lg:gap-20",
				children: [content.image && /* @__PURE__ */ jsx(LeadershipPortrait, {
					image: content.image,
					alt: [content.name, content.role].filter(Boolean).join(", ") + " at Marketorr"
				}), /* @__PURE__ */ jsx(LeadershipCopy, {
					name: content.name,
					role: content.role,
					bio: content.bio
				})]
			})]
		})
	});
}
//#endregion
//#region resources/js/components/sections/Testimonials.jsx
/**
* @param {{ content?: { heading?: string, items?: Array<{ quote?: string, author?: string, role?: string }> } }} props
*/
function Testimonials({ content }) {
	const reduce = useReducedMotion();
	const items = content?.items ?? [];
	if (items.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "bg-[var(--bg-soft)] section-pad",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [/* @__PURE__ */ jsx(SectionLabel, { name: content?.heading || "Testimonials" }), /* @__PURE__ */ jsx("div", {
				className: "mt-10 grid gap-6 lg:grid-cols-3",
				children: items.map((item, index) => /* @__PURE__ */ jsxs(motion.figure, {
					initial: reduce ? { opacity: 0 } : {
						opacity: 0,
						y: 20
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-10% 0px"
					},
					transition: {
						duration: .45,
						delay: index * .06,
						ease: EASE
					},
					className: "flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-display text-[32px] leading-none",
							style: { color: BRAND_SEQUENCE[index % BRAND_SEQUENCE.length] },
							"aria-hidden": true,
							children: "“"
						}),
						/* @__PURE__ */ jsx("blockquote", {
							className: "mt-3 flex-1 text-[15px] leading-[1.75] text-[var(--mute)]",
							children: item.quote
						}),
						/* @__PURE__ */ jsxs("figcaption", {
							className: "mt-6 border-t border-[var(--line)] pt-4",
							children: [/* @__PURE__ */ jsx("p", {
								className: "font-display text-[14px] font-bold text-[var(--ink-strong)]",
								children: item.author
							}), item.role && /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-[12px] text-[var(--ink-faint)]",
								children: item.role
							})]
						})
					]
				}, `${item.author}-${index}`))
			})]
		})
	});
}
//#endregion
//#region resources/js/components/sections/UiuxWork.jsx
var PORTFOLIO_HREF = "/work/portfolio/uiux";
/**
* The landing page's UI/UX half of Our Work: the same printer the project
* pages use, printing one cover per project instead of one project's pages.
* Each printed sheet opens that project's own printer.
*
* @param {{
*   projects?: Array<{ slug: string, name: string, discipline: string, href: string, cover: { src: string, thumb: string, width: number, height: number, alt: string } }>,
* }} props
*/
function UiuxWork({ content = {}, projects = [] }) {
	const printed = useMemo(() => ({
		slug: "uiux-portfolio",
		name: "UI/UX Portfolio",
		discipline: "UI/UX",
		screens: projects.map((project) => ({
			...project.cover,
			alt: project.cover.alt || project.name,
			label: project.name,
			href: project.href
		}))
	}), [projects]);
	if (projects.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		id: "uiux-work",
		className: "relative bg-[var(--bg)] pt-[clamp(5rem,9vw,9rem)]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "container-x",
			children: [content.heading && /* @__PURE__ */ jsx(SectionLabel, { name: content.heading.toUpperCase() }), /* @__PURE__ */ jsxs("div", {
				className: "mt-10 flex flex-wrap items-end justify-between gap-8",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(RevealText, {
					as: "h2",
					className: "display-lg uppercase text-[var(--ink-strong)]",
					lines: content.titleLines ?? [],
					highlightedLines: gradientLines(content.titleLines, content.titleHighlight)
				}), content.intro && /* @__PURE__ */ jsx("p", {
					className: "mt-4 max-w-lg text-[15px] text-[var(--mute)]",
					children: content.intro
				})] }), content.linkLabel && /* @__PURE__ */ jsx(Link, {
					href: PORTFOLIO_HREF,
					"data-cursor": "explore",
					className: "link-underline btn-press text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
					children: content.linkLabel
				})]
			})]
		}), /* @__PURE__ */ jsx(UiuxPrinter, {
			project: printed,
			hint: {
				desktop: "Click a project to see all its screens",
				mobile: "Tap a project to see all its screens"
			}
		})]
	});
}
//#endregion
//#region resources/js/components/sections/SectionRenderer.jsx
/**
* How each widget is wrapped for scroll animation. The three exceptions are
* not stylistic — each would visibly break inside the wrong wrapper:
*
* - `none` for Hero: it owns the opening frame and its own parallax, and a
*   scene that animated in on load would fight both.
* - `none` for Our Work, UI/UX Work and Process: each drives a sticky scroll stage, and a
*   transformed ancestor would move its supposedly fixed layer with the page.
* - `flat` for Contact: the office map does not survive a 3D ancestor.
*/
var SCENE = {
	None: "none",
	Depth: "depth",
	Flat: "flat"
};
/**
* The widget registry. A `type` with no entry here renders nothing rather
* than throwing, so a section added by a newer deploy cannot white-screen the
* page for a visitor on a stale bundle.
*/
var WIDGETS = {
	hero: {
		scene: SCENE.None,
		render: (section) => /* @__PURE__ */ jsx(Hero, { content: section.content })
	},
	marquee: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Marquee, { content: section.content })
	},
	about: {
		scene: SCENE.Depth,
		render: (section, { standalone, compactTop }) => /* @__PURE__ */ jsx(About, {
			content: section.content,
			variant: standalone ? "hero" : "manifesto",
			heroHeading: standalone,
			compactTop
		})
	},
	services: {
		scene: SCENE.Depth,
		render: (section, { props }) => /* @__PURE__ */ jsx(Services, {
			content: section.content,
			subservices: props.subservices ?? [],
			showTransition: false,
			scrollAnimation: true
		})
	},
	work: {
		scene: SCENE.None,
		render: (section, { props, fx }) => /* @__PURE__ */ jsx(OurWork, {
			content: section.content,
			glow: fx.barGlow,
			projects: props.featuredProjects ?? []
		})
	},
	uiux_work: {
		scene: SCENE.None,
		render: (section, { props }) => /* @__PURE__ */ jsx(UiuxWork, {
			content: section.content,
			projects: props.uiuxShowcase ?? []
		})
	},
	contact: {
		scene: SCENE.Flat,
		group: "contact",
		render: (section) => /* @__PURE__ */ jsx(Contact, { content: section.content })
	},
	contact_faq: {
		scene: SCENE.Flat,
		group: "contact",
		render: (section) => /* @__PURE__ */ jsx(ContactFaq, { content: section.content })
	},
	contact_connect: {
		scene: SCENE.Flat,
		group: "contact",
		render: (section) => /* @__PURE__ */ jsx(ContactConnect, { content: section.content })
	},
	awards: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Awards, { content: section.content })
	},
	closing_panel: {
		scene: SCENE.None,
		render: (section) => /* @__PURE__ */ jsx(ClosingPanel, { content: section.content })
	},
	rich_text: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(RichText, { content: section.content })
	},
	features: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Features, { content: section.content })
	},
	testimonials: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Testimonials, { content: section.content })
	},
	faq: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Faq, { content: section.content })
	},
	cta: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Cta, { content: section.content })
	},
	process: {
		scene: SCENE.None,
		render: (section) => /* @__PURE__ */ jsx(Process, { content: section.content })
	},
	results: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Results, { content: section.content })
	},
	recognition: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Recognition, { content: section.content })
	},
	story: {
		scene: SCENE.None,
		render: (section) => /* @__PURE__ */ jsx(Story, { content: section.content })
	},
	mission_vision: {
		scene: SCENE.None,
		render: (section) => /* @__PURE__ */ jsx(MissionVision, { content: section.content })
	},
	team: {
		scene: SCENE.Depth,
		render: (section) => /* @__PURE__ */ jsx(Team, { content: section.content })
	}
};
/**
* Renders one page's widget stack.
*
* `appearance` chooses how a section arrives, and nothing else — every widget
* keeps its own internal motion either way:
*
* - `depth` (the default, and what every page other than the landing page
*   uses): the full `CinematicScene` stage, where a section comes forward out
*   of 3D depth, rests, then falls back and dims as the next one arrives.
* - `reveal`: the section lifts into place once and then holds still. No
*   perspective, no rotation, no dimming on the way out.
*
* Widgets registered as `SCENE.None` are unwrapped under both, so the hero
* and Our Work's sticky stage are untouched by this choice.
*
* @param {{
*   sections?: Array<{ id: number, type: string, content: object }>,
*   appearance?: 'depth'|'reveal',
* }} props
*/
function SectionRenderer({ sections = [], appearance = "depth" }) {
	const { props } = usePage();
	const fx = useThemeMotion();
	const standalone = sections.length === 1;
	const runs = [];
	sections.forEach((section, index) => {
		const widget = WIDGETS[section.type];
		if (!widget) return;
		const compactTop = appearance === "reveal" && sections[index - 1]?.type === "marquee";
		const element = /* @__PURE__ */ jsx(Fragment, { children: widget.render(section, {
			props,
			fx,
			standalone,
			compactTop
		}) }, section.id);
		const previous = runs[runs.length - 1];
		if (widget.group && previous?.group === widget.group) previous.elements.push(element);
		else runs.push({
			key: section.id,
			widget,
			group: widget.group,
			elements: [element]
		});
	});
	return runs.map(({ key, widget, elements }) => {
		if (widget.scene === SCENE.None) return /* @__PURE__ */ jsx(Fragment, { children: elements }, key);
		if (appearance === "reveal") return /* @__PURE__ */ jsx(SectionAppear, { children: elements }, key);
		return /* @__PURE__ */ jsx(CinematicScene, {
			depth: widget.scene === SCENE.Depth,
			children: elements
		}, key);
	});
}
//#endregion
export { MissionVision as a, Awards as i, Team as n, About as o, Story as r, PageMeta as s, SectionRenderer as t };
