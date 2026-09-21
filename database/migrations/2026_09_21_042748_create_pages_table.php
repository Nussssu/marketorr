<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->enum('status', ['draft', 'published'])->default('published');
            /**
             * System pages own a hand-built route (home, contact, …). Their
             * sections stay editable but the row itself cannot be deleted and
             * its slug is locked, so the route never loses its content.
             */
            $table->boolean('is_system')->default(false);
            $table->integer('sort_order')->default(0);
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('meta_og_image')->nullable();
            $table->string('meta_robots')->default('index,follow');
            $table->string('canonical_url')->nullable();
            $table->json('schema_markup')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
