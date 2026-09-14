<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'slug', 'index_label', 'name', 'short', 'description',
    'accent', 'accent_to', 'capabilities', 'deliverables', 'outcomes',
    'status', 'sort_order',
])]
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'capabilities' => 'array',
            'deliverables' => 'array',
            'outcomes' => 'array',
            'status' => ContentStatus::class,
            'sort_order' => 'integer',
        ];
    }

    /**
     * Only services visible on the public site, in admin-defined order.
     *
     * @param  Builder<Service>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ContentStatus::Published)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * The exact shape the React components consume (see `lib/services.js`).
     *
     * @return array{
     *     slug: string, index: string, name: string, short: string,
     *     description: string, accent: string, accentTo: string|null,
     *     capabilities: array<int, string>, deliverables: array<int, string>,
     *     outcomes: array<int, array{value: string, label: string}>
     * }
     */
    public function toPublicArray(): array
    {
        return [
            'slug' => $this->slug,
            'index' => $this->index_label,
            'name' => $this->name,
            'short' => $this->short,
            'description' => $this->description,
            'accent' => $this->accent,
            'accentTo' => $this->accent_to,
            'capabilities' => $this->capabilities ?? [],
            'deliverables' => $this->deliverables ?? [],
            'outcomes' => $this->outcomes ?? [],
        ];
    }
}
