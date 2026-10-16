<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Fill the header logos in Settings with the shipped Marketorr lockups, so
 * the admin shows the logo the site already uses. A logo an editor has
 * already set is left alone. The footer logo stays empty on purpose: empty
 * means "use the main logo", which keeps the right lockup for each theme.
 */
return new class extends Migration
{
    private const LOGOS = [
        'logo_path' => '/images/logo/marketorr-logo-on-light.png',
        'logo_dark_path' => '/images/logo/marketorr-logo-on-dark.png',
    ];

    public function up(): void
    {
        foreach (self::LOGOS as $column => $path) {
            DB::table('site_settings')->whereNull($column)->update([$column => $path]);
        }
    }

    public function down(): void
    {
        foreach (self::LOGOS as $column => $path) {
            DB::table('site_settings')->where($column, $path)->update([$column => null]);
        }
    }
};
