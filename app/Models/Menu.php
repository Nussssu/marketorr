<?php

namespace App\Models;

use App\Enums\MenuLocation;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['location', 'name', 'content'])]
class Menu extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'location' => MenuLocation::class,
            'content' => 'array',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Keep a sub-service listed in the header's Services mega menu, under its
     * own tab's column: a new one is added at the end of that column, and one
     * moved to another tab moves column. The link follows the sub-service's
     * name, address and published state, so nothing else needs updating.
     *
     * Does nothing when the mega menu has not been set up in the admin (the
     * header then lists the catalogue itself) or has no column for the tab.
     */
    public static function linkSubService(SubService $subService, bool $addIfMissing = true): void
    {
        $subService->loadMissing('group');
        $menu = self::query()->where('location', MenuLocation::MegaServices)->first();

        if ($menu === null || $subService->group === null) {
            return;
        }

        $column = $menu->items()
            ->whereNull('parent_id')
            ->where(fn ($query) => $query
                ->where('url', '/services#'.$subService->group->slug)
                ->orWhere('label', $subService->group->name))
            ->first();

        if ($column === null) {
            return;
        }

        $link = [
            'label' => $subService->name,
            'url' => '/services/'.$subService->group->slug.'/'.$subService->slug,
        ];
        $existing = $menu->items()->where('sub_service_id', $subService->id)->first();

        if ($existing !== null) {
            if ($existing->parent_id !== $column->id) {
                $existing->update([
                    ...$link,
                    'parent_id' => $column->id,
                    'sort_order' => (int) $menu->items()->where('parent_id', $column->id)->max('sort_order') + 1,
                ]);
            }

            return;
        }

        if (! $addIfMissing) {
            return;
        }

        $menu->items()->create([
            ...$link,
            'parent_id' => $column->id,
            'sub_service_id' => $subService->id,
            'opens_in_new_tab' => false,
            'enabled' => true,
            'show_on_desktop' => true,
            'show_on_mobile' => true,
            'sort_order' => (int) $menu->items()->where('parent_id', $column->id)->max('sort_order') + 1,
        ]);
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
            ->with(['items' => fn ($query) => $query->where('enabled', true)->with(['subService.group', 'project'])])
            ->get()
            ->mapWithKeys(function (self $menu): array {
                // A sub-item linked to a hidden sub-service or project drops out.
                $items = $menu->items->filter(fn (MenuItem $item): bool => $item->linksToLiveTarget());

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

    /**
     * Public-facing parent labels keyed by menu location.
     *
     * @return array<string, string>
     */
    public static function publicLabels(): array
    {
        $stored = self::query()->pluck('name', 'location');

        return collect(MenuLocation::cases())
            ->mapWithKeys(fn (MenuLocation $location): array => [
                $location->value => $stored->has($location->value)
                    ? (string) $stored->get($location->value)
                    : $location->label(),
            ])
            ->all();
    }

    /**
     * Editable supporting copy keyed by menu location.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function publicContent(): array
    {
        $stored = self::query()->get()->keyBy(fn (self $menu): string => $menu->location->value);

        return collect(MenuLocation::cases())
            ->filter(fn (MenuLocation $location): bool => $location->defaultContent() !== [])
            ->mapWithKeys(function (MenuLocation $location) use ($stored): array {
                $menu = $stored->get($location->value);

                return [
                    $location->value => [
                        ...$location->defaultContent(),
                        ...($menu?->content ?? []),
                    ],
                ];
            })
            ->all();
    }
}
