<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\MailSetting;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminMailSettingTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $this->editor = User::factory()->create(['role' => UserRole::Editor]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'enabled' => true,
            'host' => 'smtp.example.com',
            'port' => 587,
            'encryption' => 'tls',
            'username' => 'postmaster@example.com',
            'password' => 'super-secret',
            'from_address' => 'hello@example.com',
            'from_name' => 'Marketorr',
            'admin_notification_email' => 'leads@example.com',
        ], $overrides);
    }

    public function test_a_super_admin_can_save_smtp_settings(): void
    {
        $this->actingAs($this->superAdmin)
            ->put('/admin/mail', $this->validPayload())
            ->assertRedirect();

        $settings = MailSetting::loadFromDatabase();

        $this->assertTrue($settings->enabled);
        $this->assertSame('smtp.example.com', $settings->host);
        $this->assertSame('super-secret', $settings->password);
    }

    public function test_the_password_is_not_stored_in_plain_text(): void
    {
        $this->actingAs($this->superAdmin)->put('/admin/mail', $this->validPayload());

        $stored = DB::table('mail_settings')->where('id', 1)->value('password');

        $this->assertNotSame('super-secret', $stored);
        $this->assertNotEmpty($stored);
    }

    public function test_the_password_is_never_sent_back_to_the_browser(): void
    {
        $this->actingAs($this->superAdmin)->put('/admin/mail', $this->validPayload());

        $this->actingAs($this->superAdmin)
            ->get('/admin/mail')
            ->assertInertia(fn ($inertia) => $inertia
                ->component('Admin/Mail/Edit')
                ->where('mail.hasPassword', true)
                ->missing('mail.password'));
    }

    public function test_a_blank_password_keeps_the_stored_one(): void
    {
        $this->actingAs($this->superAdmin)->put('/admin/mail', $this->validPayload());
        $this->actingAs($this->superAdmin)->put('/admin/mail', $this->validPayload(['password' => '']));

        $this->assertSame('super-secret', MailSetting::loadFromDatabase()->password);
    }

    public function test_a_host_is_required_when_smtp_is_switched_on(): void
    {
        $this->actingAs($this->superAdmin)
            ->put('/admin/mail', $this->validPayload(['host' => '', 'port' => '']))
            ->assertSessionHasErrors(['host', 'port']);
    }

    public function test_the_host_may_be_blank_while_smtp_is_off(): void
    {
        $this->actingAs($this->superAdmin)
            ->put('/admin/mail', $this->validPayload(['enabled' => false, 'host' => '', 'port' => '']))
            ->assertSessionHasNoErrors();
    }

    public function test_stored_settings_override_the_mail_config_when_enabled(): void
    {
        $settings = MailSetting::loadFromDatabase();
        $settings->update($this->validPayload());

        $overrides = $settings->fresh()->configOverrides();

        $this->assertSame('smtp.example.com', $overrides['mail.mailers.smtp.host']);
        $this->assertSame('hello@example.com', $overrides['mail.from.address']);
    }

    public function test_disabled_settings_leave_the_env_mailer_alone(): void
    {
        $settings = MailSetting::loadFromDatabase();
        $settings->update($this->validPayload(['enabled' => false]));

        $this->assertSame([], $settings->fresh()->configOverrides());
    }

    public function test_lead_notifications_fall_back_to_the_contact_email(): void
    {
        $settings = MailSetting::loadFromDatabase();
        $settings->update($this->validPayload(['admin_notification_email' => null]));
        MailSetting::forgetCurrent();

        $this->assertSame(Setting::current()->contact_email, MailSetting::current()->notificationRecipient());
    }

    public function test_an_editor_cannot_reach_the_smtp_settings(): void
    {
        $this->actingAs($this->editor)->get('/admin/mail')->assertForbidden();
        $this->actingAs($this->editor)->put('/admin/mail', $this->validPayload())->assertForbidden();
    }

    public function test_guests_cannot_reach_the_smtp_settings(): void
    {
        $this->get('/admin/mail')->assertRedirect('/admin/login');
    }

    public function test_testing_smtp_while_it_is_off_reports_the_reason(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/admin/mail/test', ['recipient' => 'someone@example.com'])
            ->assertSessionHasErrors('recipient');
    }

    public function test_apply_config_sets_mail_configuration_and_default_driver(): void
    {
        $settings = MailSetting::loadFromDatabase();
        $settings->update($this->validPayload());
        MailSetting::forgetCurrent();

        MailSetting::current()->applyConfig();

        $this->assertSame('smtp', config('mail.default'));
        $this->assertSame('smtp.example.com', config('mail.mailers.smtp.host'));
        $this->assertSame('hello@example.com', config('mail.from.address'));
    }

    public function test_notification_recipients_parses_comma_separated_addresses(): void
    {
        $settings = MailSetting::loadFromDatabase();
        $settings->update($this->validPayload([
            'admin_notification_email' => ' first@example.com , second@example.com, invalid-email ',
        ]));
        MailSetting::forgetCurrent();

        $recipients = MailSetting::current()->notificationRecipients();

        $this->assertSame(['first@example.com', 'second@example.com'], $recipients);
    }
}
