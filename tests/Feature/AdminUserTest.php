<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create();
    }

    public function test_the_admin_list_renders_for_a_super_admin(): void
    {
        User::factory()->editor()->create();

        $this->actingAs($this->superAdmin)
            ->get('/admin/users')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->has('users', 2)
                ->has('roles', 2));
    }

    public function test_a_super_admin_can_create_an_admin(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/admin/users', [
                'name' => 'New Editor',
                'email' => 'editor@marketorr.com',
                'role' => 'editor',
            ])
            ->assertSessionHas('success');

        $user = User::query()->where('email', 'editor@marketorr.com')->sole();

        $this->assertSame(UserRole::Editor, $user->role);
        $this->assertNotEmpty($user->password);
    }

    public function test_a_duplicate_email_is_rejected(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/admin/users', [
                'name' => 'Clone',
                'email' => $this->superAdmin->email,
                'role' => 'editor',
            ])
            ->assertSessionHasErrors('email');

        $this->assertSame(1, User::query()->count());
    }

    public function test_a_super_admin_can_change_another_admins_role(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($this->superAdmin)
            ->put("/admin/users/{$editor->id}", [
                'name' => $editor->name,
                'email' => $editor->email,
                'role' => 'super_admin',
            ])
            ->assertSessionHas('success');

        $this->assertSame(UserRole::SuperAdmin, $editor->refresh()->role);
    }

    public function test_a_super_admin_can_delete_another_admin(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($this->superAdmin)
            ->delete("/admin/users/{$editor->id}")
            ->assertSessionHas('success');

        $this->assertModelMissing($editor);
    }

    public function test_an_admin_cannot_delete_their_own_account(): void
    {
        $this->actingAs($this->superAdmin)
            ->delete("/admin/users/{$this->superAdmin->id}")
            ->assertSessionHasErrors('user');

        $this->assertModelExists($this->superAdmin);
    }

    public function test_the_last_super_admin_cannot_be_demoted(): void
    {
        $other = User::factory()->create();

        // Demote one of the two, leaving a single super admin.
        $this->actingAs($this->superAdmin)->put("/admin/users/{$other->id}", [
            'name' => $other->name,
            'email' => $other->email,
            'role' => 'editor',
        ]);

        $this->actingAs($this->superAdmin)
            ->put("/admin/users/{$this->superAdmin->id}", [
                'name' => $this->superAdmin->name,
                'email' => $this->superAdmin->email,
                'role' => 'editor',
            ])
            ->assertSessionHasErrors('role');

        $this->assertSame(UserRole::SuperAdmin, $this->superAdmin->refresh()->role);
    }

    public function test_the_last_super_admin_cannot_be_deleted(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor);

        $this->actingAs($this->superAdmin)
            ->delete("/admin/users/{$this->superAdmin->id}")
            ->assertSessionHasErrors();

        $this->assertModelExists($this->superAdmin);
    }

    public function test_an_editor_cannot_manage_admins(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get('/admin/users')->assertStatus(403);

        $this->actingAs($editor)->post('/admin/users', [
            'name' => 'Sneaky',
            'email' => 'sneaky@marketorr.com',
            'role' => 'super_admin',
        ])->assertStatus(403);

        $this->assertSame(2, User::query()->count());
    }
}
