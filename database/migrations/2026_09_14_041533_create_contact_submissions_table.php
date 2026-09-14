<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('company')->nullable();
            $table->enum('type', ['Branding', 'Web UI/UX', 'Software UI/UX', 'Mobile App UI/UX', 'Other']);
            $table->string('budget')->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'in_progress', 'replied', 'archived'])->default('new');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
    }
};
