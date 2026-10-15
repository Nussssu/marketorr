<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * List the built-in pages in the admin in the same order a visitor meets them
 * in the site navigation: Home, About, Services, Our Work, Contact, then the
 * legal pages.
 */
return new class extends Migration
{
    private const NAVIGATION_ORDER = ['home', 'about', 'services', 'work', 'contact', 'privacy', 'terms'];

    private const PREVIOUS_ORDER = ['home', 'about', 'contact', 'privacy', 'terms', 'services', 'work'];

    public function up(): void
    {
        $this->applyOrder(self::NAVIGATION_ORDER);
    }

    public function down(): void
    {
        $this->applyOrder(self::PREVIOUS_ORDER);
    }

    /**
     * @param  array<int, string>  $slugs
     */
    private function applyOrder(array $slugs): void
    {
        foreach ($slugs as $position => $slug) {
            DB::table('pages')
                ->where('slug', $slug)
                ->where('is_system', true)
                ->update(['sort_order' => $position]);
        }
    }
};
