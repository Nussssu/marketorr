<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceGroup;
use App\Services\PublicAsset;
use App\Services\SubServiceRelatedWork;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Services/Index', [
            'page' => Page::forSlug('services')?->toPublicArray(),
            'services' => $this->publishedServices(),
            'subservices' => ServiceGroup::catalogue(),
        ]);
    }

    /**
     * A published service page. Tabs (e.g. Branding and UI/UX) have no pages
     * of their own: their sections live on the Services page, so old links
     * land there on the matching tab.
     */
    public function show(string $slug): Response|SymfonyResponse
    {
        $category = collect(ServiceGroup::catalogue())->firstWhere('slug', $slug);

        if ($category) {
            return Inertia::location(route('services.index').'#'.$category['slug']);
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
    public function subShow(string $service, string $sub, SubServiceRelatedWork $relatedWork): Response
    {
        $category = collect(ServiceGroup::catalogue())->firstWhere('slug', $service);
        abort_if(! $category, 404);

        $item = collect($category['items'])->firstWhere('slug', $sub);
        abort_if(! $item, 404);

        $withUrl = fn (array $entry) => $entry + [
            'url' => route('services.subshow', [$category['slug'], $entry['slug']]),
        ];

        $position = collect($category['items'])->search(fn (array $entry) => $entry['slug'] === $item['slug']) + 1;

        return Inertia::render('Services/SubShow', [
            'item' => $withUrl($this->withResolvedCaseStudyImages($item)) + [
                'category' => ['slug' => $category['slug'], 'name' => $category['name']],
                'position' => $position,
                'total' => count($category['items']),
                'relatedWork' => $relatedWork->for($category, $item),
            ],
            'siblings' => collect($category['items'])
                ->reject(fn (array $entry) => $entry['slug'] === $item['slug'])
                ->map($withUrl)
                ->values(),
            'parentHref' => route('services.index').'#'.$category['slug'],
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

    /**
     * A sub-service's case-study image paths as public URLs on the configured
     * asset base, pointing at optimized copies where they exist.
     *
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function withResolvedCaseStudyImages(array $item): array
    {
        if (! isset($item['case_study']['sections'])) {
            return $item;
        }

        $item['case_study']['sections'] = collect($item['case_study']['sections'])
            ->map(function (array $section): array {
                $section['images'] = collect($section['images'] ?? [])
                    ->map(fn (array $image): array => [...$image, 'src' => PublicAsset::url($image['src'] ?? null)])
                    ->all();

                return $section;
            })
            ->all();

        return $item;
    }
}
