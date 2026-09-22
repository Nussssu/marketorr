<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Models\MailSetting;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\Request;
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

        // 3. User accounts activity
        if (in_array($category, ['all', 'users'])) {
            User::query()
                ->latest('updated_at')
                ->limit(20)
                ->get()
                ->each(function (User $user) use ($logs): void {
                    $logs->push([
                        'id' => 'user-'.$user->id,
                        'category' => 'users',
                        'type' => 'User Account',
                        'title' => "User profile: {$user->name}",
                        'description' => "Role: {$user->role->value} · Email: {$user->email}",
                        'actor' => $user->name,
                        'ip' => 'Internal',
                        'status' => $user->role->value,
                        'level' => 'info',
                        'timestamp' => $user->updated_at?->toIso8601String(),
                        'time_for_humans' => $user->updated_at?->diffForHumans(),
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

        // 5. System log parser (recent entries from laravel.log)
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

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $filtered,
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
}
