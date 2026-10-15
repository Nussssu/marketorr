<?php

use App\Enums\SectionType;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Move the Contact section's copy out of the component and into its section
 * content, so every heading, form text, FAQ and closing line is edited in the
 * admin.
 *
 * Each Contact section (the landing page's and the Contact page's) gets the
 * exact copy it showed before for every field that is still empty. A field an
 * editor has already filled in is left as it is, so running this twice is
 * safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        $defaults = PageSeeder::contactContent();

        PageSection::query()
            ->where('type', SectionType::Contact->value)
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
            ->where('type', SectionType::Contact->value)
            ->get()
            ->each(function (PageSection $section): void {
                $content = $section->content ?? [];

                $section->update(['content' => [
                    'heading' => $content['heading'] ?? 'Contact',
                    'intro' => $content['intro'] ?? '',
                ]]);
            });
    }
};
