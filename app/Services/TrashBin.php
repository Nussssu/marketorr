<?php

namespace App\Services;

use App\Models\Category;
use App\Models\ContactSubmission;
use App\Models\Media;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Project;
use App\Models\Service;
use App\Models\ServiceGroup;
use App\Models\Setting;
use App\Models\SubService;
use App\Models\TrashEntry;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * The admin panel's trash. Deleting content moves it here (soft-deleted, so
 * the public site no longer shows it, with its files kept); from here it is
 * restored, with its links put back, or deleted for good.
 */
class TrashBin
{
    /**
     * Every kind of content that goes to the trash: its model (none for menu
     * items, which are kept as a snapshot), name, and the admin section whose
     * "manage" permission restores or deletes it.
     *
     * @var array<string, array{model: class-string<Model>|null, label: string, section: string}>
     */
    public const TYPES = [
        'page' => ['model' => Page::class, 'label' => 'Page', 'section' => 'pages'],
        'page_section' => ['model' => PageSection::class, 'label' => 'Page section', 'section' => 'pages'],
        'project' => ['model' => Project::class, 'label' => 'Project', 'section' => 'projects'],
        'category' => ['model' => Category::class, 'label' => 'Category', 'section' => 'projects'],
        'service_group' => ['model' => ServiceGroup::class, 'label' => 'Service tab', 'section' => 'services'],
        'sub_service' => ['model' => SubService::class, 'label' => 'Sub-service', 'section' => 'services'],
        'service' => ['model' => Service::class, 'label' => 'Service', 'section' => 'services'],
        'media' => ['model' => Media::class, 'label' => 'Media', 'section' => 'media'],
        'menu_item' => ['model' => null, 'label' => 'Menu item', 'section' => 'menus'],
        'inquiry' => ['model' => ContactSubmission::class, 'label' => 'Inbox message', 'section' => 'inquiries'],
    ];

    /** The fields a menu item snapshot keeps. */
    private const MENU_FIELDS = ['label', 'url', 'description', 'opens_in_new_tab', 'enabled', 'show_on_desktop', 'show_on_mobile', 'sub_service_id', 'project_id'];

    /**
     * Move a record to the trash.
     *
     * @param  array<string, mixed>  $context  what its restore puts back
     */
    public function trash(Model $model, string $type, string $label, ?string $detail = null, array $context = []): TrashEntry
    {
        $entry = DB::transaction(function () use ($model, $type, $label, $detail, $context): TrashEntry {
            $model->delete();

            return TrashEntry::query()->create([
                'type' => $type,
                'trashable_type' => $model->getMorphClass(),
                'trashable_id' => $model->getKey(),
                'label' => mb_substr($label !== '' ? $label : self::TYPES[$type]['label'], 0, 250),
                'detail' => $detail !== null ? mb_substr($detail, 0, 250) : null,
                'context' => $context === [] ? null : $context,
                'deleted_by' => auth()->id(),
            ]);
        });

        $this->changed($type);
        $this->log('trashed', $entry);

        return $entry;
    }

    /**
     * Keep a menu item (and its sub-items) that a menu save removed.
     *
     * @param  array<int, MenuItem>  $children
     */
    public function trashMenuItem(Menu $menu, MenuItem $item, array $children = [], ?string $parentLabel = null): TrashEntry
    {
        $entry = TrashEntry::query()->create([
            'type' => 'menu_item',
            'label' => mb_substr($item->displayLabel() ?: 'Menu item', 0, 250),
            'detail' => mb_substr($menu->location->label().' menu'.($parentLabel ? " · under {$parentLabel}" : ''), 0, 250),
            'context' => [
                'location' => $menu->location->value,
                'parent_label' => $parentLabel,
                'item' => $item->only(self::MENU_FIELDS),
                'children' => array_map(fn (MenuItem $child): array => $child->only(self::MENU_FIELDS), $children),
            ],
            'deleted_by' => auth()->id(),
        ]);

        $this->log('trashed', $entry);

        return $entry;
    }

    /**
     * What stands in the way of restoring an entry. Fixable problems are
     * resolved by restoring with `$fix`; the others block the restore.
     *
     * @return array<int, array{kind: string, message: string, fixable: bool}>
     */
    public function conflicts(TrashEntry $entry): array
    {
        if ($entry->type === 'menu_item') {
            return Menu::query()->where('location', $entry->context['location'] ?? '')->exists()
                ? []
                : [['kind' => 'missing', 'message' => 'Its menu no longer exists.', 'fixable' => false]];
        }

        $model = $entry->trashable;

        if ($model === null) {
            return [['kind' => 'missing', 'message' => 'This item no longer exists, so it cannot be restored.', 'fixable' => false]];
        }

        $conflicts = [];

        if (filled($model->getAttribute('slug'))) {
            $twin = $model::query()->where('slug', $model->getAttribute('slug'))->whereKeyNot($model->getKey())->first();

            if ($twin !== null) {
                $conflicts[] = ['kind' => 'slug', 'message' => "Its address \"{$model->getAttribute('slug')}\" is now used by \"".($twin->getAttribute('title') ?? $twin->getAttribute('name')).'". It will be restored at a new address.', 'fixable' => true];
            }
        }

        if ($model instanceof SubService) {
            $group = ServiceGroup::withTrashed()->find($model->service_group_id);

            if ($group === null) {
                $conflicts[] = ['kind' => 'parent', 'message' => 'Its service tab was deleted for good.', 'fixable' => false];
            } elseif ($group->trashed()) {
                $conflicts[] = ['kind' => 'parent', 'message' => "Its service tab \"{$group->name}\" is in the trash. It will be restored too.", 'fixable' => true];
            }
        }

        if ($model instanceof PageSection) {
            $page = Page::withTrashed()->find($model->page_id);

            if ($page === null) {
                $conflicts[] = ['kind' => 'parent', 'message' => 'Its page was deleted for good.', 'fixable' => false];
            } elseif ($page->trashed()) {
                $conflicts[] = ['kind' => 'parent', 'message' => "Its page \"{$page->title}\" is in the trash. It will be restored too.", 'fixable' => true];
            }
        }

        if ($model instanceof Category && $model->parent_id !== null && ! Category::query()->whereKey($model->parent_id)->exists()) {
            $conflicts[] = ['kind' => 'parent', 'message' => 'Its parent category is gone. It will be restored as a top-level category.', 'fixable' => true];
        }

        if ($model instanceof Media) {
            if (! str_starts_with($model->path, '/') && ! str_starts_with($model->path, 'http') && ! Storage::disk('public')->exists($model->path)) {
                $conflicts[] = ['kind' => 'missing', 'message' => 'Its file is no longer in storage.', 'fixable' => false];
            }

            $copy = filled($model->checksum) ? Media::query()->where('checksum', $model->checksum)->first() : null;

            if ($copy !== null) {
                $conflicts[] = ['kind' => 'duplicate', 'message' => "The same file is already in the library as \"{$copy->filename}\". Restoring keeps both.", 'fixable' => true];
            }
        }

        return $conflicts;
    }

    /**
     * Restore an entry, putting back the links it had. Without `$fix`, an
     * entry with any conflict is left in the trash and its conflicts are
     * returned; with it, fixable conflicts are resolved.
     *
     * @return array{restored: bool, conflicts: array<int, array{kind: string, message: string, fixable: bool}>}
     */
    public function restore(TrashEntry $entry, bool $fix = false): array
    {
        $conflicts = $this->conflicts($entry);
        $blocked = collect($conflicts)->contains('fixable', false);

        if ($blocked || ($conflicts !== [] && ! $fix)) {
            return ['restored' => false, 'conflicts' => $conflicts];
        }

        DB::transaction(function () use ($entry, $conflicts): void {
            $kinds = array_column($conflicts, 'kind');

            if ($entry->type === 'menu_item') {
                $this->restoreMenuItem($entry);
                $entry->delete();

                return;
            }

            $model = $entry->trashable;

            if (in_array('parent', $kinds, true)) {
                $this->restoreParent($model);
            }

            if (in_array('slug', $kinds, true)) {
                $model->setAttribute('slug', $this->freeSlug($model));
            }

            $model->restore();

            $context = $entry->context ?? [];

            if ($model instanceof ServiceGroup) {
                // Only the sub-services that went with the tab; one trashed on its own stays.
                SubService::onlyTrashed()
                    ->whereKey($context['sub_services'] ?? [])
                    ->whereNotIn('id', TrashEntry::query()->where('type', 'sub_service')->pluck('trashable_id'))
                    ->get()
                    ->each->restore();
            }

            if ($model instanceof Category) {
                Project::query()->whereKey($context['projects'] ?? [])->whereNull('category_id')->update(['category_id' => $model->id]);
                Category::query()->whereKey($context['children'] ?? [])->whereNull('parent_id')->update(['parent_id' => $model->id]);
            }

            $entry->delete();
        });

        $this->changed($entry->type);
        $this->log('restored', $entry);

        return ['restored' => true, 'conflicts' => $conflicts];
    }

    /**
     * Delete an entry for good, with its uploaded file for media. Files the
     * website ships with are never deleted.
     */
    public function forceDelete(TrashEntry $entry): void
    {
        DB::transaction(function () use ($entry): void {
            $model = $entry->type === 'menu_item' ? null : $entry->trashable;

            if ($model instanceof Media && ! str_starts_with($model->path, '/') && ! str_starts_with($model->path, 'http')) {
                Storage::disk('public')->delete($model->path);
            }

            if ($model instanceof Page) {
                TrashEntry::query()->where('type', 'page_section')->whereIn('trashable_id', PageSection::withTrashed()->where('page_id', $model->id)->pluck('id'))->delete();
            }

            if ($model instanceof ServiceGroup) {
                TrashEntry::query()->where('type', 'sub_service')->whereIn('trashable_id', SubService::withTrashed()->where('service_group_id', $model->id)->pluck('id'))->delete();
            }

            $model?->forceDelete();
            $entry->delete();
        });

        $this->changed($entry->type);
        $this->log('purged', $entry);
    }

    /**
     * Delete for good everything kept longer than the retention period.
     */
    public function purgeExpired(): int
    {
        $days = $this->retentionDays();

        if ($days === 0) {
            return 0;
        }

        $expired = TrashEntry::query()->where('created_at', '<', now()->subDays($days))->get();
        $expired->each(fn (TrashEntry $entry) => $this->forceDelete($entry));

        return $expired->count();
    }

    public function retentionDays(): int
    {
        return (int) (Setting::current()->trash_retention_days ?? 30);
    }

    public function canManage(?User $user, string $type): bool
    {
        return $user !== null && isset(self::TYPES[$type]) && $user->hasPermission(self::TYPES[$type]['section'].'.manage');
    }

    /**
     * The types a user may see and restore.
     *
     * @return array<int, string>
     */
    public function typesFor(?User $user): array
    {
        return array_values(array_filter(array_keys(self::TYPES), fn (string $type): bool => $this->canManage($user, $type)));
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(TrashEntry $entry): array
    {
        $model = $entry->type === 'menu_item' ? null : $entry->trashable;
        $days = $this->retentionDays();
        $context = $entry->context ?? [];

        return [
            'id' => $entry->id,
            'type' => $entry->type,
            'typeLabel' => self::TYPES[$entry->type]['label'] ?? $entry->type,
            'label' => $entry->label,
            'detail' => $entry->detail,
            'image' => $this->imageOf($model),
            'deletedBy' => $entry->deleter?->name ?? 'System',
            'deletedAt' => $entry->created_at?->format('d M Y, h:i A'),
            'deletedAgo' => $entry->created_at?->diffForHumans(),
            'expiresIn' => $days === 0 ? null : $entry->created_at?->copy()->addDays($days)->diffForHumans(['parts' => 1]),
            'notes' => array_values(array_filter([
                isset($context['sub_services']) && count($context['sub_services']) > 0 ? count($context['sub_services']).' sub-service(s) come back with it' : null,
                isset($context['projects']) && count($context['projects']) > 0 ? count($context['projects']).' project(s) are re-filed under it' : null,
                isset($context['children']) && count($context['children']) > 0 && $entry->type === 'category' ? count($context['children']).' sub-categor'.(count($context['children']) === 1 ? 'y moves' : 'ies move').' back under it' : null,
                $entry->type === 'menu_item' && count($context['children'] ?? []) > 0 ? count($context['children']).' sub-item(s) come back with it' : null,
                $model instanceof Media && ($model->isSiteFile()) ? 'This file ships with the website and is never deleted from it.' : null,
            ])),
            'conflicts' => $this->conflicts($entry),
        ];
    }

    private function imageOf(?Model $model): ?string
    {
        return match (true) {
            $model instanceof Media => str_starts_with((string) $model->mime_type, 'image/') ? $model->previewUrl() : null,
            $model instanceof Project => filled($model->image_path) ? $model->thumbUrl() : null,
            $model instanceof SubService => filled($model->image) ? (string) PublicAsset::url($model->image) : null,
            default => null,
        };
    }

    private function restoreParent(Model $model): void
    {
        $parent = match (true) {
            $model instanceof SubService => ServiceGroup::onlyTrashed()->find($model->service_group_id),
            $model instanceof PageSection => Page::onlyTrashed()->find($model->page_id),
            default => null,
        };

        if ($model instanceof Category) {
            $model->setAttribute('parent_id', null);

            return;
        }

        if ($parent === null) {
            return;
        }

        $parentEntry = TrashEntry::query()->where('trashable_type', $parent->getMorphClass())->where('trashable_id', $parent->getKey())->first();
        $parentEntry !== null ? $this->restore($parentEntry, true) : $parent->restore();
    }

    private function restoreMenuItem(TrashEntry $entry): void
    {
        $context = $entry->context ?? [];
        $menu = Menu::query()->where('location', $context['location'])->firstOrFail();
        $parent = filled($context['parent_label'] ?? null)
            ? $menu->items()->whereNull('parent_id')->whereRaw('LOWER(label) = ?', [mb_strtolower($context['parent_label'])])->first()
            : null;
        $siblings = $menu->items()->where('parent_id', $parent?->id);
        $item = $menu->items()->create([...$this->menuAttributes($context['item'] ?? []), 'parent_id' => $parent?->id, 'sort_order' => (int) $siblings->max('sort_order') + 1]);

        foreach ($context['children'] ?? [] as $order => $child) {
            $menu->items()->create([...$this->menuAttributes($child), 'parent_id' => $item->id, 'sort_order' => $order]);
        }
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function menuAttributes(array $attributes): array
    {
        $attributes = array_intersect_key($attributes, array_flip(self::MENU_FIELDS));

        // A link to something deleted for good becomes a plain link.
        if (filled($attributes['sub_service_id'] ?? null) && ! SubService::withTrashed()->whereKey($attributes['sub_service_id'])->exists()) {
            $attributes['sub_service_id'] = null;
        }

        if (filled($attributes['project_id'] ?? null) && ! Project::withTrashed()->whereKey($attributes['project_id'])->exists()) {
            $attributes['project_id'] = null;
        }

        return $attributes;
    }

    private function freeSlug(Model $model): string
    {
        $base = $model->getAttribute('slug').'-restored';
        $slug = $base;
        $suffix = 2;

        while ($model::withTrashed()->where('slug', $slug)->whereKeyNot($model->getKey())->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    private function changed(string $type): void
    {
        if (in_array($type, ['service_group', 'sub_service', 'service'], true)) {
            ServiceGroup::forgetCatalogue();
        }
    }

    private function log(string $action, TrashEntry $entry): void
    {
        UserActivityLog::record(request(), $action, null, [
            'name' => $entry->label,
            'type' => self::TYPES[$entry->type]['label'] ?? $entry->type,
        ]);
    }
}
