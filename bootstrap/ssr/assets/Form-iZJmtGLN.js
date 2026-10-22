import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { C as MediaPickerField, c as PageHeader, f as Select, g as Textarea, l as Panel, n as Button, o as Field, r as ColorInput, s as Input, y as slugify } from "./ui-BFNViBV5.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Categories/Form.jsx
function CategoryForm({ category, statuses, parents = [] }) {
	const isEdit = Boolean(category);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const [preview, setPreview] = useState(category?.thumbnail_url ?? null);
	const { data, setData, post, processing, errors } = useForm({
		_method: isEdit ? "put" : "post",
		parent_id: category?.parent_id ?? "",
		slug: category?.slug ?? "",
		name: category?.name ?? "",
		description: category?.description ?? "",
		thumbnail: null,
		accent: category?.accent ?? "#891FFB",
		status: category?.status ?? "published",
		sort_order: category?.sort_order ?? ""
	});
	const onNameChange = (value) => {
		setData((current) => ({
			...current,
			name: value,
			slug: slugLocked ? current.slug : slugify(value)
		}));
	};
	const onThumbnailChange = (fileOrUrl) => {
		setData("thumbnail", fileOrUrl);
		if (typeof fileOrUrl === "string") setPreview(fileOrUrl || (category?.thumbnail_url ?? null));
		else if (fileOrUrl instanceof File) setPreview(URL.createObjectURL(fileOrUrl));
		else setPreview(category?.thumbnail_url ?? null);
	};
	const submit = (e) => {
		e.preventDefault();
		post(isEdit ? `/admin/categories/${category.id}` : "/admin/categories", { forceFormData: true });
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} category | Marketorr Admin` }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: isEdit ? `Edit ${category.name}` : "New category",
			subtitle: "Categories file projects and can nest one level deep.",
			children: /* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "secondary",
				onClick: () => window.history.back(),
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
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Input, {
									value: data.name,
									onChange: (e) => onNameChange(e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Slug",
								error: errors.slug,
								required: true,
								hint: `Saved as: ${slugify(data.slug) || "your-category"} · used when filtering by category; lowercase letters, numbers and hyphens`,
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
								label: "Parent category",
								error: errors.parent_id,
								hint: "Leave empty for a top-level discipline.",
								children: /* @__PURE__ */ jsxs(Select, {
									value: data.parent_id ?? "",
									onChange: (e) => setData("parent_id", e.target.value),
									children: [/* @__PURE__ */ jsx("option", {
										value: "",
										children: "None (top level)"
									}), parents.map((parent) => /* @__PURE__ */ jsx("option", {
										value: parent.id,
										children: parent.label
									}, parent.id))]
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Accent colour",
								error: errors.accent,
								children: /* @__PURE__ */ jsx(ColorInput, {
									value: data.accent,
									onChange: (v) => setData("accent", v)
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Description",
								error: errors.description,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Textarea, {
									rows: 4,
									value: data.description,
									onChange: (e) => setData("description", e.target.value)
								})
							})
						]
					})
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Thumbnail",
						children: /* @__PURE__ */ jsx(MediaPickerField, {
							label: "Image",
							error: errors.thumbnail,
							hint: "JPG, PNG, WebP or SVG. Max 2 MB.",
							preview,
							value: typeof data.thumbnail === "string" ? data.thumbnail : "",
							onChange: (url) => onThumbnailChange(url)
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
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
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						className: "w-full",
						children: processing ? "Saving…" : isEdit ? "Save category" : "Create category"
					})
				]
			})]
		})
	] });
}
CategoryForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { CategoryForm as default };
