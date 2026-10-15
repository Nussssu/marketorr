<?php

use App\Enums\SectionType;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Move the About intro's label, heading, tagline and link out of the
 * component and into section content, so they are edited in the admin.
 *
 * Every About section gets the exact copy it showed before for each field
 * that is still empty. A field an editor has already filled in is left as it
 * is, so running this twice is safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        $defaults = PageSeeder::aboutIntroContent();

        PageSection::query()
            ->where('type', SectionType::About->value)
            ->get()
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
            ->where('type', SectionType::About->value)
            ->get()
            ->each(function (PageSection $section): void {
                $content = $section->content ?? [];

                $section->update(['content' => [
                    'heading' => $content['heading'] ?? 'About',
                    'text' => $content['text'] ?? '',
                    'metrics' => $content['metrics'] ?? [],
                ]]);
            });
    }
};
