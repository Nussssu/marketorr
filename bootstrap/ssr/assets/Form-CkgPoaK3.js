import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { C as MediaPickerField, c as PageHeader, f as Select, g as Textarea, l as Panel, n as Button, o as Field, s as Input, y as slugify } from "./ui-Dz4ZqU85.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Pages/Form.jsx
var ROBOTS = [
	"index,follow",
	"index,nofollow",
	"noindex,follow",
	"noindex,nofollow"
];
function PageForm({ page, statuses }) {
	const isEdit = Boolean(page);
	const isSystem = page?.is_system ?? false;
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const [preview, setPreview] = useState(page?.og_image_url ?? null);
	const { data, setData, post, processing, errors } = useForm({
		_method: isEdit ? "put" : "post",
		slug: page?.slug ?? "",
		title: page?.title ?? "",
		status: page?.status ?? "published",
		sort_order: page?.sort_order ?? "",
		meta_title: page?.meta_title ?? "",
		meta_description: page?.meta_description ?? "",
		og_image: null,
		meta_robots: page?.meta_robots ?? "index,follow",
		canonical_url: page?.canonical_url ?? "",
		schema_markup: page?.schema_markup ?? ""
	});
	const onTitleChange = (value) => {
		setData((current) => ({
			...current,
			title: value,
			slug: slugLocked || isSystem ? current.slug : slugify(value)
		}));
	};
	const onOgChange = (fileOrUrl) => {
		setData("og_image", fileOrUrl);
		if (typeof fileOrUrl === "string") setPreview(fileOrUrl || (page?.og_image_url ?? null));
		else if (fileOrUrl instanceof File) setPreview(URL.createObjectURL(fileOrUrl));
		else setPreview(page?.og_image_url ?? null);
	};
	const submit = (e) => {
		e.preventDefault();
		post(isEdit ? `/admin/pages/${page.id}` : "/admin/pages", { forceFormData: true });
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} page | Marketorr Admin` }),
		/* @__PURE__ */ jsxs(PageHeader, {
			title: isEdit ? `Edit ${page.title}` : "New page",
			subtitle: "Page details and the SEO that overrides the site defaults.",
			children: [isEdit && /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: `/admin/pages/${page.id}/builder`,
				variant: "secondary",
				children: "Sections"
			}), /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/pages",
				variant: "secondary",
				children: "Cancel"
			})]
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-6 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-6 lg:col-span-2",
					children: [/* @__PURE__ */ jsx(Panel, {
						title: "Basics",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Title",
								error: errors.title,
								required: true,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Input, {
									value: data.title,
									onChange: (e) => onTitleChange(e.target.value)
								})
							}), /* @__PURE__ */ jsx(Field, {
								label: "Slug",
								error: errors.slug,
								required: !isSystem,
								hint: isSystem ? "Locked: this page backs a built-in route." : `Live address: /${slugify(data.slug) || "your-slug"} · lowercase letters, numbers and hyphens`,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Input, {
									value: data.slug,
									disabled: isSystem,
									onChange: (e) => {
										setSlugLocked(true);
										setData("slug", e.target.value);
									}
								})
							})]
						})
					}), /* @__PURE__ */ jsx(Panel, {
						title: "SEO",
						description: "Blank fields fall back to the site defaults in Settings.",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Meta title",
									error: errors.meta_title,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Input, {
										value: data.meta_title,
										onChange: (e) => setData("meta_title", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Meta description",
									error: errors.meta_description,
									hint: `${data.meta_description.length}/500 characters`,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 3,
										value: data.meta_description,
										onChange: (e) => setData("meta_description", e.target.value)
									})
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
									hint: "Optional, full URL.",
									children: /* @__PURE__ */ jsx(Input, {
										value: data.canonical_url,
										onChange: (e) => setData("canonical_url", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Schema markup (JSON-LD)",
									error: errors.schema_markup,
									hint: "Valid JSON. Rendered into the page head.",
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 6,
										className: "font-mono text-[12px]",
										value: data.schema_markup,
										onChange: (e) => setData("schema_markup", e.target.value),
										placeholder: "{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\"}"
									})
								})
							]
						})
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ jsx(Panel, {
						title: "Social image",
						children: /* @__PURE__ */ jsx(MediaPickerField, {
							label: "OG image",
							error: errors.og_image,
							hint: "JPG, PNG or WebP. Max 4 MB.",
							preview,
							value: typeof data.og_image === "string" ? data.og_image : "",
							onChange: (url) => onOgChange(url)
						})
					}), /* @__PURE__ */ jsx(Panel, {
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
								hint: "Leave blank to append.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									min: "0",
									value: data.sort_order,
									onChange: (e) => setData("sort_order", e.target.value)
								})
							})]
						})
					})]
				}),
				/* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					className: "w-full",
					children: processing ? "Saving…" : isEdit ? "Save page" : "Create page"
				})
			]
		})
	] });
}
PageForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { PageForm as default };
