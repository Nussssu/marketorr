<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Category;
use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Transcribes the original `resources/js/lib/projects.js` catalogue into the
 * database, copying each cover image into the public storage disk so seeded
 * and admin-uploaded projects share one runtime path.
 */
class ProjectSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach ($this->projects() as $order => $project) {
            $project['category_id'] = $this->resolveCategory($project['category']);
            unset($project['category']);
            $project['image_path'] = $this->storeCover($project['image_path']);
            $project['sort_order'] = $order;
            $project['status'] = ContentStatus::Published;

            Project::query()->updateOrCreate(
                ['slug' => $project['slug']],
                $project,
            );
        }
    }

    /**
     * Copy a legacy `public/images/work/*.jpg` cover onto the public disk.
     *
     * Falls back to the original public path when the source file is missing,
     * so seeding never leaves a project without a usable image.
     */
    private function storeCover(string $legacyPath): string
    {
        $source = public_path(ltrim($legacyPath, '/'));
        $target = 'projects/'.basename($legacyPath);

        if (! File::exists($source)) {
            return $legacyPath;
        }

        if (! Storage::disk('public')->exists($target)) {
            Storage::disk('public')->put($target, File::get($source));
        }

        return $target;
    }

    /**
     * Resolve a `Parent · Child` label to its category, creating whatever the
     * curated tree in CategorySeeder does not already cover.
     *
     * Self-healing rather than a lookup: a project added here with a label the
     * tree has not caught up with would otherwise seed with no category at all.
     */
    private function resolveCategory(string $label): int
    {
        $segments = array_values(array_filter(array_map(trim(...), explode('·', $label))));
        $parent = $this->upsertCategory($segments[0], null);

        if (count($segments) === 1) {
            return $parent->id;
        }

        return $this->upsertCategory($segments[1], $parent)->id;
    }

    /**
     * Find a category by the slug the seeded tree uses, or create it.
     */
    private function upsertCategory(string $name, ?Category $parent): Category
    {
        $slug = Str::slug($parent ? "{$parent->name} {$name}" : $name);

        return Category::query()->firstOrCreate(
            ['slug' => $slug],
            [
                'parent_id' => $parent?->id,
                'name' => $name,
                'accent' => $parent?->accent ?? '#891FFB',
                'status' => ContentStatus::Published,
                'sort_order' => (int) Category::query()->max('sort_order') + 1,
            ],
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function projects(): array
    {
        return [
            [
                'slug' => 'imperial-jute-b2b-seo',
                'title' => 'Imperial Jute',
                'client' => 'Imperial Jute · Jute Goods Manufacturer',
                'category' => 'B2B SEO · Content Strategy',
                'year' => '2023',
                'description' => 'An SEO overhaul for a jute goods manufacturer and exporter: website UI redesign, industry keyword research and a content-first strategy that put 200+ keywords on page one in six months — without a backlink strategy.',
                'metric' => '2100%',
                'metric_label' => 'Organic Traffic Increase',
                'accent' => '#891FFB',
                'image_path' => '/images/work/imperial-jute-seo.jpg',
                'image_alt' => 'Imperial Jute B2B SEO case study cover',
                'tags' => ['SEO', 'Content Strategy', 'Web UI/UX'],
                'featured' => true,
            ],
            [
                'slug' => 'commercial-cleaning-seo',
                'title' => 'Commercial Cleaning',
                'client' => 'B2B Commercial Cleaning · US',
                'category' => 'SEO · Organic Growth',
                'year' => '2023',
                'description' => 'Comprehensive keyword research, content mapping, on-page and technical SEO built topical authority for a US commercial cleaning provider — 12,000 organic users and $6,447 average monthly sales across the year.',
                'metric' => '$431,967',
                'metric_label' => 'Gross Sales',
                'accent' => '#507AF4',
                'image_path' => '/images/work/commercial-cleaning-seo.jpg',
                'image_alt' => 'Commercial cleaning SEO case study cover',
                'tags' => ['SEO', 'Technical SEO', 'Growth'],
                'featured' => true,
            ],
            [
                'slug' => 'all-city-duct-cleaning-ads',
                'title' => 'All City Duct Cleaning',
                'client' => 'All City Duct Cleaning · 7 US States',
                'category' => 'Paid Ads · Facebook Campaigns',
                'year' => '2023',
                'description' => 'A three-phase Facebook ad strategy — segmented audiences with video, carousel and static creative — generated 1,379 messages from $19,397 of spend and lifted average order value from $270 to $450.',
                'metric' => '60.37%',
                'metric_label' => 'Conversion Rate',
                'accent' => '#1BE2EB',
                'image_path' => '/images/work/all-city-duct-cleaning-ads.jpg',
                'image_alt' => 'All City Duct Cleaning Facebook ads case study cover',
                'tags' => ['Paid Ads', 'Campaign', 'Lead Gen'],
                'featured' => true,
            ],
            [
                'slug' => 'city-online-brand-design',
                'title' => 'City Online Brand Guidelines',
                'client' => 'City Online Limited',
                'category' => 'Brand Design · Identity Guidelines',
                'year' => '2023',
                'description' => 'Brand identity guidelines for City Online — a complete mark, palette and usage system for an internet service provider.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/city-online-brand.jpg',
                'image_alt' => 'City Online brand identity guidelines cover',
                'tags' => ['Branding', 'Identity Guidelines'],
                'featured' => true,
            ],
            [
                'slug' => 'city-online-web',
                'title' => 'City Online Website',
                'client' => 'City Online Limited',
                'category' => 'Web UI/UX · Development',
                'year' => '2024',
                'description' => 'Website UI design case study for City Online Limited, carrying the new identity into a live service platform.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/city-online-web.jpg',
                'image_alt' => 'City Online website UI design case study cover',
                'tags' => ['Web UI/UX', 'Development'],
                'featured' => false,
            ],
            [
                'slug' => 'microters-web',
                'title' => 'Microters',
                'client' => 'Microters · SaaS',
                'category' => 'Web UI/UX · Development',
                'year' => '2024',
                'description' => 'Website UI design case study for Microters — clean layouts and a confident visual system tuned for conversion.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/microters-web.png',
                'image_alt' => 'Microters website UI design case study cover',
                'tags' => ['Web UI/UX', 'UI Design'],
                'featured' => true,
            ],
            [
                'slug' => 'dusty-vision',
                'title' => 'Dusty Vision',
                'client' => 'Dusty Vision · Home Improvement',
                'category' => 'Brand Design · Visual Identity',
                'year' => '2023',
                'description' => 'Dusty Vision visual identity — logo and brand system for a home improvement brand.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#1BE2EB',
                'image_path' => '/images/work/dusty-vision.jpg',
                'image_alt' => 'Dusty Vision visual identity cover',
                'tags' => ['Branding', 'Logo Design'],
                'featured' => false,
            ],
            [
                'slug' => 'virgin-trend',
                'title' => 'Virgin Trend',
                'client' => 'Virgin Trend · Fashion',
                'category' => 'Brand Design · Fashion',
                'year' => '2023',
                'description' => 'Fashion brand visual identity design for Virgin Trend — logo, look and brand world for a clothing label.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/virgin-trend.jpg',
                'image_alt' => 'Virgin Trend fashion brand visual identity cover',
                'tags' => ['Branding', 'Visual Identity'],
                'featured' => false,
            ],
            [
                'slug' => 'imperial-jute-brand-design',
                'title' => 'Imperial Jute Brand Identity',
                'client' => 'Imperial Jute',
                'category' => 'Brand Design · Minimal Logo',
                'year' => '2023',
                'description' => 'Minimal logo and brand design for a jute company, built to travel from export packaging to the web.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/imperial-jute-brand.jpg',
                'image_alt' => 'Imperial Jute minimal logo and brand cover',
                'tags' => ['Branding', 'Logo Design'],
                'featured' => false,
            ],
            [
                'slug' => 'un-point-brand-design',
                'title' => 'Engineering Consulting Firm',
                'client' => 'Engineering Consulting Firm · Consulting',
                'category' => 'Brand Design · Engineering',
                'year' => '2023',
                'description' => 'Visual identity design for an engineering consulting firm — a precise, technical brand system.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#1BE2EB',
                'image_path' => '/images/work/un-point.jpg',
                'image_alt' => 'Engineering consulting firm visual identity cover',
                'tags' => ['Branding', 'Visual Identity'],
                'featured' => false,
            ],
            [
                'slug' => 'nature-to-near',
                'title' => 'NTNB Agro',
                'client' => 'NTNB Agro · Agro Firm',
                'category' => 'Brand Design · Agro',
                'year' => '2023',
                'description' => 'Visual identity for NTNB Agro — a warm, grounded brand system for an agro firm.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/nature-to-near.jpg',
                'image_alt' => 'NTNB Agro firm visual identity cover',
                'tags' => ['Branding', 'Packaging'],
                'featured' => false,
            ],
            [
                'slug' => 'sabdita-fashion',
                'title' => 'Sabdita Fashion Rebranding',
                'client' => 'Sabdita Fashion',
                'category' => 'Brand Design · Rebranding',
                'year' => '2024',
                'description' => 'Rebranding for Sabdita Fashion — logo, packaging and a refreshed visual identity for the fashion label.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/sabdita-fashion.jpg',
                'image_alt' => 'Sabdita Fashion rebranding cover',
                'tags' => ['Branding', 'Rebranding'],
                'featured' => false,
                'external_url' => 'https://www.behance.net/gallery/184303473/Rebranding-Sabdita-Fashion',
                // The visual story, in the order the work was built: foundation,
                // mark, motion, type and colour, then the applications it ships
                // on. Labels only — the full write-up lives on Behance, and
                // repeating it here would just be a second copy to maintain.
                'case_study' => [
                    [
                        'label' => 'Brand foundation',
                        'note' => null,
                        'images' => [
                            ['src' => '/images/work/sabdita/about.jpg', 'alt' => 'Sabdita Fashion brand overview board', 'wide' => true],
                            ['src' => '/images/work/sabdita/brand-positioning.jpg', 'alt' => 'Sabdita Fashion brand positioning'],
                            ['src' => '/images/work/sabdita/brand-messaging.jpg', 'alt' => 'Sabdita Fashion brand messaging'],
                        ],
                    ],
                    [
                        'label' => 'Logo & identity',
                        'note' => 'The mark, its construction and the backgrounds it has to hold.',
                        'images' => [
                            ['src' => '/images/work/sabdita/logo-explainer.jpg', 'alt' => 'Sabdita Fashion logo concept and construction', 'wide' => true],
                            ['src' => '/images/work/sabdita/logo-presentation.jpg', 'alt' => 'Sabdita Fashion logo presentation'],
                            ['src' => '/images/work/sabdita/logo-backgrounds.jpg', 'alt' => 'Sabdita Fashion logo across background treatments'],
                        ],
                    ],
                    [
                        'label' => 'Logo in motion',
                        'note' => null,
                        'images' => [
                            ['src' => '/images/work/sabdita/logo-intro-animation.gif', 'alt' => 'Sabdita Fashion animated logo intro'],
                            ['src' => '/images/work/sabdita/logo-animation.gif', 'alt' => 'Sabdita Fashion logo animation'],
                            ['src' => '/images/work/sabdita/logo-motion-s.gif', 'alt' => 'Sabdita Fashion monogram motion study', 'wide' => true],
                        ],
                    ],
                    [
                        'label' => 'Typography & colour',
                        'note' => 'One palette and type pairing, legible from hangtag to billboard.',
                        'images' => [
                            ['src' => '/images/work/sabdita/typo-color-animation.gif', 'alt' => 'Sabdita Fashion typography and colour direction', 'wide' => true],
                        ],
                    ],
                    [
                        'label' => 'Packaging',
                        'note' => null,
                        'images' => [
                            ['src' => '/images/work/sabdita/packaging.jpg', 'alt' => 'Sabdita Fashion packaging', 'wide' => true],
                            ['src' => '/images/work/sabdita/hangtag.jpg', 'alt' => 'Sabdita Fashion garment hangtag'],
                            ['src' => '/images/work/sabdita/ribbon.jpg', 'alt' => 'Sabdita Fashion branded ribbon'],
                        ],
                    ],
                    [
                        'label' => 'Stationery',
                        'note' => null,
                        'images' => [
                            ['src' => '/images/work/sabdita/envelope.jpg', 'alt' => 'Sabdita Fashion branded envelope'],
                            ['src' => '/images/work/sabdita/thank-you-card.jpg', 'alt' => 'Sabdita Fashion thank you card'],
                        ],
                    ],
                    [
                        'label' => 'Out of home',
                        'note' => null,
                        'images' => [
                            ['src' => '/images/work/sabdita/billboard.jpg', 'alt' => 'Sabdita Fashion billboard application', 'wide' => true],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'animateuix-brand-design',
                'title' => 'AnimateUIX',
                'client' => 'AnimateUIX',
                'category' => 'Brand Design · Product',
                'year' => '2024',
                'description' => 'AnimateUIX brand design — a logo presentation system for a motion-led product studio.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#1BE2EB',
                'image_path' => '/images/work/animateuix.jpg',
                'image_alt' => 'AnimateUIX brand and logo design',
                'tags' => ['Branding', 'Logo Design'],
                'featured' => false,
            ],
            [
                'slug' => 'ecohub-essentials',
                'title' => 'EcoHub Essentials',
                'client' => 'EcoHub Essentials · E-commerce',
                'category' => 'Web Development · E-commerce',
                'year' => '2024',
                'description' => 'Web development project for an electronic online store, built for catalogue depth and fast checkout.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/ecohub-essentials.jpg',
                'image_alt' => 'EcoHub Essentials e-commerce website',
                'tags' => ['Web UI/UX', 'E-commerce'],
                'featured' => false,
            ],
            [
                'slug' => 'photo-fix-zone',
                'title' => 'Photo Fix Zone',
                'client' => 'Photo Fix Zone · Image Editing',
                'category' => 'Web Development · Service Site',
                'year' => '2024',
                'description' => 'Web development project for an image editing firm, structured around service clarity and quote requests.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/photo-fix-zone.jpg',
                'image_alt' => 'Photo Fix Zone website design',
                'tags' => ['Web UI/UX', 'Development'],
                'featured' => false,
            ],
            [
                'slug' => 'custom-illustration',
                'title' => 'Custom Illustration',
                'client' => 'Marketorr Studio · Illustration',
                'category' => 'Illustration · Digital Art',
                'year' => '2024',
                'description' => 'Custom illustration and digital art — bespoke visuals crafted for content and campaigns.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/illustration-custom.jpg',
                'image_alt' => 'Custom illustration and digital art cover',
                'tags' => ['Illustration', 'Digital Art'],
                'featured' => false,
            ],
            [
                'slug' => 'carpet-cleaning-illustration',
                'title' => 'Carpet Cleaning Illustrations',
                'client' => 'Carpet Cleaning · Services',
                'category' => 'Illustration · Digital Art',
                'year' => '2024',
                'description' => 'Digital art and illustration series for a carpet cleaning brand — playful visuals for service marketing.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/illustration-carpet.jpg',
                'image_alt' => 'Carpet cleaning digital art and illustration cover',
                'tags' => ['Illustration', 'Digital Art'],
                'featured' => false,
            ],
            [
                'slug' => 'infographic-line-illustration',
                'title' => 'Infographic Line Illustrations',
                'client' => 'Marketorr Studio · Illustration',
                'category' => 'Illustration · Digital Art',
                'year' => '2024',
                'description' => 'Line drawing and illustration art for content infographics — clean explanatory visuals.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#1BE2EB',
                'image_path' => '/images/work/illustration-line-drawing.jpg',
                'image_alt' => 'Line drawing illustration art for infographics cover',
                'tags' => ['Illustration', 'Infographics'],
                'featured' => false,
            ],
        ];
    }
}
