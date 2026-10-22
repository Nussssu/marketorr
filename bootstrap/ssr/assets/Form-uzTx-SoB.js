import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { C as MediaPickerField, S as ProjectGalleryManager, c as PageHeader, d as RepeatableRows, f as Select, g as Textarea, n as Button, o as Field, r as ColorInput, s as Input, u as RepeatableList, v as WidgetPanel, y as slugify } from "./ui-BFNViBV5.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Projects/Form.jsx
var BLANK_BRIEF = {
	overview: "",
	worked_on: [],
	services: [],
	highlights: [],
	client: "",
	website: "",
	behance_url: "",
	source_url: ""
};
var ROBOTS = [
	"index,follow",
	"index,nofollow",
	"noindex,follow",
	"noindex,nofollow"
];
/** A count that turns red once the text passes the length search engines show. */
function LengthHint({ value, limit }) {
	const length = String(value ?? "").length;
	return /* @__PURE__ */ jsxs("span", {
		className: length > limit ? "text-[#ff6b6b]" : "",
		children: [
			length,
			"/",
			limit,
			" characters"
		]
	});
}
var PORTFOLIOS = [
	["", "Follow the category"],
	["branding", "Branding Portfolio"],
	["uiux", "UI/UX Portfolio"]
];
var LAYOUTS = [["", "Case study page"], ["screens", "Screen-by-screen page (UI/UX showcase)"]];
/**
* One project, edited as a stack of widgets that map one-to-one onto the
* public project page. Each widget opens and closes on its own.
*/
function ProjectFormFields({ project, statuses, categories = [], categoriesHref = "/admin/pages" }) {
	const isEdit = Boolean(project);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const [preview, setPreview] = useState(project?.image_url ?? null);
	const { data, setData, post, processing, errors, isDirty, reset, setDefaults } = useForm({
		_method: isEdit ? "put" : "post",
		slug: project?.slug ?? "",
		title: project?.title ?? "",
		heading_scale: project?.heading_scale ?? 100,
		client: project?.client ?? "",
		category_id: project?.category_id ?? "",
		work_group: project?.work_group ?? "",
		layout: project?.layout ?? "",
		discipline: project?.discipline ?? "",
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
		gallery_images: project?.gallery_images ?? [],
		brief: {
			...BLANK_BRIEF,
			...project?.brief ?? {}
		},
		meta_title: project?.meta_title ?? "",
		meta_description: project?.meta_description ?? "",
		meta_og_image: project?.meta_og_image ?? "",
		meta_robots: project?.meta_robots ?? "index,follow",
		canonical_url: project?.canonical_url ?? ""
	});
	const setBrief = (key, value) => setData("brief", {
		...data.brief,
		[key]: value
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
		post(isEdit ? `/admin/projects/${project.id}` : "/admin/projects", {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: () => setDefaults()
		});
	};
	const isShowcase = data.layout === "screens";
	const publicPath = isShowcase ? "/work/portfolio/uiux/" : "/work/";
	const categoryName = categories.find((category) => String(category.id) === String(data.category_id))?.label;
	const filledBrief = Object.values(data.brief).filter((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)).length;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} project | Marketorr Admin` }),
		/* @__PURE__ */ jsxs(PageHeader, {
			title: isEdit ? `Edit ${project.title}` : "New project",
			subtitle: "Each widget maps onto the public project page. Tap a widget to open or close it.",
			children: [isEdit && /* @__PURE__ */ jsx(Button, {
				as: "a",
				href: project.public_url ?? `/work/${project.slug}`,
				target: "_blank",
				rel: "noreferrer",
				variant: "secondary",
				children: "View page ↗"
			}), /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/projects",
				variant: "secondary",
				children: "Cancel"
			})]
		}),
		/* @__PURE__ */ jsxs("form", {
			id: "project-form",
			onSubmit: submit,
			className: "grid gap-6 lg:grid-cols-3 pb-24",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-4 lg:col-span-2",
				children: [
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "Basics",
						summary: data.title || "Title, slug, client, year and description",
						defaultOpen: true,
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-[minmax(0,1fr)_7rem] items-start gap-3 sm:col-span-2",
									children: [/* @__PURE__ */ jsx(Field, {
										label: "Title",
										error: errors.title,
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: data.title,
											onChange: (e) => onTitleChange(e.target.value)
										})
									}), /* @__PURE__ */ jsx(Field, {
										label: "Size (%)",
										error: errors.heading_scale,
										children: /* @__PURE__ */ jsx(Input, {
											type: "number",
											min: 50,
											max: 200,
											step: 5,
											value: data.heading_scale,
											onChange: (e) => setData("heading_scale", e.target.value === "" ? "" : Math.trunc(Number(e.target.value) || 0)),
											onBlur: (e) => setData("heading_scale", e.target.value === "" ? 100 : Math.min(Math.max(Math.trunc(Number(e.target.value) || 0), 50), 200))
										})
									})]
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Slug",
									error: errors.slug,
									required: true,
									hint: `Live address: ${publicPath}${slugify(data.slug) || "your-slug"} · lowercase letters, numbers and hyphens`,
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
									required: !isShowcase,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.client,
										onChange: (e) => setData("client", e.target.value),
										placeholder: "Acme Co · Manufacturer"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Year",
									error: errors.year,
									required: !isShowcase,
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
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "Portfolio & category",
						description: "Where the project is filed on the Our Work pages and in the menu.",
						summary: [categoryName, PORTFOLIOS.find(([value]) => value === (data.work_group ?? ""))?.[1]].filter(Boolean).join(" · ") || "Not filed yet",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Category",
									error: errors.category_id,
									required: !isShowcase,
									hint: /* @__PURE__ */ jsxs(Fragment$1, { children: [
										"Categories are managed on the Our Work page.",
										" ",
										/* @__PURE__ */ jsx(Link, {
											href: categoriesHref,
											className: "underline hover:text-[var(--ink)]",
											children: "Manage categories"
										})
									] }),
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
									label: "Portfolio",
									error: errors.work_group,
									hint: isShowcase ? "Screen-by-screen projects always sit in the UI/UX Portfolio." : "Leave on “Follow the category” unless this project belongs with the other portfolio.",
									children: /* @__PURE__ */ jsx(Select, {
										value: isShowcase ? "uiux" : data.work_group ?? "",
										disabled: isShowcase,
										onChange: (e) => setData("work_group", e.target.value),
										children: PORTFOLIOS.map(([value, label]) => /* @__PURE__ */ jsx("option", {
											value,
											children: label
										}, value || "auto"))
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Page type",
									error: errors.layout,
									hint: "A screen-by-screen page prints every gallery image as one page of the design, labelled by its alt text.",
									children: /* @__PURE__ */ jsx(Select, {
										value: data.layout ?? "",
										onChange: (e) => setData("layout", e.target.value),
										children: LAYOUTS.map(([value, label]) => /* @__PURE__ */ jsx("option", {
											value,
											children: label
										}, value || "case-study"))
									})
								}),
								isShowcase && /* @__PURE__ */ jsx(Field, {
									label: "Discipline",
									error: errors.discipline,
									hint: "Shown under the project name, e.g. Website UI/UX Design.",
									children: /* @__PURE__ */ jsx(Input, {
										value: data.discipline ?? "",
										onChange: (e) => setData("discipline", e.target.value),
										placeholder: "Website UI/UX Design"
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "Project brief",
						description: "The written record on the project page: overview, what was done, services and key figures.",
						summary: filledBrief ? `${filledBrief} field${filledBrief === 1 ? "" : "s"} filled` : "Empty: the page shows no brief",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Overview",
									error: errors["brief.overview"],
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 5,
										value: data.brief.overview,
										onChange: (e) => setBrief("overview", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Client (as shown in the brief)",
									error: errors["brief.client"],
									children: /* @__PURE__ */ jsx(Input, {
										value: data.brief.client,
										onChange: (e) => setBrief("client", e.target.value)
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Client website",
									error: errors["brief.website"],
									children: /* @__PURE__ */ jsx(Input, {
										value: data.brief.website,
										onChange: (e) => setBrief("website", e.target.value),
										placeholder: "https://"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Behance link",
									error: errors["brief.behance_url"],
									children: /* @__PURE__ */ jsx(Input, {
										value: data.brief.behance_url,
										onChange: (e) => setBrief("behance_url", e.target.value),
										placeholder: "https://www.behance.net/gallery/..."
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Source link",
									error: errors["brief.source_url"],
									children: /* @__PURE__ */ jsx(Input, {
										value: data.brief.source_url,
										onChange: (e) => setBrief("source_url", e.target.value),
										placeholder: "https://"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "What we worked on",
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(RepeatableList, {
										values: data.brief.worked_on,
										onChange: (values) => setBrief("worked_on", values),
										placeholder: "Logo design",
										addLabel: "Add item",
										errors,
										name: "brief.worked_on"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Services",
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(RepeatableList, {
										values: data.brief.services,
										onChange: (values) => setBrief("services", values),
										placeholder: "Brand Identity Design",
										addLabel: "Add service",
										errors,
										name: "brief.services"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Highlights",
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(RepeatableRows, {
										values: data.brief.highlights,
										onChange: (values) => setBrief("highlights", values),
										fields: [{
											key: "label",
											placeholder: "Label, e.g. Timeline"
										}, {
											key: "value",
											placeholder: "Value, e.g. 6 weeks"
										}],
										addLabel: "Add highlight",
										errors,
										name: "brief.highlights"
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "Headline metric",
						description: "Optional: shown over the cover image and on the case study.",
						summary: data.metric ? `${data.metric} ${data.metric_label ?? ""}`.trim() : "No metric",
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
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "External case study",
						description: "Optional: when the full write-up lives elsewhere (Behance, Dribbble, the client's own site), the project page links out to it instead of repeating it.",
						summary: data.external_url || "No external link",
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
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "Cover image",
						summary: preview ? "Cover set" : "No cover yet",
						defaultOpen: !isEdit,
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ jsx(MediaPickerField, {
								label: "Cover Image",
								error: errors.image,
								required: !isEdit && !isShowcase,
								hint: isEdit ? "Leave empty to keep the current image." : isShowcase ? "Optional: without a cover, the first screen is used." : "Choose an asset from library or upload new.",
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
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "Project gallery",
						description: isShowcase ? "The design’s screens in exact page order. Each image’s alt text is its page name (e.g. Home, About Us). Add from the Media Library, reorder with ↑ ↓, hide or remove." : "Dedicated-page images in exact display order, first row renders first. Add from the Media Library, reorder with ↑ ↓, or remove.",
						summary: `${(data.gallery_images ?? []).length} image${(data.gallery_images ?? []).length === 1 ? "" : "s"}`,
						children: /* @__PURE__ */ jsx(ProjectGalleryManager, {
							values: data.gallery_images ?? [],
							onChange: (gallery_images) => setData("gallery_images", gallery_images),
							error: errors.gallery_images
						})
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "Publishing",
						summary: `${data.status}${data.featured ? " · featured" : ""}`,
						defaultOpen: true,
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
									}), isShowcase ? "Show in the home page’s UI/UX section" : "Feature on the home page"]
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
					/* @__PURE__ */ jsx(WidgetPanel, {
						title: "SEO",
						description: "How this project's page appears in search results and when shared. Empty fields use the project's title, description and cover.",
						summary: data.meta_title || "Uses the project title and description",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Meta title",
									error: errors.meta_title,
									hint: /* @__PURE__ */ jsx(LengthHint, {
										value: data.meta_title,
										limit: 60
									}),
									children: /* @__PURE__ */ jsx(Input, {
										value: data.meta_title,
										onChange: (e) => setData("meta_title", e.target.value),
										placeholder: `${data.title || "Project"} | Marketorr`
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Meta description",
									error: errors.meta_description,
									hint: /* @__PURE__ */ jsx(LengthHint, {
										value: data.meta_description,
										limit: 160
									}),
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 3,
										value: data.meta_description,
										onChange: (e) => setData("meta_description", e.target.value),
										placeholder: data.description.slice(0, 160)
									})
								}),
								/* @__PURE__ */ jsx(MediaPickerField, {
									label: "Share image",
									hint: "Leave empty to use the cover image.",
									value: data.meta_og_image,
									error: errors.meta_og_image,
									onChange: (url) => setData("meta_og_image", url)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Robots",
									error: errors.meta_robots,
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
									children: /* @__PURE__ */ jsx(Input, {
										value: data.canonical_url,
										onChange: (e) => setData("canonical_url", e.target.value),
										placeholder: "https://"
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsxs(WidgetPanel, {
						title: "Tags",
						summary: data.tags.filter(Boolean).join(", ") || "No tags",
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
					Object.keys(errors).length > 0 && /* @__PURE__ */ jsx("p", {
						className: "rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-[12px] text-[#ff6b6b]",
						children: "Some fields need attention. Open the widgets above to see which."
					})
				]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:left-64",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("p", {
					className: `flex items-center gap-2 text-[13px] font-semibold ${isDirty ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: `h-2 w-2 rounded-full ${isDirty ? "bg-[#f5a524]" : "bg-[var(--field-line)]"}`,
						"aria-hidden": true
					}), isDirty ? "You have unsaved changes." : isEdit ? "No unsaved changes." : "Fill in the project, then create it."]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [isDirty && /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => reset(),
						disabled: processing,
						children: "Discard"
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						form: "project-form",
						disabled: processing,
						children: processing ? "Saving…" : isEdit ? "Save changes" : "Create project"
					})]
				})]
			})
		})
	] });
}
/**
* Keyed by project, so a newly created project (which stays on its form)
* starts a fresh form in edit mode rather than keeping the create form's state.
*/
function ProjectForm(props) {
	return /* @__PURE__ */ jsx(ProjectFormFields, { ...props }, props.project?.id ?? "new");
}
ProjectForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ProjectForm as default };
