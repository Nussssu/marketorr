import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { c as PageHeader, l as Panel, n as Button, o as Field, s as Input } from "./ui-B5Z9349N.js";
import { Head, useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Media/Form.jsx
function MediaForm({ medium }) {
	const isEdit = Boolean(medium);
	const [preview, setPreview] = useState(medium?.file_url ?? null);
	const [isDragging, setIsDragging] = useState(false);
	const dragDepth = useRef(0);
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
	useEffect(() => () => {
		if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
	}, [preview]);
	const onDragEnter = (event) => {
		event.preventDefault();
		dragDepth.current += 1;
		setIsDragging(true);
	};
	const onDragLeave = (event) => {
		event.preventDefault();
		dragDepth.current = Math.max(0, dragDepth.current - 1);
		if (dragDepth.current === 0) setIsDragging(false);
	};
	const onDrop = (event) => {
		event.preventDefault();
		dragDepth.current = 0;
		setIsDragging(false);
		onFileChange(event.dataTransfer.files?.[0] ?? null);
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
							children: /* @__PURE__ */ jsxs("label", {
								onDragEnter,
								onDragOver: (event) => {
									event.preventDefault();
									event.dataTransfer.dropEffect = "copy";
								},
								onDragLeave,
								onDrop,
								className: `group flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-all ${isDragging ? "border-[var(--brand-2)] bg-[var(--brand-2)]/10 shadow-[0_0_0_1px_var(--brand-2)]" : "border-[var(--field-line)] bg-[var(--bg)] hover:border-[var(--brand-2)]/70 hover:bg-[var(--chip)]"}`,
								children: [
									/* @__PURE__ */ jsx("input", {
										type: "file",
										accept: "image/jpeg,image/png,image/webp,image/gif",
										onChange: (event) => onFileChange(event.target.files?.[0] ?? null),
										className: "sr-only"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform group-hover:-translate-y-0.5",
										style: { background: "linear-gradient(135deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
										"aria-hidden": true,
										children: /* @__PURE__ */ jsx("svg", {
											viewBox: "0 0 24 24",
											fill: "none",
											className: "h-5 w-5",
											stroke: "currentColor",
											strokeWidth: "1.8",
											children: /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												d: "M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
											})
										})
									}),
									/* @__PURE__ */ jsx("span", {
										className: "mt-4 font-display text-[14px] font-bold text-[var(--ink-strong)]",
										children: isDragging ? "Drop image here" : "Drag and drop an image"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "mt-1 text-[12px] text-[var(--mute)]",
										children: "or click to browse"
									}),
									data.file && /* @__PURE__ */ jsx("span", {
										className: "mt-3 max-w-full truncate rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--ink)]",
										children: data.file.name
									})
								]
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
