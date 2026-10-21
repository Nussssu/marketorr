<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Http\Requests\Admin\Concerns\NormalisesSlug;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreSubServiceRequest extends FormRequest
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
            'service_group_id' => ['required', 'integer', 'exists:service_groups,id'],
            'slug' => ['required', 'string', 'max:190', 'regex:'.self::SLUG_PATTERN, $this->slugRule()],
            'name' => ['required', 'string', 'max:190'],
            'short' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'deliverables' => ['required', 'array', 'min:1'],
            'deliverables.*' => ['required', 'string', 'max:120'],
            'image' => ['nullable', 'string', 'max:500'],
            'image_alt' => ['nullable', 'string', 'max:255'],
            'accent' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'related_match' => ['nullable', 'array'],
            'related_match.*' => ['required', 'string', 'max:120'],
            'related_pin' => ['nullable', 'array'],
            'related_pin.*' => ['required', 'string', 'max:190'],
            'case_study' => ['nullable', 'string', 'json'],
            'page_content' => ['nullable', 'array'],
            'page_content.*' => ['nullable', 'string', 'max:500'],
            'meta_title' => ['nullable', 'string', 'max:190'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_og_image' => ['nullable', 'string', 'max:1000'],
            'meta_robots' => ['nullable', 'string', Rule::in(['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'])],
            'canonical_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function slugRule(): Unique
    {
        return Rule::unique('sub_services', 'slug');
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...$this->slugMessages(),
            'accent.regex' => 'The accent must be a 6-digit hex color, for example #891FFB.',
            'case_study.json' => 'The case study must be valid JSON.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            ...$this->normalisedSlug(),
            'deliverables' => $this->filledStrings('deliverables'),
            'related_match' => $this->filledStrings('related_match'),
            'related_pin' => $this->filledStrings('related_pin'),
        ]);
    }

    /**
     * Drop the blank rows a repeatable input leaves behind.
     *
     * @return array<int, string>
     */
    private function filledStrings(string $key): array
    {
        return array_values(array_filter(
            (array) $this->input($key, []),
            static fn ($value) => filled($value),
        ));
    }
}
