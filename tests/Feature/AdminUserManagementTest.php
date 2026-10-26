<?php

namespace Tests\Feature;

use App\Enums\EmailTemplateKey;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Auth\InvitationController;
use App\Mail\TemplatedMail;
use App\Models\AdminSession;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $primary;

    protected function setUp(): void
    {
        parent::setUp();

        $this->primary = User::factory()->primary()->create();
    }

    public function test_the_page_lists_users_with_stats_roles_and_sections(): void
    {
        User::factory()->editor()->create();
        User::factory()->editor()->suspended()->create();
        User::factory()->editor()->invited()->create();

        $this->actingAs($this->primary)
            ->get('/admin/users')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->has('users', 4)
                ->has('roles', 2)
                ->has('sections')
                ->where('stats.total', 4)
                ->where('stats.active', 2)
                ->where('stats.invited', 1)
                ->where('stats.suspended', 1)
                ->where('stats.superAdmins', 1));
    }

    public function test_inviting_an_admin_emails_a_link_and_leaves_the_account_invited(): void
    {
        Mail::fake();

        $this->actingAs($this->primary)
            ->post('/admin/users', ['name' => 'New Editor', 'email' => 'new@marketorr.com', 'role' => 'editor'])
            ->assertSessionHas('success');

        $user = User::query()->where('email', 'new@marketorr.com')->sole();

        $this->assertSame(UserStatus::Invited, $user->status);
        $this->assertSame(UserRole::Editor, $user->role);
        $this->assertTrue($user->inviter->is($this->primary));
        Mail::assertSent(TemplatedMail::class, fn (TemplatedMail $mail) => $mail->hasTo('new@marketorr.com')
            && $mail->template->key === EmailTemplateKey::AdminInvitation);
        $this->assertDatabaseHas('user_activity_logs', ['action' => 'invited', 'user_id' => $user->id, 'actor_id' => $this->primary->id]);
    }

    public function test_an_invited_account_cannot_sign_in_with_a_password(): void
    {
        $invited = User::factory()->editor()->invited()->create();

        $this->post('/admin/login', ['email' => $invited->email, 'password' => 'password'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_an_invitation_link_activates_the_account_once(): void
    {
        $invited = User::factory()->editor()->invited()->create();
        $url = InvitationController::url($invited);

        $this->get($url)->assertOk()->assertInertia(fn ($page) => $page->component('Admin/Auth/AcceptInvitation'));

        $this->post($url, ['name' => 'Set Name', 'password' => 'secret12345', 'password_confirmation' => 'secret12345'])
            ->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($invited);
        $this->assertSame(UserStatus::Active, $invited->refresh()->status);
        $this->assertSame('Set Name', $invited->name);

        auth()->logout();
        $this->get($url)->assertRedirect(route('admin.login'));
    }

    public function test_resending_an_invitation_retires_the_older_link(): void
    {
        Mail::fake();
        $invited = User::factory()->editor()->invited()->create(['invited_at' => now()->subDay()]);
        $oldUrl = InvitationController::url($invited);

        $this->actingAs($this->primary)->post("/admin/users/{$invited->id}/invitation")->assertSessionHas('success');
        auth()->logout();

        $this->get($oldUrl)->assertRedirect(route('admin.login'));
        Mail::assertSent(TemplatedMail::class, fn (TemplatedMail $mail) => $mail->template->key === EmailTemplateKey::AdminInvitation);
    }

    public function test_a_tampered_invitation_link_is_refused(): void
    {
        $invited = User::factory()->editor()->invited()->create();

        $this->get(InvitationController::url($invited).'x')->assertRedirect(route('admin.login'));
    }

    public function test_suspending_an_admin_ends_their_sessions_and_blocks_sign_in(): void
    {
        $editor = User::factory()->editor()->create();
        $session = AdminSession::query()->create(['user_id' => $editor->id, 'session_hash' => str_repeat('a', 64), 'last_active_at' => now()]);

        $this->actingAs($this->primary)->patch("/admin/users/{$editor->id}/suspend")->assertSessionHas('success');

        $this->assertSame(UserStatus::Suspended, $editor->refresh()->status);
        $this->assertNotNull($session->refresh()->revoked_at);
        auth()->logout();

        $this->post('/admin/login', ['email' => $editor->email, 'password' => 'password'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_a_suspended_admin_is_signed_out_on_their_next_request(): void
    {
        $editor = User::factory()->editor()->suspended()->create();

        $this->actingAs($editor)->get('/admin/dashboard')->assertRedirect(route('admin.login'));
        $this->assertGuest();
    }

    public function test_a_suspended_admin_can_be_reactivated(): void
    {
        $editor = User::factory()->editor()->suspended()->create();

        $this->actingAs($this->primary)->patch("/admin/users/{$editor->id}/reactivate")->assertSessionHas('success');

        $this->assertSame(UserStatus::Active, $editor->refresh()->status);
    }

    public function test_the_primary_super_admin_is_protected_from_other_super_admins(): void
    {
        $other = User::factory()->create();

        $this->actingAs($other)->patch("/admin/users/{$this->primary->id}/suspend")->assertSessionHasErrors('user');
        $this->actingAs($other)->delete("/admin/users/{$this->primary->id}")->assertSessionHasErrors('user');
        $this->actingAs($other)->put("/admin/users/{$this->primary->id}", [
            'name' => 'Renamed',
            'email' => $this->primary->email,
            'role' => 'editor',
        ])->assertSessionHasErrors('user');
        $this->actingAs($other)->post("/admin/users/{$this->primary->id}/password-reset")->assertSessionHasErrors('user');

        $this->primary->refresh();
        $this->assertSame(UserStatus::Active, $this->primary->status);
        $this->assertSame(UserRole::SuperAdmin, $this->primary->role);
        $this->assertNotSame('Renamed', $this->primary->name);
    }

    public function test_the_primary_super_admin_cannot_be_demoted_even_by_itself(): void
    {
        User::factory()->create();

        $this->actingAs($this->primary)->put("/admin/users/{$this->primary->id}", [
            'name' => $this->primary->name,
            'email' => $this->primary->email,
            'role' => 'editor',
        ])->assertSessionHasErrors('role');

        $this->assertSame(UserRole::SuperAdmin, $this->primary->refresh()->role);
    }

    public function test_nobody_can_suspend_themselves(): void
    {
        $this->actingAs($this->primary)->patch("/admin/users/{$this->primary->id}/suspend")->assertSessionHasErrors('user');

        $this->assertSame(UserStatus::Active, $this->primary->refresh()->status);
    }

    public function test_a_password_reset_link_is_emailed_and_logged(): void
    {
        Mail::fake();
        $editor = User::factory()->editor()->create();

        $this->actingAs($this->primary)->post("/admin/users/{$editor->id}/password-reset")->assertSessionHas('success');

        Mail::assertSent(TemplatedMail::class, fn (TemplatedMail $mail) => $mail->hasTo($editor->email)
            && $mail->template->key === EmailTemplateKey::AdminPasswordReset);
        $this->assertDatabaseHas('user_activity_logs', ['action' => 'password_reset_sent', 'user_id' => $editor->id]);
    }

    public function test_two_factor_can_be_reset_for_another_admin(): void
    {
        $editor = User::factory()->editor()->create([
            'two_factor_secret' => 'JBSWY3DPEHPK3PXP',
            'two_factor_recovery_codes' => ['aaaaa-bbbbb'],
            'two_factor_confirmed_at' => now(),
        ]);

        $this->actingAs($this->primary)->delete("/admin/users/{$editor->id}/two-factor")->assertSessionHas('success');

        $this->assertFalse($editor->refresh()->hasTwoFactor());
    }

    public function test_sessions_can_be_listed_and_revoked(): void
    {
        $editor = User::factory()->editor()->create();
        $session = AdminSession::query()->create(['user_id' => $editor->id, 'session_hash' => str_repeat('b', 64), 'user_agent' => 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0', 'last_active_at' => now()]);

        $this->actingAs($this->primary)
            ->getJson("/admin/users/{$editor->id}/sessions")
            ->assertOk()
            ->assertJsonPath('sessions.0.device', 'Chrome on Windows');

        $this->actingAs($this->primary)->delete("/admin/users/{$editor->id}/sessions/{$session->id}")->assertSessionHas('success');

        $this->assertNotNull($session->refresh()->revoked_at);
    }

    public function test_a_session_of_another_user_cannot_be_revoked_through_the_wrong_account(): void
    {
        $editor = User::factory()->editor()->create();
        $other = User::factory()->editor()->create();
        $session = AdminSession::query()->create(['user_id' => $other->id, 'session_hash' => str_repeat('c', 64), 'last_active_at' => now()]);

        $this->actingAs($this->primary)->delete("/admin/users/{$editor->id}/sessions/{$session->id}")->assertNotFound();
    }

    public function test_activity_lists_events_for_the_account(): void
    {
        $editor = User::factory()->editor()->create();
        $this->actingAs($this->primary)->patch("/admin/users/{$editor->id}/suspend");

        $this->actingAs($this->primary)
            ->getJson("/admin/users/{$editor->id}/activity")
            ->assertOk()
            ->assertJsonPath('activity.0.label', 'Suspended')
            ->assertJsonPath('activity.0.actor', $this->primary->name);
    }

    public function test_user_activity_appears_in_the_audit_logs(): void
    {
        UserActivityLog::query()->create(['actor_id' => $this->primary->id, 'subject_name' => 'Someone', 'action' => 'suspended']);

        $this->actingAs($this->primary)
            ->get('/admin/audit-logs?category=users')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('logs.0.title', 'Suspended: Someone')
                ->where('logs.0.actor', $this->primary->name)
                ->where('logs.0.level', 'warning'));
    }

    public function test_editors_cannot_reach_user_management_endpoints(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get('/admin/users')->assertForbidden();
        $this->actingAs($editor)->patch("/admin/users/{$this->primary->id}/suspend")->assertForbidden();
        $this->actingAs($editor)->getJson("/admin/users/{$this->primary->id}/sessions")->assertForbidden();
        $this->actingAs($editor)->post('/admin/roles', ['name' => 'Hacker', 'permissions' => []])->assertForbidden();
    }
}
