<?php

use Database\Seeders\WebsiteMediaSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Every library entry gets a content checksum, so one file is only ever
     * listed (and linked) once. Then every GIF and video the website ships is
     * added to the library at the path the site uses it from; where the
     * library already holds a copy of the same file, that entry is pointed at
     * the site's file instead of listing it twice.
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->string('checksum', 64)->nullable()->after('path')->index();
        });

        DB::table('media')->orderBy('id')->get(['id', 'path'])->each(function (object $medium): void {
            DB::table('media')->where('id', $medium->id)->update(['checksum' => $this->checksum($this->absolutePath($medium->path))]);
        });

        // An existing site gets its GIFs and videos listed here; a fresh install
        // seeds them with the rest of the library (see DatabaseSeeder).
        if (DB::table('projects')->exists()) {
            (new WebsiteMediaSeeder)->run();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex(['checksum']);
            $table->dropColumn('checksum');
        });
    }

    private function absolutePath(string $path): string
    {
        return str_starts_with($path, '/') ? public_path(ltrim($path, '/')) : Storage::disk('public')->path($path);
    }

    private function checksum(string $absolute): ?string
    {
        return is_file($absolute) ? hash_file('sha256', $absolute) : null;
    }
};
