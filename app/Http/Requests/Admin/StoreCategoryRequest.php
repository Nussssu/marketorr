<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Http\Requests\Admin\Concerns\NormalisesSlug;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreCategoryRequest extends FormRequest
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
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'slug' => ['required', 'string', 'max:190', 'regex:'.self::SLUG_PATTERN, $this->slugRule()],
            'name' => ['required', 'string', 'max:190'],
            'description' => ['nullable', 'string', 'max:2000'],
            'thumbnail' => ['nullable'],
            'accent' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
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
        return Rule::unique('categories', 'slug');
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
        $this->merge($this->normalisedSlug());
    }
}
