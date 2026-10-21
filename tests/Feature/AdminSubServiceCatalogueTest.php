<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Service;
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

    public function test_an_admin_can_copy_a_sub_service_as_a_draft(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());
        $item = SubService::query()->create([...$this->validItem($group->id), 'service_group_id' => $group->id]);

        $this->actingAs($this->admin)
            ->post("/admin/sub-services/{$item->id}/duplicate")
            ->assertRedirectContains('/edit')
            ->assertSessionHas('success');

        $copy = SubService::query()->where('id', '!=', $item->id)->sole();

        $this->assertSame('brand-strategy-copy', $copy->slug);
        $this->assertSame('Brand Strategy (Copy)', $copy->name);
        $this->assertSame(ContentStatus::Draft, $copy->status);
        $this->assertSame($item->deliverables, $copy->deliverables);
        $this->get('/services/branding/brand-strategy-copy')->assertNotFound();
    }

    public function test_deleting_a_sub_service_removes_its_public_page_and_directory_entry(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());
        $item = SubService::query()->create([...$this->validItem($group->id), 'service_group_id' => $group->id]);

        $this->actingAs($this->admin)
            ->delete("/admin/sub-services/{$item->id}")
            ->assertSessionHas('success');

        $this->get('/services/branding/brand-strategy')->assertNotFound();
        $this->get('/services')->assertInertia(fn ($page) => $page
            ->has('subservices.0.items', 0));
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

    public function test_a_tab_cannot_take_the_slug_of_a_service_but_an_unchanged_one_still_saves(): void
    {
        Service::factory()->create(['slug' => 'branding']);

        $this->actingAs($this->admin)
            ->post('/admin/service-groups', $this->validTab())
            ->assertSessionHasErrors('slug');

        $group = ServiceGroup::query()->create([...$this->validTab(), 'slug' => 'ui-ux']);

        $this->actingAs($this->admin)
            ->put("/admin/service-groups/{$group->id}", [...$this->validTab(), 'slug' => 'ui-ux', 'name' => 'UI/UX'])
            ->assertSessionHasNoErrors();
    }

    public function test_page_text_edited_in_the_panel_shows_on_the_public_page(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());
        $item = SubService::query()->create([...$this->validItem($group->id), 'service_group_id' => $group->id]);

        $this->actingAs($this->admin)
            ->put("/admin/sub-services/{$item->id}", [
                ...$this->validItem($group->id),
                'page_content' => [
                    ...SubService::DEFAULT_PAGE_CONTENT,
                    'work_heading' => 'Selected {name} work',
                    'start_url' => '/contact?from=strategy',
                ],
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame(
            ['work_heading' => 'Selected {name} work', 'start_url' => '/contact?from=strategy'],
            $item->fresh()->page_content,
        );

        $this->get('/services/branding/brand-strategy')
            ->assertInertia(fn ($page) => $page
                ->where('item.page.work_heading', 'Selected {name} work')
                ->where('item.page.start_url', '/contact?from=strategy')
                ->where('item.page.deliverables_heading', 'What you get'));
    }

    public function test_an_untouched_page_keeps_the_default_text(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());

        $this->actingAs($this->admin)
            ->post('/admin/sub-services', [...$this->validItem($group->id), 'page_content' => SubService::DEFAULT_PAGE_CONTENT])
            ->assertSessionHasNoErrors();

        $this->assertNull(SubService::query()->sole()->page_content);

        $this->get('/services/branding/brand-strategy')
            ->assertInertia(fn ($page) => $page->where('item.page', SubService::DEFAULT_PAGE_CONTENT));
    }

    public function test_a_case_study_built_in_the_panel_shows_on_the_public_page(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());
        $study = [
            'meta' => 'Published 2026',
            'sections' => [[
                'eyebrow' => 'About the project',
                'heading' => 'A fresh start',
                'body' => 'The story.',
                'images' => [['src' => 'https://cdn.example.com/a.jpg', 'alt' => 'Cover']],
            ]],
        ];

        $this->actingAs($this->admin)
            ->post('/admin/sub-services', [...$this->validItem($group->id), 'case_study' => json_encode($study)])
            ->assertSessionHasNoErrors();

        $this->get('/services/branding/brand-strategy')
            ->assertInertia(fn ($page) => $page
                ->where('item.case_study.sections.0.heading', 'A fresh start')
                ->where('item.case_study.sections.0.images.0.src', 'https://cdn.example.com/a.jpg'));
    }

    public function test_the_form_lists_the_projects_related_work_can_be_picked_from(): void
    {
        ServiceGroup::query()->create($this->validTab());

        $this->actingAs($this->admin)
            ->get('/admin/sub-services/create')
            ->assertInertia(fn ($page) => $page
                ->component('Admin/SubServices/Form')
                ->has('relatedOptions.branding')
                ->where('pageDefaults', SubService::DEFAULT_PAGE_CONTENT));
    }

    public function test_the_status_toggle_publishes_and_unpublishes_a_sub_service(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());
        $item = SubService::query()->create([...$this->validItem($group->id), 'service_group_id' => $group->id]);

        $this->actingAs($this->admin)
            ->patch("/admin/sub-services/{$item->id}/status", ['status' => 'draft'])
            ->assertSessionHas('success');

        $this->assertSame(ContentStatus::Draft, $item->fresh()->status);
        $this->get('/services/branding/brand-strategy')->assertNotFound();

        $this->actingAs($this->admin)
            ->patch("/admin/sub-services/{$item->id}/status", ['status' => 'published']);

        $this->get('/services/branding/brand-strategy')->assertOk();
    }

    public function test_seo_set_in_the_panel_reaches_the_public_page(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());

        $this->actingAs($this->admin)
            ->post('/admin/sub-services', [
                ...$this->validItem($group->id),
                'meta_title' => 'Brand Strategy Agency in Dhaka',
                'meta_description' => 'Positioning built on research.',
                'meta_robots' => 'noindex,follow',
                'canonical_url' => 'https://marketorr.com/services/branding/brand-strategy',
            ])
            ->assertSessionHasNoErrors();

        $this->get('/services/branding/brand-strategy')
            ->assertInertia(fn ($page) => $page
                ->where('item.meta.title', 'Brand Strategy Agency in Dhaka')
                ->where('item.meta.description', 'Positioning built on research.')
                ->where('item.meta.robots', 'noindex,follow')
                ->where('item.meta.canonical', 'https://marketorr.com/services/branding/brand-strategy'));

        $this->get('/sitemap.xml')->assertDontSee('/services/branding/brand-strategy', false);
    }

    public function test_empty_seo_falls_back_to_the_page_name_and_description(): void
    {
        $group = ServiceGroup::query()->create($this->validTab());

        $this->actingAs($this->admin)->post('/admin/sub-services', $this->validItem($group->id));

        $this->get('/services/branding/brand-strategy')
            ->assertInertia(fn ($page) => $page
                ->where('item.meta.title', 'Brand Strategy | Marketorr')
                ->where('item.meta.description', 'Research-led positioning.')
                ->where('item.meta.robots', 'index,follow'));

        $this->get('/sitemap.xml')->assertSee('/services/branding/brand-strategy', false);
    }
}
