<?php

namespace App\Enums;

/**
 * Where on the page a custom code snippet is placed.
 */
enum SnippetLocation: string
{
    case Head = 'head';
    case BodyStart = 'body_start';
    case BodyEnd = 'body_end';

    public function label(): string
    {
        return match ($this) {
            self::Head => 'Head',
            self::BodyStart => 'Body start',
            self::BodyEnd => 'Body end',
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
