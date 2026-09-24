<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Which Our Work column a project sits in, when the category tree gets it wrong.
 *
 * `Project::workGroup()` normally derives the column from the category root,
 * which keeps the menu in step with the admin panel for free. This is the
 * escape hatch for the cases where the two genuinely disagree — work that is
 * technically one discipline but belongs with the other in the portfolio.
 * Null means "derive it", so nothing has to be filled in by hand.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->string('work_group')->nullable()->after('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropColumn('work_group');
        });
    }
};
