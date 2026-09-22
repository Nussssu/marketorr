<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'filename', 'path', 'mime_type', 'size_bytes', 'width', 'height',
    'category', 'usage_location', 'alt_text',
])]
class Media extends Model
{
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
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
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
        ];
    }
}
