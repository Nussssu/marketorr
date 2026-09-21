<?php

/*
|--------------------------------------------------------------------------
| Sub-service catalogue
|--------------------------------------------------------------------------
|
| The two showcase categories and their sub-services. Each entry powers the
| Services slider (featured image, title, short description, CTA) and its
| dedicated page at /services/{category}/{sub-service}.
|
| `image` is the one visual a sub-service is known by: the showcase on the
| category page, the shared-element transition and the hero of the dedicated
| page all render this same file, which is what lets the visual the reader
| clicked become the hero they land on. Replacing a photograph here changes it
| everywhere, in step. These are real project photographs on purpose - the
| showcase reads as work, not as iconography.
|
*/

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
                'description' => 'Research-led positioning, audience insight and messaging hierarchies that give every brand decision a sharp strategic backbone — so the creative that follows has something true to stand on.',
                'deliverables' => ['Positioning statement', 'Audience & competitor audit', 'Messaging hierarchy', 'Verbal identity starter'],
                'image' => '/images/work/nature-to-near.jpg',
                'imageAlt' => 'Near To Nature brand campaign — harvester at golden hour under the brand mark',
                'accent' => '#891FFB',
            ],
            [
                'slug' => 'brand-identity-design',
                'name' => 'Brand Identity Design',
                'short' => 'Visual identities with gravity.',
                'description' => 'Logo systems, typography, color and art direction composed into a distinctive identity toolkit — built to stay recognizable from favicon to facade.',
                'deliverables' => ['Logo suite & lockups', 'Typography system', 'Color palette', 'Art direction'],
                'image' => '/images/work/imperial-jute-brand.jpg',
                'imageAlt' => 'Imperial Jute identity system — signage, stationery and logo construction',
                'accent' => '#507AF4',
            ],
            [
                'slug' => 'rebranding',
                'name' => 'Rebranding',
                'short' => 'New chapters, zero confusion.',
                'description' => 'End-to-end rebrands — audit, strategy, identity and rollout planning — that move market perception without losing the equity you have already earned.',
                'deliverables' => ['Brand audit', 'Migration strategy', 'Refreshed identity', 'Launch rollout kit'],
                'image' => '/images/work/sabdita-fashion.jpg',
                'imageAlt' => 'Sabdita fashion brand refresh — relaunch campaign photography',
                'accent' => '#1BE2EB',
            ],
            [
                'slug' => 'packaging-design',
                'name' => 'Packaging Design',
                'short' => 'Shelf presence that sells.',
                'description' => 'Structural thinking plus standout surface design for physical products — from dielines to shelf-blocking systems that convert at a glance.',
                'deliverables' => ['Structural concepts', 'Surface design system', 'Print-ready dielines', 'Mockups & renders'],
                'image' => '/images/work/commercial-cleaning-seo.jpg',
                'imageAlt' => 'Product packaging in hand — spray and pump bottles on shelf',
                'accent' => '#891FFB',
            ],
            [
                'slug' => 'motion-branding',
                'name' => 'Motion Branding',
                'short' => 'Identities that move.',
                'description' => 'Logo animations, kinetic typography and motion principles that give your brand a living rhythm — recognizable across video, social and product.',
                'deliverables' => ['Motion principles', 'Logo animation suite', 'Kinetic type presets', 'Handoff files (Lottie/MP4)'],
                'image' => '/images/work/dusty-vision.jpg',
                'imageAlt' => 'Motion branding render — golden letterform turning in dark space',
                'accent' => '#507AF4',
            ],
            [
                'slug' => 'brand-guidelines',
                'name' => 'Brand Guidelines',
                'short' => 'Consistency, documented.',
                'description' => 'Living guideline systems — rules, examples, templates and governance — so every team and vendor ships on-brand without guesswork.',
                'deliverables' => ['Guideline book', "Do & don't library", 'Template starter kit', 'Governance checklist'],
                'image' => '/images/work/virgin-trend.jpg',
                'imageAlt' => 'Brand world in magenta — monogram applied across a 3D set',
                'accent' => '#1BE2EB',
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
                'image' => '/images/work/city-online-web.jpg',
                'imageAlt' => 'City Online marketing site shown across desktop screens',
                'accent' => '#891FFB',
            ],
            [
                'slug' => 'mobile-app-ui-ux',
                'name' => 'Mobile App UI/UX',
                'short' => 'Apps people keep opening.',
                'description' => 'Native-feel iOS and Android flows with micro-interactions and prototypes tuned for activation, retention and store ratings.',
                'deliverables' => ['User flows & IA', 'App UI kit', 'Interactive prototype', 'Store assets'],
                'image' => '/images/work/photo-fix-zone.jpg',
                'imageAlt' => 'Photo Fix Zone mobile app interface on a handset',
                'accent' => '#507AF4',
            ],
            [
                'slug' => 'saas-product-design',
                'name' => 'SaaS Product Design',
                'short' => 'Complex products, made clear.',
                'description' => 'Dashboards, workflows and data-dense SaaS interfaces designed for clarity — plus scalable component systems your team can build on.',
                'deliverables' => ['Workflow & IA maps', 'Product UI screens', 'Component library', 'Data-viz patterns'],
                'image' => '/images/work/un-point.jpg',
                'imageAlt' => 'SaaS product interface on a laptop in a dark studio',
                'accent' => '#1BE2EB',
            ],
            [
                'slug' => 'ux-research-strategy',
                'name' => 'UX Research & Strategy',
                'short' => 'Decisions backed by evidence.',
                'description' => 'Stakeholder interviews, usability testing, journey mapping and heuristic audits that turn assumptions into a prioritized product roadmap.',
                'deliverables' => ['Research plan & scripts', 'Usability test reports', 'Journey maps', 'Prioritized roadmap'],
                'image' => '/images/work/imperial-jute-seo.jpg',
                'imageAlt' => 'Research and analytics session — data boards under review',
                'accent' => '#891FFB',
            ],
            [
                'slug' => 'wireframing-prototyping',
                'name' => 'Wireframing & Prototyping',
                'short' => 'Validate before you build.',
                'description' => 'Low-to-high fidelity wireframes and clickable prototypes that de-risk development by testing structure and flows with real users early.',
                'deliverables' => ['Lo-fi wireframes', 'Clickable prototypes', 'Test & iterate cycles', 'Dev-ready specs'],
                'image' => '/images/work/animateuix.jpg',
                'imageAlt' => 'AnimateUIX prototype in progress — screens wired end to end',
                'accent' => '#507AF4',
            ],
            [
                'slug' => 'design-system',
                'name' => 'Design System',
                'short' => 'One language for product.',
                'description' => 'Token-based design systems — foundations, components, patterns and documentation — that keep quality high and shipping fast as teams grow.',
                'deliverables' => ['Design tokens', 'Component library', 'Usage documentation', 'Governance model'],
                'image' => '/images/work/ecohub-essentials.jpg',
                'imageAlt' => 'Ecohub Essentials component library applied across a storefront',
                'accent' => '#1BE2EB',
            ],
        ],
    ],
];
