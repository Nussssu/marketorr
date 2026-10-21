import { t as AdminLayout } from "./AdminLayout-B5J1pLuh.js";
import { S as MediaPickerField, c as PageHeader, f as Select, h as Textarea, l as Panel, n as Button, o as Field, r as ColorInput, s as Input, u as RepeatableList, v as slugify } from "./ui-B5Z9349N.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/SubServices/Form.jsx
/** How many projects the public page's related-work row shows. */
var RELATED_LIMIT = 4;
var ROW_ICON = "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--ink-faint)] transition-colors hover:border-[var(--field-line)] hover:bg-[var(--chip)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30";
/**
* Mirrors `SubServiceRelatedWork` on the server: pinned projects lead, then
* projects with a matching tag, then the rest of the portfolio tops the row
* up — so the editor sees what the page will show before saving.
*/
function previewRelated(options, pins, match) {
	const terms = match.map((term) => term.trim().toLowerCase()).filter(Boolean);
	const pinned = pins.map((slug) => options.find((option) => option.slug === slug)).filter(Boolean);
	const matching = options.filter((option) => option.tags.some((tag) => terms.includes(tag.toLowerCase())));
	const related = [...new Map([...pinned, ...matching].map((option) => [option.slug, option])).values()].slice(0, RELATED_LIMIT);
	const rest = options.filter((option) => !related.some((entry) => entry.slug === option.slug)).slice(0, RELATED_LIMIT - related.length);
	return [...related.map((option) => ({
		...option,
		related: true
	})), ...rest.map((option) => ({
		...option,
		related: false
	}))];
}
function Thumb({ src, alt }) {
	return src ? /* @__PURE__ */ jsx("img", {
		src,
		alt,
		loading: "lazy",
		className: "h-12 w-16 shrink-0 rounded-md border border-[var(--line)] object-cover"
	}) : /* @__PURE__ */ jsx("span", {
		className: "h-12 w-16 shrink-0 rounded-md border border-[var(--line)] bg-[var(--chip)]",
		"aria-hidden": true
	});
}
/**
* Related work, picked rather than typed: hand-picked projects (in order)
* lead the row, and match tags pull in more projects carrying that tag.
*/
function RelatedWorkPicker({ options, pins, onPinsChange, match, onMatchChange, groupName }) {
	const [browsing, setBrowsing] = useState(false);
	const [search, setSearch] = useState("");
	const [tagDraft, setTagDraft] = useState("");
	const cleanPins = pins.filter(Boolean);
	const cleanMatch = match.filter(Boolean);
	const available = options.filter((option) => !cleanPins.includes(option.slug));
	const query = search.trim().toLowerCase();
	const found = query ? available.filter((option) => `${option.title} ${option.meta} ${option.tags.join(" ")}`.toLowerCase().includes(query)) : available;
	const tagSuggestions = [...new Set(options.flatMap((option) => option.tags))].filter((tag) => !cleanMatch.some((term) => term.toLowerCase() === tag.toLowerCase())).sort((a, b) => a.localeCompare(b));
	const preview = previewRelated(options, cleanPins, cleanMatch);
	const movePin = (index, direction) => {
		const next = [...cleanPins];
		[next[index], next[index + direction]] = [next[index + direction], next[index]];
		onPinsChange(next);
	};
	const addTag = (tag) => {
		const value = tag.trim();
		if (!value || cleanMatch.some((term) => term.toLowerCase() === value.toLowerCase())) return;
		onMatchChange([...cleanMatch, value]);
		setTagDraft("");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
						children: "Hand-picked projects"
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => setBrowsing((open) => !open),
						children: browsing ? "Done" : "+ Add related work"
					})]
				}),
				cleanPins.length === 0 ? /* @__PURE__ */ jsx("p", {
					className: "rounded-lg border border-dashed border-[var(--field-line)] px-4 py-3 text-[13px] text-[var(--mute)]",
					children: "None picked yet. Add projects to show them first, in this order."
				}) : /* @__PURE__ */ jsx("ul", {
					className: "space-y-2",
					children: cleanPins.map((slug, index) => {
						const option = options.find((entry) => entry.slug === slug);
						return /* @__PURE__ */ jsxs("li", {
							className: "flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2",
							children: [
								/* @__PURE__ */ jsx(Thumb, {
									src: option?.image,
									alt: option?.title ?? slug
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate text-[13px] font-semibold text-[var(--ink-strong)]",
										children: option?.title ?? slug
									}), /* @__PURE__ */ jsx("p", {
										className: "truncate text-[11px] text-[var(--ink-faint)]",
										children: option ? option.meta : `Not in the ${groupName} portfolio (unpublished or no cover), so it is skipped.`
									})]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => movePin(index, -1),
									disabled: index === 0,
									className: ROW_ICON,
									title: "Move up",
									"aria-label": `Move ${option?.title ?? slug} up`,
									children: "↑"
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => movePin(index, 1),
									disabled: index === cleanPins.length - 1,
									className: ROW_ICON,
									title: "Move down",
									"aria-label": `Move ${option?.title ?? slug} down`,
									children: "↓"
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => onPinsChange(cleanPins.filter((entry) => entry !== slug)),
									className: `${ROW_ICON} hover:text-[#ff6b6b]`,
									title: "Remove",
									"aria-label": `Remove ${option?.title ?? slug}`,
									children: "✕"
								})
							]
						}, slug);
					})
				}),
				browsing && /* @__PURE__ */ jsxs("div", {
					className: "mt-3 rounded-xl border border-[var(--field-line)] bg-[var(--bg)] p-3",
					children: [/* @__PURE__ */ jsx(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: `Search the ${groupName} portfolio…`,
						"aria-label": "Search projects"
					}), found.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "px-1 pt-3 text-[13px] text-[var(--mute)]",
						children: available.length === 0 ? "Every project is already picked." : "No project matches that search."
					}) : /* @__PURE__ */ jsx("ul", {
						className: "mt-3 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2",
						children: found.map((option) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => onPinsChange([...cleanPins, option.slug]),
							className: "flex w-full items-center gap-3 rounded-lg border border-[var(--line)] p-2 text-left transition-colors hover:border-[var(--brand-3)] hover:bg-[var(--chip)]",
							children: [
								/* @__PURE__ */ jsx(Thumb, {
									src: option.image,
									alt: option.title
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ jsx("span", {
										className: "block truncate text-[13px] font-semibold text-[var(--ink-strong)]",
										children: option.title
									}), /* @__PURE__ */ jsx("span", {
										className: "block truncate text-[11px] text-[var(--ink-faint)]",
										children: option.meta
									})]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[18px] text-[var(--ink-faint)]",
									"aria-hidden": true,
									children: "+"
								})
							]
						}) }, option.slug))
					})]
				})
			] }),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("p", {
					className: "mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
					children: "Match tags"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-2",
					children: [cleanMatch.map((term) => /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-1.5 rounded-full border border-[var(--field-line)] bg-[var(--chip)] py-1 pl-3 pr-1.5 text-[12px] text-[var(--ink)]",
						children: [term, /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => onMatchChange(cleanMatch.filter((entry) => entry !== term)),
							className: "rounded-full px-1 text-[var(--ink-faint)] hover:text-[#ff6b6b]",
							"aria-label": `Remove tag ${term}`,
							children: "✕"
						})]
					}, term)), cleanMatch.length === 0 && /* @__PURE__ */ jsx("span", {
						className: "text-[13px] text-[var(--mute)]",
						children: "No tags. Projects carrying a tag added here join the row."
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-3 flex gap-2",
					children: [
						/* @__PURE__ */ jsx(Input, {
							value: tagDraft,
							onChange: (e) => setTagDraft(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addTag(tagDraft);
								}
							},
							list: "related-tag-suggestions",
							placeholder: "Type or choose a tag, then Add",
							"aria-label": "New match tag"
						}),
						/* @__PURE__ */ jsx("datalist", {
							id: "related-tag-suggestions",
							children: tagSuggestions.map((tag) => /* @__PURE__ */ jsx("option", { value: tag }, tag))
						}),
						/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => addTag(tagDraft),
							children: "Add"
						})
					]
				})
			] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
				children: "What the page will show"
			}), preview.length === 0 ? /* @__PURE__ */ jsxs("p", {
				className: "text-[13px] text-[var(--mute)]",
				children: [
					"The ",
					groupName,
					" portfolio has no projects with a cover yet, so the section stays hidden."
				]
			}) : /* @__PURE__ */ jsx("ul", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: preview.map((entry) => /* @__PURE__ */ jsxs("li", { children: [
					/* @__PURE__ */ jsx("img", {
						src: entry.image,
						alt: entry.title,
						loading: "lazy",
						className: "aspect-[4/3] w-full rounded-lg border border-[var(--line)] object-cover"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1.5 truncate text-[12px] font-semibold text-[var(--ink-strong)]",
						children: entry.title
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: entry.related ? "Related" : "Fills the row"
					})
				] }, entry.slug))
			})] })
		]
	});
}
var BLANK_SECTION = {
	eyebrow: "",
	heading: "",
	body: "",
	images: []
};
/**
* The case study as a form instead of raw JSON: a meta line, then ordered
* sections of eyebrow, heading, body and images from the media library.
*/
function CaseStudyEditor({ value, onChange, error }) {
	const study = value ?? {
		meta: "",
		sections: []
	};
	const sections = study.sections ?? [];
	const setSections = (next) => onChange({
		...study,
		sections: next
	});
	const updateSection = (index, patch) => setSections(sections.map((section, i) => i === index ? {
		...section,
		...patch
	} : section));
	const moveSection = (index, direction) => {
		const next = [...sections];
		[next[index], next[index + direction]] = [next[index + direction], next[index]];
		setSections(next);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			error && /* @__PURE__ */ jsx("p", {
				className: "text-[12px] text-[#ff6b6b]",
				children: error
			}),
			/* @__PURE__ */ jsx(Field, {
				label: "Meta line",
				hint: "Small line above the story, e.g. when and how it was made.",
				children: /* @__PURE__ */ jsx(Input, {
					value: study.meta ?? "",
					onChange: (e) => onChange({
						...study,
						meta: e.target.value
					})
				})
			}),
			sections.map((section, index) => /* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
						children: ["Section ", index + 1]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center",
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => moveSection(index, -1),
								disabled: index === 0,
								className: ROW_ICON,
								title: "Move up",
								"aria-label": `Move section ${index + 1} up`,
								children: "↑"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => moveSection(index, 1),
								disabled: index === sections.length - 1,
								className: ROW_ICON,
								title: "Move down",
								"aria-label": `Move section ${index + 1} down`,
								children: "↓"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setSections(sections.filter((_, i) => i !== index)),
								className: `${ROW_ICON} hover:text-[#ff6b6b]`,
								title: "Remove section",
								"aria-label": `Remove section ${index + 1}`,
								children: "✕"
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Eyebrow",
							children: /* @__PURE__ */ jsx(Input, {
								value: section.eyebrow ?? "",
								onChange: (e) => updateSection(index, { eyebrow: e.target.value }),
								placeholder: "About the project"
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Heading",
							children: /* @__PURE__ */ jsx(Input, {
								value: section.heading ?? "",
								onChange: (e) => updateSection(index, { heading: e.target.value })
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Text",
							children: /* @__PURE__ */ jsx(Textarea, {
								rows: 3,
								value: section.body ?? "",
								onChange: (e) => updateSection(index, { body: e.target.value })
							})
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
							children: "Images"
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [(section.images ?? []).map((image, imageIndex) => /* @__PURE__ */ jsxs("div", {
								className: "rounded-lg border border-[var(--line)] p-3",
								children: [/* @__PURE__ */ jsx(MediaPickerField, {
									label: `Image ${imageIndex + 1}`,
									value: image.src ?? "",
									preview: image.src ?? "",
									onChange: (url) => updateSection(index, { images: section.images.map((entry, i) => i === imageIndex ? {
										...entry,
										src: url
									} : entry) })
								}), /* @__PURE__ */ jsxs("div", {
									className: "mt-3 flex items-end gap-2",
									children: [/* @__PURE__ */ jsx(Field, {
										label: "Alt text",
										className: "flex-1",
										children: /* @__PURE__ */ jsx(Input, {
											value: image.alt ?? "",
											onChange: (e) => updateSection(index, { images: section.images.map((entry, i) => i === imageIndex ? {
												...entry,
												alt: e.target.value
											} : entry) })
										})
									}), /* @__PURE__ */ jsx(Button, {
										type: "button",
										variant: "secondary",
										onClick: () => updateSection(index, { images: section.images.filter((_, i) => i !== imageIndex) }),
										children: "Remove"
									})]
								})]
							}, imageIndex)), /* @__PURE__ */ jsx(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => updateSection(index, { images: [...section.images ?? [], {
									src: "",
									alt: ""
								}] }),
								children: "+ Add image"
							})]
						})] })
					]
				})]
			}, index)),
			/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "secondary",
				onClick: () => setSections([...sections, { ...BLANK_SECTION }]),
				children: "+ Add section"
			})
		]
	});
}
/** Labels for the page copy fields, in the order the page shows them. */
var PAGE_FIELDS = [
	{
		key: "work_label",
		label: "Related work label"
	},
	{
		key: "work_heading",
		label: "Related work heading"
	},
	{
		key: "portfolio_label",
		label: "Portfolio button"
	},
	{
		key: "deliverables_heading",
		label: "Deliverables card heading"
	},
	{
		key: "practice_heading",
		label: "Practice card heading"
	},
	{
		key: "practice_body",
		label: "Practice card text (after the tagline)",
		multiline: true
	},
	{
		key: "discuss_label",
		label: "Discuss button"
	},
	{
		key: "discuss_url",
		label: "Discuss button link"
	},
	{
		key: "start_label",
		label: "Start a project button"
	},
	{
		key: "start_url",
		label: "Start a project button link"
	}
];
function SubServiceForm({ item, groups, statuses, relatedOptions = {}, pageDefaults = {} }) {
	const isEdit = Boolean(item);
	const [slugLocked, setSlugLocked] = useState(isEdit);
	const { data, setData, post, put, processing, errors, transform } = useForm({
		service_group_id: item?.service_group_id ?? groups[0]?.id ?? "",
		slug: item?.slug ?? "",
		name: item?.name ?? "",
		short: item?.short ?? "",
		description: item?.description ?? "",
		deliverables: item?.deliverables?.length ? item.deliverables : [""],
		image: item?.image ?? "",
		image_alt: item?.image_alt ?? "",
		accent: item?.accent ?? "#507AF4",
		related_match: item?.related_match ?? [],
		related_pin: item?.related_pin ?? [],
		case_study: item?.case_study ?? null,
		page_content: {
			...pageDefaults,
			...item?.page_content ?? {}
		},
		meta_title: item?.meta_title ?? "",
		meta_description: item?.meta_description ?? "",
		meta_og_image: item?.meta_og_image ?? "",
		meta_robots: item?.meta_robots ?? "index,follow",
		canonical_url: item?.canonical_url ?? "",
		status: item?.status ?? "published",
		sort_order: item?.sort_order ?? ""
	});
	const onNameChange = (value) => {
		setData((current) => ({
			...current,
			name: value,
			slug: slugLocked ? current.slug : slugify(value)
		}));
	};
	const groupSlug = groups.find((group) => String(group.id) === String(data.service_group_id))?.slug;
	const groupName = groups.find((group) => String(group.id) === String(data.service_group_id))?.name ?? "tab";
	transform((current) => ({
		...current,
		case_study: current.case_study?.sections?.length ? JSON.stringify(current.case_study) : ""
	}));
	const submit = (e) => {
		e.preventDefault();
		if (isEdit) put(`/admin/sub-services/${item.id}`);
		else post("/admin/sub-services");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${isEdit ? "Edit" : "New"} sub-service | Marketorr Admin` }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: isEdit ? `Edit ${item.name}` : "New sub-service",
			subtitle: "Fields map one-to-one onto the public sub-service page.",
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/sub-services",
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
									label: "Tab",
									error: errors.service_group_id,
									required: true,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Select, {
										value: data.service_group_id,
										onChange: (e) => setData("service_group_id", e.target.value),
										children: groups.map((group) => /* @__PURE__ */ jsx("option", {
											value: group.id,
											children: group.name
										}, group.id))
									})
								}),
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
									label: "Slug",
									error: errors.slug,
									required: true,
									hint: `Live address: /services/${groups.find((group) => String(group.id) === String(data.service_group_id))?.slug ?? "tab"}/${slugify(data.slug) || "your-slug"} · lowercase letters, numbers and hyphens`,
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
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Input, {
										value: data.short ?? "",
										onChange: (e) => setData("short", e.target.value),
										placeholder: "Positioning that makes choosing you obvious."
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Description",
									error: errors.description,
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 4,
										value: data.description ?? "",
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
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Showcase image",
						description: "The visual the tile, transition and hero all share. Empty renders the placeholder plate.",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ jsx(MediaPickerField, {
								label: "Image",
								error: errors.image,
								hint: "Choose an asset from the library. Upload target: 16:10, 1600×1000.",
								preview: typeof data.image === "string" ? data.image : "",
								value: typeof data.image === "string" ? data.image : "",
								onChange: (url) => setData("image", url)
							}), /* @__PURE__ */ jsx(Field, {
								label: "Image alt text",
								error: errors.image_alt,
								children: /* @__PURE__ */ jsx(Input, {
									value: data.image_alt ?? "",
									onChange: (e) => setData("image_alt", e.target.value)
								})
							})]
						})
					}),
					/* @__PURE__ */ jsxs(Panel, {
						title: "Deliverables",
						description: "The “what you get” list on the dedicated page.",
						children: [/* @__PURE__ */ jsx(RepeatableList, {
							values: data.deliverables,
							onChange: (v) => setData("deliverables", v),
							placeholder: "Positioning statement",
							addLabel: "Add deliverable",
							errors,
							name: "deliverables"
						}), errors.deliverables && /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[12px] text-[#ff6b6b]",
							children: errors.deliverables
						})]
					}),
					/* @__PURE__ */ jsxs(Panel, {
						title: "Related work",
						description: `Up to ${RELATED_LIMIT} projects from the ${groupName} portfolio. Hand-picked ones lead, tagged ones follow, and the rest of the portfolio fills any gap.`,
						children: [/* @__PURE__ */ jsx(RelatedWorkPicker, {
							options: relatedOptions[groupSlug] ?? [],
							pins: data.related_pin,
							onPinsChange: (v) => setData("related_pin", v),
							match: data.related_match,
							onMatchChange: (v) => setData("related_match", v),
							groupName
						}), (errors.related_pin || errors.related_match) && /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[12px] text-[#ff6b6b]",
							children: errors.related_pin ?? errors.related_match
						})]
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Page text",
						description: "The headings and buttons on the dedicated page. {name} and {category} fill in the live names; an emptied field goes back to its default.",
						children: /* @__PURE__ */ jsx("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: PAGE_FIELDS.map((field) => /* @__PURE__ */ jsx(Field, {
								label: field.label,
								error: errors[`page_content.${field.key}`],
								className: field.multiline ? "sm:col-span-2" : "",
								children: field.multiline ? /* @__PURE__ */ jsx(Textarea, {
									rows: 3,
									value: data.page_content[field.key] ?? "",
									placeholder: pageDefaults[field.key],
									onChange: (e) => setData("page_content", {
										...data.page_content,
										[field.key]: e.target.value
									})
								}) : /* @__PURE__ */ jsx(Input, {
									value: data.page_content[field.key] ?? "",
									placeholder: pageDefaults[field.key],
									onChange: (e) => setData("page_content", {
										...data.page_content,
										[field.key]: e.target.value
									})
								})
							}, field.key))
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Case study",
						description: "Optional long-form story below the page. Leave without sections for no case study.",
						children: /* @__PURE__ */ jsx(CaseStudyEditor, {
							value: data.case_study,
							onChange: (v) => setData("case_study", v),
							error: errors.case_study
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
								hint: "Leave empty to append to the end of its tab.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									min: "0",
									value: data.sort_order ?? "",
									onChange: (e) => setData("sort_order", e.target.value)
								})
							})]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "SEO",
						description: "How this page appears in search results and when shared. Empty fields use the page's name, description and image.",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-5",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Meta title",
									error: errors.meta_title,
									hint: `${data.meta_title.length}/60 characters`,
									children: /* @__PURE__ */ jsx(Input, {
										value: data.meta_title,
										onChange: (e) => setData("meta_title", e.target.value),
										placeholder: `${data.name || "Sub-service"} | Marketorr`
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Meta description",
									error: errors.meta_description,
									hint: `${data.meta_description.length}/160 characters`,
									children: /* @__PURE__ */ jsx(Textarea, {
										rows: 3,
										value: data.meta_description,
										onChange: (e) => setData("meta_description", e.target.value),
										placeholder: data.description || data.short
									})
								}),
								/* @__PURE__ */ jsx(MediaPickerField, {
									label: "Share image",
									error: errors.meta_og_image,
									hint: "Empty uses the showcase image.",
									value: data.meta_og_image,
									preview: data.meta_og_image,
									onChange: (url) => setData("meta_og_image", url)
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Robots",
									error: errors.meta_robots,
									children: /* @__PURE__ */ jsx(Select, {
										value: data.meta_robots,
										onChange: (e) => setData("meta_robots", e.target.value),
										children: [
											"index,follow",
											"index,nofollow",
											"noindex,follow",
											"noindex,nofollow"
										].map((value) => /* @__PURE__ */ jsx("option", {
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
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						className: "w-full",
						children: processing ? "Saving…" : isEdit ? "Save changes" : "Create sub-service"
					})
				]
			})]
		})
	] });
}
SubServiceForm.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { SubServiceForm as default };
