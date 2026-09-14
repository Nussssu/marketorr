<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Marketorr');
            $table->string('contact_email');
            $table->string('contact_phone')->nullable();
            $table->string('location_text')->default('Remote-first · Worldwide');
            $table->string('social_linkedin')->nullable();
            $table->string('social_behance')->nullable();
            $table->string('social_dribbble')->nullable();
            $table->string('social_instagram')->nullable();
            $table->string('hero_eyebrow');
            $table->json('hero_heading_lines');
            $table->text('hero_subtext');
            $table->text('about_text');
            $table->json('about_metrics');
            $table->string('meta_default_title');
            $table->string('meta_default_description');
            $table->string('meta_default_og_image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
