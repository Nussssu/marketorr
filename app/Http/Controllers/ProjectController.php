<?php

namespace App\Http\Controllers;

use App\Models\Project;
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
     */
    public function portfolio(string $group): Response
    {
        $summary = collect(Project::workGroupSummaries())
            ->firstWhere('slug', $group);

        abort_if($summary === null, 404);

        $projects = Project::query()
            ->published()
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
