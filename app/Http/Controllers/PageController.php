<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\ServiceGroup;
use App\Services\UiuxShowcase;
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
    public function home(UiuxShowcase $showcase): Response
    {
        return Inertia::render('Home', [
            'page' => Page::forSlug('home')?->toPublicArray(),
            'featuredProjects' => Project::query()
                ->published()
                ->featured()
                ->with('category.parent')
                ->orderBy('sort_order')
                ->get()
                ->filter(fn (Project $project): bool => $project->workGroup() === 'branding')
                ->map(fn (Project $project) => $project->toPublicArray())
                ->values(),
            'uiuxShowcase' => $this->uiuxShowcaseCovers($showcase),
            'services' => Service::query()
                ->published()
                ->get()
                ->map(fn (Service $service) => $service->toPublicArray())
                ->values(),
            'subservices' => ServiceGroup::catalogue(),
        ]);
    }

    /**
     * The UI/UX section's printed sheets: one per showcase project, showing the
     * first page its own page prints (falling back to the cover when it has no
     * pages yet), so the sheet matches what opens on the project's page.
     *
     * @return array<int, array{slug: string, name: string, discipline: string, href: string, cover: array<string, mixed>}>
     */
    private function uiuxShowcaseCovers(UiuxShowcase $showcase): array
    {
        return collect($showcase->projects())
            ->filter(fn (array $project): bool => $project['cover'] !== null)
            ->map(fn (array $project): array => [
                'slug' => $project['slug'],
                'name' => $project['name'],
                'discipline' => $project['discipline'],
                'href' => route('work.uiux-project', $project['slug'], false),
                'cover' => $project['screens'][0] ?? $project['cover'],
            ])
            ->values()
            ->all();
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
