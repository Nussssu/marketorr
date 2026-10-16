<?php

namespace App\Enums;

/**
 * Where a managed menu renders. Locations are fixed by the layout; their
 * items are entirely editor-controlled.
 */
enum MenuLocation: string
{
    case Header = 'header';
    case FooterSitemap = 'footer_sitemap';
    case FooterServices = 'footer_services';
    case FooterLegal = 'footer_legal';
    case FooterSocial = 'footer_social';
    case MegaServices = 'mega_services';
    case MegaWork = 'mega_work';

    public function label(): string
    {
        return match ($this) {
            self::Header => 'Header Navigation',
            self::FooterSitemap => 'Quick Links',
            self::FooterServices => 'Services',
            self::FooterLegal => 'Legal',
            self::FooterSocial => 'Follow Us',
            self::MegaServices => 'Services',
            self::MegaWork => 'Our Work',
        };
    }

    public function group(): string
    {
        return match ($this) {
            self::Header => 'header',
            self::FooterSitemap, self::FooterServices, self::FooterLegal, self::FooterSocial => 'footer',
            self::MegaServices, self::MegaWork => 'mega',
        };
    }

    /**
     * What an editor should know about how the site shows this menu, when it
     * is not simply "every visible item, in this order".
     */
    public function note(): ?string
    {
        return match ($this) {
            self::Header => 'Contact can be shown independently on desktop and mobile. The "Start a Project" button remains the separate header CTA.',
            self::FooterSocial => 'Shown under "Follow us". Use the platform name as the label (LinkedIn, Facebook, Behance, Dribbble, Instagram, X, YouTube) so the link gets its icon. Social links always open in a new tab.',
            default => null,
        };
    }

    /**
     * Editable copy shown around a menu's links.
     *
     * @return array<string, mixed>
     */
    public function defaultContent(): array
    {
        return match ($this) {
            self::MegaServices => [
                'eyebrow' => 'What we do',
                'headline_before' => 'Design that',
                'headline_highlight' => 'compounds',
                'headline_after' => '.',
                'blurb' => 'Two disciplines, one standard. Pick a practice, or go straight to the specialism you need.',
                'all_label' => 'View all services',
                'all_url' => '/services',
            ],
            self::MegaWork => [
                'eyebrow' => 'Selected work',
                'headline_before' => 'Work that',
                'headline_highlight' => 'creates impact',
                'headline_after' => '.',
                'blurb' => 'Two practices, one standard. Pick a discipline, or go straight to the project you want to see.',
                'all_label' => '',
                'all_url' => '/work',
            ],
            self::FooterSocial => [
                'intro' => 'Independent creative & digital agency. We turn ideas into experiences, and experiences into measurable results.',
            ],
            self::FooterLegal => [
                'copyright' => '© {year} {site}. All rights reserved.',
                'motto_items' => ['IDEA', 'EXPERIENCE', 'RESULT'],
            ],
            default => [],
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
