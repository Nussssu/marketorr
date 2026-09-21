<?php

namespace App\Models;

use App\Enums\MenuLocation;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['location', 'name'])]
class Menu extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'location' => MenuLocation::class,
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Every menu keyed by location, with enabled items nested one level deep.
     * One query per relation, so the shared Inertia prop stays cheap.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function publicTree(): array
    {
        return self::query()
            ->with(['items' => fn ($query) => $query->where('enabled', true)])
            ->get()
            ->mapWithKeys(function (self $menu): array {
                $items = $menu->items;

                return [
                    $menu->location->value => $items
                        ->whereNull('parent_id')
                        ->map(fn (MenuItem $item) => [
                            ...$item->toPublicArray(),
                            'children' => $items
                                ->where('parent_id', $item->id)
                                ->map(fn (MenuItem $child) => $child->toPublicArray())
                                ->values()
                                ->all(),
                        ])
                        ->values()
                        ->all(),
                ];
            })
            ->all();
    }
}
