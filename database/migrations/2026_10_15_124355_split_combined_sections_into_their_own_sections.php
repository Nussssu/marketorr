<?php

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Give every block a visitor sees as separate its own section, so each one can
 * be shown, hidden and edited on its own in the admin:
 *
 * - Contact page: Contact, then FAQ, then Let's connect.
 * - About page: Leadership, then Awards & Recognition.
 * - Services page: Services, then the closing panel.
 *
 * Each new section is built from the copy the combined section holds now, so
 * anything an editor already changed carries over, and goes straight after
 * the section it came out of. The moved fields are then removed from the
 * original. A page that already has the new section is left alone, so running
 * this twice is safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->split('contact', SectionType::Contact, [
            [SectionType::ContactFaq, 'FAQs', fn (array $content): array => PageSeeder::contactFaqContent($content)],
            [SectionType::ContactConnect, 'Let’s connect', fn (array $content): array => PageSeeder::contactConnectContent($content)],
        ]);

        $this->split('about', SectionType::Team, [
            [SectionType::Awards, 'Awards and recognition', fn (array $content): array => PageSeeder::aboutAwardsContent($content)],
        ]);

        $this->split('services', SectionType::Services, [
            [SectionType::ClosingPanel, 'Closing panel', fn (array $content): array => PageSeeder::closingPanelContent($content)],
        ]);

        foreach (PageSeeder::MOVED_KEYS as $type => $keys) {
            PageSection::query()
                ->where('type', $type)
                ->get()
                ->each(fn (PageSection $section) => $section->update([
                    'content' => array_diff_key($section->content ?? [], array_flip($keys)),
                ]));
        }

        PageSection::query()
            ->where('type', SectionType::Team->value)
            ->where('name', 'Leadership and awards')
            ->update(['name' => 'Leadership']);
    }

    public function down(): void
    {
        PageSection::query()
            ->whereIn('type', [
                SectionType::ContactFaq->value,
                SectionType::ContactConnect->value,
                SectionType::Awards->value,
                SectionType::ClosingPanel->value,
            ])
            ->delete();
    }

    /**
     * @param  array<int, array{0: SectionType, 1: string, 2: callable(array<string, mixed>): array<string, mixed>}>  $additions
     */
    private function split(string $slug, SectionType $source, array $additions): void
    {
        $page = Page::query()->where('slug', $slug)->first();

        if ($page === null) {
            return;
        }

        $sections = PageSection::query()
            ->where('page_id', $page->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $anchorIndex = $sections->search(fn (PageSection $section): bool => $section->type === $source);

        if ($anchorIndex === false) {
            return;
        }

        $content = $sections[$anchorIndex]->content ?? [];
        $position = $anchorIndex + 1;

        foreach ($additions as [$type, $name, $build]) {
            if ($sections->contains(fn (PageSection $section): bool => $section->type === $type)) {
                continue;
            }

            $section = PageSection::query()->create([
                'page_id' => $page->id,
                'type' => $type,
                'name' => $name,
                'content' => $build($content),
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
};
