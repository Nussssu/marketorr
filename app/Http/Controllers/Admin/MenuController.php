<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\MenuLocation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Http\Requests\Admin\UpdateMenusRequest;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Project;
use App\Models\ServiceGroup;
use App\Models\SubService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        $menus = Menu::query()->with(['items.subService.group', 'items.project'])->get()->keyBy(fn (Menu $menu) => $menu->location->value);

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
            'subServiceOptions' => $this->subServiceOptions(),
            'projectOptions' => $this->projectOptions(),
        ]);
    }

    /**
     * Every sub-service a Services mega menu sub-item can link to, grouped by
     * its group, with the slug and URL it is reached at.
     *
     * @return array<int, array{group: string, slug: string, items: array<int, array{id: int, name: string, slug: string, url: string, published: bool}>}>
     */
    private function subServiceOptions(): array
    {
        return ServiceGroup::query()
            ->with(['subServices' => fn ($query) => $query->orderBy('sort_order')->orderBy('id')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (ServiceGroup $group): array => [
                'group' => $group->name,
                'slug' => $group->slug,
                'items' => $group->subServices->map(fn (SubService $subService): array => [
                    'id' => $subService->id,
                    'name' => $subService->name,
                    'slug' => $subService->slug,
                    'url' => '/services/'.$group->slug.'/'.$subService->slug,
                    'published' => $subService->status === ContentStatus::Published && $group->status === ContentStatus::Published,
                ])->values()->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * Every project an Our Work mega menu sub-item can link to, under the
     * portfolio it shows in, with the slug and URL the menu links it at.
     *
     * @return array<int, array{group: string, slug: string, items: array<int, array{id: int, name: string, slug: string, url: string, published: bool}>}>
     */
    private function projectOptions(): array
    {
        $projects = Project::query()
            ->with('category.parent')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy(fn (Project $project): string => $project->workGroup());

        return collect(['branding' => 'Branding Portfolio', 'uiux' => 'UI/UX Portfolio'])
            ->map(fn (string $name, string $key): array => [
                'group' => $name,
                'slug' => $key,
                'items' => $projects->get($key, collect())->map(fn (Project $project): array => [
                    'id' => $project->id,
                    'name' => $project->title,
                    'slug' => $project->slug,
                    'url' => $project->menuUrl(),
                    'published' => $project->status === ContentStatus::Published,
                ])->values()->all(),
            ])
            ->values()
            ->all();
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
            'sub_service_id' => $item->sub_service_id,
            'project_id' => $item->project_id,
            'label' => $item->displayLabel(),
            'url' => $item->displayUrl(),
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

            // Header items are single links; sub-items belong to the mega menus.
            $children = $location === MenuLocation::Header ? [] : ($item['children'] ?? []);

            foreach ($children as $childOrder => $child) {
                $menu->items()->create([
                    ...$this->itemAttributes($child, $childOrder),
                    ...$this->subServiceLink($location, $child),
                    ...$this->projectLink($location, $child),
                    'parent_id' => $parent->id,
                ]);
            }
        }

        return $menu;
    }

    /**
     * A Services mega menu sub-item linked to a sub-service stores that link,
     * with the sub-service's current name and URL as its own.
     *
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function subServiceLink(MenuLocation $location, array $item): array
    {
        $subService = $location === MenuLocation::MegaServices && filled($item['sub_service_id'] ?? null)
            ? SubService::query()->with('group')->find($item['sub_service_id'])
            : null;

        if ($subService === null || $subService->group === null) {
            return ['sub_service_id' => null];
        }

        return [
            'sub_service_id' => $subService->id,
            'label' => $subService->name,
            'url' => '/services/'.$subService->group->slug.'/'.$subService->slug,
        ];
    }

    /**
     * An Our Work mega menu sub-item linked to a project stores that link,
     * with the project's current title and menu URL as its own.
     *
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function projectLink(MenuLocation $location, array $item): array
    {
        $project = $location === MenuLocation::MegaWork && filled($item['project_id'] ?? null)
            ? Project::query()->find($item['project_id'])
            : null;

        if ($project === null) {
            return ['project_id' => null];
        }

        return [
            'project_id' => $project->id,
            'label' => $project->title,
            'url' => $project->menuUrl(),
        ];
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
