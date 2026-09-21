<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageSectionRequest;
use App\Http\Requests\Admin\UpdatePageSectionRequest;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PageSectionController extends Controller
{
    public function store(StorePageSectionRequest $request, Page $page): RedirectResponse
    {
        $page->sections()->create([
            ...$request->sectionAttributes(),
            'sort_order' => (int) $page->sections()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Section added.');
    }

    public function update(UpdatePageSectionRequest $request, Page $page, PageSection $section): RedirectResponse
    {
        $this->assertBelongsToPage($page, $section);

        $section->update($request->sectionAttributes());

        return back()->with('success', 'Section saved.');
    }

    public function destroy(Page $page, PageSection $section): RedirectResponse
    {
        $this->assertBelongsToPage($page, $section);

        $section->delete();

        return back()->with('success', 'Section removed.');
    }

    /**
     * Persist a drag-and-drop ordering as a single pass of `sort_order` values.
     */
    public function reorder(Request $request, Page $page): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            $page->sections()->whereKey($id)->update(['sort_order' => $position]);
        }

        return back()->with('success', 'Section order saved.');
    }

    /**
     * The section is nested under its page in the URL, so a mismatched pair
     * is a 404 rather than a silent edit of somebody else's page.
     */
    private function assertBelongsToPage(Page $page, PageSection $section): void
    {
        abort_unless($section->page_id === $page->id, 404);
    }
}
