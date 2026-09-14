<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreServiceRequest extends FormRequest
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
            'index_label' => ['required', 'string', 'max:10'],
            'name' => ['required', 'string', 'max:190'],
            'short' => ['required', 'string', 'max:190'],
            'description' => ['required', 'string', 'max:5000'],
            'accent' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'accent_to' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'capabilities' => ['required', 'array', 'min:1'],
            'capabilities.*' => ['required', 'string', 'max:120'],
            'deliverables' => ['required', 'array', 'min:1'],
            'deliverables.*' => ['required', 'string', 'max:120'],
            'outcomes' => ['required', 'array', 'min:1'],
            'outcomes.*.value' => ['required', 'string', 'max:60'],
            'outcomes.*.label' => ['required', 'string', 'max:120'],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function slugRule(): Unique
    {
        return Rule::unique('services', 'slug');
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'accent.regex' => 'The accent must be a 6-digit hex color, for example #891FFB.',
            'accent_to.regex' => 'The gradient end must be a 6-digit hex color, for example #507AF4.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'capabilities' => $this->filledStrings('capabilities'),
            'deliverables' => $this->filledStrings('deliverables'),
            'outcomes' => array_values(array_filter(
                (array) $this->input('outcomes', []),
                static fn ($outcome) => filled($outcome['value'] ?? null) || filled($outcome['label'] ?? null),
            )),
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
