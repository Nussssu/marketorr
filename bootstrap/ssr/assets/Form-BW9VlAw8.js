import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { c as PageHeader, d as RepeatableRows, f as Select, h as Textarea, l as Panel, n as Button, o as Field, r as ColorInput, s as Input, u as RepeatableList, v as slugify } from "./ui-B5Z9349N.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Services/Form.jsx
function ServiceForm({ service, statuses }) {
	const isEdit = Boolean(service);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const { data, setData, post, put, processing, errors } = useForm({
		slug: service?.slug ?? "",
		index_label: service?.index_label ?? "",
		name: service?.name ?? "",
		short: service?.short ?? "",
		description: service?.description ?? "",
		accent: service?.accent ?? "#891FFB",
		accent_to: service?.accent_to ?? "",
		capabilities: service?.capabilities?.length ? service.capabilities : [""],
		deliverables: service?.deliverables?.length ? service.deliverables : [""],
		outcomes: service?.outcomes?.length ? service.outcomes : [{
			value: "",
			label: ""
		}],
		status: service?.status ?? "published",
		sort_order: service?.sort_order ?? ""
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
		if (isEdit) put(`/admin/services/${service.id}`);
		else post("/admin/services");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} service | Marketorr Admin` }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: isEdit ? `Edit ${service.name}` : "New service",
			subtitle: "Fields map one-to-one onto the public service page.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/services",
				variant: "secondary",
				children: "Cancel"
			})
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-6 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-6 lg:col-span-2",
					children: [
						/* @__PURE__ */ jsx(Panel, {
							title: "Basics",
							children: /* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [
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
										label: "Display index",
										error: errors.index_label,
										required: true,
										hint: "Shown beside the name, e.g. 02",
										children: /* @__PURE__ */ jsx(Input, {
											value: data.index_label,
											onChange: (e) => setData("index_label", e.target.value),
											placeholder: "02"
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Slug",
										error: errors.slug,
										required: true,
										hint: `Live address: /services/${slugify(data.slug) || "your-slug"} · lowercase letters, numbers and hyphens`,
										className: "sm:col-span-2",
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
										required: true,
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsx(Input, {
											value: data.short,
											onChange: (e) => setData("short", e.target.value),
											placeholder: "Websites engineered to convert."
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Description",
										error: errors.description,
										required: true,
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsx(Textarea, {
											rows: 4,
											value: data.description,
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
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Gradient end",
										error: errors.accent_to,
										hint: "Optional second colour.",
										children: /* @__PURE__ */ jsx(ColorInput, {
											value: data.accent_to ?? "",
											onChange: (v) => setData("accent_to", v)
										})
									})
								]
							})
						}),
						/* @__PURE__ */ jsxs(Panel, {
							title: "Capabilities",
							description: "Shown as tags on the service page.",
							children: [/* @__PURE__ */ jsx(RepeatableList, {
								values: data.capabilities,
								onChange: (v) => setData("capabilities", v),
								placeholder: "UX Strategy",
								addLabel: "Add capability",
								errors,
								name: "capabilities"
							}), errors.capabilities && /* @__PURE__ */ jsx("p", {
								className: "mt-2 text-[12px] text-[#ff6b6b]",
								children: errors.capabilities
							})]
						}),
						/* @__PURE__ */ jsxs(Panel, {
							title: "Deliverables",
							description: "The “what you get” list.",
							children: [/* @__PURE__ */ jsx(RepeatableList, {
								values: data.deliverables,
								onChange: (v) => setData("deliverables", v),
								placeholder: "Design system",
								addLabel: "Add deliverable",
								errors,
								name: "deliverables"
							}), errors.deliverables && /* @__PURE__ */ jsx("p", {
								className: "mt-2 text-[12px] text-[#ff6b6b]",
								children: errors.deliverables
							})]
						}),
						/* @__PURE__ */ jsxs(Panel, {
							title: "Outcomes",
							description: "Headline stat blocks, value and label.",
							children: [/* @__PURE__ */ jsx(RepeatableRows, {
								values: data.outcomes,
								onChange: (v) => setData("outcomes", v),
								fields: [{
									key: "value",
									placeholder: "2.4x"
								}, {
									key: "label",
									placeholder: "Avg. conversion lift"
								}],
								addLabel: "Add outcome",
								errors,
								name: "outcomes"
							}), errors.outcomes && /* @__PURE__ */ jsx("p", {
								className: "mt-2 text-[12px] text-[#ff6b6b]",
								children: errors.outcomes
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "space-y-6",
					children: /* @__PURE__ */ jsx(Panel, {
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
								hint: "Leave empty to append to the end.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									min: "0",
									value: data.sort_order ?? "",
									onChange: (e) => setData("sort_order", e.target.value)
								})
							})]
						})
					})
				}),
				/* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					className: "w-full",
					children: processing ? "Saving…" : isEdit ? "Save changes" : "Create service"
				})
			]
		})
	] });
}
ServiceForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ServiceForm as default };
