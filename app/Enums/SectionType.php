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
    case UiuxWork = 'uiux_work';
    case Contact = 'contact';
    case Marquee = 'marquee';
    case RichText = 'rich_text';
    case Features = 'features';
    case Testimonials = 'testimonials';
    case Faq = 'faq';
    case Cta = 'cta';
    case Process = 'process';
    case Results = 'results';
    case Recognition = 'recognition';
    case Story = 'story';
    case MissionVision = 'mission_vision';
    case Team = 'team';
    case Awards = 'awards';
    case ContactFaq = 'contact_faq';
    case ContactConnect = 'contact_connect';
    case ClosingPanel = 'closing_panel';

    public function label(): string
    {
        return match ($this) {
            self::Hero => 'Hero',
            self::About => 'About',
            self::Services => 'Services',
            self::Work => 'Our Work',
            self::UiuxWork => 'UI/UX Work',
            self::Contact => 'Contact',
            self::Marquee => 'Marquee Strip',
            self::RichText => 'Text Block',
            self::Features => 'Features',
            self::Testimonials => 'Testimonials',
            self::Faq => 'FAQ Accordion',
            self::Cta => 'Call To Action',
            self::Process => 'Process Story',
            self::Results => 'Results In Numbers',
            self::Recognition => 'Recognition Strip',
            self::Story => 'Our Story',
            self::MissionVision => 'Vision & Mission',
            self::Team => 'Leadership',
            self::Awards => 'Awards & Recognition',
            self::ContactFaq => 'Contact FAQ',
            self::ContactConnect => 'Let’s Connect',
            self::ClosingPanel => 'Closing Panel',
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
            self::Work => 'Scrolling showcase of featured branding projects.',
            self::UiuxWork => 'UI/UX projects fed out of a printer as the reader scrolls.',
            self::Contact => 'Contact details, office map and the inquiry form.',
            self::Marquee => 'Looping strip of short words.',
            self::RichText => 'Heading plus free-form rich text.',
            self::Features => 'Grid of titled feature cards.',
            self::Testimonials => 'Quotes with author and role.',
            self::Faq => 'Expandable question and answer list.',
            self::Cta => 'Headline with a primary button.',
            self::Process => 'Pinned, scroll-driven chapters - one per stage of the process.',
            self::Results => 'Oversized client results that count up as they arrive.',
            self::Recognition => 'Press and award logos drifting in two opposing rows.',
            self::Story => 'Pinned story with a pull quote and a timeline that fills as it is read.',
            self::MissionVision => 'Pinned cards that swap one for the next with a single scroll.',
            self::Team => 'Heading, then the leader’s portrait beside their name, role and bio.',
            self::Awards => 'A heading over a drifting strip of award and press logos.',
            self::ContactFaq => 'Question accordion beside a heading, intro and a help box.',
            self::ContactConnect => 'Closing copy beside the social links, a button and the reply-time line.',
            self::ClosingPanel => 'Centred panel with a label, a heading and one button.',
        };
    }

    /**
     * Widgets that draw their own data from the database rather than from the
     * section's stored content. Their forms only edit the surrounding copy.
     */
    public function isDataDriven(): bool
    {
        return in_array($this, [self::Services, self::Work, self::UiuxWork, self::Contact], true);
    }

    /**
     * The editable fields for this widget, as the admin builder's form schema.
     *
     * @return array<int, array{name: string, label: string, type: string, default?: int, item_fields?: array<int, array{name: string, label: string, type: string}>}>
     */
    public function fields(): array
    {
        $fields = match ($this) {
            self::Hero => [
                ['name' => 'eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
                ['name' => 'headingLines', 'label' => 'Heading lines', 'type' => 'list'],
                ['name' => 'subtext', 'label' => 'Subtext', 'type' => 'textarea'],
            ],
            self::About => [
                ['name' => 'heading', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'titleLines', 'label' => 'Heading lines (About page)', 'type' => 'list'],
                ['name' => 'titleHighlight', 'label' => 'Gradient lines at the end of the heading', 'type' => 'number'],
                ['name' => 'text', 'label' => 'Body', 'type' => 'textarea'],
                ['name' => 'tagline', 'label' => 'Tagline phrases (purple, blue, cyan)', 'type' => 'list'],
                ['name' => 'linkLabel', 'label' => 'Link label', 'type' => 'text'],
                ['name' => 'linkUrl', 'label' => 'Link URL', 'type' => 'text'],
                ['name' => 'metrics', 'label' => 'Metrics', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'value', 'label' => 'Value', 'type' => 'number'],
                    ['name' => 'suffix', 'label' => 'Suffix', 'type' => 'text'],
                    ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ]],
            ],
            self::Services => [
                ['name' => 'heading', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'titleLines', 'label' => 'Heading lines (landing page)', 'type' => 'list'],
                ['name' => 'titleHighlight', 'label' => 'Gradient lines at the end of the heading', 'type' => 'number'],
                ['name' => 'intro', 'label' => 'Intro', 'type' => 'textarea'],
            ],
            self::Work => [
                ['name' => 'heading', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'titleLines', 'label' => 'Heading lines (landing page)', 'type' => 'list'],
                ['name' => 'titleHighlight', 'label' => 'Gradient lines at the end of the heading', 'type' => 'number'],
                ['name' => 'title', 'label' => 'Big title (Our Work page)', 'type' => 'text'],
                ['name' => 'intro', 'label' => 'Intro ({projects} and {practices} show live counts)', 'type' => 'textarea'],
                ['name' => 'scrollHint', 'label' => 'Scroll hint (Our Work page)', 'type' => 'text'],
            ],
            self::UiuxWork => [
                ['name' => 'heading', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'titleLines', 'label' => 'Heading lines', 'type' => 'list'],
                ['name' => 'titleHighlight', 'label' => 'Gradient lines at the end of the heading', 'type' => 'number'],
                ['name' => 'intro', 'label' => 'Intro', 'type' => 'textarea'],
                ['name' => 'linkLabel', 'label' => 'Portfolio link label', 'type' => 'text'],
            ],
            self::Contact => [
                ['name' => 'heading', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'titleLines', 'label' => 'Heading lines', 'type' => 'list'],
                ['name' => 'titleHighlight', 'label' => 'Gradient lines at the end of the heading', 'type' => 'number'],
                ['name' => 'intro', 'label' => 'Intro', 'type' => 'textarea'],
                ['name' => 'emailTileLabel', 'label' => 'Email label', 'type' => 'text'],
                ['name' => 'phoneTileLabel', 'label' => 'Phone label', 'type' => 'text'],
                ['name' => 'locationTileLabel', 'label' => 'Location label', 'type' => 'text'],
                ['name' => 'mapLinkLabel', 'label' => 'Map link label', 'type' => 'text'],
                ['name' => 'formLabel', 'label' => 'Form label', 'type' => 'text'],
                ['name' => 'formHeading', 'label' => 'Form heading', 'type' => 'text'],
                ['name' => 'formIntro', 'label' => 'Form intro', 'type' => 'text'],
                ['name' => 'nameLabel', 'label' => 'Name field label', 'type' => 'text'],
                ['name' => 'namePlaceholder', 'label' => 'Name field placeholder', 'type' => 'text'],
                ['name' => 'emailLabel', 'label' => 'Email field label', 'type' => 'text'],
                ['name' => 'emailPlaceholder', 'label' => 'Email field placeholder', 'type' => 'text'],
                ['name' => 'phoneLabel', 'label' => 'Phone field label', 'type' => 'text'],
                ['name' => 'phonePlaceholder', 'label' => 'Phone field placeholder', 'type' => 'text'],
                ['name' => 'companyLabel', 'label' => 'Company field label', 'type' => 'text'],
                ['name' => 'companyPlaceholder', 'label' => 'Company field placeholder', 'type' => 'text'],
                ['name' => 'budgetLabel', 'label' => 'Budget field label', 'type' => 'text'],
                ['name' => 'budgetPlaceholder', 'label' => 'Budget field placeholder', 'type' => 'text'],
                ['name' => 'budgets', 'label' => 'Budget options', 'type' => 'list'],
                ['name' => 'typeLabel', 'label' => 'Project type field label', 'type' => 'text'],
                ['name' => 'typePlaceholder', 'label' => 'Project type field placeholder', 'type' => 'text'],
                ['name' => 'projectTypes', 'label' => 'Project type options (any of: Branding, UI/UX, Web UI/UX, Software UI/UX, Mobile App UI/UX, Other)', 'type' => 'list'],
                ['name' => 'messageLabel', 'label' => 'Message field label', 'type' => 'text'],
                ['name' => 'messagePlaceholder', 'label' => 'Message field placeholder', 'type' => 'text'],
                ['name' => 'submitLabel', 'label' => 'Send button label', 'type' => 'text'],
                ['name' => 'sendingLabel', 'label' => 'Send button label while sending', 'type' => 'text'],
                ['name' => 'formNote', 'label' => 'Note under the send button', 'type' => 'text'],
                ['name' => 'successHeading', 'label' => 'Thank-you heading', 'type' => 'text'],
                ['name' => 'successBody', 'label' => 'Thank-you message ({email} shows the contact email)', 'type' => 'textarea'],
                ['name' => 'sendAnotherLabel', 'label' => 'Send-another button label', 'type' => 'text'],
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
            self::Process => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Stages', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'stage', 'label' => 'Stage word', 'type' => 'text'],
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                    ['name' => 'body', 'label' => 'Body', 'type' => 'textarea'],
                ]],
            ],
            self::Results => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Results', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'prefix', 'label' => 'Prefix', 'type' => 'text'],
                    ['name' => 'value', 'label' => 'Value', 'type' => 'number'],
                    ['name' => 'suffix', 'label' => 'Suffix', 'type' => 'text'],
                    ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                    ['name' => 'context', 'label' => 'Context', 'type' => 'textarea'],
                    ['name' => 'url', 'label' => 'Link (optional)', 'type' => 'text'],
                ]],
            ],
            self::Recognition => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Logos', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                    ['name' => 'image', 'label' => 'Logo URL', 'type' => 'text'],
                ]],
            ],
            self::Story => [
                ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'highlight', 'label' => 'Gradient words at the end of the heading', 'type' => 'number'],
                ['name' => 'intro', 'label' => 'Intro', 'type' => 'textarea'],
                ['name' => 'quote', 'label' => 'Pull quote (last word in gradient)', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Timeline', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'year', 'label' => 'Year or tag', 'type' => 'text'],
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                    ['name' => 'copy', 'label' => 'Copy', 'type' => 'textarea'],
                ]],
            ],
            self::MissionVision => [
                ['name' => 'highlight', 'label' => 'Gradient words at the end of each title', 'type' => 'number'],
                ['name' => 'items', 'label' => 'Cards', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                    ['name' => 'copy', 'label' => 'Copy', 'type' => 'textarea'],
                    ['name' => 'image', 'label' => 'Image', 'type' => 'image'],
                    ['name' => 'imageAlt', 'label' => 'Image description', 'type' => 'text'],
                ]],
            ],
            self::Team => [
                ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'highlight', 'label' => 'Gradient words at the end of the heading', 'type' => 'number'],
                ['name' => 'name', 'label' => 'Leader name', 'type' => 'text'],
                ['name' => 'role', 'label' => 'Leader role', 'type' => 'text'],
                ['name' => 'bio', 'label' => 'Leader bio', 'type' => 'textarea'],
                ['name' => 'image', 'label' => 'Leader photo', 'type' => 'image'],
            ],
            self::Awards => [
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'items', 'label' => 'Awards', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                    ['name' => 'detail', 'label' => 'Detail', 'type' => 'text'],
                    ['name' => 'image', 'label' => 'Logo', 'type' => 'image'],
                ]],
            ],
            self::ContactFaq => [
                ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'titleLines', 'label' => 'Heading lines', 'type' => 'list'],
                ['name' => 'titleHighlight', 'label' => 'Gradient lines at the end of the heading', 'type' => 'number'],
                ['name' => 'intro', 'label' => 'Intro', 'type' => 'textarea'],
                ['name' => 'items', 'label' => 'Questions', 'type' => 'repeater', 'item_fields' => [
                    ['name' => 'question', 'label' => 'Question', 'type' => 'text'],
                    ['name' => 'answer', 'label' => 'Answer', 'type' => 'textarea'],
                ]],
                ['name' => 'helpHeading', 'label' => 'Help box heading', 'type' => 'text'],
                ['name' => 'helpBody', 'label' => 'Help box text', 'type' => 'text'],
                ['name' => 'helpLinkLabel', 'label' => 'Help box link label', 'type' => 'text'],
            ],
            self::ContactConnect => [
                ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'titleLines', 'label' => 'Heading lines', 'type' => 'list'],
                ['name' => 'titleHighlight', 'label' => 'Gradient lines at the end of the heading', 'type' => 'number'],
                ['name' => 'body', 'label' => 'Text', 'type' => 'textarea'],
                ['name' => 'buttonLabel', 'label' => 'Button label', 'type' => 'text'],
                ['name' => 'closingNote', 'label' => 'Closing line (gradient part)', 'type' => 'text'],
            ],
            self::ClosingPanel => [
                ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'heading', 'label' => 'Heading', 'type' => 'text'],
                ['name' => 'buttonLabel', 'label' => 'Button label', 'type' => 'text'],
                ['name' => 'buttonUrl', 'label' => 'Button URL', 'type' => 'text'],
            ],
        };

        if ($this->hasHeading()) {
            $fields[] = ['name' => 'headingScale', 'label' => 'Heading size (%)', 'type' => 'number', 'default' => 100];
        }

        return $fields;
    }

    /**
     * Whether this widget shows a heading whose size an editor can scale.
     */
    public function hasHeading(): bool
    {
        return ! in_array($this, [self::Marquee, self::Features, self::Testimonials, self::Faq], true);
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
            $content[$field['name']] = $field['default'] ?? match ($field['type']) {
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
