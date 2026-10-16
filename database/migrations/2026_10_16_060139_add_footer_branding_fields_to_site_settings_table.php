<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('footer_logo_path')->nullable()->after('footer_intro');
            $table->boolean('footer_logo_visible')->default(true)->after('footer_logo_path');
            $table->json('footer_motto_items')->nullable()->after('footer_logo_visible');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['footer_logo_path', 'footer_logo_visible', 'footer_motto_items']);
        });
    }
};
