<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * Single-row, strongly-typed site configuration (always id 1).
 */
#[Table('site_settings')]
#[Guarded([])]
class Setting extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hero_heading_lines' => 'array',
            'about_metrics' => 'array',
            'schema_markup' => 'array',
            'sitemap_enabled' => 'boolean',
        ];
    }

    /**
     * The one settings row, created from defaults if it does not exist yet.
     *
     * Resolved from the container as a request-scoped instance rather than a
     * static, so a long-lived worker never serves another request's copy.
     */
    public static function current(): self
    {
        return app(self::class);
    }

    /**
     * Drop the request-scoped instance — used after an admin saves the form.
     */
    public static function forgetCurrent(): void
    {
        app()->forgetInstance(self::class);
    }

    /**
     * Read the settings row straight from the database, bypassing the cache.
     */
    public static function loadFromDatabase(): self
    {
        return self::query()->firstOrCreate(['id' => 1], self::defaults());
    }

    /**
     * Seed values, matching the copy the site shipped with.
     *
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'site_name' => 'Marketorr',
            'logo_path' => null,
            'logo_dark_path' => null,
            'favicon_path' => null,
            'contact_email' => 'hello@marketorr.com',
            'contact_phone' => null,
            'location_text' => 'Remote-first · Worldwide',
            'address' => 'Natore Tower, Plot 32D & E, Road 2, Sector 3, Uttara, Dhaka 1230',
            'directions_url' => 'https://www.google.com/maps/search/?api=1&query=Natore+Tower+Uttara+Dhaka+1230+Bangladesh',
            'copyright_text' => '© {year} {site}. All rights reserved.',
            'footer_intro' => 'Independent creative & digital agency. We turn ideas into experiences, and experiences into measurable results.',
            'social_linkedin' => 'https://www.linkedin.com/company/marketorr',
            'social_facebook' => null,
            'social_behance' => 'https://www.behance.net/marketorr',
            'social_dribbble' => 'https://dribbble.com/marketorr',
            'social_instagram' => 'https://www.instagram.com/marketorr',
            'social_x' => null,
            'social_youtube' => null,
            'hero_eyebrow' => 'Independent creative & digital agency',
            'hero_heading_lines' => ['We turn', 'attention', 'into results.'],
            'hero_subtext' => 'Marketorr builds brands, digital products, and experiences designed to create measurable growth.',
            'about_text' => 'Marketorr is a creative and digital agency focused on helping ambitious brands build stronger identities, better digital experiences, and measurable business growth. We combine strategy, branding, UI/UX, technology, content, and performance thinking to create work that looks exceptional and performs even better.',
            'about_metrics' => [
                ['value' => 120, 'suffix' => '+', 'label' => 'Projects delivered'],
                ['value' => 48, 'suffix' => '', 'label' => 'Brands transformed'],
                ['value' => 12, 'suffix' => '', 'label' => 'Industries served'],
                ['value' => 6, 'suffix' => 'yrs', 'label' => 'Avg. team experience'],
            ],
            'meta_default_title' => 'Marketorr — We Turn Attention Into Results',
            'meta_default_description' => 'Marketorr is an independent creative & digital agency building brands, digital products and experiences designed for measurable growth.',
            'meta_default_og_image' => null,
            'head_scripts' => null,
            'body_scripts' => null,
            'robots_txt' => null,
            'schema_markup' => null,
            'sitemap_enabled' => true,
        ];
    }

    /**
     * Public URL for an uploaded asset path, or null when it is unset. Paths
     * that are already absolute or root-relative are passed through as-is.
     */
    public function assetUrl(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return $path;
        }

        return Project::publicDiskUrl($path);
    }

    /**
     * The footer copyright line, with `{year}` and `{site}` filled in.
     */
    public function copyrightLine(): string
    {
        return str_replace(
            ['{year}', '{site}'],
            [(string) now()->year, $this->site_name],
            $this->copyright_text ?: '© {year} {site}. All rights reserved.',
        );
    }

    /**
     * Public URL for the default OG image, or null when none is uploaded.
     */
    public function ogImageUrl(): ?string
    {
        if (blank($this->meta_default_og_image)) {
            return null;
        }

        return Project::publicDiskUrl($this->meta_default_og_image);
    }

    /**
     * The shape shared with every Inertia page as the `settings` prop.
     *
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'siteName' => $this->site_name,
            'contactEmail' => $this->contact_email,
            'contactPhone' => $this->contact_phone,
            'locationText' => $this->location_text,
            'address' => $this->address,
            'directionsUrl' => $this->directions_url,
            'logo' => $this->assetUrl($this->logo_path),
            'logoDark' => $this->assetUrl($this->logo_dark_path),
            'favicon' => $this->assetUrl($this->favicon_path),
            'copyright' => $this->copyrightLine(),
            'footerIntro' => $this->footer_intro,
            'socials' => [
                'linkedin' => $this->social_linkedin,
                'facebook' => $this->social_facebook,
                'behance' => $this->social_behance,
                'dribbble' => $this->social_dribbble,
                'instagram' => $this->social_instagram,
                'x' => $this->social_x,
                'youtube' => $this->social_youtube,
            ],
            'hero' => [
                'eyebrow' => $this->hero_eyebrow,
                'headingLines' => $this->hero_heading_lines ?? [],
                'subtext' => $this->hero_subtext,
            ],
            'about' => [
                'text' => $this->about_text,
                'metrics' => $this->about_metrics ?? [],
            ],
            'meta' => [
                'title' => $this->meta_default_title,
                'description' => $this->meta_default_description,
                'ogImage' => $this->ogImageUrl(),
                'schema' => $this->schema_markup,
            ],
        ];
    }
}
