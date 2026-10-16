<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = DB::table('site_settings')->where('id', 1)->first();

        $this->mergeMenuContent('footer_social', [
            'intro' => $settings?->footer_intro
                ?: 'Independent creative & digital agency. We turn ideas into experiences, and experiences into measurable results.',
        ]);
        $this->mergeMenuContent('footer_legal', [
            'copyright' => $settings?->copyright_text ?: '© {year} {site}. All rights reserved.',
            'motto_items' => $this->decodeArray($settings?->footer_motto_items) ?: ['IDEA', 'EXPERIENCE', 'RESULT'],
        ]);

        $megaServicesId = DB::table('menus')->where('location', 'mega_services')->value('id');
        if ($megaServicesId === null) {
            return;
        }

        DB::table('menu_items')
            ->where('menu_id', $megaServicesId)
            ->whereNull('parent_id')
            ->get()
            ->each(function (object $item): void {
                $slug = str_contains($item->url, '#')
                    ? str($item->url)->afterLast('#')->toString()
                    : null;
                $tagline = DB::table('service_groups')
                    ->when($slug, fn ($query) => $query->where('slug', $slug), fn ($query) => $query->where('name', $item->label))
                    ->value('tagline');

                if (filled($tagline)) {
                    DB::table('menu_items')->where('id', $item->id)->update(['description' => $tagline]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('menus')->whereIn('location', ['footer_social', 'footer_legal'])->update(['content' => null]);
        DB::table('menu_items')->whereNotNull('description')->update(['description' => null]);
    }

    /**
     * @param  array<string, mixed>  $defaults
     */
    private function mergeMenuContent(string $location, array $defaults): void
    {
        $menu = DB::table('menus')->where('location', $location)->first();
        if ($menu === null) {
            DB::table('menus')->insert([
                'location' => $location,
                'name' => $location === 'footer_social' ? 'Follow Us' : 'Legal',
                'content' => json_encode($defaults, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return;
        }

        $stored = $this->decodeObject($menu->content);
        DB::table('menus')->where('id', $menu->id)->update([
            'content' => json_encode([...$defaults, ...$stored], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'updated_at' => now(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeObject(?string $value): array
    {
        $decoded = json_decode($value ?? '[]', true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @return array<int, string>
     */
    private function decodeArray(?string $value): array
    {
        return array_values(array_filter(
            $this->decodeObject($value),
            static fn (mixed $item): bool => is_string($item) && filled($item),
        ));
    }
};
