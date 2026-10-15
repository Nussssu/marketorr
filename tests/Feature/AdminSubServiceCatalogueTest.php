<?php

namespace Tests\Feature;

use App\Models\ServiceGroup;
use App\Models\SubService;
use App\Models\User;
use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSubServiceCatalogueTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->seed(SettingSeeder::class);
    }

    /**
     * @return array<string, mixed>
     */
    private function validTab(array $overrides = []): array
    {
        return array_merge([
            'slug' => 'branding',
            'name' => 'Branding',
            'tagline' => 'Identities that demand attention.',
            'accent' => '#891FFB',
            'status' => 'published',
        ], $overrides);
    }

    /**
     * @return array<string, mixed>
     */
    private function validItem(int $groupId, array $overrides = []): array
    {
        return array_merge([
            'service_group_id' => $groupId,
            'slug' => 'brand-strategy',
            'name' => 'Brand Strategy',
            'short' => 'Positioning that makes choosing you obvious.',
            'description' => 'Research-led positioning.',
            'deliverables' => ['Positioning statement', 'Messaging hierarchy'],
            'accent' => '#891FFB',
            'related_match' => ['Brand Identity'],
            'related_pin' => [],
            'status' => 'published',
        ], $overrides);
    }

    public function test_an_admin_can_create_a_tab(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/service-groups', $this->validTab())
            ->assertRedirect('/admin/service-groups')
            ->assertSessionHas('success');

        $this->assertSame('Branding', ServiceGroup::query()->sole()->name);
    }

    public function test_a_sub_service_created_in_the_panel_renders_on_the_public_site(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());

        $this->actingAs($this->admin)
            ->post('/admin/sub-services', $this->validItem($group->id))
            ->assertRedirect('/admin/sub-services')
            ->assertSessionHas('success');

        $this->get('/services/branding/brand-strategy')->assertStatus(200);

        $this->get('/services')
            ->assertInertia(fn ($page) => $page
                ->component('Services/Index')
                ->where('subservices.0.slug', 'branding')
                ->where('subservices.0.items.0.slug', 'brand-strategy'));
    }

    public function test_renaming_a_sub_service_updates_its_public_page(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());
        $item = SubService::query()->create([...$this->validItem($group->id), 'service_group_id' => $group->id]);

        $this->actingAs($this->admin)
            ->put("/admin/sub-services/{$item->id}", [...$this->validItem($group->id), 'name' => 'Brand Strategy Plus'])
            ->assertRedirect('/admin/sub-services');

        $this->get('/services/branding/brand-strategy')
            ->assertInertia(fn ($page) => $page->where('item.name', 'Brand Strategy Plus'));
    }

    public function test_deleting_a_tab_removes_its_public_pages(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());
        SubService::query()->create([...$this->validItem($group->id), 'service_group_id' => $group->id]);

        $this->actingAs($this->admin)
            ->delete("/admin/service-groups/{$group->id}")
            ->assertSessionHas('success');

        $this->assertSame(0, SubService::query()->count());
        $this->get('/services/branding/brand-strategy')->assertStatus(404);
    }

    public function test_tab_slugs_must_be_unique(): void
    {
        ServiceGroup::query()->create($this->validTab());

        $this->actingAs($this->admin)
            ->post('/admin/service-groups', $this->validTab())
            ->assertSessionHasErrors('slug');
    }

    public function test_an_admin_can_reorder_tabs(): void
    {
        $first = ServiceGroup::query()->create($this->validTab());
        $second = ServiceGroup::query()->create($this->validTab(['slug' => 'ui-ux', 'name' => 'UI/UX']));

        $this->actingAs($this->admin)
            ->patch('/admin/service-groups/reorder', ['ids' => [$second->id, $first->id]])
            ->assertSessionHas('success');

        $this->assertSame(
            [$second->id, $first->id],
            ServiceGroup::query()->ordered()->pluck('id')->all(),
        );
    }

    public function test_guests_cannot_create_tabs(): void
    {
        $this->post('/admin/service-groups', $this->validTab())->assertRedirect('/admin/login');
    }
}
