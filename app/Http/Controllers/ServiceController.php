<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Services/Index', [
            'services' => $this->publishedServices(),
        ]);
    }

    public function show(string $slug): Response
    {
        $service = Service::query()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Services/Show', [
            'service' => $service->toPublicArray(),
            'services' => $this->publishedServices(),
        ]);
    }

    /**
     * Every published service in the shape `lib/services.js` defined.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function publishedServices(): Collection
    {
        return Service::query()
            ->published()
            ->get()
            ->map(fn (Service $service) => $service->toPublicArray())
            ->values();
    }
}
