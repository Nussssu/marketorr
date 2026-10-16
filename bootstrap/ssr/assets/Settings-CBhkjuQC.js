import { t as AdminLayout } from "./AdminLayout-BQCMuKcm.js";
import { c as PageHeader, m as Toggle, n as Button, o as Field, p as Textarea, s as Input, y as MediaPickerField } from "./ui-DUoJPW2G.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
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
* ones added. Saved on its own, as the "Footer: Social links" menu.
*/
function SocialLinks({ socials }) {
	const blank = {
		label: "",
		url: "",
		enabled: true
	};
	const { data, setData, transform, put, processing, errors, isDirty } = useForm({ items: socials.length ? socials : [blank] });
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
	transform((current) => ({ items: current.items.filter((row) => row.label.trim() !== "" || row.url.trim() !== "").map((row) => ({
		label: row.label,
		url: row.url,
		opens_in_new_tab: true,
		enabled: row.enabled,
		show_on_desktop: true,
		show_on_mobile: true,
		children: []
	})) }));
	const submit = (e) => {
		e.preventDefault();
		put("/admin/menus/footer_social", {
			preserveScroll: true,
			preserveState: true
		});
	};
	const shown = data.items.filter((row) => row.enabled && row.url).length;
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		className: "space-y-5",
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
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => update(index, { enabled: !row.enabled }),
										"aria-pressed": row.enabled,
										className: `rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${row.enabled ? "border-[var(--field-line)] text-[var(--ink)] hover:bg-[var(--chip)]" : "border-[#ff6b6b]/40 text-[#ff6b6b] hover:bg-[#ff6b6b]/10"}`,
										title: row.enabled ? "Shown on the site — click to hide" : "Hidden from the site — click to show",
										children: row.enabled ? "Shown" : "Hidden"
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
										onClick: () => setData("items", data.items.filter((_, i) => i !== index)),
										className: "rounded-lg px-2.5 py-2 text-[12px] text-[#ff6b6b] hover:opacity-80",
										children: "Remove"
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
		}), /* @__PURE__ */ jsxs("div", {
			className: "sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)]/95 p-4 shadow-xl backdrop-blur-md",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-[12px] text-[var(--mute)]",
				children: isDirty ? "You have unsaved changes." : "Social links update the footer and the Contact page as soon as they are saved."
			}), /* @__PURE__ */ jsx(Button, {
				type: "submit",
				disabled: processing,
				className: "min-w-[140px]",
				children: processing ? "Saving…" : "Save social links"
			})]
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
		if (typeof window !== "undefined") window.history.replaceState(null, "", `#${id}`);
	};
	const [ogPreview, setOgPreview] = useState(settings.og_image_url);
	const [logoPreview, setLogoPreview] = useState(settings.logo_url);
	const [logoDarkPreview, setLogoDarkPreview] = useState(settings.logo_dark_url);
	const [faviconPreview, setFaviconPreview] = useState(settings.favicon_url);
	const [footerLogoPreview, setFooterLogoPreview] = useState(settings.footer_logo_url);
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
	const expandAll = () => {
		setOpenSections({
			general: true,
			header_branding: true,
			footer_social: true,
			seo_meta: true
		});
	};
	const collapseAll = () => {
		setOpenSections({
			general: false,
			header_branding: false,
			footer_social: false,
			seo_meta: false
		});
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
		sitemap_enabled: settings.sitemap_enabled ?? true
	});
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
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8",
			children: [/* @__PURE__ */ jsx(PageHeader, {
				title: "Site settings",
				subtitle: "Site-wide configuration: general details and branding, social links and SEO. Page content is edited under Pages."
			}), /* @__PURE__ */ jsxs("div", {
				className: `flex items-center gap-2 shrink-0 ${tab === "social" ? "invisible" : ""}`,
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: expandAll,
					className: "rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--mute)] hover:text-[var(--ink)]",
					children: "Expand all"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: collapseAll,
					className: "rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--mute)] hover:text-[var(--ink)]",
					children: "Collapse all"
				})]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mb-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1",
			role: "tablist",
			"aria-label": "Settings sections",
			children: TABS.map((item) => /* @__PURE__ */ jsx("button", {
				type: "button",
				role: "tab",
				"aria-selected": tab === item.id,
				onClick: () => chooseTab(item.id),
				className: `rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${tab === item.id ? "text-white shadow-sm" : "text-[var(--mute)] hover:text-[var(--ink)]"}`,
				style: tab === item.id ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0,
				children: item.label
			}, item.id))
		}),
		tab === "social" && /* @__PURE__ */ jsx(SocialLinks, { socials }),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: `space-y-5 ${tab === "social" ? "hidden" : ""}`,
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
				/* @__PURE__ */ jsx("div", {
					className: tab === "seo" ? "space-y-5" : "hidden",
					children: /* @__PURE__ */ jsx(AccordionWidget, {
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
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)]/95 p-4 shadow-xl backdrop-blur-md",
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
			]
		})
	] });
}
Settings.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { Settings as default };
