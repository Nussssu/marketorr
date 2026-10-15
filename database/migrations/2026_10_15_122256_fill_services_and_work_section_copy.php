<?php

use App\Enums\SectionType;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Move the Services, Our Work and UI/UX Work headings, intros, links and the
 * Services page's closing panel out of their components and into section
 * content, so all of it is edited in the admin.
 *
 * Each section gets the exact copy it showed before for every field that is
 * still empty. The Our Work section differs by page: the landing page shows a
 * two-line heading, the Our Work page a single big title and live counts. A
 * field an editor has already filled in is left as it is, so running this
 * twice is safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        PageSection::query()
            ->with('page')
            ->whereIn('type', [SectionType::Services->value, SectionType::Work->value, SectionType::UiuxWork->value])
            ->get()
            ->each(function (PageSection $section): void {
                $defaults = match ($section->type) {
                    SectionType::Services => PageSeeder::servicesContent(),
                    SectionType::UiuxWork => PageSeeder::uiuxWorkContent(),
                    default => $section->page?->slug === 'work'
                        ? PageSeeder::workPageContent()
                        : PageSeeder::homeWorkContent(),
                };

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
            ->whereIn('type', [SectionType::Services->value, SectionType::Work->value, SectionType::UiuxWork->value])
            ->get()
            ->each(function (PageSection $section): void {
                $content = $section->content ?? [];

                $section->update(['content' => [
                    'heading' => $content['heading'] ?? '',
                    'intro' => '',
                ]]);
            });
    }
};
