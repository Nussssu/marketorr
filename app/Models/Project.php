<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'slug', 'title', 'client', 'category', 'year', 'description',
    'metric', 'metric_label', 'accent', 'image_path', 'image_alt',
    'tags', 'featured', 'status', 'sort_order',
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
            'featured' => 'boolean',
            'status' => ContentStatus::class,
            'sort_order' => 'integer',
        ];
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
     * Public URL for the cover image, whether stored on disk or a legacy
     * path already living under `public/`.
     */
    public function imageUrl(): string
    {
        if (str_starts_with($this->image_path, '/') || str_starts_with($this->image_path, 'http')) {
            return $this->image_path;
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
     *     slug: string, title: string, client: string, category: string,
     *     year: string, description: string, tags: array<int, string>,
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
            'category' => $this->category,
            'year' => $this->year,
            'description' => $this->description,
            'tags' => $this->tags ?? [],
            'accent' => $this->accent,
            'image' => $this->imageUrl(),
            'imageAlt' => $this->image_alt,
            'metric' => $this->metric,
            'metricLabel' => $this->metric_label,
            'featured' => $this->featured,
        ];
    }
}
