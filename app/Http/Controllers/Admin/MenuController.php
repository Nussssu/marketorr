<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MenuLocation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        $menus = Menu::query()->with('items')->get()->keyBy(fn (Menu $menu) => $menu->location->value);

        return Inertia::render('Admin/Menus/Index', [
            // Every location is listed, including any that has no row yet, so
            // an editor can fill an empty menu without creating it first.
            'menus' => collect(MenuLocation::cases())
                ->map(function (MenuLocation $location) use ($menus): array {
                    $menu = $menus->get($location->value);
                    $items = $menu?->items ?? collect();

                    return [
                        'location' => $location->value,
                        'label' => $location->label(),
                        'items' => $items
                            ->whereNull('parent_id')
                            ->map(fn (MenuItem $item) => [
                                ...$this->toAdminArray($item),
                                'children' => $items
                                    ->where('parent_id', $item->id)
                                    ->map(fn (MenuItem $child) => $this->toAdminArray($child))
                                    ->values(),
                            ])
                            ->values(),
                    ];
                })
                ->values(),
        ]);
    }

    /**
     * Replace a menu's tree with the submitted one.
     *
     * The whole menu is rewritten in a transaction rather than diffed: items
     * carry no meaning beyond their position, and a partial write would leave
     * the navigation in a state nobody asked for.
     */
    public function update(UpdateMenuRequest $request, string $location): RedirectResponse
    {
        $menuLocation = MenuLocation::tryFrom($location);
        abort_if($menuLocation === null, 404);

        $menu = Menu::query()->updateOrCreate(
            ['location' => $menuLocation],
            ['name' => $menuLocation->label()],
        );

        DB::transaction(function () use ($menu, $request): void {
            $menu->items()->delete();

            foreach ($request->validated('items') as $order => $item) {
                $parent = $menu->items()->create([
                    'label' => $item['label'],
                    'url' => $item['url'],
                    'opens_in_new_tab' => $item['opens_in_new_tab'],
                    'enabled' => $item['enabled'],
                    'sort_order' => $order,
                ]);

                foreach ($item['children'] ?? [] as $childOrder => $child) {
                    $menu->items()->create([
                        'parent_id' => $parent->id,
                        'label' => $child['label'],
                        'url' => $child['url'],
                        'opens_in_new_tab' => $child['opens_in_new_tab'],
                        'enabled' => $child['enabled'],
                        'sort_order' => $childOrder,
                    ]);
                }
            }
        });

        return back()->with('success', $menuLocation->label().' saved.');
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'label' => $item->label,
            'url' => $item->url,
            'opens_in_new_tab' => $item->opens_in_new_tab,
            'enabled' => $item->enabled,
        ];
    }
}
