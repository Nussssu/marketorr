import { i as COLORS } from "../ssr.js";
import { useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/decor/ServiceScene.jsx
var { grape: PURPLE, iris: BLUE, frost: CYAN } = COLORS;
var SWATCHES = [
	PURPLE,
	BLUE,
	CYAN
];
/**
* Timing for one looping element: `--dur` is the loop length and `--delay`
* where in it this element starts. The keyframes live in app.css
* (`.scene-*`), so every scene shares one small motion vocabulary.
*
* @param {number} dur
* @param {number} [delay]
* @return {Record<string, string>}
*/
var t = (dur, delay = 0) => ({
	"--dur": `${dur}s`,
	"--delay": `${delay}s`
});
/** A soft surface card, the basic building block of every scene. */
function Panel({ className = "", style, children }) {
	return /* @__PURE__ */ jsx("div", {
		className: `scene-panel absolute ${className}`.trimEnd(),
		style,
		children
	});
}
/** A placeholder line of copy. */
function Bone({ width, className = "", style }) {
	return /* @__PURE__ */ jsx("div", {
		className: `scene-bone ${className}`.trimEnd(),
		style: {
			width,
			...style
		}
	});
}
/** A tiny uppercase label. */
function Label({ children, className = "" }) {
	return /* @__PURE__ */ jsx("span", {
		className: `scene-label ${className}`.trimEnd(),
		children
	});
}
/** Brand Strategy: a positioning map, the brand landing on open ground. */
function BrandStrategy() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("div", { className: "scene-axis absolute left-[8cqw] right-[8cqw] top-1/2 h-px" }),
		/* @__PURE__ */ jsx("div", { className: "scene-axis absolute bottom-[8cqw] top-[8cqw] left-1/2 w-px" }),
		/* @__PURE__ */ jsx(Label, {
			className: "absolute left-1/2 top-[3cqw] -translate-x-1/2",
			children: "Premium"
		}),
		/* @__PURE__ */ jsx(Label, {
			className: "absolute bottom-[3cqw] left-1/2 -translate-x-1/2",
			children: "Accessible"
		}),
		/* @__PURE__ */ jsx(Label, {
			className: "absolute left-[3cqw] top-1/2 -translate-y-[160%]",
			children: "Classic"
		}),
		/* @__PURE__ */ jsx(Label, {
			className: "absolute right-[3cqw] top-1/2 -translate-y-[160%]",
			children: "Modern"
		}),
		[
			[24, 30],
			[32, 40],
			[20, 64],
			[38, 70],
			[62, 74],
			[70, 62]
		].map(([x, y], index) => /* @__PURE__ */ jsx("span", {
			className: "scene-rival scene-float absolute h-[3.4cqw] w-[3.4cqw] rounded-full",
			style: {
				left: `${x}cqw`,
				top: `${y}cqw`,
				...t(4 + index * .6, index * -.7)
			}
		}, `${x}-${y}`)),
		/* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 100 100",
			className: "absolute inset-0 h-full w-full",
			children: /* @__PURE__ */ jsx("path", {
				d: "M50 50 C58 46 64 36 74 27",
				pathLength: "1",
				className: "scene-draw scene-dash-line",
				style: t(6)
			})
		}),
		[0, .8].map((delay) => /* @__PURE__ */ jsx("span", {
			className: "scene-ping absolute left-[74cqw] top-[27cqw] h-[7cqw] w-[7cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border",
			style: {
				borderColor: CYAN,
				...t(2.4, delay)
			}
		}, delay)),
		/* @__PURE__ */ jsx("span", {
			className: "scene-in absolute left-[74cqw] top-[27cqw] h-[7cqw] w-[7cqw] -translate-x-1/2 -translate-y-1/2 rounded-full",
			style: {
				background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
				boxShadow: `0 0 5cqw ${BLUE}88`,
				...t(6, .9)
			}
		}),
		/* @__PURE__ */ jsx("span", {
			className: "scene-in scene-chip absolute left-[64cqw] top-[35cqw]",
			style: t(6, 1.2),
			children: "Your brand"
		})
	] });
}
/** Brand Identity Design: a mark drawn out of its construction geometry. */
function BrandIdentity() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 100",
		className: "absolute inset-0 h-full w-full",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id: "scene-identity-fill",
				x1: "0",
				x2: "1",
				y1: "0",
				y2: "1",
				children: [
					/* @__PURE__ */ jsx("stop", {
						offset: "0",
						stopColor: PURPLE
					}),
					/* @__PURE__ */ jsx("stop", {
						offset: "0.55",
						stopColor: BLUE
					}),
					/* @__PURE__ */ jsx("stop", {
						offset: "1",
						stopColor: CYAN
					})
				]
			}) }),
			[
				"M50 14 A30 30 0 1 1 49.9 14",
				"M36 30 A16 16 0 1 1 35.9 30",
				"M64 30 A16 16 0 1 1 63.9 30",
				"M20 76 H80",
				"M50 8 V86",
				"M22 18 L78 74"
			].map((d, index) => /* @__PURE__ */ jsx("path", {
				d,
				pathLength: "1",
				className: "scene-draw scene-guide",
				style: t(7, index * .18)
			}, d)),
			/* @__PURE__ */ jsx("path", {
				d: "M30 76 V50 A20 20 0 0 1 70 50 V76 H58 V52 A8 8 0 0 0 42 52 V76 Z",
				fill: "url(#scene-identity-fill)",
				className: "scene-in",
				style: {
					...t(7, 1.6),
					transformOrigin: "50% 60%"
				}
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "26",
				r: "5",
				fill: CYAN,
				className: "scene-in",
				style: {
					...t(7, 1.9),
					transformOrigin: "50% 26%"
				}
			})
		]
	}), /* @__PURE__ */ jsx("div", {
		className: "absolute bottom-[5cqw] left-1/2 flex -translate-x-1/2 gap-[2cqw]",
		children: SWATCHES.map((color, index) => /* @__PURE__ */ jsx("span", {
			className: "scene-in h-[5cqw] w-[9cqw] rounded-[1.2cqw]",
			style: {
				background: color,
				...t(7, 2.2 + index * .15)
			}
		}, color))
	})] });
}
/** Rebranding: the old identity wiped away to reveal the new one. */
function Rebranding() {
	const card = "absolute left-[12cqw] top-[20cqw] h-[56cqw] w-[76cqw] overflow-hidden rounded-[3cqw] p-[5cqw]";
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: `${card} scene-old`,
			children: [
				/* @__PURE__ */ jsx(Label, { children: "Before" }),
				/* @__PURE__ */ jsx("p", {
					className: "mt-[5cqw] font-serif text-[16cqw] leading-none",
					children: "Aa"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-[5cqw] flex gap-[2cqw]",
					children: [
						"#8c8577",
						"#b3ab9c",
						"#d8d2c4"
					].map((color) => /* @__PURE__ */ jsx("span", {
						className: "h-[6cqw] flex-1 rounded-[0.6cqw]",
						style: { background: color }
					}, color))
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `${card} scene-new scene-wipe`,
			style: t(6),
			children: [
				/* @__PURE__ */ jsx(Label, {
					className: "!text-white/70",
					children: "After"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-[5cqw] font-display text-[16cqw] font-extrabold leading-none text-white",
					children: "Aa"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-[5cqw] flex gap-[2cqw]",
					children: SWATCHES.map((color) => /* @__PURE__ */ jsx("span", {
						className: "h-[6cqw] flex-1 rounded-[1.4cqw] border border-white/40",
						style: { background: color }
					}, color))
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "scene-wipe-handle absolute top-[16cqw] h-[64cqw] w-[0.6cqw] rounded-full bg-white",
			style: {
				left: "12cqw",
				...t(6)
			},
			children: /* @__PURE__ */ jsx("span", {
				className: "absolute left-1/2 top-1/2 grid h-[6cqw] w-[6cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[3cqw] font-bold text-[#08080a]",
				children: "⇆"
			})
		})
	] });
}
/** Packaging Design: a branded box turning on its plinth. */
function Packaging() {
	const w = 34;
	const h = 42;
	const d = 22;
	const face = "absolute left-1/2 top-1/2 overflow-hidden";
	const faces = [
		{
			width: w,
			height: h,
			transform: `translate(-50%, -50%) translateZ(${d / 2}cqw)`,
			front: true
		},
		{
			width: w,
			height: h,
			transform: `translate(-50%, -50%) rotateY(180deg) translateZ(${d / 2}cqw)`
		},
		{
			width: d,
			height: h,
			transform: `translate(-50%, -50%) rotateY(90deg) translateZ(${w / 2}cqw)`,
			side: true
		},
		{
			width: d,
			height: h,
			transform: `translate(-50%, -50%) rotateY(-90deg) translateZ(${w / 2}cqw)`,
			side: true
		},
		{
			width: w,
			height: d,
			transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${h / 2}cqw)`,
			top: true
		}
	];
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("div", { className: "scene-plinth absolute bottom-[14cqw] left-1/2 h-[8cqw] w-[56cqw] -translate-x-1/2 rounded-[50%]" }),
		/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0",
			style: { perspective: "140cqw" },
			children: /* @__PURE__ */ jsx("div", {
				className: "absolute inset-0",
				style: {
					transformStyle: "preserve-3d",
					transform: "translateY(-2cqw) rotateX(-16deg)"
				},
				children: /* @__PURE__ */ jsx("div", {
					className: "scene-turntable absolute inset-0",
					style: {
						transformStyle: "preserve-3d",
						...t(14)
					},
					children: faces.map((f, index) => /* @__PURE__ */ jsx("div", {
						className: face,
						style: {
							width: `${f.width}cqw`,
							height: `${f.height}cqw`,
							transform: f.transform,
							background: f.top ? `linear-gradient(135deg, ${BLUE}, ${CYAN})` : f.side ? `linear-gradient(180deg, ${BLUE}, ${PURPLE})` : `linear-gradient(160deg, ${PURPLE}, ${BLUE} 60%, ${CYAN})`,
							border: "1px solid rgba(255,255,255,0.25)"
						},
						children: !f.top && /* @__PURE__ */ jsxs("div", {
							className: "flex h-full flex-col justify-between p-[3cqw] text-white",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[2.2cqw] font-bold uppercase tracking-[0.2em] opacity-80",
									children: "No. 01"
								}),
								!f.side && /* @__PURE__ */ jsx("span", {
									className: "font-display text-[7cqw] font-extrabold leading-none",
									children: "Bloom"
								}),
								/* @__PURE__ */ jsx("span", { className: "h-[1cqw] w-[60%] rounded-full bg-white/60" })
							]
						})
					}, index))
				})
			})
		}),
		/* @__PURE__ */ jsx(Label, {
			className: "absolute bottom-[5cqw] left-1/2 -translate-x-1/2",
			children: "Dieline · 340 × 420 × 220"
		})
	] });
}
/** Motion Branding: a shape on its curve, keyed on a timeline. */
function MotionBranding() {
	const tracks = [
		{
			label: "Position",
			keys: [
				4,
				40,
				88
			],
			color: PURPLE
		},
		{
			label: "Rotate",
			keys: [4, 64],
			color: BLUE
		},
		{
			label: "Scale",
			keys: [
				20,
				52,
				88
			],
			color: CYAN
		}
	];
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 100 100",
			className: "absolute inset-0 h-full w-full",
			children: /* @__PURE__ */ jsx("path", {
				d: "M12 46 C34 46 30 14 52 14 S72 46 88 46",
				className: "scene-guide",
				strokeDasharray: "1.5 1.5"
			})
		}),
		/* @__PURE__ */ jsx("span", {
			className: "scene-motion-shape absolute left-[12cqw] top-[46cqw] h-[9cqw] w-[9cqw] rounded-[2.4cqw]",
			style: {
				background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
				boxShadow: `0 0 5cqw ${BLUE}88`,
				...t(4)
			}
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "bottom-[6cqw] left-[6cqw] right-[6cqw] h-[30cqw] p-[3cqw]",
			children: /* @__PURE__ */ jsxs("div", {
				className: "relative h-full",
				children: [tracks.map((track) => /* @__PURE__ */ jsxs("div", {
					className: "flex h-1/3 items-center gap-[2cqw]",
					children: [/* @__PURE__ */ jsx(Label, {
						className: "w-[16cqw] shrink-0",
						children: track.label
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative h-full flex-1",
						children: [/* @__PURE__ */ jsx("div", { className: "scene-bone absolute inset-x-0 top-1/2 !h-[0.4cqw] -translate-y-1/2" }), track.keys.map((key) => /* @__PURE__ */ jsx("span", {
							className: "absolute top-1/2 h-[2.6cqw] w-[2.6cqw] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[0.4cqw]",
							style: {
								left: `${key}%`,
								background: track.color
							}
						}, key))]
					})]
				}, track.label)), /* @__PURE__ */ jsx("div", {
					className: "absolute bottom-0 left-[18cqw] right-0 top-0",
					children: /* @__PURE__ */ jsx("span", {
						className: "scene-playhead absolute bottom-0 top-0 w-[0.5cqw] rounded-full bg-white",
						style: t(4)
					})
				})]
			})
		})
	] });
}
/** Brand Guidelines: the book open, its pages turning. */
function BrandGuidelines() {
	const page = "absolute top-[16cqw] h-[64cqw] w-[38cqw] p-[4cqw]";
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsxs(Panel, {
			className: `${page} left-[11cqw] !rounded-r-none`,
			children: [
				/* @__PURE__ */ jsx(Label, { children: "01 · Logo" }),
				/* @__PURE__ */ jsx("div", {
					className: "mt-[6cqw] grid aspect-square w-full place-items-center border border-dashed border-[var(--field-line)]",
					children: /* @__PURE__ */ jsx("span", {
						className: "h-[12cqw] w-[12cqw] rounded-tl-[12cqw]",
						style: { background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})` }
					})
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "80%",
					className: "mt-[4cqw]"
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "56%",
					className: "mt-[2cqw]"
				})
			]
		}),
		/* @__PURE__ */ jsxs(Panel, {
			className: `${page} left-[51cqw] !rounded-l-none`,
			children: [/* @__PURE__ */ jsx(Label, { children: "02 · Colour" }), /* @__PURE__ */ jsx("div", {
				className: "mt-[5cqw] space-y-[2.4cqw]",
				children: SWATCHES.map((color) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-[2cqw]",
					children: [/* @__PURE__ */ jsx("span", {
						className: "h-[8cqw] w-[8cqw] rounded-[1.4cqw]",
						style: { background: color }
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[2.4cqw] font-bold uppercase tracking-[0.08em] text-[var(--ink-faint)]",
						children: color
					})]
				}, color))
			})]
		}),
		/* @__PURE__ */ jsxs(Panel, {
			className: `${page} scene-page-turn left-[51cqw] !rounded-l-none`,
			style: t(6),
			children: [
				/* @__PURE__ */ jsx(Label, { children: "03 · Type" }),
				/* @__PURE__ */ jsx("p", {
					className: "mt-[5cqw] font-display text-[14cqw] font-extrabold leading-none text-[var(--ink-strong)]",
					children: "Aa"
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "90%",
					className: "mt-[5cqw]"
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "70%",
					className: "mt-[2cqw]"
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "80%",
					className: "mt-[2cqw]"
				})
			]
		})
	] });
}
/** Website UI/UX Design: one layout reflowing from desktop to tablet. */
function WebsiteDesign() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
		className: "absolute left-1/2 top-[6cqw] -translate-x-1/2",
		children: [/* @__PURE__ */ jsx("span", {
			className: "scene-swap-a scene-chip absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
			style: t(6),
			children: "Desktop · 1440"
		}), /* @__PURE__ */ jsx("span", {
			className: "scene-swap-b scene-chip absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
			style: t(6),
			children: "Tablet · 768"
		})]
	}), /* @__PURE__ */ jsxs(Panel, {
		className: "scene-viewport left-1/2 top-[16cqw] h-[72cqw] -translate-x-1/2 overflow-hidden p-[3cqw]",
		style: t(6),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-[3cqw] flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("span", {
					className: "h-[2.4cqw] w-[10cqw] rounded-full",
					style: { background: COLORS.gradient }
				}), /* @__PURE__ */ jsx("div", {
					className: "flex gap-[1.6cqw]",
					children: [
						6,
						6,
						6
					].map((width, index) => /* @__PURE__ */ jsx(Bone, { width: `${width}cqw` }, index))
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "h-[16cqw] rounded-[2cqw]",
				style: { background: `linear-gradient(120deg, ${PURPLE}66, ${BLUE}55 55%, ${CYAN}44)` }
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-[3cqw] flex flex-wrap gap-[2cqw]",
				children: [
					0,
					1,
					2
				].map((index) => /* @__PURE__ */ jsxs("div", {
					className: "scene-card min-w-[20cqw] flex-1 rounded-[1.6cqw] p-[2cqw]",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "block h-[6cqw] rounded-[1cqw]",
							style: { background: `${SWATCHES[index]}55` }
						}),
						/* @__PURE__ */ jsx(Bone, {
							width: "80%",
							className: "mt-[1.6cqw]"
						}),
						/* @__PURE__ */ jsx(Bone, {
							width: "55%",
							className: "mt-[1.2cqw]"
						})
					]
				}, index))
			})
		]
	})] });
}
/** Mobile App UI/UX: a phone flicking through its screens on tap. */
function MobileApp() {
	const screens = [
		/* @__PURE__ */ jsxs("div", {
			className: "space-y-[2cqw]",
			children: [/* @__PURE__ */ jsx(Bone, {
				width: "50%",
				className: "!h-[2.4cqw]"
			}), [
				PURPLE,
				BLUE,
				CYAN,
				BLUE
			].map((color, index) => /* @__PURE__ */ jsxs("div", {
				className: "scene-card flex items-center gap-[2cqw] rounded-[1.6cqw] p-[1.6cqw]",
				children: [/* @__PURE__ */ jsx("span", {
					className: "h-[5cqw] w-[5cqw] shrink-0 rounded-full",
					style: { background: color }
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex-1 space-y-[1cqw]",
					children: [/* @__PURE__ */ jsx(Bone, { width: "80%" }), /* @__PURE__ */ jsx(Bone, { width: "50%" })]
				})]
			}, index))]
		}, "list"),
		/* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsx("div", {
				className: "h-[22cqw] rounded-[2cqw]",
				style: { background: `linear-gradient(140deg, ${PURPLE}, ${BLUE} 60%, ${CYAN})` }
			}),
			/* @__PURE__ */ jsx(Bone, {
				width: "70%",
				className: "mt-[3cqw] !h-[2.4cqw]"
			}),
			/* @__PURE__ */ jsx(Bone, {
				width: "90%",
				className: "mt-[2cqw]"
			}),
			/* @__PURE__ */ jsx(Bone, {
				width: "60%",
				className: "mt-[1.4cqw]"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "mt-[4cqw] block h-[5.4cqw] rounded-full",
				style: { background: COLORS.gradient }
			})
		] }, "detail"),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "mt-[2cqw] h-[12cqw] w-[12cqw] rounded-full",
					style: { background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "50%",
					className: "mt-[3cqw] !h-[2.4cqw]"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-[4cqw] grid w-full grid-cols-3 gap-[1.6cqw]",
					children: Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ jsx("span", {
						className: "aspect-square rounded-[1.2cqw]",
						style: { background: `${SWATCHES[index % 3]}55` }
					}, index))
				})
			]
		}, "profile")
	];
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
		className: "scene-phone absolute left-[28cqw] top-[8cqw] h-[84cqw] w-[42cqw] overflow-hidden rounded-[6cqw] p-[2.4cqw]",
		children: [
			/* @__PURE__ */ jsx("div", { className: "mx-auto mb-[2cqw] h-[1.6cqw] w-[12cqw] rounded-full bg-[var(--field-line)]" }),
			/* @__PURE__ */ jsx("div", {
				className: "relative h-[calc(100%-4cqw)] overflow-hidden",
				children: /* @__PURE__ */ jsx("div", {
					className: "scene-carousel flex h-full w-[300%]",
					style: t(9),
					children: screens.map((screen, index) => /* @__PURE__ */ jsx("div", {
						className: "h-full w-1/3 px-[1cqw]",
						children: screen
					}, index))
				})
			}),
			/* @__PURE__ */ jsx("span", {
				className: "scene-ping absolute bottom-[14cqw] left-1/2 h-[6cqw] w-[6cqw] -translate-x-1/2 rounded-full border-2 border-white",
				style: t(3)
			})
		]
	}), /* @__PURE__ */ jsxs(Panel, {
		className: "scene-float right-[6cqw] top-[22cqw] flex w-[30cqw] items-center gap-[2cqw] p-[2.4cqw]",
		style: t(5),
		children: [/* @__PURE__ */ jsx("span", {
			className: "h-[5cqw] w-[5cqw] shrink-0 rounded-full",
			style: { background: CYAN }
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex-1 space-y-[1cqw]",
			children: [/* @__PURE__ */ jsx(Bone, { width: "90%" }), /* @__PURE__ */ jsx(Bone, { width: "60%" })]
		})]
	})] });
}
/** SaaS Product Design: a dashboard filling with live data. */
function SaasProduct() {
	return /* @__PURE__ */ jsxs(Panel, {
		className: "inset-[6cqw] flex overflow-hidden",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "w-[18cqw] shrink-0 space-y-[2.4cqw] border-r border-[var(--line)] p-[3cqw]",
			children: [/* @__PURE__ */ jsx("span", {
				className: "block h-[3cqw] w-[10cqw] rounded-full",
				style: { background: COLORS.gradient }
			}), [
				80,
				64,
				72,
				56
			].map((width, index) => /* @__PURE__ */ jsx(Bone, {
				width: `${width}%`,
				style: index === 1 ? { background: `${BLUE}aa` } : void 0
			}, index))]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex-1 p-[3cqw]",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-3 gap-[2cqw]",
					children: [
						["24.8k", PURPLE],
						["+18%", BLUE],
						["92%", CYAN]
					].map(([value, color], index) => /* @__PURE__ */ jsxs("div", {
						className: "scene-card scene-in rounded-[1.6cqw] p-[2cqw]",
						style: t(7, index * .15),
						children: [/* @__PURE__ */ jsx(Bone, { width: "60%" }), /* @__PURE__ */ jsx("p", {
							className: "mt-[1.6cqw] font-display text-[4.6cqw] font-bold leading-none",
							style: { color },
							children: value
						})]
					}, value))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "scene-card mt-[2.4cqw] flex h-[26cqw] items-end gap-[1.8cqw] rounded-[1.6cqw] p-[2.4cqw]",
					children: [
						38,
						62,
						46,
						80,
						58,
						92,
						70
					].map((height, index) => /* @__PURE__ */ jsx("span", {
						className: "scene-grow-y flex-1 rounded-t-[0.8cqw]",
						style: {
							height: `${height}%`,
							background: `linear-gradient(180deg, ${CYAN}, ${PURPLE})`,
							...t(7, .5 + index * .08)
						}
					}, index))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "scene-card mt-[2.4cqw] h-[18cqw] rounded-[1.6cqw] p-[2cqw]",
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 100 22",
						preserveAspectRatio: "none",
						className: "h-full w-full",
						children: /* @__PURE__ */ jsx("path", {
							d: "M0 18 C12 17 16 10 28 11 S46 19 58 12 S80 3 100 5",
							pathLength: "1",
							className: "scene-draw",
							fill: "none",
							stroke: BLUE,
							strokeWidth: "1.2",
							strokeLinecap: "round",
							style: t(7, 1.2)
						})
					})
				})
			]
		})]
	});
}
/** UX Research & Strategy: a journey map and the notes behind it. */
function UxResearch() {
	const stages = [
		"Discover",
		"Try",
		"Buy",
		"Return"
	];
	const notes = [
		[
			10,
			PURPLE,
			-4
		],
		[
			30,
			BLUE,
			3
		],
		[
			50,
			CYAN,
			-2
		],
		[
			70,
			PURPLE,
			4
		]
	];
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs(Panel, {
		className: "left-[6cqw] right-[6cqw] top-[6cqw] h-[54cqw] p-[3cqw]",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-[2cqw]",
				children: [/* @__PURE__ */ jsx("span", {
					className: "h-[6cqw] w-[6cqw] rounded-full",
					style: { background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})` }
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-[1cqw]",
					children: [/* @__PURE__ */ jsx(Bone, { width: "18cqw" }), /* @__PURE__ */ jsx(Bone, { width: "12cqw" })]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-[3cqw] grid grid-cols-4",
				children: stages.map((stage) => /* @__PURE__ */ jsx(Label, {
					className: "text-center",
					children: stage
				}, stage))
			}),
			/* @__PURE__ */ jsxs("svg", {
				viewBox: "0 0 100 30",
				preserveAspectRatio: "none",
				className: "mt-[1cqw] h-[24cqw] w-full",
				children: [
					[
						25,
						50,
						75
					].map((x) => /* @__PURE__ */ jsx("line", {
						x1: x,
						x2: x,
						y1: "0",
						y2: "30",
						className: "scene-guide"
					}, x)),
					/* @__PURE__ */ jsx("path", {
						d: "M12 20 C20 7 30 6 38 10 S55 27 62 24 S80 4 88 6",
						pathLength: "1",
						className: "scene-draw",
						fill: "none",
						stroke: "url(#scene-ux-line)",
						strokeWidth: "1.2",
						strokeLinecap: "round",
						style: t(7)
					}),
					/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
						id: "scene-ux-line",
						x1: "0",
						x2: "1",
						y1: "0",
						y2: "0",
						children: [/* @__PURE__ */ jsx("stop", {
							offset: "0",
							stopColor: PURPLE
						}), /* @__PURE__ */ jsx("stop", {
							offset: "1",
							stopColor: CYAN
						})]
					}) })
				]
			})
		]
	}), notes.map(([x, color, rotate], index) => /* @__PURE__ */ jsxs("div", {
		className: "scene-in absolute top-[66cqw] h-[20cqw] w-[18cqw] rounded-[1cqw] p-[2cqw]",
		style: {
			left: `${x}cqw`,
			rotate: `${rotate}deg`,
			background: `${color}33`,
			border: `1px solid ${color}88`,
			...t(7, 1.4 + index * .25)
		},
		children: [
			/* @__PURE__ */ jsx(Bone, { width: "90%" }),
			/* @__PURE__ */ jsx(Bone, {
				width: "70%",
				className: "mt-[1.4cqw]"
			}),
			/* @__PURE__ */ jsx(Bone, {
				width: "80%",
				className: "mt-[1.4cqw]"
			})
		]
	}, x))] });
}
/** Wireframing & Prototyping: screens wired together into a flow. */
function Wireframing() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 100 100",
			className: "absolute inset-0 h-full w-full",
			children: [
				/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", {
					id: "scene-arrow",
					viewBox: "0 0 6 6",
					refX: "5",
					refY: "3",
					markerWidth: "4",
					markerHeight: "4",
					orient: "auto",
					children: /* @__PURE__ */ jsx("path", {
						d: "M0 0 L6 3 L0 6 Z",
						fill: CYAN
					})
				}) }),
				/* @__PURE__ */ jsx("path", {
					d: "M22 68 C26 80 32 80 36 66",
					pathLength: "1",
					className: "scene-draw scene-flow",
					markerEnd: "url(#scene-arrow)",
					style: t(6, .4)
				}),
				/* @__PURE__ */ jsx("path", {
					d: "M55 40 C60 30 64 32 67 42",
					pathLength: "1",
					className: "scene-draw scene-flow",
					markerEnd: "url(#scene-arrow)",
					style: t(6, 1.4)
				})
			]
		}),
		[
			[6, 22],
			[37, 12],
			[68, 30]
		].map(([x, y], index) => /* @__PURE__ */ jsxs(Panel, {
			className: "scene-active h-[50cqw] w-[26cqw] p-[2cqw]",
			style: {
				left: `${x}cqw`,
				top: `${y}cqw`,
				...t(6, index * 1)
			},
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex h-[12cqw] items-center justify-center border border-dashed border-[var(--field-line)]",
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 10 10",
						className: "h-[6cqw] w-[6cqw]",
						children: /* @__PURE__ */ jsx("path", {
							d: "M0 0 L10 10 M10 0 L0 10",
							className: "scene-guide"
						})
					})
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "80%",
					className: "mt-[2cqw]"
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "60%",
					className: "mt-[1.4cqw]"
				}),
				/* @__PURE__ */ jsx(Bone, {
					width: "70%",
					className: "mt-[1.4cqw]"
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mt-[3cqw] block h-[4.4cqw] rounded-full border border-dashed",
					style: { borderColor: index === 0 ? CYAN : "var(--field-line)" }
				})
			]
		}, x)),
		/* @__PURE__ */ jsx("span", {
			className: "scene-ping absolute left-[19cqw] top-[64cqw] h-[5cqw] w-[5cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
			style: {
				borderColor: CYAN,
				...t(2, 0)
			}
		})
	] });
}
/** Design System: tokens and components snapping into a library. */
function DesignSystem() {
	const tile = "scene-panel scene-in absolute p-[2.6cqw]";
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: `${tile} left-[6cqw] top-[6cqw] h-[26cqw] w-[42cqw]`,
			style: t(7, 0),
			children: [/* @__PURE__ */ jsx(Label, { children: "Colour" }), /* @__PURE__ */ jsx("div", {
				className: "mt-[2.4cqw] flex gap-[1.6cqw]",
				children: [
					...SWATCHES,
					"#f7f7f5",
					"#121216"
				].map((color) => /* @__PURE__ */ jsx("span", {
					className: "h-[8cqw] flex-1 rounded-[1.2cqw] border border-[var(--line)]",
					style: { background: color }
				}, color))
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `${tile} left-[52cqw] top-[6cqw] h-[26cqw] w-[42cqw]`,
			style: t(7, .2),
			children: [/* @__PURE__ */ jsx(Label, { children: "Type" }), /* @__PURE__ */ jsxs("div", {
				className: "mt-[1.6cqw] flex items-end gap-[2.4cqw] font-display font-bold leading-none text-[var(--ink-strong)]",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[11cqw]",
						children: "Aa"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[7cqw]",
						children: "Aa"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[4.4cqw]",
						children: "Aa"
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `${tile} left-[6cqw] top-[36cqw] h-[26cqw] w-[42cqw]`,
			style: t(7, .4),
			children: [
				/* @__PURE__ */ jsx(Label, { children: "Buttons" }),
				/* @__PURE__ */ jsx("span", {
					className: "mt-[2.4cqw] block h-[6cqw] rounded-full",
					style: { background: COLORS.gradient }
				}),
				/* @__PURE__ */ jsx("span", { className: "mt-[1.8cqw] block h-[6cqw] rounded-full border border-[var(--field-line)]" })
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `${tile} left-[52cqw] top-[36cqw] h-[26cqw] w-[42cqw]`,
			style: t(7, .6),
			children: [/* @__PURE__ */ jsx(Label, { children: "Controls" }), /* @__PURE__ */ jsxs("div", {
				className: "mt-[3cqw] flex items-center gap-[4cqw]",
				children: [/* @__PURE__ */ jsx("span", {
					className: "relative h-[6cqw] w-[11cqw] rounded-full",
					style: { background: `${BLUE}55` },
					children: /* @__PURE__ */ jsx("span", {
						className: "scene-toggle absolute left-[0.8cqw] top-[0.8cqw] h-[4.4cqw] w-[4.4cqw] rounded-full bg-white",
						style: t(3)
					})
				}), /* @__PURE__ */ jsx("span", {
					className: "grid h-[6cqw] w-[6cqw] place-items-center rounded-[1.4cqw]",
					style: { background: CYAN },
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 10 10",
						className: "h-[4cqw] w-[4cqw]",
						children: /* @__PURE__ */ jsx("path", {
							d: "M2 5.4 L4.2 7.4 L8 3",
							pathLength: "1",
							fill: "none",
							stroke: "#08080a",
							strokeWidth: "1.4",
							strokeLinecap: "round",
							className: "scene-draw",
							style: t(3)
						})
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `${tile} left-[6cqw] top-[66cqw] h-[26cqw] w-[88cqw]`,
			style: t(7, .8),
			children: [/* @__PURE__ */ jsx(Label, { children: "Input" }), /* @__PURE__ */ jsxs("div", {
				className: "mt-[2.4cqw] flex h-[8cqw] items-center rounded-[1.6cqw] border border-[var(--field-line)] px-[2.4cqw]",
				children: [/* @__PURE__ */ jsx(Bone, { width: "30%" }), /* @__PURE__ */ jsx("span", {
					className: "scene-caret ml-[1cqw] h-[4cqw] w-[0.5cqw] rounded-full",
					style: { background: CYAN }
				})]
			})]
		})
	] });
}
var SCENES = {
	"brand-strategy": BrandStrategy,
	"brand-identity-design": BrandIdentity,
	rebranding: Rebranding,
	"packaging-design": Packaging,
	"motion-branding": MotionBranding,
	"brand-guidelines": BrandGuidelines,
	"website-ui-ux-design": WebsiteDesign,
	"mobile-app-ui-ux": MobileApp,
	"saas-product-design": SaasProduct,
	"ux-research-strategy": UxResearch,
	"wireframing-prototyping": Wireframing,
	"design-system": DesignSystem
};
/**
* The animated scene for one sub-service, showing the work itself rather
* than a photograph of it: Brand Strategy plots a positioning map, Packaging
* turns a branded box, Design System snaps components into a library, and so
* on. A slug with no scene of its own falls back to the design-system one.
*
* Every length is `cqw` of the scene, so it scales with its frame. The loops
* are CSS (`.scene-*` in app.css) and park while the scene is off screen or
* the tab is hidden; reduced motion renders each scene as its settled frame.
*
* @param {{ slug: string, still?: boolean, className?: string }} props
*/
function ServiceScene({ slug, still = false, className = "" }) {
	const ref = useRef(null);
	const [paused, setPaused] = useState(false);
	const Scene = SCENES[slug] ?? DesignSystem;
	useEffect(() => {
		const node = ref.current;
		if (!node || typeof IntersectionObserver === "undefined") return void 0;
		let onScreen = true;
		const sync = () => setPaused(!onScreen || document.hidden);
		const io = new IntersectionObserver(([entry]) => {
			onScreen = entry.isIntersecting;
			sync();
		});
		io.observe(node);
		document.addEventListener("visibilitychange", sync);
		return () => {
			io.disconnect();
			document.removeEventListener("visibilitychange", sync);
		};
	}, []);
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: `scene ${still ? "scene--still" : ""} ${className}`.replace(/\s+/g, " ").trim(),
		"data-paused": paused || void 0,
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx(Scene, {})
	});
}
//#endregion
export { ServiceScene as t };
