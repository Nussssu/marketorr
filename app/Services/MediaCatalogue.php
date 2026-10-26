<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Project;
use App\Models\SubService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * The media library's view of the Branding and UI/UX work: every image the
 * portfolio projects and the two service tabs use (covers, galleries, share
 * images, service showcase and case-study images), where each is used, and
 * one library entry per file.
 *
 * The same file stored at two paths (a cover uploaded again as a gallery
 * image, a library upload of a file the site already ships) is kept as one
 * entry pointing at the site's own copy, and every use is pointed at that
 * copy, so each image has a single source.
 */
class MediaCatalogue
{
    public const SECTIONS = ['branding' => 'Branding', 'uiux' => 'UI/UX'];

    /**
     * Every use of an image by the Branding and UI/UX projects and services,
     * in display order: projects by their order, then services by tab.
     *
     * @return Collection<int, array{key: string, path: string, section: string, owner: string, owner_key: string, owner_type: string, role: string, alt: ?string, edit_url: string}>
     */
    public function references(): Collection
    {
        $references = collect();

        Project::query()->with('category.parent')->orderBy('sort_order')->orderBy('id')->get()
            ->each(function (Project $project) use ($references): void {
                $owner = [
                    'section' => $project->workGroup(),
                    'owner' => $project->title,
                    'owner_key' => 'project-'.$project->id,
                    'owner_type' => 'Project',
                    'edit_url' => "/admin/projects/{$project->id}/edit",
                ];

                $this->push($references, $owner, $project->image_path, 'Cover', $project->image_alt);
                $this->push($references, $owner, $project->meta_og_image, 'Share image');

                $number = 0;
                foreach ($project->case_study ?? [] as $section) {
                    foreach ($section['images'] ?? [] as $image) {
                        $this->push($references, $owner, $image['src'] ?? null, 'Gallery image '.(++$number), $image['alt'] ?? null);
                    }
                }
            });

        SubService::query()->with('group')
            ->join('service_groups', 'service_groups.id', '=', 'sub_services.service_group_id')
            ->orderBy('service_groups.sort_order')->orderBy('sub_services.sort_order')->orderBy('sub_services.id')
            ->select('sub_services.*')
            ->get()
            ->each(function (SubService $service) use ($references): void {
                $section = $this->sectionForGroup($service->group?->slug);

                if ($section === null) {
                    return;
                }

                $owner = [
                    'section' => $section,
                    'owner' => $service->name,
                    'owner_key' => 'service-'.$service->id,
                    'owner_type' => 'Service',
                    'edit_url' => "/admin/sub-services/{$service->id}/edit",
                ];

                $this->push($references, $owner, $service->image, 'Showcase image', $service->image_alt);
                $this->push($references, $owner, $service->meta_og_image, 'Share image');

                $number = 0;
                foreach ($service->case_study['sections'] ?? [] as $section) {
                    foreach ($section['images'] ?? [] as $image) {
                        $this->push($references, $owner, $image['src'] ?? null, 'Case study image '.(++$number), $image['alt'] ?? null);
                    }
                }
            });

        return $references->values();
    }

    /**
     * Bring the library in line with the references: add any image not in it
     * yet, keep one entry per file, and point every use of a file stored
     * twice at the one copy the library keeps. Safe to run again; once the
     * library is in step it only reads.
     *
     * @return array{added: int, merged: int, repointed: int}
     */
    public function sync(): array
    {
        $result = ['added' => 0, 'merged' => 0, 'repointed' => 0];
        $references = $this->references();
        $known = Media::query()->pluck('id', 'path')->mapWithKeys(fn (int $id, string $path): array => [self::key($path) => $id]);

        // Only files the library does not hold at their exact path need reading.
        $unknown = $references->reject(fn (array $reference): bool => $known->has($reference['key']))->unique('key');

        if ($unknown->isEmpty()) {
            return $result;
        }

        $byChecksum = [];

        foreach ($unknown as $reference) {
            $checksum = Media::checksumOf((string) self::absolutePath($reference['path']));

            if ($checksum !== null) {
                $byChecksum[$checksum][] = $reference;
            }
        }

        DB::transaction(function () use ($byChecksum, $references, &$result): void {
            $repoint = [];

            foreach ($byChecksum as $checksum => $group) {
                $rows = Media::query()->where('checksum', $checksum)->orderBy('id')->get();
                $paths = collect($group)->pluck('path')->merge($rows->pluck('path'))->unique()->values();
                $canonical = $this->canonicalPath($paths);

                if ($rows->isEmpty()) {
                    $this->addEntry($canonical, $checksum, $group[0]);
                    $result['added']++;
                } else {
                    $keep = $rows->first(fn (Media $row): bool => self::key($row->path) === self::key($canonical)) ?? $rows->first();

                    if (self::key($keep->path) !== self::key($canonical)) {
                        $keep->update(['path' => $canonical]);
                    }

                    $rows->reject(fn (Media $row): bool => $row->is($keep))->each(function (Media $row) use (&$result): void {
                        // Only the duplicate entry goes; the file itself is left alone.
                        $row->delete();
                        $result['merged']++;
                    });
                }

                foreach ($paths as $path) {
                    if (self::key($path) !== self::key($canonical)) {
                        $repoint[self::key($path)] = $canonical;
                    }
                }
            }

            $result['repointed'] = $this->repoint($repoint, $references);
        });

        return $result;
    }

    /**
     * The uses of each library entry, keyed by media id.
     *
     * @param  Collection<int, Media>  $media
     * @return array<int, array<int, array<string, string|null>>>
     */
    public function usageByMedia(Collection $media, ?Collection $references = null): array
    {
        $references ??= $this->references();
        $byKey = $references->groupBy('key');

        return $media->mapWithKeys(fn (Media $medium): array => [
            $medium->id => $byKey->get(self::key($medium->path), collect())
                ->map(fn (array $reference): array => collect($reference)->only(['section', 'owner', 'owner_key', 'owner_type', 'role', 'edit_url'])->all())
                ->values()
                ->all(),
        ])->all();
    }

    /**
     * The comparable form of a stored path: `/storage/x` and `x` are the same
     * file on the public disk; site files keep their leading slash.
     */
    public static function key(string $path): string
    {
        $path = str_replace('\\', '/', parse_url($path, PHP_URL_PATH) ?: $path);

        if (str_starts_with($path, '/storage/')) {
            return substr($path, strlen('/storage/'));
        }

        return $path;
    }

    /**
     * Where a stored path's file is on this server, resolved the way the
     * site serves it (see Project::mediaUrl()).
     */
    public static function absolutePath(string $path): ?string
    {
        $key = self::key($path);

        if (str_starts_with($key, 'http')) {
            return null;
        }

        if (str_starts_with($key, '/')) {
            return public_path(ltrim($key, '/'));
        }

        foreach ([public_path('storage/'.$key), storage_path('app/public/'.$key), public_path('images/work/'.basename($key))] as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $references
     * @param  array{section: string, owner: string, owner_key: string, owner_type: string, edit_url: string}  $owner
     */
    private function push(Collection $references, array $owner, mixed $path, string $role, ?string $alt = null): void
    {
        if (! is_string($path) || blank($path) || str_starts_with($path, 'http') || str_starts_with($path, '//')) {
            return;
        }

        $references->push([...$owner, 'key' => self::key($path), 'path' => $path, 'role' => $role, 'alt' => $alt]);
    }

    private function sectionForGroup(?string $slug): ?string
    {
        return match ($slug) {
            'branding' => 'branding',
            'ui-ux', 'uiux' => 'uiux',
            default => null,
        };
    }

    /**
     * The one copy kept of a file stored at several paths: the site's own
     * file under `/images/` when there is one (it has optimized copies),
     * otherwise a file on the public disk.
     *
     * @param  Collection<int, string>  $paths
     */
    private function canonicalPath(Collection $paths): string
    {
        $paths = $paths->map(fn (string $path): string => str_starts_with($path, '/storage/') ? self::key($path) : $path)->unique()->sort()->values();

        return $paths->first(fn (string $path): bool => str_starts_with($path, '/images/'))
            ?? $paths->first(fn (string $path): bool => ! str_starts_with($path, '/'))
            ?? $paths->first();
    }

    /**
     * @param  array<string, mixed>  $reference
     */
    private function addEntry(string $path, string $checksum, array $reference): void
    {
        $absolute = (string) self::absolutePath($path);
        $dimensions = @getimagesize($absolute) ?: null;
        $folder = basename(dirname(self::key($path)));
        $folder = in_array($folder, ['work', 'projects', 'media', 'images', '.', ''], true) ? '' : $folder;

        Media::query()->create([
            'filename' => ltrim($folder.'-'.basename($path), '-'),
            'path' => $path,
            'checksum' => $checksum,
            'mime_type' => $dimensions['mime'] ?? File::mimeType($absolute),
            'size_bytes' => File::size($absolute),
            'width' => $dimensions[0] ?? null,
            'height' => $dimensions[1] ?? null,
            'category' => self::SECTIONS[$reference['section']] ?? 'General',
            'usage_location' => $reference['owner'],
            'alt_text' => $reference['alt'] ?: Str::headline($reference['owner'].' '.$reference['role']),
        ]);
    }

    /**
     * Point every use of a duplicate path at the kept copy.
     *
     * @param  array<string, string>  $map  duplicate key => kept path
     * @param  Collection<int, array<string, mixed>>  $references
     */
    private function repoint(array $map, Collection $references): int
    {
        if ($map === []) {
            return 0;
        }

        $count = 0;
        $swap = function (mixed $path) use ($map, &$count): mixed {
            if (is_string($path) && filled($path) && isset($map[self::key($path)])) {
                $count++;

                return $map[self::key($path)];
            }

            return $path;
        };

        $owners = $references->filter(fn (array $reference): bool => isset($map[$reference['key']]))->pluck('owner_key')->unique();

        foreach ($owners as $ownerKey) {
            [$type, $id] = explode('-', $ownerKey, 2);

            if ($type === 'project') {
                $project = Project::query()->find($id);
                $project->timestamps = false;
                $caseStudy = collect($project->case_study ?? [])->map(function (array $section) use ($swap): array {
                    $section['images'] = collect($section['images'] ?? [])->map(fn (array $image): array => [...$image, 'src' => $swap($image['src'] ?? null)])->all();

                    return $section;
                })->all();
                $project->forceFill([
                    'image_path' => $swap($project->image_path),
                    'meta_og_image' => $swap($project->meta_og_image),
                    'case_study' => $project->case_study === null ? null : $caseStudy,
                ])->save();
            } else {
                $service = SubService::query()->find($id);
                $service->timestamps = false;
                $caseStudy = $service->case_study;

                if (is_array($caseStudy)) {
                    $caseStudy['sections'] = collect($caseStudy['sections'] ?? [])->map(function (array $section) use ($swap): array {
                        $section['images'] = collect($section['images'] ?? [])->map(fn (array $image): array => [...$image, 'src' => $swap($image['src'] ?? null)])->all();

                        return $section;
                    })->all();
                }

                $service->forceFill([
                    'image' => $swap($service->image),
                    'meta_og_image' => $swap($service->meta_og_image),
                    'case_study' => $caseStudy,
                ])->save();
            }
        }

        return $count;
    }
}
