import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { C as MediaPickerField, a as EmptyState, c as PageHeader, f as Select, g as Textarea, i as ConfirmDialog, l as Panel, n as Button, o as Field, p as StickyColumn, r as ColorInput, s as Input, u as RepeatableList, v as WidgetPanel, x as useConfirm } from "./ui-BFNViBV5.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/admin/SectionFields.jsx
/**
* Repeatable object rows driven by a widget's declared item fields, rendered
* as stacked cards rather than a single line — a testimonial quote or an FAQ
* answer needs room that a table row does not give it.
*/
function Repeater({ field, values, onChange }) {
	const rows = Array.isArray(values) ? values : [];
	const blank = Object.fromEntries(field.item_fields.map((f) => [f.name, f.type === "number" ? 0 : ""]));
	const update = (index, key, value) => onChange(rows.map((row, i) => i === index ? {
		...row,
		[key]: value
	} : row));
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [rows.map((row, index) => /* @__PURE__ */ jsxs("div", {
			className: "rounded-lg border border-[var(--field-line)] p-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
					children: [
						field.label,
						" ",
						index + 1
					]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => onChange(rows.filter((_, i) => i !== index)),
					className: "text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]",
					"aria-label": `Remove ${field.label} ${index + 1}`,
					children: "Remove"
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: field.item_fields.map((itemField) => itemField.type === "image" ? /* @__PURE__ */ jsx(MediaPickerField, {
					label: itemField.label,
					value: row[itemField.name] ?? "",
					onChange: (url) => update(index, itemField.name, url),
					className: "sm:col-span-2"
				}, itemField.name) : /* @__PURE__ */ jsx(Field, {
					label: itemField.label,
					className: itemField.type === "textarea" ? "sm:col-span-2" : "",
					children: itemField.type === "textarea" ? /* @__PURE__ */ jsx(Textarea, {
						rows: 3,
						value: row[itemField.name] ?? "",
						onChange: (e) => update(index, itemField.name, e.target.value)
					}) : itemField.type === "color" ? /* @__PURE__ */ jsx(ColorInput, {
						value: row[itemField.name] ?? "",
						onChange: (value) => update(index, itemField.name, value)
					}) : /* @__PURE__ */ jsx(Input, {
						type: itemField.type === "number" ? "number" : "text",
						value: row[itemField.name] ?? "",
						onChange: (e) => update(index, itemField.name, e.target.value)
					})
				}, itemField.name))
			})]
		}, index)), /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => onChange([...rows, blank]),
			className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
			children: ["+ Add ", field.label.toLowerCase()]
		})]
	});
}
/**
* Renders the form for one widget from the field schema the server sends, so
* adding a widget type on the back end needs no matching form here.
*
* @param {{ fields: Array<object>, content: object, onChange: (content: object) => void, errors?: Record<string, string> }} props
*/
function SectionFields({ fields, content, onChange, errors = {} }) {
	const headingLineCount = (lines) => (Array.isArray(lines) ? lines : []).filter((line) => String(line ?? "").trim() !== "").length;
	const clampHighlight = (value, lines) => value === "" ? "" : Math.min(Math.max(Math.trunc(Number(value) || 0), 0), headingLineCount(lines));
	const set = (name, value) => {
		const next = {
			...content,
			[name]: value
		};
		if (name === "titleLines" && next.titleHighlight !== void 0 && next.titleHighlight !== "") next.titleHighlight = clampHighlight(next.titleHighlight, value);
		onChange(next);
	};
	const renderField = (field) => {
		const value = content?.[field.name];
		const error = errors[`content.${field.name}`];
		if (field.type === "repeater") return /* @__PURE__ */ jsx(Field, {
			label: field.label,
			error,
			children: /* @__PURE__ */ jsx(Repeater, {
				field,
				values: value,
				onChange: (next) => set(field.name, next)
			})
		}, field.name);
		if (field.type === "list") return /* @__PURE__ */ jsx(Field, {
			label: field.label,
			error,
			children: /* @__PURE__ */ jsx(RepeatableList, {
				values: Array.isArray(value) ? value : [],
				onChange: (next) => set(field.name, next),
				addLabel: `Add ${field.label.toLowerCase()}`
			})
		}, field.name);
		if (field.type === "textarea" || field.type === "richtext") return /* @__PURE__ */ jsx(Field, {
			label: field.label,
			error,
			hint: field.type === "richtext" ? "HTML is allowed: use <p>, <strong>, <a> and lists." : void 0,
			children: /* @__PURE__ */ jsx(Textarea, {
				rows: field.type === "richtext" ? 8 : 4,
				className: field.type === "richtext" ? "font-mono text-[12px]" : "",
				value: value ?? "",
				onChange: (e) => set(field.name, e.target.value)
			})
		}, field.name);
		if (field.type === "image") return /* @__PURE__ */ jsx(MediaPickerField, {
			label: field.label,
			value: value ?? "",
			error,
			onChange: (url) => set(field.name, url)
		}, field.name);
		if (field.type === "color") return /* @__PURE__ */ jsx(Field, {
			label: field.label,
			error,
			children: /* @__PURE__ */ jsx(ColorInput, {
				value: value ?? "",
				onChange: (next) => set(field.name, next)
			})
		}, field.name);
		if (field.name === "headingScale") return /* @__PURE__ */ jsx(Field, {
			label: field.label,
			error,
			children: /* @__PURE__ */ jsx(Input, {
				type: "number",
				min: 50,
				max: 200,
				step: 5,
				value: value ?? 100,
				onChange: (e) => set(field.name, e.target.value === "" ? "" : Math.trunc(Number(e.target.value) || 0)),
				onBlur: (e) => set(field.name, e.target.value === "" ? 100 : Math.min(Math.max(Math.trunc(Number(e.target.value) || 0), 50), 200))
			})
		}, field.name);
		if (field.name === "titleHighlight") {
			const max = headingLineCount(content?.titleLines);
			return /* @__PURE__ */ jsx(Field, {
				label: field.label,
				error,
				hint: `0 to ${max}, the number of heading lines.`,
				children: /* @__PURE__ */ jsx(Input, {
					type: "number",
					min: 0,
					max,
					step: 1,
					value: value ?? "",
					onChange: (e) => set(field.name, clampHighlight(e.target.value, content?.titleLines))
				})
			}, field.name);
		}
		return /* @__PURE__ */ jsx(Field, {
			label: field.label,
			error,
			children: /* @__PURE__ */ jsx(Input, {
				type: field.type === "number" ? "number" : "text",
				value: value ?? "",
				onChange: (e) => set(field.name, e.target.value)
			})
		}, field.name);
	};
	const scaleField = fields.find((field) => field.name === "headingScale");
	const scaleAnchor = scaleField ? fields.find((field) => ["headingLines", "titleLines"].includes(field.name)) ?? fields.find((field) => field.label === "Heading") : void 0;
	return /* @__PURE__ */ jsx("div", {
		className: "grid gap-5",
		children: fields.map((field) => {
			if (scaleAnchor && field === scaleField) return null;
			if (scaleAnchor && field === scaleAnchor) return /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-[minmax(0,1fr)_7rem] items-start gap-3",
				children: [renderField(field), renderField({
					...scaleField,
					label: "Size (%)"
				})]
			}, field.name);
			return renderField(field);
		})
	});
}
//#endregion
//#region resources/js/pages/Admin/Pages/Builder.jsx
var ROBOTS = [
	"index,follow",
	"index,nofollow",
	"noindex,follow",
	"noindex,nofollow"
];
var ICONS = {
	edit: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" }), /* @__PURE__ */ jsx("path", { d: "m13.5 6.5 4 4" })] }),
	delete: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" }), /* @__PURE__ */ jsx("path", { d: "M10 11.5v5M14 11.5v5" })] }),
	up: /* @__PURE__ */ jsx("path", { d: "m6 15 6-6 6 6" }),
	down: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" })
};
function Icon({ name }) {
	return /* @__PURE__ */ jsx("svg", {
		"aria-hidden": "true",
		className: "h-4 w-4",
		fill: "none",
		viewBox: "0 0 24 24",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: ICONS[name]
	});
}
var ICON_BUTTON = "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-30";
var NEUTRAL_ICON = `${ICON_BUTTON} text-[var(--ink-faint)] hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)]`;
/**
* Show/hide switch for one section. Flips immediately and saves on its own,
* so a section can be taken off the live page without opening its form.
*/
function VisibilitySwitch({ checked, onChange, label }) {
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		title: checked ? "Shown on the site — click to hide" : "Hidden from the site — click to show",
		onClick: () => onChange(!checked),
		className: "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
		style: { background: checked ? "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" : "var(--field-line)" },
		children: /* @__PURE__ */ jsx("span", {
			className: `inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`,
			"aria-hidden": true
		})
	});
}
/**
* One section as a widget card: its number, name and type in a single row
* with reorder, show/hide and delete controls. Tapping the card opens its
* form and tapping again closes it; each card opens and closes on its own,
* so the others stay exactly as they were. Edits are saved by the page's
* fixed save bar, which this card registers with.
*/
function SectionCard({ page, section, index, count, open, onToggleOpen, onMove, onDelete, register }) {
	const { data, setData, put, errors } = useForm({
		type: section.type,
		name: section.name,
		content: section.content ?? {},
		enabled: section.enabled
	});
	useEffect(() => {
		setData({
			type: section.type,
			name: section.name,
			content: section.content ?? {},
			enabled: section.enabled
		});
	}, [
		section.id,
		section.name,
		section.enabled,
		JSON.stringify(section.content)
	]);
	const isDirty = () => JSON.stringify({
		name: data.name,
		content: data.content
	}) !== JSON.stringify({
		name: section.name,
		content: section.content ?? {}
	});
	const save = () => new Promise((resolve) => {
		put(`/admin/pages/${page.id}/sections/${section.id}`, {
			preserveScroll: true,
			preserveState: true,
			onSuccess: () => resolve(true),
			onError: () => resolve(false),
			onCancel: () => resolve(false)
		});
	});
	useEffect(() => register(section.id, {
		isDirty,
		save
	}));
	useEffect(() => () => register(section.id, null), [section.id]);
	const submit = (e) => {
		e.preventDefault();
	};
	const setVisible = (enabled) => {
		router.put(`/admin/pages/${page.id}/sections/${section.id}`, {
			type: section.type,
			name: section.name,
			content: section.content ?? {},
			enabled
		}, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `rounded-xl border bg-[var(--surface)] transition-colors ${open ? "border-[var(--brand-2)]/50" : "border-[var(--line)]"} ${section.enabled ? "" : "opacity-75"}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3 px-4 py-3",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-[var(--field-line)] px-1.5 font-mono text-[12px] font-bold text-[var(--ink)]",
					children: index + 1
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onToggleOpen,
					"aria-expanded": open,
					className: "flex min-w-0 flex-1 flex-col items-start text-left sm:flex-row sm:items-center sm:gap-3",
					children: [/* @__PURE__ */ jsx("span", {
						className: "truncate font-display text-[14px] font-bold text-[var(--ink-strong)]",
						children: section.name
					}), /* @__PURE__ */ jsx("span", {
						className: "mt-1 rounded-full border border-[var(--field-line)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:mt-0",
						children: section.typeLabel
					})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: `hidden text-[10px] font-bold uppercase tracking-[0.14em] sm:inline ${section.enabled ? "text-[var(--ink-faint)]" : "text-[#ff6b6b]"}`,
					children: section.enabled ? "Visible" : "Hidden"
				}),
				/* @__PURE__ */ jsx(VisibilitySwitch, {
					checked: section.enabled,
					onChange: setVisible,
					label: `${section.enabled ? "Hide" : "Show"} ${section.name} on the site`
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center",
					children: [
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => onMove(index, -1),
							disabled: index === 0,
							className: NEUTRAL_ICON,
							title: "Move up",
							"aria-label": `Move ${section.name} up`,
							children: /* @__PURE__ */ jsx(Icon, { name: "up" })
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => onMove(index, 1),
							disabled: index === count - 1,
							className: NEUTRAL_ICON,
							title: "Move down",
							"aria-label": `Move ${section.name} down`,
							children: /* @__PURE__ */ jsx(Icon, { name: "down" })
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => onDelete(section),
							className: `${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`,
							title: "Delete section",
							"aria-label": `Delete ${section.name}`,
							children: /* @__PURE__ */ jsx(Icon, { name: "delete" })
						})
					]
				})
			]
		}), open && /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "border-t border-[var(--line)] p-5",
			children: [
				section.dataDriven && /* @__PURE__ */ jsx("p", {
					className: "mb-5 rounded-lg border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 px-4 py-3 text-[12px] text-[var(--mute)]",
					children: "This section draws its own content from the database, the fields below only set the surrounding copy."
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Section name",
					error: errors.name,
					required: true,
					className: "mb-5",
					children: /* @__PURE__ */ jsx(Input, {
						value: data.name,
						onChange: (e) => setData("name", e.target.value)
					})
				}),
				/* @__PURE__ */ jsx(SectionFields, {
					fields: section.fields,
					content: data.content,
					onChange: (content) => setData("content", content),
					errors
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--line)] pt-5",
					children: /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: onToggleOpen,
						children: "Close"
					})
				})
			]
		})]
	});
}
/** One category row: colour dot, name, slug, project count and actions. */
function CategoryRow({ category, nested = false, onDelete }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `flex items-center gap-3 border-t border-[var(--line)] py-3 ${nested ? "pl-8" : ""}`,
		children: [
			category.accent && /* @__PURE__ */ jsx("span", {
				className: "h-2.5 w-2.5 shrink-0 rounded-full",
				style: { background: category.accent },
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ jsx("p", {
					className: "truncate text-[13px] font-semibold text-[var(--ink-strong)]",
					children: category.name
				}), /* @__PURE__ */ jsxs("p", {
					className: "truncate font-mono text-[11px] text-[var(--ink-faint)]",
					children: [
						category.slug,
						" · ",
						category.projects_count,
						" project",
						category.projects_count === 1 ? "" : "s"
					]
				})]
			}),
			/* @__PURE__ */ jsx(Link, {
				href: `/admin/categories/${category.id}/edit`,
				className: NEUTRAL_ICON,
				title: "Edit category",
				"aria-label": `Edit ${category.name}`,
				children: /* @__PURE__ */ jsx(Icon, { name: "edit" })
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => onDelete(category),
				className: `${ICON_BUTTON} text-[#ff6b6b] hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10`,
				title: "Delete category",
				"aria-label": `Delete ${category.name}`,
				children: /* @__PURE__ */ jsx(Icon, { name: "delete" })
			})
		]
	});
}
/**
* The categories projects are filed under, managed here on the Our Work
* page rather than in a module of their own.
*/
function CategoriesWidget({ categories, onDelete }) {
	const total = categories.reduce((sum, category) => sum + 1 + (category.children?.length ?? 0), 0);
	return /* @__PURE__ */ jsx("div", {
		id: "categories",
		className: "scroll-mt-24",
		children: /* @__PURE__ */ jsx(WidgetPanel, {
			title: "Project categories",
			description: "The categories projects are filed under. Tap edit to change one.",
			summary: `${total} categor${total === 1 ? "y" : "ies"}`,
			defaultOpen: typeof window !== "undefined" && window.location.hash === "#categories",
			action: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/categories/create",
				variant: "secondary",
				children: "Add category"
			}),
			children: categories.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No categories yet, add the first one." }) : /* @__PURE__ */ jsx("div", {
				className: "-mt-3",
				children: categories.map((category) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(CategoryRow, {
					category,
					onDelete
				}), (category.children ?? []).map((child) => /* @__PURE__ */ jsx(CategoryRow, {
					category: child,
					nested: true,
					onDelete
				}, child.id))] }, category.id))
			})
		})
	});
}
/** The palette: pick a widget type and it is appended to the stack. */
function AddSection({ page, palette }) {
	const [type, setType] = useState(palette[0]?.value ?? "");
	const selected = palette.find((item) => item.value === type);
	const add = () => {
		if (!selected) return;
		router.post(`/admin/pages/${page.id}/sections`, {
			type: selected.value,
			name: selected.label,
			content: {},
			enabled: true
		}, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Add a section",
		description: "Pick a widget; edit its content once it is in the stack.",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end",
			children: [/* @__PURE__ */ jsx(Field, {
				label: "Section type",
				children: /* @__PURE__ */ jsx(Select, {
					value: type,
					onChange: (e) => setType(e.target.value),
					children: palette.map((item) => /* @__PURE__ */ jsx("option", {
						value: item.value,
						children: item.label
					}, item.value))
				})
			}), /* @__PURE__ */ jsx(Button, {
				type: "button",
				onClick: add,
				children: "Add section"
			})]
		}), selected && /* @__PURE__ */ jsx("p", {
			className: "mt-3 text-[12px] text-[var(--mute)]",
			children: selected.description
		})]
	});
}
/** A count that turns red once the text passes the length search engines show. */
function LengthHint({ value, limit }) {
	const length = String(value ?? "").length;
	return /* @__PURE__ */ jsxs("span", {
		className: length > limit ? "text-[#ff6b6b]" : "",
		children: [
			length,
			"/",
			limit,
			" characters"
		]
	});
}
/**
* This page's SEO, edited beside its sections. Saved by the page's fixed save
* bar through the same page update as the full "Page & SEO" screen, staying
* on the builder.
*/
function SeoPanel({ page, register }) {
	const { data, setData, put, errors, isDirty, setDefaults } = useForm({
		slug: page.slug,
		title: page.title,
		status: page.status,
		sort_order: page.sort_order ?? 0,
		meta_title: page.meta_title ?? "",
		meta_description: page.meta_description ?? "",
		meta_robots: page.meta_robots ?? "index,follow",
		canonical_url: page.canonical_url ?? "",
		schema_markup: page.schema_markup ?? "",
		og_image: page.og_image_url ?? "",
		stay: true
	});
	const save = () => new Promise((resolve) => {
		put(`/admin/pages/${page.id}`, {
			preserveScroll: true,
			preserveState: true,
			onSuccess: () => {
				setDefaults();
				resolve(true);
			},
			onError: () => resolve(false),
			onCancel: () => resolve(false)
		});
	});
	useEffect(() => register("seo", {
		isDirty: () => isDirty,
		save
	}));
	useEffect(() => () => register("seo", null), []);
	const submit = (e) => {
		e.preventDefault();
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: "SEO",
		description: "How this page appears in search results and when shared.",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-4",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Meta title",
					error: errors.meta_title,
					hint: /* @__PURE__ */ jsx(LengthHint, {
						value: data.meta_title,
						limit: 60
					}),
					children: /* @__PURE__ */ jsx(Input, {
						value: data.meta_title,
						onChange: (e) => setData("meta_title", e.target.value),
						placeholder: `${page.title} | Marketorr`
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Meta description",
					error: errors.meta_description,
					hint: /* @__PURE__ */ jsx(LengthHint, {
						value: data.meta_description,
						limit: 160
					}),
					children: /* @__PURE__ */ jsx(Textarea, {
						rows: 3,
						value: data.meta_description,
						onChange: (e) => setData("meta_description", e.target.value)
					})
				}),
				/* @__PURE__ */ jsx(MediaPickerField, {
					label: "Share image",
					value: data.og_image,
					error: errors.og_image,
					onChange: (url) => setData("og_image", url)
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Robots",
					error: errors.meta_robots,
					required: true,
					children: /* @__PURE__ */ jsx(Select, {
						value: data.meta_robots,
						onChange: (e) => setData("meta_robots", e.target.value),
						children: ROBOTS.map((value) => /* @__PURE__ */ jsx("option", {
							value,
							children: value
						}, value))
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Canonical URL",
					error: errors.canonical_url,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.canonical_url,
						onChange: (e) => setData("canonical_url", e.target.value),
						placeholder: "https://"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Schema markup (JSON-LD)",
					error: errors.schema_markup,
					children: /* @__PURE__ */ jsx(Textarea, {
						rows: 4,
						className: "font-mono text-[12px]",
						value: data.schema_markup,
						onChange: (e) => setData("schema_markup", e.target.value)
					})
				})
			]
		})
	});
}
function PageBuilder({ page, sections, palette, categories = null }) {
	const [rows, setRows] = useState(sections);
	const [openIds, setOpenIds] = useState(() => /* @__PURE__ */ new Set());
	const toggleOpen = (id) => setOpenIds((current) => {
		const next = new Set(current);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		return next;
	});
	const [request, confirm, cancel, run] = useConfirm();
	const savers = useRef(/* @__PURE__ */ new Map());
	const register = useCallback((key, api) => {
		if (api) savers.current.set(key, api);
		else savers.current.delete(key);
	}, []);
	const [saving, setSaving] = useState(false);
	const [saveResult, setSaveResult] = useState(null);
	const saveAll = async () => {
		setSaving(true);
		setSaveResult(null);
		const pending = [...savers.current.entries()].filter(([, api]) => api.isDirty());
		const failed = [];
		for (const [key, api] of pending) if (!await api.save()) failed.push(key);
		const failedSections = failed.filter((key) => key !== "seo");
		if (failedSections.length > 0) setOpenIds((current) => /* @__PURE__ */ new Set([...current, ...failedSections]));
		setSaving(false);
		setSaveResult(pending.length === 0 ? "none" : failed.length === 0 ? "saved" : "failed");
	};
	useEffect(() => {
		setRows(sections);
	}, [sections]);
	const move = (index, direction) => {
		const target = index + direction;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		setRows(next);
		router.patch(`/admin/pages/${page.id}/sections/reorder`, { ids: next.map((row) => row.id) }, { preserveScroll: true });
	};
	const askDelete = (section) => {
		confirm({
			title: `Delete “${section.name}”?`,
			body: "The section and its content are deleted permanently.",
			confirmLabel: "Delete",
			action: () => router.delete(`/admin/pages/${page.id}/sections/${section.id}`, { preserveScroll: true })
		});
	};
	const askDeleteCategory = (category) => {
		const children = category.children?.length ?? 0;
		confirm({
			title: `Delete “${category.name}”?`,
			body: [category.projects_count > 0 && `${category.projects_count} project(s) will be left without a category.`, children > 0 && `${children} sub-categor${children === 1 ? "y moves" : "ies move"} to the top level.`].filter(Boolean).join(" ") || "The category is removed.",
			confirmLabel: "Delete",
			action: () => router.delete(`/admin/categories/${category.id}`, { preserveScroll: true })
		});
	};
	const visibleCount = rows.filter((row) => row.enabled).length;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${page.title} sections | Marketorr Admin` }),
		/* @__PURE__ */ jsxs(PageHeader, {
			title: `${page.title}: sections`,
			subtitle: `${rows.length} section${rows.length === 1 ? "" : "s"}, ${visibleCount} shown on the site. The order here is the order on the page.`,
			children: [/* @__PURE__ */ jsx(Button, {
				as: "a",
				href: page.url,
				target: "_blank",
				rel: "noreferrer",
				variant: "secondary",
				children: "View page ↗"
			}), /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/pages",
				variant: "secondary",
				children: "All pages"
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid items-start gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs(StickyColumn, {
				className: "space-y-3 lg:col-span-2",
				bottomOffset: 96,
				children: [rows.length === 0 ? /* @__PURE__ */ jsx(Panel, { children: /* @__PURE__ */ jsx(EmptyState, { children: "No sections yet, add the first one." }) }) : rows.map((section, index) => /* @__PURE__ */ jsx(SectionCard, {
					page,
					section,
					index,
					count: rows.length,
					open: openIds.has(section.id),
					onToggleOpen: () => toggleOpen(section.id),
					onMove: move,
					onDelete: askDelete,
					register
				}, section.id)), categories && /* @__PURE__ */ jsx(CategoriesWidget, {
					categories,
					onDelete: askDeleteCategory
				})]
			}), /* @__PURE__ */ jsxs(StickyColumn, {
				className: "space-y-3",
				bottomOffset: 96,
				children: [/* @__PURE__ */ jsx(AddSection, {
					page,
					palette
				}), /* @__PURE__ */ jsx(SeoPanel, {
					page,
					register
				})]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "h-20",
			"aria-hidden": true
		}),
		/* @__PURE__ */ jsx("div", {
			className: "fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:px-6 lg:left-64 lg:px-10",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-end gap-3",
				children: [
					saveResult === "saved" && /* @__PURE__ */ jsx("span", {
						className: "text-[12px] text-[var(--mute)]",
						children: "All changes saved."
					}),
					saveResult === "none" && /* @__PURE__ */ jsx("span", {
						className: "text-[12px] text-[var(--mute)]",
						children: "No changes to save."
					}),
					saveResult === "failed" && /* @__PURE__ */ jsx("span", {
						className: "text-[12px] text-[#ff6b6b]",
						children: "Some changes could not be saved, check the highlighted fields."
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "button",
						onClick: saveAll,
						disabled: saving,
						children: saving ? "Saving…" : "Save changes"
					})
				]
			})
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
PageBuilder.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { PageBuilder as default };
