<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Service;
use Database\Seeders\ProjectSeeder;
use Database\Seeders\ServiceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class WebRoutesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ServiceSeeder::class);
        $this->seed(ProjectSeeder::class);
    }

    #[DataProvider('staticRoutesProvider')]
    public function test_static_routes_render_successfully(string $route): void
    {
        $this->get($route)->assertStatus(200);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public static function staticRoutesProvider(): array
    {
        return [
            'home' => ['/'],
            'about' => ['/about'],
            'services' => ['/services'],
            'work' => ['/work'],
            'contact' => ['/contact'],
            'privacy' => ['/privacy'],
            'terms' => ['/terms'],
        ];
    }

    public function test_the_seeded_catalogue_matches_the_seeder_definitions(): void
    {
        $this->assertSame(24, Project::query()->count());
        $this->assertSame(7, Project::query()->featured()->count());
        $this->assertSame(12, Service::query()->count());
    }

    public function test_every_seeded_service_is_published_in_a_stable_order(): void
    {
        $services = Service::query()->published()->get();

        $this->assertSame(12, $services->count());
        $this->assertSame(
            range(0, 11),
            $services->pluck('sort_order')->all(),
            'Seeded services should carry sequential sort_order values.',
        );
        $this->assertSame(
            ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
            $services->pluck('index_label')->all(),
        );
        $this->assertSame(
            $services->pluck('slug')->unique()->count(),
            $services->count(),
            'Seeded service slugs should be unique.',
        );

        foreach ($services as $service) {
            $this->assertMatchesRegularExpression('/^#[0-9A-F]{6}$/i', $service->accent);

            if (filled($service->accent_to)) {
                $this->assertMatchesRegularExpression('/^#[0-9A-F]{6}$/i', $service->accent_to);
            }

            $this->assertNotEmpty($service->capabilities);
            $this->assertNotEmpty($service->deliverables);
            $this->assertNotEmpty($service->outcomes);
        }
    }

    public function test_every_published_service_detail_page_renders(): void
    {
        foreach (Service::query()->published()->pluck('slug') as $slug) {
            $this->get("/services/{$slug}")->assertStatus(200);
        }
    }

    public function test_every_published_project_detail_page_renders(): void
    {
        foreach (Project::query()->published()->pluck('slug') as $slug) {
            $this->get("/work/{$slug}")->assertStatus(200);
        }
    }

    public function test_an_unknown_service_slug_returns_404(): void
    {
        $this->get('/services/invalid-nonexistent-service')->assertStatus(404);
    }

    public function test_an_unknown_work_slug_returns_404(): void
    {
        $this->get('/work/invalid-nonexistent-project')->assertStatus(404);
    }

    public function test_draft_content_is_hidden_from_the_public_site(): void
    {
        $project = Project::factory()->draft()->create();
        $service = Service::factory()->draft()->create();

        $this->get("/work/{$project->slug}")->assertStatus(404);
        $this->get("/services/{$service->slug}")->assertStatus(404);
    }

    public function test_the_home_page_receives_featured_projects_and_services_as_props(): void
    {
        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->has('featuredProjects', 7)
                ->has('services', 12)
                ->has('settings.hero.headingLines', 3)
                ->where('featuredProjects', fn ($projects) => $projects->pluck('slug')->all() === [
                    'bangladesh-television-logo-concept',
                    'amanah-global-network',
                    'imperial-jute-b2b-seo',
                    'nature-to-near',
                    'shuddhomart-branding',
                    'virgin-trend',
                    'animateuix-brand-design',
                ]));
    }

    public function test_the_branding_portfolio_uses_the_curated_project_order(): void
    {
        $this->get('/work/portfolio/branding')
            ->assertInertia(fn ($page) => $page
                ->component('Work/Portfolio')
                ->where('projects', fn ($projects) => $projects->pluck('slug')->all() === [
                    'bangladesh-television-logo-concept',
                    'amanah-global-network',
                    'imperial-jute-b2b-seo',
                    'nature-to-near',
                    'shuddhomart-branding',
                    'virgin-trend',
                    'animateuix-brand-design',
                    'un-point-brand-design',
                    'editwing-brand-design',
                    'city-online-brand-design',
                    'go-yara-travel-agency',
                    'dusty-vision',
                    'smilez-logo-design',
                    'sabdita-fashion',
                    'alarabi-fashion-brand-design',
                    'tapmad-media-ads',
                    'charukothon-meta-ads',
                    'custom-illustration',
                    'carpet-cleaning-illustration',
                    'infographic-line-illustration',
                ]));
    }

    public function test_the_work_index_offers_both_portfolios(): void
    {
        $this->get('/work')
            ->assertInertia(fn ($page) => $page
                ->component('Work/Index')
                ->has('groups', 2)
                ->where('groups.0.slug', 'branding')
                ->where('groups.1.slug', 'uiux'));
    }

    /**
     * Projects are reached through a portfolio rather than a flat index, so the
     * guarantee is that the two portfolios together still account for every
     * published project, with none listed twice.
     */
    public function test_the_portfolios_between_them_list_every_published_project(): void
    {
        $slugs = [];

        foreach (['branding', 'uiux'] as $group) {
            $this->get("/work/portfolio/{$group}")
                ->assertInertia(function ($page) use (&$slugs, $group) {
                    $page->component('Work/Portfolio')->where('group.slug', $group);
                    $slugs = array_merge($slugs, array_column($page->toArray()['props']['projects'], 'slug'));
                });
        }

        $published = Project::query()->published()->pluck('slug')->all();

        sort($slugs);
        sort($published);

        $this->assertSame($published, $slugs);
        $this->assertSame(count($slugs), count(array_unique($slugs)));
    }

    public function test_an_unknown_portfolio_is_not_found(): void
    {
        $this->get('/work/portfolio/nope')->assertNotFound();
    }
}
