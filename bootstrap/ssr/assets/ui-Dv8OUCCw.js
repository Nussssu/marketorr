import { Link } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
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
							className: "flex items-center rounded-lg bg-slate-900/90 p-1 border border-slate-800",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setActiveTab("browse"),
								className: `rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "browse" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-slate-200"}`,
								children: "Browse Assets"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setActiveTab("upload"),
								className: `rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "upload" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-slate-200"}`,
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
							/* @__PURE__ */ jsxs("select", {
								value: selectedCategory,
								onChange: (e) => setSelectedCategory(e.target.value),
								className: "rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors",
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
									className: `group relative flex flex-col rounded-xl border p-2 text-left cursor-pointer transition-all ${isSelected ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(27,226,235,0.15)] ring-1 ring-cyan-400" : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/90"}`,
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
				className: "relative flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center",
					children: isImg ? /* @__PURE__ */ jsx("img", {
						src: activePreview,
						alt: "Selected asset preview",
						className: "h-full w-full object-contain"
					}) : /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center justify-center text-slate-400",
						children: [/* @__PURE__ */ jsx("svg", {
							className: "h-6 w-6 text-slate-500 mb-0.5",
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
							className: "text-[9px] font-bold text-slate-400",
							children: getFileExtension(activePreview)
						})]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate text-xs font-mono text-slate-300",
						title: activePreview,
						children: activePreview
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-2 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setPickerOpen(true),
							className: "rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors",
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
					className: "inline-flex items-center gap-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white transition-all shadow-sm group",
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
/**
* Sequential gallery manager for a project's dedicated page.
*
* The admin picks images one by one from the Media Library and the list order
* is the display order — first row renders first on the public page. Rows can
* be moved up/down or removed; nothing else on the page is affected.
*
* @param {{ values?: Array<{src: string, alt?: string}>, onChange: (values: Array<{src: string, alt?: string}>) => void, error?: string }} props
*/
function ProjectGalleryManager({ values = [], onChange, error }) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const move = (index, delta) => {
		const next = [...values];
		const target = index + delta;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		onChange(next);
	};
	const remove = (index) => {
		onChange(values.filter((_, i) => i !== index));
	};
	const updateAlt = (index, alt) => {
		onChange(values.map((row, i) => i === index ? {
			...row,
			alt
		} : row));
	};
	const handleSelect = (asset) => {
		onChange([...values, {
			src: asset.file_url,
			alt: asset.alt_text || ""
		}]);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [
			values.length === 0 ? /* @__PURE__ */ jsx("p", {
				className: "rounded-lg border border-dashed border-[var(--field-line)] px-4 py-6 text-center text-[12px] text-[var(--ink-faint)]",
				children: "No gallery images yet, the dedicated page falls back to its placeholders. Use the button below to add the first image from the Media Library."
			}) : /* @__PURE__ */ jsx("ol", {
				className: "space-y-2",
				children: values.map((image, index) => /* @__PURE__ */ jsxs("li", {
					className: "flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[12px] font-bold text-slate-200",
							title: `Position ${index + 1}`,
							children: index + 1
						}),
						/* @__PURE__ */ jsx("span", {
							className: "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950",
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
								className: "block truncate font-mono text-[11px] text-slate-300",
								title: image.src,
								children: image.src
							}), /* @__PURE__ */ jsx("input", {
								value: image.alt ?? "",
								onChange: (e) => updateAlt(index, e.target.value),
								placeholder: "Alt text (optional)",
								"aria-label": `Alt text for image ${index + 1}`,
								className: "mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[12px] text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "flex shrink-0 flex-col gap-1",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => move(index, -1),
									disabled: index === 0,
									"aria-label": `Move image ${index + 1} up`,
									className: "rounded-md border border-slate-700 px-2 py-0.5 text-[12px] text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40",
									children: "↑"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => move(index, 1),
									disabled: index === values.length - 1,
									"aria-label": `Move image ${index + 1} down`,
									className: "rounded-md border border-slate-700 px-2 py-0.5 text-[12px] text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40",
									children: "↓"
								})]
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => remove(index),
								"aria-label": `Remove image ${index + 1}`,
								className: "rounded-md border border-rose-900/40 bg-rose-950/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/30",
								children: "Remove"
							})]
						})
					]
				}, `${image.src}-${index}`))
			}),
			/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setPickerOpen(true),
				className: "inline-flex items-center gap-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-2.5 text-xs font-semibold text-slate-200 shadow-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white",
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
			/* @__PURE__ */ jsx(MediaPickerModal, {
				open: pickerOpen,
				onClose: () => setPickerOpen(false),
				onSelect: handleSelect,
				filterType: "image",
				title: "Add gallery image"
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
var BUTTON_BASE = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
function Button({ as = "button", variant = "primary", className = "", ...props }) {
	const styles = {
		primary: "text-white",
		secondary: "border border-[var(--field-line)] text-[var(--ink)] hover:bg-[var(--chip)]",
		danger: "border border-[#ff6b6b]/40 text-[#ff6b6b] hover:bg-[#ff6b6b]/10",
		ghost: "text-[var(--ink-faint)] hover:text-[var(--ink)]"
	}[variant];
	const style = variant === "primary" ? { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" } : void 0;
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
var INPUT_CLASS = "w-full rounded-lg border border-[var(--field-line)] bg-[var(--bg)] px-3 py-2.5 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors";
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
function Select({ className = "", children, ...props }) {
	return /* @__PURE__ */ jsx("select", {
		className: `${INPUT_CLASS} ${className}`,
		...props,
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
			className: "h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--field-line)] bg-[var(--bg)] p-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors",
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
	published: "border-[#1BE2EB]/40 text-[#1BE2EB]",
	draft: "border-[var(--field-line)] text-[var(--ink-faint)]",
	new: "border-[#891FFB]/40 text-[#891FFB]",
	in_progress: "border-[#507AF4]/40 text-[#507AF4]",
	replied: "border-[#1BE2EB]/40 text-[#1BE2EB]",
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
			className: "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#507AF4]"
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
export { ProjectGalleryManager as _, EmptyState as a, PageHeader as c, RepeatableRows as d, Select as f, useConfirm as g, slugify as h, ConfirmDialog as i, Panel as l, Toggle as m, Button as n, Field as o, Textarea as p, ColorInput as r, Input as s, Badge as t, RepeatableList as u, MediaPickerField as v };
