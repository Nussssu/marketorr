<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the marketing pages that compose several content sections.
 */
class PageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Home', [
            'featuredProjects' => Project::query()
                ->published()
                ->featured()
                ->get()
                ->map(fn (Project $project) => $project->toPublicArray())
                ->values(),
            'services' => Service::query()
                ->published()
                ->get()
                ->map(fn (Service $service) => $service->toPublicArray())
                ->values(),
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('About');
    }

    public function contact(): Response
    {
        return Inertia::render('ContactPage');
    }

    public function privacy(): Response
    {
        return Inertia::render('Privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('Terms');
    }
}
