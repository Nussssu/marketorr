<?php

namespace App\Enums;

enum InquiryStatus: string
{
    case New = 'new';
    case InProgress = 'in_progress';
    case Replied = 'replied';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::InProgress => 'In Progress',
            self::Replied => 'Replied',
            self::Archived => 'Archived',
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
