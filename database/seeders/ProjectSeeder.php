<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

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
                'title' => 'City Online',
                'client' => 'City Online Limited',
                'category' => 'Brand Design · Identity Guidelines',
                'year' => '2023',
                'description' => 'City Online brand identity design — a complete mark, palette and guideline system for an internet service provider.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/city-online-brand.jpg',
                'image_alt' => 'City Online brand identity design',
                'tags' => ['Branding', 'Identity Guidelines'],
                'featured' => true,
            ],
            [
                'slug' => 'city-online-web',
                'title' => 'City Online Limited',
                'client' => 'City Online Limited',
                'category' => 'Web UI/UX · Development',
                'year' => '2024',
                'description' => 'UI/UX design and website development for City Online Limited, carrying the new identity into a live service platform.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/city-online-web.jpg',
                'image_alt' => 'City Online Limited website design',
                'tags' => ['Web UI/UX', 'Development'],
                'featured' => false,
            ],
            [
                'slug' => 'dusty-vision',
                'title' => 'Dusty Vision',
                'client' => 'Dusty Vision · Home Improvement',
                'category' => 'Brand Design · Visual Identity',
                'year' => '2023',
                'description' => 'Logo and visual identity design for a home improvement brand.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#1BE2EB',
                'image_path' => '/images/work/dusty-vision.jpg',
                'image_alt' => 'Dusty Vision logo and visual identity design',
                'tags' => ['Branding', 'Logo Design'],
                'featured' => false,
            ],
            [
                'slug' => 'virgin-trend',
                'title' => 'Virgin Trend',
                'client' => 'Virgin Trend · Fashion',
                'category' => 'Brand Design · Fashion',
                'year' => '2023',
                'description' => 'Logo and brand design portfolio for a clothing brand.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/virgin-trend.jpg',
                'image_alt' => 'Virgin Trend fashion brand visual identity design',
                'tags' => ['Branding', 'Visual Identity'],
                'featured' => false,
            ],
            [
                'slug' => 'imperial-jute-brand-design',
                'title' => 'Imperial Jute Brand',
                'client' => 'Imperial Jute',
                'category' => 'Brand Design · Minimal Logo',
                'year' => '2023',
                'description' => 'Minimal logo and brand design for a jute company, built to travel from export packaging to the web.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/imperial-jute-brand.jpg',
                'image_alt' => 'Imperial Jute minimal logo and brand design',
                'tags' => ['Branding', 'Logo Design'],
                'featured' => false,
            ],
            [
                'slug' => 'un-point-brand-design',
                'title' => 'Un-Point',
                'client' => 'Un-Point · Engineering Consulting',
                'category' => 'Brand Design · Engineering',
                'year' => '2023',
                'description' => 'Visual brand identity design portfolio for an engineering consulting firm.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#1BE2EB',
                'image_path' => '/images/work/un-point.jpg',
                'image_alt' => 'Un-Point engineering consulting firm visual identity design',
                'tags' => ['Branding', 'Visual Identity'],
                'featured' => false,
            ],
            [
                'slug' => 'nature-to-near',
                'title' => 'Nature to Near',
                'client' => 'NTBT · Agro Firm',
                'category' => 'Brand Design · Agro',
                'year' => '2023',
                'description' => 'Logo, branding and visual identity for an agro firm — a warm, grounded system for produce and packaging.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#891FFB',
                'image_path' => '/images/work/nature-to-near.jpg',
                'image_alt' => 'Nature to Near agro firm logo and branding',
                'tags' => ['Branding', 'Packaging'],
                'featured' => false,
            ],
            [
                'slug' => 'sabdita-fashion',
                'title' => 'Sabdita Fashion',
                'client' => 'Sabdita Fashion',
                'category' => 'Brand Design · Packaging',
                'year' => '2024',
                'description' => 'Logo, packaging and visual identity design for the fashion industry.',
                'metric' => null,
                'metric_label' => null,
                'accent' => '#507AF4',
                'image_path' => '/images/work/sabdita-fashion.jpg',
                'image_alt' => 'Sabdita Fashion logo, packaging and visual identity design',
                'tags' => ['Branding', 'Packaging'],
                'featured' => false,
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
        ];
    }
}
