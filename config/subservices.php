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
| clicked become the hero they land on. Setting it here changes it everywhere,
| in step. Every entry is currently null and renders the placeholder plate,
| waiting for the photograph that actually belongs to that discipline; the
| path each one used before is kept in the comment above it.
|
| `work` is the pair of real-project slots on the dedicated page, one per
| piece of Marketorr work in that exact discipline. A slot with `src` set to
| null renders as a clean empty frame holding that space; point `src` at an
| image and that same slot renders the photograph instead, with no other
| change needed anywhere. `title` is a note for whoever fills the slot - it
| is never shown on the page.
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
                // Previously '/images/work/nature-to-near.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'NTNB Agro visual identity cover from the Marketorr portfolio',
                'accent' => '#891FFB',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Positioning & messaging deck',
                        'alt' => 'Brand strategy positioning and messaging work by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Audience & competitor audit',
                        'alt' => 'Brand strategy audience and competitor audit by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'brand-identity-design',
                'name' => 'Brand Identity Design',
                'short' => 'Visual identities with gravity.',
                'description' => 'Logo systems, typography, color and art direction composed into a distinctive identity toolkit — built to stay recognizable from favicon to facade.',
                'deliverables' => ['Logo suite & lockups', 'Typography system', 'Color palette', 'Art direction'],
                // Previously '/images/work/imperial-jute-brand.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Imperial Jute minimal logo and brand cover',
                'accent' => '#507AF4',
                'work' => [
                    [
                        'src' => '/images/work/dusty-vision-logo.png',
                        'title' => 'Primary logo & mark system',
                        'alt' => 'Dusty Vision 3D logo mark from the Marketorr brand identity portfolio',
                    ],
                    [
                        'src' => null,
                        'title' => 'Identity across collateral',
                        'alt' => 'Brand identity applied across print and digital collateral by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'rebranding',
                'name' => 'Rebranding',
                'short' => 'New chapters, zero confusion.',
                'description' => 'End-to-end rebrands — audit, strategy, identity and rollout planning — that move market perception without losing the equity you have already earned.',
                'deliverables' => ['Brand audit', 'Migration strategy', 'Refreshed identity', 'Launch rollout kit'],
                // Previously '/images/work/sabdita-fashion.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Sabdita Fashion rebranding cover',
                'accent' => '#1BE2EB',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Before / after identity',
                        'alt' => 'Rebranding before and after identity comparison by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Rollout across touchpoints',
                        'alt' => 'Rebranding rollout across brand touchpoints by Marketorr',
                    ],
                ],
                'case_study' => [
                    'meta' => 'Published November 2023 · Crafted in Illustrator, Photoshop and After Effects',
                    'sections' => [
                        [
                            'eyebrow' => 'About the project',
                            'heading' => 'A women\'s clothing brand, reimagined',
                            'body' => 'Tasked with rebranding Sabdita Fashion, a women\'s clothing brand, the goal was to infuse the identity with modern minimalism — reflecting the elegance of today\'s fashion-forward woman.',
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
                            'body' => 'Every choice speaks to a style-conscious female audience — elegance expressed through restraint, in line with the brand\'s vision of empowering women through fashion.',
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
                            'body' => 'The new logo encapsulates minimalist beauty — a mark whose concept, construction and backgrounds are documented as part of the system.',
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
                                ['src' => '/images/work/sabdita/logo-motion-s.gif', 'alt' => 'Sabdita Fashion S logo animation'],
                                ['src' => '/images/work/sabdita/logo-animation.gif', 'alt' => 'Sabdita Fashion animated logo'],
                            ],
                        ],
                        [
                            'eyebrow' => 'Applications',
                            'heading' => 'One system, every touchpoint',
                            'body' => 'The theme extends across all branding elements — stationery, packaging and out-of-home — reinforcing Sabdita\'s presence in the women\'s fashion sector.',
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
                'description' => 'Structural thinking plus standout surface design for physical products — from dielines to shelf-blocking systems that convert at a glance.',
                'deliverables' => ['Structural concepts', 'Surface design system', 'Print-ready dielines', 'Mockups & renders'],
                // Previously '/images/work/commercial-cleaning-seo.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Product packaging in hand — spray and pump bottles on shelf',
                'accent' => '#891FFB',
                'work' => [
                    [
                        'src' => '/images/work/dusty-vision-logo.png',
                        'title' => 'Primary pack & label',
                        'alt' => 'Dusty Vision 3D logo mark from the Marketorr packaging design portfolio',
                    ],
                    [
                        'src' => null,
                        'title' => 'Shelf & unboxing mockups',
                        'alt' => 'Packaging design shelf presence and unboxing mockups by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'motion-branding',
                'name' => 'Motion Branding',
                'short' => 'Identities that move.',
                'description' => 'Logo animations, kinetic typography and motion principles that give your brand a living rhythm — recognizable across video, social and product.',
                'deliverables' => ['Motion principles', 'Logo animation suite', 'Kinetic type presets', 'Handoff files (Lottie/MP4)'],
                // Previously '/images/work/dusty-vision.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Dusty Vision visual identity cover',
                'accent' => '#507AF4',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Animated logo reveal',
                        'alt' => 'Motion branding animated logo reveal by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Motion system for social',
                        'alt' => 'Motion branding social media motion system by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'brand-guidelines',
                'name' => 'Brand Guidelines',
                'short' => 'Consistency, documented.',
                'description' => 'Living guideline systems — rules, examples, templates and governance — so every team and vendor ships on-brand without guesswork.',
                'deliverables' => ['Guideline book', "Do & don't library", 'Template starter kit', 'Governance checklist'],
                // Previously '/images/work/virgin-trend.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Virgin Trend fashion brand identity cover',
                'accent' => '#1BE2EB',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Guidelines — logo rules',
                        'alt' => 'Brand guidelines spread covering logo usage rules by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Guidelines — colour & type',
                        'alt' => 'Brand guidelines spread covering colour and typography by Marketorr',
                    ],
                ],
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
                // Previously '/images/work/city-online-web.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'City Online website UI design case study cover',
                'accent' => '#891FFB',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Desktop homepage design',
                        'alt' => 'Website UI/UX desktop homepage design by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Responsive page set',
                        'alt' => 'Website UI/UX responsive page set by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'mobile-app-ui-ux',
                'name' => 'Mobile App UI/UX',
                'short' => 'Apps people keep opening.',
                'description' => 'Native-feel iOS and Android flows with micro-interactions and prototypes tuned for activation, retention and store ratings.',
                'deliverables' => ['User flows & IA', 'App UI kit', 'Interactive prototype', 'Store assets'],
                // Previously '/images/work/photo-fix-zone.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Photo Fix Zone mobile app interface on a handset',
                'accent' => '#507AF4',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Core app screens',
                        'alt' => 'Mobile app UI/UX core screen designs by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Key journey flows',
                        'alt' => 'Mobile app UI/UX key user journey flows by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'saas-product-design',
                'name' => 'SaaS Product Design',
                'short' => 'Complex products, made clear.',
                'description' => 'Dashboards, workflows and data-dense SaaS interfaces designed for clarity — plus scalable component systems your team can build on.',
                'deliverables' => ['Workflow & IA maps', 'Product UI screens', 'Component library', 'Data-viz patterns'],
                // Previously '/images/work/un-point.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Engineering consulting firm visual identity cover',
                'accent' => '#1BE2EB',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Dashboard interface',
                        'alt' => 'SaaS product design dashboard interface by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Data & settings screens',
                        'alt' => 'SaaS product design data and settings screens by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'ux-research-strategy',
                'name' => 'UX Research & Strategy',
                'short' => 'Decisions backed by evidence.',
                'description' => 'Stakeholder interviews, usability testing, journey mapping and heuristic audits that turn assumptions into a prioritized product roadmap.',
                'deliverables' => ['Research plan & scripts', 'Usability test reports', 'Journey maps', 'Prioritized roadmap'],
                // Previously '/images/work/imperial-jute-seo.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Research and analytics session — data boards under review',
                'accent' => '#891FFB',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Findings & personas',
                        'alt' => 'UX research findings and personas by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Journey map & insights',
                        'alt' => 'UX research journey map and insights by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'wireframing-prototyping',
                'name' => 'Wireframing & Prototyping',
                'short' => 'Validate before you build.',
                'description' => 'Low-to-high fidelity wireframes and clickable prototypes that de-risk development by testing structure and flows with real users early.',
                'deliverables' => ['Lo-fi wireframes', 'Clickable prototypes', 'Test & iterate cycles', 'Dev-ready specs'],
                // Previously '/images/work/animateuix.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'AnimateUIX prototype in progress — screens wired end to end',
                'accent' => '#507AF4',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Low-fidelity wireframes',
                        'alt' => 'Wireframing low-fidelity wireframe set by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Clickable prototype flow',
                        'alt' => 'Prototyping clickable prototype flow by Marketorr',
                    ],
                ],
            ],
            [
                'slug' => 'design-system',
                'name' => 'Design System',
                'short' => 'One language for product.',
                'description' => 'Token-based design systems — foundations, components, patterns and documentation — that keep quality high and shipping fast as teams grow.',
                'deliverables' => ['Design tokens', 'Component library', 'Usage documentation', 'Governance model'],
                // Previously '/images/work/ecohub-essentials.jpg'. Upload target: 16:10, 1600x1000.
                'image' => null,
                'imageAlt' => 'Ecohub Essentials component library applied across a storefront',
                'accent' => '#1BE2EB',
                'work' => [
                    [
                        'src' => null,
                        'title' => 'Component library',
                        'alt' => 'Design system component library overview by Marketorr',
                    ],
                    [
                        'src' => null,
                        'title' => 'Tokens, states & docs',
                        'alt' => 'Design system tokens, states and documentation by Marketorr',
                    ],
                ],
            ],
        ],
    ],
];
