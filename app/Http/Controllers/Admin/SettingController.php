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
                'contact_email' => $settings->contact_email,
                'contact_phone' => $settings->contact_phone,
                'location_text' => $settings->location_text,
                'social_linkedin' => $settings->social_linkedin,
                'social_behance' => $settings->social_behance,
                'social_dribbble' => $settings->social_dribbble,
                'social_instagram' => $settings->social_instagram,
                'hero_eyebrow' => $settings->hero_eyebrow,
                'hero_heading_lines' => $settings->hero_heading_lines ?? [],
                'hero_subtext' => $settings->hero_subtext,
                'about_text' => $settings->about_text,
                'about_metrics' => $settings->about_metrics ?? [],
                'meta_default_title' => $settings->meta_default_title,
                'meta_default_description' => $settings->meta_default_description,
                'og_image_url' => $settings->ogImageUrl(),
            ],
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        $settings = Setting::current();
        $data = $request->safe()->except('meta_default_og_image');

        if ($request->hasFile('meta_default_og_image')) {
            if (filled($settings->meta_default_og_image)) {
                Storage::disk('public')->delete($settings->meta_default_og_image);
            }

            $data['meta_default_og_image'] = $request->file('meta_default_og_image')->store('settings', 'public');
        }

        $settings->update($data);
        Setting::forgetCurrent();

        return back()->with('success', 'Settings saved.');
    }
}
