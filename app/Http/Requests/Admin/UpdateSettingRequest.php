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
            'social_linkedin' => ['nullable', 'url', 'max:255'],
            'social_facebook' => ['nullable', 'url', 'max:255'],
            'social_behance' => ['nullable', 'url', 'max:255'],
            'social_dribbble' => ['nullable', 'url', 'max:255'],
            'social_instagram' => ['nullable', 'url', 'max:255'],
            'social_x' => ['nullable', 'url', 'max:255'],
            'social_youtube' => ['nullable', 'url', 'max:255'],
            'hero_eyebrow' => ['required', 'string', 'max:190'],
            'hero_heading_lines' => ['required', 'array', 'min:1', 'max:4'],
            'hero_heading_lines.*' => ['required', 'string', 'max:120'],
            'hero_subtext' => ['required', 'string', 'max:1000'],
            'about_text' => ['required', 'string', 'max:2000'],
            'about_metrics' => ['required', 'array', 'min:1', 'max:8'],
            'about_metrics.*.value' => ['required', 'numeric', 'min:0'],
            'about_metrics.*.suffix' => ['nullable', 'string', 'max:10'],
            'about_metrics.*.label' => ['required', 'string', 'max:120'],
            'meta_default_title' => ['required', 'string', 'max:190'],
            'meta_default_description' => ['required', 'string', 'max:255'],
            'meta_default_og_image' => ['nullable'],
            // Rendered verbatim into the page head and body, so only a super
            // admin can reach this form at all.
            'head_scripts' => ['nullable', 'string', 'max:20000'],
            'body_scripts' => ['nullable', 'string', 'max:20000'],
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
            'logo', 'logo_dark', 'favicon', 'meta_default_og_image', 'schema_markup',
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
            'hero_heading_lines' => array_values(array_filter(
                (array) $this->input('hero_heading_lines', []),
                static fn ($line) => filled($line),
            )),
            'about_metrics' => array_values(array_filter(
                (array) $this->input('about_metrics', []),
                static fn ($metric) => filled($metric['label'] ?? null) || filled($metric['value'] ?? null),
            )),
        ]);
    }
}
