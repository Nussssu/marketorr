<?php

namespace App\Enums;

/**
 * Which public pages a custom code snippet runs on.
 */
enum SnippetTarget: string
{
    case All = 'all';
    case Only = 'only';
    case Except = 'except';

    public function label(): string
    {
        return match ($this) {
            self::All => 'All pages',
            self::Only => 'Only these pages',
            self::Except => 'All pages except these',
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
