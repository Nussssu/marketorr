<?php

namespace App\Models;

use App\Services\PublicAsset;
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
            'header_sticky' => 'boolean',
            'footer_logo_visible' => 'boolean',
            'footer_motto_items' => 'array',
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
            'logo_path' => '/images/logo/marketorr-logo-on-light.png',
            'logo_dark_path' => '/images/logo/marketorr-logo-on-dark.png',
            'favicon_path' => '/favicon.svg',
            'contact_email' => 'hello@marketorr.com',
            'contact_phone' => '+8801332850355',
            'location_text' => 'Remote-first · Worldwide',
            'address' => 'Natore Tower, Plot 32D & E, Road 2, Sector 3, Uttara, Dhaka 1230',
            'directions_url' => 'https://www.google.com/maps/search/?api=1&query=Natore+Tower+Uttara+Dhaka+1230+Bangladesh',
            'copyright_text' => '© {year} {site}. All rights reserved.',
            'footer_intro' => 'Independent creative & digital agency. We turn ideas into experiences, and experiences into measurable results.',
            'footer_logo_path' => '/images/logo/marketorr-logo-on-light.png',
            'footer_logo_visible' => true,
            'footer_motto_items' => ['IDEA', 'EXPERIENCE', 'RESULT'],
            'social_linkedin' => 'https://www.linkedin.com/company/marketorr360',
            'social_facebook' => null,
            'social_behance' => 'https://www.behance.net/marketorr',
            'social_dribbble' => 'https://dribbble.com/marketorr',
            'social_instagram' => 'https://www.instagram.com/marketorr',
            'social_x' => null,
            'social_youtube' => null,
            'hero_eyebrow' => 'Independent creative & digital agency',
            'hero_heading_lines' => ['We turn', 'attention', 'into results.'],
            'hero_subtext' => 'Marketorr builds brands, digital products, and experiences designed to create measurable growth.',
            'about_text' => 'Marketorr is a creative and digital agency helping ambitious brands grow through strategy, branding, UI/UX and technology, creating work that looks exceptional and performs even better.',
            'about_metrics' => [
                ['value' => 120, 'suffix' => '+', 'label' => 'Projects delivered'],
                ['value' => 48, 'suffix' => '', 'label' => 'Brands transformed'],
                ['value' => 12, 'suffix' => '', 'label' => 'Industries served'],
                ['value' => 6, 'suffix' => 'yrs', 'label' => 'Avg. team experience'],
            ],
            'meta_default_title' => 'Marketorr | We Turn Attention Into Results',
            'meta_default_description' => 'Marketorr is an independent creative & digital agency building brands, digital products and experiences designed for measurable growth.',
            'meta_default_og_image' => null,
            'head_scripts' => null,
            'body_scripts' => null,
            'robots_txt' => null,
            'schema_markup' => null,
            'sitemap_enabled' => true,
            'header_sticky' => true,
            'header_cta_text' => 'Start a Project',
            'header_cta_link' => '/contact',
        ];
    }

    /**
     * Public URL for an uploaded asset path, or null when it is unset. Absolute
     * URLs pass through; root-relative and uploaded paths resolve against the
     * configured asset URL.
     */
    public function assetUrl(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        return PublicAsset::url($path);
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
            'footerLogo' => $this->assetUrl($this->footer_logo_path),
            'footerLogoVisible' => (bool) ($this->footer_logo_visible ?? true),
            'footerMottoItems' => is_array($this->footer_motto_items)
                ? $this->footer_motto_items
                : ['IDEA', 'EXPERIENCE', 'RESULT'],
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
            'headerSticky' => (bool) ($this->header_sticky ?? true),
            'headerCtaText' => $this->header_cta_text ?: 'Start a Project',
            'headerCtaLink' => $this->header_cta_link ?: '/contact',
        ];
    }
}
