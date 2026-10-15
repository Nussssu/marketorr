<?php

namespace Tests\Feature;

use App\Enums\MenuLocation;
use App\Models\Menu;
use App\Models\MenuItem;
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
            'opens_in_new_tab' => false,
            'enabled' => true,
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

    public function test_the_menu_editor_groups_locations_into_header_footer_and_mega_tabs(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/menus')
            ->assertInertia(fn ($page) => $page
                ->has('menus', 6)
                ->where('menus.0.group', 'header')
                ->where('menus.1.group', 'footer')
                ->where('menus.4.group', 'mega'));
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

    public function test_guests_cannot_edit_menus(): void
    {
        $this->put('/admin/menus/header', ['items' => []])->assertRedirect('/admin/login');
    }
}
