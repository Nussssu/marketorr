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
            'contact_email' => 'hello@marketorr.com',
            'contact_phone' => null,
            'location_text' => 'Remote-first · Worldwide',
            'social_linkedin' => 'https://www.linkedin.com/company/marketorr',
            'social_behance' => 'https://www.behance.net/marketorr',
            'social_dribbble' => 'https://dribbble.com/marketorr',
            'social_instagram' => 'https://www.instagram.com/marketorr',
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
        ];
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
            'socials' => [
                'linkedin' => $this->social_linkedin,
                'behance' => $this->social_behance,
                'dribbble' => $this->social_dribbble,
                'instagram' => $this->social_instagram,
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
            ],
        ];
    }
}
