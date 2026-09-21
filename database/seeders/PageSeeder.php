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
                        'type' => SectionType::Marquee,
                        'name' => 'Idea → Experience → Result',
                        'content' => ['items' => ['IDEA', 'EXPERIENCE', 'RESULT']],
                    ],
                    [
                        'type' => SectionType::About,
                        'name' => 'Who we are',
                        'content' => [
                            'heading' => 'About',
                            'text' => $defaults['about_text'],
                            'metrics' => $defaults['about_metrics'],
                        ],
                    ],
                    [
                        'type' => SectionType::Services,
                        'name' => 'What we do',
                        'content' => ['heading' => 'Services', 'intro' => ''],
                    ],
                    [
                        'type' => SectionType::Work,
                        'name' => 'Featured work',
                        'content' => ['heading' => 'Our Work', 'intro' => ''],
                    ],
                    [
                        'type' => SectionType::Contact,
                        'name' => 'Start a project',
                        'content' => ['heading' => 'Contact', 'intro' => ''],
                    ],
                ],
            ],
            [
                'slug' => 'about',
                'title' => 'About',
                'meta_title' => 'About — Marketorr',
                'meta_description' => 'Marketorr is a creative and digital agency helping ambitious brands build stronger identities and measurable growth.',
                'sections' => [
                    [
                        'type' => SectionType::About,
                        'name' => 'Who we are',
                        'content' => [
                            'heading' => 'About',
                            'text' => $defaults['about_text'],
                            'metrics' => $defaults['about_metrics'],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'contact',
                'title' => 'Contact',
                'meta_title' => 'Contact — Marketorr',
                'meta_description' => 'Tell us about your project. We reply within 24–48 hours.',
                'sections' => [
                    [
                        'type' => SectionType::Contact,
                        'name' => 'Start a project',
                        'content' => ['heading' => 'Contact', 'intro' => ''],
                    ],
                ],
            ],
            [
                'slug' => 'privacy',
                'title' => 'Privacy policy',
                'meta_title' => 'Privacy — Marketorr',
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
                'meta_title' => 'Terms — Marketorr',
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
                'meta_title' => 'Services — Marketorr',
                'meta_description' => 'Branding, web and product design services built for measurable growth.',
                'sections' => [
                    [
                        'type' => SectionType::Services,
                        'name' => 'What we do',
                        'content' => ['heading' => 'Services', 'intro' => ''],
                    ],
                ],
            ],
            [
                'slug' => 'work',
                'title' => 'Our Work',
                'meta_title' => 'Our Work — Marketorr',
                'meta_description' => 'Selected branding, web and product work from the Marketorr studio.',
                'sections' => [
                    [
                        'type' => SectionType::Work,
                        'name' => 'Project index',
                        'content' => ['heading' => 'Our Work', 'intro' => ''],
                    ],
                ],
            ],
        ];
    }
}
