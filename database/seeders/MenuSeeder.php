<?php

namespace Database\Seeders;

use App\Enums\MenuLocation;
use App\Models\Menu;
use App\Models\MenuItem;
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

            foreach ($items as $order => [$label, $url]) {
                MenuItem::query()->firstOrCreate(
                    ['menu_id' => $menu->id, 'label' => $label, 'parent_id' => null],
                    ['url' => $url, 'enabled' => true, 'sort_order' => $order],
                );
            }
        }
    }

    /**
     * @return array<int, array{0: MenuLocation, 1: array<int, array{0: string, 1: string}>}>
     */
    private function menus(): array
    {
        return [
            [MenuLocation::Header, [
                ['Home', '/'],
                ['About', '/about'],
                ['Services', '/services'],
                ['Our Work', '/work'],
                ['Contact', '/contact'],
            ]],
            [MenuLocation::FooterSitemap, [
                ['About', '/about'],
                ['Services', '/services'],
                ['Our Work', '/work'],
                ['Contact', '/contact'],
            ]],
            [MenuLocation::FooterServices, [
                ['Branding', '/services/branding'],
                ['UI/UX Design', '/services/ui-ux'],
            ]],
            [MenuLocation::FooterLegal, [
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
            ]],
        ];
    }
}
