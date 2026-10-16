import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { c as PageHeader, l as Panel, m as Toggle, n as Button, o as Field, p as Textarea, s as Input, u as RepeatableList } from "./ui-DUoJPW2G.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Menus/Index.jsx
var BLANK = {
	label: "",
	url: "",
	description: "",
	opens_in_new_tab: false,
	enabled: true,
	show_on_desktop: true,
	show_on_mobile: true,
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
var MENU_DISPLAY_ORDER = {
	footer_social: 0,
	footer_sitemap: 1,
	footer_services: 2,
	footer_legal: 3
};
/** One editable menu location within the page-wide save form. */
function MenuEditor({ menu, data, setData, errors }) {
	const setItems = (items) => setData("items", items);
	const setContent = (key, value) => setData("content", {
		...data.content,
		[key]: value
	});
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
	return /* @__PURE__ */ jsxs(Panel, {
		className: "h-full",
		title: data.name || menu.label,
		description: `${data.items.length} item(s) sit directly under this parent label.`,
		children: [menu.note && /* @__PURE__ */ jsx("p", {
			className: "mb-4 rounded-lg border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 px-4 py-3 text-[12px] text-[var(--mute)]",
			children: menu.note
		}), /* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-5 rounded-xl border border-[var(--brand-1)]/25 bg-gradient-to-r from-[var(--brand-1)]/10 via-[var(--brand-2)]/8 to-[var(--brand-3)]/10 p-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "h-2.5 w-2.5 rounded-full bg-[var(--brand-1)] shadow-[0_0_0_4px_rgba(var(--brand-1-rgb),0.12)]",
						"aria-hidden": true
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
						children: "Parent label"
					})]
				}), /* @__PURE__ */ jsx(Field, {
					label: "Label",
					error: errors.name,
					children: /* @__PURE__ */ jsx(Input, {
						value: data.name,
						onChange: (event) => setData("name", event.target.value)
					})
				})]
			}),
			Object.keys(data.content).length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "mb-5 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "h-2.5 w-2.5 rounded-full bg-[var(--brand-3)] shadow-[0_0_0_4px_rgba(var(--brand-3-rgb),0.12)]",
						"aria-hidden": true
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
						children: "Menu text"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: menu.location === "footer_social" ? /* @__PURE__ */ jsx(Field, {
						label: "Agency intro",
						error: errors["content.intro"],
						className: "sm:col-span-2",
						children: /* @__PURE__ */ jsx(Textarea, {
							rows: 3,
							value: data.content.intro ?? "",
							onChange: (event) => setContent("intro", event.target.value)
						})
					}) : menu.location === "footer_legal" ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Field, {
						label: "Copyright line",
						error: errors["content.copyright"],
						hint: "Use {year} and {site} as automatic replacement variables.",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ jsx(Input, {
							value: data.content.copyright ?? "",
							onChange: (event) => setContent("copyright", event.target.value)
						})
					}), /* @__PURE__ */ jsx(Field, {
						label: "Footer motto words",
						error: errors["content.motto_items"],
						className: "sm:col-span-2",
						children: /* @__PURE__ */ jsx(RepeatableList, {
							values: data.content.motto_items ?? [],
							onChange: (values) => setContent("motto_items", values),
							placeholder: "IDEA",
							addLabel: "Add word",
							errors,
							name: "content.motto_items"
						})
					})] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Eyebrow",
							error: errors["content.eyebrow"],
							children: /* @__PURE__ */ jsx(Input, {
								value: data.content.eyebrow ?? "",
								onChange: (event) => setContent("eyebrow", event.target.value)
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Heading start",
							error: errors["content.headline_before"],
							children: /* @__PURE__ */ jsx(Input, {
								value: data.content.headline_before ?? "",
								onChange: (event) => setContent("headline_before", event.target.value)
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Gradient heading text",
							error: errors["content.headline_highlight"],
							children: /* @__PURE__ */ jsx(Input, {
								value: data.content.headline_highlight ?? "",
								onChange: (event) => setContent("headline_highlight", event.target.value)
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Heading end",
							error: errors["content.headline_after"],
							children: /* @__PURE__ */ jsx(Input, {
								value: data.content.headline_after ?? "",
								onChange: (event) => setContent("headline_after", event.target.value)
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Description",
							error: errors["content.blurb"],
							className: "sm:col-span-2",
							children: /* @__PURE__ */ jsx(Textarea, {
								rows: 3,
								value: data.content.blurb ?? "",
								onChange: (event) => setContent("blurb", event.target.value)
							})
						}),
						menu.location === "mega_services" && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Field, {
							label: "View all label",
							error: errors["content.all_label"],
							children: /* @__PURE__ */ jsx(Input, {
								value: data.content.all_label ?? "",
								onChange: (event) => setContent("all_label", event.target.value)
							})
						}), /* @__PURE__ */ jsx(Field, {
							label: "View all URL",
							error: errors["content.all_url"],
							children: /* @__PURE__ */ jsx(Input, {
								value: data.content.all_url ?? "",
								onChange: (event) => setContent("all_url", event.target.value)
							})
						})] })
					] })
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ml-1 space-y-3 border-l-2 border-[var(--line)] pl-5",
				children: data.items.map((item, index) => /* @__PURE__ */ jsxs("div", {
					className: "relative rounded-lg border border-[var(--field-line)] bg-[var(--surface)] p-4 before:absolute before:-left-[22px] before:top-8 before:w-5 before:border-t-2 before:border-[var(--line)] after:absolute after:-left-[27px] after:top-[27px] after:h-2.5 after:w-2.5 after:rounded-full after:border-2 after:border-[var(--brand-2)] after:bg-[var(--surface)]",
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
									children: [
										/* @__PURE__ */ jsx(Field, {
											label: "Label",
											error: errors[`items.${index}.label`],
											children: /* @__PURE__ */ jsx(Input, {
												value: item.label,
												onChange: (e) => updateItem(index, { label: e.target.value })
											})
										}),
										/* @__PURE__ */ jsx(Field, {
											label: "URL",
											error: errors[`items.${index}.url`],
											children: /* @__PURE__ */ jsx(Input, {
												value: item.url,
												onChange: (e) => updateItem(index, { url: e.target.value }),
												placeholder: "/about"
											})
										}),
										menu.location === "mega_services" && /* @__PURE__ */ jsx(Field, {
											label: "Supporting text",
											error: errors[`items.${index}.description`],
											className: "sm:col-span-2",
											children: /* @__PURE__ */ jsx(Input, {
												value: item.description ?? "",
												onChange: (e) => updateItem(index, { description: e.target.value }),
												placeholder: "Identities that demand attention."
											})
										})
									]
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
							children: [
								/* @__PURE__ */ jsx(Toggle, {
									checked: item.enabled,
									onChange: (value) => updateItem(index, { enabled: value }),
									label: "Visible"
								}),
								/* @__PURE__ */ jsx(Toggle, {
									checked: item.opens_in_new_tab,
									onChange: (value) => updateItem(index, { opens_in_new_tab: value }),
									label: "Open in a new tab"
								}),
								menu.location === "header" && (item.url === "/contact" || item.label.trim().toLowerCase() === "contact") && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Toggle, {
									checked: item.show_on_desktop,
									onChange: (value) => updateItem(index, { show_on_desktop: value }),
									label: "Show on desktop"
								}), /* @__PURE__ */ jsx(Toggle, {
									checked: item.show_on_mobile,
									onChange: (value) => updateItem(index, { show_on_mobile: value }),
									label: "Show on mobile"
								})] })
							]
						}),
						item.children.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "mt-4 space-y-3 border-l-2 border-[var(--line)] pl-4",
							children: [/* @__PURE__ */ jsxs("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
								children: ["Under ", item.label || `item ${index + 1}`]
							}), item.children.map((child, childIndex) => /* @__PURE__ */ jsxs("div", {
								className: "relative grid gap-4 rounded-lg bg-[var(--bg)] p-3 sm:grid-cols-[auto_1fr_1fr]",
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
							}, childIndex))]
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => updateItem(index, { children: [...item.children, { ...BLANK }] }),
							className: "mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
							children: "+ Add sub-item"
						})
					]
				}, index))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-5 flex flex-wrap items-center justify-between gap-4",
				children: /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setItems([...data.items, { ...BLANK }]),
					className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
					children: "+ Add item"
				})
			})
		] })]
	});
}
function MenusIndex({ menus }) {
	const [activeTab, setActiveTab] = useState("header");
	const { data, setData, put, processing, errors, isDirty } = useForm({ menus: menus.map((menu) => ({
		location: menu.location,
		name: menu.label,
		content: menu.content ?? {},
		items: menu.items.map((item) => ({
			...item,
			description: item.description ?? "",
			children: (item.children ?? []).map((child) => ({
				...child,
				description: child.description ?? ""
			}))
		}))
	})) });
	const updateMenu = (index, value) => {
		const next = [...data.menus];
		next[index] = value;
		setData("menus", next);
	};
	const submit = (event) => {
		event.preventDefault();
		put("/admin/menus", { preserveScroll: true });
	};
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
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "pb-24",
			children: [MENU_TABS.map((tab) => /* @__PURE__ */ jsx("div", {
				role: "tabpanel",
				hidden: activeTab !== tab.id,
				className: "space-y-6",
				children: menus.map((menu, index) => ({
					menu,
					index
				})).filter(({ menu }) => menu.group === tab.id).sort((a, b) => (MENU_DISPLAY_ORDER[a.menu.location] ?? 100) - (MENU_DISPLAY_ORDER[b.menu.location] ?? 100)).map(({ menu, index }) => {
					const prefix = `menus.${index}.`;
					const scopedErrors = Object.fromEntries(Object.entries(errors).filter(([key]) => key.startsWith(prefix)).map(([key, value]) => [key.slice(prefix.length), value]));
					return /* @__PURE__ */ jsx(MenuEditor, {
						menu,
						data: data.menus[index],
						setData: (key, value) => updateMenu(index, {
							...data.menus[index],
							[key]: value
						}),
						errors: scopedErrors
					}, menu.location);
				})
			}, tab.id)), /* @__PURE__ */ jsx("div", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:px-6 lg:left-64 lg:px-10",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-[1600px] items-center justify-between gap-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[12px] text-[var(--mute)]",
						children: isDirty ? "You have unsaved menu changes." : "All menu changes are saved."
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing || !isDirty,
						children: processing ? "Saving…" : "Save all changes"
					})]
				})
			})]
		})
	] });
}
MenusIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { MenusIndex as default };
