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
     * A Services mega menu sub-item can now be linked to a sub-service, so its
     * label and URL follow that sub-service. The existing sub-items are linked
     * by the slug in their URL, and any published sub-service missing from its
     * group's column is added, so both columns list all six.
     */
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->foreignId('sub_service_id')->nullable()->after('parent_id')->constrained('sub_services')->cascadeOnDelete();
        });

        $menuId = DB::table('menus')->where('location', 'mega_services')->value('id');

        if ($menuId === null) {
            return;
        }

        $groups = DB::table('service_groups')->get()->keyBy('slug');

        $parents = DB::table('menu_items')->where('menu_id', $menuId)->whereNull('parent_id')->get();

        foreach ($parents as $parent) {
            $group = $groups->first(fn (object $group): bool => $parent->url === '/services#'.$group->slug || $parent->label === $group->name);

            if ($group === null) {
                continue;
            }

            $subServices = DB::table('sub_services')->where('service_group_id', $group->id)->orderBy('sort_order')->orderBy('id')->get();
            $children = DB::table('menu_items')->where('parent_id', $parent->id)->get();

            foreach ($children as $child) {
                $slug = preg_match('~^/services/'.preg_quote($group->slug, '~').'/([^/?#]+)$~', (string) $child->url, $match) ? $match[1] : null;
                $subService = $subServices->firstWhere('slug', $slug);

                if ($subService !== null) {
                    DB::table('menu_items')->where('id', $child->id)->update(['sub_service_id' => $subService->id]);
                }
            }

            $linked = DB::table('menu_items')->where('parent_id', $parent->id)->pluck('sub_service_id')->filter()->all();
            $order = (int) DB::table('menu_items')->where('parent_id', $parent->id)->max('sort_order');

            foreach ($subServices->where('status', 'published') as $subService) {
                if (in_array($subService->id, $linked, true)) {
                    continue;
                }

                $now = now();
                DB::table('menu_items')->insert([
                    'menu_id' => $menuId,
                    'parent_id' => $parent->id,
                    'sub_service_id' => $subService->id,
                    'label' => $subService->name,
                    'url' => '/services/'.$group->slug.'/'.$subService->slug,
                    'opens_in_new_tab' => false,
                    'enabled' => true,
                    'show_on_desktop' => true,
                    'show_on_mobile' => true,
                    'sort_order' => ++$order,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sub_service_id');
        });
    }
};
