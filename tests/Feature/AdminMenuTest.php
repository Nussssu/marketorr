<?php

namespace Tests\Feature;

use App\Enums\MenuLocation;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMenuTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function item(array $overrides = []): array
    {
        return array_merge([
            'label' => 'About',
            'url' => '/about',
            'description' => null,
            'opens_in_new_tab' => false,
            'enabled' => true,
            'show_on_desktop' => true,
            'show_on_mobile' => true,
            'children' => [],
        ], $overrides);
    }

    public function test_saving_a_menu_creates_it_when_it_does_not_exist_yet(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/menus/header', ['items' => [$this->item()]])
            ->assertRedirect();

        $this->assertDatabaseHas('menus', ['location' => MenuLocation::Header->value]);
        $this->assertDatabaseHas('menu_items', ['label' => 'About', 'url' => '/about']);
    }

    public function test_a_parent_label_can_be_renamed_and_is_shared_with_the_public_site(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/menus/footer_sitemap', [
                'name' => 'Explore',
                'items' => [$this->item()],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('menus', [
            'location' => MenuLocation::FooterSitemap->value,
            'name' => 'Explore',
        ]);

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('menuLabels.footer_sitemap', 'Explore'));
    }

    public function test_saving_a_menu_replaces_the_previous_tree(): void
    {
        $menu = Menu::query()->create(['location' => MenuLocation::Header, 'name' => 'Header']);
        MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Old', 'url' => '/old', 'sort_order' => 0]);

        $this->actingAs($this->admin)->put('/admin/menus/header', [
            'items' => [$this->item(['label' => 'New', 'url' => '/new'])],
        ]);

        $this->assertDatabaseMissing('menu_items', ['label' => 'Old']);
        $this->assertDatabaseHas('menu_items', ['label' => 'New']);
    }

    public function test_sub_items_are_stored_under_their_parent(): void
    {
        $this->actingAs($this->admin)->put('/admin/menus/header', [
            'items' => [
                $this->item([
                    'label' => 'Services',
                    'url' => '/services',
                    'children' => [$this->item(['label' => 'Branding', 'url' => '/services/branding'])],
                ]),
            ],
        ]);

        $parent = MenuItem::query()->where('label', 'Services')->firstOrFail();
        $child = MenuItem::query()->where('label', 'Branding')->firstOrFail();

        $this->assertSame($parent->id, $child->parent_id);
    }

    public function test_item_order_follows_the_submitted_order(): void
    {
        $this->actingAs($this->admin)->put('/admin/menus/header', [
            'items' => [
                $this->item(['label' => 'Second']),
                $this->item(['label' => 'First']),
            ],
        ]);

        $this->assertSame(0, MenuItem::query()->where('label', 'Second')->value('sort_order'));
        $this->assertSame(1, MenuItem::query()->where('label', 'First')->value('sort_order'));
    }

    public function test_a_menu_may_be_emptied(): void
    {
        $menu = Menu::query()->create(['location' => MenuLocation::Header, 'name' => 'Header']);
        MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Old', 'url' => '/old', 'sort_order' => 0]);

        $this->actingAs($this->admin)->put('/admin/menus/header', ['items' => []])->assertRedirect();

        $this->assertSame(0, $menu->items()->count());
    }

    public function test_an_unknown_location_is_a_404(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/menus/nowhere', ['items' => []])
            ->assertNotFound();
    }

    public function test_an_item_without_a_label_is_rejected(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/menus/header', ['items' => [$this->item(['label' => ''])]])
            ->assertSessionHasErrors('items.0.label');
    }

    public function test_disabled_items_are_not_shared_with_the_public_site(): void
    {
        $menu = Menu::query()->create(['location' => MenuLocation::Header, 'name' => 'Header']);
        MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Shown', 'url' => '/a', 'sort_order' => 0]);
        MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Hidden', 'url' => '/b', 'enabled' => false, 'sort_order' => 1]);

        $this->get('/')->assertInertia(fn ($inertia) => $inertia
            ->has('menus.header', 1)
            ->where('menus.header.0.label', 'Shown'));
    }

    public function test_header_items_keep_independent_desktop_and_mobile_visibility(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/menus/header', ['items' => [
                $this->item([
                    'label' => 'Contact',
                    'url' => '/contact',
                    'show_on_desktop' => false,
                    'show_on_mobile' => true,
                ]),
            ]])
            ->assertRedirect();

        $this->assertDatabaseHas('menu_items', [
            'label' => 'Contact',
            'show_on_desktop' => false,
            'show_on_mobile' => true,
        ]);

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('menus.header.0.showOnDesktop', false)
            ->where('menus.header.0.showOnMobile', true));
    }

    public function test_the_menu_editor_groups_locations_into_header_footer_and_mega_tabs(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/menus')
            ->assertInertia(fn ($page) => $page
                // Social links are site-wide and edited under Settings, not here.
                ->has('menus', 6)
                ->where('menus.0.group', 'header')
                ->where('menus.1.group', 'footer')
                ->where('menus.1.label', 'Quick Links')
                ->where('menus', fn ($menus) => ! collect($menus)->pluck('location')->contains('footer_social'))
                ->where('menus.4.group', 'mega')
                ->where('menus.4.label', 'Services')
                ->where('menus.5.label', 'Our Work'));
    }

    public function test_a_mega_menu_tree_is_shared_with_the_public_site(): void
    {
        $this->actingAs($this->admin)->put('/admin/menus/mega_services', [
            'items' => [
                $this->item([
                    'label' => 'Branding',
                    'url' => '/services#branding',
                    'children' => [$this->item(['label' => 'Brand Strategy', 'url' => '/services/branding/brand-strategy'])],
                ]),
            ],
        ]);

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('menus.mega_services.0.label', 'Branding')
            ->where('menus.mega_services.0.children.0.label', 'Brand Strategy'));
    }

    public function test_mega_menu_supporting_copy_is_editable_and_shared(): void
    {
        $this->actingAs($this->admin)->put('/admin/menus/mega_services', [
            'name' => 'Services',
            'content' => [
                'eyebrow' => 'Capabilities',
                'headline_before' => 'Ideas that',
                'headline_highlight' => 'perform',
                'headline_after' => '.',
                'blurb' => 'Choose the expertise your project needs.',
                'all_label' => 'Explore every service',
                'all_url' => '/services',
            ],
            'items' => [],
        ])->assertRedirect();

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('menuContent.mega_services.eyebrow', 'Capabilities')
            ->where('menuContent.mega_services.headline_highlight', 'perform')
            ->where('menuContent.mega_services.all_label', 'Explore every service'));
    }

    public function test_mega_menu_group_supporting_text_is_editable_and_shared(): void
    {
        $this->actingAs($this->admin)->put('/admin/menus/mega_services', [
            'items' => [
                $this->item([
                    'label' => 'Branding',
                    'url' => '/services#branding',
                    'description' => 'Brands built to be remembered.',
                ]),
            ],
        ])->assertRedirect();

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('menus.mega_services.0.description', 'Brands built to be remembered.'));
    }

    public function test_footer_copy_is_editable_from_menus_and_shared_with_the_public_site(): void
    {
        $this->actingAs($this->admin)->put('/admin/menus', [
            'menus' => [
                [
                    'location' => 'footer_social',
                    'name' => 'Connect',
                    'content' => ['intro' => 'A new agency introduction.'],
                    'items' => [$this->item(['label' => 'LinkedIn', 'url' => 'https://linkedin.com/company/acme'])],
                ],
                [
                    'location' => 'footer_legal',
                    'name' => 'Legal',
                    'content' => [
                        'copyright' => '© {year} {site}.',
                        'motto_items' => ['THINK', 'MAKE', 'GROW'],
                    ],
                    'items' => [$this->item(['label' => 'Privacy', 'url' => '/privacy'])],
                ],
            ],
        ])->assertRedirect();

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('menuLabels.footer_social', 'Connect')
            ->where('menuContent.footer_social.intro', 'A new agency introduction.')
            ->where('menuContent.footer_legal.copyright', '© {year} {site}.')
            ->where('menuContent.footer_legal.motto_items', ['THINK', 'MAKE', 'GROW'])
            ->where('menus.footer_legal.0.label', 'Privacy'));
    }

    public function test_removed_footer_and_mega_text_does_not_fall_back_to_default_copy(): void
    {
        $this->actingAs($this->admin)->put('/admin/menus', [
            'menus' => [
                [
                    'location' => 'footer_social',
                    'name' => '',
                    'content' => ['intro' => ''],
                    'items' => [],
                ],
                [
                    'location' => 'footer_legal',
                    'name' => '',
                    'content' => [
                        'copyright' => '',
                        'motto_items' => [],
                    ],
                    'items' => [],
                ],
                [
                    'location' => 'mega_services',
                    'name' => '',
                    'content' => [
                        'eyebrow' => '',
                        'headline_before' => '',
                        'headline_highlight' => '',
                        'headline_after' => '',
                        'blurb' => '',
                        'all_label' => '',
                        'all_url' => '',
                    ],
                    'items' => [
                        $this->item([
                            'label' => 'Branding',
                            'url' => '/services#branding',
                            'description' => '',
                        ]),
                    ],
                ],
            ],
        ])->assertRedirect();

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('menuLabels.footer_social', '')
            ->where('menuContent.footer_social.intro', '')
            ->where('menuContent.footer_legal.copyright', '')
            ->where('menuContent.footer_legal.motto_items', [])
            ->where('menuContent.mega_services.eyebrow', '')
            ->where('menuContent.mega_services.headline_highlight', '')
            ->where('menuContent.mega_services.all_label', '')
            ->where('menus.mega_services.0.description', ''));
    }

    public function test_guests_cannot_edit_menus(): void
    {
        $this->put('/admin/menus/header', ['items' => []])->assertRedirect('/admin/login');
    }

    public function test_a_hidden_social_link_leaves_the_footer_and_can_be_shown_again(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/menus/footer_social', ['items' => [
                $this->item(['label' => 'LinkedIn', 'url' => 'https://linkedin.com/company/acme', 'opens_in_new_tab' => true]),
                $this->item(['label' => 'Behance', 'url' => 'https://behance.net/acme', 'opens_in_new_tab' => true, 'enabled' => false]),
            ]])
            ->assertRedirect();

        $this->get('/')->assertInertia(fn ($page) => $page
            ->has('menus.footer_social', 1)
            ->where('menus.footer_social.0.label', 'LinkedIn'));
    }

    public function test_the_sync_migration_builds_the_social_menu_from_settings_and_matches_the_footer(): void
    {
        Setting::query()->create([
            ...Setting::defaults(),
            'social_facebook' => 'https://facebook.com/acme',
        ]);
        $sitemap = Menu::query()->create(['location' => MenuLocation::FooterSitemap, 'name' => 'Sitemap']);
        MenuItem::query()->create(['menu_id' => $sitemap->id, 'label' => 'Services', 'url' => '/services', 'enabled' => true, 'sort_order' => 0]);
        $services = Menu::query()->create(['location' => MenuLocation::FooterServices, 'name' => 'Services']);
        MenuItem::query()->create(['menu_id' => $services->id, 'label' => 'Branding', 'url' => '/services/branding', 'enabled' => true, 'sort_order' => 0]);

        $migration = require database_path('migrations/2026_10_16_052703_sync_footer_menus_with_the_site.php');
        $migration->up();
        $migration->up();

        $social = Menu::query()->where('location', MenuLocation::FooterSocial)->sole();
        $this->assertSame(
            ['LinkedIn', 'Facebook', 'Behance', 'Dribbble', 'Instagram'],
            $social->items()->orderBy('sort_order')->pluck('label')->all(),
        );
        $this->assertSame(0, $sitemap->items()->count());
        $this->assertSame('/services#branding', $services->items()->value('url'));
    }
}
