<?php

namespace App\Models;

use App\Services\PublicAsset;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'filename', 'path', 'checksum', 'mime_type', 'size_bytes', 'width', 'height',
    'category', 'usage_location', 'alt_text',
])]
class Media extends Model
{
    use SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    /**
     * Public URL for the stored file, mirroring Project::imageUrl().
     */
    public function fileUrl(): string
    {
        if (str_starts_with($this->path, '/') || str_starts_with($this->path, 'http')) {
            return $this->path;
        }

        return Project::publicDiskUrl($this->path);
    }

    /**
     * Whether the file ships with the website under `public/` (or lives at an
     * external URL) rather than on the upload disk. Removing such an entry
     * never deletes the file itself.
     */
    public function isSiteFile(): bool
    {
        return str_starts_with($this->path, '/') || str_starts_with($this->path, 'http');
    }

    /**
     * The file's content fingerprint, used to keep one library entry (one
     * link) per file however many times it is uploaded or used.
     */
    public static function checksumOf(string $absolutePath): ?string
    {
        return is_file($absolutePath) ? hash_file('sha256', $absolutePath) : null;
    }

    /**
     * Human-readable file size, e.g. `1.4 MB`.
     */
    public function readableSize(): ?string
    {
        if ($this->size_bytes === null) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = (float) $this->size_bytes;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, $unit === 0 ? 0 : 1).' '.$units[$unit];
    }

    /**
     * A lighter copy for library grids: a UI/UX screen's top crop from its
     * folder's `thumbs/`, a site file's grid-sized or optimized copy, or the
     * file itself.
     */
    public function previewUrl(): string
    {
        if (! str_starts_with($this->path, '/images/')) {
            return $this->fileUrl();
        }

        $thumb = dirname($this->path).'/thumbs/'.basename($this->path);

        if (str_starts_with($this->path, '/images/work/uiux/') && is_file(public_path(ltrim($thumb, '/')))) {
            return (string) PublicAsset::url($thumb);
        }

        return (string) PublicAsset::thumb($this->path);
    }

    /**
     * @param  array{groups?: array<int, string>, labels?: array<int, string>}  $usage
     * @param  array<int, array<string, string|null>>  $uses  where the Branding / UI/UX work uses the file (MediaCatalogue)
     * @return array<string, mixed>
     */
    public function toAdminArray(array $usage = [], array $uses = []): array
    {
        // One line per place the file is used: the portfolio and service uses
        // in full, plus category thumbnails and banners.
        $labels = collect($uses)
            ->map(fn (array $use): string => "{$use['owner']} · {$use['role']}")
            ->merge(collect($usage['labels'] ?? [])->reject(fn (string $label): bool => $uses !== [] && str_starts_with($label, 'Product: ')))
            ->unique()
            ->values()
            ->all();

        return [
            'id' => $this->id,
            'filename' => $this->filename,
            'file_url' => $this->fileUrl(),
            'mime_type' => $this->mime_type,
            'size' => $this->readableSize(),
            'dimensions' => $this->width && $this->height ? "{$this->width}×{$this->height}" : null,
            'category' => $this->category,
            'usage_location' => $this->usage_location,
            'alt_text' => $this->alt_text,
            'created_at' => $this->created_at?->toDateTimeString(),
            'is_image' => str_starts_with((string) $this->mime_type, 'image/')
                || (bool) preg_match('/\.(jpe?g|png|webp|gif|svg|avif)$/i', $this->filename),
            'is_site_file' => $this->isSiteFile(),
            'preview_url' => $this->previewUrl(),
            'usage_groups' => $usage['groups'] ?? [],
            'usage_labels' => $labels,
            'usage_count' => count($labels),
            'uses' => array_values($uses),
            'sections' => collect($uses)->pluck('section')->unique()->values()->all(),
        ];
    }
}
