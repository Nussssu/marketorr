<?php

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Database\Migrations\Migration;

/**
 * Split the landing page's Our Work in two: the existing carousel keeps the
 * branding projects, and a UI/UX Work section follows it with the printer.
 *
 * PageSeeder covers fresh seeds; this places the new section straight after
 * Our Work on a home page seeded before it existed, and renumbers the rest.
 * A home page that already has one is left alone.
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

        if ($sections->contains(fn (PageSection $section): bool => $section->type === SectionType::UiuxWork)) {
            return;
        }

        $section = PageSection::query()->create([
            'page_id' => $page->id,
            'type' => SectionType::UiuxWork,
            'name' => 'UI/UX work',
            'content' => ['heading' => 'UI/UX Work', 'intro' => ''],
            'enabled' => true,
            'sort_order' => 0,
        ]);

        $workIndex = $sections->search(fn (PageSection $existing): bool => $existing->type === SectionType::Work);
        $sections->splice($workIndex === false ? $sections->count() : $workIndex + 1, 0, [$section]);

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
            ->where('type', SectionType::UiuxWork->value)
            ->delete();
    }
};
