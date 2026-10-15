import { t as AdminLayout } from "./AdminLayout-DeYqDoJZ.js";
import { a as EmptyState, c as PageHeader, f as Select, g as useConfirm, i as ConfirmDialog, l as Panel, m as Toggle, n as Button, o as Field, p as Textarea, r as ColorInput, s as Input, u as RepeatableList } from "./ui-Dv8OUCCw.js";
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
				children: field.item_fields.map((itemField) => /* @__PURE__ */ jsx(Field, {
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
/** One section in the stack: reorder, rename, edit its fields, or remove it. */
function SectionCard({ page, section, index, count, onMove, onDelete }) {
	const [open, setOpen] = useState(false);
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
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-[var(--line)] bg-[var(--surface)]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center gap-3 px-5 py-4",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onMove(index, -1),
						disabled: index === 0,
						"aria-label": "Move section up",
						className: "text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]",
						children: "▲"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onMove(index, 1),
						disabled: index === count - 1,
						"aria-label": "Move section down",
						className: "mt-1 text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]",
						children: "▼"
					})]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setOpen((v) => !v),
					"aria-expanded": open,
					className: "flex flex-1 items-center gap-3 text-left",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-display text-[14px] font-bold text-[var(--ink-strong)]",
							children: section.name
						}),
						/* @__PURE__ */ jsx("span", {
							className: "rounded-full border border-[var(--field-line)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: section.typeLabel
						}),
						!section.enabled && /* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b]",
							children: "Hidden"
						})
					]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "text-[11px] text-[var(--ink-faint)]",
					children: open ? "Close" : "Edit"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					onClick: () => onDelete(section),
					children: "Remove"
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
					className: "mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5",
					children: [/* @__PURE__ */ jsx(Toggle, {
						checked: data.enabled,
						onChange: (value) => setData("enabled", value),
						label: "Visible on the site",
						hint: "Hidden sections stay here but are not rendered."
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
function PageBuilder({ page, sections, palette }) {
	const [rows, setRows] = useState(sections);
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
			title: `Remove “${section.name}”?`,
			body: "The section and its content are deleted permanently.",
			confirmLabel: "Remove",
			action: () => router.delete(`/admin/pages/${page.id}/sections/${section.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${page.title} sections | Marketorr Admin` }),
		/* @__PURE__ */ jsxs(PageHeader, {
			title: `${page.title}: sections`,
			subtitle: "The order here is the order on the page.",
			children: [/* @__PURE__ */ jsx(Button, {
				as: "link",
				href: `/admin/pages/${page.id}/edit`,
				variant: "secondary",
				children: "Page & SEO"
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
				className: "space-y-4 lg:col-span-2",
				children: rows.length === 0 ? /* @__PURE__ */ jsx(Panel, { children: /* @__PURE__ */ jsx(EmptyState, { children: "No sections yet, add the first one." }) }) : rows.map((section, index) => /* @__PURE__ */ jsx(SectionCard, {
					page,
					section,
					index,
					count: rows.length,
					onMove: move,
					onDelete: askDelete
				}, section.id))
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsx(AddSection, {
					page,
					palette
				}), /* @__PURE__ */ jsx(Panel, {
					title: "Preview",
					children: /* @__PURE__ */ jsxs("a", {
						href: page.url,
						target: "_blank",
						rel: "noreferrer",
						className: "text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
						children: [
							"Open ",
							page.url,
							" ↗"
						]
					})
				})]
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
