<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount('projects')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            // Nested one level: the tree the site exposes is parent → child.
            'categories' => $categories
                ->whereNull('parent_id')
                ->map(fn (Category $parent) => [
                    ...$this->toAdminArray($parent),
                    'children' => $categories
                        ->where('parent_id', $parent->id)
                        ->map(fn (Category $child) => $this->toAdminArray($child))
                        ->values(),
                ])
                ->values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => null,
            'statuses' => ContentStatus::values(),
            'parents' => $this->parentOptions(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('thumbnail');
        $data['thumbnail_path'] = $this->storeThumbnail($request->file('thumbnail'));
        $data['sort_order'] ??= (int) Category::query()->max('sort_order') + 1;

        Category::query()->create($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category created.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => $this->toAdminArray($category),
            'statuses' => ContentStatus::values(),
            'parents' => $this->parentOptions($category),
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->safe()->except('thumbnail');

        if ($request->hasFile('thumbnail')) {
            $this->deleteThumbnail($category->thumbnail_path);
            $data['thumbnail_path'] = $this->storeThumbnail($request->file('thumbnail'));
        }

        $category->update($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category updated.');
    }

    /**
     * Soft-deleting a category leaves its projects orphaned rather than
     * deleted, so the editor is told how many need re-filing.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $orphaned = $category->projects()->count();
        $category->children()->update(['parent_id' => null]);
        $category->projects()->update(['category_id' => null]);
        $category->delete();

        return back()->with('success', $orphaned > 0
            ? "Category deleted. {$orphaned} project(s) now have no category."
            : 'Category deleted.');
    }

    /**
     * Persist a drag-and-drop ordering as a single pass of `sort_order` values.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:categories,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            Category::query()->whereKey($id)->update(['sort_order' => $position]);
        }

        return back()->with('success', 'Order saved.');
    }

    /**
     * Candidate parents: top-level categories, minus the one being edited.
     *
     * @return array<int, array{id: int, label: string}>
     */
    private function parentOptions(?Category $exclude = null): array
    {
        return Category::query()
            ->roots()
            ->when($exclude, fn ($query) => $query->whereKeyNot($exclude->id))
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Category $category) => ['id' => $category->id, 'label' => $category->name])
            ->values()
            ->all();
    }

    private function storeThumbnail(?UploadedFile $file): ?string
    {
        return $file?->store('categories', 'public');
    }

    private function deleteThumbnail(?string $path): void
    {
        if (blank($path) || str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(Category $category): array
    {
        return [
            'id' => $category->id,
            'parent_id' => $category->parent_id,
            'slug' => $category->slug,
            'name' => $category->name,
            'description' => $category->description,
            'thumbnail_url' => $category->thumbnailUrl(),
            'accent' => $category->accent,
            'status' => $category->status->value,
            'sort_order' => $category->sort_order,
            'projects_count' => $category->projects_count ?? 0,
        ];
    }
}
