<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceGroupRequest;
use App\Http\Requests\Admin\UpdateServiceGroupRequest;
use App\Models\ServiceGroup;
use App\Services\TrashBin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceGroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ServiceGroups/Index', [
            'groups' => ServiceGroup::query()
                ->ordered()
                ->withCount('subServices')
                ->get()
                ->map(fn (ServiceGroup $group) => $this->toAdminArray($group)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/ServiceGroups/Form', [
            'group' => null,
            'statuses' => ContentStatus::values(),
        ]);
    }

    public function store(StoreServiceGroupRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['sort_order'] = $data['sort_order'] ?? ((int) ServiceGroup::query()->max('sort_order') + 1);

        ServiceGroup::query()->create($data);
        ServiceGroup::forgetCatalogue();

        return redirect()
            ->route('admin.service-groups.index')
            ->with('success', 'Service tab created.');
    }

    public function edit(ServiceGroup $serviceGroup): Response
    {
        return Inertia::render('Admin/ServiceGroups/Form', [
            'group' => $this->toAdminArray($serviceGroup),
            'statuses' => ContentStatus::values(),
        ]);
    }

    public function update(UpdateServiceGroupRequest $request, ServiceGroup $serviceGroup): RedirectResponse
    {
        $serviceGroup->update($request->validated());
        ServiceGroup::forgetCatalogue();

        return redirect()
            ->route('admin.service-groups.index')
            ->with('success', 'Service tab updated.');
    }

    public function destroy(ServiceGroup $serviceGroup, TrashBin $trash): RedirectResponse
    {
        // Its sub-services go with it and come back with it.
        $subServices = $serviceGroup->subServices()->get();
        $subServices->each->delete();

        $entry = $trash->trash($serviceGroup, 'service_group', $serviceGroup->name, $subServices->count().' sub-service(s)', ['sub_services' => $subServices->modelKeys()]);

        return back()->with('success', 'Service tab moved to the trash.')->with('undo', $entry->id);
    }

    /**
     * Persist a drag-and-drop ordering as a single pass of `sort_order` values.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:service_groups,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            ServiceGroup::query()->whereKey($id)->update(['sort_order' => $position]);
        }

        ServiceGroup::forgetCatalogue();

        return back()->with('success', 'Order saved.');
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(ServiceGroup $group): array
    {
        return [
            'id' => $group->id,
            'slug' => $group->slug,
            'name' => $group->name,
            'tagline' => $group->tagline,
            'accent' => $group->accent,
            'status' => $group->status->value,
            'sort_order' => $group->sort_order,
            'sub_services_count' => $group->sub_services_count ?? $group->subServices()->count(),
        ];
    }
}
