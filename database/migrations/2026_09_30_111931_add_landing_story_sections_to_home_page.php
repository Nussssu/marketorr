<?php

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Add the Process and Recognition sections to the landing page.
 *
 * PageSeeder covers fresh seeds; this carries the same sections onto a home
 * page seeded before they existed. Each one is placed after its anchor -
 * Process after Services, Recognition after Work -
 * and every section is then renumbered so the order is exact. A section an
 * editor has already added is left alone, so running this twice is safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        $page = Page::query()->where('slug', 'home')->first();

        if ($page === null) {
            return;
        }

        $sections = PageSection::query()
            ->where('page_id', $page->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $additions = [
            [SectionType::Process, 'How we work', PageSeeder::processContent(), SectionType::Services],
            [SectionType::Recognition, 'Featured in', PageSeeder::recognitionContent(), SectionType::Work],
        ];

        foreach ($additions as [$type, $name, $content, $anchor]) {
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

            $anchorIndex = $sections->search(fn (PageSection $existing): bool => $existing->type === $anchor);
            $position = $anchorIndex === false ? $sections->count() : $anchorIndex + 1;
            $sections->splice($position, 0, [$section]);
        }

        $sections->values()->each(function (PageSection $section, int $index): void {
            if ($section->sort_order !== $index) {
                $section->update(['sort_order' => $index]);
            }
        });
    }

    public function down(): void
    {
        $page = Page::query()->where('slug', 'home')->first();

        if ($page === null) {
            return;
        }

        PageSection::query()
            ->where('page_id', $page->id)
            ->whereIn('type', [SectionType::Process->value, SectionType::Recognition->value])
            ->delete();
    }
};
