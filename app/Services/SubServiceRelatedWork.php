<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * The real Marketorr work shown on a sub-service page.
 *
 * Each discipline draws from the portfolio that presents it: Branding
 * sub-services from the published Branding projects, UI/UX sub-services from
 * the UI/UX showcase. A sub-service's `related_work` rules, maintained in the
 * admin panel, decide what counts as related — pinned slugs lead,
 * then projects whose tags (or, for UI/UX, listed services and discipline)
 * match — and the rest of the same portfolio tops the list up, so the section
 * always shows real work and never an empty frame.
 */
class SubServiceRelatedWork
{
    /** How many projects a sub-service page shows. */
    public const LIMIT = 4;

    public function __construct(private UiuxShowcase $showcase) {}

    /**
     * @param  array{slug: string}  $category
     * @param  array{related_work?: array{match?: array<int, string>, pin?: array<int, string>}}  $item
     * @return array<int, array{slug: string, title: string, meta: string, image: string, imageAlt: string, href: string, related: bool}>
     */
    public function for(array $category, array $item): array
    {
        $pool = $category['slug'] === 'ui-ux' ? $this->uiuxPool() : $this->brandingPool();

        $match = collect($item['related_work']['match'] ?? [])->map(fn (string $term): string => Str::lower($term));
        $pinned = collect($item['related_work']['pin'] ?? []);

        $pins = $pinned
            ->map(fn (string $slug): ?array => $pool->firstWhere('slug', $slug))
            ->filter();

        $matches = $pool->filter(
            fn (array $entry): bool => $entry['terms']->intersect($match)->isNotEmpty()
        );

        $related = $pins->concat($matches)->unique('slug')->take(self::LIMIT);

        return $related
            ->map(fn (array $entry): array => [...$entry, 'related' => true])
            ->concat(
                $pool->whereNotIn('slug', $related->pluck('slug'))
                    ->take(self::LIMIT - $related->count())
                    ->map(fn (array $entry): array => [...$entry, 'related' => false])
            )
            ->map(fn (array $entry): array => collect($entry)->except(['terms', 'tags'])->all())
            ->values()
            ->all();
    }

    /**
     * Every project a tab's sub-services can show as related work, for the
     * admin's picker: what it is, its cover and the tags it matches on.
     *
     * @return array<int, array{slug: string, title: string, meta: string, image: string, tags: array<int, string>}>
     */
    public function options(string $categorySlug): array
    {
        $pool = $categorySlug === 'ui-ux' ? $this->uiuxPool() : $this->brandingPool();

        return $pool
            ->map(fn (array $entry): array => collect($entry)->only(['slug', 'title', 'meta', 'image', 'tags'])->all())
            ->values()
            ->all();
    }

    /**
     * Published Branding portfolio projects that have a cover, in portfolio
     * order, each with the lower-cased tags and category it can be matched on.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function brandingPool(): Collection
    {
        return Project::query()
            ->published()
            ->get()
            ->filter(fn (Project $project): bool => $project->workGroup() === 'branding' && filled($project->image_path))
            ->map(fn (Project $project): array => [
                'slug' => $project->slug,
                'title' => $project->title,
                'meta' => collect([$project->category?->name, $project->year])->filter()->implode(' · '),
                'image' => $project->thumbUrl(),
                'imageAlt' => $project->image_alt ?: $project->title,
                'href' => '/work/'.$project->slug,
                'tags' => collect([...($project->tags ?? []), $project->category?->name])->filter()->values()->all(),
                'terms' => collect([...($project->tags ?? []), $project->category?->name])
                    ->filter()
                    ->map(fn (string $term): string => Str::lower($term)),
            ])
            ->values();
    }

    /**
     * The UI/UX showcase projects that have a cover, each with the lower-cased
     * services and discipline it can be matched on.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function uiuxPool(): Collection
    {
        return collect($this->showcase->projects())
            ->filter(fn (array $project): bool => filled($project['cover']['thumb'] ?? null))
            ->map(fn (array $project): array => [
                'slug' => $project['slug'],
                'title' => $project['name'],
                'meta' => $project['discipline'],
                'image' => $project['cover']['thumb'],
                'imageAlt' => $project['cover']['alt'] ?? $project['name'],
                'href' => '/work/portfolio/uiux?project='.rawurlencode($project['slug']),
                'tags' => [...$project['services'], $project['discipline']],
                'terms' => collect([...$project['services'], $project['discipline']])
                    ->map(fn (string $term): string => Str::lower($term)),
            ])
            ->values();
    }
}
