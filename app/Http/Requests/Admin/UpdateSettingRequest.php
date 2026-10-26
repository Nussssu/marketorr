<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('settings.manage') ?? false;
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
            'email_logo' => ['nullable', 'string', 'max:2000'],
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
            'seo_sections' => ['present', 'array', 'max:20'],
            'seo_sections.*.title' => ['required', 'string', 'max:120'],
            'seo_sections.*.tags' => ['present', 'array', 'max:50'],
            'seo_sections.*.tags.*.attribute' => ['required', Rule::in(['name', 'property'])],
            'seo_sections.*.tags.*.key' => ['required', 'string', 'max:190'],
            'seo_sections.*.tags.*.content' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'schema_markup.json' => 'Schema markup must be valid JSON.',
            'seo_sections.*.title.required' => 'Give the section a title.',
            'seo_sections.*.tags.*.key.required' => 'Enter the meta tag name, e.g. google-site-verification.',
            'seo_sections.*.tags.*.content.required' => 'Enter the meta tag content.',
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
            'logo', 'logo_dark', 'favicon', 'footer_logo', 'meta_default_og_image', 'schema_markup', 'email_logo',
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
            // Sent as form data, so an empty list arrives missing; fully blank
            // tag rows are dropped rather than refused.
            'seo_sections' => array_values(array_map(
                static fn ($section): array => [
                    'title' => trim((string) ($section['title'] ?? '')),
                    'tags' => array_values(array_filter(
                        array_map(static fn ($tag): array => [
                            'attribute' => (string) ($tag['attribute'] ?? 'name'),
                            'key' => trim((string) ($tag['key'] ?? '')),
                            'content' => trim((string) ($tag['content'] ?? '')),
                        ], (array) ($section['tags'] ?? [])),
                        static fn (array $tag): bool => $tag['key'] !== '' || $tag['content'] !== '',
                    )),
                ],
                (array) $this->input('seo_sections', []),
            )),
        ]);
    }
}
