<?php

namespace App\Enums;

/**
 * The widgets an email template's body is built from, top to bottom. Each
 * case maps to a block of inline-styled email HTML in EmailWidgetRenderer and
 * to a field form in the admin's email template editor.
 */
enum EmailWidget: string
{
    case Heading = 'heading';
    case Text = 'text';
    case Button = 'button';
    case Details = 'details';
    case Quote = 'quote';
    case Image = 'image';
    case Divider = 'divider';
    case Note = 'note';
    case Html = 'html';

    public function label(): string
    {
        return match ($this) {
            self::Heading => 'Heading',
            self::Text => 'Text',
            self::Button => 'Button',
            self::Details => 'Details table',
            self::Quote => 'Quote',
            self::Image => 'Image',
            self::Divider => 'Divider',
            self::Note => 'Small note',
            self::Html => 'Custom HTML',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Heading => 'A large title line.',
            self::Text => 'Paragraphs of text. Leave a blank line between paragraphs; simple HTML such as <strong> is allowed.',
            self::Button => 'A call-to-action button linking to a URL.',
            self::Details => 'Label and value rows, such as a lead\'s contact details.',
            self::Quote => 'A highlighted block, such as the visitor\'s message.',
            self::Image => 'An image from the media library.',
            self::Divider => 'A thin separating line.',
            self::Note => 'Small muted text, such as a footnote.',
            self::Html => 'Raw HTML for anything the other widgets cannot do.',
        };
    }

    /**
     * The content a newly added widget starts with.
     *
     * @return array<string, mixed>
     */
    public function blank(): array
    {
        return match ($this) {
            self::Heading, self::Text, self::Quote, self::Note => ['text' => ''],
            self::Button => ['label' => '', 'url' => ''],
            self::Details => ['rows' => [['label' => '', 'value' => '']]],
            self::Image => ['src' => '', 'alt' => '', 'link' => '', 'width' => null],
            self::Divider => [],
            self::Html => ['html' => ''],
        };
    }

    /**
     * Every text field of a block that can hold placeholders.
     *
     * @param  array<string, mixed>  $block
     * @return list<string>
     */
    public static function textsOf(array $block): array
    {
        return match (self::tryFrom((string) ($block['type'] ?? ''))) {
            self::Heading, self::Text, self::Quote, self::Note => [(string) ($block['text'] ?? '')],
            self::Button => [(string) ($block['label'] ?? ''), (string) ($block['url'] ?? '')],
            self::Details => collect($block['rows'] ?? [])
                ->flatMap(fn (array $row): array => [(string) ($row['label'] ?? ''), (string) ($row['value'] ?? '')])
                ->all(),
            self::Image => [(string) ($block['alt'] ?? ''), (string) ($block['link'] ?? '')],
            self::Html => [(string) ($block['html'] ?? '')],
            self::Divider, null => [],
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * The widget list the admin builder offers.
     *
     * @return list<array{value: string, label: string, description: string, blank: array<string, mixed>}>
     */
    public static function catalogue(): array
    {
        return array_map(fn (self $widget): array => [
            'value' => $widget->value,
            'label' => $widget->label(),
            'description' => $widget->description(),
            'blank' => $widget->blank(),
        ], self::cases());
    }
}
