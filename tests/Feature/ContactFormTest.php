<?php

namespace Tests\Feature;

use App\Enums\InquiryStatus;
use App\Mail\NewProjectInquiry;
use App\Models\ContactSubmission;
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

    public function test_successful_submission_sends_the_notification_email(): void
    {
        Mail::fake();

        $this->post('/contact', $this->validPayload());

        Mail::assertQueued(
            NewProjectInquiry::class,
            fn (NewProjectInquiry $mail) => $mail->hasTo(Setting::current()->contact_email)
                && $mail->submission->email === 'jane@example.com',
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
}
