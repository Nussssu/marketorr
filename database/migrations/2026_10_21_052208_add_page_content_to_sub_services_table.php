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
            $table->json('page_content')->nullable()->after('case_study');
        });

        // The cached catalogue predates the page copy; drop it so the public
        // pages pick the new field up.
        ServiceGroup::forgetCatalogue();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sub_services', function (Blueprint $table) {
            $table->dropColumn('page_content');
        });
    }
};
