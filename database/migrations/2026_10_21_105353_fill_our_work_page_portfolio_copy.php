<?php

use App\Enums\SectionType;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Move the Our Work page's remaining fixed copy (the two portfolio titles,
 * the project count and the "Open portfolio" button) into its Our Work
 * section, so the whole page is edited under Admin > Pages > Our Work.
 *
 * Only the Our Work page's section is filled, with the exact copy it showed
 * before, and only fields that are still empty, so running this twice is
 * safe and nothing an editor wrote is replaced.
 */
return new class extends Migration
{
    /** The fields this migration adds. */
    private const FIELDS = ['brandingTitle', 'uiuxTitle', 'countLabel', 'countLabelOne', 'openLabel'];

    public function up(): void
    {
        $defaults = array_intersect_key(PageSeeder::workPageContent(), array_flip(self::FIELDS));

        PageSection::query()
            ->with('page')
            ->where('type', SectionType::Work->value)
            ->get()
            ->filter(fn (PageSection $section): bool => $section->page?->slug === 'work')
            ->each(function (PageSection $section) use ($defaults): void {
                $content = $section->content ?? [];

                foreach ($defaults as $key => $value) {
                    if (blank($content[$key] ?? null)) {
                        $content[$key] = $value;
                    }
                }

                $section->update(['content' => $content]);
            });
    }

    public function down(): void
    {
        PageSection::query()
            ->where('type', SectionType::Work->value)
            ->get()
            ->each(fn (PageSection $section) => $section->update([
                'content' => array_diff_key($section->content ?? [], array_flip(self::FIELDS)),
            ]));
    }
};
