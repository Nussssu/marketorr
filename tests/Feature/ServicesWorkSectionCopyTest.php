<?php

namespace Tests\Feature;

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicesWorkSectionCopyTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_migration_gives_each_page_its_own_work_copy(): void
    {
        $home = Page::factory()->system()->create(['slug' => 'home']);
        $work = Page::factory()->system()->create(['slug' => 'work']);
        $landingWork = PageSection::factory()->ofType(SectionType::Work, ['heading' => 'Our Work', 'intro' => ''])->create(['page_id' => $home->id]);
        $workPage = PageSection::factory()->ofType(SectionType::Work, ['heading' => 'Our Work', 'intro' => ''])->create(['page_id' => $work->id]);

        $this->migration()->up();

        $this->assertSame(['Brands that', 'create impact.'], $landingWork->fresh()->content['titleLines']);
        $this->assertSame('Work', $workPage->fresh()->content['title']);
        $this->assertSame('{projects} projects across {practices} practices. Choose one to step inside.', $workPage->fresh()->content['intro']);
    }

    public function test_the_services_closing_panel_copy_is_filled_and_editor_copy_is_kept(): void
    {
        $section = PageSection::factory()->ofType(SectionType::Services, ['heading' => 'What we do', 'intro' => ''])->create();

        $this->migration()->up();
        $this->migration()->up();

        $content = $section->fresh()->content;
        $this->assertSame('What we do', $content['heading']);
        $this->assertSame('Have a project in mind?', $content['ctaLabel']);
        $this->assertSame('/contact', $content['ctaButtonUrl']);
        $this->assertSame(['Two disciplines.', 'One clear outcome.'], $content['titleLines']);
    }

    public function test_the_uiux_work_section_gets_its_heading_and_link_label(): void
    {
        $section = PageSection::factory()->ofType(SectionType::UiuxWork, ['heading' => 'UI/UX Work', 'intro' => ''])->create();

        $this->migration()->up();

        $this->assertSame('Full UI/UX portfolio →', $section->fresh()->content['linkLabel']);
    }

    private function migration(): Migration
    {
        return require database_path('migrations/2026_10_15_122256_fill_services_and_work_section_copy.php');
    }
}
