<?php

use App\Enums\MenuLocation;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

/**
 * Make the footer menus hold exactly what the site shows, so the admin Menus
 * module and the footer always agree:
 *
 * - Social links become their own menu, filled from the socials in Settings,
 *   so each one can be added, removed, reordered and shown or hidden.
 * - Quick Links loses the Services item the footer already left out.
 * - Footer Services links point at the Services page tabs they open.
 *
 * Running this twice adds nothing more.
 */
return new class extends Migration
{
    private const SOCIALS = [
        'LinkedIn' => 'social_linkedin',
        'Facebook' => 'social_facebook',
        'Behance' => 'social_behance',
        'Dribbble' => 'social_dribbble',
        'Instagram' => 'social_instagram',
        'X' => 'social_x',
        'YouTube' => 'social_youtube',
    ];

    private const TAB_LINKS = [
        '/services/branding' => '/services#branding',
        '/services/ui-ux' => '/services#ui-ux',
    ];

    public function up(): void
    {
        $social = Menu::query()->firstOrCreate(
            ['location' => MenuLocation::FooterSocial],
            ['name' => MenuLocation::FooterSocial->label()],
        );

        if (! $social->items()->exists()) {
            $settings = Setting::query()->first();
            $order = 0;

            foreach (self::SOCIALS as $label => $column) {
                $url = $settings?->{$column};

                if (blank($url)) {
                    continue;
                }

                MenuItem::query()->create([
                    'menu_id' => $social->id,
                    'label' => $label,
                    'url' => $url,
                    'opens_in_new_tab' => true,
                    'enabled' => true,
                    'sort_order' => $order++,
                ]);
            }
        }

        $sitemap = Menu::query()->where('location', MenuLocation::FooterSitemap)->first();
        $sitemap?->items()->where('url', '/services')->whereNull('parent_id')->delete();

        $services = Menu::query()->where('location', MenuLocation::FooterServices)->first();

        foreach (self::TAB_LINKS as $old => $new) {
            $services?->items()->where('url', $old)->update(['url' => $new]);
        }
    }

    public function down(): void
    {
        Menu::query()->where('location', MenuLocation::FooterSocial)->first()?->delete();

        $services = Menu::query()->where('location', MenuLocation::FooterServices)->first();

        foreach (self::TAB_LINKS as $old => $new) {
            $services?->items()->where('url', $new)->update(['url' => $old]);
        }
    }
};
