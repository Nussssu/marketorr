<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('client');
            $table->string('category');
            $table->string('year');
            $table->text('description');
            $table->string('metric')->nullable();
            $table->string('metric_label')->nullable();
            $table->string('accent');
            $table->string('image_path');
            $table->string('image_alt');
            $table->json('tags');
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'published'])->default('published');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'sort_order']);
            $table->index(['featured', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
