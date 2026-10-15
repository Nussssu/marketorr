import { t as AdminLayout } from "./AdminLayout-Cz9lUOUz.js";
import { a as EmptyState, c as PageHeader, f as Select, g as useConfirm, i as ConfirmDialog, l as Panel, n as Button, o as Field, p as Textarea, r as ColorInput, s as Input, u as RepeatableList, v as MediaPickerField } from "./ui-0XaBzweS.js";
import { Head, router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
	const set = (name, value) => onChange({
		...content,
		[name]: value
	});
	return /* @__PURE__ */ jsx("div", {
		className: "grid gap-5",
		children: fields.map((field) => {
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
			return /* @__PURE__ */ jsx(Field, {
				label: field.label,
				error,
				children: /* @__PURE__ */ jsx(Input, {
					type: field.type === "number" ? "number" : "text",
					value: value ?? "",
					onChange: (e) => set(field.name, e.target.value)
				})
			}, field.name);
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
		style: { background: checked ? "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" : "var(--field-line)" },
		children: /* @__PURE__ */ jsx("span", {
			className: `inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`,
			"aria-hidden": true
		})
	});
}
/**
* One section as a widget card: its number, name and type in a single row
* with reorder, show/hide, edit and delete controls. The form opens only
* when the editor asks for it, and only one card is open at a time.
*/
function SectionCard({ page, section, index, count, open, onToggleOpen, onMove, onDelete }) {
	const { data, setData, put, processing, errors } = useForm({
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
	const submit = (e) => {
		e.preventDefault();
		put(`/admin/pages/${page.id}/sections/${section.id}`, { preserveScroll: true });
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
		className: `rounded-xl border bg-[var(--surface)] transition-colors ${open ? "border-[#507AF4]/50" : "border-[var(--line)]"} ${section.enabled ? "" : "opacity-75"}`,
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
							onClick: onToggleOpen,
							className: `${NEUTRAL_ICON} ${open ? "border-[var(--field-line)] bg-[var(--chip)] text-[var(--ink)]" : ""}`,
							title: open ? "Close editor" : "Edit section",
							"aria-label": `${open ? "Close" : "Edit"} ${section.name}`,
							children: /* @__PURE__ */ jsx(Icon, { name: "edit" })
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
					className: "mb-5 rounded-lg border border-[#507AF4]/30 bg-[#507AF4]/10 px-4 py-3 text-[12px] text-[var(--mute)]",
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
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--line)] pt-5",
					children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: onToggleOpen,
						children: "Close"
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						children: processing ? "Saving…" : "Save section"
					})]
				})
			]
		})]
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
* This page's SEO, edited beside its sections. Saves through the same page
* update as the full "Page & SEO" screen and stays on the builder.
*/
function SeoPanel({ page }) {
	const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
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
	const submit = (e) => {
		e.preventDefault();
		put(`/admin/pages/${page.id}`, { preserveScroll: true });
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
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-end gap-3",
					children: [recentlySuccessful && /* @__PURE__ */ jsx("span", {
						className: "text-[12px] text-[var(--mute)]",
						children: "Saved."
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						children: processing ? "Saving…" : "Save SEO"
					})]
				})
			]
		})
	});
}
function PageBuilder({ page, sections, palette }) {
	const [rows, setRows] = useState(sections);
	const [openId, setOpenId] = useState(null);
	const [request, confirm, cancel, run] = useConfirm();
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
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsx("div", {
				className: "space-y-3 lg:col-span-2",
				children: rows.length === 0 ? /* @__PURE__ */ jsx(Panel, { children: /* @__PURE__ */ jsx(EmptyState, { children: "No sections yet, add the first one." }) }) : rows.map((section, index) => /* @__PURE__ */ jsx(SectionCard, {
					page,
					section,
					index,
					count: rows.length,
					open: openId === section.id,
					onToggleOpen: () => setOpenId((current) => current === section.id ? null : section.id),
					onMove: move,
					onDelete: askDelete
				}, section.id))
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsx(AddSection, {
					page,
					palette
				}), /* @__PURE__ */ jsx(SeoPanel, { page })]
			})]
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
