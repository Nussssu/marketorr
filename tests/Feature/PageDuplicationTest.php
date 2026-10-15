<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageDuplicationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_duplicating_a_page_copies_it_and_its_sections_as_an_unpublished_draft(): void
    {
        $page = Page::factory()->system()->create(['slug' => 'about', 'title' => 'About']);
        PageSection::factory()->ofType(SectionType::Cta)->create(['page_id' => $page->id, 'sort_order' => 0]);
        PageSection::factory()->create(['page_id' => $page->id, 'sort_order' => 1]);

        $this->actingAs($this->admin)
            ->post("/admin/pages/{$page->id}/duplicate")
            ->assertRedirect('/admin/pages');

        $copy = Page::query()->where('slug', 'about-copy')->firstOrFail();

        $this->assertSame('About (Copy)', $copy->title);
        $this->assertSame(ContentStatus::Draft, $copy->status);
        $this->assertFalse($copy->is_system);
        $this->assertSame(
            $page->sections->pluck('type')->all(),
            $copy->sections->pluck('type')->all(),
        );
        $this->assertSame(2, $page->sections()->count());
    }

    public function test_each_duplicate_gets_its_own_slug(): void
    {
        $page = Page::factory()->create(['slug' => 'process']);

        $this->actingAs($this->admin)->post("/admin/pages/{$page->id}/duplicate");
        $this->actingAs($this->admin)->post("/admin/pages/{$page->id}/duplicate");

        $this->assertDatabaseHas('pages', ['slug' => 'process-copy']);
        $this->assertDatabaseHas('pages', ['slug' => 'process-copy-2']);
    }

    public function test_guests_cannot_duplicate_a_page(): void
    {
        $page = Page::factory()->create();

        $this->post("/admin/pages/{$page->id}/duplicate")->assertRedirect();

        $this->assertSame(1, Page::query()->count());
    }
}
