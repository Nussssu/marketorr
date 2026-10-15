<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Point the site's LinkedIn link at the marketorr360 company page.
 *
 * The Setting defaults cover fresh seeds; this updates a row still holding
 * the old default. A URL an editor has already changed is left alone.
 */
return new class extends Migration
{
    private const OLD_URL = 'https://www.linkedin.com/company/marketorr';

    private const NEW_URL = 'https://www.linkedin.com/company/marketorr360';

    public function up(): void
    {
        DB::table('site_settings')
            ->where('social_linkedin', self::OLD_URL)
            ->update(['social_linkedin' => self::NEW_URL]);
    }

    public function down(): void
    {
        DB::table('site_settings')
            ->where('social_linkedin', self::NEW_URL)
            ->update(['social_linkedin' => self::OLD_URL]);
    }
};
