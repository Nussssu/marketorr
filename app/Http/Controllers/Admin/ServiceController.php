<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Services/Index', [
            'services' => Service::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Service $service) => $this->toAdminArray($service)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Services/Form', [
            'service' => null,
            'statuses' => ContentStatus::values(),
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['sort_order'] = $data['sort_order'] ?? ((int) Service::query()->max('sort_order') + 1);

        Service::query()->create($data);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service created.');
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('Admin/Services/Form', [
            'service' => $this->toAdminArray($service),
            'statuses' => ContentStatus::values(),
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $service->update($request->validated());

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service updated.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return back()->with('success', 'Service deleted.');
    }

    /**
     * Persist a drag-and-drop ordering as a single pass of `sort_order` values.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:services,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            Service::query()->whereKey($id)->update(['sort_order' => $position]);
        }

        return back()->with('success', 'Order saved.');
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(Service $service): array
    {
        return [
            'id' => $service->id,
            'slug' => $service->slug,
            'index_label' => $service->index_label,
            'name' => $service->name,
            'short' => $service->short,
            'description' => $service->description,
            'accent' => $service->accent,
            'accent_to' => $service->accent_to,
            'capabilities' => $service->capabilities ?? [],
            'deliverables' => $service->deliverables ?? [],
            'outcomes' => $service->outcomes ?? [],
            'status' => $service->status->value,
            'sort_order' => $service->sort_order,
        ];
    }
}
