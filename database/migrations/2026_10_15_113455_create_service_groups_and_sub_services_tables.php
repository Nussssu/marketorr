<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_groups', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 190)->unique();
            $table->string('name', 190);
            $table->string('tagline', 255)->nullable();
            $table->string('accent', 7)->default('#891FFB');
            $table->enum('status', ['draft', 'published'])->default('published');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('sub_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_group_id')->constrained('service_groups')->cascadeOnDelete();
            $table->string('slug', 190)->unique();
            $table->string('name', 190);
            $table->string('short', 255)->nullable();
            $table->text('description')->nullable();
            $table->json('deliverables')->nullable();
            $table->string('image', 500)->nullable();
            $table->string('image_alt', 255)->nullable();
            $table->string('accent', 7)->default('#507AF4');
            $table->json('related_match')->nullable();
            $table->json('related_pin')->nullable();
            $table->json('case_study')->nullable();
            $table->enum('status', ['draft', 'published'])->default('published');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sub_services');
        Schema::dropIfExists('service_groups');
    }
};
