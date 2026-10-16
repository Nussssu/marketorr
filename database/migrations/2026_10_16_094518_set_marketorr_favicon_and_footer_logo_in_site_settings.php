<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Fill the favicon and the footer logo in Settings with the shipped Marketorr
 * artwork, so the admin shows what the site already uses. A favicon or footer
 * logo an editor has already set is left alone.
 *
 * The shipped favicon keeps the site's full icon set (ICO, SVG, PNG sizes and
 * the Apple touch icon), and the shipped footer lockup still shows the dark
 * version in dark mode.
 */
return new class extends Migration
{
    private const ARTWORK = [
        'favicon_path' => '/favicon.svg',
        'footer_logo_path' => '/images/logo/marketorr-logo-on-light.png',
    ];

    public function up(): void
    {
        foreach (self::ARTWORK as $column => $path) {
            DB::table('site_settings')->whereNull($column)->update([$column => $path]);
        }
    }

    public function down(): void
    {
        foreach (self::ARTWORK as $column => $path) {
            DB::table('site_settings')->where($column, $path)->update([$column => null]);
        }
    }
};
