<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('source_page')->nullable()->after('message');
            $table->text('admin_notes')->nullable()->after('status');
            $table->timestamp('responded_at')->nullable()->after('admin_notes');
        });
    }

    public function down(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->dropColumn(['phone', 'source_page', 'admin_notes', 'responded_at']);
        });
    }
};
