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
            'contact_email' => ['required', 'email', 'max:190'],
            'contact_phone' => ['nullable', 'string', 'max:60'],
            'location_text' => ['required', 'string', 'max:190'],
            'social_linkedin' => ['nullable', 'url', 'max:255'],
            'social_behance' => ['nullable', 'url', 'max:255'],
            'social_dribbble' => ['nullable', 'url', 'max:255'],
            'social_instagram' => ['nullable', 'url', 'max:255'],
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
            'meta_default_og_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
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
