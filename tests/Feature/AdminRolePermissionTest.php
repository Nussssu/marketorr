<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AdminRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRolePermissionTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->primary()->create();
    }

    private function customRole(array $permissions): AdminRole
    {
        return AdminRole::query()->create(['name' => 'Custom', 'slug' => 'custom', 'permissions' => $permissions]);
    }

    public function test_a_super_admin_can_create_a_role_and_manage_implies_view(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/admin/roles', ['name' => 'Content Writer', 'description' => 'Writes', 'permissions' => ['pages.manage', 'media.view']])
            ->assertSessionHas('success');

        $role = AdminRole::query()->where('name', 'Content Writer')->sole();

        $this->assertSame('content_writer', $role->slug);
        $this->assertEqualsCanonicalizing(['pages.view', 'pages.manage', 'media.view'], $role->permissions);
        $this->assertDatabaseHas('user_activity_logs', ['action' => 'role_created']);
    }

    public function test_unknown_permissions_are_rejected(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/admin/roles', ['name' => 'Bad', 'permissions' => ['users.manage']])
            ->assertSessionHasErrors('permissions.0');
    }

    public function test_the_super_admin_role_cannot_be_edited_or_deleted(): void
    {
        $role = AdminRole::forSlug(AdminRole::SUPER_ADMIN);

        $this->actingAs($this->superAdmin)->put("/admin/roles/{$role->id}", ['name' => 'Renamed', 'permissions' => []])->assertSessionHasErrors('name');
        $this->actingAs($this->superAdmin)->delete("/admin/roles/{$role->id}")->assertSessionHasErrors('role');

        $this->assertModelExists($role);
    }

    public function test_a_role_in_use_cannot_be_deleted(): void
    {
        $role = $this->customRole(['pages.view']);
        User::factory()->editor()->create(['admin_role_id' => $role->id]);

        $this->actingAs($this->superAdmin)->delete("/admin/roles/{$role->id}")->assertSessionHasErrors('role');
        $this->assertModelExists($role);
    }

    public function test_an_unused_custom_role_can_be_deleted(): void
    {
        $role = $this->customRole(['pages.view']);

        $this->actingAs($this->superAdmin)->delete("/admin/roles/{$role->id}")->assertSessionHas('success');
        $this->assertModelMissing($role);
    }

    public function test_an_admin_can_be_given_a_custom_role(): void
    {
        $role = $this->customRole(['pages.view']);
        $editor = User::factory()->editor()->create();

        $this->actingAs($this->superAdmin)
            ->put("/admin/users/{$editor->id}", ['name' => $editor->name, 'email' => $editor->email, 'role' => 'custom'])
            ->assertSessionHas('success');

        $editor->refresh();
        $this->assertSame($role->id, $editor->admin_role_id);
        $this->assertSame(UserRole::Editor, $editor->role);
    }

    public function test_view_permission_allows_reading_but_not_changing_a_section(): void
    {
        $role = $this->customRole(['projects.view']);
        $user = User::factory()->editor()->create(['admin_role_id' => $role->id]);

        $this->actingAs($user)->get('/admin/projects')->assertOk();
        $this->actingAs($user)->post('/admin/projects', [])->assertForbidden();
        $this->actingAs($user)->patch('/admin/categories/reorder', [])->assertForbidden();
    }

    public function test_sections_without_permission_are_forbidden(): void
    {
        $user = User::factory()->editor()->create(['admin_role_id' => $this->customRole(['projects.view'])->id]);

        $this->actingAs($user)->get('/admin/pages')->assertForbidden();
        $this->actingAs($user)->get('/admin/inquiries')->assertForbidden();
        $this->actingAs($user)->get('/admin/media')->assertForbidden();
        $this->actingAs($user)->get('/admin/menus')->assertForbidden();
        $this->actingAs($user)->get('/admin/audit-logs')->assertForbidden();
        $this->actingAs($user)->get('/admin/custom-code')->assertForbidden();
        $this->actingAs($user)->get('/admin/dashboard')->assertOk();
    }

    public function test_a_role_can_be_granted_settings_and_email(): void
    {
        $user = User::factory()->editor()->create(['admin_role_id' => $this->customRole(['settings.manage', 'email.view'])->id]);

        $this->actingAs($user)->get('/admin/settings')->assertOk();
        $this->actingAs($user)->get('/admin/email-smtp')->assertOk();
        $this->actingAs($user)->put('/admin/email-smtp', [])->assertForbidden();
    }

    public function test_the_default_editor_role_keeps_its_previous_access(): void
    {
        $editor = User::factory()->editor()->create();

        foreach (['/admin/inquiries', '/admin/pages', '/admin/projects', '/admin/sub-services', '/admin/media', '/admin/menus', '/admin/audit-logs'] as $url) {
            $this->actingAs($editor)->get($url)->assertOk();
        }

        $this->actingAs($editor)->get('/admin/settings')->assertForbidden();
        $this->actingAs($editor)->get('/admin/email-smtp')->assertForbidden();
    }

    public function test_an_editor_assigned_the_super_admin_role_gets_no_extra_access(): void
    {
        $editor = User::factory()->editor()->create(['admin_role_id' => AdminRole::forSlug(AdminRole::SUPER_ADMIN)->id]);

        $this->assertFalse($editor->hasPermission('settings.view'));
        $this->actingAs($editor)->get('/admin/settings')->assertForbidden();
    }

    public function test_permissions_are_shared_with_the_panel(): void
    {
        $user = User::factory()->editor()->create(['admin_role_id' => $this->customRole(['projects.view'])->id]);

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertInertia(fn ($page) => $page
                ->where('auth.user.permissions', ['projects.view'])
                ->where('auth.user.roleLabel', 'Custom'));
    }
}
