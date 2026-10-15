import { t as AdminLayout } from "./AdminLayout-Cz9lUOUz.js";
import { c as PageHeader, l as Panel, m as Toggle, n as Button, o as Field, s as Input } from "./ui-0XaBzweS.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Menus/Index.jsx
var BLANK = {
	label: "",
	url: "",
	opens_in_new_tab: false,
	enabled: true,
	children: []
};
var MENU_TABS = [
	{
		id: "header",
		label: "Header"
	},
	{
		id: "footer",
		label: "Footer"
	},
	{
		id: "mega",
		label: "Mega Menu"
	}
];
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
	const moveChild = (parentIndex, childIndex, direction) => {
		const children = [...data.items[parentIndex].children];
		const target = childIndex + direction;
		if (target < 0 || target >= children.length) return;
		[children[childIndex], children[target]] = [children[target], children[childIndex]];
		updateItem(parentIndex, { children });
	};
	const submit = (e) => {
		e.preventDefault();
		put(`/admin/menus/${menu.location}`, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: menu.label,
		description: `${data.items.length} top-level item(s). Add nested items to build the hierarchy.`,
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
								/* @__PURE__ */ jsx("span", {
									className: "mt-7 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-[var(--field-line)] px-1.5 font-mono text-[12px] font-bold text-[var(--ink)]",
									"aria-label": `Item ${index + 1}`,
									children: index + 1
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
									className: "pt-2 text-[12px] text-[#ff6b6b] hover:opacity-80",
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
								className: "grid gap-4 sm:grid-cols-[auto_1fr_1fr]",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "mt-7 flex h-7 min-w-9 items-center justify-center self-start rounded-md border border-[var(--line)] px-1.5 font-mono text-[11px] font-bold text-[var(--mute)]",
										"aria-label": `Item ${index + 1}.${childIndex + 1}`,
										children: [
											index + 1,
											".",
											childIndex + 1
										]
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Sub-item label",
										error: errors[`items.${index}.children.${childIndex}.label`],
										children: /* @__PURE__ */ jsx(Input, {
											value: child.label,
											onChange: (e) => updateChild(index, childIndex, { label: e.target.value })
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-end gap-2",
										children: [
											/* @__PURE__ */ jsx(Field, {
												label: "Sub-item URL",
												className: "flex-1",
												error: errors[`items.${index}.children.${childIndex}.url`],
												children: /* @__PURE__ */ jsx(Input, {
													value: child.url,
													onChange: (e) => updateChild(index, childIndex, { url: e.target.value })
												})
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => moveChild(index, childIndex, -1),
												disabled: childIndex === 0,
												"aria-label": "Move sub-item up",
												className: "mb-2.5 rounded-lg border border-[var(--field-line)] px-2.5 py-2 text-[10px] text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
												children: "▲"
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => moveChild(index, childIndex, 1),
												disabled: childIndex === item.children.length - 1,
												"aria-label": "Move sub-item down",
												className: "mb-2.5 rounded-lg border border-[var(--field-line)] px-2.5 py-2 text-[10px] text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
												children: "▼"
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => updateItem(index, { children: item.children.filter((_, i) => i !== childIndex) }),
												"aria-label": "Remove sub-item",
												className: "mb-2.5 rounded-lg border border-[var(--field-line)] px-3 py-2 text-[12px] text-[#ff6b6b] hover:opacity-80",
												children: "×"
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap gap-6 sm:col-span-2",
										children: [/* @__PURE__ */ jsx(Toggle, {
											checked: child.enabled,
											onChange: (value) => updateChild(index, childIndex, { enabled: value }),
											label: "Visible"
										}), /* @__PURE__ */ jsx(Toggle, {
											checked: child.opens_in_new_tab,
											onChange: (value) => updateChild(index, childIndex, { opens_in_new_tab: value }),
											label: "Open in a new tab"
										})]
									})
								]
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
	const [activeTab, setActiveTab] = useState("header");
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Menus | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Menus",
			subtitle: "Build the header, footer and mega menus as ordered navigation trees."
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mb-6 flex flex-wrap gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5",
			role: "tablist",
			"aria-label": "Menu areas",
			children: MENU_TABS.map((tab) => /* @__PURE__ */ jsx("button", {
				type: "button",
				role: "tab",
				"aria-selected": activeTab === tab.id,
				onClick: () => setActiveTab(tab.id),
				className: `rounded-lg px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors ${activeTab === tab.id ? "bg-[var(--chip)] text-[var(--ink-strong)]" : "text-[var(--ink-faint)] hover:text-[var(--ink)]"}`,
				children: tab.label
			}, tab.id))
		}),
		/* @__PURE__ */ jsx("div", { children: MENU_TABS.map((tab) => /* @__PURE__ */ jsx("div", {
			role: "tabpanel",
			hidden: activeTab !== tab.id,
			className: "space-y-6",
			children: menus.filter((menu) => menu.group === tab.id).map((menu) => /* @__PURE__ */ jsx(MenuEditor, { menu }, menu.location))
		}, tab.id)) })
	] });
}
MenusIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { MenusIndex as default };
