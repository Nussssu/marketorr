<?php

use App\Models\ServiceGroup;
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
        Schema::table('sub_services', function (Blueprint $table) {
            $table->string('meta_title')->nullable()->after('page_content');
            $table->string('meta_description', 500)->nullable()->after('meta_title');
            $table->string('meta_og_image', 1000)->nullable()->after('meta_description');
            $table->string('meta_robots')->nullable()->after('meta_og_image');
            $table->string('canonical_url', 2048)->nullable()->after('meta_robots');
        });

        // The cached catalogue predates the SEO fields; drop it so the public
        // pages pick them up.
        ServiceGroup::forgetCatalogue();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sub_services', function (Blueprint $table) {
            $table->dropColumn(['meta_title', 'meta_description', 'meta_og_image', 'meta_robots', 'canonical_url']);
        });
    }
};
