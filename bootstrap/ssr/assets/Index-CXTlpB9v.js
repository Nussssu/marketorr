import { t as AdminLayout } from "./AdminLayout-Cz9lUOUz.js";
import { a as EmptyState, c as PageHeader, g as useConfirm, i as ConfirmDialog, l as Panel, n as Button, t as Badge } from "./ui-0XaBzweS.js";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Projects/Index.jsx
function ProjectsIndex({ projects }) {
	const [rows, setRows] = useState(projects);
	const [request, confirm, cancel, run] = useConfirm();
	useEffect(() => {
		setRows(projects);
	}, [projects]);
	const move = (index, direction) => {
		const target = index + direction;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		setRows(next);
		router.patch("/admin/projects/reorder", { ids: next.map((r) => r.id) }, { preserveScroll: true });
	};
	const toggleFeatured = (project) => {
		router.patch(`/admin/projects/${project.id}/featured`, {}, { preserveScroll: true });
	};
	const askDelete = (project) => {
		confirm({
			title: `Delete “${project.title}”?`,
			body: "The project is soft-deleted and can be restored from the database.",
			action: () => router.delete(`/admin/projects/${project.id}`, { preserveScroll: true })
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Projects | Marketorr Admin" }),
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Projects",
			subtitle: `${rows.length} case studies. Order here is the order on the public site.`,
			children: /* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/projects/create",
				children: "New project"
			})
		}),
		/* @__PURE__ */ jsx(Panel, {
			className: "overflow-hidden",
			children: rows.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { children: "No projects yet, create the first one." }) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[820px] text-left text-[13px]",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-3 font-bold",
								children: "Order"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Project"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Client"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Year"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Featured"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "pb-3 pr-4 font-bold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", { className: "pb-3 font-bold" })
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((project, index) => /* @__PURE__ */ jsxs("tr", {
						className: "border-t border-[var(--line)]",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-1",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => move(index, -1),
										disabled: index === 0,
										"aria-label": `Move ${project.title} up`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↑"
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => move(index, 1),
										disabled: index === rows.length - 1,
										"aria-label": `Move ${project.title} down`,
										className: "rounded border border-[var(--line)] px-2 text-[11px] leading-5 text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-30",
										children: "↓"
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx("img", {
										src: project.image_url,
										alt: "",
										className: "h-10 w-16 shrink-0 rounded object-cover",
										loading: "lazy"
									}), /* @__PURE__ */ jsxs("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ jsx("p", {
											className: "truncate font-semibold text-[var(--ink)]",
											children: project.title
										}), /* @__PURE__ */ jsxs("p", {
											className: "truncate text-[12px] text-[var(--ink-faint)]",
											children: ["/", project.slug]
										})]
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: project.client
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4 text-[var(--mute)]",
								children: project.year
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx("button", {
									onClick: () => toggleFeatured(project),
									role: "switch",
									"aria-checked": project.featured,
									"aria-label": `Feature ${project.title}`,
									className: `relative h-6 w-11 rounded-full border transition-colors ${project.featured ? "border-transparent" : "border-[var(--field-line)] bg-[var(--chip)]"}`,
									style: project.featured ? { background: "linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB)" } : void 0,
									children: /* @__PURE__ */ jsx("span", { className: `absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ${project.featured ? "left-[25px]" : "left-[3px]"}` })
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-3 pr-4",
								children: /* @__PURE__ */ jsx(Badge, { tone: project.status })
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-3 text-right whitespace-nowrap",
								children: [/* @__PURE__ */ jsx(Link, {
									href: `/admin/projects/${project.id}/edit`,
									className: "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)] hover:text-[var(--ink)]",
									children: "Edit"
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => askDelete(project),
									className: "ml-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff6b6b] hover:opacity-80",
									children: "Delete"
								})]
							})
						]
					}, project.id)) })]
				})
			})
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
ProjectsIndex.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { ProjectsIndex as default };
