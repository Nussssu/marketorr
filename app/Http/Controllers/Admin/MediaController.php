<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FetchMediaRequest;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Models\Category;
use App\Models\GlobalBlock;
use App\Models\Media;
use App\Models\Project;
use App\Services\MediaCatalogue;
use App\Services\TrashBin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request, MediaCatalogue $catalogue): Response|JsonResponse
    {
        // Picks up any Branding / UI/UX image added since the last visit; once
        // the library is in step this only reads.
        $catalogue->sync();

        $allMedia = Media::query()->get();
        $usageMap = $this->usageMap($allMedia);
        $references = $catalogue->references();
        $uses = $catalogue->usageByMedia($allMedia, $references);
        // A section holds what its projects and services use, plus files
        // uploaded into its category that nothing uses yet.
        $sectionIds = collect(MediaCatalogue::SECTIONS)->map(fn (string $label, string $section): array => collect($uses)
            ->filter(fn (array $list): bool => collect($list)->contains('section', $section))
            ->keys()
            ->merge($allMedia->filter(fn (Media $medium): bool => mb_strtolower((string) $medium->category) === mb_strtolower($label))->modelKeys())
            ->unique()
            ->values()
            ->all());
        $section = $request->string('section')->lower()->toString();
        $section = in_array($section, ['branding', 'uiux', 'other'], true) ? $section : 'all';
        $usage = $request->string('usage')->lower()->toString();
        $usage = in_array($usage, ['products', 'categories', 'banners'], true) ? $usage : 'all';
        $type = $request->string('type')->lower()->toString();
        $type = in_array($type, ['images', 'videos', 'gif', 'documents'], true) ? $type : 'all';
        $sort = $request->string('sort')->toString();
        $sort = in_array($sort, ['newest', 'oldest', 'name_asc', 'name_desc', 'largest', 'smallest'], true)
            ? $sort
            : 'newest';

        $query = Media::query();

        if ($search = $request->string('search')->trim()->toString()) {
            // A project's name finds every image it uses, as well as the files
            // uploaded under it.
            $needle = mb_strtolower($search);
            $ownedIds = collect($uses)
                ->filter(fn (array $list): bool => collect($list)->contains(fn (array $use): bool => str_contains(mb_strtolower((string) $use['owner']), $needle)))
                ->keys()
                ->all();

            $query->where(function ($q) use ($search, $ownedIds) {
                $q->where('filename', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('usage_location', 'like', "%{$search}%")
                    ->orWhereKey($ownedIds);
            });
        }

        match ($type) {
            'images' => $query->where('mime_type', 'like', 'image/%')->where('mime_type', '!=', 'image/gif'),
            'gif' => $query->where('mime_type', 'image/gif'),
            'videos' => $query->where('mime_type', 'like', 'video/%'),
            'documents' => $query->where(fn ($q) => $q->whereNull('mime_type')
                ->orWhere(fn ($q) => $q->where('mime_type', 'not like', 'image/%')->where('mime_type', 'not like', 'video/%'))),
            default => null,
        };

        // The library page lists files grouped by kind first — images, GIFs,
        // videos, documents — then by the chosen sort. The picker keeps its order.
        if (! ($request->wantsJson() || $request->boolean('json'))) {
            $query->orderByRaw("CASE WHEN mime_type = 'image/gif' THEN 1 WHEN mime_type LIKE 'image/%' THEN 0 WHEN mime_type LIKE 'video/%' THEN 2 ELSE 3 END");
        }

        if ($usage !== 'all') {
            $ids = $allMedia
                ->filter(fn (Media $medium): bool => in_array($usage, $usageMap[$medium->id]['groups'] ?? [], true))
                ->modelKeys();

            $query->whereKey($ids);
        }

        match ($section) {
            'branding', 'uiux' => $query->whereKey($sectionIds[$section]),
            'other' => $query->whereKeyNot(collect($sectionIds)->flatten()->unique()->all()),
            default => null,
        };

        match ($sort) {
            'oldest' => $query->orderBy('created_at')->orderBy('id'),
            'name_asc' => $query->orderBy('filename')->orderBy('id'),
            'name_desc' => $query->orderByDesc('filename')->orderByDesc('id'),
            'largest' => $query->orderByDesc('size_bytes')->orderByDesc('id'),
            'smallest' => $query->orderBy('size_bytes')->orderBy('id'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };

        $categories = Media::query()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        if ($request->wantsJson() || $request->boolean('json')) {
            return response()->json([
                'media' => $query->get()->map(
                    fn (Media $medium): array => $medium->toAdminArray($usageMap[$medium->id] ?? [], $uses[$medium->id] ?? [])
                ),
                'categories' => $categories,
                'projects' => $this->projectOptions(),
            ]);
        }

        // Branding and UI/UX are shown whole, grouped by the project or
        // service using each image; the other views page through the library.
        $groups = [];

        if (in_array($section, ['branding', 'uiux'], true)) {
            $found = $query->get()->keyBy('id');
            $byKey = $found->groupBy(fn (Media $medium): string => MediaCatalogue::key($medium->path));
            $placed = [];

            foreach ($references->where('section', $section) as $reference) {
                foreach ($byKey->get($reference['key'], collect()) as $medium) {
                    if (isset($placed[$medium->id])) {
                        continue;
                    }

                    $placed[$medium->id] = true;
                    $groups[$reference['owner_key']] ??= [
                        'key' => $reference['owner_key'],
                        'title' => $reference['owner'],
                        'type' => $reference['owner_type'],
                        'edit_url' => $reference['edit_url'],
                        'ids' => [],
                    ];
                    $groups[$reference['owner_key']]['ids'][] = $medium->id;
                }
            }

            // Files uploaded under a project sit with that project's images.
            $projectsByTitle = collect($this->projectOptions())
                ->where('section', $section)
                ->keyBy(fn (array $project): string => mb_strtolower(trim($project['title'])));

            foreach ($found as $medium) {
                $project = $projectsByTitle->get(mb_strtolower(trim((string) $medium->usage_location)));

                if (isset($placed[$medium->id]) || $project === null) {
                    continue;
                }

                $placed[$medium->id] = true;
                $groups['project-'.$project['id']] ??= [
                    'key' => 'project-'.$project['id'],
                    'title' => $project['title'],
                    'type' => 'Project',
                    'edit_url' => "/admin/projects/{$project['id']}/edit",
                    'ids' => [],
                ];
                $groups['project-'.$project['id']]['ids'][] = $medium->id;
            }

            $loose = $found->keys()->reject(fn (int $id): bool => isset($placed[$id]))->values()->all();

            if ($loose !== []) {
                $groups['uploads'] = ['key' => 'uploads', 'title' => 'Uploaded, not used yet', 'type' => 'Uploads', 'edit_url' => null, 'ids' => $loose];
            }

            // Paged like the other views, in project order; a project split
            // across pages keeps its heading (with its full count) on each.
            $ordered = collect($groups)->pluck('ids')->flatten()->values();
            $page = LengthAwarePaginator::resolveCurrentPage();
            $onPage = $ordered->slice(($page - 1) * 15, 15)->values();

            $groups = collect($groups)
                ->map(fn (array $group): array => [...$group, 'total' => count($group['ids']), 'ids' => array_values(array_intersect($group['ids'], $onPage->all()))])
                ->filter(fn (array $group): bool => $group['ids'] !== [])
                ->values()
                ->all();
            $media = (new LengthAwarePaginator(
                $onPage->map(fn (int $id): array => $found[$id]->toAdminArray($usageMap[$id] ?? [], $uses[$id] ?? [])),
                $ordered->count(),
                15,
                $page,
                ['path' => $request->url(), 'query' => $request->query()],
            ));
        } else {
            $media = $query
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Media $medium): array => $medium->toAdminArray($usageMap[$medium->id] ?? [], $uses[$medium->id] ?? []));
        }

        $imageCount = $allMedia->filter(fn (Media $medium): bool => str_starts_with((string) $medium->mime_type, 'image/')
            || (bool) preg_match('/\.(jpe?g|png|webp|gif|svg|avif)$/i', $medium->filename))->count();

        $sectioned = collect($sectionIds)->flatten()->unique();

        return Inertia::render('Admin/Media/Index', [
            'media' => $media,
            'groups' => $groups,
            'sections' => [
                'all' => $allMedia->count(),
                'branding' => count($sectionIds['branding']),
                'uiux' => count($sectionIds['uiux']),
                'other' => $allMedia->reject(fn (Media $medium): bool => $sectioned->contains($medium->id))->count(),
            ],
            'categories' => $categories,
            'projects' => $this->projectOptions(),
            'filters' => [
                'section' => $section,
                'usage' => $usage,
                'type' => $type,
                'search' => $request->string('search')->toString(),
                'sort' => $sort,
            ],
            'stats' => [
                'total_files' => $allMedia->count(),
                'storage_used' => $this->readableBytes((int) $allMedia->sum('size_bytes')),
                'images' => $imageCount,
                'used_in_products' => $allMedia->filter(
                    fn (Media $medium): bool => in_array('products', $usageMap[$medium->id]['actual_groups'] ?? [], true)
                )->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Media/Form', ['medium' => null]);
    }

    public function store(StoreMediaRequest $request): RedirectResponse|JsonResponse
    {
        $category = $request->input('category') ?: 'General';
        $files = collect($request->file('files', []));

        if ($request->hasFile('file')) {
            $files->prepend($request->file('file'));
        }

        $catalogue = $request->safe()->except(['file', 'files', 'category']);

        // A file already in the library is not stored again: the existing
        // entry is reused, so the same file always has one link.
        $duplicates = 0;
        $media = $files->map(function ($file) use ($request, $catalogue, $category, &$duplicates): Media {
            $checksum = Media::checksumOf((string) $file->getRealPath());
            $existing = $checksum !== null ? Media::query()->where('checksum', $checksum)->first() : null;

            if ($existing !== null) {
                $duplicates++;

                // Uploaded again into a chosen category: the one entry moves there.
                if ($request->filled('category') && $existing->category !== $category) {
                    $existing->update(['category' => $category]);
                }

                // Uploaded again under a project: the one entry is filed under it.
                if ($request->filled('usage_location') && $existing->usage_location !== $request->input('usage_location')) {
                    $existing->update(['usage_location' => $request->input('usage_location')]);
                }

                return $existing;
            }

            return Media::query()->create([
                ...$catalogue,
                'category' => $category,
                'checksum' => $checksum,
                ...$this->describeStoredFile(
                    $file->store('media', 'public'),
                    $file->getClientOriginalName(),
                    $file->getMimeType(),
                    $file->getSize()
                ),
            ]);
        });

        if ($request->wantsJson() || $request->boolean('json')) {
            return response()->json([
                'success' => true,
                'medium' => $media->first()?->toAdminArray(),
                'media' => $media->map(fn (Media $medium): array => $medium->toAdminArray())->values(),
            ], 201);
        }

        $count = $media->count() - $duplicates;
        $message = $count.' media '.($count === 1 ? 'file' : 'files').' uploaded.';

        if ($duplicates > 0) {
            $message .= ' '.$duplicates.' '.($duplicates === 1 ? 'was' : 'were').' already in the library and kept as one file.';
        }

        // Uploaded from the library page: stay on the same tab and filters.
        if ($request->boolean('from_library')) {
            return back()->with('success', $message);
        }

        return redirect()
            ->route('admin.media.index')
            ->with('success', $message);
    }

    /**
     * Fetch a remote image into the library without leaving the admin panel.
     */
    public function fetch(FetchMediaRequest $request): RedirectResponse
    {
        $response = Http::timeout(60)->get($request->string('url')->toString());

        if (! $response->successful()) {
            return back()->withErrors(['url' => 'The remote file could not be downloaded.']);
        }

        $body = $response->body();
        $checksum = hash('sha256', $body);

        if (Media::query()->where('checksum', $checksum)->exists()) {
            return redirect()
                ->route('admin.media.index')
                ->with('success', 'That file is already in the library, so it was kept as one file.');
        }

        $filename = $this->filenameFromUrl($request->string('url')->toString());
        $path = 'media/'.$filename;

        Storage::disk('public')->put($path, $body);

        Media::query()->create([
            ...$request->safe()->except('url'),
            'checksum' => $checksum,
            ...$this->describeStoredFile($path, $filename, null, strlen($body)),
        ]);

        return redirect()
            ->route('admin.media.index')
            ->with('success', 'Media fetched.');
    }

    public function edit(Media $medium): Response
    {
        return Inertia::render('Admin/Media/Form', [
            'medium' => $medium->toAdminArray(),
        ]);
    }

    public function update(UpdateMediaRequest $request, Media $medium): RedirectResponse
    {
        $data = $request->safe()->except('file');

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $this->deleteFile($medium->path);
            $data = [
                ...$data,
                'checksum' => Media::checksumOf((string) $file->getRealPath()),
                ...$this->describeStoredFile(
                    $file->store('media', 'public'),
                    $file->getClientOriginalName(),
                    $file->getMimeType(),
                    $file->getSize()
                ),
            ];
        }

        $medium->update(collect($data)->except('from_library')->all());

        // Saved from the library's edit popup: stay on the same page and filters.
        if ($request->boolean('from_library')) {
            return back()->with('success', 'Media updated.');
        }

        return redirect()
            ->route('admin.media.index')
            ->with('success', 'Media updated.');
    }

    /**
     * Move a file to the trash. The file itself stays in storage until it is
     * deleted for good, so anything still showing it keeps working.
     */
    public function destroy(Request $request, Media $medium, TrashBin $trash): RedirectResponse|JsonResponse
    {
        $entry = $trash->trash($medium, 'media', $medium->filename, $medium->category);

        if ($request->wantsJson() || $request->boolean('json')) {
            return response()->json(['success' => true, 'undo' => $entry->id]);
        }

        return back()->with('success', 'Media moved to the trash.')->with('undo', $entry->id);
    }

    /**
     * Every project, in portfolio order, with the portfolio it is filed under,
     * so a project added later shows up in the library's lists straight away.
     *
     * @return array<int, array{id: int, title: string, section: string, section_label: string}>
     */
    private function projectOptions(): array
    {
        return Project::query()
            ->with('category.parent')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Project $project): array => [
                'id' => $project->id,
                'title' => $project->title,
                'section' => $project->workGroup(),
                'section_label' => $project->workGroupName(),
            ])
            ->all();
    }

    /**
     * Filename, mime, size and dimensions for a file already on the disk.
     *
     * @return array{filename: string, path: string, mime_type: ?string, size_bytes: ?int, width: ?int, height: ?int}
     */
    private function describeStoredFile(string $path, string $filename, ?string $mime, ?int $size): array
    {
        $absolute = Storage::disk('public')->path($path);
        $dimensions = @getimagesize($absolute) ?: null;

        return [
            'filename' => $filename,
            'path' => $path,
            'mime_type' => $mime,
            'size_bytes' => $size,
            'width' => $dimensions[0] ?? null,
            'height' => $dimensions[1] ?? null,
        ];
    }

    private function filenameFromUrl(string $url): string
    {
        $basename = basename((string) parse_url($url, PHP_URL_PATH));

        return $basename !== '' ? $basename : 'fetched-'.time().'.jpg';
    }

    /**
     * Remove a replaced file, leaving external URLs alone.
     */
    private function deleteFile(?string $path): void
    {
        if (blank($path) || str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    /**
     * Resolve library items against media selected in the CMS editors.
     *
     * @param  Collection<int, Media>  $media
     * @return array<int, array{groups: array<int, string>, actual_groups: array<int, string>, labels: array<int, string>}>
     */
    private function usageMap(Collection $media): array
    {
        $references = [
            'products' => [],
            'categories' => [],
            'banners' => [],
        ];

        Project::query()->get(['title', 'image_path', 'case_study'])->each(function (Project $project) use (&$references): void {
            $paths = collect([$project->image_path]);

            foreach ($project->case_study ?? [] as $section) {
                foreach ($section['images'] ?? [] as $image) {
                    if (filled($image['src'] ?? null)) {
                        $paths->push($image['src']);
                    }
                }
            }

            foreach ($paths->filter() as $path) {
                $references['products'][$this->normaliseReference((string) $path)][] = 'Product: '.$project->title;
            }
        });

        Category::query()->whereNotNull('thumbnail_path')->get(['name', 'thumbnail_path'])
            ->each(function (Category $category) use (&$references): void {
                $references['categories'][$this->normaliseReference((string) $category->thumbnail_path)][] = 'Category: '.$category->name;
            });

        GlobalBlock::query()
            ->where(function ($query): void {
                $query->where('type', 'banner')
                    ->orWhere('key', 'like', '%banner%')
                    ->orWhere('name', 'like', '%banner%');
            })
            ->get(['name', 'content'])
            ->each(function (GlobalBlock $block) use (&$references): void {
                foreach ($this->contentReferences($block->content ?? []) as $path) {
                    $references['banners'][$this->normaliseReference($path)][] = 'Banner: '.$block->name;
                }
            });

        return $media->mapWithKeys(function (Media $medium) use ($references): array {
            $path = $this->normaliseReference($medium->path);
            $groups = [];
            $labels = [];

            foreach ($references as $group => $paths) {
                if (isset($paths[$path])) {
                    $groups[] = $group;
                    $labels = [...$labels, ...$paths[$path]];
                }
            }

            $actualGroups = $groups;

            $catalogueGroup = match (strtolower(trim($medium->category))) {
                'product', 'products', 'project', 'projects' => 'products',
                'category', 'categories' => 'categories',
                'banner', 'banners' => 'banners',
                default => null,
            };

            if ($catalogueGroup !== null && ! in_array($catalogueGroup, $groups, true)) {
                $groups[] = $catalogueGroup;
            }

            return [$medium->id => [
                'groups' => $groups,
                'actual_groups' => $actualGroups,
                'labels' => array_values(array_unique($labels)),
            ]];
        })->all();
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<int, string>
     */
    private function contentReferences(array $content): array
    {
        return collect($content)
            ->flatten()
            ->filter(fn ($value): bool => is_string($value) && (
                str_contains($value, '/storage/')
                || (bool) preg_match('/\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i', $value)
            ))
            ->values()
            ->all();
    }

    private function normaliseReference(string $reference): string
    {
        $path = parse_url($reference, PHP_URL_PATH) ?: $reference;
        $path = ltrim(rawurldecode(str_replace('\\', '/', $path)), '/');

        return str_starts_with($path, 'storage/') ? substr($path, 8) : $path;
    }

    private function readableBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = (float) $bytes;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, $unit === 0 ? 0 : 1).' '.$units[$unit];
    }
}
