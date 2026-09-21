<?php

namespace Tests\Feature;

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsPageRenderingTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_home_page_renders_the_sections_stored_for_it(): void
    {
        $page = Page::factory()->system()->create(['slug' => 'home', 'title' => 'Home']);
        PageSection::factory()
            ->ofType(SectionType::Hero, ['eyebrow' => 'Seeded eyebrow'])
            ->create(['page_id' => $page->id, 'sort_order' => 0]);
        PageSection::factory()
            ->ofType(SectionType::Faq, ['heading' => 'Questions'])
            ->create(['page_id' => $page->id, 'sort_order' => 1]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia
                ->component('Home')
                ->has('page.sections', 2)
                ->where('page.sections.0.type', 'hero')
                ->where('page.sections.0.content.eyebrow', 'Seeded eyebrow')
                ->where('page.sections.1.type', 'faq'));
    }

    public function test_sections_are_returned_in_their_configured_order(): void
    {
        $page = Page::factory()->system()->create(['slug' => 'home']);
        PageSection::factory()->ofType(SectionType::Faq)->create(['page_id' => $page->id, 'sort_order' => 5]);
        PageSection::factory()->ofType(SectionType::Hero)->create(['page_id' => $page->id, 'sort_order' => 1]);

        $this->get('/')->assertInertia(fn ($inertia) => $inertia
            ->where('page.sections.0.type', 'hero')
            ->where('page.sections.1.type', 'faq'));
    }

    public function test_a_disabled_section_is_not_sent_to_the_page(): void
    {
        $page = Page::factory()->system()->create(['slug' => 'home']);
        PageSection::factory()->ofType(SectionType::Hero)->create(['page_id' => $page->id]);
        PageSection::factory()->ofType(SectionType::Faq)->disabled()->create(['page_id' => $page->id]);

        $this->get('/')->assertInertia(fn ($inertia) => $inertia->has('page.sections', 1));
    }

    public function test_an_unpublished_system_page_still_renders_its_route_without_content(): void
    {
        Page::factory()->system()->draft()->create(['slug' => 'home']);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia->where('page', null));
    }

    public function test_a_published_page_is_reachable_at_its_slug(): void
    {
        $page = Page::factory()->create(['slug' => 'our-process', 'title' => 'Our Process']);
        PageSection::factory()->ofType(SectionType::RichText, ['heading' => 'How we work'])
            ->create(['page_id' => $page->id]);

        $this->get('/our-process')
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia
                ->component('CmsPage')
                ->where('page.title', 'Our Process')
                ->where('page.sections.0.content.heading', 'How we work'));
    }

    public function test_a_draft_page_is_not_reachable(): void
    {
        Page::factory()->draft()->create(['slug' => 'secret-page']);

        $this->get('/secret-page')->assertNotFound();
    }

    public function test_a_system_page_is_not_served_by_the_fallback_route(): void
    {
        Page::factory()->system()->create(['slug' => 'home']);

        $this->get('/home')->assertNotFound();
    }

    public function test_an_unknown_slug_is_a_404(): void
    {
        $this->get('/no-such-page')->assertNotFound();
    }

    public function test_page_meta_falls_back_to_the_site_defaults(): void
    {
        Page::factory()->create([
            'slug' => 'our-process',
            'title' => 'Our Process',
            'meta_title' => null,
            'meta_description' => null,
        ]);

        $this->get('/our-process')->assertInertia(fn ($inertia) => $inertia
            ->where('page.meta.title', 'Our Process')
            ->where('page.meta.description', fn (?string $value) => filled($value)));
    }

    public function test_page_meta_overrides_win_over_the_site_defaults(): void
    {
        Page::factory()->create([
            'slug' => 'our-process',
            'meta_title' => 'Process — custom',
            'meta_description' => 'A custom description.',
            'meta_robots' => 'noindex,follow',
        ]);

        $this->get('/our-process')->assertInertia(fn ($inertia) => $inertia
            ->where('page.meta.title', 'Process — custom')
            ->where('page.meta.description', 'A custom description.')
            ->where('page.meta.robots', 'noindex,follow'));
    }
}
