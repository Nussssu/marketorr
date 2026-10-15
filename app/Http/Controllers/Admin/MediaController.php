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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $allMedia = Media::query()->get();
        $usageMap = $this->usageMap($allMedia);
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
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
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
                    fn (Media $medium): array => $medium->toAdminArray($usageMap[$medium->id] ?? [])
                ),
                'categories' => $categories,
            ]);
        }

        $media = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Media $medium): array => $medium->toAdminArray($usageMap[$medium->id] ?? []));

        $imageCount = $allMedia->filter(fn (Media $medium): bool => str_starts_with((string) $medium->mime_type, 'image/')
            || (bool) preg_match('/\.(jpe?g|png|webp|gif|svg|avif)$/i', $medium->filename))->count();

        return Inertia::render('Admin/Media/Index', [
            'media' => $media,
            'categories' => $categories,
            'filters' => [
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

        $media = $files->map(fn ($file): Media => Media::query()->create([
            ...$catalogue,
            'category' => $category,
            ...$this->describeStoredFile(
                $file->store('media', 'public'),
                $file->getClientOriginalName(),
                $file->getMimeType(),
                $file->getSize()
            ),
        ]));

        if ($request->wantsJson() || $request->boolean('json')) {
            return response()->json([
                'success' => true,
                'medium' => $media->first()?->toAdminArray(),
                'media' => $media->map(fn (Media $medium): array => $medium->toAdminArray())->values(),
            ], 201);
        }

        $count = $media->count();

        return redirect()
            ->route('admin.media.index')
            ->with('success', $count.' media '.($count === 1 ? 'file' : 'files').' uploaded.');
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
        $filename = $this->filenameFromUrl($request->string('url')->toString());
        $path = 'media/'.$filename;

        Storage::disk('public')->put($path, $body);

        Media::query()->create([
            ...$request->safe()->except('url'),
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
                ...$this->describeStoredFile(
                    $file->store('media', 'public'),
                    $file->getClientOriginalName(),
                    $file->getMimeType(),
                    $file->getSize()
                ),
            ];
        }

        $medium->update($data);

        return redirect()
            ->route('admin.media.index')
            ->with('success', 'Media updated.');
    }

    public function destroy(Request $request, Media $medium): RedirectResponse|JsonResponse
    {
        $this->deleteFile($medium->path);
        $medium->delete();

        if ($request->wantsJson() || $request->boolean('json')) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Media deleted.');
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
