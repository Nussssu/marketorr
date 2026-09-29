<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow the "UI/UX" project type the contact form now offers.
     *
     * The earlier types stay allowed, so inquiries saved before the form was
     * simplified keep their original type.
     */
    public function up(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->enum('type', ['Branding', 'UI/UX', 'Web UI/UX', 'Software UI/UX', 'Mobile App UI/UX', 'Other'])->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Inquiries filed as "UI/UX" move to the nearest earlier type first, so the
     * narrower column can be restored without rejecting existing rows.
     */
    public function down(): void
    {
        DB::table('contact_submissions')->where('type', 'UI/UX')->update(['type' => 'Web UI/UX']);

        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->enum('type', ['Branding', 'Web UI/UX', 'Software UI/UX', 'Mobile App UI/UX', 'Other'])->change();
        });
    }
};
