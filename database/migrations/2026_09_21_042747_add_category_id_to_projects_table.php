<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Projects move from a free-text `category` label to a real category
     * record, so the same taxonomy powers the site and the admin filters.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('client')->constrained()->nullOnDelete();
        });

        $this->backfillCategories();

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('category')->after('client')->default('');
        });

        DB::table('projects')
            ->join('categories', 'projects.category_id', '=', 'categories.id')
            ->update(['projects.category' => DB::raw('categories.name')]);

        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }

    /**
     * Promote every distinct legacy label into a category row, then point the
     * projects that used it at the new record.
     */
    private function backfillCategories(): void
    {
        $labels = DB::table('projects')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category');

        foreach ($labels as $index => $label) {
            $slug = Str::slug($label);

            $categoryId = DB::table('categories')->where('slug', $slug)->value('id')
                ?? DB::table('categories')->insertGetId([
                    'slug' => $slug,
                    'name' => $label,
                    'status' => 'published',
                    'sort_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            DB::table('projects')->where('category', $label)->update(['category_id' => $categoryId]);
        }
    }
};
