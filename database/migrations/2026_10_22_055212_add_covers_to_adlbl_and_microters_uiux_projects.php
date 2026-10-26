<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** The UI/UX showcase projects that shipped without a cover, by slug. */
    private const PROJECTS = ['adlbl', 'microters'];

    /**
     * Run the migrations.
     *
     * ADLBL and Microters were added without a `cover.webp`, so the admin
     * list showed no image. Their covers (the top of each design's first
     * screen) now ship in their folders: point each project at its cover,
     * unless one was already chosen, and add the cover to the media library.
     */
    public function up(): void
    {
        foreach (self::PROJECTS as $slug) {
            $path = "/images/work/uiux/{$slug}/cover.webp";
            $absolute = public_path(ltrim($path, '/'));

            if (! is_file($absolute)) {
                continue;
            }

            $project = DB::table('projects')->where('slug', $slug)->first();

            if ($project === null) {
                continue;
            }

            if (blank($project->image_path)) {
                DB::table('projects')->where('id', $project->id)->update(['image_path' => $path, 'updated_at' => now()]);
            }

            if (DB::table('media')->where('path', $path)->exists()) {
                continue;
            }

            $dimensions = getimagesize($absolute) ?: [null, null];

            DB::table('media')->insert([
                'filename' => "{$slug}-cover.webp",
                'path' => $path,
                'checksum' => hash_file('sha256', $absolute),
                'mime_type' => 'image/webp',
                'size_bytes' => filesize($absolute),
                'width' => $dimensions[0],
                'height' => $dimensions[1],
                'category' => 'Work',
                'usage_location' => 'Work case study',
                'alt_text' => $project->image_alt ?: null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (self::PROJECTS as $slug) {
            $path = "/images/work/uiux/{$slug}/cover.webp";

            DB::table('media')->where('path', $path)->delete();
            DB::table('projects')->where('slug', $slug)->where('image_path', $path)->update(['image_path' => '']);
        }
    }
};
