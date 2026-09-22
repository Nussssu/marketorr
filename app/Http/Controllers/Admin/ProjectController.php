<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Requests\Admin\UpdateProjectRequest;
use App\Models\Category;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Projects/Index', [
            'projects' => Project::query()
                ->with('category')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Project $project) => $this->toAdminArray($project)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Projects/Form', [
            'project' => null,
            'statuses' => ContentStatus::values(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('image');
        $data['image_path'] = $this->storeImage($request->file('image'));
        $data['sort_order'] = $data['sort_order'] ?? ((int) Project::query()->max('sort_order') + 1);

        Project::query()->create($data);

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'Project created.');
    }

    public function edit(Project $project): Response
    {
        return Inertia::render('Admin/Projects/Form', [
            'project' => $this->toAdminArray($project),
            'statuses' => ContentStatus::values(),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $this->deleteImage($project->image_path);
            $data['image_path'] = $this->storeImage($request->file('image'));
        }

        $project->update($data);

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'Project updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();

        return back()->with('success', 'Project deleted.');
    }

    /**
     * Persist a drag-and-drop ordering as a single pass of `sort_order` values.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:projects,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            Project::query()->whereKey($id)->update(['sort_order' => $position]);
        }

        return back()->with('success', 'Order saved.');
    }

    /**
     * Flip the home page feature flag without opening the full form.
     */
    public function toggleFeatured(Project $project): RedirectResponse
    {
        $project->update(['featured' => ! $project->featured]);

        return back()->with('success', $project->featured ? 'Project featured.' : 'Project unfeatured.');
    }

    /**
     * Store an uploaded cover on the public disk.
     */
    private function storeImage(UploadedFile $image): string
    {
        return $image->store('projects', 'public');
    }

    /**
     * Remove a replaced cover, leaving legacy `public/` paths alone.
     */
    private function deleteImage(?string $path): void
    {
        if (blank($path) || str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    /**
     * Published categories as a flat, indented select list — parents first,
     * each followed by its children.
     *
     * @return array<int, array{id: int, label: string}>
     */
    private function categoryOptions(): array
    {
        $categories = Category::query()->published()->get();

        return $categories
            ->whereNull('parent_id')
            ->flatMap(fn (Category $parent) => [
                ['id' => $parent->id, 'label' => $parent->name],
                ...$categories
                    ->where('parent_id', $parent->id)
                    ->map(fn (Category $child) => ['id' => $child->id, 'label' => '— '.$child->name])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(Project $project): array
    {
        return [
            'id' => $project->id,
            'slug' => $project->slug,
            'title' => $project->title,
            'client' => $project->client,
            'category_id' => $project->category_id,
            'category' => $project->category?->name,
            'year' => $project->year,
            'description' => $project->description,
            'metric' => $project->metric,
            'metric_label' => $project->metric_label,
            'accent' => $project->accent,
            'image_url' => $project->imageUrl(),
            'image_alt' => $project->image_alt,
            'external_url' => $project->external_url,
            'tags' => $project->tags ?? [],
            'featured' => $project->featured,
            'status' => $project->status->value,
            'sort_order' => $project->sort_order,
        ];
    }
}
