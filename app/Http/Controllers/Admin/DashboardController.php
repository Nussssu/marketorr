<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\InquiryStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ContactSubmission;
use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'publishedProjects' => Project::query()->where('status', ContentStatus::Published)->count(),
                'draftProjects' => Project::query()->where('status', ContentStatus::Draft)->count(),
                'services' => Service::query()->count(),
                'pages' => Page::query()->count(),
                'categories' => Category::query()->count(),
                'newInquiries' => ContactSubmission::query()->where('status', InquiryStatus::New)->count(),
            ],
            'recentInquiries' => ContactSubmission::query()
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (ContactSubmission $inquiry) => [
                    'id' => $inquiry->id,
                    'name' => $inquiry->name,
                    'email' => $inquiry->email,
                    'type' => $inquiry->type->value,
                    'status' => $inquiry->status->value,
                    'createdAt' => $inquiry->created_at?->diffForHumans(),
                ]),
        ]);
    }
}
