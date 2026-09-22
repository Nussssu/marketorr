<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreProjectRequest extends FormRequest
{
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
            'slug' => ['required', 'string', 'max:190', 'alpha_dash', $this->slugRule()],
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
            'accent.regex' => 'The accent must be a 6-digit hex color, for example #891FFB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'featured' => $this->boolean('featured'),
            'tags' => array_values(array_filter(
                (array) $this->input('tags', []),
                static fn ($tag) => filled($tag),
            )),
        ]);
    }
}
