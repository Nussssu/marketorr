<?php

namespace App\Enums;

/**
 * What a custom code snippet contains, which decides how it is wrapped
 * when rendered: CSS in a style tag, JavaScript in a script tag, and HTML
 * (tracking pixels, third-party embeds) exactly as written.
 */
enum SnippetType: string
{
    case Css = 'css';
    case Js = 'js';
    case Html = 'html';

    public function label(): string
    {
        return match ($this) {
            self::Css => 'CSS',
            self::Js => 'JavaScript',
            self::Html => 'HTML',
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
