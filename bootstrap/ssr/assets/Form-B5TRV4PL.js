import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { c as PageHeader, f as Select, h as Textarea, l as Panel, n as Button, o as Field, r as ColorInput, s as Input, v as slugify } from "./ui-B5Z9349N.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/ServiceGroups/Form.jsx
function ServiceGroupForm({ group, statuses }) {
	const isEdit = Boolean(group);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const { data, setData, post, put, processing, errors } = useForm({
		slug: group?.slug ?? "",
		name: group?.name ?? "",
		tagline: group?.tagline ?? "",
		accent: group?.accent ?? "#891FFB",
		status: group?.status ?? "published",
		sort_order: group?.sort_order ?? ""
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
		if (isEdit) put(`/admin/service-groups/${group.id}`);
		else post("/admin/service-groups");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} service tab | Marketorr Admin` }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: isEdit ? `Edit ${group.name}` : "New service tab",
			subtitle: "A tab on the public Services page. Sub-services filed under it render inside it.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/service-groups",
				variant: "secondary",
				children: "Cancel"
			})
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsx("div", {
				className: "space-y-6 lg:col-span-2",
				children: /* @__PURE__ */ jsx(Panel, {
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
									onChange: (e) => onNameChange(e.target.value),
									placeholder: "Branding"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Slug",
								error: errors.slug,
								required: true,
								hint: `Opens this tab: /services#${slugify(data.slug) || "your-tab"} · lowercase letters, numbers and hyphens`,
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
								error: errors.tagline,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Textarea, {
									rows: 2,
									value: data.tagline ?? "",
									onChange: (e) => setData("tagline", e.target.value),
									placeholder: "Identities that demand attention."
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
				})
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
							hint: "Leave empty to append to the end.",
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
					children: processing ? "Saving…" : isEdit ? "Save changes" : "Create tab"
				})]
			})]
		})
	] });
}
ServiceGroupForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ServiceGroupForm as default };
