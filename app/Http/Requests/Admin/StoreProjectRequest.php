<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Http\Requests\Admin\Concerns\NormalisesSlug;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreProjectRequest extends FormRequest
{
    use NormalisesSlug;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'slug' => ['required', 'string', 'max:190', 'regex:'.self::SLUG_PATTERN, $this->slugRule()],
            'title' => ['required', 'string', 'max:190'],
            'client' => ['required', 'string', 'max:190'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'year' => ['required', 'string', 'max:20'],
            'description' => ['required', 'string', 'max:5000'],
            'metric' => ['nullable', 'string', 'max:60'],
            'metric_label' => ['nullable', 'string', 'max:120'],
            'accent' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'image' => $this->hasFile('image')
                ? [$this->imageRequirement(), 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096']
                : [$this->imageRequirement(), 'string'],
            'image_alt' => ['required', 'string', 'max:190'],
            'external_url' => ['nullable', 'url', 'max:500'],
            'tags' => ['required', 'array', 'min:1'],
            'tags.*' => ['required', 'string', 'max:60'],
            'featured' => ['required', 'boolean'],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'work_group' => ['nullable', Rule::in(['branding', 'uiux'])],
            'brief' => ['nullable', 'array'],
            'brief.overview' => ['nullable', 'string', 'max:5000'],
            'brief.worked_on' => ['nullable', 'array', 'max:40'],
            'brief.worked_on.*' => ['nullable', 'string', 'max:190'],
            'brief.services' => ['nullable', 'array', 'max:40'],
            'brief.services.*' => ['nullable', 'string', 'max:190'],
            'brief.highlights' => ['nullable', 'array', 'max:20'],
            'brief.highlights.*.label' => ['nullable', 'string', 'max:120'],
            'brief.highlights.*.value' => ['nullable', 'string', 'max:190'],
            'brief.client' => ['nullable', 'string', 'max:190'],
            'brief.website' => ['nullable', 'string', 'max:500'],
            'brief.behance_url' => ['nullable', 'string', 'max:500'],
            'brief.source_url' => ['nullable', 'string', 'max:500'],
            'gallery_images' => ['nullable', 'array', 'max:60'],
            'gallery_images.*.src' => ['required_with:gallery_images', 'string', 'max:1000'],
            'gallery_images.*.alt' => ['nullable', 'string', 'max:190'],
            'gallery_images.*.hidden' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:190'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_og_image' => ['nullable', 'string', 'max:1000'],
            'meta_robots' => ['nullable', 'string', Rule::in(['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'])],
            'canonical_url' => ['nullable', 'url', 'max:2048'],
        ];
    }

    /**
     * Slugs are unique across every row, soft-deleted ones included, because
     * the database index does not exempt them either.
     */
    protected function slugRule(): Unique
    {
        return Rule::unique('projects', 'slug');
    }

    /**
     * A cover image is mandatory when creating, optional when replacing.
     */
    protected function imageRequirement(): string
    {
        return 'required';
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...$this->slugMessages(),
            'accent.regex' => 'The accent must be a 6-digit hex color, for example #891FFB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            ...$this->normalisedSlug(),
            // An empty choice means "follow the category", stored as null.
            'work_group' => $this->input('work_group') ?: null,
            'featured' => $this->boolean('featured'),
            'tags' => array_values(array_filter(
                (array) $this->input('tags', []),
                static fn ($tag) => filled($tag),
            )),
        ]);
    }
}
