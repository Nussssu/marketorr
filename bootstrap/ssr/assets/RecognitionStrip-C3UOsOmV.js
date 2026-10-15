import { a as MARK, g as SectionLabel, o as markBarStyle, s as markGap, y as useThemeMotion } from "../ssr.js";
import { t as RevealText } from "./RevealText-Co3c_QNo.js";
import { t as ScrollHeading } from "./ScrollHeading-BhPAyGdL.js";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
//#region resources/js/components/sections/About.jsx
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
function ManifestoAbout({ text, metrics, compactTop }) {
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
				/* @__PURE__ */ jsx(SectionLabel, { name: "ABOUT" }),
				/* @__PURE__ */ jsx("h2", {
					className: "sr-only",
					children: "About Marketorr"
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
					children: [/* @__PURE__ */ jsxs("p", {
						className: "font-display text-[12px] font-bold uppercase tracking-[0.22em]",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[#891FFB]",
								children: "Creative thinking. "
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[#507AF4]",
								children: "Digital execution. "
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[#1BE2EB]",
								children: "Measurable results."
							})
						]
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
	if (variant === "manifesto") return /* @__PURE__ */ jsx(ManifestoAbout, {
		text,
		metrics,
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
				/* @__PURE__ */ jsx(SectionLabel, { name: "ABOUT" }),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-10 grid gap-12 lg:grid-cols-12",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-7",
						children: [/* @__PURE__ */ jsx(ScrollHeading, {
							enabled: heroHeading,
							children: /* @__PURE__ */ jsx(RevealText, {
								as: "h2",
								className: "display-lg uppercase text-[var(--ink-strong)]",
								lines: ["We build brands", "that move people."],
								highlightedLines: [1]
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
							/* @__PURE__ */ jsxs("p", {
								className: "mt-5 font-display text-[12px] font-bold uppercase tracking-[0.22em]",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[#891FFB]",
										children: "Creative thinking. "
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[#507AF4]",
										children: "Digital execution. "
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[#1BE2EB]",
										children: "Measurable results."
									})
								]
							}),
							/* @__PURE__ */ jsx(Link, {
								href: "/services",
								"data-cursor": "explore",
								className: "link-underline btn-press mt-6 inline-block text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]",
								children: "Explore our services →"
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
export { CountUp as i, About as n, Stage as r, RecognitionStrip as t };
