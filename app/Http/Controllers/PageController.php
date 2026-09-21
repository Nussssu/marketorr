<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the marketing pages. Each one is a CMS page: its copy and the order
 * of its sections come from the database, while the section components that
 * draw them stay in the front end.
 */
class PageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Home', [
            'page' => Page::forSlug('home')?->toPublicArray(),
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
            'subservices' => config('subservices'),
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('About', [
            'page' => Page::forSlug('about')?->toPublicArray(),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('ContactPage', [
            'page' => Page::forSlug('contact')?->toPublicArray(),
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Privacy', [
            'page' => Page::forSlug('privacy')?->toPublicArray(),
        ]);
    }

    public function terms(): Response
    {
        return Inertia::render('Terms', [
            'page' => Page::forSlug('terms')?->toPublicArray(),
        ]);
    }

    /**
     * Any other published, non-system page, built entirely from its widget
     * stack. Registered last so it never shadows a dedicated route.
     */
    public function show(Request $request): Response
    {
        $page = Page::forSlug(trim($request->path(), '/'));

        abort_if($page === null || $page->is_system, 404);

        return Inertia::render('CmsPage', [
            'page' => $page->toPublicArray(),
        ]);
    }
}
