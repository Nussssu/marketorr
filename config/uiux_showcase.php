<?php

/*
|--------------------------------------------------------------------------
| UI/UX showcase
|--------------------------------------------------------------------------
|
| The six interface projects the UI/UX Portfolio presents, in the order they
| are shown and printed. Each project's screens are the frames exported from
| its Figma file, read straight from `public/{directory}/{slug}/`: every PNG,
| JPG, WebP or AVIF in that folder is a screen, ordered by file name
| (01-home.webp, 02-about.webp, ...). A file named `cover.*` is used as the
| project's card on the portfolio page instead of its first screen, and is
| not printed as a screen itself.
|
| Adding, removing or renaming an export changes the page with no other edit.
|
| `summary` is the one or two lines shown under the project's name on its
| page, and `services` the tags listing what Marketorr worked on — both drawn
| from what the project's Figma file actually contains.
|
*/

return [
    'directory' => 'images/work/uiux',

    'projects' => [
        [
            'slug' => 'sailor-digital',
            'name' => 'Sailor Digital',
            'discipline' => 'Website UI/UX Design',
            'summary' => 'Website UI/UX for Sailor Digital, a digital marketing agency: a conversion-led site covering its services, case studies, blog and proposal flow.',
            'services' => ['UI/UX Design', 'Responsive Design', 'Design System', 'Moodboard'],
        ],
        [
            'slug' => 'adlbl',
            'name' => 'ADLBL',
            'discipline' => 'Website UI/UX Design',
            'summary' => 'Product UI/UX for ADLBL, an agency management platform: dashboards, client and team management, invoicing and AI-assisted ad campaigns.',
            'services' => ['Product UI/UX', 'Wireframes', 'Prototype', 'Design System', 'Icon Set'],
        ],
        [
            'slug' => 'microters',
            'name' => 'Microters',
            'discipline' => 'Website UI/UX Design',
            'summary' => 'Website UI/UX for Microters, a digital marketing agency: landing, SEO service, team, portfolio, case study and proposal pages.',
            'services' => ['UI/UX Design', 'Prototype', 'Style Guide', 'Components'],
        ],
        [
            'slug' => 'city-online',
            'name' => 'City Online Ltd',
            'discipline' => 'Website UI/UX Design',
            'summary' => 'Website UI/UX for City Online Ltd, an internet service provider in Bangladesh: services, packages, coverage, support, bill pay and careers.',
            'services' => ['UI/UX Design', 'Design System', 'Components'],
        ],
        [
            'slug' => 'juite-for-good',
            'name' => 'Juite For Good',
            'discipline' => 'Website Design',
            'summary' => 'Website design for Juite For Good, a Bangladeshi jute goods manufacturer and exporter: product catalogue, export countries, quotes and blog.',
            'services' => ['Website Design', 'Moodboard', 'Style Guide', 'Developer Handoff'],
        ],
        [
            'slug' => 'amco',
            'name' => 'Amco',
            'discipline' => 'Website Design',
            'summary' => 'Website design for Amco, a recruitment and overseas workforce company: services, industries, gallery, CSR, blog and policy pages.',
            'services' => ['Website Design', 'Prototype', 'Responsive Design', 'Style Guide', 'Moodboard'],
        ],
    ],
];
