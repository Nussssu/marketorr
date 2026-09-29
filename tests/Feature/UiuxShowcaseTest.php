<?php

namespace Tests\Feature;

use Database\Seeders\ProjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Tests\TestCase;

class UiuxShowcaseTest extends TestCase
{
    use RefreshDatabase;

    /** Public folder, relative to public_path(), the exports are read from during a test. */
    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ProjectSeeder::class);

        $this->directory = 'testing-uiux-'.Str::random(8);
        config(['uiux_showcase.directory' => $this->directory]);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory(public_path($this->directory));

        parent::tearDown();
    }

    public function test_the_uiux_portfolio_previews_the_six_showcase_projects(): void
    {
        $this->get('/work/portfolio/uiux')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Work/Portfolio')
                ->where('group.slug', 'uiux')
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
        $this->export('microters', '10-contact-us.png', 144, 90);
        $this->export('microters', '2-about.png', 144, 320);
        $this->export('microters', '1-home.png', 144, 500);
        $this->export('microters', 'cover.png', 160, 100);
        $this->export('amco', '01-home.png', 144, 400);
        File::put(public_path($this->directory.'/microters/notes.txt'), 'not a screen');

        $this->get('/work/portfolio/uiux/microters')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Work/UiuxProject')
                ->where('project.slug', 'microters')
                ->where('project.name', 'Microters')
                ->has('project.screens', 3)
                ->where('project.screens.0.src', fn (string $src) => str_starts_with($src, '/'.$this->directory.'/microters/1-home.png?v='))
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
        $this->export('microters', '01-home.png', 144, 400);

        $this->get('/work')
            ->assertInertia(fn ($page) => $page
                ->where('workGroups.1.slug', 'uiux')
                ->has('workGroups.1.items', 6)
                ->where('workGroups.1.items.2.slug', 'microters')
                ->where('workGroups.1.items.2.name', 'Microters')
                ->where('workGroups.1.items.2.image', fn (string $image) => str_contains($image, '/microters/01-home.png'))
                ->where('workGroups.1.items.2.href', '/work/portfolio/uiux?project=microters')
                ->where('workGroups.1.items.0.image', null));
    }

    public function test_a_project_page_carries_its_summary_and_what_marketorr_worked_on(): void
    {
        $this->get('/work/portfolio/uiux/city-online')
            ->assertInertia(fn ($page) => $page
                ->where('project.summary', fn (string $summary) => str_contains($summary, 'internet service provider'))
                ->where('project.services', fn ($services) => collect($services)->contains('UI/UX Design')));
    }

    public function test_an_unknown_uiux_project_is_not_found(): void
    {
        $this->get('/work/portfolio/uiux/not-a-project')->assertNotFound();
    }

    public function test_page_labels_keep_acronyms_and_minor_words(): void
    {
        $this->export('sailor-digital', '01-ui-ux-service.png', 100, 100);
        $this->export('sailor-digital', '02-get-a-proposal.png', 100, 100);
        $this->export('sailor-digital', '03-smart-campaign-ai-analysis.png', 100, 100);

        $this->get('/work/portfolio/uiux/sailor-digital')
            ->assertInertia(fn ($page) => $page
                ->where('project.screens.0.label', 'UI/UX Service')
                ->where('project.screens.1.label', 'Get a Proposal')
                ->where('project.screens.2.label', 'Smart Campaign AI Analysis'));
    }

    public function test_a_project_without_a_cover_uses_its_first_screen(): void
    {
        $this->export('amco', '01-home.png', 144, 400);

        $this->get('/work/portfolio/uiux')
            ->assertInertia(fn ($page) => $page
                ->where('showcase.5.slug', 'amco')
                ->where('showcase.5.cover.src', fn (string $src) => str_contains($src, '/amco/01-home.png'))
                ->has('showcase.0.screens', 0)
                ->where('showcase.0.cover', null));
    }

    public function test_screens_use_their_thumbnail_for_previews_when_one_exists(): void
    {
        $this->export('adlbl', '01-dashboard.png', 144, 250);
        $this->export('adlbl', 'thumbs/01-dashboard.png', 80, 100);
        $this->export('adlbl', '02-team.png', 144, 250);

        $this->get('/work/portfolio/uiux/adlbl')
            ->assertInertia(fn ($page) => $page
                ->has('project.screens', 2)
                ->where('project.screens.0.thumb', fn (string $thumb) => str_starts_with($thumb, '/'.$this->directory.'/adlbl/thumbs/01-dashboard.png?v='))
                ->where('project.screens.0.width', 144)
                ->where('project.screens.1.thumb', fn (string $thumb) => str_contains($thumb, '/adlbl/02-team.png?v=')));
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
