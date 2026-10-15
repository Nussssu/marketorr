<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubServiceRequest;
use App\Http\Requests\Admin\UpdateSubServiceRequest;
use App\Models\ServiceGroup;
use App\Models\SubService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);
    }

    public function store(StoreSubServiceRequest $request): RedirectResponse
    {
        $data = $this->validated($request->validated());
        $data['sort_order'] = $data['sort_order']
            ?? ((int) SubService::query()->where('service_group_id', $data['service_group_id'])->max('sort_order') + 1);

        SubService::query()->create($data);
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
        ]);
    }

    public function update(UpdateSubServiceRequest $request, SubService $subService): RedirectResponse
    {
        $subService->update($this->validated($request->validated()));
        ServiceGroup::forgetCatalogue();

        return redirect()
            ->route('admin.sub-services.index')
            ->with('success', 'Sub-service updated.');
    }

    public function destroy(SubService $subService): RedirectResponse
    {
        $subService->delete();
        ServiceGroup::forgetCatalogue();

        return back()->with('success', 'Sub-service deleted.');
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

        return $data;
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
            'status' => $item->status->value,
            'sort_order' => $item->sort_order,
        ];
    }
}
