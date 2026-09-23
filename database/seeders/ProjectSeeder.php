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
            $project['case_study'] ??= $this->gallery($project['slug'], $project['title']);

            Project::query()->updateOrCreate(
                ['slug' => $project['slug']],
                $project,
            );
        }
    }

    /**
     * The project's own photographs, read off disk rather than listed here.
     *
     * Each file under `public/images/work/gallery/<slug>/` is one frame of the
     * gallery published with that project on marketorr.com.bd, saved in the
     * order it appears there. Reading the directory keeps this seeder honest:
     * a project whose images have not been downloaded yet simply seeds no
     * gallery instead of pointing at files that are not on disk.
     *
     * @return array<int, array{label: string, note: null, images: array<int, array{src: string, alt: string, wide: bool}>}>|null
     */
    private function gallery(string $slug, string $title): ?array
    {
        $directory = public_path('images/work/gallery/'.$slug);

        if (! File::isDirectory($directory)) {
            return null;
        }

        $images = collect(File::files($directory))
            ->filter(fn ($file): bool => in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp'], true))
            ->sortBy(fn ($file): string => $file->getFilename())
            ->values()
            ->map(fn ($file, int $index): array => [
                'src' => '/images/work/gallery/'.$slug.'/'.$file->getFilename(),
                'alt' => $title.' project image '.($index + 1),
                'wide' => false,
            ])
            ->all();

        if ($images === []) {
            return null;
        }

        return [[
            'label' => 'Project gallery',
            'note' => null,
            'images' => $images,
        ]];
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
                'image_path' => '/images/work/imperial-jute-logo.gif',
                'image_alt' => 'Imperial Jute 3D logo animation',
                'tags' => ['SEO', 'Content Strategy', 'Web UI/UX'],
                'brief' => [
                    'overview' => 'Imperial Jute is a leading jute goods manufacturer, supplier and exporter, exporting jute bags, jute tape, fabrics, yarn and ropes. Quality jute product within the shortest period of delivery is its main motto as a leading jute goods manufacturer and exporter in Bangladesh, and the company is committed to developing the food-grade jute bag and creating an ecologically sustainable future.',
                    'worked_on' => [],
                    'services' => [
                        'Brand Design',
                        'Website Development',
                    ],
                    'highlights' => [],
                    'client' => 'Imperial Jute Limited',
                    'website' => 'https://www.imperialjute.com/',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/imperial-jute/',
                ],
                'featured' => true,
            ],
            [
                'slug' => 'charukothon-meta-ads',
                'title' => 'Charukothon',
                'client' => 'Charukothon · Fashion Brand, Bangladesh',
                'category' => 'Paid Ads · Creative Strategy',
                'year' => '2026',
                'description' => 'A creative-first Meta ads launch for a brand-new Bangladeshi fashion label: a custom photo and video frame system, one exclusive influencer partnership and collage-style single-image testing took the page from zero to 1 million BDT in monthly revenue in 60 days.',
                'metric' => '11X',
                'metric_label' => 'Return on Ad Spend',
                'accent' => '#891FFB',
                'image_path' => '/images/work/charukothon-meta-ads.webp',
                'image_alt' => 'Charukothon fashion brand Meta ads case study cover',
                'tags' => ['Paid Ads', 'Creative Strategy', 'Growth'],
                'brief' => [
                    'overview' => 'Charukothon wanted to enter the fashion brand industry in Bangladesh through Facebook but did not know how to approach it, given the saturated market, competitors’ big spending and the ever-changing Facebook algorithm. The brand was confident with their product but needed help placing their brand on Facebook.',
                    'worked_on' => [
                        'Creating a strong brand identity',
                        'Mastering the “Andromeda” algorithm shift',
                        'Influencer partnership and integration',
                        'A/B testing across ad formats',
                        'Scaling production ahead of ad spend',
                        'Customer experience and follow-up',
                    ],
                    'services' => [
                        'Facebook Ads',
                        'Creative Strategy',
                        'Influencer Marketing',
                    ],
                    'highlights' => [
                        [
                            'label' => 'Revenue',
                            'value' => '10 Lacs (1 Million BDT) in monthly sales within 2 months',
                        ],
                        [
                            'label' => 'Efficiency',
                            'value' => '11X ROAS (Return on Ad Spend)',
                        ],
                        [
                            'label' => 'Volume',
                            'value' => '40+ orders per day at a 180 BDT CPA',
                        ],
                        [
                            'label' => 'Organic lift',
                            'value' => '5–8 organic orders every day without ad spend',
                        ],
                        [
                            'label' => 'Community',
                            'value' => 'Page grew from 0 to 27,000 followers in 90 days',
                        ],
                    ],
                    'client' => 'Charukothon',
                    'website' => null,
                    'source_url' => 'https://www.marketorr.com.bd/case-study/charukothon/',
                ],
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
                'image_path' => '/images/work/dusty-vision-logo.png',
                'image_alt' => '3D copper logo mark render',
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
                'brief' => [
                    'overview' => 'City Online Ltd. is a leading Internet Service Provider and IT solution company in Bangladesh. It is the company of information communication technology to provide the services like Broadband Internet through Fiber to The Home (FTTH) passive optical network technology. This is the next generation technology designed to deliver fast, reliable, dedicated, and affordable internet services to customers at all levels.',
                    'worked_on' => [],
                    'services' => [
                        'Brand Design',
                        'Web Development',
                    ],
                    'highlights' => [],
                    'client' => 'City Online Limited',
                    'website' => 'https://www.cityonlinebd.net/',
                    'behance_url' => 'https://www.behance.net/gallery/189089907/Brand-Identity-Guidelines-City-Online',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/city-online-brand-design',
                ],
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
                'brief' => [
                    'overview' => null,
                    'worked_on' => [],
                    'services' => [
                        'Web Development',
                    ],
                    'highlights' => [],
                    'client' => 'City Online Limited',
                    'website' => 'https://www.cityonlinebd.net/',
                    'behance_url' => 'https://www.behance.net/gallery/187978651/Website-UI-Design-Case-Study-City-Online',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/cityonline-web-development',
                ],
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
                'brief' => [
                    'overview' => null,
                    'worked_on' => [],
                    'services' => [
                        'Logo Design',
                        'Web Development',
                    ],
                    'highlights' => [],
                    'client' => 'Microters',
                    'website' => 'https://microters.com/',
                    'behance_url' => 'https://www.behance.net/gallery/188064937/Website-UI-Design-Case-Study-Microters',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/microters/',
                ],
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
                'brief' => [
                    'overview' => 'Dusty Vision is an efficient toilet paper holder that offers a distinctive storage solution in the form of a drawer-style design, setting it apart from the prevailing lid-style approach commonly seen in its competitors. The brand aims to establish itself in the home improvement niche, with a storage solution that provides efficient organization, easy accessibility and enhanced hygiene.',
                    'worked_on' => [],
                    'services' => [
                        'Brand Identity',
                        'Packaging Design',
                    ],
                    'highlights' => [],
                    'client' => 'Dusty Vision',
                    'website' => null,
                    'behance_url' => 'https://www.behance.net/gallery/172596821/Dusty-Vision-Visual-Identity',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/dusty-vision/',
                ],
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
                'image_path' => '/images/work/virgin-trend-cover.jpg',
                'image_alt' => 'Virgin Trend fashion brand visual identity cover',
                'tags' => ['Branding', 'Visual Identity'],
                'brief' => [
                    'overview' => null,
                    'worked_on' => [],
                    'services' => [
                        'Visual Identity Design',
                    ],
                    'highlights' => [],
                    'client' => 'Virgin Trend',
                    'website' => null,
                    'behance_url' => 'https://www.behance.net/gallery/176690051/Fashion-Brand-Visual-Identity-Design-Virgin-Trend',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/virgin-trend-brand-identity',
                ],
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
                'brief' => [
                    'overview' => 'Imperial Jute is a leading jute goods manufacturer, supplier and exporter, exporting jute bags, jute tape, fabrics, yarn and ropes. Quality jute product within the shortest period of delivery is its main motto as a leading jute goods manufacturer and exporter in Bangladesh, and the company is committed to developing the food-grade jute bag and creating an ecologically sustainable future.',
                    'worked_on' => [],
                    'services' => [
                        'Brand Design',
                    ],
                    'highlights' => [],
                    'client' => 'Imperial Jute',
                    'website' => 'https://www.imperialjute.com/',
                    'behance_url' => 'https://www.behance.net/gallery/175626169/Jute-Company-Minimal-Logo-Brand-Design-Imperial-Jute',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/imperial-jute-brand-design/',
                ],
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
                'brief' => [
                    'overview' => 'Un Point 5 is an engineering consulting firm specializing in energy-transition enabling and climate-change mitigation services. The concentration of its resources and its continuous development allow Un Point 5 to provide expertise and consultancy services on a national and international level in the fields of construction, renewable energy, energy efficiency and carbon audits.',
                    'worked_on' => [],
                    'services' => [
                        'Brand Identity Design',
                    ],
                    'highlights' => [],
                    'client' => 'Unpoint5',
                    'website' => 'https://unpoint5.fr/',
                    'behance_url' => 'https://www.behance.net/gallery/174714955/Engineering-Consulting-Firm-Visual-Identity-Design',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/unpoint5-brand-identity',
                ],
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
                'brief' => [
                    'overview' => 'Near To Nature Bangladesh is an agricultural multidimensional company committed to fostering sustainable and diverse practices. From cultivating an array of crops to delivering high-quality meat products, its services span the cultivation of diverse crops, sustainable farming practices, premium-quality meat production and wholesome dairy offerings.',
                    'worked_on' => [],
                    'services' => [
                        'Brand Design',
                    ],
                    'highlights' => [],
                    'client' => 'Near To Nature Bangladesh',
                    'website' => null,
                    'behance_url' => 'https://www.behance.net/gallery/184593771/NTNB-Agro-Firm-Visual-Identity',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/near-to-nature/',
                ],
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
                'brief' => [
                    'overview' => 'Sabdita Fashion is an online business specializing in custom-made dresses for women, catering to stylish and fashion-forward individuals who enjoy embracing a modern lifestyle. The brand exudes a clean, sophisticated and contemporary vibe, offering trendy yet elegant dresses designed to empower and inspire its young customers.',
                    'worked_on' => [],
                    'services' => [
                        'Rebranding',
                    ],
                    'highlights' => [],
                    'client' => 'Sabdita Fashion',
                    'website' => null,
                    'behance_url' => 'https://www.behance.net/gallery/184303473/SF-Rebranding',
                    'source_url' => 'https://www.marketorr.com.bd/portfolio/sabdita-fashion/',
                ],
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
                'brief' => [
                    'overview' => null,
                    'worked_on' => [],
                    'services' => [
                        'Illustration',
                    ],
                    'highlights' => [],
                    'client' => null,
                    'website' => null,
                    'behance_url' => 'https://www.behance.net/gallery/180148863/Custom-Illustration-Digital-Art-Digital-Content',
                    'source_url' => null,
                ],
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
                'brief' => [
                    'overview' => null,
                    'worked_on' => [],
                    'services' => [
                        'Illustration',
                    ],
                    'highlights' => [],
                    'client' => null,
                    'website' => null,
                    'behance_url' => 'https://www.behance.net/gallery/180124831/Digital-Art-Illustration-Carpet-Cleaning',
                    'source_url' => null,
                ],
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
                'brief' => [
                    'overview' => null,
                    'worked_on' => [],
                    'services' => [
                        'Illustration',
                    ],
                    'highlights' => [],
                    'client' => null,
                    'website' => null,
                    'behance_url' => 'https://www.behance.net/gallery/180184189/Line-Drawing-Illustration-Art-for-Content-Infographic',
                    'source_url' => null,
                ],
                'featured' => false,
            ],
        ];
    }
}
