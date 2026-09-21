<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\SectionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Pages/Index', [
            'pages' => Page::query()
                ->withCount('sections')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Page $page) => [
                    ...$this->toAdminArray($page),
                    'sections_count' => $page->sections_count,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => null,
            'statuses' => ContentStatus::values(),
        ]);
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $data = $request->pageAttributes();
        $data['meta_og_image'] = $this->storeOgImage($request->file('og_image'));
        $data['sort_order'] ??= (int) Page::query()->max('sort_order') + 1;

        $page = Page::query()->create($data);

        return redirect()
            ->route('admin.pages.builder', $page)
            ->with('success', 'Page created — add its sections below.');
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => $this->toAdminArray($page),
            'statuses' => ContentStatus::values(),
        ]);
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $data = $request->pageAttributes();

        if ($request->hasFile('og_image')) {
            $this->deleteOgImage($page->meta_og_image);
            $data['meta_og_image'] = $this->storeOgImage($request->file('og_image'));
        }

        $page->update($data);

        return redirect()
            ->route('admin.pages.index')
            ->with('success', 'Page updated.');
    }

    /**
     * The widget builder: the page's section stack plus the palette of types
     * it can add, each with the field schema its form renders from.
     */
    public function builder(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Builder', [
            'page' => $this->toAdminArray($page),
            'sections' => $page->sections()
                ->get()
                ->map(fn (PageSection $section) => [
                    'id' => $section->id,
                    'type' => $section->type->value,
                    'typeLabel' => $section->type->label(),
                    'name' => $section->name,
                    'content' => $section->content ?? [],
                    'enabled' => $section->enabled,
                    'sort_order' => $section->sort_order,
                    'fields' => $section->type->fields(),
                    'dataDriven' => $section->type->isDataDriven(),
                ]),
            'palette' => SectionType::palette(),
        ]);
    }

    /**
     * A system page backs a hand-built route, so deleting it would leave that
     * route with nothing to render.
     */
    public function destroy(Page $page): RedirectResponse
    {
        if ($page->is_system) {
            return back()->with('success', 'System pages cannot be deleted — unpublish it instead.');
        }

        $page->delete();

        return back()->with('success', 'Page deleted.');
    }

    private function storeOgImage(?UploadedFile $file): ?string
    {
        return $file?->store('pages', 'public');
    }

    private function deleteOgImage(?string $path): void
    {
        if (blank($path) || str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(Page $page): array
    {
        return [
            'id' => $page->id,
            'slug' => $page->slug,
            'title' => $page->title,
            'status' => $page->status->value,
            'is_system' => $page->is_system,
            'sort_order' => $page->sort_order,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'og_image_url' => $page->ogImageUrl(),
            'meta_robots' => $page->meta_robots,
            'canonical_url' => $page->canonical_url,
            'schema_markup' => filled($page->schema_markup)
                ? json_encode($page->schema_markup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
                : '',
            'url' => $page->is_system ? '/'.ltrim(str_replace('home', '', $page->slug), '/') : '/'.$page->slug,
        ];
    }
}
