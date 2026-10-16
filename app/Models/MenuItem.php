<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'menu_id', 'parent_id', 'label', 'url', 'description',
    'opens_in_new_tab', 'enabled', 'show_on_desktop', 'show_on_mobile', 'sort_order',
])]
class MenuItem extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'opens_in_new_tab' => 'boolean',
            'enabled' => 'boolean',
            'show_on_desktop' => 'boolean',
            'show_on_mobile' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order')->orderBy('id');
    }

    /**
     * @return array{id: int, label: string, url: string, description: ?string, newTab: bool, showOnDesktop: bool, showOnMobile: bool}
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'url' => $this->url,
            'description' => $this->description,
            'newTab' => $this->opens_in_new_tab,
            'showOnDesktop' => $this->show_on_desktop,
            'showOnMobile' => $this->show_on_mobile,
        ];
    }
}
