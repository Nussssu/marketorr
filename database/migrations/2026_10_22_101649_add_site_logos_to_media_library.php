<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Adds the shipped Marketorr logos to the media library, so they can be
 * picked for Settings, emails and pages like any other image. A logo the
 * library already holds (same path or same file) is left as it is.
 */
return new class extends Migration
{
    private const LOGOS = [
        '/images/logo/marketorr-logo-on-light.png' => 'Marketorr logo for light backgrounds',
        '/images/logo/marketorr-logo-on-dark.png' => 'Marketorr logo for dark backgrounds',
    ];

    public function up(): void
    {
        foreach (self::LOGOS as $path => $alt) {
            $absolute = public_path(ltrim($path, '/'));

            if (! is_file($absolute)) {
                continue;
            }

            $checksum = hash_file('sha256', $absolute);
            $exists = DB::table('media')
                ->whereNull('deleted_at')
                ->where(fn ($query) => $query->where('path', $path)->orWhere('checksum', $checksum))
                ->exists();

            if ($exists) {
                continue;
            }

            $dimensions = @getimagesize($absolute) ?: null;

            DB::table('media')->insert([
                'filename' => basename($path),
                'path' => $path,
                'checksum' => $checksum,
                'mime_type' => $dimensions['mime'] ?? File::mimeType($absolute),
                'size_bytes' => File::size($absolute),
                'width' => $dimensions[0] ?? null,
                'height' => $dimensions[1] ?? null,
                'category' => 'Logo',
                'usage_location' => 'Site header, footer & emails',
                'alt_text' => $alt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * The entries point at files the site ships, so removing them never
     * touches the files themselves.
     */
    public function down(): void
    {
        DB::table('media')->whereIn('path', array_keys(self::LOGOS))->where('category', 'Logo')->delete();
    }
};
