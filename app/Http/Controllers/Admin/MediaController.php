<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FetchMediaRequest;
use App\Http\Requests\Admin\StoreMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Media/Index', [
            'media' => Media::query()
                ->orderByDesc('id')
                ->get()
                ->map(fn (Media $medium) => $medium->toAdminArray()),
            'categories' => Media::query()
                ->select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Media/Form', ['medium' => null]);
    }

    public function store(StoreMediaRequest $request): RedirectResponse
    {
        $file = $request->file('file');

        Media::query()->create([
            ...$request->safe()->except('file'),
            ...$this->describeStoredFile(
                $file->store('media', 'public'),
                $file->getClientOriginalName(),
                $file->getMimeType(),
                $file->getSize()
            ),
        ]);

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

    public function destroy(Media $medium): RedirectResponse
    {
        $this->deleteFile($medium->path);
        $medium->delete();

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
