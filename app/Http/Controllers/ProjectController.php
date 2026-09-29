<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\UiuxShowcase;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * The All Work landing page: the two portfolios and nothing else.
     *
     * Individual projects are reached through a portfolio rather than listed
     * here, so this page stays a single, deliberate choice between the two
     * practices.
     */
    public function index(): Response
    {
        return Inertia::render('Work/Index', [
            'groups' => Project::workGroupSummaries(),
        ]);
    }

    /**
     * One portfolio: every published project filed under that practice.
     *
     * The UI/UX portfolio also carries its six showcase projects, which it
     * presents as a Flip layout morph in place of the flat listing.
     */
    public function portfolio(string $group, UiuxShowcase $showcase): Response
    {
        $summary = collect(Project::workGroupSummaries())
            ->firstWhere('slug', $group);

        abort_if($summary === null, 404);

        $projects = Project::query()
            ->published()
            ->with('category.parent')
            ->orderBy('sort_order')
            ->get()
            ->filter(fn (Project $project): bool => $project->workGroup() === $group)
            ->map(fn (Project $project): array => $project->toPublicArray())
            ->values();

        return Inertia::render('Work/Portfolio', [
            'group' => [
                'slug' => $summary['slug'],
                'heading' => $summary['name'],
                'accent' => $summary['accent'],
            ],
            'projects' => $projects,
            'showcase' => $group === 'uiux' ? $showcase->projects() : null,
        ]);
    }

    /**
     * One UI/UX project's own printer page: every exported page of that
     * project, printed one after another as the reader scrolls.
     */
    public function uiuxProject(string $project, UiuxShowcase $showcase): Response
    {
        $found = $showcase->find($project);

        abort_if($found === null, 404);

        return Inertia::render('Work/UiuxProject', [
            'project' => $found,
        ]);
    }

    public function show(string $slug): Response
    {
        $project = Project::query()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Work/Show', [
            'project' => $project->toPublicArray(),
        ]);
    }
}
