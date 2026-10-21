<?php

use Database\Seeders\UiuxShowcaseSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The UI/UX showcase moves out of `config/uiux_showcase.php` into the CMS:
     * an existing site gets its six projects imported here, a fresh install
     * seeds them with the rest of the catalogue (see DatabaseSeeder).
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('discipline', 120)->nullable()->after('work_group');
            $table->string('layout', 20)->nullable()->after('discipline');
        });

        if (DB::table('projects')->exists()) {
            (new UiuxShowcaseSeeder)->run();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('projects')->where('layout', 'screens')->delete();

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['discipline', 'layout']);
        });
    }
};
