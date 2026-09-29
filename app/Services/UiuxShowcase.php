<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * The UI/UX Portfolio's six projects and the Figma screens exported for each.
 *
 * Screens are discovered on disk rather than listed, so dropping a new export
 * into a project's folder is all it takes to show and print it. Dimensions are
 * read up front so the page can size every frame before its image arrives,
 * and each screen is labelled from its file name (`03-contact-us.webp` is the
 * "Contact Us" page).
 */
class UiuxShowcase
{
    /** File types treated as exported screens. */
    private const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif'];

    /** Words that read as acronyms rather than title-cased words in a page label. */
    private const ACRONYMS = ['ai' => 'AI', 'csr' => 'CSR', 'it' => 'IT', 'seo' => 'SEO', 'ui' => 'UI', 'ux' => 'UX'];

    /** Short words kept lower case inside a page label. */
    private const MINOR_WORDS = ['a', 'an', 'and', 'for', 'of', 'the', 'to'];

    /**
     * @return array<int, array{
     *     slug: string,
     *     name: string,
     *     discipline: string,
     *     summary: string|null,
     *     services: array<int, string>,
     *     cover: array{src: string, thumb: string, width: int, height: int, alt: string}|null,
     *     screens: array<int, array{src: string, thumb: string, width: int, height: int, alt: string, label: string}>
     * }>
     */
    public function projects(): array
    {
        return collect(config('uiux_showcase.projects', []))
            ->map(fn (array $project): array => $this->build($project))
            ->values()
            ->all();
    }

    /**
     * One project by slug, or null when it is not one of the six.
     *
     * @return array{
     *     slug: string,
     *     name: string,
     *     discipline: string,
     *     summary: string|null,
     *     services: array<int, string>,
     *     cover: array{src: string, thumb: string, width: int, height: int, alt: string}|null,
     *     screens: array<int, array{src: string, thumb: string, width: int, height: int, alt: string, label: string}>
     * }|null
     */
    public function find(string $slug): ?array
    {
        $project = collect(config('uiux_showcase.projects', []))->firstWhere('slug', $slug);

        return $project === null ? null : $this->build($project);
    }

    /**
     * @param  array{slug: string, name: string, discipline: string, summary?: string, services?: array<int, string>}  $project
     * @return array<string, mixed>
     */
    private function build(array $project): array
    {
        $directory = trim((string) config('uiux_showcase.directory'), '/').'/'.$project['slug'];
        $files = $this->imageFiles(public_path($directory));

        $coverFile = collect($files)->first(
            fn (string $file): bool => strtolower(pathinfo($file, PATHINFO_FILENAME)) === 'cover'
        );
        $screenFiles = array_values(array_filter($files, fn (string $file): bool => $file !== $coverFile));

        $screens = collect($screenFiles)
            ->map(function (string $file) use ($directory, $project): ?array {
                $label = $this->label($file);
                $screen = $this->describe($file, $directory, sprintf('%s %s page design', $project['name'], $label));

                return $screen === null ? null : [...$screen, 'label' => $label];
            })
            ->filter()
            ->values()
            ->all();

        $cover = $coverFile !== null
            ? $this->describe($coverFile, $directory, $project['name'].' '.$project['discipline'])
            : null;

        return [
            'slug' => $project['slug'],
            'name' => $project['name'],
            'discipline' => $project['discipline'],
            'summary' => $project['summary'] ?? null,
            'services' => $project['services'] ?? [],
            'cover' => $cover ?? ($screens[0] ?? null),
            'screens' => $screens,
        ];
    }

    /**
     * Human page name from an export's file name, without its ordering prefix.
     */
    private function label(string $file): string
    {
        $words = collect(explode('-', Str::slug(preg_replace('/^\d+[a-z]?[-_ ]+/i', '', pathinfo($file, PATHINFO_FILENAME)))))
            ->filter()
            ->values();

        $label = $words
            ->map(fn (string $word, int $index): string => self::ACRONYMS[$word]
                ?? ($index > 0 && in_array($word, self::MINOR_WORDS, true) ? $word : Str::ucfirst($word)))
            ->implode(' ');

        return str_replace('UI UX', 'UI/UX', $label);
    }

    /**
     * Image files in a folder, in natural file-name order.
     *
     * @return array<int, string>
     */
    private function imageFiles(string $path): array
    {
        if (! File::isDirectory($path)) {
            return [];
        }

        $files = collect(File::files($path))
            ->filter(fn (\SplFileInfo $file): bool => in_array(strtolower($file->getExtension()), self::EXTENSIONS, true))
            ->map(fn (\SplFileInfo $file): string => $file->getPathname())
            ->all();

        natcasesort($files);

        return array_values($files);
    }

    /**
     * Public URLs and intrinsic size of one export; null when it is not a readable image.
     *
     * `thumb` is the top of the screen from the project's `thumbs/` folder,
     * used wherever only a preview is shown, so the full-length page is only
     * downloaded when it is opened. Without one, the full export is used.
     * The modification time is appended so a re-exported screen is never
     * served stale.
     *
     * @return array{src: string, thumb: string, width: int, height: int, alt: string}|null
     */
    private function describe(string $file, string $publicDirectory, string $alt): ?array
    {
        $size = @getimagesize($file);

        if ($size === false || $size[0] === 0 || $size[1] === 0) {
            return null;
        }

        $src = '/'.$publicDirectory.'/'.rawurlencode(basename($file)).'?v='.filemtime($file);
        $thumbFile = dirname($file).'/thumbs/'.basename($file);

        return [
            'src' => $src,
            'thumb' => is_file($thumbFile)
                ? '/'.$publicDirectory.'/thumbs/'.rawurlencode(basename($file)).'?v='.filemtime($thumbFile)
                : $src,
            'width' => $size[0],
            'height' => $size[1],
            'alt' => $alt,
        ];
    }
}
