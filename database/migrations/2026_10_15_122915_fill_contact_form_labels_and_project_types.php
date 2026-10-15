<?php

use App\Enums\SectionType;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Move the Contact form's field labels and placeholders, the contact detail
 * labels, the map link, the sending and send-another labels, and the project
 * type options out of the component and into section content.
 *
 * Every Contact section gets the exact copy it showed before for each field
 * that is still empty. A field an editor has already filled in is left as it
 * is, so running this twice is safe.
 */
return new class extends Migration
{
    private const KEYS = [
        'emailTileLabel', 'phoneTileLabel', 'locationTileLabel', 'mapLinkLabel',
        'nameLabel', 'namePlaceholder', 'emailLabel', 'emailPlaceholder',
        'phoneLabel', 'phonePlaceholder', 'companyLabel', 'companyPlaceholder',
        'budgetLabel', 'budgetPlaceholder', 'typeLabel', 'typePlaceholder', 'projectTypes',
        'messageLabel', 'messagePlaceholder', 'sendingLabel', 'sendAnotherLabel',
    ];

    public function up(): void
    {
        $defaults = array_intersect_key(PageSeeder::contactContent(), array_flip(self::KEYS));

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
                $section->update(['content' => array_diff_key($section->content ?? [], array_flip(self::KEYS))]);
            });
    }
};
