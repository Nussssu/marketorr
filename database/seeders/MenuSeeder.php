<?php

namespace Database\Seeders;

use App\Enums\MenuLocation;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Seeds the navigation that used to be hardcoded in `Header.jsx` and
 * `Footer.jsx`. Items are created only when absent, so an editor's changes
 * survive a re-seed.
 */
class MenuSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach ($this->menus() as [$location, $items]) {
            $menu = Menu::query()->updateOrCreate(
                ['location' => $location],
                ['name' => $location->label()],
            );

            foreach ($items as $order => [$label, $url, $children]) {
                $parent = MenuItem::query()->firstOrCreate(
                    ['menu_id' => $menu->id, 'label' => $label, 'parent_id' => null],
                    ['url' => $url, 'enabled' => true, 'sort_order' => $order],
                );

                foreach ($children as $childOrder => [$childLabel, $childUrl]) {
                    MenuItem::query()->firstOrCreate(
                        ['menu_id' => $menu->id, 'label' => $childLabel, 'parent_id' => $parent->id],
                        ['url' => $childUrl, 'enabled' => true, 'sort_order' => $childOrder],
                    );
                }
            }
        }
    }

    /**
     * @return array<int, array{0: MenuLocation, 1: array<int, array{0: string, 1: string, 2: array<int, array{0: string, 1: string}>}>}>
     */
    private function menus(): array
    {
        return [
            [MenuLocation::Header, [
                ['Home', '/', []],
                ['About', '/about', []],
                ['Services', '/services', []],
                ['Our Work', '/work', []],
            ]],
            [MenuLocation::FooterSitemap, [
                ['About', '/about', []],
                ['Our Work', '/work', []],
                ['Contact', '/contact', []],
            ]],
            [MenuLocation::FooterServices, [
                ['Branding', '/services#branding', []],
                ['UI/UX Design', '/services#ui-ux', []],
            ]],
            [MenuLocation::FooterLegal, [
                ['Privacy', '/privacy', []],
                ['Terms', '/terms', []],
            ]],
            [MenuLocation::MegaServices, collect(config('subservices'))
                ->map(fn (array $category): array => [
                    $category['name'],
                    '/services#'.$category['slug'],
                    collect($category['items'] ?? [])->map(fn (array $item): array => [
                        $item['name'],
                        '/services/'.$category['slug'].'/'.$item['slug'],
                    ])->all(),
                ])->all()],
            [MenuLocation::MegaWork, collect(Project::workGroupSummaries())
                ->map(fn (array $group): array => [
                    $group['name'],
                    $group['href'],
                    collect($group['items'] ?? [])->map(fn (array $item): array => [
                        $item['name'],
                        $item['href'],
                    ])->all(),
                ])->all()],
        ];
    }
}
