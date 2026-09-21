<?php

namespace App\Enums;

/**
 * The widgets a page can be built from. Each case maps to a React component
 * in `resources/js/components/sections` via the widget renderer, and to a
 * field schema the admin builder renders its form from.
 */
enum SectionType: string
{
    case Hero = 'hero';
    case About = 'about';
    case Services = 'services';
    case Work = 'work';
    case Contact = 'contact';
    case Marquee = 'marquee';
    case RichText = 'rich_text';
    case Features = 'features';
    case Testimonials = 'testimonials';
    case Faq = 'faq';
    case Cta = 'cta';

    public function label(): string
    {
        return match ($this) {
            self::Hero => 'Hero',
            self::About => 'About',
            self::Services => 'Services',
            self::Work => 'Our Work',
            self::Contact => 'Contact',
            self::Marquee => 'Marquee Strip',
            self::RichText => 'Text Block',
            self::Features => 'Features',
            self::Testimonials => 'Testimonials',
            self::Faq => 'FAQ Accordion',
            self::Cta => 'Call To Action',
        };
    }

    /**
     * What the editor is choosing, in one line.
     */
    public function description(): string
    {
        return match ($this) {
            self::Hero => 'Full-height opening frame with eyebrow, headline lines and subtext.',
            self::About => 'Intro paragraph with animated metric counters.',
            self::Services => 'Service categories and their sub-services.',
            self::Work => 'Scrolling showcase of featured projects.',
            self::Contact => 'Contact details, office map and the inquiry form.',
            self::Marquee => 'Looping strip of short words.',
            self::RichText => 'Heading plus free-form rich text.',
            self::Features => 'Grid of titled feature cards.',
            self::Testimonials => 'Quotes with author and role.',
            self::Faq => 'Expandable question and answer list.',
            self::Cta => 'Headline with a primary button.',
        };
    }

    /**
     * Widgets that draw their own data from the database rather than from the
     * section's stored content. Their forms only edit the surrounding copy.
     */
    public function isDataDriven(): bool
    {
        return in_array($this, [self::Services, self::Work, self::Contact], true);
    }

    /**
     * The editable fields for this widget, as the admin builder's form schema.
     *
     * @return array<int, array{name: string, label: string, type: string, item_fields?: array<int, array{name: string, label: string, type: string}>}>
     */
    public function fields(): array
    {
        return match ($this) {
            self::Hero => [
                ['name' => 'eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
                ['name' => 'headingLines', 'label' => 'Heading lines', 'type' => 'list'],
                ['name' => 'subtext', 'label' => 'Subtext', 'type' => 'textarea'],
            ],
            self::About => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'text', 'label' => 'Body', 'type' => 'textarea'],
                ['name' => 'metrics', 'label' => 'Metrics', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'value', 'label' => 'Value', 'type' => 'number'],
                    ['name' => 'suffix', 'label' => 'Suffix', 'type' => 'text'],
                    ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ]],
            ],
            self::Services, self::Work, self::Contact => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'intro', 'label' => 'Intro', 'type' => 'textarea'],
            ],
            self::Marquee => [
                ['name' => 'items', 'label' => 'Words', 'type' => 'list'],
            ],
            self::RichText => [
                ['name' => 'eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'body', 'label' => 'Body', 'type' => 'richtext'],
            ],
            self::Features => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Features', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                    ['name' => 'body', 'label' => 'Body', 'type' => 'textarea'],
                    ['name' => 'accent', 'label' => 'Accent colour', 'type' => 'color'],
                ]],
            ],
            self::Testimonials => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Quotes', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'quote', 'label' => 'Quote', 'type' => 'textarea'],
                    ['name' => 'author', 'label' => 'Author', 'type' => 'text'],
                    ['name' => 'role', 'label' => 'Role', 'type' => 'text'],
                ]],
            ],
            self::Faq => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Questions', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'question', 'label' => 'Question', 'type' => 'text'],
                    ['name' => 'answer', 'label' => 'Answer', 'type' => 'textarea'],
                ]],
            ],
            self::Cta => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'body', 'label' => 'Body', 'type' => 'textarea'],
                ['name' => 'buttonLabel', 'label' => 'Button label', 'type' => 'text'],
                ['name' => 'buttonUrl', 'label' => 'Button URL', 'type' => 'text'],
            ],
        };
    }

    /**
     * An empty content payload matching this widget's field schema.
     *
     * @return array<string, mixed>
     */
    public function blankContent(): array
    {
        $content = [];

        foreach ($this->fields() as $field) {
            $content[$field['name']] = match ($field['type']) {
                'list', 'repeater' => [],
                'number' => 0,
                default => '',
            };
        }

        return $content;
    }

    /**
     * The builder's palette: every widget with the metadata its card needs.
     *
     * @return array<int, array{value: string, label: string, description: string, fields: array<int, mixed>, dataDriven: bool}>
     */
    public static function palette(): array
    {
        return array_map(fn (self $type) => [
            'value' => $type->value,
            'label' => $type->label(),
            'description' => $type->description(),
            'fields' => $type->fields(),
            'dataDriven' => $type->isDataDriven(),
        ], self::cases());
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
