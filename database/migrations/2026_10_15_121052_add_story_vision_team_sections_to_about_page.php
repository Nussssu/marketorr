<?php

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Move the About page's story, vision/mission and leadership sections out of
 * the page component and into page sections an editor can change.
 *
 * PageSeeder covers fresh seeds; this carries the same sections, with the
 * exact copy and images the page showed before, onto an About page seeded
 * without them. They go in right after the About intro, in their original
 * order, and every section is then renumbered. A section of one of these
 * types that already exists is left alone, so running this twice is safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        $page = Page::query()->where('slug', 'about')->first();

        if ($page === null) {
            return;
        }

        $sections = PageSection::query()
            ->where('page_id', $page->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $additions = [
            [SectionType::Story, 'Our story', PageSeeder::aboutStoryContent()],
            [SectionType::MissionVision, 'Vision and mission', PageSeeder::aboutMissionVisionContent()],
            [SectionType::Team, 'Leadership and awards', PageSeeder::aboutTeamContent()],
        ];

        $anchorIndex = $sections->search(fn (PageSection $section): bool => $section->type === SectionType::About);
        $position = $anchorIndex === false ? $sections->count() : $anchorIndex + 1;

        foreach ($additions as [$type, $name, $content]) {
            if ($sections->contains(fn (PageSection $section): bool => $section->type === $type)) {
                continue;
            }

            $section = PageSection::query()->create([
                'page_id' => $page->id,
                'type' => $type,
                'name' => $name,
                'content' => $content,
                'enabled' => true,
                'sort_order' => 0,
            ]);

            $sections->splice($position++, 0, [$section]);
        }

        $sections->values()->each(function (PageSection $section, int $index): void {
            if ($section->sort_order !== $index) {
                $section->update(['sort_order' => $index]);
            }
        });
    }

    public function down(): void
    {
        $page = Page::query()->where('slug', 'about')->first();

        if ($page === null) {
            return;
        }

        PageSection::query()
            ->where('page_id', $page->id)
            ->whereIn('type', [SectionType::Story->value, SectionType::MissionVision->value, SectionType::Team->value])
            ->delete();
    }
};
