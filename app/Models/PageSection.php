<?php

namespace App\Models;

use App\Enums\SectionType;
use Database\Factories\PageSectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'page_id', 'type', 'name', 'content', 'settings', 'enabled', 'sort_order',
])]
class PageSection extends Model
{
    /** @use HasFactory<PageSectionFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => SectionType::class,
            'content' => 'array',
            'settings' => 'array',
            'enabled' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * The shape the React widget renderer switches on.
     *
     * @return array{id: int, type: string, name: string, content: array<string, mixed>, settings: array<string, mixed>}
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'name' => $this->name,
            'content' => $this->content ?? [],
            'settings' => $this->settings ?? [],
        ];
    }
}
