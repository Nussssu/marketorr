import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { c as PageHeader, f as Select, i as ConfirmDialog, l as Panel, n as Button, o as Field, s as Input, x as useConfirm } from "./ui-BFNViBV5.js";
import { Switch } from "./Index-D_lnWj0p.js";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
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
function CodeEditor({ value, onChange, language, invalid = false, rows = 18, readOnly = false, ...props }) {
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
		style: { height: `calc(${rows} * 1.6 * 13px + 1.5rem)` },
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
//#region resources/js/pages/Admin/CustomCode/Form.jsx
var PLACEHOLDERS = {
	css: "/* Only the rules: the <style> tag is added for you. */\n.hero-title {\n  letter-spacing: -0.02em;\n}",
	js: "// Only the code: the <script> tag is added for you.\nwindow.dataLayer = window.dataLayer || [];",
	html: "<!-- Paste the code exactly as the provider gives it, tags included. -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX\"><\/script>"
};
var TYPE_HINTS = {
	css: "Wrapped in a <style> tag.",
	js: "Wrapped in a <script> tag.",
	html: "Added exactly as written: use it for pixels, embeds and full <script> tags."
};
/**
* A real syntax check for JavaScript, done by parsing without running:
* `new Function` compiles the code but never calls it.
*/
function syntaxErrors(type, code) {
	const isInlineJs = (attributes) => !/\bsrc\s*=/i.test(attributes) && (!/\btype\s*=/i.test(attributes) || /\btype\s*=\s*["']?(text\/javascript|module)["']?/i.test(attributes));
	return (type === "js" ? [code] : type === "html" ? [...code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter((match) => isInlineJs(match[1]) && !/\btype\s*=\s*["']?module/i.test(match[1])).map((match) => match[2]) : []).flatMap((source) => {
		try {
			new Function(source);
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
function VersionModal({ version, language, onClose, onRestore }) {
	if (!version) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": `Version ${version.version}`,
			className: "w-full max-w-3xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl",
			onClick: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
					className: "font-display text-[14px] font-bold text-[var(--ink-strong)]",
					children: [
						"Version ",
						version.version,
						": ",
						version.note
					]
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-[12px] text-[var(--mute)]",
					children: [version.createdAt, version.user ? ` · ${version.user}` : ""]
				})] }), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					className: "rounded-lg px-2 py-1 text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]",
					"aria-label": "Close",
					children: "✕"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 p-5",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "text-[12px] text-[var(--mute)]",
						children: [
							version.snapshot.name,
							" · ",
							version.snapshot.type?.toUpperCase(),
							" · ",
							version.snapshot.location,
							" · priority ",
							version.snapshot.priority,
							" · ",
							version.snapshot.status,
							version.snapshot.enabled ? "" : " · off"
						]
					}),
					/* @__PURE__ */ jsx(CodeEditor, {
						value: version.snapshot.code ?? "",
						onChange: () => {},
						language: version.snapshot.type ?? language,
						readOnly: true,
						rows: 16,
						"aria-label": `Code in version ${version.version}`
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-3",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: onClose,
							children: "Close"
						}), /* @__PURE__ */ jsx(Button, {
							type: "button",
							onClick: () => onRestore(version),
							children: "Restore this version"
						})]
					})
				]
			})]
		})
	});
}
function CustomCodeForm({ snippet, versions, types, locations, targets }) {
	const isEdit = Boolean(snippet);
	const statusRef = useRef(snippet?.status ?? "draft");
	const [checks, setChecks] = useState({
		errors: [],
		warnings: []
	});
	const [viewing, setViewing] = useState(null);
	const [request, confirm, cancel, run] = useConfirm();
	const pageErrors = usePage().props.errors ?? {};
	const { data, setData, post, put, processing, errors, isDirty, transform } = useForm({
		name: snippet?.name ?? "",
		description: snippet?.description ?? "",
		type: snippet?.type ?? "html",
		location: snippet?.location ?? "head",
		code: snippet?.code ?? "",
		priority: snippet?.priority ?? 10,
		target: snippet?.target ?? "all",
		target_paths: snippet?.targetPaths?.length ? snippet.targetPaths : [""],
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
			const local = syntaxErrors(data.type, data.code);
			fetch("/admin/custom-code/check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"X-XSRF-TOKEN": xsrfToken()
				},
				body: JSON.stringify({
					type: data.type,
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
	}, [data.type, data.code]);
	const save = (status) => {
		statusRef.current = status;
		if (isEdit) put(`/admin/custom-code/${snippet.id}`, { preserveScroll: true });
		else post("/admin/custom-code");
	};
	const restore = (version) => {
		setViewing(null);
		confirm({
			title: `Restore version ${version.version}?`,
			body: `The snippet goes back to how it was ${version.createdAgo}, including its status and on/off state. Your current state stays in the history, so this can be undone.`,
			confirmLabel: "Restore",
			action: () => router.post(`/admin/custom-code/${snippet.id}/versions/${version.id}/restore`, {}, { preserveScroll: true })
		});
	};
	const askDelete = () => {
		confirm({
			title: `Delete “${snippet.name}”?`,
			body: "The snippet and its whole version history are deleted permanently.",
			confirmLabel: "Delete",
			action: () => router.delete(`/admin/custom-code/${snippet.id}`)
		});
	};
	const hasErrors = checks.errors.length > 0;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? `Edit ${snippet.name}` : "New snippet"} | Marketorr Admin` }),
		/* @__PURE__ */ jsxs(PageHeader, {
			title: isEdit ? snippet.name : "New snippet",
			subtitle: isEdit ? `${snippet.live ? "Live on the site" : snippet.status === "published" ? "Published but switched off" : "Draft, not on the site"} · last changed ${snippet.updatedAt}` : "Drafts never run on the site; publish when the code is ready.",
			children: [/* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/custom-code",
				variant: "secondary",
				children: "All snippets"
			}), isEdit && /* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "danger",
				onClick: askDelete,
				children: "Delete"
			})]
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: (event) => {
				event.preventDefault();
				save(data.status);
			},
			className: "grid gap-6 pb-24 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-6 lg:col-span-2",
				children: [/* @__PURE__ */ jsx(Panel, {
					title: "Snippet",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid gap-5 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "Name",
								error: errors.name,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.name,
									onChange: (e) => setData("name", e.target.value),
									placeholder: "Google Analytics"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Type",
								error: errors.type,
								required: true,
								hint: TYPE_HINTS[data.type],
								children: /* @__PURE__ */ jsx(Select, {
									value: data.type,
									onChange: (e) => setData("type", e.target.value),
									children: types.map((type) => /* @__PURE__ */ jsx("option", {
										value: type.value,
										children: type.label
									}, type.value))
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Description",
								error: errors.description,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Input, {
									value: data.description,
									onChange: (e) => setData("description", e.target.value),
									placeholder: "What it does and who asked for it"
								})
							})
						]
					})
				}), /* @__PURE__ */ jsxs(Panel, {
					title: "Code",
					description: "Highlighted as you type, and checked before it can be published. Nothing runs here.",
					children: [/* @__PURE__ */ jsx(CodeEditor, {
						value: data.code,
						onChange: (value) => setData("code", value),
						language: data.type,
						invalid: Boolean(errors.code) || hasErrors,
						placeholder: PLACEHOLDERS[data.type],
						"aria-label": "Snippet code"
					}), /* @__PURE__ */ jsxs("div", {
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
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Publishing",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between gap-3",
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
								/* @__PURE__ */ jsxs("div", {
									className: "grid gap-2",
									children: [
										/* @__PURE__ */ jsx(Button, {
											type: "button",
											onClick: () => save("published"),
											disabled: processing || hasErrors,
											title: hasErrors ? "Fix the errors in the code first" : void 0,
											children: processing && statusRef.current === "published" ? "Publishing…" : isEdit && snippet.status === "published" ? "Save & keep published" : "Publish"
										}),
										/* @__PURE__ */ jsx(Button, {
											type: "button",
											variant: "secondary",
											onClick: () => save("draft"),
											disabled: processing,
											children: isEdit && snippet.status === "published" ? "Unpublish (save as draft)" : "Save as draft"
										}),
										isDirty && /* @__PURE__ */ jsx("p", {
											className: "text-center text-[11px] text-[var(--mute)]",
											children: "Unsaved changes"
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Pages",
						description: "Paths like /about, or end with * to cover a section, e.g. /services/*.",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ jsx(Field, {
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
							}), data.target !== "all" && /* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [
									data.target_paths.map((path, index) => /* @__PURE__ */ jsxs("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ jsx(Input, {
											value: path,
											onChange: (e) => setData("target_paths", data.target_paths.map((entry, i) => i === index ? e.target.value : entry)),
											placeholder: "/services/*",
											"aria-label": `Page path ${index + 1}`,
											className: "font-mono text-[13px]"
										}), /* @__PURE__ */ jsx(Button, {
											type: "button",
											variant: "secondary",
											onClick: () => setData("target_paths", data.target_paths.filter((_, i) => i !== index)),
											disabled: data.target_paths.length === 1,
											"aria-label": "Remove path",
											children: "✕"
										})]
									}, index)),
									(errors.target_paths || Object.keys(errors).find((key) => key.startsWith("target_paths."))) && /* @__PURE__ */ jsx("p", {
										className: "text-[12px] text-[#ff6b6b]",
										children: errors.target_paths ?? errors[Object.keys(errors).find((key) => key.startsWith("target_paths."))]
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setData("target_paths", [...data.target_paths, ""]),
										className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
										children: "+ Add path"
									})
								]
							})]
						})
					}),
					isEdit && /* @__PURE__ */ jsxs(Panel, {
						title: "Version history",
						description: "Every save is kept. Open one to see its code or restore it.",
						children: [pageErrors.code && /* @__PURE__ */ jsxs("p", {
							role: "alert",
							className: "mb-3 text-[12px] text-[#ff6b6b]",
							children: ["That version cannot go live until its code is fixed: ", pageErrors.code]
						}), /* @__PURE__ */ jsx("ul", {
							className: "max-h-96 space-y-1 overflow-y-auto",
							children: versions.map((version, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setViewing(version),
								className: "flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--chip)]",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "mt-0.5 inline-flex h-6 min-w-8 items-center justify-center rounded-md border border-[var(--line)] font-mono text-[11px] font-bold text-[var(--ink)]",
									children: ["v", version.version]
								}), /* @__PURE__ */ jsxs("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "block truncate text-[13px] text-[var(--ink-strong)]",
										children: [version.note, index === 0 && /* @__PURE__ */ jsx("span", {
											className: "ml-2 text-[11px] text-[#16a34a]",
											children: "current"
										})]
									}), /* @__PURE__ */ jsxs("span", {
										className: "block text-[11px] text-[var(--ink-faint)]",
										children: [version.createdAgo, version.user ? ` · ${version.user}` : ""]
									})]
								})]
							}) }, version.id))
						})]
					})
				]
			})]
		}),
		/* @__PURE__ */ jsx(VersionModal, {
			version: viewing,
			language: data.type,
			onClose: () => setViewing(null),
			onRestore: restore
		}),
		/* @__PURE__ */ jsx(ConfirmDialog, {
			open: !!request,
			title: request?.title ?? "",
			body: request?.body,
			confirmLabel: request?.confirmLabel,
			onConfirm: run,
			onCancel: cancel
		})
	] });
}
CustomCodeForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { CustomCodeForm as default };
