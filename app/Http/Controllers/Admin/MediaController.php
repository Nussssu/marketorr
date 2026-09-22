<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FetchMediaRequest;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $query = Media::query()->orderByDesc('id');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category = $request->string('category')->trim()->toString()) {
            $query->where('category', $category);
        }

        $items = $query->get()->map(fn (Media $medium) => $medium->toAdminArray());
        $categories = Media::query()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        if ($request->wantsJson() || $request->boolean('json')) {
            return response()->json([
                'media' => $items,
                'categories' => $categories,
            ]);
        }

        return Inertia::render('Admin/Media/Index', [
            'media' => $items,
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Media/Form', ['medium' => null]);
    }

    public function store(StoreMediaRequest $request): RedirectResponse|JsonResponse
    {
        $file = $request->file('file');
        $category = $request->input('category') ?: 'General';

        $medium = Media::query()->create([
            ...$request->safe()->except(['file', 'category']),
            'category' => $category,
            ...$this->describeStoredFile(
                $file->store('media', 'public'),
                $file->getClientOriginalName(),
                $file->getMimeType(),
                $file->getSize()
            ),
        ]);

        if ($request->wantsJson() || $request->boolean('json')) {
            return response()->json([
                'success' => true,
                'medium' => $medium->toAdminArray(),
            ], 201);
        }

        return redirect()
            ->route('admin.media.index')
            ->with('success', 'Media uploaded.');
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
}
