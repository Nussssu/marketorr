<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->boolean('header_sticky')->default(true)->after('favicon_path');
            $table->string('header_cta_text')->nullable()->default('Start a Project')->after('header_sticky');
            $table->string('header_cta_link')->nullable()->default('/contact')->after('header_cta_text');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['header_sticky', 'header_cta_text', 'header_cta_link']);
        });
    }
};
