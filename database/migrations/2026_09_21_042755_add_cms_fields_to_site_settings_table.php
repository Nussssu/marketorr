<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('site_name');
            $table->string('logo_dark_path')->nullable()->after('logo_path');
            $table->string('favicon_path')->nullable()->after('logo_dark_path');
            $table->string('social_facebook')->nullable()->after('social_linkedin');
            $table->string('social_x')->nullable()->after('social_instagram');
            $table->string('social_youtube')->nullable()->after('social_x');
            $table->string('address')->nullable()->after('location_text');
            $table->string('directions_url')->nullable()->after('address');
            $table->string('copyright_text')->nullable()->after('directions_url');
            $table->text('footer_intro')->nullable()->after('copyright_text');
            $table->text('head_scripts')->nullable();
            $table->text('body_scripts')->nullable();
            $table->text('robots_txt')->nullable();
            $table->json('schema_markup')->nullable();
            $table->boolean('sitemap_enabled')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'logo_path', 'logo_dark_path', 'favicon_path',
                'social_facebook', 'social_x', 'social_youtube',
                'address', 'directions_url', 'copyright_text', 'footer_intro',
                'head_scripts', 'body_scripts', 'robots_txt', 'schema_markup',
                'sitemap_enabled',
            ]);
        });
    }
};
