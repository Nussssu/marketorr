<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->rename('footer_sitemap', ['Footer: Sitemap', 'Sitemap'], 'Quick Links');
        $this->rename('footer_services', ['Footer: Services'], 'Services');
        $this->rename('footer_legal', ['Footer: Legal'], 'Legal');
        $this->rename('footer_social', ['Footer: Social links'], 'Follow Us');
        $this->rename('mega_services', ['Mega Menu: Services'], 'Services');
        $this->rename('mega_work', ['Mega Menu: Our Work'], 'Our Work');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->rename('footer_sitemap', ['Quick Links'], 'Footer: Sitemap');
        $this->rename('footer_services', ['Services'], 'Footer: Services');
        $this->rename('footer_legal', ['Legal'], 'Footer: Legal');
        $this->rename('footer_social', ['Follow Us'], 'Footer: Social links');
        $this->rename('mega_services', ['Services'], 'Mega Menu: Services');
        $this->rename('mega_work', ['Our Work'], 'Mega Menu: Our Work');
    }

    /**
     * Rename only a former system label, preserving anything an editor chose.
     *
     * @param  array<int, string>  $from
     */
    private function rename(string $location, array $from, string $to): void
    {
        DB::table('menus')
            ->where('location', $location)
            ->whereIn('name', $from)
            ->update(['name' => $to]);
    }
};
