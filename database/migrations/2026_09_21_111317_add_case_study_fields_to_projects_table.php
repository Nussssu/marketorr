<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Give every project the two things a dedicated case-study page needs
     * beyond its cover: the ordered visual story, and the canonical external
     * write-up when one exists (Behance, Dribbble, a client's own page).
     *
     * `case_study` is JSON rather than a table because a section is only ever
     * read as one whole ordered document belonging to a single project — it is
     * never queried, filtered or joined across projects, so rows would buy
     * nothing and cost a join on every page render.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('external_url')->nullable()->after('image_alt');
            $table->json('case_study')->nullable()->after('external_url');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['external_url', 'case_study']);
        });
    }
};
