<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\UserRole;
use App\Models\Project;
use App\Models\User;
use App\Services\PublicAsset;
use Database\Seeders\ProjectSeeder;
use Database\Seeders\UiuxShowcaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Tests\TestCase;

class UiuxShowcaseTest extends TestCase
{
    use RefreshDatabase;

    /** Public folder, relative to public_path(), the exports are written to during a test. */
    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([ProjectSeeder::class, UiuxShowcaseSeeder::class]);

        $this->directory = 'testing-uiux-'.Str::random(8);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory(public_path($this->directory));

        parent::tearDown();
    }

    public function test_the_six_showcase_projects_are_cms_projects_in_the_uiux_portfolio(): void
    {
        $showcase = Project::query()->showcase()->orderBy('sort_order')->get();

        $this->assertSame(
            ['sailor-digital', 'adlbl', 'microters', 'city-online', 'juite-for-good', 'amco'],
            $showcase->pluck('slug')->all(),
        );
        $this->assertTrue($showcase->every(fn (Project $project): bool => $project->workGroup() === 'uiux'
            && $project->status === ContentStatus::Published
            && $project->featured));
    }

    public function test_the_uiux_portfolio_previews_the_six_showcase_projects(): void
    {
        $this->get('/work/portfolio/uiux')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Work/Portfolio')
                ->where('group.slug', 'uiux')
                ->where('projects', fn ($projects) => collect($projects)->pluck('slug')->intersect(['sailor-digital', 'adlbl'])->isEmpty())
                ->where('showcase', fn ($projects) => collect($projects)->pluck('slug')->all() === [
                    'sailor-digital',
                    'adlbl',
                    'microters',
                    'city-online',
                    'juite-for-good',
                    'amco',
                ]));
    }

    public function test_the_branding_portfolio_has_no_showcase(): void
    {
        $this->get('/work/portfolio/branding')
            ->assertInertia(fn ($page) => $page
                ->component('Work/Portfolio')
                ->where('showcase', null));
    }

    public function test_each_project_has_its_own_printer_page_with_only_its_pages(): void
    {
        $this->screens('microters', ['10-contact-us.png' => [144, 90], '2-about.png' => [144, 320], '1-home.png' => [144, 500]], ['cover.png' => [160, 100]], order: ['1-home.png', '2-about.png', '10-contact-us.png']);
        $this->screens('amco', ['01-home.png' => [144, 400]]);

        $this->get('/work/portfolio/uiux/microters')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Work/UiuxProject')
                ->where('project.slug', 'microters')
                ->where('project.name', 'Microters')
                ->has('project.screens', 3)
                ->where('project.screens.0.src', fn (string $src) => str_starts_with($src, PublicAsset::to($this->directory.'/microters/1-home.png').'?v='))
                ->where('project.screens.0.width', 144)
                ->where('project.screens.0.height', 500)
                ->where('project.screens.0.label', 'Home')
                ->where('project.screens.0.alt', 'Microters Home page design')
                ->where('project.screens.1.label', 'About')
                ->where('project.screens.2.label', 'Contact Us')
                ->where('project.cover.src', fn (string $src) => str_contains($src, '/cover.png')));
    }

    public function test_the_our_work_menu_previews_the_six_showcase_projects(): void
    {
        $this->screens('microters', ['01-home.png' => [144, 400]]);

        $this->get('/work')
            ->assertInertia(fn ($page) => $page
                ->where('workGroups.1.slug', 'uiux')
                ->where('workGroups.1.items', function ($projects): bool {
                    $microters = $projects->firstWhere('slug', 'microters');

                    return $projects->count() === 10
                        && $microters['name'] === 'Microters'
                        && str_contains($microters['image'], '/microters/01-home.png')
                        && $microters['href'] === '/work/portfolio/uiux?project=microters';
                }));
    }

    public function test_admin_managed_uiux_projects_are_kept_alongside_showcase_projects(): void
    {
        $project = Project::factory()->create([
            'slug' => 'admin-managed-uiux',
            'title' => 'Admin Managed UI/UX',
            'work_group' => 'uiux',
            'status' => 'published',
            'sort_order' => -1,
        ]);

        $this->get('/work')
            ->assertInertia(fn ($page) => $page
                ->has('workGroups.1.items', 11)
                ->where('workGroups.1.items.0.slug', $project->slug)
                ->where('workGroups.1.items.0.name', $project->title)
                ->where('workGroups.1.items.0.href', '/work/'.$project->slug));

        $this->get('/work/portfolio/uiux')
            ->assertInertia(fn ($page) => $page
                ->where('projects.0.slug', $project->slug)
                ->has('showcase', 6));
    }

    public function test_a_project_page_carries_its_summary_and_what_marketorr_worked_on(): void
    {
        $this->get('/work/portfolio/uiux/city-online')
            ->assertInertia(fn ($page) => $page
                ->where('project.discipline', 'Website UI/UX Design')
                ->where('project.summary', fn (string $summary) => str_contains($summary, 'internet service provider'))
                ->where('project.services', fn ($services) => collect($services)->contains('UI/UX Design')));
    }

    public function test_an_unknown_uiux_project_is_not_found(): void
    {
        $this->get('/work/portfolio/uiux/not-a-project')->assertNotFound();
    }

    public function test_a_showcase_project_has_no_case_study_page_and_stays_out_of_the_sitemap(): void
    {
        $this->get('/work/sailor-digital')->assertNotFound();
        $this->get('/sitemap.xml')->assertOk()->assertDontSee('/work/sailor-digital', false);
    }

    public function test_a_hidden_showcase_project_disappears_everywhere(): void
    {
        Project::query()->where('slug', 'amco')->update(['status' => ContentStatus::Draft]);

        $this->get('/work/portfolio/uiux/amco')->assertNotFound();
        $this->get('/work/portfolio/uiux')
            ->assertInertia(fn ($page) => $page->where('showcase', fn ($projects) => ! collect($projects)->contains('slug', 'amco')));
    }

    public function test_only_featured_showcase_projects_appear_on_the_home_page(): void
    {
        Project::query()->where('slug', 'sailor-digital')->update(['featured' => false]);

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->where('uiuxShowcase', fn ($sheets) => ! collect($sheets)->contains('slug', 'sailor-digital'))
                ->where('featuredProjects', fn ($projects) => ! collect($projects)->contains('slug', 'adlbl')));
    }

    public function test_page_labels_come_from_alt_text_or_else_the_file_name(): void
    {
        $this->screens('sailor-digital', ['01-ui-ux-service.png' => [100, 100], '02-get-a-proposal.png' => [100, 100], '03-smart-campaign-ai-analysis.png' => [100, 100]]);
        $this->setAlt('sailor-digital', 0, 'Services Overview');

        $this->get('/work/portfolio/uiux/sailor-digital')
            ->assertInertia(fn ($page) => $page
                ->where('project.screens.0.label', 'Services Overview')
                ->where('project.screens.0.alt', 'Sailor Digital Services Overview page design')
                ->where('project.screens.1.label', 'Get a Proposal')
                ->where('project.screens.2.label', 'Smart Campaign AI Analysis'));
    }

    public function test_hidden_screens_are_left_out(): void
    {
        $this->screens('adlbl', ['01-dashboard.png' => [144, 250], '02-team.png' => [144, 250]]);
        $project = Project::query()->where('slug', 'adlbl')->sole();
        $caseStudy = $project->case_study;
        $caseStudy[0]['images'][0]['hidden'] = true;
        $project->update(['case_study' => $caseStudy]);

        $this->get('/work/portfolio/uiux/adlbl')
            ->assertInertia(fn ($page) => $page
                ->has('project.screens', 1)
                ->where('project.screens.0.label', 'Team'));
    }

    public function test_a_project_without_a_cover_uses_its_first_screen(): void
    {
        $this->screens('amco', ['01-home.png' => [144, 400]]);
        $this->screens('sailor-digital', []);

        $this->get('/work/portfolio/uiux')
            ->assertInertia(fn ($page) => $page
                ->where('showcase.5.slug', 'amco')
                ->where('showcase.5.cover.src', fn (string $src) => str_contains($src, '/amco/01-home.png'))
                ->has('showcase.0.screens', 0)
                ->where('showcase.0.cover', null));
    }

    public function test_screens_use_their_thumbnail_for_previews_when_one_exists(): void
    {
        $this->screens('adlbl', ['01-dashboard.png' => [144, 250], '02-team.png' => [144, 250]]);
        $this->export('adlbl', 'thumbs/01-dashboard.png', 80, 100);

        $this->get('/work/portfolio/uiux/adlbl')
            ->assertInertia(fn ($page) => $page
                ->has('project.screens', 2)
                ->where('project.screens.0.thumb', fn (string $thumb) => str_starts_with($thumb, PublicAsset::to($this->directory.'/adlbl/thumbs/01-dashboard.png').'?v='))
                ->where('project.screens.0.width', 144)
                ->where('project.screens.1.thumb', fn (string $thumb) => str_contains($thumb, '/adlbl/02-team.png?v=')));
    }

    public function test_the_admin_lists_projects_under_their_portfolio_tab(): void
    {
        $admin = User::factory()->create(['role' => UserRole::SuperAdmin]);

        $this->actingAs($admin)
            ->get('/admin/projects')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Projects/Index')
                ->where('projects', function ($projects): bool {
                    $sailor = collect($projects)->firstWhere('slug', 'sailor-digital');

                    return $sailor['portfolio'] === 'uiux'
                        && $sailor['layout'] === 'screens'
                        && $sailor['public_url'] === '/work/portfolio/uiux/sailor-digital'
                        && collect($projects)->where('portfolio', 'branding')->isNotEmpty();
                }));
    }

    public function test_an_admin_edits_a_showcase_project_and_the_portfolio_follows(): void
    {
        $admin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $project = Project::query()->where('slug', 'city-online')->sole();

        $this->actingAs($admin)
            ->put("/admin/projects/{$project->id}", [
                'slug' => 'city-online',
                'title' => 'City Online',
                'client' => '',
                'category_id' => '',
                'year' => '',
                'layout' => 'screens',
                'discipline' => 'Product Design',
                'description' => 'A new summary.',
                'accent' => '#507AF4',
                'image_alt' => 'City Online cover',
                'tags' => ['UI/UX Design'],
                'featured' => true,
                'status' => 'published',
            ])
            ->assertSessionHasNoErrors();

        $this->get('/work/portfolio/uiux/city-online')
            ->assertInertia(fn ($page) => $page
                ->where('project.name', 'City Online')
                ->where('project.discipline', 'Product Design')
                ->where('project.summary', 'A new summary.')
                ->where('project.services', ['UI/UX Design']));
    }

    public function test_an_admin_creates_a_showcase_project_without_a_cover(): void
    {
        $admin = User::factory()->create(['role' => UserRole::SuperAdmin]);

        $this->actingAs($admin)
            ->post('/admin/projects', [
                'slug' => 'new-showcase',
                'title' => 'New Showcase',
                'layout' => 'screens',
                'discipline' => 'Website UI/UX Design',
                'description' => 'Summary.',
                'accent' => '#507AF4',
                'image_alt' => 'New Showcase',
                'tags' => ['UI/UX Design'],
                'featured' => false,
                'status' => 'published',
            ])
            ->assertSessionHasNoErrors();

        $project = Project::query()->where('slug', 'new-showcase')->sole();
        $this->assertSame('uiux', $project->work_group);
        $this->assertTrue($project->isShowcase());
    }

    public function test_a_case_study_project_still_needs_its_client_year_category_and_cover(): void
    {
        $admin = User::factory()->create(['role' => UserRole::SuperAdmin]);

        $this->actingAs($admin)
            ->post('/admin/projects', ['slug' => 'plain', 'title' => 'Plain', 'description' => 'x', 'accent' => '#891FFB', 'image_alt' => 'x', 'tags' => ['x'], 'status' => 'published'])
            ->assertSessionHasErrors(['client', 'year', 'category_id', 'image']);
    }

    public function test_reordering_one_tab_keeps_the_other_tabs_places(): void
    {
        $admin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $brandingSlots = Project::query()->get()->filter(fn (Project $project): bool => $project->workGroup() === 'branding')
            ->mapWithKeys(fn (Project $project): array => [$project->id => $project->sort_order])->all();
        $uiux = Project::query()->showcase()->orderBy('sort_order')->get();
        $slots = $uiux->pluck('sort_order')->all();

        $this->actingAs($admin)
            ->patch('/admin/projects/reorder', ['ids' => $uiux->pluck('id')->reverse()->values()->all()])
            ->assertSessionHas('success');

        $this->assertSame(
            ['amco', 'juite-for-good', 'city-online', 'microters', 'adlbl', 'sailor-digital'],
            Project::query()->showcase()->orderBy('sort_order')->pluck('slug')->all(),
        );
        $this->assertSame($slots, Project::query()->showcase()->orderBy('sort_order')->pluck('sort_order')->all());
        $this->assertSame($brandingSlots, Project::query()->whereKey(array_keys($brandingSlots))->pluck('sort_order', 'id')->all());
    }

    /**
     * Point a showcase project's gallery (and optionally cover) at freshly
     * written PNGs, in the given order, with no alt text.
     *
     * @param  array<string, array{0: int, 1: int}>  $screens
     * @param  array<string, array{0: int, 1: int}>  $cover
     * @param  array<int, string>|null  $order
     */
    private function screens(string $slug, array $screens, array $cover = [], ?array $order = null): void
    {
        foreach ([...$screens, ...$cover] as $name => [$width, $height]) {
            $this->export($slug, $name, $width, $height);
        }

        $images = collect($order ?? array_keys($screens))
            ->map(fn (string $name): array => ['src' => '/'.$this->directory.'/'.$slug.'/'.$name, 'alt' => '', 'hidden' => false, 'wide' => false, 'video' => false])
            ->all();

        Project::query()->where('slug', $slug)->sole()->update([
            'image_path' => $cover === [] ? '' : '/'.$this->directory.'/'.$slug.'/'.array_key_first($cover),
            'case_study' => $images === [] ? null : [['label' => 'Project gallery', 'note' => null, 'images' => $images]],
        ]);
    }

    private function setAlt(string $slug, int $index, string $alt): void
    {
        $project = Project::query()->where('slug', $slug)->sole();
        $caseStudy = $project->case_study;
        $caseStudy[0]['images'][$index]['alt'] = $alt;
        $project->update(['case_study' => $caseStudy]);
    }

    /** Write a real PNG of the given size into a project's export folder. */
    private function export(string $slug, string $name, int $width, int $height): void
    {
        $path = public_path($this->directory.'/'.$slug.'/'.$name);
        File::ensureDirectoryExists(dirname($path));

        $image = imagecreatetruecolor($width, $height);
        imagepng($image, $path, 9);
        imagedestroy($image);
    }
}
