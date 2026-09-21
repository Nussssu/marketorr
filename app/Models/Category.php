<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

#[Fillable([
    'parent_id', 'slug', 'name', 'description',
    'thumbnail_path', 'accent', 'status', 'sort_order',
])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'sort_order' => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order')->orderBy('id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * @param  Builder<Category>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ContentStatus::Published)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * Top-level categories only.
     *
     * @param  Builder<Category>  $query
     */
    #[Scope]
    protected function roots(Builder $query): void
    {
        $query->whereNull('parent_id');
    }

    /**
     * Public URL for the thumbnail, or null when none is uploaded.
     */
    public function thumbnailUrl(): ?string
    {
        if (blank($this->thumbnail_path)) {
            return null;
        }

        if (str_starts_with($this->thumbnail_path, '/') || str_starts_with($this->thumbnail_path, 'http')) {
            return $this->thumbnail_path;
        }

        return Project::publicDiskUrl($this->thumbnail_path);
    }

    /**
     * Every descendant id plus this category's own, for filtering projects by
     * a parent category without running a query per level.
     *
     * @param  Collection<int, Category>|null  $pool  Pre-loaded categories, to avoid re-querying.
     * @return array<int, int>
     */
    public function descendantIds(?Collection $pool = null): array
    {
        $pool ??= self::query()->get(['id', 'parent_id']);

        $ids = [$this->id];
        $frontier = [$this->id];

        while ($frontier !== []) {
            $frontier = $pool->whereIn('parent_id', $frontier)->pluck('id')->all();
            $ids = [...$ids, ...$frontier];
        }

        return $ids;
    }

    /**
     * The shape the React components consume.
     *
     * @return array{slug: string, name: string, description: string|null, thumbnail: string|null, accent: string|null, children: array<int, mixed>}
     */
    public function toPublicArray(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'thumbnail' => $this->thumbnailUrl(),
            'accent' => $this->accent,
            'children' => $this->relationLoaded('children')
                ? $this->children->map(fn (self $child) => $child->toPublicArray())->values()->all()
                : [],
        ];
    }
}
