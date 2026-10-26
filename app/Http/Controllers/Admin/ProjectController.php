<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Requests\Admin\UpdateProjectRequest;
use App\Models\Category;
use App\Models\Project;
use App\Services\TrashBin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Projects/Index', [
            'projects' => Project::query()
                ->with('category.parent')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Project $project) => $this->toAdminArray($project)),
        ]);
    }

    public function create(Request $request): Response
    {
        $portfolio = $request->string('portfolio')->toString();

        return Inertia::render('Admin/Projects/Form', [
            'project' => null,
            // The portfolio tab "New project" was clicked on, chosen up front.
            'portfolio' => in_array($portfolio, ['branding', 'uiux'], true) ? $portfolio : 'branding',
            'statuses' => ContentStatus::values(),
            'categories' => $this->categoryOptions(),
            'categoriesHref' => CategoryController::manageUrl(),
        ]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('image', 'gallery_images');
        if ($request->hasFile('image')) {
            $data['image_path'] = $this->storeImage($request->file('image'));
        } elseif ($request->filled('image')) {
            $val = $request->input('image');
            $val = preg_replace('#^https?://[^/]+/storage/#', '', $val);
            $val = preg_replace('#^/storage/#', '', $val);
            $data['image_path'] = $val;
        }
        $data['sort_order'] = $data['sort_order'] ?? ((int) Project::query()->max('sort_order') + 1);
        $data['image_path'] ??= '';
        $data = $this->withoutNullText([...['client' => null, 'year' => null], ...$data]);
        if (array_key_exists('meta_og_image', $data)) {
            $data['meta_og_image'] = filled($data['meta_og_image'])
                ? preg_replace('#^(https?://[^/]+)?/storage/#', '', $data['meta_og_image'])
                : null;
        }
        $data['brief'] = $this->normaliseBrief($data['brief'] ?? null);
        $data['case_study'] = $this->buildCaseStudy(null, $request->input('gallery_images'));

        $project = Project::query()->create($data);

        return redirect()
            ->route('admin.projects.edit', $project)
            ->with('success', 'Project created.');
    }

    public function edit(Project $project): Response
    {
        return Inertia::render('Admin/Projects/Form', [
            'project' => $this->toAdminArray($project),
            'statuses' => ContentStatus::values(),
            'categories' => $this->categoryOptions(),
            'categoriesHref' => CategoryController::manageUrl(),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $data = $request->safe()->except('image', 'gallery_images');

        // An emptied sort order appends to the end, as on create, rather than
        // storing null, which would sort the project first everywhere.
        if (array_key_exists('sort_order', $data) && $data['sort_order'] === null) {
            $data['sort_order'] = (int) Project::query()->whereKeyNot($project->id)->max('sort_order') + 1;
        }

        if ($request->hasFile('image')) {
            $this->deleteImage($project->image_path);
            $data['image_path'] = $this->storeImage($request->file('image'));
        } elseif ($request->filled('image') && is_string($request->input('image'))) {
            $val = $request->input('image');
            $val = preg_replace('#^https?://[^/]+/storage/#', '', $val);
            $val = preg_replace('#^/storage/#', '', $val);
            $data['image_path'] = $val;
        }

        if (array_key_exists('meta_og_image', $data)) {
            $data['meta_og_image'] = filled($data['meta_og_image'])
                ? preg_replace('#^(https?://[^/]+)?/storage/#', '', $data['meta_og_image'])
                : null;
        }
        if (array_key_exists('brief', $data)) {
            $data['brief'] = $this->normaliseBrief($data['brief']);
        }
        $data = $this->withoutNullText($data);

        // Only touch the visual story when the gallery field was submitted,
        // so older forms and API clients never wipe it by omission.
        if ($request->exists('gallery_images')) {
            $data['case_study'] = $this->buildCaseStudy($project->case_study, $request->input('gallery_images'));
        }

        $project->update($data);

        return redirect()
            ->route('admin.projects.edit', $project)
            ->with('success', 'Project saved.');
    }

    public function destroy(Project $project, TrashBin $trash): RedirectResponse
    {
        $entry = $trash->trash($project, 'project', $project->title, $project->workGroupName().' portfolio');

        return back()->with('success', 'Project moved to the trash.')->with('undo', $entry->id);
    }

    public function duplicate(Project $project): RedirectResponse
    {
        $copy = $project->replicate();
        $copy->slug = $this->uniqueSlug($project->slug.'-copy');
        $copy->title = $project->title.' (Copy)';
        $copy->status = ContentStatus::Draft;
        $copy->featured = false;
        $copy->sort_order = (int) Project::query()->max('sort_order') + 1;
        $copy->save();

        return redirect()
            ->route('admin.projects.edit', $copy)
            ->with('success', 'Project copied.');
    }

    /**
     * Persist a drag-and-drop ordering as a single pass of `sort_order` values.
     *
     * The full list is numbered from 0. A partial list (one portfolio tab) is
     * reordered within the positions its projects already hold, so the other
     * tab's projects keep their place everywhere they are listed together.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:projects,id'],
        ]);

        $ids = array_values(array_unique($validated['ids']));
        $positions = count($ids) === Project::query()->count()
            ? array_keys($ids)
            : Project::query()->whereKey($ids)->orderBy('sort_order')->orderBy('id')->pluck('sort_order')->all();

        if (count(array_unique($positions)) !== count($positions)) {
            $positions = range((int) min($positions), (int) min($positions) + count($ids) - 1);
        }

        foreach ($ids as $index => $id) {
            Project::query()->whereKey($id)->update(['sort_order' => $positions[$index]]);
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

    public function updateStatus(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(ContentStatus::class)],
        ]);

        $project->update(['status' => $validated['status']]);

        return back()->with('success', 'Project status updated.');
    }

    /**
     * The project brief as submitted, trimmed, with empty list rows and empty
     * highlight rows dropped. A brief with nothing left in it is stored as
     * null, so the project page shows no brief rather than an empty one.
     *
     * @param  array<string, mixed>|null  $brief
     * @return array<string, mixed>|null
     */
    private function normaliseBrief(?array $brief): ?array
    {
        if ($brief === null) {
            return null;
        }

        $text = fn (string $key): string => trim((string) ($brief[$key] ?? ''));
        $list = fn (string $key): array => collect($brief[$key] ?? [])
            ->map(fn ($value): string => trim((string) $value))
            ->filter()
            ->values()
            ->all();

        $clean = [
            'overview' => $text('overview'),
            'worked_on' => $list('worked_on'),
            'services' => $list('services'),
            'highlights' => collect($brief['highlights'] ?? [])
                ->map(fn ($row): array => [
                    'label' => trim((string) ($row['label'] ?? '')),
                    'value' => trim((string) ($row['value'] ?? '')),
                ])
                ->filter(fn (array $row): bool => $row['label'] !== '' && $row['value'] !== '')
                ->values()
                ->all(),
            'client' => $text('client'),
            'website' => $text('website'),
            'behance_url' => $text('behance_url'),
            'source_url' => $text('source_url'),
        ];

        return collect($clean)->filter(fn ($value): bool => filled($value))->isEmpty() ? null : $clean;
    }

    /**
     * Client and year are optional on a UI/UX showcase project, but their
     * columns are not nullable, so an empty one is stored as "".
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function withoutNullText(array $data): array
    {
        foreach (['client', 'year'] as $field) {
            if (array_key_exists($field, $data) && $data[$field] === null) {
                $data[$field] = '';
            }
        }

        return $data;
    }

    /**
     * Store an uploaded cover on the public disk.
     */
    private function storeImage(UploadedFile $image): string
    {
        return $image->store('projects', 'public');
    }

    /**
     * Rebuild the ordered visual story from the admin's sequential gallery.
     *
     * Only the still-image section is rewritten, in the exact submitted order;
     * embedded-film sections (Vimeo) are carried over untouched so reordering
     * stills can never drop a film. A null gallery means "leave it alone" at
     * the call site — an empty array clears the stills but keeps any films.
     *
     * @param  array<int, array<string, mixed>>|null  $existing
     * @param  array<int, array{src?: string, alt?: string|null}>|null  $gallery
     * @return array<int, array<string, mixed>>|null
     */
    private function buildCaseStudy(?array $existing, ?array $gallery): ?array
    {
        $films = collect($existing ?? [])
            ->filter(fn ($section): bool => collect($section['images'] ?? [])
                ->contains(fn ($image): bool => filled($image['vimeo'] ?? null)))
            ->values()
            ->all();

        $stills = collect($gallery ?? [])
            ->filter(fn ($image): bool => filled($image['src'] ?? null))
            ->map(fn (array $image): array => [
                'src' => trim((string) $image['src']),
                'alt' => trim((string) ($image['alt'] ?? '')),
                'hidden' => filter_var($image['hidden'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'wide' => false,
                'video' => str_ends_with(strtolower(parse_url(trim((string) $image['src']), PHP_URL_PATH) ?? ''), '.mp4'),
            ])
            ->values()
            ->all();

        $sections = [];

        if ($stills !== []) {
            $sections[] = ['label' => 'Project gallery', 'note' => null, 'images' => $stills];
        }

        foreach ($films as $section) {
            $sections[] = $section;
        }

        return $sections === [] ? null : $sections;
    }

    /**
     * The still images in display order, as the dedicated page renders them.
     *
     * @param  array<int, array<string, mixed>>|null  $caseStudy
     * @return array<int, array{src: string, alt: string}>
     */
    private function galleryImages(?array $caseStudy): array
    {
        return collect($caseStudy ?? [])
            ->flatMap(fn ($section) => $section['images'] ?? [])
            ->filter(fn ($image): bool => filled($image['src'] ?? null) && blank($image['vimeo'] ?? null))
            ->map(fn (array $image): array => [
                'src' => (string) $image['src'],
                'alt' => (string) ($image['alt'] ?? ''),
                'hidden' => (bool) ($image['hidden'] ?? false),
            ])
            ->values()
            ->all();
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

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $suffix = 2;

        while (Project::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
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
                    ->map(fn (Category $child) => ['id' => $child->id, 'label' => '- '.$child->name])
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
            'heading_scale' => $project->heading_scale,
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
            'gallery_images' => $this->galleryImages($project->case_study),
            'work_group' => $project->work_group,
            'portfolio' => $project->workGroup(),
            'layout' => $project->layout ?? '',
            'discipline' => $project->discipline ?? '',
            'public_url' => $project->publicPath(),
            'meta_title' => $project->meta_title ?? '',
            'meta_description' => $project->meta_description ?? '',
            'meta_og_image' => $project->meta_og_image ?? '',
            'meta_robots' => $project->meta_robots ?: 'index,follow',
            'canonical_url' => $project->canonical_url ?? '',
            'brief' => [
                'overview' => $project->brief['overview'] ?? '',
                'worked_on' => $project->brief['worked_on'] ?? [],
                'services' => $project->brief['services'] ?? [],
                'highlights' => $project->brief['highlights'] ?? [],
                'client' => $project->brief['client'] ?? '',
                'website' => $project->brief['website'] ?? '',
                'behance_url' => $project->brief['behance_url'] ?? '',
                'source_url' => $project->brief['source_url'] ?? '',
            ],
        ];
    }
}
