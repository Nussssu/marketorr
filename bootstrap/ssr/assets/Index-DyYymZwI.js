import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { f as Select, i as ConfirmDialog, n as Button, x as useConfirm } from "./ui-Dz4ZqU85.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Media/Index.jsx
var SECTIONS = [
	["all", "All files"],
	["branding", "Branding"],
	["uiux", "UI/UX"],
	["other", "Other"]
];
var FILTERS = [
	["all", "All"],
	["images", "Images"],
	["videos", "Videos"],
	["gif", "GIF"],
	["documents", "Documents"]
];
var ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,.pdf,.doc,.docx,.txt,.zip";
/** A file's kind, as the library groups and labels it. */
function kindOf(medium) {
	const mime = String(medium.mime_type ?? "");
	if (mime === "image/gif") return "GIF";
	if (mime.startsWith("image/") || medium.is_image) return "Image";
	if (mime.startsWith("video/")) return "Video";
	return "Document";
}
/** One of the icon buttons along the bottom of a media card. */
var CARD_ACTION = "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
var STAT_CARDS = [
	[
		"total_files",
		"Total Files",
		"files"
	],
	[
		"storage_used",
		"Storage Used",
		"storage"
	],
	[
		"images",
		"Images",
		"images"
	],
	[
		"used_in_products",
		"Used in Products",
		"products"
	]
];
function Icon({ name, className = "h-5 w-5" }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.7",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className,
		"aria-hidden": true,
		children: {
			files: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 7.5h16v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-11Z" }), /* @__PURE__ */ jsx("path", { d: "M8 7.5V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8v1.7" })] }),
			storage: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("ellipse", {
				cx: "12",
				cy: "6",
				rx: "7.5",
				ry: "3"
			}), /* @__PURE__ */ jsx("path", { d: "M4.5 6v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6M4.5 12v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" })] }),
			images: /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsx("rect", {
					x: "3.5",
					y: "4",
					width: "17",
					height: "16",
					rx: "2"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "9",
					cy: "9",
					r: "1.5"
				}),
				/* @__PURE__ */ jsx("path", { d: "m5 17 4.2-4.2a1.5 1.5 0 0 1 2.1 0l2 2 1.4-1.4a1.5 1.5 0 0 1 2.1 0L20 16.6" })
			] }),
			products: /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsx("path", { d: "m4 8 8-4 8 4-8 4-8-4Z" }),
				/* @__PURE__ */ jsx("path", { d: "m4 8 8 4 8-4v8l-8 4-8-4V8Z" }),
				/* @__PURE__ */ jsx("path", { d: "M12 12v8" })
			] }),
			upload: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" }), /* @__PURE__ */ jsx("path", { d: "M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" })] }),
			search: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("circle", {
				cx: "11",
				cy: "11",
				r: "6.5"
			}), /* @__PURE__ */ jsx("path", { d: "m16 16 4 4" })] }),
			copy: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "8",
				width: "11",
				height: "11",
				rx: "2"
			}), /* @__PURE__ */ jsx("path", { d: "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" })] }),
			link: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" }), /* @__PURE__ */ jsx("path", { d: "M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" })] }),
			check: /* @__PURE__ */ jsx("path", { d: "m5 12.5 4.5 4.5L19 7.5" }),
			file: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M6 3.5h8l4 4V20H6V3.5Z" }), /* @__PURE__ */ jsx("path", { d: "M14 3.5V8h4" })] }),
			eye: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z" }), /* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "2.5"
			})] }),
			close: /* @__PURE__ */ jsx("path", { d: "m6 6 12 12M18 6 6 18" }),
			edit: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" }), /* @__PURE__ */ jsx("path", { d: "m13.5 6.5 4 4" })] }),
			trash: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" }), /* @__PURE__ */ jsx("path", { d: "M10 11.5v5M14 11.5v5" })] })
		}[name]
	});
}
/**
* Drop or choose files and they upload straight away — no category step.
*
* @param {{ fileInput: { current: HTMLInputElement|null } }} props
*/
function UploadArea({ fileInput, section = "all", projects = [] }) {
	const dragDepth = useRef(0);
	const [dragging, setDragging] = useState(false);
	const sectionCategory = {
		branding: "Branding",
		uiux: "UI/UX"
	}[section] ?? "Other";
	const { data, setData, post, processing, progress, errors, reset, clearErrors } = useForm({
		files: [],
		category: sectionCategory,
		usage_location: "",
		from_library: true
	});
	const chooseProject = (title) => {
		const project = projects.find((item) => item.title === title);
		setData((current) => ({
			...current,
			usage_location: title,
			category: project ? project.section_label : current.category
		}));
	};
	const options = [
		"Branding",
		"UI/UX",
		"Other"
	];
	useEffect(() => {
		setData("category", sectionCategory);
	}, [sectionCategory]);
	const [pending, setPending] = useState(false);
	const chooseFiles = (incoming) => {
		const files = Array.from(incoming ?? []).slice(0, 20);
		if (files.length === 0 || processing) return;
		clearErrors();
		setData("files", files);
		setPending(true);
	};
	useEffect(() => {
		if (!pending) return;
		setPending(false);
		post("/admin/media", {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: () => {
				reset("files");
				if (fileInput.current) fileInput.current.value = "";
			}
		});
	}, [pending]);
	return /* @__PURE__ */ jsxs("section", {
		className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-sm font-bold text-slate-900",
					children: "Upload to category"
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-1.5",
					role: "radiogroup",
					"aria-label": "Upload category",
					children: [options.map((option) => /* @__PURE__ */ jsx("button", {
						type: "button",
						role: "radio",
						"aria-checked": data.category === option,
						onClick: () => setData("category", option),
						disabled: processing,
						className: `rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${data.category === option ? "border-transparent text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-slate-900"}`,
						style: data.category === option ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0,
						children: option
					}, option)), /* @__PURE__ */ jsxs(Select, {
						value: data.usage_location,
						onChange: (event) => chooseProject(event.target.value),
						disabled: processing,
						"aria-label": "Upload under project",
						className: "sm:w-56",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "No project"
						}), [["uiux", "UI/UX"], ["branding", "Branding"]].map(([key, label]) => {
							const list = projects.filter((project) => project.section === key);
							return list.length > 0 && /* @__PURE__ */ jsx("optgroup", {
								label,
								children: list.map((project) => /* @__PURE__ */ jsx("option", {
									value: project.title,
									children: project.title
								}, project.id))
							}, key);
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				role: "button",
				tabIndex: 0,
				onClick: () => fileInput.current?.click(),
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") fileInput.current?.click();
				},
				onDragEnter: (event) => {
					event.preventDefault();
					dragDepth.current += 1;
					setDragging(true);
				},
				onDragOver: (event) => {
					event.preventDefault();
					event.dataTransfer.dropEffect = "copy";
				},
				onDragLeave: (event) => {
					event.preventDefault();
					dragDepth.current = Math.max(0, dragDepth.current - 1);
					if (dragDepth.current === 0) setDragging(false);
				},
				onDrop: (event) => {
					event.preventDefault();
					dragDepth.current = 0;
					setDragging(false);
					chooseFiles(event.dataTransfer.files);
				},
				className: `m-4 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center outline-none transition-all sm:m-5 ${dragging ? "border-cyan-500 bg-cyan-50 shadow-[0_0_0_4px_rgba(6,182,212,0.08)]" : "border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50 focus:border-blue-500"}`,
				children: [
					/* @__PURE__ */ jsx("input", {
						ref: fileInput,
						type: "file",
						multiple: true,
						accept: ACCEPT,
						onChange: (event) => chooseFiles(event.target.files),
						className: "sr-only"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200",
						children: /* @__PURE__ */ jsx(Icon, {
							name: "upload",
							className: "h-7 w-7"
						})
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-5 text-lg font-bold text-slate-900",
						children: dragging ? "Drop files to upload" : "Drag & drop media here"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-sm text-slate-500",
						children: ["or click to browse your device · goes to ", /* @__PURE__ */ jsxs("span", {
							className: "font-bold text-slate-700",
							children: [data.category, data.usage_location ? ` · ${data.usage_location}` : ""]
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm",
						children: "Choose files"
					})
				]
			}),
			(data.files.length > 0 || Object.keys(errors).length > 0) && /* @__PURE__ */ jsxs("div", {
				className: "border-t border-slate-200 px-5 py-4",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: /* @__PURE__ */ jsx("p", {
							className: "text-sm font-bold text-slate-900",
							children: processing ? `Uploading ${data.files.length} file${data.files.length === 1 ? "" : "s"}… ${progress?.percentage ?? 0}%` : `${data.files.length} file${data.files.length === 1 ? "" : "s"}`
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
						children: data.files.map((file) => /* @__PURE__ */ jsxs("div", {
							className: "rounded-lg border border-slate-200 bg-slate-50 p-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm",
									children: /* @__PURE__ */ jsx(Icon, { name: "file" })
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate text-xs font-semibold text-slate-800",
										title: file.name,
										children: file.name
									}), /* @__PURE__ */ jsxs("p", {
										className: "text-[11px] text-slate-500",
										children: [(file.size / 1024 / 1024).toFixed(2), " MB"]
									})]
								})]
							}), processing && /* @__PURE__ */ jsx("div", {
								className: "mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200",
								children: /* @__PURE__ */ jsx("div", {
									className: "h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all",
									style: { width: `${progress?.percentage ?? 0}%` }
								})
							})]
						}, `${file.name}-${file.size}-${file.lastModified}`))
					}),
					Object.values(errors).map((error) => /* @__PURE__ */ jsx("p", {
						className: "mt-2 text-xs text-rose-600",
						children: error
					}, error))
				]
			})
		]
	});
}
function MediaPreview({ medium, onClose, onDelete }) {
	const [renaming, setRenaming] = useState(false);
	const [filename, setFilename] = useState(medium.filename);
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		const closeOnEscape = (event) => event.key === "Escape" && onClose();
		document.addEventListener("keydown", closeOnEscape);
		return () => document.removeEventListener("keydown", closeOnEscape);
	}, [onClose]);
	const copyUrl = async () => {
		const url = new URL(medium.file_url, window.location.origin).href;
		if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
		else {
			const textarea = document.createElement("textarea");
			textarea.value = url;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1800);
	};
	const rename = (event) => {
		event.preventDefault();
		router.put(`/admin/media/${medium.id}`, {
			filename,
			category: medium.category,
			usage_location: medium.usage_location ?? "",
			alt_text: medium.alt_text ?? ""
		}, {
			preserveScroll: true,
			onSuccess: onClose
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[210] flex items-center justify-center p-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `Preview ${medium.filename}`,
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			className: "absolute inset-0 bg-slate-950/65 backdrop-blur-sm",
			onClick: onClose,
			"aria-label": "Close preview"
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex min-h-72 items-center justify-center bg-slate-100 p-5",
				children: medium.is_image ? /* @__PURE__ */ jsx("img", {
					src: medium.file_url,
					alt: medium.alt_text || medium.filename,
					className: "max-h-[72vh] max-w-full rounded-lg object-contain shadow-sm"
				}) : kindOf(medium) === "Video" ? /* @__PURE__ */ jsx("video", {
					src: medium.file_url,
					controls: true,
					playsInline: true,
					className: "max-h-[72vh] max-w-full rounded-lg shadow-sm"
				}) : /* @__PURE__ */ jsxs("div", {
					className: "text-center text-slate-400",
					children: [/* @__PURE__ */ jsx(Icon, {
						name: "file",
						className: "mx-auto h-20 w-20"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-3 font-bold",
						children: "Document preview unavailable"
					})]
				})
			}), /* @__PURE__ */ jsxs("aside", {
				className: "overflow-y-auto border-l border-slate-200 p-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-[11px] font-bold uppercase tracking-widest text-blue-600",
								children: "Media details"
							}), /* @__PURE__ */ jsx("h2", {
								className: "mt-1 break-all text-lg font-bold text-slate-900",
								children: medium.filename
							})]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
							children: /* @__PURE__ */ jsx(Icon, { name: "close" })
						})]
					}),
					/* @__PURE__ */ jsxs("dl", {
						className: "mt-6 grid grid-cols-2 gap-4 text-sm",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
								className: "text-xs text-slate-500",
								children: "Size"
							}), /* @__PURE__ */ jsx("dd", {
								className: "mt-1 font-semibold text-slate-800",
								children: medium.size || "—"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
								className: "text-xs text-slate-500",
								children: "Dimensions"
							}), /* @__PURE__ */ jsx("dd", {
								className: "mt-1 font-semibold text-slate-800",
								children: medium.dimensions || "—"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
								className: "text-xs text-slate-500",
								children: "Collection"
							}), /* @__PURE__ */ jsx("dd", {
								className: "mt-1 font-semibold text-slate-800",
								children: medium.category
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
								className: "text-xs text-slate-500",
								children: "Uploaded"
							}), /* @__PURE__ */ jsx("dd", {
								className: "mt-1 font-semibold text-slate-800",
								children: medium.created_at?.slice(0, 10) || "—"
							})] })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 rounded-xl bg-slate-50 p-4",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs font-bold uppercase tracking-wider text-slate-500",
							children: medium.usage_count > 0 ? `Used in ${medium.usage_count} place${medium.usage_count === 1 ? "" : "s"}` : "Used in"
						}), medium.usage_labels.length > 0 ? /* @__PURE__ */ jsx("ul", {
							className: "mt-2 space-y-1 text-sm text-slate-700",
							children: medium.usage_labels.map((label) => {
								const use = (medium.uses ?? []).find((entry) => `${entry.owner} · ${entry.role}` === label);
								return /* @__PURE__ */ jsxs("li", { children: ["• ", use ? /* @__PURE__ */ jsx(Link, {
									href: use.edit_url,
									className: "hover:text-blue-600 hover:underline",
									children: label
								}) : label] }, label);
							})
						}) : /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm text-slate-500",
							children: "Not currently linked to CMS content."
						})]
					}),
					renaming && /* @__PURE__ */ jsxs("form", {
						onSubmit: rename,
						className: "mt-5",
						children: [/* @__PURE__ */ jsx("label", {
							className: "text-xs font-bold text-slate-700",
							htmlFor: "rename-media",
							children: "Display filename"
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-2 flex gap-2",
							children: [/* @__PURE__ */ jsx("input", {
								id: "rename-media",
								value: filename,
								onChange: (event) => setFilename(event.target.value),
								className: "min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
							}), /* @__PURE__ */ jsx("button", {
								className: "rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white",
								children: "Save"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 grid gap-2",
						children: [
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: copyUrl,
								className: "flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50",
								children: [/* @__PURE__ */ jsx(Icon, {
									name: "copy",
									className: "h-4 w-4"
								}), copied ? "URL copied" : "Copy URL"]
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setRenaming((value) => !value),
								className: "rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50",
								children: "Rename"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => onDelete(medium),
								className: "rounded-lg border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50",
								children: "Delete media"
							})
						]
					})
				]
			})]
		})]
	});
}
/**
* Edit one file's catalogue entry without leaving the library: its name,
* collection, usage note and alt text, and optionally a replacement image.
*/
function MediaEditModal({ medium, onClose }) {
	const [preview, setPreview] = useState(medium.file_url);
	const { data, setData, post, processing, errors } = useForm({
		_method: "put",
		from_library: true,
		file: null,
		filename: medium.filename ?? "",
		category: medium.category ?? "",
		usage_location: medium.usage_location ?? "",
		alt_text: medium.alt_text ?? ""
	});
	useEffect(() => {
		const closeOnEscape = (event) => event.key === "Escape" && onClose();
		document.addEventListener("keydown", closeOnEscape);
		return () => document.removeEventListener("keydown", closeOnEscape);
	}, [onClose]);
	useEffect(() => () => {
		if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
	}, [preview]);
	const chooseFile = (file) => {
		setData("file", file);
		setPreview(file ? URL.createObjectURL(file) : medium.file_url);
	};
	const submit = (event) => {
		event.preventDefault();
		post(`/admin/media/${medium.id}`, {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: onClose
		});
	};
	const FIELD = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
	const error = (key) => errors[key] && /* @__PURE__ */ jsx("p", {
		className: "mt-1 text-xs font-semibold text-rose-600",
		children: errors[key]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[210] flex items-center justify-center p-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `Edit ${medium.filename}`,
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			className: "absolute inset-0 bg-slate-950/65 backdrop-blur-sm",
			onClick: onClose,
			"aria-label": "Close"
		}), /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "relative grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[minmax(0,1fr)_minmax(300px,1fr)]",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex min-h-64 flex-col items-center justify-center gap-4 bg-slate-100 p-5",
				children: [
					medium.is_image || data.file ? /* @__PURE__ */ jsx("img", {
						src: preview,
						alt: data.alt_text || data.filename,
						className: "max-h-[52vh] max-w-full rounded-lg object-contain shadow-sm"
					}) : kindOf(medium) === "Video" ? /* @__PURE__ */ jsx("video", {
						src: medium.file_url,
						controls: true,
						playsInline: true,
						className: "max-h-[52vh] max-w-full rounded-lg shadow-sm"
					}) : /* @__PURE__ */ jsx(Icon, {
						name: "file",
						className: "h-20 w-20 text-slate-400"
					}),
					medium.is_image && /* @__PURE__ */ jsxs("label", {
						className: "cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50",
						children: [data.file ? `Replacing with ${data.file.name}` : "Replace image", /* @__PURE__ */ jsx("input", {
							type: "file",
							accept: "image/jpeg,image/png,image/webp,image/gif",
							className: "sr-only",
							onChange: (event) => chooseFile(event.target.files?.[0] ?? null)
						})]
					}),
					error("file")
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col overflow-y-auto border-l border-slate-200 p-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-[11px] font-bold uppercase tracking-widest text-blue-600",
								children: "Edit media"
							}), /* @__PURE__ */ jsx("h2", {
								className: "mt-1 break-all text-lg font-bold text-slate-900",
								children: medium.filename
							})]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
							"aria-label": "Close",
							children: /* @__PURE__ */ jsx(Icon, { name: "close" })
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-5 space-y-4",
						children: [
							/* @__PURE__ */ jsxs("label", {
								className: "block text-xs font-bold text-slate-700",
								children: [
									"File name",
									/* @__PURE__ */ jsx("input", {
										value: data.filename,
										onChange: (event) => setData("filename", event.target.value),
										className: FIELD
									}),
									error("filename")
								]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "block text-xs font-bold text-slate-700",
								children: [
									"Collection",
									/* @__PURE__ */ jsx("input", {
										value: data.category,
										onChange: (event) => setData("category", event.target.value),
										className: FIELD
									}),
									error("category")
								]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "block text-xs font-bold text-slate-700",
								children: [
									"Usage location",
									/* @__PURE__ */ jsx("input", {
										value: data.usage_location,
										onChange: (event) => setData("usage_location", event.target.value),
										className: FIELD,
										placeholder: "e.g. Home hero"
									}),
									error("usage_location")
								]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "block text-xs font-bold text-slate-700",
								children: [
									"Alt text",
									/* @__PURE__ */ jsx("input", {
										value: data.alt_text,
										onChange: (event) => setData("alt_text", event.target.value),
										className: FIELD,
										placeholder: "Describe the image"
									}),
									error("alt_text")
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-auto flex justify-end gap-2 pt-6",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50",
							children: "Cancel"
						}), /* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: processing,
							className: "rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60",
							children: processing ? "Saving…" : "Save changes"
						})]
					})
				]
			})]
		})]
	});
}
/**
* Prev, at most five page numbers around the current page, and Next.
* Page addresses keep the current tab, filters and search.
*/
function pageLinks(media) {
	const current = media.current_page;
	const last = media.last_page;
	const urlFor = (page) => {
		const url = new URL(media.first_page_url, "http://localhost");
		url.searchParams.set("page", String(page));
		return `${url.pathname}${url.search}`;
	};
	const first = Math.max(1, Math.min(current - 2, last - 4));
	const pages = Array.from({ length: Math.min(5, last) }, (_, index) => first + index);
	return [
		{
			key: "prev",
			label: "‹ Prev",
			url: current > 1 ? urlFor(current - 1) : null
		},
		...pages.map((page) => ({
			key: `page-${page}`,
			label: String(page),
			url: urlFor(page),
			active: page === current
		})),
		{
			key: "next",
			label: "Next ›",
			url: current < last ? urlFor(current + 1) : null
		}
	];
}
function MediaIndex({ media, groups = [], sections = {}, filters = {}, stats = {}, projects = [] }) {
	const items = media?.data ?? [];
	const section = filters.section ?? "all";
	const byId = Object.fromEntries(items.map((medium) => [medium.id, medium]));
	const [selected, setSelected] = useState(null);
	const [editing, setEditing] = useState(null);
	const [search, setSearch] = useState(filters.search ?? "");
	const [activeFilter, setActiveFilter] = useState(filters.type ?? "all");
	const fileInput = useRef(null);
	const [sort, setSort] = useState(filters.sort ?? "newest");
	const firstSearch = useRef(true);
	const [request, confirm, cancel, run] = useConfirm();
	const visit = (next = {}) => router.get("/admin/media", {
		section: next.section ?? section,
		type: next.type ?? activeFilter,
		search: next.search ?? search,
		sort: next.sort ?? sort
	}, {
		preserveState: true,
		preserveScroll: true,
		replace: true
	});
	useEffect(() => {
		if (firstSearch.current) {
			firstSearch.current = false;
			return;
		}
		const timeout = window.setTimeout(() => visit({ search }), 400);
		return () => window.clearTimeout(timeout);
	}, [search]);
	const [copiedId, setCopiedId] = useState(null);
	const copyLink = async (medium) => {
		const url = new URL(medium.file_url, window.location.origin).href;
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = url;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}
		setCopiedId(medium.id);
		window.setTimeout(() => setCopiedId((current) => current === medium.id ? null : current), 1800);
	};
	const askDelete = (medium) => confirm({
		title: `Delete “${medium.filename}”?`,
		body: medium.is_site_file ? "This file ships with the website, so it is only removed from the media library: the file itself and every page using it stay as they are." : medium.usage_count > 0 ? `This file is currently used in ${medium.usage_count} CMS location(s). Deleting it will leave those locations without a working asset.` : "The file will be permanently removed from storage and the media library.",
		action: () => router.delete(`/admin/media/${medium.id}`, {
			preserveScroll: true,
			onSuccess: () => setSelected(null)
		})
	});
	const renderCard = (medium) => /* @__PURE__ */ jsxs("article", {
		className: "group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative aspect-square w-full overflow-hidden bg-slate-100",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setSelected(medium),
					"aria-label": `Preview ${medium.filename}`,
					className: "block h-full w-full text-left",
					children: medium.is_image ? /* @__PURE__ */ jsx("img", {
						src: medium.preview_url ?? medium.file_url,
						alt: medium.alt_text || medium.filename,
						loading: "lazy",
						className: "h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
					}) : kindOf(medium) === "Video" ? /* @__PURE__ */ jsx("video", {
						src: medium.file_url,
						muted: true,
						playsInline: true,
						preload: "metadata",
						className: "h-full w-full object-cover"
					}) : /* @__PURE__ */ jsxs("span", {
						className: "flex h-full flex-col items-center justify-center text-slate-400",
						children: [/* @__PURE__ */ jsx(Icon, {
							name: "file",
							className: "h-12 w-12"
						}), /* @__PURE__ */ jsx("span", {
							className: "mt-2 text-xs font-bold",
							children: medium.filename.split(".").pop()?.toUpperCase()
						})]
					})
				}),
				medium.usage_count > 0 && /* @__PURE__ */ jsxs("span", {
					className: "pointer-events-none absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow",
					children: ["In use · ", medium.usage_count]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setSelected(medium),
					title: "View",
					"aria-label": `View ${medium.filename}`,
					className: "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:scale-105 hover:text-white",
					onMouseEnter: (event) => {
						event.currentTarget.style.background = "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))";
					},
					onMouseLeave: (event) => {
						event.currentTarget.style.background = "";
					},
					children: /* @__PURE__ */ jsx(Icon, {
						name: "eye",
						className: "h-4 w-4"
					})
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "p-3",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "truncate text-xs font-bold text-slate-800",
					title: medium.filename,
					children: medium.filename
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-0.5 text-[11px] text-slate-500",
					children: medium.size || "—"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2.5",
					children: [
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => copyLink(medium),
							className: `${CARD_ACTION} ${copiedId === medium.id ? "!text-emerald-600" : ""}`,
							title: copiedId === medium.id ? "Link copied" : "Copy link",
							"aria-label": `Copy link to ${medium.filename}`,
							children: /* @__PURE__ */ jsx(Icon, {
								name: copiedId === medium.id ? "check" : "link",
								className: "h-4 w-4"
							})
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setEditing(medium),
							className: CARD_ACTION,
							title: "Edit",
							"aria-label": `Edit ${medium.filename}`,
							children: /* @__PURE__ */ jsx(Icon, {
								name: "edit",
								className: "h-4 w-4"
							})
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => askDelete(medium),
							className: `${CARD_ACTION} !text-rose-600 hover:!bg-rose-50`,
							title: "Delete",
							"aria-label": `Delete ${medium.filename}`,
							children: /* @__PURE__ */ jsx(Icon, {
								name: "trash",
								className: "h-4 w-4"
							})
						})
					]
				})
			]
		})]
	}, medium.id);
	const chooseFilter = (type) => {
		setActiveFilter(type);
		visit({ type });
	};
	const chooseSort = (value) => {
		setSort(value);
		visit({ sort: value });
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Media Library | Marketorr Admin" }),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-8 flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
				className: "font-display text-2xl font-extrabold tracking-tight text-[var(--ink-strong)]",
				children: "Media Library"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-[13px] text-[var(--mute)]",
				children: "Upload, organize and reuse images, videos, GIFs and documents."
			})] }), /* @__PURE__ */ jsxs(Button, {
				type: "button",
				onClick: () => fileInput.current?.click(),
				className: "!rounded-full !px-6 !py-3 shadow-[0_10px_28px_-10px_rgba(80,122,244,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(137,31,251,0.7)] active:translate-y-0",
				children: [/* @__PURE__ */ jsx("span", {
					className: "flex h-6 w-6 items-center justify-center rounded-full bg-white/20",
					children: /* @__PURE__ */ jsx(Icon, {
						name: "upload",
						className: "h-4 w-4"
					})
				}), "Upload media"]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: STAT_CARDS.map(([key, label, icon]) => /* @__PURE__ */ jsxs("article", {
				className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs font-bold uppercase tracking-wider text-slate-500",
						children: label
					}), /* @__PURE__ */ jsx("span", {
						className: "flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600",
						children: /* @__PURE__ */ jsx(Icon, { name: icon })
					})]
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-4 text-2xl font-extrabold tracking-tight text-slate-900",
					children: stats[key] ?? 0
				})]
			}, key))
		}),
		/* @__PURE__ */ jsx("div", {
			id: "media-upload-zone",
			className: "mt-6",
			children: /* @__PURE__ */ jsx(UploadArea, {
				fileInput,
				section,
				projects
			})
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-4 sm:px-5",
					role: "tablist",
					"aria-label": "Media sections",
					children: SECTIONS.map(([value, label]) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "tab",
						"aria-selected": section === value,
						onClick: () => visit({ section: value }),
						className: `-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 pb-3 pt-1 text-sm font-bold transition ${section === value ? "border-blue-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`,
						children: [label, /* @__PURE__ */ jsx("span", {
							className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${section === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`,
							children: sections[value] ?? 0
						})]
					}, value))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-b border-slate-200 p-4 sm:p-5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1",
							children: FILTERS.map(([value, label]) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => chooseFilter(value),
								className: `whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition ${activeFilter === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`,
								children: label
							}, value))
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ jsxs("label", {
								className: "relative block sm:w-72",
								children: [/* @__PURE__ */ jsx("span", {
									className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
									children: /* @__PURE__ */ jsx(Icon, {
										name: "search",
										className: "h-4 w-4"
									})
								}), /* @__PURE__ */ jsx("input", {
									value: search,
									onChange: (event) => setSearch(event.target.value),
									placeholder: "Search media or project name…",
									className: "w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								})]
							}), /* @__PURE__ */ jsxs(Select, {
								value: sort,
								onChange: (event) => chooseSort(event.target.value),
								"aria-label": "Sort media",
								className: "sm:w-48",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "newest",
										children: "Newest first"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "oldest",
										children: "Oldest first"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "name_asc",
										children: "Name A–Z"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "name_desc",
										children: "Name Z–A"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "largest",
										children: "Largest first"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "smallest",
										children: "Smallest first"
									})
								]
							})]
						})]
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-4 sm:p-5",
					children: [items.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "py-16 text-center",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400",
								children: /* @__PURE__ */ jsx(Icon, {
									name: "images",
									className: "h-7 w-7"
								})
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "mt-4 font-bold text-slate-900",
								children: "No media found"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-slate-500",
								children: "Try another filter or upload a new asset."
							})
						]
					}) : groups.length > 0 ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: groups.map((group) => /* @__PURE__ */ jsxs("section", {
							"aria-label": group.title,
							children: [/* @__PURE__ */ jsx("div", {
								className: "mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ jsx("h2", {
											className: "text-sm font-bold text-slate-900",
											children: group.title
										}),
										/* @__PURE__ */ jsx("span", {
											className: "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500",
											children: group.type
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs text-slate-500",
											children: [
												group.total ?? group.ids.length,
												" file",
												(group.total ?? group.ids.length) === 1 ? "" : "s",
												group.total > group.ids.length && ` · ${group.ids.length} on this page`
											]
										})
									]
								})
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5",
								children: group.ids.map((id) => byId[id] && renderCard(byId[id]))
							})]
						}, group.key))
					}) : /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5",
						children: items.map((medium) => renderCard(medium))
					}), media?.last_page > 1 && /* @__PURE__ */ jsxs("nav", {
						className: "mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5",
						"aria-label": "Media pagination",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-xs font-medium text-slate-500",
							children: [
								"Showing ",
								media.from,
								"–",
								media.to,
								" of ",
								media.total,
								" · page ",
								media.current_page,
								" of ",
								media.last_page
							]
						}), /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap items-center gap-1",
							children: pageLinks(media).map((link) => {
								const base = "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-xs font-bold transition";
								if (!link.url) return /* @__PURE__ */ jsx("span", {
									className: `${base} border-transparent text-slate-400`,
									children: link.label
								}, link.key);
								return link.active ? /* @__PURE__ */ jsx("span", {
									"aria-current": "page",
									className: `${base} border-transparent text-white`,
									style: { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" },
									children: link.label
								}, link.key) : /* @__PURE__ */ jsx(Link, {
									href: link.url,
									preserveScroll: true,
									className: `${base} border-slate-300 text-slate-700 hover:bg-slate-50`,
									children: link.label
								}, link.key);
							})
						})]
					})]
				})
			]
		}),
		selected && /* @__PURE__ */ jsx(MediaPreview, {
			medium: selected,
			onClose: () => setSelected(null),
			onDelete: (medium) => {
				setSelected(null);
				askDelete(medium);
			}
		}),
		editing && /* @__PURE__ */ jsx(MediaEditModal, {
			medium: editing,
			onClose: () => setEditing(null)
		}, editing.id),
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
