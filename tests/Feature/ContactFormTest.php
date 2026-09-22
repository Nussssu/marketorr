<?php

namespace Tests\Feature;

use App\Enums\EmailTemplateKey;
use App\Enums\InquiryStatus;
use App\Mail\TemplatedMail;
use App\Models\ContactSubmission;
use App\Models\MailSetting;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactFormTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane Cooper',
            'email' => 'jane@example.com',
            'company' => 'Acme Corp',
            'type' => 'Branding',
            'budget' => '$10k – $25k',
            'message' => 'We would love to rebrand our SaaS platform.',
        ], $overrides);
    }

    public function test_successful_submission_persists_the_inquiry(): void
    {
        Mail::fake();

        $response = $this->from('/contact')->post('/contact', $this->validPayload());

        $response->assertRedirect('/contact');
        $response->assertSessionHas('success', 'Thanks — we reply within 24–48h.');

        $this->assertDatabaseCount('contact_submissions', 1);

        $submission = ContactSubmission::query()->sole();
        $this->assertSame('Jane Cooper', $submission->name);
        $this->assertSame('jane@example.com', $submission->email);
        $this->assertSame('Acme Corp', $submission->company);
        $this->assertSame(InquiryStatus::New, $submission->status);
        $this->assertNotNull($submission->ip_address);
    }

    public function test_successful_submission_notifies_the_team(): void
    {
        Mail::fake();

        $this->post('/contact', $this->validPayload());

        Mail::assertSent(
            TemplatedMail::class,
            fn (TemplatedMail $mail) => $mail->hasTo(Setting::current()->contact_email)
                && $mail->template->key === EmailTemplateKey::AdminLeadNotification
                && $mail->placeholders['email'] === 'jane@example.com',
        );
    }

    public function test_successful_submission_acknowledges_the_customer(): void
    {
        Mail::fake();

        $this->post('/contact', $this->validPayload());

        Mail::assertSent(
            TemplatedMail::class,
            fn (TemplatedMail $mail) => $mail->hasTo('jane@example.com')
                && $mail->template->key === EmailTemplateKey::LeadAutoResponder,
        );
    }

    public function test_successful_submission_keeps_the_log_audit_trail(): void
    {
        Mail::fake();
        Log::spy();

        $this->post('/contact', $this->validPayload());

        Log::shouldHaveReceived('info')
            ->once()
            ->withArgs(fn ($message, $context) => $message === 'Project inquiry received'
                && $context['name'] === 'Jane Cooper'
                && $context['email'] === 'jane@example.com');
    }

    public function test_submission_fails_when_required_fields_are_missing(): void
    {
        $response = $this->from('/contact')->post('/contact', []);

        $response->assertRedirect('/contact');
        $response->assertSessionHasErrors(['name', 'email', 'type', 'message']);
        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public function test_submission_fails_with_an_invalid_email(): void
    {
        $response = $this->from('/contact')->post('/contact', $this->validPayload(['email' => 'not-an-email']));

        $response->assertSessionHasErrors(['email']);
        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public function test_submission_fails_with_an_invalid_project_type(): void
    {
        $response = $this->from('/contact')->post('/contact', $this->validPayload(['type' => 'InvalidType']));

        $response->assertSessionHasErrors(['type']);
        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public function test_a_filled_honeypot_is_rejected(): void
    {
        Mail::fake();

        $response = $this->post('/contact', $this->validPayload(['nickname' => 'spam-bot']));

        $response->assertSessionHasErrors(['nickname']);
        $this->assertDatabaseCount('contact_submissions', 0);
        Mail::assertNothingQueued();
    }

    public function test_submissions_are_rate_limited(): void
    {
        Mail::fake();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/contact', $this->validPayload(['email' => "spammer{$attempt}@example.com"]));
        }

        $this->post('/contact', $this->validPayload())->assertStatus(429);
    }

    public function test_successful_submission_notifies_configured_admin_email(): void
    {
        Mail::fake();

        $mailSetting = MailSetting::loadFromDatabase();
        $mailSetting->update(['admin_notification_email' => 'custom-admin@example.com']);
        MailSetting::forgetCurrent();

        $this->post('/contact', $this->validPayload());

        Mail::assertSent(
            TemplatedMail::class,
            fn (TemplatedMail $mail) => $mail->hasTo('custom-admin@example.com')
                && $mail->template->key === EmailTemplateKey::AdminLeadNotification,
        );
    }

    public function test_successful_submission_notifies_multiple_admin_recipients(): void
    {
        Mail::fake();

        $mailSetting = MailSetting::loadFromDatabase();
        $mailSetting->update(['admin_notification_email' => 'admin1@example.com, admin2@example.com']);
        MailSetting::forgetCurrent();

        $this->post('/contact', $this->validPayload());

        Mail::assertSent(
            TemplatedMail::class,
            fn (TemplatedMail $mail) => $mail->hasTo('admin1@example.com')
                && $mail->hasTo('admin2@example.com')
                && $mail->template->key === EmailTemplateKey::AdminLeadNotification,
        );
    }
}
