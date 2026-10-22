<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * An Our Work mega menu sub-item can now be linked to a project, so its
     * label and URL follow that project. The existing sub-items are linked by
     * the project slug in their URL (`/work/{slug}` or, for a UI/UX showcase
     * project, `/work/portfolio/uiux?project={slug}`).
     */
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('sub_service_id')->constrained('projects')->cascadeOnDelete();
        });

        $menuId = DB::table('menus')->where('location', 'mega_work')->value('id');

        if ($menuId === null) {
            return;
        }

        $children = DB::table('menu_items')->where('menu_id', $menuId)->whereNotNull('parent_id')->get();

        foreach ($children as $child) {
            $url = (string) $child->url;
            $slug = match (true) {
                (bool) preg_match('~^/work/portfolio/uiux\?project=([^&#]+)$~', $url, $match) => rawurldecode($match[1]),
                (bool) preg_match('~^/work/([^/?#]+)$~', $url, $match) => $match[1],
                default => null,
            };

            $projectId = $slug === null ? null : DB::table('projects')->where('slug', $slug)->whereNull('deleted_at')->value('id');

            if ($projectId !== null) {
                DB::table('menu_items')->where('id', $child->id)->update(['project_id' => $projectId]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('project_id');
        });
    }
};
