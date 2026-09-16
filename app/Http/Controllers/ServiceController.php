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
            'subservices' => config('subservices'),
        ]);
    }

    public function show(string $slug): Response
    {
        $category = collect(config('subservices'))->firstWhere('slug', $slug);

        if ($category) {
            return Inertia::render('Services/Category', [
                'category' => $category,
            ]);
        }

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
     * Dedicated page for one catalogue sub-service,
     * e.g. /services/branding/brand-strategy.
     */
    public function subShow(string $service, string $sub): Response
    {
        $category = collect(config('subservices'))->firstWhere('slug', $service);
        abort_if(! $category, 404);

        $item = collect($category['items'])->firstWhere('slug', $sub);
        abort_if(! $item, 404);

        $withUrl = fn (array $entry) => $entry + [
            'url' => route('services.subshow', [$category['slug'], $entry['slug']]),
        ];

        $position = collect($category['items'])->search(fn (array $entry) => $entry['slug'] === $item['slug']) + 1;

        return Inertia::render('Services/SubShow', [
            'item' => $withUrl($item) + [
                'category' => ['slug' => $category['slug'], 'name' => $category['name']],
                'position' => $position,
                'total' => count($category['items']),
            ],
            'siblings' => collect($category['items'])
                ->reject(fn (array $entry) => $entry['slug'] === $item['slug'])
                ->map($withUrl)
                ->values(),
            'parentHref' => route('services.show', $category['slug']),
            'parentName' => $category['name'],
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
