import { Link } from "@inertiajs/react";
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
//#region resources/js/components/admin/ThemedSelect.jsx
var BRAND_GRADIENT = "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))";
/** The text inside an <option>, however it was written in JSX. */
function textOf(node) {
	if (node === null || node === void 0 || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOf).join("");
	return isValidElement(node) ? textOf(node.props.children) : "";
}
/**
* The <option> and <optgroup> children as a flat list: group headings and
* choosable options, in order.
*
* @returns {Array<{ type: 'group', label: string } | { type: 'option', value: string, label: string, disabled: boolean }>}
*/
function readOptions(children) {
	return Children.toArray(children).flatMap((child) => {
		if (!isValidElement(child)) return [];
		if (child.type === "optgroup") return [{
			type: "group",
			label: String(child.props.label ?? "")
		}, ...readOptions(child.props.children)];
		if (child.type === "option") {
			const label = textOf(child.props.children);
			return [{
				type: "option",
				value: String(child.props.value ?? label),
				label,
				disabled: Boolean(child.props.disabled)
			}];
		}
		return [];
	});
}
/**
* The admin's dropdown in the site theme, a drop-in for a native <select>:
* same `value`, `onChange(event)` (read `event.target.value`), `disabled` and
* <option>/<optgroup> children. The trigger matches the other fields; the open
* list is the theme surface with a brand-gradient highlight and a dot on the
* chosen option, as on the Inquiries filters. Arrow keys, Enter, Space,
* Home/End and Escape work as they do on a native select.
*/
function ThemedSelect({ value, onChange, disabled = false, className = "", children, name, id, "aria-label": ariaLabel, ...rest }) {
	const [open, setOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(-1);
	const [menuPosition, setMenuPosition] = useState(null);
	const buttonRef = useRef(null);
	const menuRef = useRef(null);
	const entries = readOptions(children);
	const options = entries.filter((entry) => entry.type === "option");
	const current = options.find((option) => option.value === String(value ?? "")) ?? options[0];
	useEffect(() => {
		if (!open) return void 0;
		const closeOnOutsidePress = (event) => {
			if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
		};
		const closeOnViewportChange = (event) => {
			if (!menuRef.current?.contains(event.target)) setOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePress);
		window.addEventListener("resize", closeOnViewportChange);
		window.addEventListener("scroll", closeOnViewportChange, true);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePress);
			window.removeEventListener("resize", closeOnViewportChange);
			window.removeEventListener("scroll", closeOnViewportChange, true);
		};
	}, [open]);
	useEffect(() => {
		if (open && highlighted >= 0) menuRef.current?.querySelector(`[data-option-index="${highlighted}"]`)?.scrollIntoView({ block: "nearest" });
	}, [open, highlighted]);
	const openList = () => {
		const bounds = buttonRef.current?.getBoundingClientRect();
		if (!bounds) return;
		const menuHeight = Math.min(entries.length * 36 + 12, 320);
		const dropUp = window.innerHeight - bounds.bottom < menuHeight + 12 && bounds.top > window.innerHeight - bounds.bottom;
		setHighlighted(Math.max(0, options.indexOf(current)));
		setMenuPosition({
			left: bounds.left,
			top: dropUp ? bounds.top - 6 : bounds.bottom + 6,
			dropUp,
			width: Math.max(bounds.width, 180)
		});
		setOpen(true);
	};
	const choose = (option) => {
		setOpen(false);
		buttonRef.current?.focus();
		if (!option || option.disabled || option.value === String(value ?? "")) return;
		onChange?.({
			target: {
				value: option.value,
				name
			},
			currentTarget: {
				value: option.value,
				name
			}
		});
	};
	const step = (from, direction) => {
		for (let i = 1; i <= options.length; i++) {
			const index = (from + direction * i + options.length * i) % options.length;
			if (!options[index].disabled) return index;
		}
		return from;
	};
	const onKeyDown = (event) => {
		if (event.key === "Escape" || event.key === "Tab") {
			if (open) setOpen(false);
			if (event.key === "Escape" && open) event.preventDefault();
			return;
		}
		if (![
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" ",
			"Home",
			"End"
		].includes(event.key)) return;
		event.preventDefault();
		if (!open) {
			openList();
			return;
		}
		if (event.key === "ArrowDown") setHighlighted((index) => step(index, 1));
		if (event.key === "ArrowUp") setHighlighted((index) => step(index, -1));
		if (event.key === "Home") setHighlighted(step(-1, 1));
		if (event.key === "End") setHighlighted(step(options.length, -1));
		if ((event.key === "Enter" || event.key === " ") && highlighted >= 0) choose(options[highlighted]);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("button", {
		...rest,
		ref: buttonRef,
		id,
		type: "button",
		"aria-haspopup": "listbox",
		"aria-expanded": open,
		"aria-label": ariaLabel ? `${ariaLabel}: ${current?.label ?? ""}` : void 0,
		disabled,
		onClick: () => open ? setOpen(false) : openList(),
		onKeyDown,
		className: `flex w-full items-center justify-between gap-3 rounded-lg border bg-[var(--bg)] px-3 py-2.5 text-left text-[14px] text-[var(--ink)] transition-colors focus:outline-none focus-visible:border-[var(--brand-2)] focus-visible:shadow-[0_0_0_3px_rgba(var(--brand-2-rgb),0.18)] disabled:cursor-not-allowed disabled:opacity-60 ${open ? "border-[var(--brand-2)] shadow-[0_0_0_3px_rgba(var(--brand-2-rgb),0.18)]" : "border-[var(--field-line)] hover:border-[rgba(var(--brand-1-rgb),0.65)]"} ${className}`,
		children: [/* @__PURE__ */ jsx("span", {
			className: "min-w-0 truncate",
			children: current?.label ?? ""
		}), /* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 12 7",
			className: `h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 ${open ? "rotate-180" : ""}`,
			fill: "none",
			"aria-hidden": true,
			children: /* @__PURE__ */ jsx("path", {
				d: "M1 1l5 5 5-5",
				stroke: "currentColor",
				strokeWidth: "1.6",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		})]
	}), open && menuPosition && typeof document !== "undefined" && createPortal(/* @__PURE__ */ jsx("ul", {
		ref: menuRef,
		role: "listbox",
		"aria-label": ariaLabel,
		className: "fixed z-[400] max-h-80 overflow-y-auto overscroll-contain rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]",
		style: {
			left: menuPosition.left,
			top: menuPosition.top,
			width: menuPosition.width,
			transform: menuPosition.dropUp ? "translateY(-100%)" : void 0
		},
		children: entries.map((entry, entryIndex) => {
			if (entry.type === "group") return /* @__PURE__ */ jsx("li", {
				role: "presentation",
				className: "px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-1)]",
				children: entry.label
			}, `group-${entryIndex}`);
			const index = options.indexOf(entry);
			const active = highlighted === index;
			const selected = current === entry;
			return /* @__PURE__ */ jsxs("li", {
				role: "option",
				"aria-selected": selected,
				"aria-disabled": entry.disabled || void 0,
				"data-option-index": index,
				onPointerEnter: () => !entry.disabled && setHighlighted(index),
				onClick: () => choose(entry),
				className: `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 ${entry.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${active ? "text-white" : "text-[var(--ink)]"} ${selected ? "font-bold" : "font-medium"}`,
				style: active ? { background: BRAND_GRADIENT } : void 0,
				children: [/* @__PURE__ */ jsx("span", {
					className: "min-w-0 truncate",
					children: entry.label
				}), selected && /* @__PURE__ */ jsx("span", {
					className: "h-1.5 w-1.5 shrink-0 rounded-full",
					style: { background: active ? "#fff" : "var(--brand-2)" },
					"aria-hidden": true
				})]
			}, `${entry.value}-${entryIndex}`);
		})
	}), document.body)] });
}
//#endregion
//#region resources/js/components/admin/MediaPickerModal.jsx
/**
* Helper to determine whether an asset is an image based on mime_type or file extension.
*/
function isImageAsset(item) {
	if (!item) return false;
	if ((item.mime_type || "").toLowerCase().startsWith("image/")) return true;
	const url = (item.file_url || item.filename || "").toLowerCase();
	return /\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(url);
}
/**
* Returns a clean file extension or format badge (e.g. PDF, DOCX, SVG).
*/
function getFileExtension(filename = "") {
	const ext = filename.split(".").pop();
	return ext ? ext.toUpperCase() : "FILE";
}
/**
* Centralized Media Library Modal Picker.
*
* Supports browsing, live search, category filtering, file type filtering,
* drag-and-drop uploading, asset inspection, deletion, and selection.
*
* @param {{
*   open: boolean,
*   onClose: () => void,
*   onSelect: (asset: { id: number, file_url: string, filename: string, alt_text?: string, mime_type?: string }) => void,
*   title?: string,
*   filterType?: 'all' | 'image' | 'document',
*   currentUrl?: string
* }} props
*/
function MediaPickerModal({ open, onClose, onSelect, title = "Media Library", filterType = "all", currentUrl = "" }) {
	const [media, setMedia] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [activeTab, setActiveTab] = useState("browse");
	const [selectedAsset, setSelectedAsset] = useState(null);
	const [typeFilter, setTypeFilter] = useState(filterType);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState("");
	const [uploadCategory, setUploadCategory] = useState("General");
	const [dragOver, setDragOver] = useState(false);
	const fileInputRef = useRef(null);
	const fetchMedia = async () => {
		setLoading(true);
		try {
			const res = await fetch("/admin/media?json=1", { headers: { Accept: "application/json" } });
			if (res.ok) {
				const json = await res.json();
				setMedia(json.media || []);
				setCategories(json.categories || []);
			}
		} catch (e) {
			console.error("Failed to load media items", e);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		if (open) {
			fetchMedia();
			setActiveTab("browse");
			setSearch("");
			setSelectedCategory("");
		}
	}, [open]);
	useEffect(() => {
		if (!open) return void 0;
		const onKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open, onClose]);
	const filteredItems = useMemo(() => {
		return media.filter((item) => {
			if (selectedCategory && item.category !== selectedCategory) return false;
			if (typeFilter === "image" && !isImageAsset(item)) return false;
			if (typeFilter === "document" && isImageAsset(item)) return false;
			if (search.trim()) {
				const q = search.toLowerCase();
				const matchFilename = (item.filename || "").toLowerCase().includes(q);
				const matchAlt = (item.alt_text || "").toLowerCase().includes(q);
				const matchCat = (item.category || "").toLowerCase().includes(q);
				if (!matchFilename && !matchAlt && !matchCat) return false;
			}
			return true;
		});
	}, [
		media,
		selectedCategory,
		typeFilter,
		search
	]);
	const handleFileUpload = async (file) => {
		if (!file) return;
		setUploading(true);
		setUploadError("");
		const csrfToken = document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content") || "";
		const formData = new FormData();
		formData.append("file", file);
		formData.append("category", uploadCategory || "General");
		try {
			const res = await fetch("/admin/media", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"X-CSRF-TOKEN": csrfToken,
					"X-Requested-With": "XMLHttpRequest"
				},
				body: formData
			});
			const json = await res.json();
			if (res.ok && json.medium) {
				setMedia((prev) => [json.medium, ...prev]);
				setSelectedAsset(json.medium);
				setActiveTab("browse");
			} else setUploadError(json.message || "Failed to upload asset. Please verify file type and size.");
		} catch (err) {
			setUploadError("Network error while uploading asset.");
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};
	const handleDelete = async (id, e) => {
		e?.stopPropagation();
		if (!window.confirm("Delete this asset permanently from the media library?")) return;
		const csrfToken = document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content") || "";
		try {
			if ((await fetch(`/admin/media/${id}`, {
				method: "DELETE",
				headers: {
					Accept: "application/json",
					"X-CSRF-TOKEN": csrfToken,
					"X-Requested-With": "XMLHttpRequest"
				}
			})).ok) {
				setMedia((prev) => prev.filter((m) => m.id !== id));
				if (selectedAsset?.id === id) setSelectedAsset(null);
			}
		} catch (err) {
			alert("Failed to delete asset.");
		}
	};
	const handleConfirmSelect = () => {
		if (!selectedAsset) return;
		onSelect(selectedAsset);
		onClose();
	};
	if (!open) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6",
		role: "dialog",
		"aria-modal": "true",
		children: [/* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity",
			onClick: onClose,
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative flex max-h-[92vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-800 bg-[#0d121f] text-slate-200 shadow-2xl overflow-hidden",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-6 bg-[#0a0e17]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
							children: /* @__PURE__ */ jsx("svg", {
								className: "h-4 w-4",
								fill: "none",
								viewBox: "0 0 24 24",
								stroke: "currentColor",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: "2",
									d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								})
							})
						}), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "font-display text-[16px] font-bold text-white tracking-tight",
								children: title
							}), /* @__PURE__ */ jsxs("span", {
								className: "rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400",
								children: [media.length, " items"]
							})]
						}) })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 p-1",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setActiveTab("browse"),
								className: `rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ease-out ${activeTab === "browse" ? "text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`,
								style: activeTab === "browse" ? TAB_GRADIENT : void 0,
								children: "Browse Assets"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setActiveTab("upload"),
								className: `rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ease-out ${activeTab === "upload" ? "text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`,
								style: activeTab === "upload" ? TAB_GRADIENT : void 0,
								children: "+ Upload New"
							})]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors",
							"aria-label": "Close media picker",
							children: "✕"
						})]
					})]
				}),
				activeTab === "browse" && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0a0e17]/60 px-6 py-2.5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2.5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [/* @__PURE__ */ jsx("input", {
									type: "text",
									value: search,
									onChange: (e) => setSearch(e.target.value),
									placeholder: "Search filename or alt...",
									className: "w-56 sm:w-64 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
								}), search && /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setSearch(""),
									className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-200",
									children: "✕"
								})]
							}),
							/* @__PURE__ */ jsxs(Select, {
								value: selectedCategory,
								onChange: (e) => setSelectedCategory(e.target.value),
								"aria-label": "Filter by category",
								className: "!w-auto min-w-[150px] !py-1.5 !text-xs",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "All Categories"
								}), categories.map((c) => /* @__PURE__ */ jsx("option", {
									value: c,
									children: c
								}, c))]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "flex items-center rounded-md bg-slate-900 p-0.5 border border-slate-800/80 text-[11px]",
								children: [
									"all",
									"image",
									"document"
								].map((t) => /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setTypeFilter(t),
									className: `rounded px-2.5 py-1 capitalize font-medium transition-all ${typeFilter === t ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`,
									children: t === "all" ? "All Types" : t === "image" ? "Images" : "Docs & PDFs"
								}, t))
							})
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "text-xs text-slate-400",
						children: [
							filteredItems.length,
							" matching ",
							filteredItems.length === 1 ? "asset" : "assets"
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-1 min-h-0 overflow-hidden",
					children: activeTab === "upload" ? /* @__PURE__ */ jsx("div", {
						className: "flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center",
						children: /* @__PURE__ */ jsxs("div", {
							className: "w-full max-w-xl space-y-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-semibold uppercase tracking-wider text-slate-400",
									children: "Assign Category (optional)"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: uploadCategory,
									onChange: (e) => setUploadCategory(e.target.value),
									placeholder: "e.g. Projects, Branding, Pages, Documents",
									className: "w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								onDragOver: (e) => {
									e.preventDefault();
									setDragOver(true);
								},
								onDragLeave: () => setDragOver(false),
								onDrop: (e) => {
									e.preventDefault();
									setDragOver(false);
									const file = e.dataTransfer.files?.[0];
									if (file) handleFileUpload(file);
								},
								className: `relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragOver ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60"}`,
								children: [
									/* @__PURE__ */ jsx("input", {
										ref: fileInputRef,
										type: "file",
										accept: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf,.doc,.docx,.txt,.zip",
										onChange: (e) => {
											const file = e.target.files?.[0];
											if (file) handleFileUpload(file);
										},
										className: "absolute inset-0 cursor-pointer opacity-0"
									}),
									/* @__PURE__ */ jsx("div", {
										className: "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400 shadow-inner",
										children: /* @__PURE__ */ jsx("svg", {
											className: "h-8 w-8",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											children: /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: "2",
												d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											})
										})
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-display text-base font-bold text-white",
										children: "Drag & drop your files here"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1 text-xs text-slate-400",
										children: [
											"or ",
											/* @__PURE__ */ jsx("span", {
												className: "font-semibold text-cyan-400 underline",
												children: "browse files"
											}),
											" from your computer"
										]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-3 text-[11px] text-slate-500",
										children: "Supports JPG, PNG, WebP, SVG, GIF, PDF, DOCX (up to 20MB)"
									}),
									uploading && /* @__PURE__ */ jsxs("div", {
										className: "mt-5 flex items-center gap-2 text-xs font-semibold text-cyan-400",
										children: [/* @__PURE__ */ jsx("span", { className: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" }), "Uploading asset to library…"]
									}),
									uploadError && /* @__PURE__ */ jsx("p", {
										className: "mt-4 text-xs font-medium text-rose-400",
										children: uploadError
									})
								]
							})]
						})
					}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
						className: "flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent",
						children: loading ? /* @__PURE__ */ jsxs("div", {
							className: "flex h-64 items-center justify-center text-xs text-slate-400 gap-2",
							children: [/* @__PURE__ */ jsx("span", { className: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" }), "Loading library assets…"]
						}) : filteredItems.length === 0 ? /* @__PURE__ */ jsxs("div", {
							className: "flex h-64 flex-col items-center justify-center text-center",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-sm font-semibold text-slate-400",
									children: "No assets found"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-1 text-xs text-slate-500",
									children: "Try adjusting your filters or upload a new asset."
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setActiveTab("upload"),
									className: "mt-4 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all",
									children: "+ Upload an Asset"
								})
							]
						}) : /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5",
							children: filteredItems.map((item) => {
								const isSelected = selectedAsset?.id === item.id;
								const isCurrent = currentUrl && (item.file_url === currentUrl || currentUrl.endsWith(item.filename));
								const isImg = isImageAsset(item);
								return /* @__PURE__ */ jsxs("div", {
									onClick: () => setSelectedAsset(item),
									className: `group relative flex flex-col rounded-xl border p-2 text-left cursor-pointer transition-all ${isSelected ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(var(--brand-3-rgb),0.15)] ring-1 ring-cyan-400" : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/90"}`,
									children: [/* @__PURE__ */ jsxs("div", {
										className: "relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800/50",
										children: [
											isImg ? /* @__PURE__ */ jsx("img", {
												src: item.file_url,
												alt: item.alt_text || item.filename,
												className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
												loading: "lazy"
											}) : /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col items-center justify-center text-slate-400 p-2",
												children: [/* @__PURE__ */ jsx("svg", {
													className: "h-8 w-8 mb-1 text-slate-500",
													fill: "none",
													viewBox: "0 0 24 24",
													stroke: "currentColor",
													children: /* @__PURE__ */ jsx("path", {
														strokeLinecap: "round",
														strokeLinejoin: "round",
														strokeWidth: "1.8",
														d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													})
												}), /* @__PURE__ */ jsx("span", {
													className: "rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300",
													children: getFileExtension(item.filename)
												})]
											}),
											isCurrent && /* @__PURE__ */ jsx("span", {
												className: "absolute top-1.5 left-1.5 rounded bg-indigo-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow",
												children: "In Use"
											}),
											isSelected && /* @__PURE__ */ jsx("div", {
												className: "absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow",
												children: /* @__PURE__ */ jsx("svg", {
													className: "h-3.5 w-3.5",
													viewBox: "0 0 20 20",
													fill: "currentColor",
													children: /* @__PURE__ */ jsx("path", {
														fillRule: "evenodd",
														d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
														clipRule: "evenodd"
													})
												})
											})
										]
									}), /* @__PURE__ */ jsxs("div", {
										className: "mt-2 min-w-0",
										children: [/* @__PURE__ */ jsx("p", {
											className: "truncate text-xs font-semibold text-slate-200",
											title: item.filename,
											children: item.filename
										}), /* @__PURE__ */ jsxs("div", {
											className: "mt-0.5 flex items-center justify-between text-[10px] text-slate-400",
											children: [/* @__PURE__ */ jsx("span", {
												className: "truncate",
												children: item.category || "General"
											}), /* @__PURE__ */ jsx("span", { children: item.size })]
										})]
									})]
								}, item.id);
							})
						})
					}), selectedAsset && /* @__PURE__ */ jsxs("div", {
						className: "w-72 sm:w-80 shrink-0 border-l border-slate-800/80 bg-[#0a0e17] p-5 flex flex-col justify-between overflow-y-auto",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800",
									children: isImageAsset(selectedAsset) ? /* @__PURE__ */ jsx("img", {
										src: selectedAsset.file_url,
										alt: selectedAsset.alt_text || selectedAsset.filename,
										className: "h-full w-full object-contain"
									}) : /* @__PURE__ */ jsxs("div", {
										className: "flex flex-col items-center justify-center text-slate-400",
										children: [/* @__PURE__ */ jsx("svg", {
											className: "h-12 w-12 text-slate-500 mb-1",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											children: /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: "1.8",
												d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											})
										}), /* @__PURE__ */ jsxs("span", {
											className: "text-xs font-bold text-slate-300",
											children: [getFileExtension(selectedAsset.filename), " DOCUMENT"]
										})]
									})
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "break-all text-xs font-bold text-white",
									children: selectedAsset.filename
								}), /* @__PURE__ */ jsxs("p", {
									className: "mt-0.5 text-[11px] text-slate-400",
									children: ["Category: ", /* @__PURE__ */ jsx("span", {
										className: "text-slate-300",
										children: selectedAsset.category || "General"
									})]
								})] }),
								/* @__PURE__ */ jsxs("dl", {
									className: "grid grid-cols-2 gap-2 rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-[11px]",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
											className: "text-slate-500",
											children: "File size"
										}), /* @__PURE__ */ jsx("dd", {
											className: "font-semibold text-slate-300",
											children: selectedAsset.size || "-"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
											className: "text-slate-500",
											children: "Dimensions"
										}), /* @__PURE__ */ jsx("dd", {
											className: "font-semibold text-slate-300",
											children: selectedAsset.dimensions || "-"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
											className: "text-slate-500",
											children: "Type"
										}), /* @__PURE__ */ jsx("dd", {
											className: "font-semibold text-slate-300 truncate",
											title: selectedAsset.mime_type,
											children: selectedAsset.mime_type || getFileExtension(selectedAsset.filename)
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
											className: "text-slate-500",
											children: "Uploaded"
										}), /* @__PURE__ */ jsx("dd", {
											className: "font-semibold text-slate-300 truncate",
											children: selectedAsset.created_at || "-"
										})] })
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("a", {
										href: selectedAsset.file_url,
										target: "_blank",
										rel: "noreferrer",
										className: "flex-1 rounded-lg border border-slate-800 bg-slate-900 py-1.5 text-center text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
										children: "Open full ↗"
									}), /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: (e) => handleDelete(selectedAsset.id, e),
										className: "rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/30 transition-colors",
										children: "Delete"
									})]
								})
							]
						}), /* @__PURE__ */ jsx("div", {
							className: "pt-4 border-t border-slate-800",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleConfirmSelect,
								className: "w-full rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:opacity-95 transition-opacity",
								children: "Choose this Asset"
							})
						})]
					})] })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-t border-slate-800 bg-[#090d16] px-6 py-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-xs text-slate-400",
						children: selectedAsset ? /* @__PURE__ */ jsxs("span", { children: ["Selected: ", /* @__PURE__ */ jsx("strong", {
							className: "text-slate-200",
							children: selectedAsset.filename
						})] }) : /* @__PURE__ */ jsx("span", { children: "Select an asset to view details or insert" })
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
							children: "Cancel"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: !selectedAsset,
							onClick: handleConfirmSelect,
							className: "rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all",
							children: "Insert Asset"
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/components/admin/MediaPickerField.jsx
/**
* Reusable form control that replaces raw file inputs with a centralized
* "Choose from Media Library" picker button and preview.
*
* @param {{
*   value?: string,
*   onChange: (url: string, asset?: object) => void,
*   preview?: string,
*   label?: string,
*   error?: string,
*   hint?: string,
*   required?: boolean,
*   filterType?: 'all' | 'image' | 'document',
*   buttonText?: string,
*   className?: string
* }} props
*/
function MediaPickerField({ value = "", onChange, preview = "", label, error, hint, required = false, filterType = "image", buttonText = "Choose from Media Library", className = "" }) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const activePreview = value || preview;
	const isImg = isImageAsset({ file_url: activePreview });
	const handleSelect = (asset) => {
		onChange(asset.file_url, asset);
	};
	const handleClear = () => {
		onChange("");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `space-y-2 ${className}`,
		children: [
			label && /* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-between",
				children: /* @__PURE__ */ jsxs("span", {
					className: "block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
					children: [label, required && /* @__PURE__ */ jsx("span", {
						className: "text-[#ff6b6b]",
						children: " *"
					})]
				})
			}),
			activePreview ? /* @__PURE__ */ jsxs("div", {
				className: "relative flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center",
					children: isImg ? /* @__PURE__ */ jsx("img", {
						src: activePreview,
						alt: "Selected asset preview",
						className: "h-full w-full object-contain"
					}) : /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center justify-center text-[var(--ink-faint)]",
						children: [/* @__PURE__ */ jsx("svg", {
							className: "h-6 w-6 text-[var(--ink-faint)] mb-0.5",
							fill: "none",
							viewBox: "0 0 24 24",
							stroke: "currentColor",
							children: /* @__PURE__ */ jsx("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								strokeWidth: "1.8",
								d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							})
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[9px] font-bold text-[var(--ink-faint)]",
							children: getFileExtension(activePreview)
						})]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate text-xs font-mono text-[var(--mute)]",
						title: activePreview,
						children: activePreview
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-2 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setPickerOpen(true),
							className: "rounded-md border border-[var(--field-line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] hover:bg-[var(--chip)] hover:text-[var(--ink-strong)] transition-colors",
							children: "Replace Asset"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: handleClear,
							className: "rounded-md border border-rose-900/40 bg-rose-950/20 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/30 transition-colors",
							children: "Remove"
						})]
					})]
				})]
			}) : /* @__PURE__ */ jsx("div", {
				className: "flex flex-col items-start gap-2",
				children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setPickerOpen(true),
					className: "inline-flex items-center gap-2.5 rounded-lg border border-[var(--field-line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:border-cyan-500/50 hover:bg-[var(--chip)] hover:text-[var(--ink-strong)] transition-all shadow-sm group",
					children: [/* @__PURE__ */ jsx("svg", {
						className: "h-4 w-4 text-cyan-400 transition-transform group-hover:scale-110",
						fill: "none",
						viewBox: "0 0 24 24",
						stroke: "currentColor",
						children: /* @__PURE__ */ jsx("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							strokeWidth: "2",
							d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						})
					}), /* @__PURE__ */ jsx("span", { children: buttonText })]
				})
			}),
			hint && !error && /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[11px] text-[var(--ink-faint)]",
				children: hint
			}),
			error && /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[12px] text-[#ff6b6b]",
				children: error
			}),
			/* @__PURE__ */ jsx(MediaPickerModal, {
				open: pickerOpen,
				onClose: () => setPickerOpen(false),
				onSelect: handleSelect,
				filterType,
				currentUrl: activePreview
			})
		]
	});
}
//#endregion
//#region resources/js/components/admin/ProjectGalleryManager.jsx
var ICON_BUTTON = "inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--field-line)] text-[12px] text-[var(--ink)] hover:bg-[var(--chip)] disabled:cursor-not-allowed disabled:opacity-40";
/** Show/hide switch for one gallery image. */
function VisibilitySwitch({ checked, onChange, label }) {
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		title: checked ? "Shown on the project page — click to hide" : "Hidden from the project page — click to show",
		onClick: () => onChange(!checked),
		className: "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
		style: { background: checked ? "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" : "var(--field-line)" },
		children: /* @__PURE__ */ jsx("span", {
			className: `inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`,
			"aria-hidden": true
		})
	});
}
var isVideo = (src = "") => /\.mp4(?:$|[?#])/i.test(src);
/**
* Full-size look at the gallery's images, in gallery order: the arrows (or
* ← → keys) step through them and Esc or a click outside closes it.
*/
function GalleryPreview({ images, index, onIndexChange, onClose }) {
	const image = images[index];
	const last = images.length - 1;
	useEffect(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
			if (event.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
			if (event.key === "ArrowRight" && index < last) onIndexChange(index + 1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		index,
		last,
		onClose,
		onIndexChange
	]);
	const NAV_BUTTON = "absolute top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-xl text-white backdrop-blur transition hover:bg-black/80 disabled:pointer-events-none disabled:opacity-0";
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[300] flex flex-col bg-black/85 backdrop-blur-sm",
		onClick: onClose,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `Image ${index + 1} of ${images.length}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-3 px-4 py-3 text-white",
			onClick: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ jsxs("p", {
				className: "min-w-0 truncate text-[13px]",
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "font-bold",
						children: [
							index + 1,
							" / ",
							images.length
						]
					}),
					image.hidden && /* @__PURE__ */ jsx("span", {
						className: "ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[11px]",
						children: "Hidden on the page"
					}),
					image.alt && /* @__PURE__ */ jsx("span", {
						className: "ml-2 text-white/70",
						children: image.alt
					})
				]
			}), /* @__PURE__ */ jsxs("span", {
				className: "flex shrink-0 items-center gap-2",
				children: [/* @__PURE__ */ jsx("a", {
					href: image.src,
					target: "_blank",
					rel: "noreferrer",
					className: "rounded-md border border-white/25 px-2.5 py-1 text-[12px] font-semibold hover:bg-white/10",
					children: "Open original ↗"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close preview",
					className: "rounded-md px-2 py-1 text-lg hover:bg-white/10",
					children: "✕"
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16",
			children: [
				isVideo(image.src) ? /* @__PURE__ */ jsx("video", {
					src: image.src,
					controls: true,
					autoPlay: true,
					muted: true,
					className: "max-h-full max-w-full rounded-lg",
					onClick: (event) => event.stopPropagation()
				}, image.src) : /* @__PURE__ */ jsx("img", {
					src: image.src,
					alt: image.alt || "",
					className: "max-h-full max-w-full rounded-lg object-contain shadow-2xl",
					onClick: (event) => event.stopPropagation()
				}, image.src),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: (event) => {
						event.stopPropagation();
						onIndexChange(index - 1);
					},
					disabled: index === 0,
					"aria-label": "Previous image",
					className: `${NAV_BUTTON} left-2 sm:left-4`,
					children: "‹"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: (event) => {
						event.stopPropagation();
						onIndexChange(index + 1);
					},
					disabled: index === last,
					"aria-label": "Next image",
					className: `${NAV_BUTTON} right-2 sm:right-4`,
					children: "›"
				})
			]
		})]
	});
}
/**
* Sequential gallery manager for a project's dedicated page.
*
* The admin picks images one by one from the Media Library and the list order
* is the display order — first row renders first on the public page. Each
* row can be moved up or down, swapped for another image, shown or hidden on
* the page, or removed.
*
* @param {{ values?: Array<{src: string, alt?: string, hidden?: boolean}>, onChange: (values: Array<{src: string, alt?: string, hidden?: boolean}>) => void, error?: string }} props
*/
function ProjectGalleryManager({ values = [], onChange, error }) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const [replacing, setReplacing] = useState(null);
	const [previewing, setPreviewing] = useState(null);
	const moveTo = (index, target) => {
		if (target < 0 || target >= values.length || target === index) return;
		const next = [...values];
		const [image] = next.splice(index, 1);
		next.splice(target, 0, image);
		onChange(next);
	};
	const remove = (index) => {
		onChange(values.filter((_, i) => i !== index));
	};
	const update = (index, patch) => {
		onChange(values.map((row, i) => i === index ? {
			...row,
			...patch
		} : row));
	};
	const openPicker = (index = null) => {
		setReplacing(index);
		setPickerOpen(true);
	};
	const handleSelect = (asset) => {
		if (replacing === null) onChange([...values, {
			src: asset.file_url,
			alt: asset.alt_text || "",
			hidden: false
		}]);
		else update(replacing, {
			src: asset.file_url,
			alt: values[replacing]?.alt || asset.alt_text || ""
		});
		setReplacing(null);
	};
	const shown = values.filter((image) => !image.hidden).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [
			values.length === 0 ? /* @__PURE__ */ jsx("p", {
				className: "rounded-lg border border-dashed border-[var(--field-line)] px-4 py-6 text-center text-[12px] text-[var(--ink-faint)]",
				children: "No gallery images yet, the dedicated page falls back to its placeholders. Use the button below to add the first image from the Media Library."
			}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("p", {
				className: "text-[12px] text-[var(--ink-faint)]",
				children: [
					values.length,
					" image",
					values.length === 1 ? "" : "s",
					", ",
					shown,
					" shown on the project page."
				]
			}), /* @__PURE__ */ jsx("ol", {
				className: "space-y-2",
				children: values.map((image, index) => /* @__PURE__ */ jsxs("li", {
					className: `flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-2.5 sm:flex-nowrap ${image.hidden ? "opacity-60" : ""}`,
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--chip)] text-[12px] font-bold text-[var(--ink)]",
							title: `Position ${index + 1}`,
							children: index + 1
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setPreviewing(index),
							"aria-label": `Preview image ${index + 1}`,
							title: "Click to preview",
							className: "relative h-12 w-16 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg)] transition hover:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
							children: /* @__PURE__ */ jsx("img", {
								src: image.src,
								alt: image.alt || "",
								className: "h-full w-full object-cover",
								loading: "lazy"
							})
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block truncate font-mono text-[11px] text-[var(--mute)]",
								title: image.src,
								children: image.src
							}), /* @__PURE__ */ jsx("input", {
								value: image.alt ?? "",
								onChange: (e) => update(index, { alt: e.target.value }),
								placeholder: "Alt text (optional)",
								"aria-label": `Alt text for image ${index + 1}`,
								className: "mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-[12px] text-[var(--ink)] placeholder-[var(--placeholder)] focus:border-cyan-500 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "flex shrink-0 items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx(VisibilitySwitch, {
									checked: !image.hidden,
									onChange: (visible) => update(index, { hidden: !visible }),
									label: `${image.hidden ? "Show" : "Hide"} image ${index + 1} on the project page`
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => moveTo(index, index - 1),
									disabled: index === 0,
									"aria-label": `Move image ${index + 1} up`,
									className: ICON_BUTTON,
									children: "↑"
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => moveTo(index, index + 1),
									disabled: index === values.length - 1,
									"aria-label": `Move image ${index + 1} down`,
									className: ICON_BUTTON,
									children: "↓"
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => openPicker(index),
									"aria-label": `Replace image ${index + 1}`,
									title: "Replace this image",
									className: ICON_BUTTON,
									children: /* @__PURE__ */ jsxs("svg", {
										"aria-hidden": "true",
										className: "h-3.5 w-3.5",
										fill: "none",
										viewBox: "0 0 24 24",
										stroke: "currentColor",
										strokeWidth: "1.8",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: [/* @__PURE__ */ jsx("path", { d: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" }), /* @__PURE__ */ jsx("path", { d: "m13.5 6.5 4 4" })]
									})
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => remove(index),
									"aria-label": `Remove image ${index + 1}`,
									className: "rounded-md border border-rose-900/40 bg-rose-950/20 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/30",
									children: "Remove"
								})
							]
						})
					]
				}, `${image.src}-${index}`))
			})] }),
			/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => openPicker(null),
				className: "inline-flex items-center gap-2.5 rounded-lg border border-[var(--field-line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] shadow-sm transition-all hover:border-cyan-500/50 hover:bg-[var(--chip)] hover:text-[var(--ink-strong)]",
				children: [/* @__PURE__ */ jsx("svg", {
					className: "h-4 w-4 text-cyan-400",
					fill: "none",
					viewBox: "0 0 24 24",
					stroke: "currentColor",
					children: /* @__PURE__ */ jsx("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						strokeWidth: "2",
						d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					})
				}), /* @__PURE__ */ jsx("span", { children: values.length === 0 ? "Add image from Media Library" : "Add another image" })]
			}) }),
			error && /* @__PURE__ */ jsx("span", {
				className: "block text-[12px] text-[#ff6b6b]",
				children: error
			}),
			previewing !== null && values[previewing] && /* @__PURE__ */ jsx(GalleryPreview, {
				images: values,
				index: previewing,
				onIndexChange: setPreviewing,
				onClose: () => setPreviewing(null)
			}),
			/* @__PURE__ */ jsx(MediaPickerModal, {
				open: pickerOpen,
				onClose: () => {
					setPickerOpen(false);
					setReplacing(null);
				},
				onSelect: handleSelect,
				filterType: "image",
				title: replacing === null ? "Add gallery image" : `Replace image ${replacing + 1}`
			})
		]
	});
}
//#endregion
//#region resources/js/components/admin/ui.jsx
/** Page heading with an optional action slot on the right. */
function PageHeader({ title, subtitle, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-8 flex flex-wrap items-end justify-between gap-4",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "font-display text-2xl font-extrabold tracking-tight text-[var(--ink-strong)]",
			children: title
		}), subtitle && /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-[13px] text-[var(--mute)]",
			children: subtitle
		})] }), children && /* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap items-center gap-3",
			children
		})]
	});
}
function Panel({ title, description, action, children, className = "" }) {
	return /* @__PURE__ */ jsxs("section", {
		className: `rounded-xl border border-[var(--line)] bg-[var(--surface)] ${className}`,
		children: [title && /* @__PURE__ */ jsxs("header", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]",
				children: title
			}), description && /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-[12px] text-[var(--mute)]",
				children: description
			})] }), action && /* @__PURE__ */ jsx("div", { children: action })]
		}), /* @__PURE__ */ jsx("div", {
			className: "p-5",
			children
		})]
	});
}
/**
* A collapsible widget card: tap the header to open it, tap again to close
* it. Every widget keeps its own open state, so opening or closing one never
* changes another. Its content stays mounted while closed, so nothing typed
* in it is lost.
*
* @param {{ title: string, description?: string, summary?: string, defaultOpen?: boolean, action?: import('react').ReactNode, children: import('react').ReactNode, className?: string }} props
*/
function WidgetPanel({ title, description, summary, defaultOpen = false, action, children, className = "" }) {
	const [open, setOpen] = useState(defaultOpen);
	return /* @__PURE__ */ jsxs("section", {
		className: `rounded-xl border bg-[var(--surface)] transition-colors ${open ? "border-[var(--brand-2)]/50" : "border-[var(--line)]"} ${className}`,
		children: [/* @__PURE__ */ jsxs("header", {
			className: "flex items-center gap-3 px-5 py-4",
			children: [/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setOpen((value) => !value),
				"aria-expanded": open,
				className: "flex min-w-0 flex-1 items-center gap-3 text-left",
				children: [/* @__PURE__ */ jsx("svg", {
					viewBox: "0 0 12 7",
					className: `h-[7px] w-3 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 ${open ? "rotate-180" : ""}`,
					fill: "none",
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("path", {
						d: "M1 1l5 5 5-5",
						stroke: "currentColor",
						strokeWidth: "1.6",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})
				}), /* @__PURE__ */ jsxs("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("span", {
						className: "block font-display text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]",
						children: title
					}), (open ? description : summary || description) && /* @__PURE__ */ jsx("span", {
						className: "mt-1 block truncate text-[12px] text-[var(--mute)]",
						children: open ? description : summary || description
					})]
				})]
			}), action && /* @__PURE__ */ jsx("div", {
				className: "shrink-0",
				children: action
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: open ? "border-t border-[var(--line)] p-5" : "hidden",
			children
		})]
	});
}
var BUTTON_BASE = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
function Button({ as = "button", variant = "primary", className = "", ...props }) {
	const styles = {
		primary: "text-white",
		secondary: "border border-[var(--field-line)] text-[var(--ink)] hover:bg-[var(--chip)]",
		danger: "border border-[#ff6b6b]/40 text-[#ff6b6b] hover:bg-[#ff6b6b]/10",
		ghost: "text-[var(--ink-faint)] hover:text-[var(--ink)]",
		dangerGhost: "text-[#ff6b6b] hover:opacity-80"
	}[variant];
	const style = variant === "primary" ? { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" } : void 0;
	return /* @__PURE__ */ jsx(as === "link" ? Link : as, {
		className: `${BUTTON_BASE} ${styles} ${className}`,
		style,
		...props
	});
}
/** Labelled form control that renders its own validation message. */
function Field({ label, error, hint, required = false, children, className = "" }) {
	return /* @__PURE__ */ jsxs("label", {
		className: `block ${className}`,
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
				children: [label, required && /* @__PURE__ */ jsx("span", {
					className: "text-[#ff6b6b]",
					children: " *"
				})]
			}),
			children,
			hint && !error && /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[11px] text-[var(--ink-faint)]",
				children: hint
			}),
			error && /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[12px] text-[#ff6b6b]",
				children: error
			})
		]
	});
}
/**
* The admin's pill-style segmented tab bar: an auto-width track with a
* subtle border, neutral inactive pills and the brand gradient on the active
* one. Callers keep their own text classes, so typography stays per bar.
*/
var TAB_BAR_CLASS = "inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1";
var TAB_GRADIENT = { background: "linear-gradient(90deg,var(--brand-1),var(--brand-2),var(--brand-3))" };
function tabClass(active) {
	return `rounded-full px-4 py-1.5 transition-all duration-200 ease-out ${active ? "text-white shadow-sm" : "text-[var(--ink-faint)] hover:bg-[var(--chip)] hover:text-[var(--ink)]"}`;
}
var INPUT_CLASS = "w-full rounded-lg border border-[var(--field-line)] bg-[var(--bg)] px-3 py-2.5 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-3)] focus:border-[var(--brand-3)] transition-colors";
function Input({ className = "", ...props }) {
	return /* @__PURE__ */ jsx("input", {
		className: `${INPUT_CLASS} ${className}`,
		...props
	});
}
function Textarea({ className = "", rows = 4, ...props }) {
	return /* @__PURE__ */ jsx("textarea", {
		rows,
		className: `${INPUT_CLASS} resize-y ${className}`,
		...props
	});
}
/** The admin's dropdown, in the site theme (see ThemedSelect). */
function Select(props) {
	return /* @__PURE__ */ jsx(ThemedSelect, { ...props });
}
/**
* One column of a two-column editor. It sticks while the other column
* scrolls, so neither side leaves a blank area: a column shorter than the
* screen stays at the shared top line, and a taller one scrolls with the page
* until its end is in view, then holds there (clear of a fixed save bar,
* `bottomOffset`), never needing a scrollbar of its own. Put it on both
* columns and whichever is shorter is the one that sticks.
*/
function StickyColumn({ className = "", topOffset = 24, bottomOffset = 24, children }) {
	const ref = useRef(null);
	const [top, setTop] = useState(topOffset);
	useEffect(() => {
		const element = ref.current;
		if (!element) return void 0;
		const update = () => setTop(Math.min(topOffset, window.innerHeight - element.offsetHeight - bottomOffset));
		update();
		const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
		observer?.observe(element);
		window.addEventListener("resize", update);
		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", update);
		};
	}, [topOffset, bottomOffset]);
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: `lg:sticky lg:self-start ${className}`,
		style: { top },
		children
	});
}
/** Hex colour input paired with a native swatch picker. */
function ColorInput({ value, onChange, ...props }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ jsx("input", {
			type: "color",
			value: /^#[0-9a-fA-F]{6}$/.test(value ?? "") ? value : "#891FFB",
			onChange: (e) => onChange(e.target.value.toUpperCase()),
			className: "h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--field-line)] bg-[var(--bg)] p-1 focus:outline-none focus:ring-1 focus:ring-[var(--brand-3)] focus:border-[var(--brand-3)] transition-colors",
			"aria-label": "Colour picker"
		}), /* @__PURE__ */ jsx(Input, {
			value: value ?? "",
			onChange: (e) => onChange(e.target.value),
			placeholder: "#891FFB",
			...props
		})]
	});
}
var BADGE_TONES = {
	published: "border-[var(--brand-3)]/40 text-[var(--brand-3)]",
	draft: "border-[var(--field-line)] text-[var(--ink-faint)]",
	new: "border-[var(--brand-1)]/40 text-[var(--brand-1)]",
	in_progress: "border-[var(--brand-2)]/40 text-[var(--brand-2)]",
	replied: "border-[var(--brand-3)]/40 text-[var(--brand-3)]",
	archived: "border-[var(--field-line)] text-[var(--ink-faint)]"
};
function Badge({ tone, children }) {
	return /* @__PURE__ */ jsx("span", {
		className: `inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${BADGE_TONES[tone] ?? BADGE_TONES.draft}`,
		children: children ?? tone?.replace("_", " ")
	});
}
function EmptyState({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "py-12 text-center text-[13px] text-[var(--mute)]",
		children
	});
}
/**
* Repeatable single-value input (tags, capabilities, deliverables).
*
* @param {{ values: string[], onChange: (values: string[]) => void, placeholder?: string, addLabel?: string, errors?: Record<string, string>, name?: string }} props
*/
function RepeatableList({ values, onChange, placeholder = "", addLabel = "Add item", errors = {}, name = "" }) {
	const update = (index, value) => onChange(values.map((v, i) => i === index ? value : v));
	const remove = (index) => onChange(values.filter((_, i) => i !== index));
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [values.map((value, index) => /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ jsx(Input, {
					value,
					onChange: (e) => update(index, e.target.value),
					placeholder
				}), errors[`${name}.${index}`] && /* @__PURE__ */ jsx("span", {
					className: "mt-1 block text-[12px] text-[#ff6b6b]",
					children: errors[`${name}.${index}`]
				})]
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => remove(index),
				"aria-label": `Remove item ${index + 1}`,
				className: "mt-1 rounded-lg border border-[var(--field-line)] px-3 py-2 text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]",
				children: "×"
			})]
		}, index)), /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => onChange([...values, ""]),
			className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
			children: ["+ ", addLabel]
		})]
	});
}
/**
* Repeatable object rows built from a field spec, e.g. `{value, label}` pairs.
*
* @param {{ values: object[], onChange: (values: object[]) => void, fields: {key: string, placeholder: string, type?: string}[], addLabel?: string, errors?: Record<string, string>, name?: string }} props
*/
function RepeatableRows({ values, onChange, fields, addLabel = "Add row", errors = {}, name = "" }) {
	const blank = Object.fromEntries(fields.map((f) => [f.key, ""]));
	const update = (index, key, value) => onChange(values.map((row, i) => i === index ? {
		...row,
		[key]: value
	} : row));
	const remove = (index) => onChange(values.filter((_, i) => i !== index));
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [values.map((row, index) => /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ jsx("div", {
				className: "grid flex-1 gap-2",
				style: { gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` },
				children: fields.map((field) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Input, {
					type: field.type ?? "text",
					value: row[field.key] ?? "",
					onChange: (e) => update(index, field.key, e.target.value),
					placeholder: field.placeholder,
					"aria-label": `${field.placeholder} ${index + 1}`
				}), errors[`${name}.${index}.${field.key}`] && /* @__PURE__ */ jsx("span", {
					className: "mt-1 block text-[12px] text-[#ff6b6b]",
					children: errors[`${name}.${index}.${field.key}`]
				})] }, field.key))
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => remove(index),
				"aria-label": `Remove row ${index + 1}`,
				className: "mt-1 rounded-lg border border-[var(--field-line)] px-3 py-2 text-[12px] text-[var(--ink-faint)] hover:text-[#ff6b6b]",
				children: "×"
			})]
		}, index)), /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => onChange([...values, blank]),
			className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
			children: ["+ ", addLabel]
		})]
	});
}
/** Turn a title into a URL-safe slug, matching Laravel's `alpha_dash` rule. */
function slugify(value) {
	return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
/**
* Confirmation dialog for destructive actions.
*
* Rendered as a real modal rather than `window.confirm` so the consequence
* can be spelled out — "this also unfiles 12 projects" is worth reading
* before clicking, and a native dialog cannot say it.
*
* @param {{ open: boolean, title: string, body?: string, confirmLabel?: string, onConfirm: () => void, onCancel: () => void }} props
*/
function ConfirmDialog({ open, title, body, confirmLabel = "Delete", onConfirm, onCancel }) {
	useEffect(() => {
		if (!open) return void 0;
		const onKey = (event) => {
			if (event.key === "Escape") onCancel();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onCancel]);
	if (!open) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[200] flex items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Cancel",
			onClick: onCancel,
			className: "absolute inset-0 bg-black/60"
		}), /* @__PURE__ */ jsxs("div", {
			role: "alertdialog",
			"aria-modal": "true",
			"aria-label": title,
			className: "relative w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "font-display text-[16px] font-extrabold text-[var(--ink-strong)]",
					children: title
				}),
				body && /* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[13px] leading-relaxed text-[var(--mute)]",
					children: body
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex justify-end gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: onCancel,
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "danger",
						onClick: onConfirm,
						children: confirmLabel
					})]
				})
			]
		})]
	});
}
/**
* Wires a `ConfirmDialog` to an arbitrary action.
*
* @returns {[object|null, (request: {title: string, body?: string, confirmLabel?: string, action: () => void}) => void, () => void]}
*/
function useConfirm() {
	const [request, setRequest] = useState(null);
	const confirm = (next) => setRequest(next);
	const cancel = () => setRequest(null);
	const run = () => {
		request?.action?.();
		setRequest(null);
	};
	return [
		request,
		confirm,
		cancel,
		run
	];
}
/** Labelled on/off switch. */
function Toggle({ checked, onChange, label, hint }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "flex cursor-pointer items-start gap-3",
		children: [/* @__PURE__ */ jsx("input", {
			type: "checkbox",
			checked: !!checked,
			onChange: (e) => onChange(e.target.checked),
			className: "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--brand-2)]"
		}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
			className: "block text-[13px] font-semibold text-[var(--ink)]",
			children: label
		}), hint && /* @__PURE__ */ jsx("span", {
			className: "mt-0.5 block text-[11px] text-[var(--ink-faint)]",
			children: hint
		})] })]
	});
}
//#endregion
export { MediaPickerField as C, ProjectGalleryManager as S, Toggle as _, EmptyState as a, tabClass as b, PageHeader as c, RepeatableRows as d, Select as f, Textarea as g, TAB_GRADIENT as h, ConfirmDialog as i, Panel as l, TAB_BAR_CLASS as m, Button as n, Field as o, StickyColumn as p, ColorInput as r, Input as s, Badge as t, RepeatableList as u, WidgetPanel as v, useConfirm as x, slugify as y };
