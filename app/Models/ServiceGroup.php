<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Services\PublicAsset;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

#[Fillable(['slug', 'name', 'tagline', 'accent', 'status', 'sort_order'])]
class ServiceGroup extends Model
{
    protected $table = 'service_groups';

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

    /**
     * @return HasMany<SubService, $this>
     */
    public function subServices(): HasMany
    {
        return $this->hasMany(SubService::class, 'service_group_id')->ordered();
    }

    /**
     * Only groups visible on the public site, in admin-defined order.
     *
     * @param  Builder<ServiceGroup>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ContentStatus::Published)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * @param  Builder<ServiceGroup>  $query
     */
    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * The public catalogue in the exact shape the old
     * `config/subservices.php` file had, so every consumer (Services pages,
     * header menus, sitemap, home gateways) keeps working unchanged.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function catalogue(): array
    {
        return Cache::rememberForever('service-catalogue', static fn (): array => self::query()
            ->published()
            ->with(['subServices' => fn (HasMany $query) => $query->published()])
            ->get()
            ->map(fn (ServiceGroup $group): array => [
                'slug' => $group->slug,
                'name' => $group->name,
                'tagline' => $group->tagline,
                'accent' => $group->accent,
                'items' => $group->subServices->map(fn (SubService $item): array => [
                    'slug' => $item->slug,
                    'name' => $item->name,
                    'short' => $item->short,
                    'description' => $item->description,
                    'deliverables' => $item->deliverables ?? [],
                    'image' => PublicAsset::url($item->image),
                    'imageAlt' => $item->image_alt,
                    'accent' => $item->accent,
                    'related_work' => [
                        'match' => $item->related_match ?? [],
                        'pin' => $item->related_pin ?? [],
                    ],
                    'case_study' => $item->case_study,
                ])->values()->all(),
            ])
            ->values()
            ->all());
    }

    public static function forgetCatalogue(): void
    {
        Cache::forget('service-catalogue');
    }
}
