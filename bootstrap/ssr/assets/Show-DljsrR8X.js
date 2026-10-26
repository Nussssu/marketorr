import { t as AdminLayout } from "./AdminLayout-DOe_NlIH.js";
import { c as PageHeader, f as Select, g as Textarea, i as ConfirmDialog, l as Panel, n as Button, o as Field, t as Badge, x as useConfirm } from "./ui-Dz4ZqU85.js";
import { Head, router, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/Admin/Inquiries/Show.jsx
function Detail({ label, children }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
		className: "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]",
		children: label
	}), /* @__PURE__ */ jsx("p", {
		className: "mt-1 break-words text-[14px] text-[var(--ink)]",
		children: children ?? "-"
	})] });
}
function InquiryShow({ inquiry, statuses }) {
	const [request, confirm, cancel, run] = useConfirm();
	const notes = useForm({ admin_notes: inquiry.adminNotes ?? "" });
	const updateStatus = (status) => {
		router.patch(`/admin/inquiries/${inquiry.id}/status`, { status }, { preserveScroll: true });
	};
	const saveNotes = (e) => {
		e.preventDefault();
		notes.patch(`/admin/inquiries/${inquiry.id}/notes`, { preserveScroll: true });
	};
	const askDelete = () => {
		confirm({
			title: "Delete this lead?",
			body: `${inquiry.name}'s submission will be removed permanently. This cannot be undone.`,
			action: () => router.delete(`/admin/inquiries/${inquiry.id}`)
		});
	};
	const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your project inquiry: ${inquiry.type}`)}`;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${inquiry.name} | Marketorr Admin` }),
		/* @__PURE__ */ jsxs(PageHeader, {
			title: inquiry.name,
			subtitle: `Received ${inquiry.createdAt}`,
			children: [/* @__PURE__ */ jsx(Button, {
				as: "link",
				href: "/admin/inquiries",
				variant: "secondary",
				children: "← All inquiries"
			}), /* @__PURE__ */ jsx(Button, {
				as: "a",
				href: mailto,
				children: "Reply by email ↗"
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-6 lg:col-span-2",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Message",
						children: /* @__PURE__ */ jsx("p", {
							className: "whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--ink)]",
							children: inquiry.message
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Contact details",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Detail, {
									label: "Email",
									children: inquiry.email
								}),
								/* @__PURE__ */ jsx(Detail, {
									label: "Phone",
									children: inquiry.phone
								}),
								/* @__PURE__ */ jsx(Detail, {
									label: "Company",
									children: inquiry.company
								}),
								/* @__PURE__ */ jsx(Detail, {
									label: "Project type",
									children: inquiry.type
								}),
								/* @__PURE__ */ jsx(Detail, {
									label: "Budget",
									children: inquiry.budget
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Request metadata",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Detail, {
									label: "Source page",
									children: inquiry.sourcePage
								}),
								/* @__PURE__ */ jsx(Detail, {
									label: "First replied",
									children: inquiry.respondedAt
								}),
								/* @__PURE__ */ jsx(Detail, {
									label: "IP address",
									children: inquiry.ipAddress
								}),
								/* @__PURE__ */ jsx(Detail, {
									label: "User agent",
									children: inquiry.userAgent
								})
							]
						})
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Status",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ jsx(Badge, { tone: inquiry.status }), /* @__PURE__ */ jsx(Field, {
								label: "Change status",
								children: /* @__PURE__ */ jsx(Select, {
									value: inquiry.status,
									onChange: (e) => updateStatus(e.target.value),
									children: statuses.map((s) => /* @__PURE__ */ jsx("option", {
										value: s,
										children: s.replace("_", " ")
									}, s))
								})
							})]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Internal notes",
						description: "Only visible here.",
						children: /* @__PURE__ */ jsxs("form", {
							onSubmit: saveNotes,
							className: "grid gap-4",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Notes",
								error: notes.errors.admin_notes,
								children: /* @__PURE__ */ jsx(Textarea, {
									rows: 5,
									value: notes.data.admin_notes,
									onChange: (e) => notes.setData("admin_notes", e.target.value)
								})
							}), /* @__PURE__ */ jsx(Button, {
								type: "submit",
								variant: "secondary",
								disabled: notes.processing,
								children: notes.processing ? "Saving…" : "Save notes"
							})]
						})
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "danger",
						onClick: askDelete,
						className: "w-full",
						children: "Delete lead"
					})
				]
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
InquiryShow.layout = (page) => /* @__PURE__ */ jsx(AdminLayout, { children: page });
//#endregion
export { InquiryShow as default };
