<?php

namespace App\Enums;

enum InquiryType: string
{
    case Branding = 'Branding';
    case WebUiUx = 'Web UI/UX';
    case SoftwareUiUx = 'Software UI/UX';
    case MobileAppUiUx = 'Mobile App UI/UX';
    case Other = 'Other';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
