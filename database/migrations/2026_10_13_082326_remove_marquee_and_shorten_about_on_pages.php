<?php

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

/**
 * Client feedback on the landing page: drop the Idea / Experience / Result
 * marquee strip, move Our Work and UI/UX Work up to follow About, and swap
 * the long About narrative for the shorter one.
 *
 * PageSeeder and the Setting defaults cover fresh seeds; this carries the
 * same changes onto rows seeded before them. About text an editor has
 * already rewritten is left alone.
 */
return new class extends Migration
{
    private const OLD_ABOUT_TEXT = 'Marketorr is a creative and digital agency focused on helping ambitious brands build stronger identities, better digital experiences, and measurable business growth. We combine strategy, branding, UI/UX, technology, content, and performance thinking to create work that looks exceptional and performs even better.';

    private const NEW_ABOUT_TEXT = 'Marketorr is a creative and digital agency helping ambitious brands grow through strategy, branding, UI/UX and technology, creating work that looks exceptional and performs even better.';

    public function up(): void
    {
        $this->shortenAboutText();

        $page = Page::query()->where('slug', 'home')->first();

        if ($page === null) {
            return;
        }

        PageSection::query()
            ->where('page_id', $page->id)
            ->where('type', SectionType::Marquee)
            ->delete();

        $sections = PageSection::query()
            ->where('page_id', $page->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $about = $sections->first(fn (PageSection $section): bool => $section->type === SectionType::About);

        if ($about === null) {
            return;
        }

        $workTypes = [SectionType::Work, SectionType::UiuxWork];
        $work = $sections->filter(fn (PageSection $section): bool => in_array($section->type, $workTypes, true));
        $rest = $sections->reject(fn (PageSection $section): bool => in_array($section->type, $workTypes, true));

        $ordered = $rest->flatMap(fn (PageSection $section) => $section->is($about) ? [$section, ...$work] : [$section]);

        $ordered->values()->each(function (PageSection $section, int $index): void {
            if ($section->sort_order !== $index) {
                $section->update(['sort_order' => $index]);
            }
        });
    }

    private function shortenAboutText(): void
    {
        Setting::query()
            ->where('about_text', self::OLD_ABOUT_TEXT)
            ->update(['about_text' => self::NEW_ABOUT_TEXT]);

        PageSection::query()
            ->where('type', SectionType::About)
            ->get()
            ->each(function (PageSection $section): void {
                $content = $section->content ?? [];

                if (($content['text'] ?? null) === self::OLD_ABOUT_TEXT) {
                    $section->update(['content' => [...$content, 'text' => self::NEW_ABOUT_TEXT]]);
                }
            });
    }
};
