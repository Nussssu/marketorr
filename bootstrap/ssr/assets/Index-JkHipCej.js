import { t as AdminLayout } from "./AdminLayout-DeYqDoJZ.js";
import { c as PageHeader, l as Panel, m as Toggle, n as Button, o as Field, s as Input } from "./ui-Dv8OUCCw.js";
import { Head, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Menus/Index.jsx
var BLANK = {
	label: "",
	url: "",
	opens_in_new_tab: false,
	enabled: true,
	children: []
};
/** One editable menu location. The whole tree is saved in a single request. */
function MenuEditor({ menu }) {
	const { data, setData, put, processing, errors } = useForm({ items: menu.items.map((item) => ({
		...item,
		children: item.children ?? []
	})) });
	const setItems = (items) => setData("items", items);
	const updateItem = (index, patch) => setItems(data.items.map((item, i) => i === index ? {
		...item,
		...patch
	} : item));
	const move = (index, direction) => {
		const target = index + direction;
		if (target < 0 || target >= data.items.length) return;
		const next = [...data.items];
		[next[index], next[target]] = [next[target], next[index]];
		setItems(next);
	};
	const updateChild = (parentIndex, childIndex, patch) => updateItem(parentIndex, { children: data.items[parentIndex].children.map((child, i) => i === childIndex ? {
		...child,
		...patch
	} : child) });
	const submit = (e) => {
		e.preventDefault();
		put(`/admin/menus/${menu.location}`, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: menu.label,
		description: `${data.items.length} top-level item(s).`,
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			children: [/* @__PURE__ */ jsx("div", {
				className: "space-y-3",
				children: data.items.map((item, index) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-[var(--field-line)] p-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col pt-2",
									children: [/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => move(index, -1),
										disabled: index === 0,
										"aria-label": "Move item up",
										className: "text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]",
										children: "▲"
									}), /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => move(index, 1),
										disabled: index === data.items.length - 1,
										"aria-label": "Move item down",
										className: "mt-1 text-[11px] leading-none text-[var(--ink-faint)] disabled:opacity-30 hover:text-[var(--ink)]",
										children: "▼"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid flex-1 gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ jsx(Field, {
										label: "Label",
										error: errors[`items.${index}.label`],
										children: /* @__PURE__ */ jsx(Input, {
											value: item.label,
											onChange: (e) => updateItem(index, { label: e.target.value })
										})
									}), /* @__PURE__ */ jsx(Field, {
										label: "URL",
										error: errors[`items.${index}.url`],
										children: /* @__PURE__ */ jsx(Input, {
											value: item.url,
											onChange: (e) => updateItem(index, { url: e.target.value }),
											placeholder: "/about"
										})
									})]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setItems(data.items.filter((_, i) => i !== index)),
									"aria-label": `Remove ${item.label || "item"}`,
									className: "pt-2 text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]",
									children: "Remove"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 flex flex-wrap gap-6 border-t border-[var(--line)] pt-4",
							children: [/* @__PURE__ */ jsx(Toggle, {
								checked: item.enabled,
								onChange: (value) => updateItem(index, { enabled: value }),
								label: "Visible"
							}), /* @__PURE__ */ jsx(Toggle, {
								checked: item.opens_in_new_tab,
								onChange: (value) => updateItem(index, { opens_in_new_tab: value }),
								label: "Open in a new tab"
							})]
						}),
						item.children.length > 0 && /* @__PURE__ */ jsx("div", {
							className: "mt-4 space-y-3 border-l-2 border-[var(--line)] pl-4",
							children: item.children.map((child, childIndex) => /* @__PURE__ */ jsxs("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsx(Field, {
									label: "Sub-item label",
									error: errors[`items.${index}.children.${childIndex}.label`],
									children: /* @__PURE__ */ jsx(Input, {
										value: child.label,
										onChange: (e) => updateChild(index, childIndex, { label: e.target.value })
									})
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-end gap-2",
									children: [/* @__PURE__ */ jsx(Field, {
										label: "Sub-item URL",
										className: "flex-1",
										error: errors[`items.${index}.children.${childIndex}.url`],
										children: /* @__PURE__ */ jsx(Input, {
											value: child.url,
											onChange: (e) => updateChild(index, childIndex, { url: e.target.value })
										})
									}), /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => updateItem(index, { children: item.children.filter((_, i) => i !== childIndex) }),
										"aria-label": "Remove sub-item",
										className: "mb-2.5 rounded-lg border border-[var(--field-line)] px-3 py-2 text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]",
										children: "×"
									})]
								})]
							}, childIndex))
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => updateItem(index, { children: [...item.children, { ...BLANK }] }),
							className: "mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
							children: "+ Add sub-item"
						})
					]
				}, index))
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setItems([...data.items, { ...BLANK }]),
					className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
					children: "+ Add item"
				}), /* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					children: processing ? "Saving…" : "Save menu"
				})]
			})]
		})
	});
}
function MenusIndex({ menus }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Menus | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Menus",
			subtitle: "Navigation for the header and footer. Emptying a menu falls back to the built-in links."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "space-y-6",
			children: menus.map((menu) => /* @__PURE__ */ jsx(MenuEditor, { menu }, menu.location))
		})
	] });
}
MenusIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { MenusIndex as default };
