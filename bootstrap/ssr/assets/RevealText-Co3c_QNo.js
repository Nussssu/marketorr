import { t as EASE } from "./motion-DQVPQ9oM.js";
import { jsx } from "react/jsx-runtime";
import { motion, useReducedMotion } from "framer-motion";
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
export { RevealText as t };
