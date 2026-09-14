<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Transcribes the original `resources/js/lib/services.js` catalogue.
 */
class ServiceSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach ($this->services() as $order => $service) {
            $service['sort_order'] = $order;
            $service['status'] = ContentStatus::Published;

            Service::query()->updateOrCreate(
                ['slug' => $service['slug']],
                $service,
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function services(): array
    {
        return [
            [
                'slug' => 'branding',
                'index_label' => '01',
                'name' => 'Branding',
                'short' => 'Identities that demand attention.',
                'description' => 'Strategy-led identities — positioning, naming, visual systems and guidelines that make ambitious brands impossible to ignore.',
                'accent' => '#891FFB',
                'accent_to' => null,
                'capabilities' => [
                    'Brand Strategy',
                    'Visual Identity',
                    'Logo Systems',
                    'Typography',
                    'Color Systems',
                    'Brand Guidelines',
                    'Campaign Identity',
                    'Creative Direction',
                ],
                'deliverables' => ['Strategy deck', 'Identity system', 'Guidelines', 'Launch kit'],
                'outcomes' => [
                    ['value' => '3.2x', 'label' => 'Avg. brand recall lift'],
                    ['value' => '48+', 'label' => 'Identities shipped'],
                ],
            ],
            [
                'slug' => 'web-ui-ux',
                'index_label' => '02',
                'name' => 'Web UI/UX',
                'short' => 'Websites engineered to convert.',
                'description' => 'High-converting marketing sites and web experiences — architecture, interface, motion and design systems built for growth.',
                'accent' => '#891FFB',
                'accent_to' => '#507AF4',
                'capabilities' => [
                    'UX Strategy',
                    'Website Architecture',
                    'Wireframing',
                    'UI Design',
                    'Responsive Design',
                    'Interaction Design',
                    'Design Systems',
                    'Prototyping',
                ],
                'deliverables' => ['Sitemap & UX', 'UI screens', 'Design system', 'Prototype'],
                'outcomes' => [
                    ['value' => '2.4x', 'label' => 'Avg. conversion lift'],
                    ['value' => '60+', 'label' => 'Sites launched'],
                ],
            ],
            [
                'slug' => 'software-ui-ux',
                'index_label' => '03',
                'name' => 'Software UI/UX',
                'short' => 'Complex products, made clear.',
                'description' => 'SaaS, dashboards and enterprise tools — workflows, data-viz and scalable systems that teams love to use.',
                'accent' => '#507AF4',
                'accent_to' => null,
                'capabilities' => [
                    'SaaS UI/UX',
                    'Dashboard Design',
                    'Admin Panels',
                    'CRM UI',
                    'ERP Interfaces',
                    'Data Visualization',
                    'Workflow Design',
                    'Enterprise Design Systems',
                ],
                'deliverables' => ['Flows & IA', 'Product UI', 'Component library', 'Handoff specs'],
                'outcomes' => [
                    ['value' => '-38%', 'label' => 'Avg. task-time reduction'],
                    ['value' => '35+', 'label' => 'Products designed'],
                ],
            ],
            [
                'slug' => 'mobile-app-ui-ux',
                'index_label' => '04',
                'name' => 'Mobile App UI/UX',
                'short' => 'Apps people keep opening.',
                'description' => 'Native-feel iOS and Android experiences — flows, micro-interactions and prototypes tuned for retention.',
                'accent' => '#507AF4',
                'accent_to' => '#1BE2EB',
                'capabilities' => [
                    'User Flows',
                    'Information Architecture',
                    'Android UI',
                    'iOS UI',
                    'Mobile Design Systems',
                    'Interactive Prototypes',
                    'Micro-interactions',
                    'Developer Handoff',
                ],
                'deliverables' => ['Flows', 'App UI kit', 'Prototype', 'Store assets'],
                'outcomes' => [
                    ['value' => '4.8★', 'label' => 'Avg. store rating'],
                    ['value' => '40+', 'label' => 'Apps shipped'],
                ],
            ],
            [
                'slug' => 'website-design',
                'index_label' => '05',
                'name' => 'Website Design',
                'short' => 'Marketing sites that earn the click.',
                'description' => 'End-to-end website design — narrative, layout, responsive craft and CMS-ready components that keep the brand sharp on every screen.',
                'accent' => '#891FFB',
                'accent_to' => null,
                'capabilities' => [
                    'Content Strategy',
                    'Page Layout Design',
                    'Responsive Design',
                    'Landing Page Design',
                    'CMS Templates',
                    'Visual Direction',
                    'Accessibility',
                    'Performance-aware Design',
                ],
                'deliverables' => ['Sitemap', 'Page designs', 'Responsive specs', 'CMS component kit'],
                'outcomes' => [
                    ['value' => '2.1x', 'label' => 'Avg. engagement lift'],
                    ['value' => '90+', 'label' => 'Pages designed'],
                ],
            ],
            [
                'slug' => 'mobile-app-design',
                'index_label' => '06',
                'name' => 'Mobile App Design',
                'short' => 'Native experiences, end to end.',
                'description' => 'Full mobile app design from onboarding to settings — screen systems, platform patterns and handoff-ready specs for iOS and Android.',
                'accent' => '#891FFB',
                'accent_to' => '#507AF4',
                'capabilities' => [
                    'Onboarding Design',
                    'Navigation Patterns',
                    'iOS Human Interface',
                    'Material Design',
                    'Component Libraries',
                    'Dark Mode',
                    'Empty & Error States',
                    'Developer Handoff',
                ],
                'deliverables' => ['Screen inventory', 'App UI kit', 'Interactive prototype', 'Handoff specs'],
                'outcomes' => [
                    ['value' => '+34%', 'label' => 'Avg. day-30 retention'],
                    ['value' => '25+', 'label' => 'Apps delivered'],
                ],
            ],
            [
                'slug' => 'saas-web-app-design',
                'index_label' => '07',
                'name' => 'SaaS & Web App Design',
                'short' => 'Products that scale with the roadmap.',
                'description' => 'Interface design for SaaS platforms and web apps — onboarding, billing, permissions and dense data views that stay usable as the product grows.',
                'accent' => '#507AF4',
                'accent_to' => null,
                'capabilities' => [
                    'Product Onboarding',
                    'Dashboard Design',
                    'Data Tables',
                    'Role & Permission UI',
                    'Billing Flows',
                    'Settings Architecture',
                    'Responsive App Layouts',
                    'Component Libraries',
                ],
                'deliverables' => ['Product IA', 'Core flows', 'UI screens', 'Component library'],
                'outcomes' => [
                    ['value' => '-41%', 'label' => 'Avg. support tickets'],
                    ['value' => '30+', 'label' => 'Platforms designed'],
                ],
            ],
            [
                'slug' => 'e-commerce-design',
                'index_label' => '08',
                'name' => 'E-commerce Design',
                'short' => 'Storefronts built to check out.',
                'description' => 'Catalogue, product and checkout design tuned for conversion — merchandising, filters and a payment flow that removes every avoidable drop-off.',
                'accent' => '#507AF4',
                'accent_to' => '#1BE2EB',
                'capabilities' => [
                    'Catalogue Architecture',
                    'Product Detail Pages',
                    'Search & Filtering',
                    'Cart & Checkout UX',
                    'Merchandising Design',
                    'Mobile Commerce',
                    'Trust & Review UI',
                    'Conversion Optimization',
                ],
                'deliverables' => ['Store IA', 'Key page designs', 'Checkout flow', 'Design system'],
                'outcomes' => [
                    ['value' => '+27%', 'label' => 'Avg. checkout completion'],
                    ['value' => '45+', 'label' => 'Stores designed'],
                ],
            ],
            [
                'slug' => 'product-design',
                'index_label' => '09',
                'name' => 'Product Design',
                'short' => 'From problem to shipped product.',
                'description' => 'Discovery-led product design — research, concept validation, MVP scoping and iteration cycles that keep design tied to real user outcomes.',
                'accent' => '#1BE2EB',
                'accent_to' => null,
                'capabilities' => [
                    'User Research',
                    'Jobs-to-be-Done',
                    'Concept Validation',
                    'MVP Definition',
                    'Interaction Design',
                    'Usability Testing',
                    'Design Iteration',
                    'Roadmap Support',
                ],
                'deliverables' => ['Research synthesis', 'Concept directions', 'MVP design', 'Validation report'],
                'outcomes' => [
                    ['value' => '3.5x', 'label' => 'Avg. faster validation'],
                    ['value' => '20+', 'label' => 'Products launched'],
                ],
            ],
            [
                'slug' => 'ux-audit-optimization',
                'index_label' => '10',
                'name' => 'UX Audit & Optimization',
                'short' => 'Find the leaks. Fix the funnel.',
                'description' => 'Heuristic review, analytics and session data combined into a prioritised fix list — then the redesigns and tests that prove the lift.',
                'accent' => '#891FFB',
                'accent_to' => null,
                'capabilities' => [
                    'Heuristic Evaluation',
                    'Analytics Review',
                    'Funnel Analysis',
                    'Usability Testing',
                    'Accessibility Audit',
                    'Conversion Optimization',
                    'A/B Test Design',
                    'Prioritised Roadmap',
                ],
                'deliverables' => ['Audit report', 'Prioritised fix list', 'Redesigned flows', 'Test plan'],
                'outcomes' => [
                    ['value' => '+38%', 'label' => 'Avg. conversion lift'],
                    ['value' => '70+', 'label' => 'Audits completed'],
                ],
            ],
            [
                'slug' => 'wireframing-prototyping',
                'index_label' => '11',
                'name' => 'Wireframing & Prototyping',
                'short' => 'Test the idea before you build it.',
                'description' => 'Low- to high-fidelity wireframes and clickable prototypes that settle structure, flow and scope before a line of code is written.',
                'accent' => '#891FFB',
                'accent_to' => '#507AF4',
                'capabilities' => [
                    'Information Architecture',
                    'User Flows',
                    'Low-fidelity Wireframes',
                    'High-fidelity Wireframes',
                    'Clickable Prototypes',
                    'Concept Testing',
                    'Scope Definition',
                    'Stakeholder Walkthroughs',
                ],
                'deliverables' => ['Flow diagrams', 'Wireframe set', 'Clickable prototype', 'Scope notes'],
                'outcomes' => [
                    ['value' => '-45%', 'label' => 'Avg. rework in build'],
                    ['value' => '100+', 'label' => 'Prototypes built'],
                ],
            ],
            [
                'slug' => 'design-systems',
                'index_label' => '12',
                'name' => 'Design Systems',
                'short' => 'One source of truth for every screen.',
                'description' => 'Tokenised, documented component libraries that keep design and engineering in step — built to extend, version and hand over cleanly.',
                'accent' => '#507AF4',
                'accent_to' => '#1BE2EB',
                'capabilities' => [
                    'Design Tokens',
                    'Component Libraries',
                    'Pattern Documentation',
                    'Accessibility Standards',
                    'Theming & Dark Mode',
                    'Figma Architecture',
                    'Governance Model',
                    'Engineering Handoff',
                ],
                'deliverables' => ['Token set', 'Component library', 'Usage documentation', 'Governance guide'],
                'outcomes' => [
                    ['value' => '2.8x', 'label' => 'Avg. faster delivery'],
                    ['value' => '18+', 'label' => 'Systems shipped'],
                ],
            ],
        ];
    }
}
