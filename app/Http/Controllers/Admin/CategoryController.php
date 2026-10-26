<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Page;
use App\Services\TrashBin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Categories are managed on the Our Work page, where the projects they
     * file live; this old address goes there.
     */
    public function index(): RedirectResponse
    {
        return redirect()->to(self::manageUrl());
    }

    /**
     * Where categories are managed: the Our Work page's builder, or the pages
     * list when that page does not exist.
     */
    public static function manageUrl(): string
    {
        $workPage = Page::query()->where('slug', 'work')->first();

        return $workPage
            ? route('admin.pages.builder', $workPage).'#categories'
            : route('admin.pages.index');
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
        if ($request->hasFile('thumbnail')) {
            $data['thumbnail_path'] = $this->storeThumbnail($request->file('thumbnail'));
        } elseif ($request->filled('thumbnail') && is_string($request->input('thumbnail'))) {
            $val = $request->input('thumbnail');
            $val = preg_replace('#^https?://[^/]+/storage/#', '', $val);
            $val = preg_replace('#^/storage/#', '', $val);
            $data['thumbnail_path'] = $val;
        }
        $data['sort_order'] ??= (int) Category::query()->max('sort_order') + 1;

        Category::query()->create($data);

        return redirect()
            ->to(self::manageUrl())
            ->with('success', 'Category created.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => $category->toAdminArray(),
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
        } elseif ($request->has('thumbnail')) {
            $val = $request->input('thumbnail');
            if (is_string($val)) {
                $val = preg_replace('#^https?://[^/]+/storage/#', '', $val);
                $val = preg_replace('#^/storage/#', '', $val);
                $data['thumbnail_path'] = $val !== '' ? $val : null;
            } elseif ($val === null) {
                $data['thumbnail_path'] = null;
            }
        }

        $category->update($data);

        return redirect()
            ->to(self::manageUrl())
            ->with('success', 'Category updated.');
    }

    /**
     * Soft-deleting a category leaves its projects orphaned rather than
     * deleted, so the editor is told how many need re-filing.
     */
    public function destroy(Category $category, TrashBin $trash): RedirectResponse
    {
        // Remembered so a restore files them back under it.
        $projects = $category->projects()->pluck('id')->all();
        $children = $category->children()->pluck('id')->all();
        $orphaned = count($projects);
        $category->children()->update(['parent_id' => null]);
        $category->projects()->update(['category_id' => null]);
        $entry = $trash->trash($category, 'category', $category->name, $orphaned.' project(s)', ['projects' => $projects, 'children' => $children]);

        return back()->with('success', $orphaned > 0
            ? "Category moved to the trash. {$orphaned} project(s) now have no category."
            : 'Category moved to the trash.')->with('undo', $entry->id);
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
}
