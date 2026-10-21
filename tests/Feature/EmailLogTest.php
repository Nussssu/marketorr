<?php

namespace Tests\Feature;

use App\Enums\EmailLogSource;
use App\Enums\EmailLogStatus;
use App\Enums\EmailTemplateKey;
use App\Enums\UserRole;
use App\Models\ContactSubmission;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Models\MailSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Tests\TestCase;

class EmailLogTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
    }

    /**
     * @return array<string, mixed>
     */
    private function lead(): array
    {
        return [
            'name' => 'Jane Cooper',
            'email' => 'jane@example.com',
            'company' => 'Acme Corp',
            'type' => 'Branding',
            'budget' => '$10k – $25k',
            'message' => 'We would love to rebrand our SaaS platform.',
        ];
    }

    public function test_a_new_lead_logs_the_team_notification_and_the_auto_reply(): void
    {
        Mail::fake();

        $this->post('/contact', $this->lead());

        $lead = ContactSubmission::query()->sole();
        $logs = EmailLog::query()->orderBy('id')->get();

        $this->assertSame(
            [EmailLogSource::LeadNotification, EmailLogSource::LeadAutoResponder],
            $logs->pluck('source')->all(),
        );
        $this->assertTrue($logs->every(fn (EmailLog $log) => $log->status === EmailLogStatus::Sent));
        $this->assertTrue($logs->every(fn (EmailLog $log) => $log->contact_submission_id === $lead->id));
        $this->assertSame('jane@example.com', $logs->last()->recipients);
    }

    public function test_a_failed_send_is_logged_with_its_error_and_the_lead_is_still_saved(): void
    {
        Mail::shouldReceive('to')->andThrow(new RuntimeException('Connection refused'));

        $this->post('/contact', $this->lead())->assertSessionHasNoErrors();

        $this->assertSame(1, ContactSubmission::query()->count());
        $failed = EmailLog::query()->where('status', EmailLogStatus::Failed)->get();
        $this->assertCount(2, $failed);
        $this->assertSame('Connection refused', $failed->first()->error);
        $this->assertNotNull($failed->first()->subject);
    }

    public function test_a_switched_off_template_is_logged_as_skipped(): void
    {
        Mail::fake();
        EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder)->update(['enabled' => false]);

        $this->post('/contact', $this->lead());

        $skipped = EmailLog::query()->where('source', EmailLogSource::LeadAutoResponder)->sole();
        $this->assertSame(EmailLogStatus::Skipped, $skipped->status);
        $this->assertStringContainsString('switched off', $skipped->error);
    }

    public function test_saving_smtp_settings_is_logged_without_the_password(): void
    {
        $this->actingAs($this->superAdmin)->put('/admin/mail', [
            'enabled' => true,
            'host' => 'smtp.example.com',
            'port' => 587,
            'encryption' => 'tls',
            'username' => 'postmaster@example.com',
            'password' => 'super-secret',
            'from_address' => 'hello@example.com',
            'from_name' => 'Marketorr',
        ]);

        $log = EmailLog::query()->sole();
        $this->assertSame(EmailLogStatus::Activity, $log->status);
        $this->assertSame(EmailLogSource::SmtpSettings, $log->source);
        $this->assertSame($this->superAdmin->id, $log->user_id);
        $this->assertContains('password', $log->meta['changed']);
        $this->assertStringNotContainsString('super-secret', json_encode($log->getAttributes()));
    }

    public function test_an_smtp_test_without_settings_is_logged_as_skipped(): void
    {
        MailSetting::loadFromDatabase();

        $this->actingAs($this->superAdmin)->post('/admin/mail/test', ['recipient' => 'me@example.com']);

        $log = EmailLog::query()->sole();
        $this->assertSame(EmailLogSource::SmtpTest, $log->source);
        $this->assertSame(EmailLogStatus::Skipped, $log->status);
        $this->assertSame('me@example.com', $log->recipients);
    }

    public function test_the_logs_page_lists_and_filters_entries(): void
    {
        EmailLog::factory()->create(['subject' => 'Welcome aboard']);
        EmailLog::factory()->failed()->create(['subject' => 'Broken send']);

        $this->actingAs($this->superAdmin)
            ->get('/admin/email-logs?status=failed')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/EmailLogs/Index')
                ->has('logs.data', 1)
                ->where('logs.data.0.subject', 'Broken send')
                ->where('counts.sent', 1)
                ->where('counts.failed', 1));
    }

    public function test_an_entry_opens_with_its_full_message(): void
    {
        $log = EmailLog::factory()->create(['body' => '<p>Hello Jane</p>']);

        $this->actingAs($this->superAdmin)
            ->getJson("/admin/email-logs/{$log->id}")
            ->assertOk()
            ->assertJsonPath('body', '<p>Hello Jane</p>');
    }

    public function test_editors_cannot_see_the_email_logs(): void
    {
        $editor = User::factory()->create(['role' => UserRole::Editor]);

        $this->actingAs($editor)->get('/admin/email-logs')->assertForbidden();
    }
}
