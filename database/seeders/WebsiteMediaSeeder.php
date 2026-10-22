<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use SplFileInfo;

/**
 * Adds every GIF and video the website ships under `public/` to the media
 * library, at the path the site uses it from. Where the library already holds
 * the same file (same checksum), that entry is pointed at the site's file, so
 * each file has one entry and one link. Safe to run again.
 */
class WebsiteMediaSeeder extends Seeder
{
    /** Folders under `public/` whose GIFs and videos the website shows. */
    private const SITE_FOLDERS = ['images', 'videos'];

    /** Generated copies that are never library files of their own. */
    private const SKIPPED_FOLDERS = ['/opt/', '/thumbs/', '/thumbs-sm/'];

    private const EXTENSIONS = ['gif', 'mp4', 'webm', 'mov', 'm4v'];

    public function run(): void
    {
        $alts = $this->galleryAlts();

        foreach ($this->siteFiles() as $absolute) {
            $path = '/'.str_replace('\\', '/', ltrim(Str::after($absolute, public_path()), '\\/'));
            $checksum = $this->checksum($absolute);
            $existing = DB::table('media')->where('path', $path)->first()
                ?? ($checksum !== null ? DB::table('media')->where('checksum', $checksum)->orderBy('id')->first() : null);

            if ($existing !== null) {
                DB::table('media')->where('id', $existing->id)->update(['path' => $path, 'checksum' => $checksum, 'updated_at' => now()]);

                continue;
            }

            $dimensions = @getimagesize($absolute) ?: null;
            // A file in a project's own folder is named after it (dusty-vision-03.gif).
            $folder = basename(dirname($absolute));
            $folder = in_array($folder, self::SITE_FOLDERS, true) ? '' : $folder;
            $now = now();

            DB::table('media')->insert([
                'filename' => ltrim($folder.'-'.basename($absolute), '-'),
                'path' => $path,
                'checksum' => $checksum,
                'mime_type' => $dimensions['mime'] ?? File::mimeType($absolute),
                'size_bytes' => File::size($absolute),
                'width' => $dimensions[0] ?? null,
                'height' => $dimensions[1] ?? null,
                'category' => str_starts_with($path, '/images/work/') ? 'Work' : 'Website',
                'usage_location' => 'Website',
                'alt_text' => $alts[$path] ?? Str::headline($folder.' '.pathinfo($absolute, PATHINFO_FILENAME)),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    /**
     * @return array<int, string>
     */
    private function siteFiles(): array
    {
        return collect(self::SITE_FOLDERS)
            ->map(fn (string $folder): string => public_path($folder))
            ->filter(fn (string $folder): bool => File::isDirectory($folder))
            ->flatMap(fn (string $folder): array => File::allFiles($folder))
            ->map(fn (SplFileInfo $file): string => $file->getPathname())
            ->filter(fn (string $file): bool => in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), self::EXTENSIONS, true))
            ->reject(fn (string $file): bool => Str::contains(str_replace('\\', '/', $file), self::SKIPPED_FOLDERS))
            ->sort()
            ->values()
            ->all();
    }

    /**
     * Alt text the project galleries already give each image, by path.
     *
     * @return array<string, string>
     */
    private function galleryAlts(): array
    {
        return DB::table('projects')->whereNotNull('case_study')->pluck('case_study')
            ->flatMap(fn (string $caseStudy): array => collect(json_decode($caseStudy, true) ?: [])->flatMap(fn ($section): array => $section['images'] ?? [])->all())
            ->filter(fn ($image): bool => filled($image['src'] ?? null) && filled($image['alt'] ?? null))
            ->mapWithKeys(fn (array $image): array => [$image['src'] => $image['alt']])
            ->all();
    }

    private function checksum(string $absolute): ?string
    {
        return is_file($absolute) ? hash_file('sha256', $absolute) : null;
    }
}
