import { t as AdminLayout } from "./AdminLayout-DeYqDoJZ.js";
import { a as EmptyState, c as PageHeader, g as useConfirm, i as ConfirmDialog, l as Panel, n as Button, o as Field, s as Input, t as Badge } from "./ui-Dv8OUCCw.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Media/Index.jsx
function FetchFromUrl() {
	const { data, setData, post, processing, errors, reset } = useForm({
		url: "",
		category: "",
		usage_location: "",
		alt_text: ""
	});
	const submit = (e) => {
		e.preventDefault();
		post("/admin/media/fetch", {
			preserveScroll: true,
			onSuccess: () => reset()
		});
	};
	return /* @__PURE__ */ jsx(Panel, {
		title: "Fetch from URL",
		description: "Download a remote image straight into the library, useful for portfolio artwork.",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "grid gap-5 md:grid-cols-2",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Image URL",
					error: errors.url,
					required: true,
					className: "md:col-span-2",
					children: /* @__PURE__ */ jsx(Input, {
						value: data.url,
						onChange: (e) => setData("url", e.target.value),
						placeholder: "https://…/cover.jpg"
					})
				}),
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
					className: "md:col-span-2",
					children: /* @__PURE__ */ jsx(Input, {
						value: data.alt_text,
						onChange: (e) => setData("alt_text", e.target.value),
						placeholder: "Describe the image"
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "md:col-span-2",
					children: /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						children: processing ? "Fetching…" : "Fetch into library"
					})
				})
			]
		})
	});
}
function MediaIndex({ media, categories = [] }) {
	const [rows, setRows] = useState(media);
	const [filter, setFilter] = useState("");
	const [request, confirm, cancel, run] = useConfirm();
	useEffect(() => {
		setRows(media);
	}, [media]);
	const visible = filter ? rows.filter((m) => m.category === filter) : rows;
	const askDelete = (medium) => {
		confirm({
			title: `Delete “${medium.filename}”?`,
			body: "The file is removed from storage as well as the library. Pages using it will lose their image.",
			action: () => router.delete(`/admin/media/${medium.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Media | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Media",
			subtitle: `${rows.length} files. Uploads, fetched artwork and every replacement live here.`,
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/media/create",
				children: "Upload media"
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-6",
			children: [/* @__PURE__ */ jsx(FetchFromUrl, {}), /* @__PURE__ */ jsxs(Panel, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ jsx("label", {
							className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							htmlFor: "media-filter",
							children: "Category"
						}),
						/* @__PURE__ */ jsxs("select", {
							id: "media-filter",
							value: filter,
							onChange: (e) => setFilter(e.target.value),
							className: "rounded-lg border border-[var(--field-line)] bg-transparent px-3 py-2 text-[13px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "All"
							}), categories.map((category) => /* @__PURE__ */ jsx("option", {
								value: category,
								children: category
							}, category))]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-[12px] text-[var(--ink-faint)]",
							children: [visible.length, " shown"]
						})
					]
				}), visible.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No media yet, upload the first file or fetch one from a URL." }) : /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full min-w-[860px] text-left text-[13px]",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
							children: [
								/* @__PURE__ */ jsx("th", {
									className: "pb-3 pr-4 font-bold",
									children: "Preview"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "pb-3 pr-4 font-bold",
									children: "Filename"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "pb-3 pr-4 font-bold",
									children: "Category"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "pb-3 pr-4 font-bold",
									children: "Usage"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "pb-3 pr-4 font-bold",
									children: "Uploaded"
								}),
								/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
							]
						}) }), /* @__PURE__ */ jsx("tbody", { children: visible.map((medium) => /* @__PURE__ */ jsxs("tr", {
							className: "border-t border-[var(--line)]",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4",
									children: /* @__PURE__ */ jsx("img", {
										src: medium.file_url,
										alt: "",
										className: "h-10 w-16 shrink-0 rounded object-cover",
										loading: "lazy"
									})
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 pr-4",
									children: [/* @__PURE__ */ jsx("p", {
										className: "max-w-[220px] truncate font-semibold text-[var(--ink)]",
										title: medium.filename,
										children: medium.filename
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[12px] text-[var(--ink-faint)]",
										children: [medium.dimensions, medium.size].filter(Boolean).join(" · ") || medium.mime_type
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4",
									children: /* @__PURE__ */ jsx(Badge, {
										tone: "published",
										children: medium.category
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "max-w-[220px] truncate py-3 pr-4 text-[var(--mute)]",
									title: medium.usage_location ?? "",
									children: medium.usage_location ?? "-"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 pr-4 text-[var(--mute)]",
									children: medium.created_at ?? "-"
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 text-right whitespace-nowrap",
									children: [/* @__PURE__ */ jsx(Link, {
										href: `/admin/media/${medium.id}/edit`,
										className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
										children: "Edit"
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => askDelete(medium),
										className: "ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80",
										children: "Delete"
									})]
								})
							]
						}, medium.id)) })]
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsx(ConfirmDialog, {
			open: !!request,
			title: request?.title ?? "",
			body: request?.body,
			onConfirm: run,
			onCancel: cancel
		})
	] });
}
MediaIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { MediaIndex as default };
