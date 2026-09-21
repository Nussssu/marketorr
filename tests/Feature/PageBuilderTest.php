<?php

namespace Tests\Feature;

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageBuilderTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_an_admin_can_create_a_page(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/pages', [
                'slug' => 'process',
                'title' => 'Our Process',
                'status' => 'published',
                'meta_robots' => 'index,follow',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('pages', ['slug' => 'process', 'is_system' => false]);
    }

    public function test_schema_markup_must_be_valid_json(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/pages', [
                'slug' => 'process',
                'title' => 'Our Process',
                'status' => 'published',
                'meta_robots' => 'index,follow',
                'schema_markup' => '{not json',
            ])
            ->assertSessionHasErrors('schema_markup');
    }

    public function test_valid_schema_markup_is_stored_as_structured_data(): void
    {
        $this->actingAs($this->admin)->post('/admin/pages', [
            'slug' => 'process',
            'title' => 'Our Process',
            'status' => 'published',
            'meta_robots' => 'index,follow',
            'schema_markup' => '{"@type":"WebPage"}',
        ]);

        $this->assertSame(['@type' => 'WebPage'], Page::query()->where('slug', 'process')->value('schema_markup'));
    }

    public function test_a_system_page_cannot_be_deleted(): void
    {
        $page = Page::factory()->system()->create();

        $this->actingAs($this->admin)->delete("/admin/pages/{$page->id}")->assertRedirect();

        $this->assertNotSoftDeleted($page);
    }

    public function test_a_system_pages_slug_is_locked_on_update(): void
    {
        $page = Page::factory()->system()->create(['slug' => 'home']);

        $this->actingAs($this->admin)->put("/admin/pages/{$page->id}", [
            'slug' => 'something-else',
            'title' => 'Home',
            'status' => 'published',
            'meta_robots' => 'index,follow',
        ]);

        $this->assertSame('home', $page->fresh()->slug);
    }

    public function test_an_admin_can_add_a_section_to_a_page(): void
    {
        $page = Page::factory()->create();

        $this->actingAs($this->admin)
            ->post("/admin/pages/{$page->id}/sections", [
                'type' => SectionType::Faq->value,
                'name' => 'Questions',
                'content' => [],
                'enabled' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('page_sections', [
            'page_id' => $page->id,
            'type' => SectionType::Faq->value,
            'name' => 'Questions',
        ]);
    }

    public function test_a_new_section_starts_with_its_types_blank_content(): void
    {
        $page = Page::factory()->create();

        $this->actingAs($this->admin)->post("/admin/pages/{$page->id}/sections", [
            'type' => SectionType::Faq->value,
            'name' => 'Questions',
            'content' => [],
            'enabled' => true,
        ]);

        $this->assertSame(
            SectionType::Faq->blankContent(),
            PageSection::query()->where('page_id', $page->id)->value('content'),
        );
    }

    public function test_saving_a_section_drops_keys_its_type_does_not_declare(): void
    {
        $page = Page::factory()->create();
        $section = PageSection::factory()->ofType(SectionType::Cta)->create(['page_id' => $page->id]);

        $this->actingAs($this->admin)->put("/admin/pages/{$page->id}/sections/{$section->id}", [
            'type' => SectionType::Cta->value,
            'name' => 'Call to action',
            'content' => ['heading' => 'Start a project', 'smuggled' => 'value'],
            'enabled' => true,
        ]);

        $content = $section->fresh()->content;

        $this->assertSame('Start a project', $content['heading']);
        $this->assertArrayNotHasKey('smuggled', $content);
    }

    public function test_a_section_cannot_be_edited_through_another_pages_url(): void
    {
        $page = Page::factory()->create();
        $other = Page::factory()->create();
        $section = PageSection::factory()->create(['page_id' => $page->id]);

        $this->actingAs($this->admin)
            ->put("/admin/pages/{$other->id}/sections/{$section->id}", [
                'type' => SectionType::RichText->value,
                'name' => 'Hijacked',
                'content' => [],
                'enabled' => true,
            ])
            ->assertNotFound();

        $this->assertNotSame('Hijacked', $section->fresh()->name);
    }

    public function test_reordering_sections_persists_the_new_positions(): void
    {
        $page = Page::factory()->create();
        $first = PageSection::factory()->create(['page_id' => $page->id, 'sort_order' => 0]);
        $second = PageSection::factory()->create(['page_id' => $page->id, 'sort_order' => 1]);

        $this->actingAs($this->admin)
            ->patch("/admin/pages/{$page->id}/sections/reorder", ['ids' => [$second->id, $first->id]])
            ->assertRedirect();

        $this->assertSame(0, $second->fresh()->sort_order);
        $this->assertSame(1, $first->fresh()->sort_order);
    }

    /**
     * Pages soft-delete, so the cascade never fires and the sections stay put
     * — restoring the page has to bring its content back with it.
     */
    public function test_deleting_a_page_keeps_its_sections_for_a_restore(): void
    {
        $page = Page::factory()->create();
        $section = PageSection::factory()->create(['page_id' => $page->id]);

        $this->actingAs($this->admin)->delete("/admin/pages/{$page->id}");

        $this->assertSoftDeleted($page);
        $this->assertDatabaseHas('page_sections', ['id' => $section->id]);

        $page->restore();
        $this->assertCount(1, $page->fresh()->sections);
    }

    public function test_force_deleting_a_page_removes_its_sections(): void
    {
        $page = Page::factory()->create();
        $section = PageSection::factory()->create(['page_id' => $page->id]);

        $page->forceDelete();

        $this->assertDatabaseMissing('page_sections', ['id' => $section->id]);
    }

    public function test_the_builder_lists_every_section_type(): void
    {
        $page = Page::factory()->create();

        $this->actingAs($this->admin)
            ->get("/admin/pages/{$page->id}/builder")
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia
                ->component('Admin/Pages/Builder')
                ->has('palette', count(SectionType::cases())));
    }

    public function test_guests_cannot_reach_the_page_module(): void
    {
        $page = Page::factory()->create();

        $this->get('/admin/pages')->assertRedirect('/admin/login');
        $this->get("/admin/pages/{$page->id}/builder")->assertRedirect('/admin/login');
    }
}
