<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Response;

/**
 * Serves the machine-readable side of the site — both generated from live
 * content, so a new page appears without a deploy.
 */
class SeoController extends Controller
{
    public function robots(): Response
    {
        $settings = Setting::current();

        $body = filled($settings->robots_txt)
            ? $settings->robots_txt
            : implode("\n", [
                'User-agent: *',
                'Disallow: /admin',
                '',
                'Sitemap: '.route('sitemap'),
            ]);

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function sitemap(): Response
    {
        $settings = Setting::current();

        abort_unless($settings->sitemap_enabled, 404);

        $urls = [
            ...$this->pageUrls(),
            ...$this->projectUrls(),
            ...$this->serviceUrls(),
        ];

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    /**
     * Every published page, indexable ones only — a page marked `noindex`
     * does not belong in the sitemap either.
     *
     * @return array<int, array{loc: string, lastmod: string|null}>
     */
    private function pageUrls(): array
    {
        return Page::query()
            ->published()
            ->get()
            ->reject(fn (Page $page) => str_starts_with($page->meta_robots, 'noindex'))
            ->map(fn (Page $page) => [
                'loc' => url($page->slug === 'home' ? '/' : '/'.$page->slug),
                'lastmod' => $page->updated_at?->toAtomString(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{loc: string, lastmod: string|null}>
     */
    private function projectUrls(): array
    {
        return Project::query()
            ->published()
            ->get()
            ->map(fn (Project $project) => [
                'loc' => route('work.show', $project->slug),
                'lastmod' => $project->updated_at?->toAtomString(),
            ])
            ->values()
            ->all();
    }

    /**
     * Published services plus the sub-service catalogue pages.
     *
     * @return array<int, array{loc: string, lastmod: string|null}>
     */
    private function serviceUrls(): array
    {
        $services = Service::query()
            ->published()
            ->get()
            ->map(fn (Service $service) => [
                'loc' => route('services.show', $service->slug),
                'lastmod' => $service->updated_at?->toAtomString(),
            ])
            ->values()
            ->all();

        $subservices = collect(config('subservices'))
            ->flatMap(fn (array $category) => [
                ['loc' => route('services.show', $category['slug']), 'lastmod' => null],
                ...array_map(
                    fn (array $item) => [
                        'loc' => route('services.subshow', [$category['slug'], $item['slug']]),
                        'lastmod' => null,
                    ],
                    $category['items'] ?? [],
                ),
            ])
            ->all();

        return [...$services, ...$subservices];
    }
}
