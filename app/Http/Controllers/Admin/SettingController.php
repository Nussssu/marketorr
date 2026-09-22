<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        $settings = Setting::current();

        return Inertia::render('Admin/Settings', [
            'settings' => [
                'site_name' => $settings->site_name,
                'logo_url' => $settings->assetUrl($settings->logo_path),
                'logo_dark_url' => $settings->assetUrl($settings->logo_dark_path),
                'favicon_url' => $settings->assetUrl($settings->favicon_path),
                'header_sticky' => (bool) ($settings->header_sticky ?? true),
                'header_cta_text' => $settings->header_cta_text ?? 'Start a Project',
                'header_cta_link' => $settings->header_cta_link ?? '/contact',
                'contact_email' => $settings->contact_email,
                'contact_phone' => $settings->contact_phone,
                'location_text' => $settings->location_text,
                'address' => $settings->address,
                'directions_url' => $settings->directions_url,
                'copyright_text' => $settings->copyright_text,
                'footer_intro' => $settings->footer_intro,
                'social_linkedin' => $settings->social_linkedin,
                'social_facebook' => $settings->social_facebook,
                'social_behance' => $settings->social_behance,
                'social_dribbble' => $settings->social_dribbble,
                'social_instagram' => $settings->social_instagram,
                'social_x' => $settings->social_x,
                'social_youtube' => $settings->social_youtube,
                'hero_eyebrow' => $settings->hero_eyebrow,
                'hero_heading_lines' => $settings->hero_heading_lines ?? [],
                'hero_subtext' => $settings->hero_subtext,
                'about_text' => $settings->about_text,
                'about_metrics' => $settings->about_metrics ?? [],
                'meta_default_title' => $settings->meta_default_title,
                'meta_default_description' => $settings->meta_default_description,
                'og_image_url' => $settings->ogImageUrl(),
                'head_scripts' => $settings->head_scripts,
                'body_scripts' => $settings->body_scripts,
                'robots_txt' => $settings->robots_txt,
                'schema_markup' => filled($settings->schema_markup)
                    ? json_encode($settings->schema_markup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
                    : '',
                'sitemap_enabled' => $settings->sitemap_enabled,
            ],
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        $settings = Setting::current();
        $data = $request->settingAttributes();

        foreach ($this->uploadColumns() as $field => $column) {
            if ($request->hasFile($field)) {
                $this->deleteUpload($settings->{$column});
                $data[$column] = $request->file($field)->store('settings', 'public');
            } elseif ($request->has($field)) {
                $val = $request->input($field);
                if (is_string($val)) {
                    $cleaned = preg_replace('#^https?://[^/]+/storage/#', '', $val);
                    $cleaned = preg_replace('#^/storage/#', '', $cleaned);
                    $data[$column] = $cleaned !== '' ? $cleaned : null;
                } elseif ($val === null) {
                    $data[$column] = null;
                }
            }
        }

        $settings->update($data);
        Setting::forgetCurrent();

        return back()->with('success', 'Settings saved.');
    }

    /**
     * Upload field name to the column that stores its path.
     *
     * @return array<string, string>
     */
    private function uploadColumns(): array
    {
        return [
            'logo' => 'logo_path',
            'logo_dark' => 'logo_dark_path',
            'favicon' => 'favicon_path',
            'meta_default_og_image' => 'meta_default_og_image',
        ];
    }

    /**
     * Remove a replaced upload, leaving legacy `public/` paths alone.
     */
    private function deleteUpload(?string $path): void
    {
        if (blank($path) || str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}
