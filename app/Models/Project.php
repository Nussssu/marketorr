<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'slug', 'title', 'client', 'category_id', 'work_group', 'year', 'description',
    'metric', 'metric_label', 'accent', 'image_path', 'image_alt',
    'tags', 'featured', 'status', 'sort_order',
    'external_url', 'case_study', 'brief',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'case_study' => 'array',
            'brief' => 'array',
            'featured' => 'boolean',
            'status' => ContentStatus::class,
            'sort_order' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Only projects visible on the public site, in admin-defined order.
     *
     * @param  Builder<Project>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ContentStatus::Published)
            ->with('category.parent')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * The subset the home page's Our Work marquee leads with.
     *
     * @param  Builder<Project>  $query
     */
    #[Scope]
    protected function featured(Builder $query): void
    {
        $query->where('featured', true);
    }

    /**
     * Projects filed under a category or any of its descendants.
     *
     * @param  Builder<Project>  $query
     */
    #[Scope]
    protected function inCategory(Builder $query, Category $category): void
    {
        $query->whereIn('category_id', $category->descendantIds());
    }

    /**
     * Public URL for the cover image, whether stored on disk or a legacy
     * path already living under `public/`.
     */
    public function imageUrl(): string
    {
        // A project whose cover has not been supplied yet resolves to nothing, so
        // every surface falls back to the standard placeholder plate rather than
        // requesting a path that cannot exist.
        if (blank($this->image_path)) {
            return '';
        }

        if (str_starts_with($this->image_path, '/') || str_starts_with($this->image_path, 'http')) {
            return $this->image_path;
        }

        if (file_exists(public_path('storage/'.$this->image_path))) {
            return self::publicDiskUrl($this->image_path);
        }

        $legacyPath = 'images/work/'.basename($this->image_path);
        if (file_exists(public_path($legacyPath))) {
            return '/'.$legacyPath;
        }

        return self::publicDiskUrl($this->image_path);
    }

    /**
     * Root-relative URL for a file on the public disk, so cover images resolve
     * the same way regardless of the configured `APP_URL`.
     */
    public static function publicDiskUrl(string $path): string
    {
        $url = Storage::disk('public')->url($path);

        return parse_url($url, PHP_URL_PATH) ?: $url;
    }

    /**
     * The exact shape the React components consume (see `lib/projects.js`).
     *
     * @return array{
     *     slug: string, title: string, client: string, category: string|null,
     *     year: string, description: string, tags: array<int, string>,
     *     categorySlug: string|null,
     *     accent: string, image: string, imageAlt: string,
     *     metric: string|null, metricLabel: string|null, featured: bool
     * }
     */
    public function toPublicArray(): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'client' => $this->client,
            'category' => $this->category?->name,
            'categorySlug' => $this->category?->slug,
            'year' => $this->year,
            'description' => $this->description,
            'tags' => $this->tags ?? [],
            'accent' => $this->accent,
            'image' => $this->imageUrl(),
            'imageAlt' => $this->image_alt,
            'metric' => $this->metric,
            'metricLabel' => $this->metric_label,
            'workGroup' => $this->workGroup(),
            'workGroupName' => $this->workGroupName(),
            'workGroupHeading' => $this->workGroupHeading(),
            'brief' => $this->publicBrief(),
            'featured' => $this->featured,
            'externalUrl' => $this->external_url,
            'caseStudy' => $this->publicCaseStudy(),
        ];
    }

    /**
     * Top-level category slug that makes a project part of the interface practice.
     *
     * Web Development deliberately sits with Branding: the build work is filed
     * with the brand it was delivered for, and only Web UI/UX design work is
     * carried in the UI/UX portfolio.
     */
    public const UIUX_ROOTS = ['web-uiux'];

    /**
     * Which Our Work menu column this project belongs to.
     *
     * Derived from the category tree rather than stored, so re-filing a project
     * in the admin panel moves it in the menu too. Web UI/UX and Web Development
     * are the interface practice; everything else Marketorr publishes — brand
     * systems, campaigns, SEO and illustration — sits under Branding.
     */
    /** Human label for the group, as the menu and the project page show it. */
    public function workGroupName(): string
    {
        return $this->workGroup() === 'uiux' ? 'UI/UX' : 'Branding';
    }

    /**
     * The two Our Work portfolios and the published projects filed under each.
     *
     * Shared by the header menu, the All Work landing page and the portfolio
     * pages themselves, so those three can never disagree about what belongs
     * where. Each item carries its cover, because the menu previews projects
     * as images rather than listing their names.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function workGroupSummaries(): array
    {
        $grouped = static::query()
            ->published()
            ->with('category.parent')
            ->orderBy('sort_order')
            ->get()
            ->groupBy(fn (self $project): string => $project->workGroup());

        $columns = [
            'branding' => ['name' => 'Branding Portfolio', 'accent' => '#891FFB'],
            'uiux' => ['name' => 'UI/UX Portfolio', 'accent' => '#507AF4'],
        ];

        return collect($columns)
            ->map(fn (array $column, string $key): array => [
                'slug' => $key,
                'name' => $column['name'],
                'short' => null,
                'accent' => $column['accent'],
                'href' => '/work/portfolio/'.$key,
                'items' => $grouped->get($key, collect())
                    ->map(fn (self $project): array => [
                        'slug' => $project->slug,
                        'name' => $project->title,
                        'accent' => $project->accent,
                        'image' => $project->imageUrl(),
                        'imageAlt' => $project->image_alt,
                        'href' => '/work/'.$project->slug,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /** How the group is headed on the menu column and the project page. */
    public function workGroupHeading(): string
    {
        return $this->workGroupName().' Portfolio';
    }

    public function workGroup(): string
    {
        // An explicit filing always wins: some work is technically one
        // discipline but belongs with the other in the portfolio.
        if (in_array($this->work_group, ['branding', 'uiux'], true)) {
            return $this->work_group;
        }

        $category = $this->category;
        $root = $category?->parent ?? $category;

        return in_array($root?->slug, self::UIUX_ROOTS, true) ? 'uiux' : 'branding';
    }

    /**
     * The verified written record for the project page.
     *
     * Every field is transcribed from the project's published page on
     * marketorr.com.bd and nothing is synthesised here: a project whose entry
     * has not been transcribed yet returns null and the page simply renders
     * its cover, title and tags rather than inventing a story for it.
     *
     * @return array{
     *     overview: string|null,
     *     workedOn: array<int, string>,
     *     services: array<int, string>,
     *     highlights: array<int, array{label: string, value: string}>,
     *     client: string|null,
     *     website: string|null,
     *     behanceUrl: string|null,
     *     sourceUrl: string|null
     * }|null
     */
    public function publicBrief(): ?array
    {
        $brief = $this->brief;

        if (! is_array($brief) || $brief === []) {
            return null;
        }

        $strings = static fn (string $key): array => collect($brief[$key] ?? [])
            ->filter(fn ($value): bool => is_string($value) && trim($value) !== '')
            ->map(fn (string $value): string => trim($value))
            ->values()
            ->all();

        $highlights = collect($brief['highlights'] ?? [])
            ->filter(fn ($row): bool => is_array($row) && filled($row['label'] ?? null) && filled($row['value'] ?? null))
            ->map(fn (array $row): array => [
                'label' => trim((string) $row['label']),
                'value' => trim((string) $row['value']),
            ])
            ->values()
            ->all();

        return [
            'overview' => filled($brief['overview'] ?? null) ? trim((string) $brief['overview']) : null,
            'workedOn' => $strings('worked_on'),
            'services' => $strings('services'),
            'highlights' => $highlights,
            'client' => filled($brief['client'] ?? null) ? trim((string) $brief['client']) : null,
            'website' => filled($brief['website'] ?? null) ? trim((string) $brief['website']) : null,
            'behanceUrl' => filled($brief['behance_url'] ?? null) ? trim((string) $brief['behance_url']) : null,
            'sourceUrl' => filled($brief['source_url'] ?? null) ? trim((string) $brief['source_url']) : null,
        ];
    }

    /**
     * The case study as the page consumes it: ordered sections, each with its
     * image URLs already resolved, and anything empty dropped.
     *
     * Sections are filtered here rather than in the component so a project
     * whose story has not been written yet sends an empty array and the page
     * falls back to its cover, instead of shipping placeholder headings.
     *
     * @return array<int, array{label: string, note: string|null, images: array<int, array{src: string, alt: string, wide: bool}>}>
     */
    public function publicCaseStudy(): array
    {
        return collect($this->case_study ?? [])
            ->map(function (array $section): array {
                $images = collect($section['images'] ?? [])
                    ->filter(fn ($image) => filled($image['src'] ?? null) || filled($image['vimeo'] ?? null))
                    ->map(fn (array $image): array => [
                        'src' => self::mediaUrl($image['src']),
                        'alt' => $image['alt'] ?? '',
                        'wide' => (bool) ($image['wide'] ?? false),
                        'video' => (bool) ($image['video'] ?? false),
                        'vimeo' => $image['vimeo'] ?? null,
                    ])
                    ->values()
                    ->all();

                return [
                    'label' => $section['label'] ?? '',
                    'note' => $section['note'] ?? null,
                    'images' => $images,
                ];
            })
            ->filter(fn (array $section): bool => $section['images'] !== [])
            ->values()
            ->all();
    }

    /**
     * Resolve one case-study image path the same way a cover resolves: an
     * absolute path or URL is taken as-is, an uploaded file comes off the
     * public disk, and a legacy `public/images/work/...` file is served from
     * where it already sits.
     */
    public static function mediaUrl(string $path): string
    {
        if (str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return $path;
        }

        if (file_exists(public_path('storage/'.$path))) {
            return self::publicDiskUrl($path);
        }

        $legacyPath = 'images/work/'.basename($path);

        return file_exists(public_path($legacyPath))
            ? '/'.$legacyPath
            : self::publicDiskUrl($path);
    }
}
