<?php

namespace Tests\Feature;

use App\Enums\SectionType;
use App\Models\PageSection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AboutIntroSectionCopyTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_migration_fills_the_about_intro_copy_and_keeps_editor_copy(): void
    {
        $section = PageSection::factory()
            ->ofType(SectionType::About, ['heading' => 'Who we are', 'text' => 'Our own words', 'metrics' => []])
            ->create();

        $this->migration()->up();
        $this->migration()->up();

        $content = $section->fresh()->content;
        $this->assertSame('Who we are', $content['heading']);
        $this->assertSame('Our own words', $content['text']);
        $this->assertSame(['We build brands', 'that move people.'], $content['titleLines']);
        $this->assertSame(['Creative thinking.', 'Digital execution.', 'Measurable results.'], $content['tagline']);
        $this->assertSame('/services', $content['linkUrl']);
    }

    private function migration(): Migration
    {
        $file = collect(glob(database_path('migrations/*_fill_about_intro_section_copy.php')))->sole();

        return require $file;
    }
}
