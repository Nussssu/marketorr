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
    'slug', 'title', 'client', 'category_id', 'year', 'description',
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
            ->with('category')
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
            'brief' => $this->publicBrief(),
            'featured' => $this->featured,
            'externalUrl' => $this->external_url,
            'caseStudy' => $this->publicCaseStudy(),
        ];
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
                    ->filter(fn ($image) => filled($image['src'] ?? null))
                    ->map(fn (array $image): array => [
                        'src' => self::mediaUrl($image['src']),
                        'alt' => $image['alt'] ?? '',
                        'wide' => (bool) ($image['wide'] ?? false),
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
