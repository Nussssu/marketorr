<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\ServiceGroup;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Transcribes the original `config/subservices.php` catalogue: the two
 * showcase groups (Branding, UI/UX) and their six sub-services each.
 *
 * The Services page tabs, the dedicated `/services/{group}/{item}` pages,
 * the header menus and the sitemap all read this data from the database, so
 * the whole catalogue stays maintainable from the admin panel.
 */
class SubServiceCatalogueSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach ($this->catalogue() as $order => $group) {
            $items = $group['items'];
            unset($group['items']);

            $group['sort_order'] = $order;
            $group['status'] = ContentStatus::Published;

            $record = ServiceGroup::query()->updateOrCreate(
                ['slug' => $group['slug']],
                $group,
            );

            foreach ($items as $position => $item) {
                $item['sort_order'] = $position;
                $item['status'] = ContentStatus::Published;

                $record->subServices()->updateOrCreate(
                    ['slug' => $item['slug']],
                    [...$item, 'service_group_id' => $record->id],
                );
            }
        }

        ServiceGroup::forgetCatalogue();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function catalogue(): array
    {
        return [
            [
                'slug' => 'branding',
                'name' => 'Branding',
                'tagline' => 'Identities that demand attention.',
                'accent' => '#891FFB',
                'items' => [
                    [
                        'slug' => 'brand-strategy',
                        'name' => 'Brand Strategy',
                        'short' => 'Positioning that makes choosing you obvious.',
                        'description' => 'Research-led positioning, audience insight and messaging hierarchies that give every brand decision a sharp strategic backbone, so the creative that follows has something true to stand on.',
                        'deliverables' => ['Positioning statement', 'Audience & competitor audit', 'Messaging hierarchy', 'Verbal identity starter'],
                        'image' => null,
                        'image_alt' => 'NTNB Agro visual identity cover from the Marketorr portfolio',
                        'accent' => '#891FFB',
                        'related_match' => ['Visual Identity', 'Brand Identity', 'Campaign'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'brand-identity-design',
                        'name' => 'Brand Identity Design',
                        'short' => 'Visual identities with gravity.',
                        'description' => 'Logo systems, typography, color and art direction composed into a distinctive identity toolkit, built to stay recognizable from favicon to facade.',
                        'deliverables' => ['Logo suite & lockups', 'Typography system', 'Color palette', 'Art direction'],
                        'image' => null,
                        'image_alt' => 'Imperial Jute minimal logo and brand cover',
                        'accent' => '#507AF4',
                        'related_match' => ['Brand Identity', 'Visual Identity', 'Logo Design'],
                        'related_pin' => ['medica-lifecare-brand-identity', 'dusty-vision'],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'rebranding',
                        'name' => 'Rebranding',
                        'short' => 'New chapters, zero confusion.',
                        'description' => 'End-to-end rebrands (audit, strategy, identity and rollout planning) that move market perception without losing the equity you have already earned.',
                        'deliverables' => ['Brand audit', 'Migration strategy', 'Refreshed identity', 'Launch rollout kit'],
                        'image' => null,
                        'image_alt' => 'Sabdita Fashion rebranding cover',
                        'accent' => '#1BE2EB',
                        'related_match' => ['Rebranding'],
                        'related_pin' => [],
                        'case_study' => [
                            'meta' => 'Published November 2023 · Crafted in Illustrator, Photoshop and After Effects',
                            'sections' => [
                                [
                                    'eyebrow' => 'About the project',
                                    'heading' => 'A women\'s clothing brand, reimagined',
                                    'body' => 'Tasked with rebranding Sabdita Fashion, a women\'s clothing brand, the goal was to infuse the identity with modern minimalism, reflecting the elegance of today\'s fashion-forward woman.',
                                    'images' => [
                                        ['src' => '/images/work/sabdita/about.jpg', 'alt' => 'About Sabdita Fashion'],
                                        ['src' => '/images/work/sabdita/logo-presentation.jpg', 'alt' => 'Sabdita Fashion logo presentation'],
                                    ],
                                ],
                                [
                                    'eyebrow' => 'Design journey',
                                    'heading' => 'From ethos to identity',
                                    'body' => 'The process began with understanding Sabdita\'s ethos and audience, leading to a design that balances sophistication with contemporary style.',
                                    'images' => [
                                        ['src' => '/images/work/sabdita/brand-positioning.jpg', 'alt' => 'Sabdita Fashion brand positioning'],
                                        ['src' => '/images/work/sabdita/brand-messaging.jpg', 'alt' => 'Sabdita Fashion brand messaging'],
                                    ],
                                ],
                                [
                                    'eyebrow' => 'Audience',
                                    'heading' => 'Made for the fashion-forward woman',
                                    'body' => 'Every choice speaks to a style-conscious female audience: elegance expressed through restraint, in line with the brand\'s vision of empowering women through fashion.',
                                    'images' => [],
                                ],
                                [
                                    'eyebrow' => 'Colour & typography',
                                    'heading' => 'Clean, modern, deliberate',
                                    'body' => 'The chosen colour palette and typography carry the same idea throughout: a clean, modern look that stays legible from hangtag to billboard.',
                                    'images' => [
                                        ['src' => '/images/work/sabdita/typo-color-animation.gif', 'alt' => 'Sabdita Fashion typography and colour presentation'],
                                    ],
                                ],
                                [
                                    'eyebrow' => 'Final identity',
                                    'heading' => 'Minimalist beauty, explained',
                                    'body' => 'The new logo encapsulates minimalist beauty: a mark whose concept, construction and backgrounds are documented as part of the system.',
                                    'images' => [
                                        ['src' => '/images/work/sabdita/logo-explainer.jpg', 'alt' => 'Sabdita Fashion logo concept explanation'],
                                        ['src' => '/images/work/sabdita/logo-backgrounds.jpg', 'alt' => 'Sabdita Fashion logo on different backgrounds'],
                                    ],
                                ],
                                [
                                    'eyebrow' => 'In motion',
                                    'heading' => 'The identity, alive',
                                    'body' => 'Logo animations bring the mark to life across screens and social.',
                                    'images' => [
                                        ['src' => '/images/work/sabdita/logo-intro-animation.gif', 'alt' => 'Sabdita Fashion logo intro animation'],
                                        ['src' => '/images/work/sabdita/logo-motion-s.webp', 'alt' => 'Sabdita Fashion S logo animation'],
                                        ['src' => '/images/work/sabdita/logo-animation.webp', 'alt' => 'Sabdita Fashion animated logo'],
                                    ],
                                ],
                                [
                                    'eyebrow' => 'Applications',
                                    'heading' => 'One system, every touchpoint',
                                    'body' => 'The theme extends across all branding elements (stationery, packaging and out-of-home), reinforcing Sabdita\'s presence in the women\'s fashion sector.',
                                    'images' => [
                                        ['src' => '/images/work/sabdita/thank-you-card.jpg', 'alt' => 'Sabdita Fashion thank you card design'],
                                        ['src' => '/images/work/sabdita/envelope.jpg', 'alt' => 'Sabdita Fashion envelope design'],
                                        ['src' => '/images/work/sabdita/packaging.jpg', 'alt' => 'Sabdita Fashion packaging design'],
                                        ['src' => '/images/work/sabdita/ribbon.jpg', 'alt' => 'Sabdita Fashion ribbon design'],
                                        ['src' => '/images/work/sabdita/hangtag.jpg', 'alt' => 'Sabdita Fashion hangtag design'],
                                        ['src' => '/images/work/sabdita/billboard.jpg', 'alt' => 'Sabdita Fashion billboard design'],
                                    ],
                                ],
                                [
                                    'eyebrow' => 'Impact',
                                    'heading' => 'Engagement, elevated',
                                    'body' => 'Post-redesign, Sabdita Fashion has seen a positive shift in market engagement, resonating well with a style-conscious female audience and elevating the brand\'s appeal.',
                                    'images' => [],
                                ],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'packaging-design',
                        'name' => 'Packaging Design',
                        'short' => 'Shelf presence that sells.',
                        'description' => 'Structural thinking plus standout surface design for physical products, from dielines to shelf-blocking systems that convert at a glance.',
                        'deliverables' => ['Structural concepts', 'Surface design system', 'Print-ready dielines', 'Mockups & renders'],
                        'image' => null,
                        'image_alt' => 'Product packaging in hand, spray and pump bottles on shelf',
                        'accent' => '#891FFB',
                        'related_match' => ['Packaging'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'motion-branding',
                        'name' => 'Motion Branding',
                        'short' => 'Identities that move.',
                        'description' => 'Logo animations, kinetic typography and motion principles that give your brand a living rhythm: recognizable across video, social and product.',
                        'deliverables' => ['Motion principles', 'Logo animation suite', 'Kinetic type presets', 'Handoff files (Lottie/MP4)'],
                        'image' => null,
                        'image_alt' => 'Dusty Vision visual identity cover',
                        'accent' => '#507AF4',
                        'related_match' => [],
                        'related_pin' => ['amanah-global-network', 'virgin-trend', 'city-online-brand-design', 'sabdita-fashion'],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'brand-guidelines',
                        'name' => 'Brand Guidelines',
                        'short' => 'Consistency, documented.',
                        'description' => 'Living guideline systems (rules, examples, templates and governance) so every team and vendor ships on-brand without guesswork.',
                        'deliverables' => ['Guideline book', 'Do & don\'t library', 'Template starter kit', 'Governance checklist'],
                        'image' => null,
                        'image_alt' => 'Virgin Trend fashion brand identity cover',
                        'accent' => '#1BE2EB',
                        'related_match' => ['Identity Guidelines', 'Brand Identity'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                ],
            ],
            [
                'slug' => 'ui-ux',
                'name' => 'UI/UX',
                'tagline' => 'Interfaces engineered to convert.',
                'accent' => '#507AF4',
                'items' => [
                    [
                        'slug' => 'website-ui-ux-design',
                        'name' => 'Website UI/UX Design',
                        'short' => 'Websites engineered to convert.',
                        'description' => 'Marketing sites and web experiences where information architecture, interface and motion are tuned to one metric: turning visitors into customers.',
                        'deliverables' => ['Sitemap & UX flows', 'High-fidelity UI', 'Responsive breakpoints', 'Conversion checklist'],
                        'image' => null,
                        'image_alt' => 'City Online website UI design case study cover',
                        'accent' => '#891FFB',
                        'related_match' => ['Website UI/UX Design', 'Website Design'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'mobile-app-ui-ux',
                        'name' => 'Mobile App UI/UX',
                        'short' => 'Apps people keep opening.',
                        'description' => 'Native-feel iOS and Android flows with micro-interactions and prototypes tuned for activation, retention and store ratings.',
                        'deliverables' => ['User flows & IA', 'App UI kit', 'Interactive prototype', 'Store assets'],
                        'image' => null,
                        'image_alt' => 'Photo Fix Zone mobile app interface on a handset',
                        'accent' => '#507AF4',
                        'related_match' => ['Responsive Design'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'saas-product-design',
                        'name' => 'SaaS Product Design',
                        'short' => 'Complex products, made clear.',
                        'description' => 'Dashboards, workflows and data-dense SaaS interfaces designed for clarity, plus scalable component systems your team can build on.',
                        'deliverables' => ['Workflow & IA maps', 'Product UI screens', 'Component library', 'Data-viz patterns'],
                        'image' => null,
                        'image_alt' => 'Engineering consulting firm visual identity cover',
                        'accent' => '#1BE2EB',
                        'related_match' => ['Product UI/UX'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'ux-research-strategy',
                        'name' => 'UX Research & Strategy',
                        'short' => 'Decisions backed by evidence.',
                        'description' => 'Stakeholder interviews, usability testing, journey mapping and heuristic audits that turn assumptions into a prioritized product roadmap.',
                        'deliverables' => ['Research plan & scripts', 'Usability test reports', 'Journey maps', 'Prioritized roadmap'],
                        'image' => null,
                        'image_alt' => 'Research and analytics session, data boards under review',
                        'accent' => '#891FFB',
                        'related_match' => ['Wireframes', 'Moodboard'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'wireframing-prototyping',
                        'name' => 'Wireframing & Prototyping',
                        'short' => 'Validate before you build.',
                        'description' => 'Low-to-high fidelity wireframes and clickable prototypes that de-risk development by testing structure and flows with real users early.',
                        'deliverables' => ['Lo-fi wireframes', 'Clickable prototypes', 'Test & iterate cycles', 'Dev-ready specs'],
                        'image' => null,
                        'image_alt' => 'AnimateUIX prototype in progress, screens wired end to end',
                        'accent' => '#507AF4',
                        'related_match' => ['Wireframes', 'Prototype'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                    [
                        'slug' => 'design-system',
                        'name' => 'Design System',
                        'short' => 'One language for product.',
                        'description' => 'Token-based design systems (foundations, components, patterns and documentation) that keep quality high and shipping fast as teams grow.',
                        'deliverables' => ['Design tokens', 'Component library', 'Usage documentation', 'Governance model'],
                        'image' => null,
                        'image_alt' => 'Ecohub Essentials component library applied across a storefront',
                        'accent' => '#1BE2EB',
                        'related_match' => ['Design System', 'Style Guide', 'Components'],
                        'related_pin' => [],
                        'case_study' => null,
                    ],
                ],
            ],
        ];
    }
}
