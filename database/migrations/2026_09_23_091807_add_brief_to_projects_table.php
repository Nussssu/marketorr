<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Verified editorial detail for a project's dedicated page.
 *
 * `case_study` already holds image galleries; this holds the written record
 * transcribed from the published marketorr.com.bd case study or portfolio
 * entry — overview, what the engagement covered, the services delivered and
 * any documented highlights — plus the source URL each project was taken
 * from, so the claims on the page stay auditable.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->json('brief')->nullable()->after('case_study');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropColumn('brief');
        });
    }
};
