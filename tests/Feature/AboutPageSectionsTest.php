<?php

namespace Tests\Feature;

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\User;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AboutPageSectionsTest extends TestCase
{
    use RefreshDatabase;

    private const ORDER = ['about', 'story', 'mission_vision', 'team'];

    private const SEEDED_ORDER = ['about', 'story', 'mission_vision', 'team', 'awards'];

    public function test_the_migration_adds_the_sections_after_the_about_intro_with_the_original_copy(): void
    {
        $page = $this->aboutWithIntroOnly();

        $this->migration()->up();

        $this->assertSame(self::ORDER, $this->sectionTypes($page));

        $this->get('/about')->assertInertia(fn ($inertia) => $inertia
            ->component('About')
            ->where('page.sections.1.content.heading', 'Born to cut noise')
            ->where('page.sections.1.content.quote', 'Just Results.')
            ->has('page.sections.1.content.items', 3)
            ->where('page.sections.2.content.items.0.title', 'Our Vision')
            ->where('page.sections.2.content.items.1.image', '/images/about/mission-cartoon.png')
            ->where('page.sections.3.content.name', 'Md Kamrul Hasan Naim')
            ->has('page.sections.3.content.awards', 11));
    }

    public function test_running_the_migration_twice_adds_nothing_more(): void
    {
        $page = $this->aboutWithIntroOnly();

        $this->migration()->up();
        $this->migration()->up();

        $this->assertSame(self::ORDER, $this->sectionTypes($page));
    }

    public function test_a_section_an_editor_already_changed_is_kept_as_it_is(): void
    {
        $page = $this->aboutWithIntroOnly();
        PageSection::factory()
            ->ofType(SectionType::Team, ['heading' => 'Our own words'])
            ->create(['page_id' => $page->id, 'sort_order' => 1]);

        $this->migration()->up();

        $team = PageSection::query()->where('page_id', $page->id)->where('type', 'team')->sole();
        $this->assertSame('Our own words', $team->content['heading']);
    }

    public function test_rolling_back_leaves_only_the_about_intro(): void
    {
        $page = $this->aboutWithIntroOnly();

        $this->migration()->up();
        $this->migration()->down();

        $this->assertSame(['about'], $this->sectionTypes($page));
    }

    public function test_a_fresh_seed_builds_the_about_page_in_the_same_order(): void
    {
        $this->seed(PageSeeder::class);

        $this->assertSame(self::SEEDED_ORDER, $this->sectionTypes(Page::query()->where('slug', 'about')->sole()));
    }

    public function test_an_admin_can_change_the_leader_and_the_award_logos(): void
    {
        $page = Page::factory()->create();
        $team = PageSection::factory()->ofType(SectionType::Team)->create(['page_id' => $page->id]);
        $awardsSection = PageSection::factory()->ofType(SectionType::Awards)->create(['page_id' => $page->id]);
        $awards = [['name' => 'GoodFirms', 'detail' => 'Agency recognition', 'image' => '/storage/media/goodfirms.png']];

        $this->actingAs(User::factory()->create())
            ->put("/admin/pages/{$page->id}/sections/{$team->id}", [
                'type' => SectionType::Team->value,
                'name' => 'Leadership',
                'content' => [
                    'heading' => 'Minds behind the growth',
                    'name' => 'A New Leader',
                    'image' => '/storage/media/leader.jpg',
                ],
                'enabled' => true,
            ])
            ->assertRedirect();

        $this->actingAs(User::factory()->create())
            ->put("/admin/pages/{$page->id}/sections/{$awardsSection->id}", [
                'type' => SectionType::Awards->value,
                'name' => 'Awards and recognition',
                'content' => ['heading' => 'Recognition', 'items' => $awards],
                'enabled' => true,
            ])
            ->assertRedirect();

        $teamContent = $team->fresh()->content;
        $this->assertSame('A New Leader', $teamContent['name']);
        $this->assertSame('/storage/media/leader.jpg', $teamContent['image']);
        $this->assertSame($awards, $awardsSection->fresh()->content['items']);
    }

    private function aboutWithIntroOnly(): Page
    {
        $page = Page::factory()->system()->create(['slug' => 'about']);
        PageSection::factory()->ofType(SectionType::About)->create(['page_id' => $page->id, 'sort_order' => 0]);

        return $page;
    }

    private function migration(): Migration
    {
        return require database_path('migrations/2026_10_15_121052_add_story_vision_team_sections_to_about_page.php');
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
