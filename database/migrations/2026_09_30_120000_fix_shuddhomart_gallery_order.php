<?php

use App\Models\Project;
use Illuminate\Database\Migrations\Migration;

/**
 * Fix the ShuddhoMart dedicated-page sequence: drop the two near-bottom
 * repeat exports and lead with the final two frames.
 *
 * Seeder-side ordering (ProjectSeeder::GALLERY_ORDER) covers fresh seeds;
 * this carries the same sequence onto rows that were seeded before it.
 * Admins can still reorder freely from the project form afterwards.
 */
return new class extends Migration
{
    /** @var list<string> */
    private const ORDER = [
        '14.webp', '15.webp',
        '01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp',
        '07.webp', '08.webp', '09.webp', '10.webp', '11.webp',
    ];

    public function up(): void
    {
        $project = Project::query()->where('slug', 'shuddhomart-branding')->first();

        if ($project === null || ! is_array($project->case_study)) {
            return;
        }

        $byFilename = collect($project->case_study)
            ->flatMap(fn ($section) => $section['images'] ?? [])
            ->filter(fn ($image): bool => blank($image['vimeo'] ?? null) && filled($image['src'] ?? null))
            ->keyBy(fn ($image): string => basename(parse_url($image['src'], PHP_URL_PATH) ?? $image['src']));

        $stills = collect(self::ORDER)
            ->filter(fn (string $filename): bool => $byFilename->has($filename))
            ->map(fn (string $filename, int $index) => array_merge(
                $byFilename->get($filename),
                ['alt' => 'ShuddhoMart project image '.($index + 1), 'wide' => false, 'video' => false],
            ))
            ->values()
            ->all();

        if ($stills === []) {
            return;
        }

        $films = collect($project->case_study)
            ->filter(fn ($section): bool => collect($section['images'] ?? [])
                ->contains(fn ($image): bool => filled($image['vimeo'] ?? null)))
            ->values()
            ->all();

        $project->case_study = [
            ['label' => 'Project gallery', 'note' => null, 'images' => $stills],
            ...$films,
        ];
        $project->save();
    }

    public function down(): void
    {
        // Order-only fix: no structural rollback.
    }
};
