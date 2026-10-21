<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('code_snippets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description', 500)->nullable();
            $table->string('type', 10);
            $table->string('location', 20);
            $table->longText('code');
            $table->unsignedSmallInteger('priority')->default(10);
            $table->string('target', 10)->default('all');
            $table->json('target_paths')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('enabled')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'enabled']);
        });

        Schema::create('code_snippet_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('code_snippet_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->json('snapshot');
            $table->string('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique(['code_snippet_id', 'version']);
        });

        Schema::table('site_settings', function (Blueprint $table) {
            $table->boolean('custom_code_enabled')->default(true);
        });

        $this->importLegacyCode();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn('custom_code_enabled');
        });

        Schema::dropIfExists('code_snippet_versions');
        Schema::dropIfExists('code_snippets');
    }

    /**
     * The old head and body boxes become published, site-wide HTML snippets,
     * so whatever they held keeps running exactly where it did. The original
     * columns are left untouched.
     */
    private function importLegacyCode(): void
    {
        $settings = DB::table('site_settings')->first();

        if ($settings === null) {
            return;
        }

        $legacy = [
            ['Head code (imported)', 'head', $settings->head_scripts ?? null, 10],
            ['Body code (imported)', 'body_end', $settings->body_scripts ?? null, 10],
        ];

        foreach ($legacy as [$name, $location, $code, $priority]) {
            if (blank($code)) {
                continue;
            }

            $now = now();
            $attributes = [
                'name' => $name,
                'description' => 'Moved from the previous Custom Code page.',
                'type' => 'html',
                'location' => $location,
                'code' => $code,
                'priority' => $priority,
                'target' => 'all',
                'target_paths' => null,
                'status' => 'published',
                'enabled' => true,
            ];

            $id = DB::table('code_snippets')->insertGetId([...$attributes, 'created_at' => $now, 'updated_at' => $now]);

            DB::table('code_snippet_versions')->insert([
                'code_snippet_id' => $id,
                'version' => 1,
                'snapshot' => json_encode($attributes),
                'note' => 'Imported from the previous Custom Code page',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
};
