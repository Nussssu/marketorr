<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'menu_id', 'parent_id', 'sub_service_id', 'project_id', 'label', 'url', 'description',
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

    /**
     * The sub-service a Services mega menu sub-item links to, if any.
     *
     * @return BelongsTo<SubService, $this>
     */
    public function subService(): BelongsTo
    {
        return $this->belongsTo(SubService::class);
    }

    /**
     * The project an Our Work mega menu sub-item links to, if any. A deleted
     * (trashed) project resolves to null.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Whether what a linked item points at is live: its sub-service (and that
     * sub-service's group) or its project. An unlinked item always is.
     */
    public function linksToLiveTarget(): bool
    {
        if ($this->sub_service_id !== null) {
            return $this->subService?->status === ContentStatus::Published
                && $this->subService->group?->status === ContentStatus::Published;
        }

        if ($this->project_id !== null) {
            return $this->project?->status === ContentStatus::Published;
        }

        return true;
    }

    /**
     * The label shown: a linked item always carries its sub-service's name or
     * its project's title.
     */
    public function displayLabel(): string
    {
        return $this->subService?->name ?? $this->project?->title ?? $this->label;
    }

    /**
     * The URL followed: a linked item always points at its sub-service's or
     * its project's page.
     */
    public function displayUrl(): string
    {
        $subService = $this->subService;

        if ($subService !== null && $subService->group !== null) {
            return '/services/'.$subService->group->slug.'/'.$subService->slug;
        }

        return $this->project?->menuUrl() ?? $this->url;
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
            'label' => $this->displayLabel(),
            'url' => $this->displayUrl(),
            'description' => $this->description,
            'newTab' => $this->opens_in_new_tab,
            'showOnDesktop' => $this->show_on_desktop,
            'showOnMobile' => $this->show_on_mobile,
        ];
    }
}
