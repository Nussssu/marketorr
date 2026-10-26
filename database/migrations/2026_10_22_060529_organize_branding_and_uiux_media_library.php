<?php

use App\Services\MediaCatalogue;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Brings the Branding and UI/UX images into the media library once (see
     * MediaCatalogue::sync()); the library keeps itself in step afterwards.
     */
    public function up(): void
    {
        app(MediaCatalogue::class)->sync();
    }

    /**
     * Reverse the migrations.
     *
     * The library entries added are ordinary entries and stay.
     */
    public function down(): void
    {
        //
    }
};
