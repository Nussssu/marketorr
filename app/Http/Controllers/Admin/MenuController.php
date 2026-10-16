<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MenuLocation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Http\Requests\Admin\UpdateMenusRequest;
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
                // Social links are site-wide and edited under Settings.
                ->reject(fn (MenuLocation $location): bool => $location === MenuLocation::FooterSocial)
                ->values()
                ->map(function (MenuLocation $location) use ($menus): array {
                    $menu = $menus->get($location->value);
                    $items = $menu?->items ?? collect();

                    return [
                        'location' => $location->value,
                        'label' => $menu !== null ? $menu->name : $location->label(),
                        'group' => $location->group(),
                        'note' => $location->note(),
                        'content' => [
                            ...$location->defaultContent(),
                            ...($menu?->content ?? []),
                        ],
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

        $menu = DB::transaction(fn (): Menu => $this->persistMenu($menuLocation, $request->validated()));

        return back()->with('success', $menu->name.' saved.');
    }

    public function updateAll(UpdateMenusRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            foreach ($request->validated('menus') as $menuData) {
                $this->persistMenu(MenuLocation::from($menuData['location']), $menuData);
            }
        });

        return back()->with('success', 'All menu changes saved.');
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
            'description' => $item->description,
            'opens_in_new_tab' => $item->opens_in_new_tab,
            'enabled' => $item->enabled,
            'show_on_desktop' => $item->show_on_desktop,
            'show_on_mobile' => $item->show_on_mobile,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function persistMenu(MenuLocation $location, array $data): Menu
    {
        $menu = Menu::query()->updateOrCreate(
            ['location' => $location],
            [
                'name' => $data['name'] ?? $location->label(),
                'content' => $location->defaultContent() === []
                    ? null
                    : [...$location->defaultContent(), ...($data['content'] ?? [])],
            ],
        );

        $menu->items()->delete();

        foreach ($data['items'] as $order => $item) {
            $parent = $menu->items()->create($this->itemAttributes($item, $order));

            foreach ($item['children'] ?? [] as $childOrder => $child) {
                $menu->items()->create([
                    ...$this->itemAttributes($child, $childOrder),
                    'parent_id' => $parent->id,
                ]);
            }
        }

        return $menu;
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function itemAttributes(array $item, int $sortOrder): array
    {
        return [
            'label' => $item['label'],
            'url' => $item['url'],
            'description' => $item['description'] ?? null,
            'opens_in_new_tab' => $item['opens_in_new_tab'],
            'enabled' => $item['enabled'],
            'show_on_desktop' => $item['show_on_desktop'],
            'show_on_mobile' => $item['show_on_mobile'],
            'sort_order' => $sortOrder,
        ];
    }
}
