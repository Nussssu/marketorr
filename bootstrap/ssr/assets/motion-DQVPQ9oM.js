//#region resources/js/lib/motion.js
var EASE = [
	.22,
	1,
	.36,
	1
];
/**
* A short, transform-only zoom-out used by every portfolio hero visual.
* The media starts slightly oversized, then settles at its exact rendered
* size without changing layout or waiting for image/video decoding.
*/
var heroMediaEntrance = (disabled = false) => ({
	initial: disabled ? false : { scale: 1.18 },
	animate: { scale: 1 },
	transition: {
		duration: disabled ? 0 : .95,
		delay: disabled ? 0 : .06,
		ease: [...EASE]
	}
});
/**
* A CSS-driven entrance (see `.enter` in app.css): the class and timing
* variables for one element. Used above the fold, where a server-rendered page
* must start its opening moves on first paint rather than after hydration.
*
* @param {'fade-up'|'mask-up'|'scale-x'|'grow-y'|'settle'|'lift'} kind
* @param {{ dur?: number, delay?: number, y?: number|string, to?: number, scale?: number, className?: string, style?: object }} [options]
*   `dur`/`delay` in seconds; `y` in px (or any CSS length); `to` is the end
*   opacity; `scale` the starting scale of a lift.
* @return {{ className: string, style: object }}
*/
var enter = (kind, { dur = .4, delay = 0, y, to, scale, className = "", style = {} } = {}) => ({
	className: `enter enter--${kind} ${className}`.trim(),
	style: {
		"--enter-dur": `${dur}s`,
		"--enter-delay": `${delay}s`,
		...y !== void 0 ? { "--enter-y": typeof y === "number" ? `${y}px` : y } : {},
		...to !== void 0 ? { "--enter-to": to } : {},
		...scale !== void 0 ? { "--enter-scale": scale } : {},
		...style
	}
});
//#endregion
export { enter as n, heroMediaEntrance as r, EASE as t };
