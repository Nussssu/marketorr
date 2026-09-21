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
use Symfony\Component\HttpFoundation\StreamedResponse;

class InquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(InquiryStatus::values())],
            'type' => ['nullable', Rule::in(InquiryType::values())],
            'search' => ['nullable', 'string', 'max:120'],
        ]);

        $inquiries = $this->filteredQuery($filters)
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ContactSubmission $inquiry) => [
                'id' => $inquiry->id,
                'name' => $inquiry->name,
                'email' => $inquiry->email,
                'phone' => $inquiry->phone,
                'company' => $inquiry->company,
                'type' => $inquiry->type->value,
                'budget' => $inquiry->budget,
                'sourcePage' => $inquiry->source_page,
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
                'phone' => $inquiry->phone,
                'company' => $inquiry->company,
                'type' => $inquiry->type->value,
                'budget' => $inquiry->budget,
                'message' => $inquiry->message,
                'sourcePage' => $inquiry->source_page,
                'adminNotes' => $inquiry->admin_notes,
                'respondedAt' => $inquiry->responded_at?->format('j M Y, H:i'),
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

        $inquiry->update([
            ...$validated,
            // Stamp the first time a lead is marked replied, so the inbox can
            // show response time without a separate audit table.
            'responded_at' => $validated['status'] === InquiryStatus::Replied->value
                ? ($inquiry->responded_at ?? now())
                : $inquiry->responded_at,
        ]);

        return back()->with('success', 'Status updated.');
    }

    public function updateNotes(Request $request, ContactSubmission $inquiry): RedirectResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $inquiry->update($validated);

        return back()->with('success', 'Notes saved.');
    }

    /**
     * Stream the current filter selection as CSV.
     *
     * Chunked rather than collected, so exporting a long inbox does not load
     * every row into memory at once.
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(InquiryStatus::values())],
            'type' => ['nullable', Rule::in(InquiryType::values())],
            'search' => ['nullable', 'string', 'max:120'],
        ]);

        $query = $this->filteredQuery($filters)->latest();
        $filename = 'leads-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'wb');
            fputcsv($handle, ContactSubmission::csvHeader());

            $query->chunk(500, function ($inquiries) use ($handle): void {
                foreach ($inquiries as $inquiry) {
                    fputcsv($handle, $inquiry->toCsvRow());
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function destroy(ContactSubmission $inquiry): RedirectResponse
    {
        $inquiry->delete();

        return redirect()
            ->route('admin.inquiries.index')
            ->with('success', 'Inquiry deleted.');
    }

    /**
     * The inbox query shared by the listing and the CSV export.
     *
     * @param  array<string, string|null>  $filters
     * @return Builder<ContactSubmission>
     */
    private function filteredQuery(array $filters): Builder
    {
        return ContactSubmission::query()
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(
                fn (Builder $inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%"),
            ));
    }
}
