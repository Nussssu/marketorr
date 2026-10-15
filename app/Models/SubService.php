<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'service_group_id', 'slug', 'name', 'short', 'description',
    'deliverables', 'image', 'image_alt', 'accent',
    'related_match', 'related_pin', 'case_study',
    'status', 'sort_order',
])]
class SubService extends Model
{
    protected $table = 'sub_services';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deliverables' => 'array',
            'related_match' => 'array',
            'related_pin' => 'array',
            'case_study' => 'array',
            'status' => ContentStatus::class,
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ServiceGroup, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(ServiceGroup::class, 'service_group_id');
    }

    /**
     * Only sub-services visible on the public site, in admin-defined order.
     *
     * @param  Builder<SubService>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', ContentStatus::Published)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * @param  Builder<SubService>  $query
     */
    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }
}
