import { t as AdminLayout } from "./AdminLayout-DeYqDoJZ.js";
import { c as PageHeader, l as Panel, n as Button, o as Field, s as Input } from "./ui-Dv8OUCCw.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Media/Form.jsx
function MediaForm({ medium }) {
	const isEdit = Boolean(medium);
	const [preview, setPreview] = useState(medium?.file_url ?? null);
	const { data, setData, post, processing, errors } = useForm({
		_method: isEdit ? "put" : "post",
		file: null,
		category: medium?.category ?? "",
		usage_location: medium?.usage_location ?? "",
		alt_text: medium?.alt_text ?? ""
	});
	const onFileChange = (file) => {
		setData("file", file);
		setPreview(file ? URL.createObjectURL(file) : medium?.file_url ?? null);
	};
	const submit = (e) => {
		e.preventDefault();
		post(isEdit ? `/admin/media/${medium.id}` : "/admin/media", { forceFormData: true });
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "Upload"} media | Marketorr Admin` }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: isEdit ? `Edit ${medium.filename}` : "Upload media",
			subtitle: isEdit ? "Replace the file or tidy up its catalogue entry." : "Files land in the shared library with their catalogue entry.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/media",
				variant: "secondary",
				children: "Cancel"
			})
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-6 lg:col-span-2",
				children: [/* @__PURE__ */ jsx(Panel, {
					title: "File",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid gap-5 sm:grid-cols-2",
						children: [/* @__PURE__ */ jsx(Field, {
							label: "Image file",
							error: errors.file,
							required: !isEdit,
							hint: isEdit ? "Leave empty to keep the current file: choosing one replaces it." : "JPG, PNG, WebP or GIF, up to 12 MB.",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ jsx("input", {
								type: "file",
								accept: "image/jpeg,image/png,image/webp,image/gif",
								onChange: (e) => onFileChange(e.target.files?.[0] ?? null),
								className: "w-full text-[13px] text-[var(--mute)] file:mr-3 file:rounded-lg file:border file:border-[var(--field-line)] file:bg-[var(--chip)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-[var(--ink)]"
							})
						}), preview && /* @__PURE__ */ jsx("div", {
							className: "sm:col-span-2",
							children: /* @__PURE__ */ jsx("img", {
								src: preview,
								alt: "",
								className: "aspect-[16/10] w-full max-w-sm rounded-lg border border-[var(--line)] object-cover"
							})
						})]
					})
				}), /* @__PURE__ */ jsx(Panel, {
					title: "Catalogue entry",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid gap-5 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "Category / service",
								error: errors.category,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.category,
									onChange: (e) => setData("category", e.target.value),
									placeholder: "Rebranding"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Usage location",
								error: errors.usage_location,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.usage_location,
									onChange: (e) => setData("usage_location", e.target.value),
									placeholder: "Rebranding service page"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Alt text",
								error: errors.alt_text,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Input, {
									value: data.alt_text,
									onChange: (e) => setData("alt_text", e.target.value),
									placeholder: "Describe the image"
								})
							})
						]
					})
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [isEdit && /* @__PURE__ */ jsx(Panel, {
					title: "Details",
					children: /* @__PURE__ */ jsxs("dl", {
						className: "space-y-3 text-[13px]",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between gap-4",
								children: [/* @__PURE__ */ jsx("dt", {
									className: "text-[var(--ink-faint)]",
									children: "Filename"
								}), /* @__PURE__ */ jsx("dd", {
									className: "truncate text-right text-[var(--ink)]",
									children: medium.filename
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between gap-4",
								children: [/* @__PURE__ */ jsx("dt", {
									className: "text-[var(--ink-faint)]",
									children: "Size"
								}), /* @__PURE__ */ jsx("dd", {
									className: "text-[var(--ink)]",
									children: [medium.dimensions, medium.size].filter(Boolean).join(" · ") || "-"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between gap-4",
								children: [/* @__PURE__ */ jsx("dt", {
									className: "text-[var(--ink-faint)]",
									children: "Uploaded"
								}), /* @__PURE__ */ jsx("dd", {
									className: "text-[var(--ink)]",
									children: medium.created_at ?? "-"
								})]
							})
						]
					})
				}), /* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: processing,
					className: "w-full",
					children: processing ? "Saving…" : isEdit ? "Save changes" : "Upload media"
				})]
			})]
		})
	] });
}
MediaForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { MediaForm as default };
