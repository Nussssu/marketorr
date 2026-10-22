<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Lifts the copy that used to live inside the React pages into editable page
 * and section rows. Existing rows are updated rather than replaced, so a
 * re-seed never discards an editor's work on a section they have since
 * rewritten — only sections that are missing are recreated.
 */
class PageSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach ($this->pages() as $order => $definition) {
            $sections = $definition['sections'];
            unset($definition['sections']);

            $page = Page::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    ...$definition,
                    'status' => ContentStatus::Published,
                    'is_system' => true,
                    'sort_order' => $order,
                ],
            );

            foreach ($sections as $sectionOrder => $section) {
                PageSection::query()->firstOrCreate(
                    ['page_id' => $page->id, 'type' => $section['type']],
                    [
                        'name' => $section['name'],
                        'content' => $section['content'],
                        'enabled' => true,
                        'sort_order' => $sectionOrder,
                    ],
                );
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pages(): array
    {
        $defaults = Setting::defaults();

        return [
            [
                'slug' => 'home',
                'title' => 'Home',
                'meta_title' => $defaults['meta_default_title'],
                'meta_description' => $defaults['meta_default_description'],
                'sections' => [
                    [
                        'type' => SectionType::Hero,
                        'name' => 'Opening frame',
                        'content' => [
                            'eyebrow' => $defaults['hero_eyebrow'],
                            'headingLines' => $defaults['hero_heading_lines'],
                            'subtext' => $defaults['hero_subtext'],
                        ],
                    ],
                    [
                        'type' => SectionType::About,
                        'name' => 'Who we are',
                        'content' => [
                            ...self::aboutIntroContent(),
                            'text' => $defaults['about_text'],
                            'metrics' => $defaults['about_metrics'],
                        ],
                    ],
                    [
                        'type' => SectionType::Work,
                        'name' => 'Featured work',
                        'content' => self::homeWorkContent(),
                    ],
                    [
                        'type' => SectionType::UiuxWork,
                        'name' => 'UI/UX work',
                        'content' => self::uiuxWorkContent(),
                    ],
                    [
                        'type' => SectionType::Services,
                        'name' => 'What we do',
                        'content' => self::servicesSectionContent(),
                    ],
                    [
                        'type' => SectionType::Process,
                        'name' => 'How we work',
                        'content' => self::processContent(),
                    ],
                    [
                        'type' => SectionType::Recognition,
                        'name' => 'Featured in',
                        'content' => self::recognitionContent(),
                    ],
                    [
                        'type' => SectionType::Contact,
                        'name' => 'Start a project',
                        'content' => self::contactMainContent(),
                    ],
                ],
            ],
            [
                'slug' => 'about',
                'title' => 'About',
                'meta_title' => 'About | Marketorr',
                'meta_description' => 'Marketorr is a creative and digital agency helping ambitious brands build stronger identities and measurable growth.',
                'sections' => [
                    [
                        'type' => SectionType::About,
                        'name' => 'Who we are',
                        'content' => [
                            ...self::aboutIntroContent(),
                            'text' => $defaults['about_text'],
                            'metrics' => $defaults['about_metrics'],
                        ],
                    ],
                    [
                        'type' => SectionType::Story,
                        'name' => 'Our story',
                        'content' => self::aboutStoryContent(),
                    ],
                    [
                        'type' => SectionType::MissionVision,
                        'name' => 'Vision and mission',
                        'content' => self::aboutMissionVisionContent(),
                    ],
                    [
                        'type' => SectionType::Team,
                        'name' => 'Leadership',
                        'content' => self::aboutLeadershipContent(),
                    ],
                    [
                        'type' => SectionType::Awards,
                        'name' => 'Awards and recognition',
                        'content' => self::aboutAwardsContent(),
                    ],
                ],
            ],
            [
                'slug' => 'contact',
                'title' => 'Contact',
                'meta_title' => 'Contact | Marketorr',
                'meta_description' => 'Tell us about your project. We reply within 24–48 hours.',
                'sections' => [
                    [
                        'type' => SectionType::Contact,
                        'name' => 'Start a project',
                        'content' => self::contactMainContent(),
                    ],
                    [
                        'type' => SectionType::ContactFaq,
                        'name' => 'FAQs',
                        'content' => self::contactFaqContent(),
                    ],
                    [
                        'type' => SectionType::ContactConnect,
                        'name' => 'Let’s connect',
                        'content' => self::contactConnectContent(),
                    ],
                ],
            ],
            [
                'slug' => 'privacy',
                'title' => 'Privacy policy',
                'meta_title' => 'Privacy | Marketorr',
                'meta_description' => 'How Marketorr handles inquiries submitted through this site.',
                'meta_robots' => 'noindex,follow',
                'sections' => [
                    [
                        'type' => SectionType::RichText,
                        'name' => 'Policy',
                        'content' => [
                            'eyebrow' => 'PRIVACY',
                            'heading' => 'Privacy policy',
                            'body' => '<p>Marketorr respects your privacy. This page outlines how we handle inquiries submitted through this site.</p>'
                                .'<p>Contact-form details (name, email, company, project info) are used solely to respond to your inquiry. We do not sell personal data, run third-party trackers, or share submissions without consent.</p>'
                                .'<p>To request deletion of your inquiry, email hello@marketorr.com with the subject “Delete my data”.</p>',
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'terms',
                'title' => 'Terms',
                'meta_title' => 'Terms | Marketorr',
                'meta_description' => 'The terms that apply to this site and to work commissioned from Marketorr.',
                'meta_robots' => 'noindex,follow',
                'sections' => [
                    [
                        'type' => SectionType::RichText,
                        'name' => 'Terms',
                        'content' => [
                            'eyebrow' => 'TERMS',
                            'heading' => 'Terms of use',
                            'body' => '<p>By using this site you agree to these terms.</p>'
                                .'<p>All content, visual work and case studies on this site are the property of Marketorr or its clients and may not be reproduced without permission.</p>'
                                .'<p>Project engagements are governed by the individual agreement signed for that engagement, which takes precedence over this page.</p>',
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'services',
                'title' => 'Services',
                'meta_title' => 'Services | Marketorr',
                'meta_description' => 'Branding, web and product design services built for measurable growth.',
                'sections' => [
                    [
                        'type' => SectionType::Services,
                        'name' => 'What we do',
                        'content' => self::servicesSectionContent(),
                    ],
                    [
                        'type' => SectionType::ClosingPanel,
                        'name' => 'Closing panel',
                        'content' => self::closingPanelContent(),
                    ],
                ],
            ],
            [
                'slug' => 'work',
                'title' => 'Our Work',
                'meta_title' => 'Our Work | Marketorr',
                'meta_description' => 'Selected branding, web and product work from the Marketorr studio.',
                'sections' => [
                    [
                        'type' => SectionType::Work,
                        'name' => 'Project index',
                        'content' => self::workPageContent(),
                    ],
                ],
            ],
        ];
    }

    /**
     * The landing page's Idea -> Experience -> Result chapters.
     *
     * @return array{heading: string, items: array<int, array{stage: string, title: string, body: string}>}
     */
    public static function processContent(): array
    {
        return [
            'heading' => 'How attention becomes results',
            'items' => [
                [
                    'stage' => 'Idea',
                    'title' => 'We find the angle.',
                    'body' => 'Research, positioning and strategy that give a brand a clear reason to be chosen.',
                ],
                [
                    'stage' => 'Experience',
                    'title' => 'We make it felt.',
                    'body' => 'Identity, interfaces and content crafted so people notice, understand and remember.',
                ],
                [
                    'stage' => 'Result',
                    'title' => 'We make it count.',
                    'body' => 'Work measured against real numbers - traffic, leads and revenue - never vanity metrics.',
                ],
            ],
        ];
    }

    /**
     * The press and award logos the About page also shows.
     *
     * @return array{heading: string, items: array<int, array{name: string, image: string}>}
     */
    /**
     * The About intro's label, heading, tagline and link; its body and
     * metrics come from the site defaults.
     *
     * @return array<string, mixed>
     */
    public static function aboutIntroContent(): array
    {
        return [
            'heading' => 'About',
            'titleLines' => ['We build brands', 'that move people.'],
            'titleHighlight' => 1,
            'tagline' => ['Creative thinking.', 'Digital execution.', 'Measurable results.'],
            'linkLabel' => 'Explore our services →',
            'linkUrl' => '/services',
        ];
    }

    /**
     * Keys that moved out of a section into a section of their own, by the
     * section type they moved out of.
     *
     * @var array<string, array<int, string>>
     */
    public const MOVED_KEYS = [
        'contact' => [
            'faqLabel', 'faqTitleLines', 'faqTitleHighlight', 'faqIntro', 'faqs', 'helpHeading', 'helpBody', 'helpLinkLabel',
            'connectLabel', 'connectTitleLines', 'connectTitleHighlight', 'connectBody', 'connectButtonLabel', 'closingNote',
        ],
        'services' => ['ctaLabel', 'ctaHeading', 'ctaButtonLabel', 'ctaButtonUrl'],
        'team' => ['awardsHeading', 'awards'],
    ];

    /**
     * The Contact section on its own: opening block and inquiry form.
     *
     * @return array<string, mixed>
     */
    public static function contactMainContent(): array
    {
        return array_diff_key(self::contactContent(), array_flip(self::MOVED_KEYS['contact']));
    }

    /**
     * The Contact page's FAQ section, built from a Contact section's content.
     *
     * @param  array<string, mixed>|null  $contact
     * @return array<string, mixed>
     */
    public static function contactFaqContent(?array $contact = null): array
    {
        $contact = [...self::contactContent(), ...array_filter($contact ?? [], fn ($value): bool => filled($value))];

        return [
            'label' => $contact['faqLabel'],
            'titleLines' => $contact['faqTitleLines'],
            'titleHighlight' => $contact['faqTitleHighlight'],
            'intro' => $contact['faqIntro'],
            'items' => $contact['faqs'],
            'helpHeading' => $contact['helpHeading'],
            'helpBody' => $contact['helpBody'],
            'helpLinkLabel' => $contact['helpLinkLabel'],
        ];
    }

    /**
     * The Contact page's "Let's connect" section, built from a Contact
     * section's content.
     *
     * @param  array<string, mixed>|null  $contact
     * @return array<string, mixed>
     */
    public static function contactConnectContent(?array $contact = null): array
    {
        $contact = [...self::contactContent(), ...array_filter($contact ?? [], fn ($value): bool => filled($value))];

        return [
            'label' => $contact['connectLabel'],
            'titleLines' => $contact['connectTitleLines'],
            'titleHighlight' => $contact['connectTitleHighlight'],
            'body' => $contact['connectBody'],
            'buttonLabel' => $contact['connectButtonLabel'],
            'closingNote' => $contact['closingNote'],
        ];
    }

    /**
     * The Services section on its own, without the Services page's closing panel.
     *
     * @return array<string, mixed>
     */
    public static function servicesSectionContent(): array
    {
        return array_diff_key(self::servicesContent(), array_flip(self::MOVED_KEYS['services']));
    }

    /**
     * The Services page's closing panel, built from a Services section's content.
     *
     * @param  array<string, mixed>|null  $services
     * @return array<string, mixed>
     */
    public static function closingPanelContent(?array $services = null): array
    {
        $services = [...self::servicesContent(), ...array_filter($services ?? [], fn ($value): bool => filled($value))];

        return [
            'label' => $services['ctaLabel'],
            'heading' => $services['ctaHeading'],
            'buttonLabel' => $services['ctaButtonLabel'],
            'buttonUrl' => $services['ctaButtonUrl'],
        ];
    }

    /**
     * The About page's leadership section, without the awards strip.
     *
     * @return array<string, mixed>
     */
    public static function aboutLeadershipContent(): array
    {
        return array_diff_key(self::aboutTeamContent(), array_flip(self::MOVED_KEYS['team']));
    }

    /**
     * The About page's awards strip, built from a leadership section's content.
     *
     * @param  array<string, mixed>|null  $team
     * @return array<string, mixed>
     */
    public static function aboutAwardsContent(?array $team = null): array
    {
        $team = [...self::aboutTeamContent(), ...array_filter($team ?? [], fn ($value): bool => filled($value))];

        return [
            'heading' => $team['awardsHeading'],
            'items' => $team['awards'],
        ];
    }

    /**
     * The Services section: the landing page heading and the Services page's
     * closing panel.
     *
     * @return array<string, mixed>
     */
    public static function servicesContent(): array
    {
        return [
            'heading' => 'Services',
            'titleLines' => ['Two disciplines.', 'One clear outcome.'],
            'titleHighlight' => 1,
            'intro' => '',
            'ctaLabel' => 'Have a project in mind?',
            'ctaHeading' => 'Let’s make it matter.',
            'ctaButtonLabel' => 'Start a project',
            'ctaButtonUrl' => '/contact',
        ];
    }

    /**
     * The landing page's branding work showcase.
     *
     * @return array<string, mixed>
     */
    public static function homeWorkContent(): array
    {
        return [
            'heading' => 'Our Work',
            'titleLines' => ['Brands that', 'create impact.'],
            'titleHighlight' => 1,
            'title' => '',
            'intro' => 'Selected branding work: identities, logos, packaging and the campaigns that carry them.',
            'scrollHint' => '',
        ];
    }

    /**
     * The Our Work page's opening: label, big title and live counts.
     *
     * @return array<string, mixed>
     */
    public static function workPageContent(): array
    {
        return [
            'heading' => 'Our Work',
            'titleLines' => [],
            'titleHighlight' => 0,
            'title' => 'Work',
            'intro' => '{projects} projects across {practices} practices. Choose one to step inside.',
            'scrollHint' => 'Scroll ↓',
            'brandingTitle' => 'Branding Portfolio',
            'uiuxTitle' => 'UI/UX Portfolio',
            'countLabel' => '{count} projects',
            'countLabelOne' => '{count} project',
            'openLabel' => 'Open portfolio',
        ];
    }

    /**
     * The landing page's UI/UX printer section.
     *
     * @return array<string, mixed>
     */
    public static function uiuxWorkContent(): array
    {
        return [
            'heading' => 'UI/UX Work',
            'titleLines' => ['Interfaces', 'that convert.'],
            'titleHighlight' => 1,
            'intro' => 'Websites, apps and SaaS products, printed one project at a time. Pick one to see every screen.',
            'linkLabel' => 'Full UI/UX portfolio →',
        ];
    }

    /**
     * Every piece of copy in the Contact section: the opening block, the
     * inquiry form, and (on the Contact page) the FAQ and "Let's connect".
     *
     * @return array<string, mixed>
     */
    public static function contactContent(): array
    {
        return [
            'heading' => 'Contact',
            'titleLines' => ['Have a project?', 'Let’s make', 'it matter.'],
            'titleHighlight' => 2,
            'intro' => 'Tell us about the work and we will come back with a clear direction, scope and next steps. Two practices: Branding, and UI/UX.',
            'emailTileLabel' => 'Email',
            'phoneTileLabel' => 'Phone',
            'locationTileLabel' => 'Location',
            'mapLinkLabel' => 'Open in Google Maps →',
            'formLabel' => 'Send us a message',
            'formHeading' => 'Let’s build something great',
            'formIntro' => 'Share a few details and we will get in touch shortly.',
            'nameLabel' => 'Your name*',
            'namePlaceholder' => 'Jane Cooper',
            'emailLabel' => 'Email*',
            'emailPlaceholder' => 'jane@company.com',
            'phoneLabel' => 'Phone',
            'phonePlaceholder' => '+880 1700 000000',
            'companyLabel' => 'Company',
            'companyPlaceholder' => 'Company Inc.',
            'budgetLabel' => 'Budget range',
            'budgetPlaceholder' => 'Select a budget',
            'budgets' => ['$10k - $25k', 'Under $10k', '$25k - $50k', '$50k+', 'Not sure yet'],
            'typeLabel' => 'Project type',
            'typePlaceholder' => 'Select a project type',
            'projectTypes' => ['Branding', 'UI/UX'],
            'messageLabel' => 'Message*',
            'messagePlaceholder' => 'Tell us about your goals, timeline, and what success looks like...',
            'submitLabel' => 'Send inquiry',
            'sendingLabel' => 'Sending...',
            'formNote' => 'No spam. NDA-friendly.',
            'successHeading' => 'Thank you — your inquiry is in',
            'successBody' => 'We’ve received your details and will reply within 24–48 hours. A copy of the conversation will come from {email}.',
            'sendAnotherLabel' => 'Send another message',
            'faqLabel' => 'FAQs',
            'faqTitleLines' => ['Clear answers', 'before we start'],
            'faqTitleHighlight' => 1,
            'faqIntro' => 'What we do, what we need from you, and how quickly you will hear back.',
            'faqs' => [
                ['question' => 'What does Marketorr do?', 'answer' => 'Two practices. Branding: identities that demand attention. UI/UX: interfaces engineered to convert.'],
                ['question' => 'What sits under Branding?', 'answer' => 'Brand Strategy, Brand Identity Design, Rebranding, Packaging Design, Motion Branding and Brand Guidelines.'],
                ['question' => 'What sits under UI/UX?', 'answer' => 'Website UI/UX Design, Mobile App UI/UX, SaaS Product Design, UX Research & Strategy, Wireframing & Prototyping and Design Systems.'],
                ['question' => 'How soon will you reply?', 'answer' => 'We reply within 24–48 hours of receiving an inquiry.'],
                ['question' => 'What do you need to start?', 'answer' => 'Your name and email, the project type, a budget range, and a note on your goals, timeline and what success looks like.'],
                ['question' => 'Do you work with NDAs?', 'answer' => 'Yes, inquiries are NDA-friendly, and we never pass your details on.'],
                ['question' => 'Where is the studio?', 'answer' => 'Remote-first and working worldwide, from Natore Tower, Plot 32D & E, Road 2, Sector 3, Uttara, Dhaka 1230.'],
            ],
            'helpHeading' => 'Still have questions?',
            'helpBody' => 'Send the details and we will come back to you.',
            'helpLinkLabel' => 'Contact us',
            'connectLabel' => 'Let’s connect',
            'connectTitleLines' => ['Let’s build', 'something'],
            'connectTitleHighlight' => 1,
            'connectBody' => 'We’re currently available for select projects and collaborations. Let’s create digital experiences that leave a lasting impact.',
            'connectButtonLabel' => 'Start a project',
            'closingNote' => 'We reply within 24–48 hours',
        ];
    }

    /**
     * The About page's "Our story" section: intro, pull quote and timeline.
     *
     * @return array<string, mixed>
     */
    public static function aboutStoryContent(): array
    {
        return [
            'label' => 'Our story',
            'heading' => 'Born to cut noise',
            'highlight' => 2,
            'intro' => 'Marketorr was born in 2022 from a shared vision between two founders who had watched too many good businesses drown in vanity metrics. The antidote became the company promise:',
            'quote' => 'Just Results.',
            'items' => [
                [
                    'year' => '2022',
                    'title' => 'Two visionaries, one promise',
                    'copy' => 'Marketorr is born from a shared vision: help businesses cut through the noise and achieve meaningful growth. The founding promise, “Just Results”, still runs every engagement.',
                ],
                [
                    'year' => 'Today',
                    'title' => 'A full-stack growth crew',
                    'copy' => 'Strategists, media buyers, SEO specialists, designers and writers across Bangladesh and beyond: one dedicated pod behind every brand, led by CEO Kamrul Hasan Naim.',
                ],
                [
                    'year' => 'Proof',
                    'title' => 'Attention into revenue',
                    'copy' => 'From zero-to-1M-BDT launches to 2100% organic-traffic turnarounds, the work compounds: 100+ brands now grow on Marketorr-built engines.',
                ],
            ],
        ];
    }

    /**
     * The About page's Vision and Mission cards.
     *
     * @return array<string, mixed>
     */
    public static function aboutMissionVisionContent(): array
    {
        return [
            'highlight' => 1,
            'items' => [
                [
                    'label' => 'Our vision',
                    'title' => 'Our Vision',
                    'copy' => 'To redefine digital marketing in Bangladesh and beyond: every campaign purposeful, data-driven and built for lasting growth, from the trusted partner businesses choose for clarity and measurable impact.',
                    'image' => '/images/about/vision-cartoon.png',
                    'imageAlt' => '3D character exploring ideas with a laptop',
                ],
                [
                    'label' => 'Our mission',
                    'title' => 'Our Mission',
                    'copy' => 'To help businesses grow through digital marketing that connects, engages and converts: blending creativity, technology and data into strategies that turn marketing into a true engine for growth.',
                    'image' => '/images/about/mission-cartoon.png',
                    'imageAlt' => '3D character carrying a laptop toward a goal',
                ],
            ],
        ];
    }

    /**
     * The About page's leadership portrait and awards strip.
     *
     * @return array<string, mixed>
     */
    public static function aboutTeamContent(): array
    {
        $awards = [
            ['GoodFirms', 'Agency recognition', 'goodfirms.png'],
            ['CrowdReviews', 'Agency recognition', 'crowdreviews.png'],
            ['NTV', 'Featured in', 'ntv.png'],
            ['The Business Standard', 'Featured in', 'business-standard.png'],
            ['Asian Online', 'Featured in', 'asian-online.png'],
            ['Bangladesh Pratidin', 'Featured in', 'bangladesh-pratidin.png'],
            ['Samakal', 'Featured in', 'samakal.png'],
            ['Banglanews24', 'Featured in', 'banglanews.jpg'],
            ['Daily Inqilab', 'Featured in', 'inqilab.png'],
            ['Bhorer Kagoj', 'Featured in', 'bhorer-kagoj.png'],
            ['Bangladesh Post', 'Featured in', 'bangladesh-post.png'],
        ];

        return [
            'label' => 'Leadership',
            'heading' => 'Minds behind the growth',
            'highlight' => 2,
            'name' => 'Md Kamrul Hasan Naim',
            'role' => 'Founder & CEO',
            'bio' => 'Leads Marketorr with a performance-first mindset, turning fast action, practical solutions and clear strategy into measurable growth for ambitious brands.',
            'image' => '/images/about/kamrul-hasan-naim.jpg',
            'awardsHeading' => 'Awards & Recognition',
            'awards' => array_map(fn (array $award): array => [
                'name' => $award[0],
                'detail' => $award[1],
                'image' => '/images/about/recognition/'.$award[2],
            ], $awards),
        ];
    }

    public static function recognitionContent(): array
    {
        $logos = [
            'GoodFirms' => 'goodfirms.png',
            'CrowdReviews' => 'crowdreviews.png',
            'NTV' => 'ntv.png',
            'The Business Standard' => 'business-standard.png',
            'Asian Online' => 'asian-online.png',
            'Bangladesh Pratidin' => 'bangladesh-pratidin.png',
            'Samakal' => 'samakal.png',
            'Banglanews24' => 'banglanews.jpg',
            'Daily Inqilab' => 'inqilab.png',
            'Bhorer Kagoj' => 'bhorer-kagoj.png',
            'Bangladesh Post' => 'bangladesh-post.png',
        ];

        return [
            'heading' => 'Featured and recognised',
            'items' => collect($logos)
                ->map(fn (string $file, string $name): array => [
                    'name' => $name,
                    'image' => '/images/about/recognition/'.$file,
                ])
                ->values()
                ->all(),
        ];
    }
}
