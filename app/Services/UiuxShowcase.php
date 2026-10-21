<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * The UI/UX Portfolio's showcase projects and the Figma screens exported for
 * each.
 *
 * Each showcase project is a CMS project with the screen-by-screen layout,
 * managed under the admin panel's UI/UX tab: its gallery is its screens, in
 * order, each labelled by its alt text (or, without one, by its file name:
 * `03-contact-us.webp` is the "Contact Us" page), and only published ones are
 * shown. Dimensions are read up front so the page can size every frame before
 * its image arrives.
 */
class UiuxShowcase
{
    /** Words that read as acronyms rather than title-cased words in a page label. */
    private const ACRONYMS = ['ai' => 'AI', 'csr' => 'CSR', 'it' => 'IT', 'seo' => 'SEO', 'ui' => 'UI', 'ux' => 'UX'];

    /** Short words kept lower case inside a page label. */
    private const MINOR_WORDS = ['a', 'an', 'and', 'for', 'of', 'the', 'to'];

    /**
     * Published showcase projects in admin order; `$featuredOnly` keeps just
     * those featured for the home page.
     *
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
    public function projects(bool $featuredOnly = false): array
    {
        return Project::query()
            ->published()
            ->showcase()
            ->when($featuredOnly, fn ($query) => $query->featured())
            ->get()
            ->map(fn (Project $project): array => $this->build($project))
            ->values()
            ->all();
    }

    /**
     * One published showcase project by slug, or null when there is none.
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
        $project = Project::query()->published()->showcase()->where('slug', $slug)->first();

        return $project === null ? null : $this->build($project);
    }

    /**
     * @return array<string, mixed>
     */
    private function build(Project $project): array
    {
        $discipline = (string) $project->discipline;

        $screens = collect($project->case_study ?? [])
            ->flatMap(fn ($section): array => $section['images'] ?? [])
            ->filter(fn ($image): bool => filled($image['src'] ?? null) && blank($image['vimeo'] ?? null) && ! ($image['hidden'] ?? false))
            ->map(function (array $image) use ($project): ?array {
                $label = filled($image['alt'] ?? null) ? trim((string) $image['alt']) : $this->label((string) $image['src']);
                $screen = $this->describe((string) $image['src'], sprintf('%s %s page design', $project->title, $label));

                return $screen === null ? null : [...$screen, 'label' => $label];
            })
            ->filter()
            ->values()
            ->all();

        $cover = filled($project->image_path)
            ? $this->describe($project->image_path, $project->image_alt ?: $project->title.' '.$discipline)
            : null;

        return [
            'slug' => $project->slug,
            'name' => $project->title,
            'discipline' => $discipline,
            'summary' => $project->description ?: null,
            'services' => $project->tags ?? [],
            'cover' => $cover ?? ($screens[0] ?? null),
            'screens' => $screens,
        ];
    }

    /**
     * Human page name from an export's file name, without its ordering prefix.
     */
    private function label(string $path): string
    {
        $file = basename((string) parse_url($path, PHP_URL_PATH));

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
     * Public URLs (on the configured asset URL) and intrinsic size of one
     * export; null when it is not a readable local image.
     *
     * A root-relative path (`/images/work/uiux/...`) is a file under `public/`;
     * anything else is a file on the public disk, as the media library stores
     * it. `thumb` is the top of the screen from the same folder's `thumbs/`,
     * used wherever only a preview is shown, so the full-length page is only
     * downloaded when it is opened. Without one, the full export is used.
     * The modification time is appended so a re-exported screen is never
     * served stale.
     *
     * @return array{src: string, thumb: string, width: int, height: int, alt: string}|null
     */
    private function describe(string $path, string $alt): ?array
    {
        $path = trim($path);

        if (str_starts_with($path, '/') && ! str_starts_with($path, '/storage/')) {
            $relative = ltrim($path, '/');
            $file = public_path($relative);
            $url = fn (string $relativePath): string => PublicAsset::to($relativePath);
        } else {
            $relative = ltrim((string) preg_replace('#^(https?://[^/]+)?/storage/#', '', $path), '/');

            if (str_contains($relative, '://')) {
                return null;
            }

            $file = Storage::disk('public')->path($relative);
            $url = fn (string $relativePath): string => PublicAsset::disk($relativePath);
        }

        $size = is_file($file) ? @getimagesize($file) : false;

        if ($size === false || $size[0] === 0 || $size[1] === 0) {
            return null;
        }

        $directory = dirname($relative);
        $prefix = $directory === '.' ? '' : $directory.'/';
        $src = $url($prefix.rawurlencode(basename($file))).'?v='.filemtime($file);
        $thumbFile = dirname($file).'/thumbs/'.basename($file);

        return [
            'src' => $src,
            'thumb' => is_file($thumbFile)
                ? $url($prefix.'thumbs/'.rawurlencode(basename($file))).'?v='.filemtime($thumbFile)
                : $src,
            'width' => $size[0],
            'height' => $size[1],
            'alt' => $alt,
        ];
    }
}
