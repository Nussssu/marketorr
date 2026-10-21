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
        Schema::create('code_snippet_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('code_snippet_id')->nullable()->constrained()->nullOnDelete();
            $table->string('snippet_name')->nullable();
            $table->string('action', 30)->index();
            $table->json('changes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('code_snippet_audit_logs');
    }
};
