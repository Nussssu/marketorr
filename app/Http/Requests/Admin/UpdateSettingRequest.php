<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:120'],
            'logo' => ['nullable'],
            'logo_dark' => ['nullable'],
            'favicon' => ['nullable'],
            'header_sticky' => ['required', 'boolean'],
            'header_cta_text' => ['nullable', 'string', 'max:60'],
            'header_cta_link' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:190'],
            'contact_phone' => ['nullable', 'string', 'max:60'],
            'location_text' => ['required', 'string', 'max:190'],
            'address' => ['nullable', 'string', 'max:255'],
            'directions_url' => ['nullable', 'url', 'max:2048'],
            'copyright_text' => ['nullable', 'string', 'max:255'],
            'footer_intro' => ['nullable', 'string', 'max:1000'],
            'footer_logo' => ['nullable'],
            'footer_logo_visible' => ['required', 'boolean'],
            'footer_motto_items' => ['present', 'array', 'max:8'],
            'footer_motto_items.*' => ['required', 'string', 'max:60'],
            'meta_default_title' => ['required', 'string', 'max:190'],
            'meta_default_description' => ['required', 'string', 'max:255'],
            'meta_default_og_image' => ['nullable'],
            'robots_txt' => ['nullable', 'string', 'max:10000'],
            'schema_markup' => ['nullable', 'string', 'max:20000', 'json'],
            'sitemap_enabled' => ['required', 'boolean'],
        ];
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
     * The validated attributes as columns: uploads are handled separately and
     * the JSON-LD string is decoded for its `array` cast.
     *
     * @return array<string, mixed>
     */
    public function settingAttributes(): array
    {
        $data = $this->safe()->except([
            'logo', 'logo_dark', 'favicon', 'footer_logo', 'meta_default_og_image', 'schema_markup',
        ]);

        $data['schema_markup'] = filled($this->input('schema_markup'))
            ? json_decode($this->input('schema_markup'), true)
            : null;

        return $data;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sitemap_enabled' => $this->boolean('sitemap_enabled'),
            'header_sticky' => $this->boolean('header_sticky'),
            'footer_logo_visible' => $this->boolean('footer_logo_visible'),
            'footer_motto_items' => array_values(array_filter(
                (array) $this->input('footer_motto_items', []),
                static fn ($item) => filled($item),
            )),
        ]);
    }
}
