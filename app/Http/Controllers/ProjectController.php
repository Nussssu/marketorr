<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Work/Index', [
            'projects' => Project::query()
                ->published()
                ->get()
                ->map(fn (Project $project) => $project->toPublicArray())
                ->values(),
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
