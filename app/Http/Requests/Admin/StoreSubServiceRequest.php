<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreSubServiceRequest extends FormRequest
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
            'service_group_id' => ['required', 'integer', 'exists:service_groups,id'],
            'slug' => ['required', 'string', 'max:190', 'alpha_dash', $this->slugRule()],
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
            'accent.regex' => 'The accent must be a 6-digit hex color, for example #891FFB.',
            'case_study.json' => 'The case study must be valid JSON.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
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
