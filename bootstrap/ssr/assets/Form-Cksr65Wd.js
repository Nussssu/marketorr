import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { c as PageHeader, f as Select, g as slugify, l as Panel, n as Button, o as Field, p as Textarea, r as ColorInput, s as Input, u as RepeatableList, y as MediaPickerField } from "./ui-DUoJPW2G.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/SubServices/Form.jsx
function SubServiceForm({ item, groups, statuses }) {
	const isEdit = Boolean(item);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const { data, setData, post, put, processing, errors } = useForm({
		service_group_id: item?.service_group_id ?? groups[0]?.id ?? "",
		slug: item?.slug ?? "",
		name: item?.name ?? "",
		short: item?.short ?? "",
		description: item?.description ?? "",
		deliverables: item?.deliverables?.length ? item.deliverables : [""],
		image: item?.image ?? "",
		image_alt: item?.image_alt ?? "",
		accent: item?.accent ?? "#507AF4",
		related_match: item?.related_match?.length ? item.related_match : [""],
		related_pin: item?.related_pin?.length ? item.related_pin : [""],
		case_study: item?.case_study ? JSON.stringify(item.case_study, null, 2) : "",
		status: item?.status ?? "published",
		sort_order: item?.sort_order ?? ""
	});
	const onNameChange = (value) => {
		setData((current) => ({
			...current,
			name: value,
			slug: slugLocked ? current.slug : slugify(value)
		}));
	};
	const submit = (e) => {
		e.preventDefault();
		if (isEdit) put(`/admin/sub-services/${item.id}`);
		else post("/admin/sub-services");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} sub-service | Marketorr Admin` }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: isEdit ? `Edit ${item.name}` : "New sub-service",
			subtitle: "Fields map one-to-one onto the public sub-service page.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/sub-services",
				variant: "secondary",
				children: "Cancel"
			})
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-6 lg:col-span-2",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Basics",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Tab",
									error: errors.service_group_id,
									required: true,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Select, {
										value: data.service_group_id,
										onChange: (e) => setData("service_group_id", e.target.value),
										children: groups.map((group) => /* @__PURE__ */ jsx("option", {
											value: group.id,
											children: group.name
										}, group.id))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Name",
									error: errors.name,
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.name,
										onChange: (e) => onNameChange(e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Slug",
									error: errors.slug,
									required: true,
									hint: `Live address: /services/${groups.find((group) => String(group.id) === String(data.service_group_id))?.slug ?? "tab"}/${slugify(data.slug) || "your-slug"} · lowercase letters, numbers and hyphens`,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.slug,
										onChange: (e) => {
											setSlugLocked(true);
											setData("slug", e.target.value);
										}
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Tagline",
									error: errors.short,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Input, {
										value: data.short ?? "",
										onChange: (e) => setData("short", e.target.value),
										placeholder: "Positioning that makes choosing you obvious."
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Description",
									error: errors.description,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 4,
										value: data.description ?? "",
										onChange: (e) => setData("description", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Accent colour",
									error: errors.accent,
									required: true,
									children: /* @__PURE__ */ jsx(ColorInput, {
										value: data.accent,
										onChange: (v) => setData("accent", v)
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Showcase image",
						description: "The visual the tile, transition and hero all share. Empty renders the placeholder plate.",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ jsx(MediaPickerField, {
								label: "Image",
								error: errors.image,
								hint: "Choose an asset from the library. Upload target: 16:10, 1600×1000.",
								preview: typeof data.image === "string" ? data.image : "",
								value: typeof data.image === "string" ? data.image : "",
								onChange: (url) => setData("image", url)
							}), /* @__PURE__ */ jsx(Field, {
								label: "Image alt text",
								error: errors.image_alt,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.image_alt ?? "",
									onChange: (e) => setData("image_alt", e.target.value)
								})
							})]
						})
					}),
					/* @__PURE__ */ jsxs(Panel, {
						title: "Deliverables",
						description: "The “what you get” list on the dedicated page.",
						children: [/* @__PURE__ */ jsx(RepeatableList, {
							values: data.deliverables,
							onChange: (v) => setData("deliverables", v),
							placeholder: "Positioning statement",
							addLabel: "Add deliverable",
							errors,
							name: "deliverables"
						}), errors.deliverables && /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[12px] text-[#ff6b6b]",
							children: errors.deliverables
						})]
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Related work",
						description: "Pinned project slugs lead; matching tags then fill from the same portfolio.",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(RepeatableList, {
								values: data.related_match,
								onChange: (v) => setData("related_match", v),
								placeholder: "Brand Identity",
								addLabel: "Add match tag",
								errors,
								name: "related_match"
							}), errors.related_match && /* @__PURE__ */ jsx("p", {
								className: "mt-2 text-[12px] text-[#ff6b6b]",
								children: errors.related_match
							})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(RepeatableList, {
								values: data.related_pin,
								onChange: (v) => setData("related_pin", v),
								placeholder: "project-slug",
								addLabel: "Add pinned slug",
								errors,
								name: "related_pin"
							}), errors.related_pin && /* @__PURE__ */ jsx("p", {
								className: "mt-2 text-[12px] text-[#ff6b6b]",
								children: errors.related_pin
							})] })]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Case study",
						description: "Optional long-form story. Advanced: valid JSON with meta and sections, as seeded.",
						children: /* @__PURE__ */ jsx(Field, {
							label: "Case study JSON",
							error: errors.case_study,
							hint: "Leave empty for no case study.",
							children: /* @__PURE__ */ jsx(Textarea, {
								rows: 8,
								className: "font-mono text-[12px]",
								value: data.case_study ?? "",
								onChange: (e) => setData("case_study", e.target.value),
								placeholder: "{\"meta\": \"...\", \"sections\": [...]}"
							})
						})
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsx(Panel, {
					title: "Publishing",
					children: /* @__PURE__ */ jsxs("div", {
						className: "space-y-5",
						children: [/* @__PURE__ */ jsx(Field, {
							label: "Status",
							error: errors.status,
							required: true,
							children: /* @__PURE__ */ jsx(Select, {
								value: data.status,
								onChange: (e) => setData("status", e.target.value),
								children: statuses.map((status) => /* @__PURE__ */ jsx("option", {
									value: status,
									children: status
								}, status))
							})
						}), /* @__PURE__ */ jsx(Field, {
							label: "Sort order",
							error: errors.sort_order,
							hint: "Leave empty to append to the end of its tab.",
							children: /* @__PURE__ */ jsx(Input, {
								type: "number",
								min: "0",
								value: data.sort_order ?? "",
								onChange: (e) => setData("sort_order", e.target.value)
							})
						})]
					})
				}), /* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					className: "w-full",
					children: processing ? "Saving…" : isEdit ? "Save changes" : "Create sub-service"
				})]
			})]
		})
	] });
}
SubServiceForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { SubServiceForm as default };
