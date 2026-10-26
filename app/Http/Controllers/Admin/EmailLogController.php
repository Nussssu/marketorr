<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EmailLogSource;
use App\Enums\EmailLogStatus;
use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmailLogController extends Controller
{
    /**
     * The full email history, newest first, filterable by status, source
     * and a search over recipients and subjects.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(EmailLogStatus::values())],
            'source' => ['nullable', Rule::in(EmailLogSource::values())],
            'search' => ['nullable', 'string', 'max:120'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $logs = EmailLog::query()
            ->with('user:id,name')
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['source'] ?? null, fn ($query, string $source) => $query->where('source', $source))
            ->when($filters['from'] ?? null, fn ($query, string $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, string $to) => $query->whereDate('created_at', '<=', $to))
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(fn ($query) => $query
                ->where('recipients', 'like', "%{$search}%")
                ->orWhere('subject', 'like', "%{$search}%")))
            ->latest('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (EmailLog $log) => $log->toAdminArray());

        return Inertia::render('Admin/EmailLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'status' => $filters['status'] ?? '',
                'source' => $filters['source'] ?? '',
                'search' => $filters['search'] ?? '',
                'from' => $filters['from'] ?? '',
                'to' => $filters['to'] ?? '',
            ],
            'counts' => collect(EmailLogStatus::cases())
                ->mapWithKeys(fn (EmailLogStatus $status) => [$status->value => EmailLog::query()->where('status', $status)->count()]),
            'statuses' => collect(EmailLogStatus::cases())->map(fn (EmailLogStatus $status) => ['value' => $status->value, 'label' => $status->label()]),
            'sources' => collect(EmailLogSource::cases())->map(fn (EmailLogSource $source) => ['value' => $source->value, 'label' => $source->label()]),
        ]);
    }

    /**
     * One entry with the full message body, for the detail view.
     */
    public function show(EmailLog $emailLog): JsonResponse
    {
        return response()->json($emailLog->load('user:id,name')->toAdminArray(withBody: true));
    }
}
