<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-project SEO: how a project's page appears in search results and when
 * shared. Every column is optional; an empty one falls back to the project's
 * own title, description and cover.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('meta_title')->nullable()->after('brief');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('meta_og_image', 1000)->nullable()->after('meta_description');
            $table->string('meta_robots')->default('index,follow')->after('meta_og_image');
            $table->string('canonical_url', 2048)->nullable()->after('meta_robots');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['meta_title', 'meta_description', 'meta_og_image', 'meta_robots', 'canonical_url']);
        });
    }
};
