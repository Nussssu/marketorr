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
    case MegaServices = 'mega_services';
    case MegaWork = 'mega_work';

    public function label(): string
    {
        return match ($this) {
            self::Header => 'Header navigation',
            self::FooterSitemap => 'Footer: Sitemap',
            self::FooterServices => 'Footer: Services',
            self::FooterLegal => 'Footer: Legal',
            self::MegaServices => 'Mega Menu: Services',
            self::MegaWork => 'Mega Menu: Our Work',
        };
    }

    public function group(): string
    {
        return match ($this) {
            self::Header => 'header',
            self::FooterSitemap, self::FooterServices, self::FooterLegal => 'footer',
            self::MegaServices, self::MegaWork => 'mega',
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
