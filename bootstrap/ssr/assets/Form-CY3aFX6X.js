import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { c as PageHeader, f as Select, g as Textarea, l as Panel, n as Button, o as Field, p as StickyColumn, r as ColorInput, s as Input, y as slugify } from "./ui-Dz4ZqU85.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/ServiceGroups/Form.jsx
function ServiceGroupForm({ group, statuses }) {
	const isEdit = Boolean(group);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const { data, setData, post, put, processing, errors, isDirty } = useForm({
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
			className: "grid items-start gap-6 pb-24 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ jsx(StickyColumn, {
					bottomOffset: 96,
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
				}),
				/* @__PURE__ */ jsx(StickyColumn, {
					bottomOffset: 96,
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
				/* @__PURE__ */ jsx("div", {
					className: "fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-6 lg:left-64 lg:px-10",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("p", {
							className: `flex items-center gap-2 text-[13px] font-semibold ${isDirty ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: `h-2 w-2 rounded-full ${isDirty ? "bg-[#f5a524]" : "bg-[var(--field-line)]"}`,
								"aria-hidden": true
							}), isDirty ? "You have unsaved changes." : "No unsaved changes."]
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: processing,
							children: processing ? "Saving…" : isEdit ? "Save changes" : "Create tab"
						})]
					})
				})
			]
		})
	] });
}
ServiceGroupForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ServiceGroupForm as default };
