<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Tables that move to the trash instead of being deleted outright. */
    private const SOFT_DELETING = ['media', 'sub_services', 'service_groups', 'page_sections', 'contact_submissions'];

    /**
     * Run the migrations.
     *
     * Trash & recovery: the content above is soft-deleted like pages,
     * projects, services and categories already are, and every move to the
     * trash is recorded once (what, who, when, and what to put back on
     * restore). Nothing existing is changed.
     */
    public function up(): void
    {
        foreach (self::SOFT_DELETING as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        Schema::create('trash_entries', function (Blueprint $table) {
            $table->id();
            $table->string('type', 40)->index();
            $table->nullableMorphs('trashable');
            $table->string('label');
            $table->string('detail')->nullable();
            $table->json('context')->nullable();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::table('site_settings', function (Blueprint $table) {
            // Days a trashed item is kept before it is deleted for good; 0 keeps it until emptied.
            $table->unsignedSmallInteger('trash_retention_days')->default(30);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn('trash_retention_days');
        });

        Schema::dropIfExists('trash_entries');

        foreach (self::SOFT_DELETING as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
