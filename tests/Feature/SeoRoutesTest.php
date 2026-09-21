<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\Project;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_robots_txt_is_served_with_a_generated_default(): void
    {
        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('Disallow: /admin')
            ->assertSee('sitemap.xml');
    }

    public function test_a_custom_robots_txt_replaces_the_default(): void
    {
        Setting::current()->update(['robots_txt' => "User-agent: *\nDisallow: /"]);
        Setting::forgetCurrent();

        $this->get('/robots.txt')
            ->assertOk()
            ->assertSee('Disallow: /')
            ->assertDontSee('Disallow: /admin');
    }

    public function test_the_sitemap_lists_published_pages_and_projects(): void
    {
        Page::factory()->create(['slug' => 'our-process']);
        $project = Project::factory()->create();

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('/our-process')
            ->assertSee("/work/{$project->slug}");
    }

    public function test_the_sitemap_omits_draft_pages(): void
    {
        Page::factory()->draft()->create(['slug' => 'secret-page']);

        $this->get('/sitemap.xml')->assertDontSee('secret-page');
    }

    public function test_the_sitemap_omits_noindex_pages(): void
    {
        Page::factory()->create(['slug' => 'hidden-page', 'meta_robots' => 'noindex,follow']);

        $this->get('/sitemap.xml')->assertDontSee('hidden-page');
    }

    public function test_the_sitemap_omits_draft_projects(): void
    {
        $project = Project::factory()->draft()->create();

        $this->get('/sitemap.xml')->assertDontSee($project->slug);
    }

    public function test_the_sitemap_can_be_switched_off(): void
    {
        Setting::current()->update(['sitemap_enabled' => false]);
        Setting::forgetCurrent();

        $this->get('/sitemap.xml')->assertNotFound();
    }
}
