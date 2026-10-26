<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubServiceRequest;
use App\Http\Requests\Admin\UpdateSubServiceRequest;
use App\Models\Menu;
use App\Models\ServiceGroup;
use App\Models\SubService;
use App\Services\SubServiceRelatedWork;
use App\Services\TrashBin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/SubServices/Index', [
            'groups' => ServiceGroup::query()
                ->ordered()
                ->get(['id', 'slug', 'name'])
                ->map(fn (ServiceGroup $group) => [
                    'id' => $group->id,
                    'slug' => $group->slug,
                    'name' => $group->name,
                ]),
            'items' => SubService::query()
                ->with('group:id,slug,name')
                ->ordered()
                ->get()
                ->map(fn (SubService $item) => $this->toAdminArray($item)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/SubServices/Form', [
            'item' => null,
            'groups' => $this->groupOptions(),
            'statuses' => ContentStatus::values(),
            'relatedOptions' => $this->relatedOptions(),
            'pageDefaults' => SubService::DEFAULT_PAGE_CONTENT,
        ]);
    }

    public function store(StoreSubServiceRequest $request): RedirectResponse
    {
        $data = $this->validated($request->validated());
        $data['sort_order'] = $data['sort_order']
            ?? ((int) SubService::query()->where('service_group_id', $data['service_group_id'])->max('sort_order') + 1);

        $subService = SubService::query()->create($data);
        Menu::linkSubService($subService);
        ServiceGroup::forgetCatalogue();

        return redirect()
            ->route('admin.sub-services.index')
            ->with('success', 'Sub-service created.');
    }

    public function edit(SubService $subService): Response
    {
        return Inertia::render('Admin/SubServices/Form', [
            'item' => $this->toAdminArray($subService),
            'groups' => $this->groupOptions(),
            'statuses' => ContentStatus::values(),
            'relatedOptions' => $this->relatedOptions(),
            'pageDefaults' => SubService::DEFAULT_PAGE_CONTENT,
        ]);
    }

    public function update(UpdateSubServiceRequest $request, SubService $subService): RedirectResponse
    {
        $subService->update($this->validated($request->validated()));
        // Only moves an existing link: one taken out in the Menus editor stays out.
        Menu::linkSubService($subService->refresh(), addIfMissing: false);
        ServiceGroup::forgetCatalogue();

        return redirect()
            ->route('admin.sub-services.index')
            ->with('success', 'Sub-service updated.');
    }

    public function destroy(SubService $subService, TrashBin $trash): RedirectResponse
    {
        $entry = $trash->trash($subService, 'sub_service', $subService->name, ($subService->group?->name ?? 'Service').' tab');

        return back()->with('success', 'Sub-service moved to the trash.')->with('undo', $entry->id);
    }

    /**
     * Publish or unpublish a sub-service straight from the list.
     */
    public function updateStatus(Request $request, SubService $subService): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(ContentStatus::class)],
        ]);

        $subService->update(['status' => $validated['status']]);
        ServiceGroup::forgetCatalogue();

        return back()->with('success', 'Sub-service status updated.');
    }

    public function duplicate(SubService $subService): RedirectResponse
    {
        $copy = $subService->replicate();
        $copy->slug = $this->uniqueSlug($subService->slug.'-copy');
        $copy->name = $subService->name.' (Copy)';
        $copy->status = ContentStatus::Draft;
        $copy->sort_order = (int) SubService::query()
            ->where('service_group_id', $subService->service_group_id)
            ->max('sort_order') + 1;
        $copy->save();

        ServiceGroup::forgetCatalogue();

        return redirect()
            ->route('admin.sub-services.edit', $copy)
            ->with('success', 'Sub-service copied.');
    }

    /**
     * Persist a drag-and-drop ordering as a single pass of `sort_order` values.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:sub_services,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            SubService::query()->whereKey($id)->update(['sort_order' => $position]);
        }

        ServiceGroup::forgetCatalogue();

        return back()->with('success', 'Order saved.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function groupOptions(): array
    {
        return ServiceGroup::query()
            ->ordered()
            ->get(['id', 'slug', 'name'])
            ->map(fn (ServiceGroup $group) => [
                'id' => $group->id,
                'slug' => $group->slug,
                'name' => $group->name,
            ])
            ->all();
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $suffix = 2;

        while (SubService::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    /**
     * Decode the case-study JSON textarea into the array the model casts.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function validated(array $data): array
    {
        $data['case_study'] = blank($data['case_study'] ?? null)
            ? null
            : json_decode($data['case_study'], true);

        // Only copy that differs from the page's default is stored, so an
        // untouched field keeps following the default.
        if (array_key_exists('page_content', $data)) {
            $custom = collect($data['page_content'] ?? [])
                ->only(array_keys(SubService::DEFAULT_PAGE_CONTENT))
                ->filter(fn ($value, string $key): bool => filled($value) && trim($value) !== SubService::DEFAULT_PAGE_CONTENT[$key])
                ->map(fn (string $value): string => trim($value));

            $data['page_content'] = $custom->isEmpty() ? null : $custom->all();
        }

        return $data;
    }

    /**
     * The projects each tab's related-work picker can choose from, keyed by
     * tab slug: Branding projects for Branding, the UI/UX showcase for UI/UX.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function relatedOptions(): array
    {
        $relatedWork = app(SubServiceRelatedWork::class);

        return collect($this->groupOptions())
            ->mapWithKeys(fn (array $group): array => [$group['slug'] => $relatedWork->options($group['slug'])])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(SubService $item): array
    {
        return [
            'id' => $item->id,
            'service_group_id' => $item->service_group_id,
            'group_name' => $item->group?->name,
            'group_slug' => $item->group?->slug,
            'slug' => $item->slug,
            'name' => $item->name,
            'short' => $item->short,
            'description' => $item->description,
            'deliverables' => $item->deliverables ?? [],
            'image' => $item->image,
            'image_alt' => $item->image_alt,
            'accent' => $item->accent,
            'related_match' => $item->related_match ?? [],
            'related_pin' => $item->related_pin ?? [],
            'case_study' => $item->case_study,
            'page_content' => $item->pageContent(),
            'meta_title' => $item->meta_title,
            'meta_description' => $item->meta_description,
            'meta_og_image' => $item->meta_og_image,
            'meta_robots' => $item->meta_robots,
            'canonical_url' => $item->canonical_url,
            'status' => $item->status->value,
            'sort_order' => $item->sort_order,
        ];
    }
}
