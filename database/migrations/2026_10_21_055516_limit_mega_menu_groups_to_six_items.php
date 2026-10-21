<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** How many sub-items each mega menu group keeps. */
    private const LIMIT = 6;

    /**
     * Keep the first six sub-items, in their menu order, under every group of
     * the Services and Our Work mega menus, so each column lists six.
     */
    public function up(): void
    {
        $menuIds = DB::table('menus')->whereIn('location', ['mega_services', 'mega_work'])->pluck('id');

        $parentIds = DB::table('menu_items')
            ->whereIn('menu_id', $menuIds)
            ->whereNull('parent_id')
            ->pluck('id');

        foreach ($parentIds as $parentId) {
            $extra = DB::table('menu_items')
                ->where('parent_id', $parentId)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->skip(self::LIMIT)
                ->take(PHP_INT_MAX)
                ->pluck('id');

            DB::table('menu_items')->whereIn('id', $extra)->delete();
        }
    }

    /**
     * Reverse the migrations.
     *
     * The removed links are not restored; re-add them from the admin's Menus.
     */
    public function down(): void
    {
        //
    }
};
