<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CodeSnippetAuditLog;
use App\Models\ContactSubmission;
use App\Models\MailSetting;
use App\Models\Media;
use App\Models\Setting;
use App\Models\UserActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->query('category', 'all');
        $search = trim((string) $request->query('search', ''));

        $logs = collect();

        // 1. Inquiries / Leads activity
        if (in_array($category, ['all', 'leads'])) {
            ContactSubmission::query()
                ->latest('updated_at')
                ->limit(40)
                ->get()
                ->each(function (ContactSubmission $inquiry) use ($logs): void {
                    $typeLabel = $inquiry->type instanceof \BackedEnum ? $inquiry->type->value : (string) $inquiry->type;
                    $logs->push([
                        'id' => 'lead-'.$inquiry->id,
                        'category' => 'leads',
                        'type' => 'Lead Inquiry',
                        'title' => "Inquiry received: {$inquiry->name}",
                        'description' => 'Company: '.($inquiry->company ?: 'N/A')." · Type: {$typeLabel} · Budget: ".($inquiry->budget ?: 'N/A'),
                        'actor' => $inquiry->email,
                        'ip' => $inquiry->ip_address ?? 'N/A',
                        'status' => $inquiry->status instanceof \BackedEnum ? $inquiry->status->value : (string) $inquiry->status,
                        'level' => 'info',
                        'timestamp' => $inquiry->created_at?->toIso8601String(),
                        'time_for_humans' => $inquiry->created_at?->diffForHumans(),
                    ]);
                });
        }

        // 2. Mail & SMTP activity
        if (in_array($category, ['all', 'system', 'mail'])) {
            $mailSetting = MailSetting::loadFromDatabase();
            if ($mailSetting->last_tested_at) {
                $isOk = str_contains(strtolower($mailSetting->last_test_result ?? ''), 'sent');
                $logs->push([
                    'id' => 'mail-test-1',
                    'category' => 'mail',
                    'type' => 'SMTP Probe',
                    'title' => 'SMTP Connection Test',
                    'description' => $mailSetting->last_test_result ?: 'Test execution executed.',
                    'actor' => $mailSetting->from_address ?: 'System',
                    'ip' => 'Server',
                    'status' => $isOk ? 'Success' : 'Warning',
                    'level' => $isOk ? 'success' : 'warning',
                    'timestamp' => $mailSetting->last_tested_at->toIso8601String(),
                    'time_for_humans' => $mailSetting->last_tested_at->diffForHumans(),
                ]);
            }
        }

        // 3. User accounts activity: sign-ins, invitations, roles, status,
        // passwords, two-factor and sessions (see UserActivityLog).
        if (in_array($category, ['all', 'users'])) {
            UserActivityLog::query()
                ->with('actor:id,name')
                ->latest('id')
                ->limit(60)
                ->get()
                ->each(function (UserActivityLog $entry) use ($logs): void {
                    $details = $entry->detailsLine();
                    $logs->push([
                        'id' => 'user-activity-'.$entry->id,
                        'category' => 'users',
                        'type' => str_starts_with($entry->action, 'role_') && $entry->action !== 'role_changed' ? 'Admin Role' : 'User Account',
                        'title' => $entry->actionLabel().($entry->subject_name ? ": {$entry->subject_name}" : ''),
                        'description' => $details !== '' ? $details : 'No further details recorded.',
                        'actor' => $entry->actor?->name ?? ($entry->action === 'login_failed' ? 'Unknown visitor' : 'System'),
                        'ip' => $entry->ip_address ?? 'N/A',
                        'status' => $entry->actionLabel(),
                        'level' => in_array($entry->action, UserActivityLog::WARNING_ACTIONS, true) ? 'warning' : 'info',
                        'timestamp' => $entry->created_at?->toIso8601String(),
                        'time_for_humans' => $entry->created_at?->diffForHumans(),
                    ]);
                });
        }

        // 4. Media Library uploads
        if (in_array($category, ['all', 'content'])) {
            if (class_exists(Media::class)) {
                Media::query()
                    ->latest('created_at')
                    ->limit(20)
                    ->get()
                    ->each(function (Media $media) use ($logs): void {
                        $logs->push([
                            'id' => 'media-'.$media->id,
                            'category' => 'content',
                            'type' => 'Media Upload',
                            'title' => "File uploaded: {$media->name}",
                            'description' => "Disk path: {$media->path} · Size: ".round(($media->size_bytes ?? 0) / 1024).' KB',
                            'actor' => 'Admin',
                            'ip' => 'Internal',
                            'status' => 'Stored',
                            'level' => 'info',
                            'timestamp' => $media->created_at?->toIso8601String(),
                            'time_for_humans' => $media->created_at?->diffForHumans(),
                        ]);
                    });
            }
        }

        // 5. Custom code injection activity
        if (in_array($category, ['all', 'system'])) {
            CodeSnippetAuditLog::query()
                ->with('user:id,name')
                ->latest('id')
                ->limit(40)
                ->get()
                ->each(function (CodeSnippetAuditLog $entry) use ($logs): void {
                    $changes = $entry->changesLine();
                    $logs->push([
                        'id' => 'custom-code-'.$entry->id,
                        'category' => 'system',
                        'type' => 'Custom Code',
                        'title' => "{$entry->actionLabel()}: ".($entry->snippet_name ?: 'Snippet'),
                        'description' => $changes !== '' ? $changes : 'No field changes recorded.',
                        'actor' => $entry->user?->name ?? 'Unknown admin',
                        'ip' => $entry->ip_address ?? 'N/A',
                        'status' => $entry->actionLabel(),
                        'level' => in_array($entry->action, ['deleted', 'disabled', 'unpublished', 'master_disabled'], true) ? 'warning' : 'info',
                        'timestamp' => $entry->created_at?->toIso8601String(),
                        'time_for_humans' => $entry->created_at?->diffForHumans(),
                    ]);
                });
        }

        // 6. System log parser (recent entries from laravel.log)
        if (in_array($category, ['all', 'system'])) {
            $logFile = storage_path('logs/laravel.log');
            if (File::exists($logFile)) {
                $lines = array_reverse(array_slice(file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), -80));
                $parsed = 0;
                foreach ($lines as $line) {
                    if ($parsed >= 25) {
                        break;
                    }

                    if (preg_match('/^\[(?<date>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (?<env>\w+)\.(?<level>[A-Z]+): (?<message>.*?)(?: \{.*)?$/', $line, $matches)) {
                        $levelLower = strtolower($matches['level']);
                        $lvl = match ($levelLower) {
                            'error', 'critical', 'alert', 'emergency' => 'error',
                            'warning' => 'warning',
                            'notice', 'info' => 'info',
                            default => 'info',
                        };

                        $logs->push([
                            'id' => 'sys-log-'.$parsed,
                            'category' => 'system',
                            'type' => 'System Log',
                            'title' => $matches['message'],
                            'description' => "Environment: {$matches['env']} · Level: {$matches['level']}",
                            'actor' => 'Laravel Engine',
                            'ip' => '127.0.0.1',
                            'status' => strtoupper($matches['level']),
                            'level' => $lvl,
                            'timestamp' => $matches['date'],
                            'time_for_humans' => $matches['date'],
                        ]);
                        $parsed++;
                    }
                }
            }
        }

        // Entries from before a module was last cleared stay out of the log.
        $clearedAt = Setting::current()->audit_cleared_at ?? [];
        $logs = $logs
            ->reject(fn (array $item): bool => isset($clearedAt[$item['category']], $item['timestamp'])
                && Carbon::parse($item['timestamp'])->lessThanOrEqualTo(Carbon::parse($clearedAt[$item['category']])))
            ->values();

        // Filter and sort
        $filtered = $logs
            ->filter(function (array $item) use ($search): bool {
                if ($search === '') {
                    return true;
                }

                $blob = strtolower($item['title'].' '.$item['description'].' '.$item['actor'].' '.$item['type']);

                return str_contains($blob, strtolower($search));
            })
            ->sortByDesc('timestamp')
            ->values();

        $perPage = 25;
        $currentPage = Paginator::resolveCurrentPage();
        $paginatedLogs = new LengthAwarePaginator(
            $filtered->forPage($currentPage, $perPage)->values(),
            $filtered->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()],
        );

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $paginatedLogs,
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
            'stats' => [
                'total' => $logs->count(),
                'leads' => $logs->where('category', 'leads')->count(),
                'system' => $logs->where('category', 'system')->count(),
                'users' => $logs->where('category', 'users')->count(),
            ],
        ]);
    }

    /**
     * Clear one tab of the log, or all of it. The log-only records (user
     * account and custom code activity) are deleted; entries built from real
     * data (inquiries, media uploads, mail tests, the server log) are hidden
     * up to now, so the inquiries and files themselves are never touched.
     */
    public function clear(Request $request): RedirectResponse
    {
        $category = $request->string('category')->toString();
        $category = in_array($category, ['leads', 'system', 'users', 'content'], true) ? $category : 'all';

        $modules = match ($category) {
            'system' => ['system', 'mail'],
            'all' => ['leads', 'system', 'mail', 'users', 'content'],
            default => [$category],
        };

        if (in_array('users', $modules, true)) {
            UserActivityLog::query()->delete();
        }

        if (in_array('system', $modules, true)) {
            CodeSnippetAuditLog::query()->delete();
        }

        $settings = Setting::current();
        $now = now()->toIso8601String();
        $settings->update([
            'audit_cleared_at' => [
                ...($settings->audit_cleared_at ?? []),
                ...array_fill_keys($modules, $now),
            ],
        ]);
        Setting::forgetCurrent();

        return back()->with('success', $category === 'all' ? 'Audit log cleared.' : 'This part of the audit log was cleared.');
    }
}
