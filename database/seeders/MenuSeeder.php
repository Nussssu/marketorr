<?php

namespace Database\Seeders;

use App\Enums\MenuLocation;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Project;
use App\Models\ServiceGroup;
use App\Models\Setting;
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
            $menu = Menu::query()->firstOrCreate(
                ['location' => $location],
                [
                    'name' => $location->label(),
                    'content' => $location->defaultContent() ?: null,
                ],
            );

            foreach ($items as $order => [$label, $url, $children, $description]) {
                $parent = MenuItem::query()->firstOrCreate(
                    ['menu_id' => $menu->id, 'label' => $label, 'parent_id' => null],
                    ['url' => $url, 'description' => $description, 'enabled' => true, 'sort_order' => $order],
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
     * @return array<int, array{0: MenuLocation, 1: array<int, array{0: string, 1: string, 2: array<int, array{0: string, 1: string}>, 3: ?string}>}>
     */
    private function menus(): array
    {
        return [
            [MenuLocation::Header, [
                ['Home', '/', [], null],
                ['About', '/about', [], null],
                ['Services', '/services', [], null],
                ['Our Work', '/work', [], null],
            ]],
            [MenuLocation::FooterSitemap, [
                ['About', '/about', [], null],
                ['Our Work', '/work', [], null],
                ['Contact', '/contact', [], null],
            ]],
            [MenuLocation::FooterServices, [
                ['Branding', '/services#branding', [], null],
                ['UI/UX Design', '/services#ui-ux', [], null],
            ]],
            [MenuLocation::FooterLegal, [
                ['Privacy', '/privacy', [], null],
                ['Terms', '/terms', [], null],
            ]],
            [MenuLocation::FooterSocial, collect([
                'LinkedIn' => 'social_linkedin',
                'Facebook' => 'social_facebook',
                'Behance' => 'social_behance',
                'Dribbble' => 'social_dribbble',
                'Instagram' => 'social_instagram',
                'X' => 'social_x',
                'YouTube' => 'social_youtube',
            ])
                ->map(fn (string $column, string $label): array => [$label, (string) (Setting::defaults()[$column] ?? ''), [], null])
                ->filter(fn (array $item): bool => $item[1] !== '')
                ->values()
                ->all()],
            [MenuLocation::MegaServices, collect(ServiceGroup::catalogue())
                ->map(fn (array $category): array => [
                    $category['name'],
                    '/services#'.$category['slug'],
                    collect($category['items'] ?? [])->map(fn (array $item): array => [
                        $item['name'],
                        '/services/'.$category['slug'].'/'.$item['slug'],
                    ])->all(),
                    $category['tagline'] ?? null,
                ])->all()],
            [MenuLocation::MegaWork, collect(Project::workGroupSummaries())
                ->map(fn (array $group): array => [
                    $group['name'],
                    $group['href'],
                    collect($group['items'] ?? [])->map(fn (array $item): array => [
                        $item['name'],
                        $item['href'],
                    ])->all(),
                    null,
                ])->all()],
        ];
    }
}
