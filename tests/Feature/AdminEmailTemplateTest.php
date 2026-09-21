<?php

namespace Tests\Feature;

use App\Enums\EmailTemplateKey;
use App\Enums\UserRole;
use App\Mail\TemplatedMail;
use App\Models\ContactSubmission;
use App\Models\EmailTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminEmailTemplateTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
    }

    public function test_templates_are_created_from_their_defaults_on_first_view(): void
    {
        $this->actingAs($this->superAdmin)
            ->get('/admin/email-templates')
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia
                ->component('Admin/EmailTemplates/Index')
                ->has('templates', count(EmailTemplateKey::cases())));

        $this->assertSame(count(EmailTemplateKey::cases()), EmailTemplate::query()->count());
    }

    public function test_a_super_admin_can_rewrite_a_template(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);

        $this->actingAs($this->superAdmin)
            ->put("/admin/email-templates/{$template->id}", [
                'subject' => 'Thanks {{ name }}',
                'body_html' => '<p>We have your note about {{ type }}.</p>',
                'enabled' => true,
            ])
            ->assertRedirect();

        $this->assertSame('Thanks {{ name }}', $template->fresh()->subject);
    }

    public function test_an_unknown_placeholder_is_rejected(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);

        $this->actingAs($this->superAdmin)
            ->put("/admin/email-templates/{$template->id}", [
                'subject' => 'Thanks',
                'body_html' => '<p>Hello {{ nmae }}</p>',
                'enabled' => true,
            ])
            ->assertSessionHasErrors('body_html');
    }

    public function test_placeholders_are_substituted_when_rendering(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $template->update([
            'subject' => 'Hi {{ name }}',
            'body_html' => '<p>{{ message }}</p>',
        ]);

        $rendered = $template->renderBody(['name' => 'Jane', 'message' => 'Hello there']);

        $this->assertSame('Hi Jane', $template->renderSubject(['name' => 'Jane']));
        $this->assertStringContainsString('Hello there', $rendered);
    }

    /**
     * The body is rendered as HTML and the values come from a public form, so
     * a submitted `<script>` must arrive as text, not markup.
     */
    public function test_substituted_values_are_escaped(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $template->update(['body_html' => '<p>{{ message }}</p>']);

        $rendered = $template->renderBody(['message' => '<script>alert(1)</script>']);

        $this->assertStringNotContainsString('<script>', $rendered);
        $this->assertStringContainsString('&lt;script&gt;', $rendered);
    }

    public function test_a_missing_value_renders_a_dash_rather_than_the_raw_token(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $template->update(['body_html' => '<p>{{ phone }}</p>']);

        $this->assertSame('<p>—</p>', $template->renderBody(['phone' => null]));
    }

    public function test_disabling_a_template_stops_that_email_only(): void
    {
        Mail::fake();

        EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder)->update(['enabled' => false]);

        $this->post('/contact', [
            'name' => 'Jane Cooper',
            'email' => 'jane@example.com',
            'type' => 'Branding',
            'message' => 'Hello there.',
        ]);

        Mail::assertSent(
            TemplatedMail::class,
            fn (TemplatedMail $mail) => $mail->template->key === EmailTemplateKey::AdminLeadNotification,
        );
        Mail::assertNotSent(
            TemplatedMail::class,
            fn (TemplatedMail $mail) => $mail->template->key === EmailTemplateKey::LeadAutoResponder,
        );
    }

    public function test_the_lead_email_carries_the_submissions_values(): void
    {
        $submission = ContactSubmission::factory()->create(['name' => 'Jane Cooper']);

        $placeholders = $submission->mailPlaceholders();

        $this->assertSame('Jane Cooper', $placeholders['name']);
        $this->assertArrayHasKey('site_name', $placeholders);
    }

    public function test_an_editor_cannot_reach_the_template_editor(): void
    {
        $editor = User::factory()->create(['role' => UserRole::Editor]);

        $this->actingAs($editor)->get('/admin/email-templates')->assertForbidden();
    }
}
