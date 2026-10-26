<?php

namespace Tests\Feature;

use App\Http\Controllers\Auth\PasswordResetController;
use App\Models\AdminSession;
use App\Models\User;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminAccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'JBSWY3DPEHPK3PXP';

    private function currentCode(): string
    {
        return app(TwoFactorAuthenticator::class)->codeAt(self::SECRET, intdiv(time(), 30));
    }

    private function twoFactorUser(): User
    {
        return User::factory()->create([
            'two_factor_secret' => self::SECRET,
            'two_factor_recovery_codes' => ['ABCDE-12345'],
            'two_factor_confirmed_at' => now(),
        ]);
    }

    public function test_signing_in_records_the_last_login(): void
    {
        $user = User::factory()->create();

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect(route('admin.dashboard'));

        $this->assertNotNull($user->refresh()->last_login_at);
        $this->assertDatabaseHas('user_activity_logs', ['action' => 'login', 'user_id' => $user->id]);
    }

    public function test_a_failed_sign_in_is_logged(): void
    {
        $user = User::factory()->create();

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'wrong'])->assertSessionHasErrors('email');

        $this->assertDatabaseHas('user_activity_logs', ['action' => 'login_failed', 'user_id' => $user->id]);
    }

    public function test_two_factor_accounts_need_a_code_after_the_password(): void
    {
        $user = $this->twoFactorUser();

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect(route('admin.two-factor'));
        $this->assertGuest();

        $this->get('/admin/two-factor')->assertOk()->assertInertia(fn ($page) => $page->component('Admin/Auth/TwoFactorChallenge'));

        $this->post('/admin/two-factor', ['code' => '000000'])->assertSessionHasErrors('code');
        $this->assertGuest();

        $this->post('/admin/two-factor', ['code' => $this->currentCode()])->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_a_recovery_code_works_once(): void
    {
        $user = $this->twoFactorUser();

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'password']);
        $this->post('/admin/two-factor', ['code' => 'ABCDE-12345'])->assertRedirect(route('admin.dashboard'));
        $this->assertSame([], $user->refresh()->two_factor_recovery_codes);
    }

    public function test_the_challenge_page_needs_a_password_first(): void
    {
        $this->get('/admin/two-factor')->assertRedirect(route('admin.login'));
    }

    public function test_the_security_page_renders(): void
    {
        $user = User::factory()->editor()->create();

        $this->actingAs($user)
            ->get('/admin/account/security')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Account/Security')->where('twoFactor.enabled', false));
    }

    public function test_an_admin_can_turn_on_two_factor(): void
    {
        $user = User::factory()->editor()->create();

        $this->actingAs($user)->post('/admin/account/two-factor');
        $secret = session('admin.two_factor.pending_secret');
        $this->assertNotEmpty($secret);

        $code = app(TwoFactorAuthenticator::class)->codeAt($secret, intdiv(time(), 30));
        $this->actingAs($user)->post('/admin/account/two-factor/confirm', ['code' => $code])
            ->assertSessionHas('recoveryCodes');

        $this->assertTrue($user->refresh()->hasTwoFactor());
    }

    public function test_turning_off_two_factor_needs_the_password(): void
    {
        $user = $this->twoFactorUser();

        $this->actingAs($user)->delete('/admin/account/two-factor', ['password' => 'wrong'])->assertSessionHasErrors('password');
        $this->assertTrue($user->refresh()->hasTwoFactor());

        $this->actingAs($user)->delete('/admin/account/two-factor', ['password' => 'password'])->assertSessionHas('success');
        $this->assertFalse($user->refresh()->hasTwoFactor());
    }

    public function test_an_admin_can_change_their_password(): void
    {
        $user = User::factory()->editor()->create();

        $this->actingAs($user)->put('/admin/account/password', [
            'current_password' => 'password',
            'password' => 'newsecret123',
            'password_confirmation' => 'newsecret123',
        ])->assertSessionHas('success');

        $this->assertTrue(Hash::check('newsecret123', $user->refresh()->password));
    }

    public function test_a_password_reset_link_sets_a_new_password_and_ends_sessions(): void
    {
        $user = User::factory()->editor()->create();
        $session = AdminSession::query()->create(['user_id' => $user->id, 'session_hash' => str_repeat('d', 64), 'last_active_at' => now()]);
        $url = PasswordResetController::url($user);
        $token = basename(parse_url($url, PHP_URL_PATH));

        $this->get($url)->assertOk()->assertInertia(fn ($page) => $page->component('Admin/Auth/ResetPassword')->where('email', $user->email));

        $this->post('/admin/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'brandnew1234',
            'password_confirmation' => 'brandnew1234',
        ])->assertRedirect(route('admin.login'));

        $this->assertTrue(Hash::check('brandnew1234', $user->refresh()->password));
        $this->assertNotNull($session->refresh()->revoked_at);
    }

    public function test_an_invalid_reset_token_is_refused(): void
    {
        $user = User::factory()->editor()->create();

        $this->post('/admin/reset-password', [
            'token' => 'nope',
            'email' => $user->email,
            'password' => 'brandnew1234',
            'password_confirmation' => 'brandnew1234',
        ])->assertSessionHasErrors('email');
    }

    public function test_a_revoked_session_is_signed_out(): void
    {
        $user = User::factory()->editor()->create();
        $sessionId = Str::random(40);
        AdminSession::query()->create(['user_id' => $user->id, 'session_hash' => AdminSession::hashFor($sessionId), 'last_active_at' => now(), 'revoked_at' => now()]);

        $this->actingAs($user)
            ->withCookie(config('session.cookie'), $sessionId)
            ->get('/admin/dashboard')
            ->assertRedirect(route('admin.login'));

        $this->assertGuest();
    }

    public function test_an_admin_can_sign_out_another_of_their_sessions(): void
    {
        $user = User::factory()->editor()->create();
        $other = AdminSession::query()->create(['user_id' => $user->id, 'session_hash' => str_repeat('e', 64), 'last_active_at' => now()]);
        $foreign = AdminSession::query()->create(['user_id' => User::factory()->create()->id, 'session_hash' => str_repeat('f', 64), 'last_active_at' => now()]);

        $this->actingAs($user)->delete("/admin/account/sessions/{$other->id}")->assertSessionHas('success');
        $this->assertNotNull($other->refresh()->revoked_at);

        $this->actingAs($user)->delete("/admin/account/sessions/{$foreign->id}")->assertNotFound();
    }
}
