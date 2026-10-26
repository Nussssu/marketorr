<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Services\TrashBin;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Illuminate\Validation\ValidationException;
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
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
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
                'message' => $inquiry->message,
                'sourcePage' => $inquiry->source_page,
                'adminNotes' => $inquiry->admin_notes,
                'respondedAt' => $inquiry->responded_at?->format('j M Y, H:i'),
                'status' => $inquiry->status->value,
                'ipAddress' => $inquiry->ip_address,
                'userAgent' => $inquiry->user_agent,
                'createdAt' => $inquiry->created_at?->format('j M Y, H:i'),
            ]);

        return Inertia::render('Admin/Inquiries/Index', [
            'inquiries' => $inquiries,
            'filters' => [
                'status' => $filters['status'] ?? '',
                'type' => $filters['type'] ?? '',
                'search' => $filters['search'] ?? '',
                'from' => $filters['from'] ?? '',
                'to' => $filters['to'] ?? '',
            ],
            'statuses' => InquiryStatus::values(),
            'types' => [InquiryType::Branding->value, InquiryType::UiUx->value],
            // Totals across the whole inbox, whatever the filters, for the count chips.
            'counts' => $this->statusCounts(),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function statusCounts(): array
    {
        $byStatus = ContactSubmission::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'total' => (int) $byStatus->sum(),
            ...collect(InquiryStatus::values())->mapWithKeys(fn (string $status): array => [$status => (int) ($byStatus[$status] ?? 0)])->all(),
        ];
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
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
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

    public function importCsv(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'csv' => ['required', File::types(['csv', 'txt'])->max(5 * 1024)],
        ]);

        $handle = fopen($validated['csv']->getRealPath(), 'rb');

        if ($handle === false) {
            throw ValidationException::withMessages([
                'csv' => 'The CSV file could not be read.',
            ]);
        }

        try {
            $header = fgetcsv($handle, null, ',', '"', '');

            if ($header === false) {
                throw ValidationException::withMessages([
                    'csv' => 'The CSV file is empty.',
                ]);
            }

            $header = array_map(
                fn (string $column): string => str($column)
                    ->replaceFirst("\xEF\xBB\xBF", '')
                    ->trim()
                    ->lower()
                    ->replace([' ', '-'], '_')
                    ->value(),
                $header,
            );

            $missingColumns = array_diff(['name', 'email', 'type', 'message'], $header);

            if ($missingColumns !== []) {
                throw ValidationException::withMessages([
                    'csv' => 'Missing required columns: '.implode(', ', $missingColumns).'.',
                ]);
            }

            $records = [];
            $lineNumber = 1;

            while (($row = fgetcsv($handle, null, ',', '"', '')) !== false) {
                $lineNumber++;

                if (count(array_filter($row, fn (?string $value): bool => trim((string) $value) !== '')) === 0) {
                    continue;
                }

                if (count($row) !== count($header)) {
                    throw ValidationException::withMessages([
                        'csv' => "Row {$lineNumber} does not match the CSV header.",
                    ]);
                }

                $record = array_combine($header, array_map(
                    fn (?string $value): string => trim((string) $value),
                    $row,
                ));

                $validator = Validator::make($record, [
                    'name' => ['required', 'string', 'max:255'],
                    'email' => ['required', 'email', 'max:255'],
                    'phone' => ['nullable', 'string', 'max:255'],
                    'company' => ['nullable', 'string', 'max:255'],
                    'type' => ['required', Rule::in(InquiryType::values())],
                    'budget' => ['nullable', 'string', 'max:255'],
                    'message' => ['required', 'string'],
                    'source_page' => ['nullable', 'string', 'max:255'],
                    'status' => ['nullable', Rule::in(InquiryStatus::values())],
                ]);

                if ($validator->fails()) {
                    throw ValidationException::withMessages([
                        'csv' => "Row {$lineNumber}: ".$validator->errors()->first(),
                    ]);
                }

                $data = $validator->validated();
                $records[] = [
                    ...$data,
                    'phone' => $data['phone'] ?? null,
                    'company' => $data['company'] ?? null,
                    'budget' => $data['budget'] ?? null,
                    'source_page' => $data['source_page'] ?? null,
                    'status' => ($data['status'] ?? '') !== '' ? $data['status'] : InquiryStatus::New->value,
                ];

                if (count($records) > 5000) {
                    throw ValidationException::withMessages([
                        'csv' => 'A CSV import is limited to 5,000 leads.',
                    ]);
                }
            }
        } finally {
            fclose($handle);
        }

        if ($records === []) {
            throw ValidationException::withMessages([
                'csv' => 'The CSV file does not contain any lead rows.',
            ]);
        }

        DB::transaction(function () use ($records): void {
            foreach ($records as $record) {
                ContactSubmission::create($record);
            }
        });

        $count = count($records);

        return back()->with('success', "{$count} lead".($count === 1 ? '' : 's').' imported.');
    }

    public function destroy(ContactSubmission $inquiry, TrashBin $trash): RedirectResponse
    {
        $entry = $trash->trash($inquiry, 'inquiry', $inquiry->name, $inquiry->email);

        return redirect()
            ->route('admin.inquiries.index')
            ->with('success', 'Inquiry moved to the trash.')
            ->with('undo', $entry->id);
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
            // Received between the two dates, both days included.
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->whereDate('created_at', '<=', $to))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(
                fn (Builder $inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%"),
            ));
    }
}
