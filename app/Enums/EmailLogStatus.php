<?php

namespace App\Enums;

/**
 * What an email log entry records: a message that went out, one that failed
 * or was skipped, or an admin action on the email setup.
 */
enum EmailLogStatus: string
{
    case Sent = 'sent';
    case Failed = 'failed';
    case Skipped = 'skipped';
    case Activity = 'activity';

    public function label(): string
    {
        return match ($this) {
            self::Sent => 'Sent',
            self::Failed => 'Failed',
            self::Skipped => 'Skipped',
            self::Activity => 'Activity',
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
