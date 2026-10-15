import { t as AdminLayout } from "./AdminLayout-Cz9lUOUz.js";
import { _ as ProjectGalleryManager, c as PageHeader, f as Select, h as slugify, l as Panel, n as Button, o as Field, p as Textarea, r as ColorInput, s as Input, u as RepeatableList, v as MediaPickerField } from "./ui-0XaBzweS.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Projects/Form.jsx
function ProjectForm({ project, statuses, categories = [] }) {
	const isEdit = Boolean(project);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const [preview, setPreview] = useState(project?.image_url ?? null);
	const { data, setData, post, processing, errors } = useForm({
		_method: isEdit ? "put" : "post",
		slug: project?.slug ?? "",
		title: project?.title ?? "",
		client: project?.client ?? "",
		category_id: project?.category_id ?? "",
		year: project?.year ?? String((/* @__PURE__ */ new Date()).getFullYear()),
		description: project?.description ?? "",
		metric: project?.metric ?? "",
		metric_label: project?.metric_label ?? "",
		accent: project?.accent ?? "#891FFB",
		image: null,
		image_alt: project?.image_alt ?? "",
		external_url: project?.external_url ?? "",
		tags: project?.tags?.length ? project.tags : [""],
		featured: project?.featured ?? false,
		status: project?.status ?? "published",
		sort_order: project?.sort_order ?? "",
		gallery_images: project?.gallery_images ?? []
	});
	const onTitleChange = (value) => {
		setData((current) => ({
			...current,
			title: value,
			slug: slugLocked ? current.slug : slugify(value)
		}));
	};
	const onImageChange = (fileOrUrl, asset) => {
		setData((current) => ({
			...current,
			image: fileOrUrl,
			image_alt: current.image_alt || asset?.alt_text || ""
		}));
		if (typeof fileOrUrl === "string") setPreview(fileOrUrl || (project?.image_url ?? null));
		else if (fileOrUrl instanceof File) setPreview(URL.createObjectURL(fileOrUrl));
		else setPreview(project?.image_url ?? null);
	};
	const submit = (e) => {
		e.preventDefault();
		post(isEdit ? `/admin/projects/${project.id}` : "/admin/projects", { forceFormData: true });
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} project | Marketorr Admin` }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: isEdit ? `Edit ${project.title}` : "New project",
			subtitle: "Fields map one-to-one onto the public case study page.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/projects",
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
									label: "Title",
									error: errors.title,
									required: true,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Input, {
										value: data.title,
										onChange: (e) => onTitleChange(e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Slug",
									error: errors.slug,
									required: true,
									hint: "Used in the URL: /work/your-slug",
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
									label: "Client",
									error: errors.client,
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.client,
										onChange: (e) => setData("client", e.target.value),
										placeholder: "Acme Co · Manufacturer"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Category",
									error: errors.category_id,
									required: true,
									hint: categories.length === 0 ? "No categories yet, create one first." : void 0,
									children: /* @__PURE__ */ jsxs(Select, {
										value: data.category_id,
										onChange: (e) => setData("category_id", e.target.value),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Select a category…"
										}), categories.map((category) => /* @__PURE__ */ jsx("option", {
											value: category.id,
											children: category.label
										}, category.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Year",
									error: errors.year,
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.year,
										onChange: (e) => setData("year", e.target.value)
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
									label: "Description",
									error: errors.description,
									required: true,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 5,
										value: data.description,
										onChange: (e) => setData("description", e.target.value)
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Headline metric",
						description: "Optional: shown over the cover image and on the case study.",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Metric",
								error: errors.metric,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.metric ?? "",
									onChange: (e) => setData("metric", e.target.value),
									placeholder: "2100%"
								})
							}), /* @__PURE__ */ jsx(Field, {
								label: "Metric label",
								error: errors.metric_label,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.metric_label ?? "",
									onChange: (e) => setData("metric_label", e.target.value),
									placeholder: "Organic Traffic Increase"
								})
							})]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "External case study",
						description: "Optional: when the full write-up lives elsewhere (Behance, Dribbble, the client's own site), the project page links out to it instead of repeating it.",
						children: /* @__PURE__ */ jsx(Field, {
							label: "Case study URL",
							error: errors.external_url,
							children: /* @__PURE__ */ jsx(Input, {
								type: "url",
								value: data.external_url ?? "",
								onChange: (e) => setData("external_url", e.target.value),
								placeholder: "https://www.behance.net/gallery/..."
							})
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Cover image",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ jsx(MediaPickerField, {
								label: "Cover Image",
								error: errors.image,
								required: !isEdit,
								hint: isEdit ? "Leave empty to keep the current image." : "Choose an asset from library or upload new.",
								preview,
								value: typeof data.image === "string" ? data.image : "",
								onChange: (url, asset) => onImageChange(url, asset)
							}), /* @__PURE__ */ jsx(Field, {
								label: "Image alt text",
								error: errors.image_alt,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.image_alt,
									onChange: (e) => setData("image_alt", e.target.value)
								})
							})]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Project gallery",
						description: "Dedicated-page images in exact display order, first row renders first. Add from the Media Library, reorder with ↑ ↓, or remove.",
						children: /* @__PURE__ */ jsx(ProjectGalleryManager, {
							values: data.gallery_images ?? [],
							onChange: (gallery_images) => setData("gallery_images", gallery_images),
							error: errors.gallery_images
						})
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Publishing",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-5",
							children: [
								/* @__PURE__ */ jsx(Field, {
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
								}),
								/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-3 text-[13px] text-[var(--ink)]",
									children: [/* @__PURE__ */ jsx("input", {
										type: "checkbox",
										checked: data.featured,
										onChange: (e) => setData("featured", e.target.checked),
										className: "h-4 w-4 rounded border-[var(--field-line)]"
									}), "Feature on the home page"]
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Sort order",
									error: errors.sort_order,
									hint: "Leave empty to append to the end.",
									children: /* @__PURE__ */ jsx(Input, {
										type: "number",
										min: "0",
										value: data.sort_order ?? "",
										onChange: (e) => setData("sort_order", e.target.value)
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsxs(Panel, {
						title: "Tags",
						children: [/* @__PURE__ */ jsx(RepeatableList, {
							values: data.tags,
							onChange: (tags) => setData("tags", tags),
							placeholder: "SEO",
							addLabel: "Add tag",
							errors,
							name: "tags"
						}), errors.tags && /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[12px] text-[#ff6b6b]",
							children: errors.tags
						})]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						className: "w-full",
						children: processing ? "Saving…" : isEdit ? "Save changes" : "Create project"
					})
				]
			})]
		})
	] });
}
ProjectForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ProjectForm as default };
