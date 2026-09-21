<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAccountCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_super_admin_with_the_given_password(): void
    {
        $this->artisan('admin:account', [
            'email' => 'owner@example.com',
            '--password' => 'a-long-enough-password',
        ])->assertSuccessful();

        $user = User::query()->where('email', 'owner@example.com')->firstOrFail();

        $this->assertSame(UserRole::SuperAdmin, $user->role);
        $this->assertTrue(Hash::check('a-long-enough-password', $user->password));
    }

    public function test_the_new_account_can_sign_in(): void
    {
        $this->artisan('admin:account', [
            'email' => 'owner@example.com',
            '--password' => 'a-long-enough-password',
        ]);

        $this->post('/admin/login', [
            'email' => 'owner@example.com',
            'password' => 'a-long-enough-password',
        ])->assertRedirect('/admin');

        $this->assertAuthenticated();
    }

    public function test_it_resets_an_existing_accounts_password_without_duplicating_it(): void
    {
        $existing = User::factory()->create(['email' => 'owner@example.com', 'name' => 'Original Name']);

        $this->artisan('admin:account', [
            'email' => 'owner@example.com',
            '--password' => 'a-brand-new-password',
        ])->assertSuccessful();

        $this->assertSame(1, User::query()->where('email', 'owner@example.com')->count());
        $this->assertSame('Original Name', $existing->fresh()->name);
        $this->assertTrue(Hash::check('a-brand-new-password', $existing->fresh()->password));
    }

    public function test_it_generates_a_password_when_none_is_given(): void
    {
        $this->artisan('admin:account', ['email' => 'owner@example.com'])->assertSuccessful();

        $this->assertNotNull(User::query()->where('email', 'owner@example.com')->value('password'));
    }

    public function test_it_can_create_an_editor(): void
    {
        $this->artisan('admin:account', [
            'email' => 'editor@example.com',
            '--password' => 'a-long-enough-password',
            '--role' => 'editor',
        ])->assertSuccessful();

        $this->assertSame(UserRole::Editor, User::query()->where('email', 'editor@example.com')->value('role'));
    }

    public function test_an_unknown_role_is_rejected(): void
    {
        $this->artisan('admin:account', [
            'email' => 'owner@example.com',
            '--role' => 'wizard',
        ])->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'owner@example.com']);
    }

    public function test_a_short_password_is_rejected(): void
    {
        $this->artisan('admin:account', [
            'email' => 'owner@example.com',
            '--password' => 'short',
        ])->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'owner@example.com']);
    }

    public function test_an_invalid_email_is_rejected(): void
    {
        $this->artisan('admin:account', ['email' => 'not-an-email'])->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }
}
