import { f as Select, n as Button, o as Field, s as Input } from "./ui-Dz4ZqU85.js";
import { useForm } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/admin/CodeEditor.jsx
/**
* Token rules per language, tried in order at each position. Each entry is
* [token class, pattern]; text no rule matches is left plain.
*/
var RULES = {
	js: [
		["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
		["string", /`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/y],
		["keyword", /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|class|extends|import|export|from|async|await|try|catch|finally|throw|delete|in|of|void|yield)\b/y],
		["literal", /\b(?:true|false|null|undefined|NaN|Infinity)\b|\b\d+(?:\.\d+)?\b/y],
		["fn", /\b[A-Za-z_$][\w$]*(?=\s*\()/y]
	],
	css: [
		["comment", /\/\*[\s\S]*?\*\//y],
		["string", /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/y],
		["keyword", /@[\w-]+/y],
		["property", /[\w-]+(?=\s*:(?!:))/y],
		["literal", /#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr)?\b/y],
		["fn", /[.#][\w-]+/y]
	],
	html: [
		["comment", /<!--[\s\S]*?-->/y],
		["tag", /<\/?[A-Za-z][\w:-]*|\/?>/y],
		["string", /"[^"]*"|'[^']*'/y],
		["property", /\b[\w:-]+(?==)/y]
	]
};
/** Mid-tone colours that stay readable on both the light and dark admin themes. */
var COLORS = {
	comment: "text-[#8b98a8] italic",
	string: "text-[#22a35a]",
	keyword: "text-[#a855f7]",
	literal: "text-[#e08a0b]",
	fn: "text-[#3b82f6]",
	property: "text-[#0ea5c6]",
	tag: "text-[#e0457b]"
};
function tokenize(code, language) {
	const rules = RULES[language] ?? [];
	const tokens = [];
	let plain = "";
	let index = 0;
	while (index < code.length) {
		let matched = null;
		for (const [kind, pattern] of rules) {
			pattern.lastIndex = index;
			const result = pattern.exec(code);
			if (result && result[0].length > 0) {
				matched = [kind, result[0]];
				break;
			}
		}
		if (matched) {
			if (plain) tokens.push([null, plain]);
			plain = "";
			tokens.push(matched);
			index += matched[1].length;
		} else {
			plain += code[index];
			index += 1;
		}
	}
	if (plain) tokens.push([null, plain]);
	return tokens;
}
var SHARED = "m-0 whitespace-pre break-normal p-3 font-mono text-[13px] leading-[1.6] [tab-size:2]";
/**
* A lightweight code editor: a plain textarea for editing (so typing, undo
* and paste behave natively) laid over a syntax-highlighted copy, with line
* numbers and Tab indenting. No code is ever executed here.
*
* @param {{ value: string, onChange: (value: string) => void, language: 'js'|'css'|'html', invalid?: boolean, rows?: number, readOnly?: boolean }} props
*/
function CodeEditor({ value, onChange, language, invalid = false, rows = 18, readOnly = false, fill = false, ...props }) {
	const highlightRef = useRef(null);
	const gutterRef = useRef(null);
	const tokens = useMemo(() => tokenize(value ?? "", language), [value, language]);
	const lineCount = Math.max((value ?? "").split("\n").length, 1);
	const syncScroll = (event) => {
		if (highlightRef.current) {
			highlightRef.current.scrollTop = event.target.scrollTop;
			highlightRef.current.scrollLeft = event.target.scrollLeft;
		}
		if (gutterRef.current) gutterRef.current.scrollTop = event.target.scrollTop;
	};
	const onKeyDown = (event) => {
		if (event.key !== "Tab" || readOnly) return;
		event.preventDefault();
		const { selectionStart, selectionEnd } = event.target;
		onChange(`${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`);
		requestAnimationFrame(() => event.target.setSelectionRange(selectionStart + 2, selectionStart + 2));
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `relative flex overflow-hidden rounded-lg border bg-[var(--bg)] focus-within:ring-1 ${invalid ? "border-[#ff6b6b] focus-within:ring-[#ff6b6b]" : "border-[var(--field-line)] focus-within:border-[var(--brand-3)] focus-within:ring-[var(--brand-3)]"}`,
		style: fill ? {
			flex: "1 1 0%",
			minHeight: `calc(${rows} * 1.6 * 13px + 1.5rem)`
		} : { height: `calc(${rows} * 1.6 * 13px + 1.5rem)` },
		children: [/* @__PURE__ */ jsx("div", {
			ref: gutterRef,
			className: "shrink-0 select-none overflow-hidden border-r border-[var(--line)] bg-[var(--surface)] py-3 text-right font-mono text-[12px] leading-[1.6] text-[var(--ink-faint)]",
			"aria-hidden": true,
			children: Array.from({ length: lineCount }, (_, i) => /* @__PURE__ */ jsx("div", {
				className: "px-2.5",
				style: { height: "calc(13px * 1.6)" },
				children: i + 1
			}, i))
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative min-w-0 flex-1",
			children: [/* @__PURE__ */ jsxs("pre", {
				ref: highlightRef,
				className: `${SHARED} pointer-events-none absolute inset-0 overflow-hidden text-[var(--ink)]`,
				"aria-hidden": true,
				children: [tokens.map(([kind, text], i) => kind ? /* @__PURE__ */ jsx("span", {
					className: COLORS[kind],
					children: text
				}, i) : text), "\n"]
			}), /* @__PURE__ */ jsx("textarea", {
				value,
				onChange: (event) => onChange(event.target.value),
				onScroll: syncScroll,
				onKeyDown,
				readOnly,
				spellCheck: false,
				autoCapitalize: "off",
				autoComplete: "off",
				autoCorrect: "off",
				wrap: "off",
				className: `${SHARED} absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-[var(--ink)] outline-none selection:bg-[var(--brand-2)]/25`,
				...props
			})]
		})]
	});
}
//#endregion
//#region resources/js/pages/Admin/CustomCode/SnippetModal.jsx
var PLACEHOLDER = "<!-- Paste the code exactly as the provider gives it, tags included. -->\n<script>\n  console.log(\"Hello from Marketorr\");\n<\/script>";
/**
* A real syntax check for the inline scripts, done by parsing without
* running: `new Function` compiles the code but never calls it. Script
* loaders (src=) and data blocks such as JSON-LD are skipped.
*/
function syntaxErrors(code) {
	const isInlineJs = (attributes) => !/\bsrc\s*=/i.test(attributes) && (!/\btype\s*=/i.test(attributes) || /\btype\s*=\s*["']?text\/javascript["']?/i.test(attributes));
	return [...code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter((match) => isInlineJs(match[1])).flatMap((match) => {
		try {
			new Function(match[2]);
			return [];
		} catch (error) {
			return [`JavaScript syntax error: ${error.message}`];
		}
	});
}
function xsrfToken() {
	const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : "";
}
/**
* The code as it is edited now that every snippet is added as written: an
* older CSS or JavaScript snippet gets the tag it used to be wrapped in, so
* saving it changes nothing on the site.
*/
function editableCode(snippet) {
	if (!snippet) return "";
	if (snippet.type === "css") return `<style>\n${snippet.code}\n</style>`;
	if (snippet.type === "js") return `<script>\n${snippet.code}\n<\/script>`;
	return snippet.code ?? "";
}
/**
* A dropdown of the site's pages with a tick box each, grouped and
* searchable; the chosen ones show underneath and can be taken off.
*/
function PagePicker({ options, value, onChange, invalid }) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const wrapper = useRef(null);
	useEffect(() => {
		if (!open) return void 0;
		const close = (event) => {
			if (!wrapper.current?.contains(event.target)) setOpen(false);
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [open]);
	const labels = useMemo(() => Object.fromEntries(options.flatMap((group) => group.items.map((item) => [item.path, item.label]))), [options]);
	const needle = query.trim().toLowerCase();
	const groups = options.map((group) => ({
		...group,
		items: group.items.filter((item) => !needle || item.label.toLowerCase().includes(needle) || item.path.includes(needle))
	})).filter((group) => group.items.length > 0);
	const toggle = (path) => onChange(value.includes(path) ? value.filter((entry) => entry !== path) : [...value, path]);
	return /* @__PURE__ */ jsxs("div", {
		ref: wrapper,
		className: "relative",
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setOpen((current) => !current),
				"aria-expanded": open,
				className: `flex w-full items-center justify-between gap-3 rounded-lg border bg-[var(--bg)] px-3 py-2.5 text-left text-[14px] text-[var(--ink)] ${invalid ? "border-[#ff6b6b]" : "border-[var(--field-line)]"}`,
				children: [/* @__PURE__ */ jsx("span", {
					className: value.length ? "" : "text-[var(--ink-faint)]",
					children: value.length ? `${value.length} page${value.length === 1 ? "" : "s"} selected` : "Select pages…"
				}), /* @__PURE__ */ jsx("svg", {
					"aria-hidden": "true",
					className: `h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`,
					viewBox: "0 0 12 12",
					fill: "none",
					children: /* @__PURE__ */ jsx("path", {
						d: "M2.5 4.5L6 8L9.5 4.5",
						stroke: "currentColor",
						strokeWidth: "1.75",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})
				})]
			}),
			open && /* @__PURE__ */ jsxs("div", {
				className: "absolute inset-x-0 top-full z-20 mt-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-2xl",
				children: [/* @__PURE__ */ jsx("div", {
					className: "border-b border-[var(--line)] p-2",
					children: /* @__PURE__ */ jsx(Input, {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search pages…",
						"aria-label": "Search pages",
						autoFocus: true
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "max-h-72 overflow-y-auto p-1",
					children: [groups.length === 0 && /* @__PURE__ */ jsx("p", {
						className: "px-3 py-4 text-center text-[12px] text-[var(--mute)]",
						children: "No page matches."
					}), groups.map((group) => /* @__PURE__ */ jsxs("div", {
						className: "py-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: group.group
						}), group.items.map((item) => /* @__PURE__ */ jsxs("label", {
							className: "flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 hover:bg-[var(--chip)]",
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: value.includes(item.path),
								onChange: () => toggle(item.path),
								className: "h-4 w-4 shrink-0 accent-[var(--brand-2)]"
							}), /* @__PURE__ */ jsxs("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block truncate text-[13px] text-[var(--ink)]",
									children: item.label
								}), /* @__PURE__ */ jsx("span", {
									className: "block truncate font-mono text-[11px] text-[var(--ink-faint)]",
									children: item.path
								})]
							})]
						}, item.path))]
					}, group.group))]
				})]
			}),
			value.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "mt-2 flex flex-wrap gap-1.5",
				children: value.map((path) => /* @__PURE__ */ jsxs("span", {
					className: "inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--chip)] py-1 pl-3 pr-1.5 text-[12px] text-[var(--ink)]",
					children: [/* @__PURE__ */ jsx("span", {
						className: "truncate",
						title: path,
						children: labels[path] ?? path
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => toggle(path),
						"aria-label": `Remove ${labels[path] ?? path}`,
						className: "flex h-4 w-4 items-center justify-center rounded-full text-[var(--ink-faint)] hover:text-[#ff6b6b]",
						children: "×"
					})]
				}, path))
			})
		]
	});
}
/**
* Add or edit a snippet in a popup over the list. The code goes into the
* page exactly as written, so <script> and <style> tags are pasted as they are.
*/
function SnippetModal({ snippet, locations, targets, pageOptions, onClose, Switch }) {
	const isEdit = Boolean(snippet);
	const statusRef = useRef(snippet?.status ?? "draft");
	const [checks, setChecks] = useState({
		errors: [],
		warnings: []
	});
	const { data, setData, post, put, processing, errors, isDirty, transform } = useForm({
		name: snippet?.name ?? "",
		location: snippet?.location ?? "head",
		code: editableCode(snippet),
		priority: snippet?.priority ?? 10,
		target: snippet?.target ?? "all",
		target_paths: snippet?.targetPaths ?? [],
		status: snippet?.status ?? "draft",
		enabled: snippet?.enabled ?? true
	});
	transform((current) => ({
		...current,
		status: statusRef.current
	}));
	useEffect(() => {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			const local = syntaxErrors(data.code);
			fetch("/admin/custom-code/check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"X-XSRF-TOKEN": xsrfToken()
				},
				body: JSON.stringify({
					type: "html",
					code: data.code
				}),
				signal: controller.signal
			}).then((response) => response.ok ? response.json() : {
				errors: [],
				warnings: []
			}).then((result) => setChecks({
				errors: [...local, ...result.errors],
				warnings: result.warnings
			})).catch((error) => {
				if (error?.name !== "AbortError") setChecks({
					errors: local,
					warnings: []
				});
			});
		}, 400);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [data.code]);
	useEffect(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = overflow;
		};
	}, [onClose]);
	const save = (status) => {
		statusRef.current = status;
		const options = {
			preserveScroll: true,
			onSuccess: () => onClose()
		};
		if (isEdit) put(`/admin/custom-code/${snippet.id}`, options);
		else post("/admin/custom-code", options);
	};
	const hasErrors = checks.errors.length > 0;
	const pathsError = errors.target_paths ?? errors[Object.keys(errors).find((key) => key.startsWith("target_paths."))];
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[190] flex items-center justify-center p-3 sm:p-6",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": isEdit ? `Edit ${snippet.name}` : "New snippet",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Close",
			onClick: onClose,
			className: "absolute inset-0 bg-black/60"
		}), /* @__PURE__ */ jsxs("form", {
			onSubmit: (event) => {
				event.preventDefault();
				save(data.status);
			},
			className: "relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "flex items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "font-display text-[15px] font-bold text-[var(--ink-strong)]",
						children: isEdit ? `Edit ${snippet.name}` : "New snippet"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-0.5 text-[12px] text-[var(--mute)]",
						children: isEdit ? `${snippet.live ? "Live on the site" : snippet.status === "published" ? "Published but switched off" : "Draft, not on the site"}` : "Drafts never run on the site; publish when the code is ready."
					})] }), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: "✕"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-5 lg:col-span-2",
						children: [/* @__PURE__ */ jsx(Field, {
							label: "Name",
							error: errors.name,
							required: true,
							children: /* @__PURE__ */ jsx(Input, {
								value: data.name,
								onChange: (e) => setData("name", e.target.value),
								placeholder: "Google Analytics"
							})
						}), /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsxs("p", {
								className: "mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
								children: ["Code ", /* @__PURE__ */ jsx("span", {
									className: "text-[#ff6b6b]",
									children: "*"
								})]
							}),
							/* @__PURE__ */ jsx(CodeEditor, {
								value: data.code,
								onChange: (value) => setData("code", value),
								language: "html",
								invalid: Boolean(errors.code) || hasErrors,
								placeholder: PLACEHOLDER,
								rows: 14,
								"aria-label": "Snippet code"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-[11px] text-[var(--ink-faint)]",
								children: "Added to the page exactly as written: paste full <script>…<\/script> or <style>…</style> tags."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-3 space-y-2",
								children: [
									errors.code && /* @__PURE__ */ jsx("p", {
										className: "text-[12px] text-[#ff6b6b]",
										children: errors.code
									}),
									checks.errors.map((message) => /* @__PURE__ */ jsxs("p", {
										className: "flex gap-2 rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-3 py-2 text-[12px] text-[#ff6b6b]",
										children: [/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											children: "✕"
										}), message]
									}, message)),
									checks.warnings.map((message) => /* @__PURE__ */ jsxs("p", {
										className: "flex gap-2 rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-2 text-[12px] text-[#d97706]",
										children: [/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											children: "!"
										}), message]
									}, message)),
									!hasErrors && checks.warnings.length === 0 && data.code.trim() !== "" && /* @__PURE__ */ jsxs("p", {
										className: "flex gap-2 text-[12px] text-[#16a34a]",
										children: [/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											children: "✓"
										}), "No problems found."]
									})
								]
							})
						] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] px-4 py-3",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-[13px] font-semibold text-[var(--ink)]",
									children: "Switched on"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-[var(--ink-faint)]",
									children: "Off keeps it saved but not running."
								})] }), /* @__PURE__ */ jsx(Switch, {
									checked: data.enabled,
									onChange: (value) => setData("enabled", value),
									label: "Switch this snippet on"
								})]
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Placement",
								error: errors.location,
								required: true,
								children: /* @__PURE__ */ jsx(Select, {
									value: data.location,
									onChange: (e) => setData("location", e.target.value),
									children: locations.map((location) => /* @__PURE__ */ jsx("option", {
										value: location.value,
										children: location.label
									}, location.value))
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Priority",
								error: errors.priority,
								required: true,
								hint: "Lower runs first within the same placement (0–999).",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									min: 0,
									max: 999,
									value: data.priority,
									onChange: (e) => setData("priority", e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Runs on",
								error: errors.target,
								required: true,
								children: /* @__PURE__ */ jsx(Select, {
									value: data.target,
									onChange: (e) => setData("target", e.target.value),
									children: targets.map((target) => /* @__PURE__ */ jsx("option", {
										value: target.value,
										children: target.label
									}, target.value))
								})
							}),
							data.target !== "all" && /* @__PURE__ */ jsx(Field, {
								label: data.target === "only" ? "Only on these pages" : "Not on these pages",
								error: pathsError,
								required: true,
								children: /* @__PURE__ */ jsx(PagePicker, {
									options: pageOptions,
									value: data.target_paths,
									onChange: (paths) => setData("target_paths", paths),
									invalid: Boolean(pathsError)
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("footer", {
					className: "flex flex-wrap items-center justify-end gap-3 border-t border-[var(--line)] px-6 py-4",
					children: [
						isDirty && /* @__PURE__ */ jsx("span", {
							className: "mr-auto text-[11px] text-[var(--mute)]",
							children: "Unsaved changes"
						}),
						/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: onClose,
							children: "Cancel"
						}),
						/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => save("draft"),
							disabled: processing,
							children: isEdit && snippet.status === "published" ? "Unpublish (save as draft)" : "Save as draft"
						}),
						/* @__PURE__ */ jsx(Button, {
							type: "button",
							onClick: () => save("published"),
							disabled: processing || hasErrors,
							title: hasErrors ? "Fix the errors in the code first" : void 0,
							children: processing && statusRef.current === "published" ? "Publishing…" : isEdit && snippet.status === "published" ? "Save & keep published" : "Publish"
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { SnippetModal as default };
