<?php

use App\Enums\AdminSection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Role-based user management: customisable roles with per-section
     * permissions, account status, last login, invitations, two-factor
     * authentication, tracked sessions and an activity log.
     *
     * Existing accounts keep exactly what they had: every Super Admin stays a
     * Super Admin, every Editor gets the Editor role seeded with the sections
     * Editors could already reach, all stay active, and the first Super Admin
     * becomes the protected primary account.
     */
    public function up(): void
    {
        Schema::create('admin_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 80)->unique();
            $table->string('description', 255)->nullable();
            $table->json('permissions')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('admin_role_id')->nullable()->after('role')->constrained('admin_roles')->nullOnDelete();
            $table->string('status', 20)->default('active')->after('admin_role_id')->index();
            $table->boolean('is_primary')->default(false)->after('status');
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamp('invited_at')->nullable();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
        });

        Schema::create('admin_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('session_hash', 64)->unique();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('user_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject_name')->nullable();
            $table->string('action', 40)->index();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index('created_at');
        });

        $now = now();

        $superAdminRoleId = DB::table('admin_roles')->insertGetId([
            'name' => 'Super Admin',
            'slug' => 'super_admin',
            'description' => 'Everything, including users, roles, settings and custom code.',
            'permissions' => json_encode(AdminSection::permissionKeys()),
            'is_system' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $editorRoleId = DB::table('admin_roles')->insertGetId([
            'name' => 'Editor',
            'slug' => 'editor',
            'description' => 'Day-to-day content: inbox, pages, projects, services, media and menus.',
            'permissions' => json_encode(AdminSection::editorDefaults()),
            'is_system' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('users')->where('role', 'super_admin')->update(['admin_role_id' => $superAdminRoleId]);
        DB::table('users')->where('role', '!=', 'super_admin')->update(['admin_role_id' => $editorRoleId]);

        $primaryId = DB::table('users')->where('role', 'super_admin')->orderBy('id')->value('id');
        if ($primaryId !== null) {
            DB::table('users')->where('id', $primaryId)->update(['is_primary' => true]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_activity_logs');
        Schema::dropIfExists('admin_sessions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('admin_role_id');
            $table->dropConstrainedForeignId('invited_by');
            $table->dropIndex(['status']);
            $table->dropColumn([
                'status', 'is_primary', 'last_login_at', 'last_login_ip', 'invited_at',
                'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at',
            ]);
        });

        Schema::dropIfExists('admin_roles');
    }
};
