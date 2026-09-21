<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'slug', 'title', 'status', 'is_system', 'sort_order',
    'meta_title', 'meta_description', 'meta_og_image',
    'meta_robots', 'canonical_url', 'schema_markup',
])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'is_system' => 'boolean',
            'sort_order' => 'integer',
            'schema_markup' => 'array',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @param  Builder<Page>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ContentStatus::Published);
    }

    /**
     * The page behind a hand-built route, with its enabled sections loaded.
     * Returns null when the page has been unpublished or never seeded, so the
     * caller can fall back to rendering nothing rather than erroring.
     */
    public static function forSlug(string $slug): ?self
    {
        return self::query()
            ->published()
            ->with(['sections' => fn ($query) => $query->where('enabled', true)])
            ->where('slug', $slug)
            ->first();
    }

    /**
     * Public URL for the page's OG image override, or null.
     */
    public function ogImageUrl(): ?string
    {
        if (blank($this->meta_og_image)) {
            return null;
        }

        return Project::publicDiskUrl($this->meta_og_image);
    }

    /**
     * Per-page SEO, with each field falling back to the site default when the
     * page does not override it.
     *
     * @return array{title: string, description: string, ogImage: string|null, robots: string, canonical: string|null, schema: array<string, mixed>|null}
     */
    public function metaArray(): array
    {
        $settings = Setting::current();

        return [
            'title' => $this->meta_title ?: $this->title,
            'description' => $this->meta_description ?: $settings->meta_default_description,
            'ogImage' => $this->ogImageUrl() ?: $settings->ogImageUrl(),
            'robots' => $this->meta_robots ?: 'index,follow',
            'canonical' => $this->canonical_url,
            'schema' => $this->schema_markup,
        ];
    }

    /**
     * The shape a React page consumes: its meta plus its widget stack.
     *
     * @return array{slug: string, title: string, meta: array<string, mixed>, sections: array<int, mixed>}
     */
    public function toPublicArray(): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'meta' => $this->metaArray(),
            'sections' => $this->sections
                ->map(fn (PageSection $section) => $section->toPublicArray())
                ->values()
                ->all(),
        ];
    }
}
