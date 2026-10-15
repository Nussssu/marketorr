<?php

namespace Tests\Feature;

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\User;
use App\Services\UiuxShowcase;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeLandingSectionsTest extends TestCase
{
    use RefreshDatabase;

    private const EXPECTED_ORDER = [
        'hero', 'marquee', 'about', 'services', 'process', 'work', 'recognition', 'contact',
    ];

    private const FULL_ORDER = [
        'hero', 'marquee', 'about', 'services', 'process', 'work', 'uiux_work', 'recognition', 'contact',
    ];

    private const SEEDED_ORDER = [
        'hero', 'about', 'work', 'uiux_work', 'services', 'process', 'recognition', 'contact',
    ];

    public function test_the_migration_slots_the_new_sections_between_their_anchors(): void
    {
        $page = $this->homeWithOriginalSections();

        $this->landingMigration()->up();

        $this->assertSame(self::EXPECTED_ORDER, $this->sectionTypes($page));

        $this->get('/')->assertInertia(fn ($inertia) => $inertia
            ->where('page.sections.4.type', 'process')
            ->where('page.sections.4.content.items.0.stage', 'Idea')
            ->where('page.sections.6.type', 'recognition')
            ->has('page.sections.6.content.items', 11)
            ->where('page.sections', fn ($sections) => ! collect($sections)->pluck('type')->contains('results')));
    }

    public function test_running_the_migration_twice_adds_nothing_more(): void
    {
        $page = $this->homeWithOriginalSections();

        $this->landingMigration()->up();
        $this->landingMigration()->up();

        $this->assertSame(self::EXPECTED_ORDER, $this->sectionTypes($page));
    }

    public function test_a_section_an_editor_already_added_is_kept_as_it_is(): void
    {
        $page = $this->homeWithOriginalSections();
        PageSection::factory()
            ->ofType(SectionType::Process, ['heading' => 'Our own words'])
            ->create(['page_id' => $page->id, 'sort_order' => 99]);

        $this->landingMigration()->up();

        $process = PageSection::query()->where('page_id', $page->id)->where('type', 'process')->sole();
        $this->assertSame('Our own words', $process->content['heading']);
    }

    public function test_the_migration_does_nothing_without_a_home_page(): void
    {
        $this->landingMigration()->up();

        $this->assertDatabaseCount('page_sections', 0);
    }

    public function test_rolling_back_removes_only_the_added_sections(): void
    {
        $page = $this->homeWithOriginalSections();

        $this->landingMigration()->up();
        $this->landingMigration()->down();

        $this->assertSame(
            ['hero', 'marquee', 'about', 'services', 'work', 'contact'],
            $this->sectionTypes($page),
        );
    }

    public function test_the_uiux_migration_places_uiux_work_straight_after_our_work(): void
    {
        $page = $this->homeWithOriginalSections();

        $this->landingMigration()->up();
        $this->uiuxMigration()->up();

        $this->assertSame(self::FULL_ORDER, $this->sectionTypes($page));
    }

    public function test_running_the_uiux_migration_twice_adds_nothing_more(): void
    {
        $page = $this->homeWithOriginalSections();

        $this->uiuxMigration()->up();
        $this->uiuxMigration()->up();

        $this->assertSame(
            ['hero', 'marquee', 'about', 'services', 'work', 'uiux_work', 'contact'],
            $this->sectionTypes($page),
        );
    }

    public function test_rolling_back_the_uiux_migration_removes_only_its_section(): void
    {
        $page = $this->homeWithOriginalSections();

        $this->uiuxMigration()->up();
        $this->uiuxMigration()->down();

        $this->assertSame(
            ['hero', 'marquee', 'about', 'services', 'work', 'contact'],
            $this->sectionTypes($page),
        );
    }

    public function test_a_fresh_seed_builds_the_home_page_in_the_same_order(): void
    {
        $this->seed(PageSeeder::class);

        $this->assertSame(
            self::SEEDED_ORDER,
            $this->sectionTypes(Page::query()->where('slug', 'home')->sole()),
        );
    }

    public function test_the_home_page_sends_one_printed_sheet_per_uiux_project(): void
    {
        $this->get('/')->assertInertia(fn ($inertia) => $inertia
            ->has('uiuxShowcase', 6)
            ->where('uiuxShowcase.0.slug', 'sailor-digital')
            ->where('uiuxShowcase.0.href', '/work/portfolio/uiux/sailor-digital')
            ->has('uiuxShowcase.0.cover.thumb')
            // The sheet is the first page the project's own page prints.
            ->where('uiuxShowcase.0.cover.src', app(UiuxShowcase::class)->find('sailor-digital')['screens'][0]['src']));
    }

    public function test_an_admin_can_save_a_results_section_with_its_rows(): void
    {
        $page = Page::factory()->create();
        $section = PageSection::factory()->ofType(SectionType::Results)->create(['page_id' => $page->id]);
        $rows = [[
            'prefix' => '+',
            'value' => 340,
            'suffix' => '%',
            'label' => 'More qualified leads',
            'context' => 'A redesigned funnel.',
            'url' => '/work/example',
        ]];

        $this->actingAs(User::factory()->create())
            ->put("/admin/pages/{$page->id}/sections/{$section->id}", [
                'type' => SectionType::Results->value,
                'name' => 'Results in numbers',
                'content' => ['heading' => 'Proof', 'items' => $rows],
                'enabled' => true,
            ])
            ->assertRedirect();

        $content = $section->fresh()->content;
        $this->assertSame('Proof', $content['heading']);
        $this->assertSame($rows, $content['items']);
    }

    private function homeWithOriginalSections(): Page
    {
        $page = Page::factory()->system()->create(['slug' => 'home']);

        foreach ([SectionType::Hero, SectionType::Marquee, SectionType::About, SectionType::Services, SectionType::Work, SectionType::Contact] as $order => $type) {
            PageSection::factory()->ofType($type)->create(['page_id' => $page->id, 'sort_order' => $order]);
        }

        return $page;
    }

    private function landingMigration(): Migration
    {
        return require database_path('migrations/2026_09_30_111931_add_landing_story_sections_to_home_page.php');
    }

    private function uiuxMigration(): Migration
    {
        return require database_path('migrations/2026_09_30_112627_add_uiux_work_section_to_home_page.php');
    }

    /**
     * @return array<int, string>
     */
    private function sectionTypes(Page $page): array
    {
        return PageSection::query()
            ->where('page_id', $page->id)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PageSection $section): string => $section->type->value)
            ->all();
    }
}
