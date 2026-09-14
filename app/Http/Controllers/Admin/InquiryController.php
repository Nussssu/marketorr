<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(InquiryStatus::values())],
            'type' => ['nullable', Rule::in(InquiryType::values())],
            'search' => ['nullable', 'string', 'max:120'],
        ]);

        $inquiries = ContactSubmission::query()
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(
                fn (Builder $inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"),
            ))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ContactSubmission $inquiry) => [
                'id' => $inquiry->id,
                'name' => $inquiry->name,
                'email' => $inquiry->email,
                'company' => $inquiry->company,
                'type' => $inquiry->type->value,
                'budget' => $inquiry->budget,
                'status' => $inquiry->status->value,
                'createdAt' => $inquiry->created_at?->format('j M Y, H:i'),
            ]);

        return Inertia::render('Admin/Inquiries/Index', [
            'inquiries' => $inquiries,
            'filters' => [
                'status' => $filters['status'] ?? '',
                'type' => $filters['type'] ?? '',
                'search' => $filters['search'] ?? '',
            ],
            'statuses' => InquiryStatus::values(),
            'types' => InquiryType::values(),
        ]);
    }

    public function show(ContactSubmission $inquiry): Response
    {
        return Inertia::render('Admin/Inquiries/Show', [
            'inquiry' => [
                'id' => $inquiry->id,
                'name' => $inquiry->name,
                'email' => $inquiry->email,
                'company' => $inquiry->company,
                'type' => $inquiry->type->value,
                'budget' => $inquiry->budget,
                'message' => $inquiry->message,
                'status' => $inquiry->status->value,
                'ipAddress' => $inquiry->ip_address,
                'userAgent' => $inquiry->user_agent,
                'createdAt' => $inquiry->created_at?->format('j M Y, H:i'),
            ],
            'statuses' => InquiryStatus::values(),
        ]);
    }

    public function updateStatus(Request $request, ContactSubmission $inquiry): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(InquiryStatus::class)],
        ]);

        $inquiry->update($validated);

        return back()->with('success', 'Status updated.');
    }

    public function destroy(ContactSubmission $inquiry): RedirectResponse
    {
        $inquiry->delete();

        return redirect()
            ->route('admin.inquiries.index')
            ->with('success', 'Inquiry deleted.');
    }
}
