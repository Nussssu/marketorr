import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { C as MediaPickerField, _ as Toggle, b as tabClass, c as PageHeader, g as Textarea, h as TAB_GRADIENT, i as ConfirmDialog, m as TAB_BAR_CLASS, n as Button, o as Field, s as Input, x as useConfirm } from "./ui-Dz4ZqU85.js";
import { Head, router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Settings.jsx
var TABS = [
	{
		id: "general",
		label: "General"
	},
	{
		id: "social",
		label: "Social links"
	},
	{
		id: "seo",
		label: "SEO"
	}
];
/** An empty row for a custom SEO section's meta tag list. */
var BLANK_META_TAG = {
	attribute: "name",
	key: "",
	content: ""
};
/** A client-only key per custom SEO section, so its open state follows it. */
var seoUid = 0;
var newSeoUid = () => `s${++seoUid}`;
/** Platforms the site has an icon for; any other name still works as a text link. */
var PLATFORMS = [
	"LinkedIn",
	"Facebook",
	"Behance",
	"Dribbble",
	"Instagram",
	"X",
	"YouTube"
];
/**
* The site-wide social links — one list for the footer and the Contact page.
* Each link can be edited, reordered, shown or hidden, or removed, and new
* ones added. Changes save automatically, as the "Footer: Social links" menu.
*/
function SocialLinks({ socials }) {
	const blank = {
		label: "",
		url: "",
		enabled: true
	};
	const { data, setData, setDefaults, transform, put, processing, errors, isDirty } = useForm({ items: socials.length ? socials : [blank] });
	const [request, confirm, cancel, run] = useConfirm();
	const askRemove = (index) => {
		const label = data.items[index].label.trim();
		confirm({
			title: `Remove ${label ? `“${label}”` : "this social link"}?`,
			body: "The link will be removed from the list.",
			confirmLabel: "Remove",
			action: () => setData("items", data.items.filter((_, i) => i !== index))
		});
	};
	const update = (index, patch) => setData("items", data.items.map((row, i) => i === index ? {
		...row,
		...patch
	} : row));
	const move = (index, delta) => {
		const target = index + delta;
		if (target < 0 || target >= data.items.length) return;
		const next = [...data.items];
		[next[index], next[target]] = [next[target], next[index]];
		setData("items", next);
	};
	const payload = (items) => ({ items: items.filter((row) => row.label.trim() !== "" || row.url.trim() !== "").map((row) => ({
		id: row.id ?? null,
		label: row.label,
		url: row.url,
		opens_in_new_tab: true,
		enabled: row.enabled,
		show_on_desktop: true,
		show_on_mobile: true,
		children: []
	})) });
	transform((current) => payload(current.items));
	const [toggling, setToggling] = useState(false);
	const toggleShown = (index) => {
		const next = data.items.map((row, i) => i === index ? {
			...row,
			enabled: !row.enabled
		} : row);
		setData("items", next);
		setToggling(true);
		router.put("/admin/menus/footer_social", payload(next), {
			preserveScroll: true,
			preserveState: true,
			onSuccess: () => setDefaults({ items: next }),
			onError: () => setData("items", data.items),
			onFinish: () => setToggling(false)
		});
	};
	const submit = (e) => {
		e.preventDefault();
		put("/admin/menus/footer_social", {
			preserveScroll: true,
			preserveState: true
		});
	};
	useEffect(() => {
		if (!isDirty || toggling) return void 0;
		const timeout = window.setTimeout(() => {
			put("/admin/menus/footer_social", {
				preserveScroll: true,
				preserveState: true,
				onSuccess: () => setDefaults()
			});
		}, 800);
		return () => window.clearTimeout(timeout);
	}, [
		data.items,
		isDirty,
		toggling
	]);
	const shown = data.items.filter((row) => row.enabled && row.url).length;
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		className: "space-y-5 pb-24",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink-strong)]",
					children: "Social links"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-1 text-[12px] text-[var(--mute)]",
					children: [
						"Used across the whole site: the footer's “Follow us” and the Contact page. ",
						shown,
						" shown on the site. Use a platform name (",
						PLATFORMS.join(", "),
						") so the link gets its icon."
					]
				}),
				/* @__PURE__ */ jsx("datalist", {
					id: "social-platforms",
					children: PLATFORMS.map((platform) => /* @__PURE__ */ jsx("option", { value: platform }, platform))
				}),
				/* @__PURE__ */ jsx("ol", {
					className: "mt-5 space-y-3",
					children: data.items.map((row, index) => /* @__PURE__ */ jsxs("li", {
						className: `grid gap-3 rounded-lg border border-[var(--field-line)] p-4 sm:grid-cols-[auto_minmax(0,0.7fr)_minmax(0,1.3fr)_auto] sm:items-end ${row.enabled ? "" : "opacity-60"}`,
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "flex h-7 w-7 items-center justify-center self-center rounded-md border border-[var(--field-line)] font-mono text-[12px] font-bold text-[var(--ink)]",
								children: index + 1
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Platform",
								error: errors[`items.${index}.label`],
								children: /* @__PURE__ */ jsx(Input, {
									list: "social-platforms",
									value: row.label,
									onChange: (e) => update(index, { label: e.target.value }),
									placeholder: "LinkedIn"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Link",
								error: errors[`items.${index}.url`],
								children: /* @__PURE__ */ jsx(Input, {
									value: row.url,
									onChange: (e) => update(index, { url: e.target.value }),
									placeholder: "https://"
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-2 pb-0.5",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "flex items-center gap-2 pr-1",
										children: /* @__PURE__ */ jsx("button", {
											type: "button",
											role: "switch",
											"aria-checked": row.enabled,
											"aria-label": `${row.enabled ? "Hide" : "Show"} ${row.label || "this link"} on the site`,
											onClick: () => toggleShown(index),
											disabled: toggling || processing,
											title: row.enabled ? "Shown on the site — click to hide" : "Hidden from the site — click to show",
											className: `relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-wait ${row.enabled ? "border-transparent" : "border-[var(--field-line)] bg-[var(--chip)]"}`,
											style: row.enabled ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0,
											children: /* @__PURE__ */ jsx("span", { className: `absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all ${row.enabled ? "left-[23px]" : "left-[3px]"}` })
										})
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => move(index, -1),
										disabled: index === 0,
										"aria-label": "Move up",
										className: "rounded-lg border border-[var(--field-line)] px-2.5 py-2 text-[11px] text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "▲"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => move(index, 1),
										disabled: index === data.items.length - 1,
										"aria-label": "Move down",
										className: "rounded-lg border border-[var(--field-line)] px-2.5 py-2 text-[11px] text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "▼"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => askRemove(index),
										"aria-label": "Remove",
										title: "Remove",
										className: "rounded-lg px-2.5 py-2 text-[12px] text-[#ff6b6b] hover:opacity-80",
										children: /* @__PURE__ */ jsxs("svg", {
											"aria-hidden": "true",
											className: "h-4 w-4",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											strokeWidth: "1.8",
											children: [/* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7"
											}), /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												d: "M10 11.5v5M14 11.5v5"
											})]
										})
									})
								]
							})
						]
					}, index))
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setData("items", [...data.items, blank]),
					className: "mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
					children: "+ Add social link"
				})
			]
		}), /* @__PURE__ */ jsx(ConfirmDialog, {
			open: !!request,
			title: request?.title ?? "",
			body: request?.body,
			confirmLabel: request?.confirmLabel,
			onConfirm: run,
			onCancel: cancel
		})]
	});
}
/** Upload field wired to its own live preview using Media Library. */
function ImageField({ label, hint, error, preview, onChange, className = "" }) {
	return /* @__PURE__ */ jsx(Field, {
		label,
		error,
		hint,
		className,
		children: /* @__PURE__ */ jsx(MediaPickerField, {
			preview,
			onChange: (url) => onChange(url),
			hint,
			error
		})
	});
}
/** Accordion / Collapsible Widget Panel */
function AccordionWidget({ id, title, subtitle, badge, icon, isOpen, onToggle, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] transition-colors",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => onToggle(id),
			"aria-expanded": isOpen,
			className: "flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[var(--chip)]/40 focus:outline-none",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3.5",
				children: [icon && /* @__PURE__ */ jsx("span", {
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)]",
					children: icon
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink-strong)]",
						children: title
					}), badge && /* @__PURE__ */ jsx("span", {
						className: "rounded bg-[var(--chip)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--mute)] border border-[var(--line)]",
						children: badge
					})]
				}), subtitle && /* @__PURE__ */ jsx("p", {
					className: "mt-0.5 text-[12px] text-[var(--mute)]",
					children: subtitle
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-[11px] font-bold uppercase tracking-wider text-[var(--mute)] hidden sm:inline",
					children: isOpen ? "Collapse" : "Expand"
				}), /* @__PURE__ */ jsx("span", {
					className: `flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition-transform duration-300 ease-out ${isOpen ? "rotate-180 bg-[var(--chip)]" : ""}`,
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("svg", {
						width: "12",
						height: "12",
						viewBox: "0 0 12 12",
						fill: "none",
						children: /* @__PURE__ */ jsx("path", {
							d: "M2.5 4.5L6 8L9.5 4.5",
							stroke: "currentColor",
							strokeWidth: "1.75",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})
					})
				})]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: `grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`,
			children: /* @__PURE__ */ jsx("div", {
				className: "overflow-hidden",
				children: /* @__PURE__ */ jsx("div", {
					className: "border-t border-[var(--line)] p-6 pt-5 bg-[var(--surface)]",
					children
				})
			})
		})]
	});
}
function Settings({ settings, socials = [] }) {
	const [tab, setTab] = useState(() => {
		const fromHash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
		return TABS.some((item) => item.id === fromHash) ? fromHash : "general";
	});
	const chooseTab = (id) => {
		setTab(id);
		if (id === "seo") setOpenSections((prev) => ({
			...Object.fromEntries(Object.keys(prev).map((key) => [key, key.startsWith("seo_") ? false : prev[key]])),
			seo_meta: true
		}));
		if (id === "general") setOpenSections((prev) => ({
			...prev,
			general: true,
			header_branding: false,
			footer_social: false
		}));
		if (typeof window !== "undefined") window.history.replaceState(null, "", `#${id}`);
	};
	const [ogPreview, setOgPreview] = useState(settings.og_image_url);
	const [logoPreview, setLogoPreview] = useState(settings.logo_url);
	const [logoDarkPreview, setLogoDarkPreview] = useState(settings.logo_dark_url);
	const [faviconPreview, setFaviconPreview] = useState(settings.favicon_url);
	const [footerLogoPreview, setFooterLogoPreview] = useState(settings.footer_logo_url);
	const [emailLogoPreview, setEmailLogoPreview] = useState(settings.email_logo_url);
	const [openSections, setOpenSections] = useState({
		general: true,
		header_branding: false,
		footer_social: false,
		seo_meta: true
	});
	const toggleSection = (key) => {
		setOpenSections((prev) => ({
			...prev,
			[key]: !prev[key]
		}));
	};
	const { data, setData, post, processing, errors } = useForm({
		_method: "put",
		site_name: settings.site_name ?? "",
		logo: null,
		logo_dark: null,
		favicon: null,
		header_sticky: settings.header_sticky ?? true,
		header_cta_text: settings.header_cta_text ?? "Start a Project",
		header_cta_link: settings.header_cta_link ?? "/contact",
		contact_email: settings.contact_email ?? "",
		contact_phone: settings.contact_phone ?? "",
		location_text: settings.location_text ?? "",
		address: settings.address ?? "",
		directions_url: settings.directions_url ?? "",
		copyright_text: settings.copyright_text ?? "",
		footer_intro: settings.footer_intro ?? "",
		footer_logo: null,
		email_logo: settings.email_logo ?? "",
		footer_logo_visible: settings.footer_logo_visible ?? true,
		footer_motto_items: settings.footer_motto_items ?? [
			"IDEA",
			"EXPERIENCE",
			"RESULT"
		],
		meta_default_title: settings.meta_default_title ?? "",
		meta_default_description: settings.meta_default_description ?? "",
		meta_default_og_image: null,
		robots_txt: settings.robots_txt ?? "",
		schema_markup: settings.schema_markup ?? "",
		sitemap_enabled: settings.sitemap_enabled ?? true,
		seo_sections: (settings.seo_sections ?? []).map((section) => ({
			...section,
			uid: newSeoUid()
		}))
	});
	const [seoRequest, confirmSeo, cancelSeo, runSeo] = useConfirm();
	const updateSeoSection = (index, patch) => setData("seo_sections", data.seo_sections.map((section, i) => i === index ? {
		...section,
		...patch
	} : section));
	const updateSeoTag = (index, tagIndex, patch) => updateSeoSection(index, { tags: data.seo_sections[index].tags.map((tag, i) => i === tagIndex ? {
		...tag,
		...patch
	} : tag) });
	const askRemoveSeoSection = (index) => {
		const title = data.seo_sections[index].title.trim();
		confirmSeo({
			title: `Remove ${title ? `“${title}”` : "this section"}?`,
			body: "Its meta tags are taken off the site when you save the settings.",
			confirmLabel: "Remove",
			action: () => setData("seo_sections", data.seo_sections.filter((_, i) => i !== index))
		});
	};
	/** Swaps an upload or chosen media asset in and previews it without waiting for the save. */
	const onImageChange = (field, setPreview, fallback) => (fileOrUrl) => {
		setData(field, fileOrUrl);
		if (typeof fileOrUrl === "string") setPreview(fileOrUrl || fallback);
		else if (fileOrUrl instanceof File) setPreview(URL.createObjectURL(fileOrUrl));
		else setPreview(fallback);
	};
	const onOgChange = (fileOrUrl) => {
		setData("meta_default_og_image", fileOrUrl);
		if (typeof fileOrUrl === "string") setOgPreview(fileOrUrl || settings.og_image_url);
		else if (fileOrUrl instanceof File) setOgPreview(URL.createObjectURL(fileOrUrl));
		else setOgPreview(settings.og_image_url);
	};
	const submit = (e) => {
		e.preventDefault();
		post("/admin/settings", {
			forceFormData: true,
			preserveScroll: true,
			preserveState: true
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Settings | Marketorr Admin" }),
		/* @__PURE__ */ jsx("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8",
			children: /* @__PURE__ */ jsx(PageHeader, {
				title: "Site settings",
				subtitle: "Site-wide configuration: general details and branding, social links and SEO. Page content is edited under Pages."
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: `mb-6 ${TAB_BAR_CLASS}`,
			role: "tablist",
			"aria-label": "Settings sections",
			children: TABS.map((item) => /* @__PURE__ */ jsx("button", {
				type: "button",
				role: "tab",
				"aria-selected": tab === item.id,
				onClick: () => chooseTab(item.id),
				className: `text-[11px] font-bold uppercase tracking-[0.14em] ${tabClass(tab === item.id)}`,
				style: tab === item.id ? TAB_GRADIENT : void 0,
				children: item.label
			}, item.id))
		}),
		tab === "social" && /* @__PURE__ */ jsx(SocialLinks, { socials }),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: `space-y-5 pb-24 ${tab === "social" ? "hidden" : ""}`,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: tab === "general" ? "space-y-5" : "hidden",
					children: [
						/* @__PURE__ */ jsx(AccordionWidget, {
							id: "general",
							title: "General / Site Info",
							subtitle: "Primary agency identity and core contact coordinates.",
							badge: "Default Open",
							isOpen: openSections.general,
							onToggle: toggleSection,
							icon: /* @__PURE__ */ jsxs("svg", {
								width: "18",
								height: "18",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [
									/* @__PURE__ */ jsx("circle", {
										cx: "12",
										cy: "12",
										r: "10"
									}),
									/* @__PURE__ */ jsx("path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }),
									/* @__PURE__ */ jsx("path", { d: "M2 12h20" })
								]
							}),
							children: /* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Site name",
										error: errors.site_name,
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: data.site_name,
											onChange: (e) => setData("site_name", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Contact email",
										error: errors.contact_email,
										required: true,
										hint: "Inquiry notifications are sent here if not overridden in Email & SMTP.",
										children: /* @__PURE__ */ jsx(Input, {
											type: "email",
											value: data.contact_email,
											onChange: (e) => setData("contact_email", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Contact phone",
										error: errors.contact_phone,
										hint: "Leave empty to hide the phone block.",
										children: /* @__PURE__ */ jsx(Input, {
											value: data.contact_phone ?? "",
											onChange: (e) => setData("contact_phone", e.target.value),
											placeholder: "+880 1234 567890"
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Location",
										error: errors.location_text,
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: data.location_text,
											onChange: (e) => setData("location_text", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Office address",
										error: errors.address,
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsx(Input, {
											value: data.address ?? "",
											onChange: (e) => setData("address", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Directions URL",
										error: errors.directions_url,
										hint: "Linked from the contact map.",
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsx(Input, {
											type: "url",
											value: data.directions_url ?? "",
											onChange: (e) => setData("directions_url", e.target.value)
										})
									})
								]
							})
						}),
						/* @__PURE__ */ jsx(AccordionWidget, {
							id: "header_branding",
							title: "Header & Branding",
							subtitle: "Header behavior, sticky navbar toggle, CTA button, logos and favicon.",
							badge: "Navigation",
							isOpen: openSections.header_branding,
							onToggle: toggleSection,
							icon: /* @__PURE__ */ jsxs("svg", {
								width: "18",
								height: "18",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [
									/* @__PURE__ */ jsx("rect", {
										x: "3",
										y: "3",
										width: "18",
										height: "18",
										rx: "2"
									}),
									/* @__PURE__ */ jsx("path", { d: "M3 9h18" }),
									/* @__PURE__ */ jsx("path", { d: "M9 21V9" })
								]
							}),
							children: /* @__PURE__ */ jsxs("div", {
								className: "space-y-6",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4",
									children: "Header Controls"
								}), /* @__PURE__ */ jsxs("div", {
									className: "grid gap-5 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "sm:col-span-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4",
											children: /* @__PURE__ */ jsx(Toggle, {
												checked: data.header_sticky,
												onChange: (value) => setData("header_sticky", value),
												label: "Sticky Header Navigation",
												hint: "When enabled, the header navbar stays pinned to the top of the viewport during page scroll."
											})
										}),
										/* @__PURE__ */ jsx(Field, {
											label: "Header CTA Button Text",
											error: errors.header_cta_text,
											hint: "The primary action button in the top navbar.",
											children: /* @__PURE__ */ jsx(Input, {
												value: data.header_cta_text ?? "",
												onChange: (e) => setData("header_cta_text", e.target.value),
												placeholder: "Start a Project"
											})
										}),
										/* @__PURE__ */ jsx(Field, {
											label: "Header CTA Button Link",
											error: errors.header_cta_link,
											hint: "Internal path (e.g., /contact) or full external URL.",
											children: /* @__PURE__ */ jsx(Input, {
												value: data.header_cta_link ?? "",
												onChange: (e) => setData("header_cta_link", e.target.value),
												placeholder: "/contact"
											})
										})
									]
								})] }), /* @__PURE__ */ jsxs("div", {
									className: "border-t border-[var(--line)] pt-6",
									children: [
										/* @__PURE__ */ jsx("h3", {
											className: "text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-2",
											children: "Brand Assets & Icons"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-[12px] text-[var(--mute)] mb-4",
											children: "Logos and favicon. Leave empty to keep the built-in MARKETORR mark."
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid gap-5 sm:grid-cols-3",
											children: [
												/* @__PURE__ */ jsx(ImageField, {
													label: "Logo (Light Theme)",
													accept: "image/jpeg,image/png,image/webp,image/svg+xml",
													hint: "SVG, PNG or WebP. Max 2 MB.",
													error: errors.logo,
													preview: logoPreview,
													onChange: onImageChange("logo", setLogoPreview, settings.logo_url)
												}),
												/* @__PURE__ */ jsx(ImageField, {
													label: "Logo (Dark Theme)",
													accept: "image/jpeg,image/png,image/webp,image/svg+xml",
													hint: "Optional variant for dark mode.",
													error: errors.logo_dark,
													preview: logoDarkPreview,
													onChange: onImageChange("logo_dark", setLogoDarkPreview, settings.logo_dark_url)
												}),
												/* @__PURE__ */ jsx(ImageField, {
													label: "Favicon",
													accept: "image/png,image/svg+xml,image/x-icon",
													hint: "PNG, SVG or ICO. Max 512 KB.",
													error: errors.favicon,
													preview: faviconPreview,
													onChange: onImageChange("favicon", setFaviconPreview, settings.favicon_url)
												}),
												/* @__PURE__ */ jsx(ImageField, {
													label: "Email Logo",
													hint: "Shown at the top of every email. Emails are dark, so pick a logo for dark backgrounds. Empty uses the dark-theme logo.",
													error: errors.email_logo,
													preview: emailLogoPreview,
													onChange: onImageChange("email_logo", setEmailLogoPreview, settings.logo_dark_url)
												})
											]
										})
									]
								})]
							})
						}),
						/* @__PURE__ */ jsx(AccordionWidget, {
							id: "footer_social",
							title: "Footer Branding",
							subtitle: "Footer logo controls. Edit all footer text and links from Menus.",
							badge: "Footer",
							isOpen: openSections.footer_social,
							onToggle: toggleSection,
							icon: /* @__PURE__ */ jsxs("svg", {
								width: "18",
								height: "18",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								children: [/* @__PURE__ */ jsx("rect", {
									x: "3",
									y: "3",
									width: "18",
									height: "18",
									rx: "2"
								}), /* @__PURE__ */ jsx("path", { d: "M3 15h18" })]
							}),
							children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4",
								children: "Footer Content"
							}), /* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsx("div", {
									className: "sm:col-span-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4",
									children: /* @__PURE__ */ jsx(Toggle, {
										checked: data.footer_logo_visible,
										onChange: (value) => setData("footer_logo_visible", value),
										label: "Show footer logo",
										hint: "Turn off to remove the Marketorr logo from the footer without affecting the header logo."
									})
								}), /* @__PURE__ */ jsx(ImageField, {
									label: "Footer logo",
									error: errors.footer_logo,
									preview: footerLogoPreview,
									onChange: onImageChange("footer_logo", setFooterLogoPreview, settings.footer_logo_url),
									hint: "Optional footer-only logo. Leave empty to use the main Marketorr logo.",
									className: "sm:col-span-2"
								})]
							})] })
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: tab === "seo" ? "space-y-5" : "hidden",
					children: [/* @__PURE__ */ jsx(AccordionWidget, {
						id: "seo_meta",
						title: "SEO & Meta Defaults",
						subtitle: "Global meta tags, OpenGraph sharing preview, XML sitemaps and search engine directives.",
						badge: "SEO",
						isOpen: openSections.seo_meta,
						onToggle: toggleSection,
						icon: /* @__PURE__ */ jsx("svg", {
							width: "18",
							height: "18",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							children: /* @__PURE__ */ jsx("path", { d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" })
						}),
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4",
								children: "Global Meta Tags"
							}), /* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Default Meta Title",
										error: errors.meta_default_title,
										required: true,
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsx(Input, {
											value: data.meta_default_title,
											onChange: (e) => setData("meta_default_title", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Default Meta Description",
										error: errors.meta_default_description,
										required: true,
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsx(Textarea, {
											rows: 3,
											value: data.meta_default_description,
											onChange: (e) => setData("meta_default_description", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx("div", {
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsx(MediaPickerField, {
											label: "Default Social Sharing Image (OG Image)",
											value: typeof data.meta_default_og_image === "string" ? data.meta_default_og_image : "",
											preview: ogPreview,
											onChange: (url) => onOgChange(url),
											error: errors.meta_default_og_image,
											hint: "JPG, PNG or WebP. Recommended size: 1200 × 630 px."
										})
									})
								]
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "border-t border-[var(--line)] pt-6",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ink-strong)] mb-4",
									children: "Search Engines & Indexing"
								}), /* @__PURE__ */ jsxs("div", {
									className: "grid gap-5",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4",
											children: /* @__PURE__ */ jsx(Toggle, {
												checked: data.sitemap_enabled,
												onChange: (value) => setData("sitemap_enabled", value),
												label: "Publish XML Sitemap (/sitemap.xml)",
												hint: "Automatically lists all published pages, services, categories, and portfolio projects."
											})
										}),
										/* @__PURE__ */ jsx(Field, {
											label: "robots.txt Custom Rules",
											error: errors.robots_txt,
											hint: "Leave blank to serve the auto-generated default linking to /sitemap.xml.",
											children: /* @__PURE__ */ jsx(Textarea, {
												rows: 4,
												className: "font-mono text-[12px]",
												value: data.robots_txt ?? "",
												onChange: (e) => setData("robots_txt", e.target.value),
												placeholder: "User-agent: *\nDisallow: /admin"
											})
										}),
										/* @__PURE__ */ jsx(Field, {
											label: "Global Schema Markup (JSON-LD)",
											error: errors.schema_markup,
											hint: "Valid JSON-LD structure injected into <head> for search snippet rich cards.",
											children: /* @__PURE__ */ jsx(Textarea, {
												rows: 5,
												className: "font-mono text-[12px]",
												value: data.schema_markup ?? "",
												onChange: (e) => setData("schema_markup", e.target.value),
												placeholder: "{\"@context\":\"https://schema.org\",\"@type\":\"Organization\",\"name\":\"Marketorr\"}"
											})
										})
									]
								})]
							})]
						})
					}), data.seo_sections.map((section, index) => /* @__PURE__ */ jsx(AccordionWidget, {
						id: `seo_custom_${section.uid}`,
						title: section.title.trim() || "New section",
						subtitle: `${section.tags.length} meta tag${section.tags.length === 1 ? "" : "s"} added to the <head> of every page.`,
						badge: "Meta tags",
						isOpen: Boolean(openSections[`seo_custom_${section.uid}`]),
						onToggle: toggleSection,
						icon: /* @__PURE__ */ jsx("svg", {
							width: "18",
							height: "18",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: /* @__PURE__ */ jsx("path", { d: "m8 7-5 5 5 5M16 7l5 5-5 5" })
						}),
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-5",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Section title",
									error: errors[`seo_sections.${index}.title`],
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: section.title,
										onChange: (e) => updateSeoSection(index, { title: e.target.value }),
										placeholder: "Search console verification"
									})
								}),
								/* @__PURE__ */ jsx("div", {
									className: "space-y-3",
									children: section.tags.map((tag, tagIndex) => /* @__PURE__ */ jsxs("div", {
										className: "grid gap-3 rounded-lg border border-[var(--field-line)] p-4 sm:grid-cols-[140px_minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end",
										children: [
											/* @__PURE__ */ jsx(Field, {
												label: "Attribute",
												children: /* @__PURE__ */ jsxs(Select, {
													value: tag.attribute,
													onChange: (e) => updateSeoTag(index, tagIndex, { attribute: e.target.value }),
													children: [/* @__PURE__ */ jsx("option", {
														value: "name",
														children: "name"
													}), /* @__PURE__ */ jsx("option", {
														value: "property",
														children: "property"
													})]
												})
											}),
											/* @__PURE__ */ jsx(Field, {
												label: tag.attribute === "property" ? "Property" : "Name",
												error: errors[`seo_sections.${index}.tags.${tagIndex}.key`],
												children: /* @__PURE__ */ jsx(Input, {
													value: tag.key,
													onChange: (e) => updateSeoTag(index, tagIndex, { key: e.target.value }),
													placeholder: tag.attribute === "property" ? "og:locale" : "google-site-verification",
													className: "font-mono text-[13px]"
												})
											}),
											/* @__PURE__ */ jsx(Field, {
												label: "Content",
												error: errors[`seo_sections.${index}.tags.${tagIndex}.content`],
												children: /* @__PURE__ */ jsx(Input, {
													value: tag.content,
													onChange: (e) => updateSeoTag(index, tagIndex, { content: e.target.value }),
													placeholder: "Value",
													className: "font-mono text-[13px]"
												})
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => updateSeoSection(index, { tags: section.tags.filter((_, i) => i !== tagIndex) }),
												"aria-label": `Remove meta tag ${tagIndex + 1}`,
												title: "Remove",
												className: "rounded-lg px-2.5 py-2 text-[12px] text-[#ff6b6b] hover:opacity-80",
												children: /* @__PURE__ */ jsxs("svg", {
													"aria-hidden": "true",
													className: "h-4 w-4",
													fill: "none",
													viewBox: "0 0 24 24",
													stroke: "currentColor",
													strokeWidth: "1.8",
													children: [/* @__PURE__ */ jsx("path", {
														strokeLinecap: "round",
														strokeLinejoin: "round",
														d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7"
													}), /* @__PURE__ */ jsx("path", {
														strokeLinecap: "round",
														d: "M10 11.5v5M14 11.5v5"
													})]
												})
											})
										]
									}, tagIndex))
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4",
									children: [/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => updateSeoSection(index, { tags: [...section.tags, { ...BLANK_META_TAG }] }),
										className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
										children: "+ Add meta tag"
									}), /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => askRemoveSeoSection(index),
										className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80",
										children: "Remove section"
									})]
								})
							]
						})
					}, section.uid))]
				}),
				/* @__PURE__ */ jsx(ConfirmDialog, {
					open: !!seoRequest,
					title: seoRequest?.title ?? "",
					body: seoRequest?.body,
					confirmLabel: seoRequest?.confirmLabel,
					onConfirm: runSeo,
					onCancel: cancelSeo
				}),
				/* @__PURE__ */ jsx("div", {
					className: "fixed inset-x-0 bottom-0 z-[150] border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-6 lg:left-64 lg:px-10",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-[12px] text-[var(--mute)]",
							children: "Changes update site configuration and active layout components immediately."
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: processing,
							className: "min-w-[140px]",
							children: processing ? "Saving…" : "Save all settings"
						})]
					})
				})
			]
		})
	] });
}
Settings.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { Settings as default };
