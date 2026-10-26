<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Services\PublicAsset;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'service_group_id', 'slug', 'name', 'short', 'description',
    'deliverables', 'image', 'image_alt', 'accent',
    'related_match', 'related_pin', 'case_study', 'page_content',
    'meta_title', 'meta_description', 'meta_og_image', 'meta_robots', 'canonical_url',
    'status', 'sort_order',
])]
class SubService extends Model
{
    use SoftDeletes;

    protected $table = 'sub_services';

    /**
     * The dedicated page's own copy, as the page has always read. `{name}`
     * and `{category}` are filled with the live sub-service and tab names.
     *
     * @var array<string, string>
     */
    public const DEFAULT_PAGE_CONTENT = [
        'work_label' => 'Related work',
        'work_heading' => '{name} in practice',
        'portfolio_label' => 'Full {category} portfolio',
        'deliverables_heading' => 'What you get',
        'practice_heading' => 'Part of {category}',
        'practice_body' => 'Combined with the rest of the {category} practice, it ships as one coherent system, not a pile of deliverables.',
        'discuss_label' => 'Discuss this service',
        'discuss_url' => '/contact',
        'start_label' => 'Start a project',
        'start_url' => '/#contact',
    ];

    /**
     * The dedicated page's head tags. An empty SEO field falls back to what
     * the page has always used: its name, its description and its image.
     *
     * @return array{title: string, description: string, ogImage: string|null, robots: string, canonical: string|null}
     */
    public function publicMeta(): array
    {
        return [
            'title' => filled($this->meta_title) ? $this->meta_title : $this->name.' | Marketorr',
            'description' => filled($this->meta_description)
                ? $this->meta_description
                : str($this->description ?: $this->short)->squish()->limit(160)->toString(),
            'ogImage' => PublicAsset::url(filled($this->meta_og_image) ? $this->meta_og_image : $this->image),
            'robots' => $this->meta_robots ?: 'index,follow',
            'canonical' => $this->canonical_url ?: null,
        ];
    }

    /**
     * The page copy with any field left blank falling back to the default.
     *
     * @return array<string, string>
     */
    public function pageContent(): array
    {
        $stored = array_filter((array) ($this->page_content ?? []), fn ($value): bool => filled($value));

        return [...self::DEFAULT_PAGE_CONTENT, ...array_intersect_key($stored, self::DEFAULT_PAGE_CONTENT)];
    }

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
            'page_content' => 'array',
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
