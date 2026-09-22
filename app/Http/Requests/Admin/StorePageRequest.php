<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StorePageRequest extends FormRequest
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
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:190'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable'],
            'meta_robots' => ['required', 'string', Rule::in([
                'index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow',
            ])],
            'canonical_url' => ['nullable', 'url', 'max:2048'],
            'schema_markup' => ['nullable', 'string', 'max:20000', 'json'],
        ];
    }

    protected function slugRule(): Unique
    {
        return Rule::unique('pages', 'slug');
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'schema_markup.json' => 'Schema markup must be valid JSON.',
        ];
    }

    /**
     * The validated attributes as columns, with the JSON-LD string decoded.
     *
     * @return array<string, mixed>
     */
    public function pageAttributes(): array
    {
        $data = $this->safe()->except(['og_image', 'schema_markup']);
        $data['schema_markup'] = filled($this->input('schema_markup'))
            ? json_decode($this->input('schema_markup'), true)
            : null;

        return $data;
    }
}
