<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use SplFileInfo;

/**
 * The UI/UX Portfolio's six showcase projects as CMS projects, each with its
 * Figma exports from `public/images/work/uiux/{slug}/` as its gallery. A slug
 * that already exists is left alone, so this never overwrites admin edits.
 */
class UiuxShowcaseSeeder extends Seeder
{
    /** Where the six projects' Figma exports live under `public/`. */
    private const DIRECTORY = 'images/work/uiux';

    /** File types treated as exported screens. */
    private const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif'];

    /**
     * The UI/UX Portfolio's six showcase projects, in the order they are shown,
     * as they stood in `config/uiux_showcase.php`.
     *
     * @var array<int, array{slug: string, name: string, discipline: string, summary: string, services: array<int, string>}>
     */
    private const PROJECTS = [
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
    ];

    /**
     * Each showcase project becomes a published, featured UI/UX project whose
     * gallery is its exported screens in file-name order, each labelled as the
     * page labelled it, so the public pages show exactly what they showed
     * before.
     */
    public function run(): void
    {
        $categoryId = DB::table('categories')->where('slug', 'web-uiux')->value('id');
        $order = (int) DB::table('projects')->max('sort_order');

        foreach (self::PROJECTS as $project) {
            $order++;

            if (DB::table('projects')->where('slug', $project['slug'])->exists()) {
                continue;
            }

            $folder = self::DIRECTORY.'/'.$project['slug'];
            $files = $this->imageFiles(public_path($folder));
            $cover = collect($files)->first(fn (string $file): bool => strtolower(pathinfo($file, PATHINFO_FILENAME)) === 'cover');

            $screens = collect($files)
                ->reject(fn (string $file): bool => $file === $cover)
                ->map(fn (string $file): array => [
                    'src' => '/'.$folder.'/'.$file,
                    'alt' => $this->label($file),
                    'hidden' => false,
                    'wide' => false,
                    'video' => false,
                ])
                ->values()
                ->all();

            $now = now();

            DB::table('projects')->insert([
                'slug' => $project['slug'],
                'title' => $project['name'],
                'client' => $project['name'],
                'category_id' => $categoryId,
                'work_group' => 'uiux',
                'discipline' => $project['discipline'],
                'layout' => 'screens',
                'year' => '',
                'description' => $project['summary'],
                'accent' => '#507AF4',
                'image_path' => $cover !== null ? '/'.$folder.'/'.$cover : '',
                'image_alt' => $project['name'].' '.$project['discipline'],
                'tags' => json_encode($project['services']),
                // Featured is what puts a showcase project on the home page's UI/UX section, where all six were shown.
                'featured' => true,
                'status' => 'published',
                'sort_order' => $order,
                'case_study' => $screens === [] ? null : json_encode([['label' => 'Project gallery', 'note' => null, 'images' => $screens]]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    /**
     * Image file names in a folder, in natural order.
     *
     * @return array<int, string>
     */
    private function imageFiles(string $path): array
    {
        if (! File::isDirectory($path)) {
            return [];
        }

        $files = collect(File::files($path))
            ->filter(fn (SplFileInfo $file): bool => in_array(strtolower($file->getExtension()), self::EXTENSIONS, true))
            ->map(fn (SplFileInfo $file): string => $file->getFilename())
            ->all();

        natcasesort($files);

        return array_values($files);
    }

    /**
     * The page label the showcase gave an export, e.g. `07-ui-ux-service.webp`
     * is "UI/UX Service".
     */
    private function label(string $file): string
    {
        $acronyms = ['ai' => 'AI', 'csr' => 'CSR', 'it' => 'IT', 'seo' => 'SEO', 'ui' => 'UI', 'ux' => 'UX'];
        $minor = ['a', 'an', 'and', 'for', 'of', 'the', 'to'];

        $label = collect(explode('-', Str::slug(preg_replace('/^\d+[a-z]?[-_ ]+/i', '', pathinfo($file, PATHINFO_FILENAME)))))
            ->filter()
            ->values()
            ->map(fn (string $word, int $index): string => $acronyms[$word]
                ?? ($index > 0 && in_array($word, $minor, true) ? $word : Str::ucfirst($word)))
            ->implode(' ');

        return str_replace('UI UX', 'UI/UX', $label);
    }
}
