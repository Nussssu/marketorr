<?php

namespace App\Enums;

/**
 * What an inquiry is about.
 *
 * The contact form offers Branding and UI/UX; the finer UI/UX types and Other
 * remain so inquiries saved before the form was simplified still load and
 * filter in the admin inbox.
 */
enum InquiryType: string
{
    case Branding = 'Branding';
    case UiUx = 'UI/UX';
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
