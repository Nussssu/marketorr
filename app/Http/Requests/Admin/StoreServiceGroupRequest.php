<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Http\Requests\Admin\Concerns\NormalisesSlug;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreServiceGroupRequest extends FormRequest
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
            'slug' => ['required', 'string', 'max:190', 'regex:'.self::SLUG_PATTERN, $this->slugRule(), $this->serviceSlugRule()],
            'name' => ['required', 'string', 'max:190'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'accent' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function slugRule(): Unique
    {
        return Rule::unique('service_groups', 'slug');
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

    /**
     * A tab is opened from /services/{slug}, the address a service of the
     * same slug would live at, so the two may not share one.
     */
    protected function serviceSlugRule(): Unique
    {
        return Rule::unique('services', 'slug');
    }
}
