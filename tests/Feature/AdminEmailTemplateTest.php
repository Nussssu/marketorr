<?php

namespace Tests\Feature;

use App\Enums\EmailTemplateKey;
use App\Enums\UserRole;
use App\Mail\TemplatedMail;
use App\Models\ContactSubmission;
use App\Models\EmailTemplate;
use App\Models\MailSetting;
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
                ->has('templates', count(EmailTemplateKey::cases()))
                ->has('widgets'));

        $this->assertSame(count(EmailTemplateKey::cases()), EmailTemplate::query()->count());
    }

    /**
     * The editor's Body box shows clean HTML with placeholders kept and no
     * inline styles; saved back, it is sent with the email styling added.
     */
    public function test_the_body_html_is_clean_and_is_styled_when_sent(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::AdminLeadNotification);
        $bodyHtml = $template->toAdminArray()['bodyHtml'];

        $this->assertStringContainsString('<h1>New project inquiry</h1>', $bodyHtml);
        $this->assertStringContainsString('<th>Email</th><td>{{ email }}</td>', $bodyHtml);
        $this->assertStringContainsString('<a href="{{ admin_url }}" class="button">Open in admin</a>', $bodyHtml);
        $this->assertStringNotContainsString('style=', $bodyHtml);

        $sent = (clone $template)
            ->forceFill(['blocks' => [['type' => 'html', 'html' => $bodyHtml]]])
            ->renderBody($template->key->sampleValues());

        $this->assertMatchesRegularExpression('#<h1 style="[^"]*font-size:24px#', $sent);
        $this->assertMatchesRegularExpression('#<a href="http[^"]+" class="button" style="[^"]*linear-gradient#', $sent);
        $this->assertStringContainsString('ayesha@example.com', $sent);
        $this->assertStringContainsString('$10k – $25k', $sent);
        $this->assertStringNotContainsString('{{', $sent);
    }

    /**
     * A style the editor wrote is kept as written.
     */
    public function test_an_element_the_editor_styled_keeps_its_own_style(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $template->update(['blocks' => [['type' => 'html', 'html' => '<p style="color:red">Hi</p><p>There</p>']]]);

        $rendered = $template->renderBody([]);

        $this->assertStringContainsString('<p style="color:red">Hi</p>', $rendered);
        $this->assertMatchesRegularExpression('#<p style="[^"]*color:\#d7d7e0[^"]*">There</p>#', $rendered);
    }

    public function test_a_super_admin_can_rewrite_a_template(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);

        $this->actingAs($this->superAdmin)
            ->put("/admin/email-templates/{$template->id}", [
                'subject' => 'Thanks {{ name }}',
                'blocks' => [
                    ['type' => 'heading', 'text' => 'Hello {{ name }}'],
                    ['type' => 'text', 'text' => 'We have your note about {{ type }}.'],
                ],
                'enabled' => true,
            ])
            ->assertRedirect();

        $template->refresh();
        $this->assertSame('Thanks {{ name }}', $template->subject);
        $this->assertSame('heading', $template->blocks[0]['type']);
        $this->assertCount(2, $template->blocks);
    }

    public function test_every_template_is_saved_at_once_from_the_single_save_bar(): void
    {
        $responder = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $others = collect(EmailTemplateKey::cases())
            ->reject(fn (EmailTemplateKey $key) => $key === EmailTemplateKey::LeadAutoResponder)
            ->map(fn (EmailTemplateKey $key) => EmailTemplate::forKey($key));

        $payload = [
            ['id' => $responder->id, 'subject' => 'Thanks {{ name }}', 'blocks' => [['type' => 'text', 'text' => 'About {{ type }}.']], 'enabled' => false],
            ...$others->map(fn (EmailTemplate $template) => ['id' => $template->id, 'subject' => $template->subject.' (edited)', 'blocks' => $template->blocks, 'enabled' => true])->values()->all(),
        ];

        $this->actingAs($this->superAdmin)
            ->put('/admin/email-templates', ['templates' => $payload])
            ->assertRedirect()
            ->assertSessionHas('success', 'Email templates saved.');

        $this->assertSame('Thanks {{ name }}', $responder->fresh()->subject);
        $this->assertFalse($responder->fresh()->enabled);
        $others->each(fn (EmailTemplate $template) => $this->assertStringEndsWith('(edited)', $template->fresh()->subject));
    }

    public function test_saving_all_templates_rejects_an_unknown_placeholder_and_saves_nothing(): void
    {
        $responder = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $original = $responder->subject;

        $this->actingAs($this->superAdmin)
            ->put('/admin/email-templates', ['templates' => [
                ['id' => $responder->id, 'subject' => 'Changed', 'blocks' => [['type' => 'text', 'text' => 'Hello {{ nmae }}']], 'enabled' => true],
            ]])
            ->assertSessionHasErrors('templates.0.blocks');

        $this->assertSame($original, $responder->fresh()->subject);
    }

    /**
     * Placeholders are per email: a lead email has no one-time action link.
     */
    public function test_a_placeholder_from_another_email_is_rejected(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);

        $this->actingAs($this->superAdmin)
            ->put("/admin/email-templates/{$template->id}", [
                'subject' => 'Thanks',
                'blocks' => [['type' => 'button', 'label' => 'Go', 'url' => '{{ action_url }}']],
                'enabled' => true,
            ])
            ->assertSessionHasErrors('blocks');
    }

    public function test_an_unknown_widget_type_is_rejected(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);

        $this->actingAs($this->superAdmin)
            ->put("/admin/email-templates/{$template->id}", [
                'subject' => 'Thanks',
                'blocks' => [['type' => 'marquee', 'text' => 'Hi']],
                'enabled' => true,
            ])
            ->assertSessionHasErrors('blocks.0.type');
    }

    public function test_placeholders_are_substituted_when_rendering(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $template->update([
            'subject' => 'Hi {{ name }}',
            'blocks' => [
                ['type' => 'heading', 'text' => 'Hello {{ name }}'],
                ['type' => 'quote', 'text' => '{{ message }}'],
                ['type' => 'details', 'rows' => [['label' => 'Email', 'value' => '{{ email }}']]],
            ],
        ]);

        $rendered = $template->renderBody(['name' => 'Jane', 'message' => 'Hello there', 'email' => 'jane@example.com']);

        $this->assertSame('Hi Jane', $template->renderSubject(['name' => 'Jane']));
        $this->assertStringContainsString('Hello Jane', $rendered);
        $this->assertStringContainsString('Hello there', $rendered);
        $this->assertStringContainsString('jane@example.com', $rendered);
    }

    public function test_every_email_renders_its_defaults_without_leftover_tokens(): void
    {
        foreach (EmailTemplateKey::cases() as $key) {
            $template = EmailTemplate::forKey($key);
            $preview = $template->preview();

            $this->assertSame([], $template->unknownPlaceholders(), $key->value);
            $this->assertStringNotContainsString('{{', $preview['subject'].$preview['body'], $key->value);
        }
    }

    /**
     * The body is rendered as HTML and the values come from a public form, so
     * a submitted `<script>` must arrive as text, not markup.
     */
    public function test_substituted_values_are_escaped(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $template->update(['blocks' => [
            ['type' => 'text', 'text' => '{{ message }}'],
            ['type' => 'html', 'html' => '<p>{{ message }}</p>'],
        ]]);

        $rendered = $template->renderBody(['message' => '<script>alert(1)</script>']);

        $this->assertStringNotContainsString('<script>', $rendered);
        $this->assertStringContainsString('&lt;script&gt;', $rendered);
    }

    public function test_a_missing_value_renders_a_dash_rather_than_the_raw_token(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder);
        $template->update(['blocks' => [['type' => 'html', 'html' => '<p>{{ phone }}</p>']]]);

        $this->assertMatchesRegularExpression('#<p style="[^"]*">-</p>#', $template->renderBody(['phone' => null]));
    }

    /**
     * Outside a message (the admin preview) the logo is linked, so it must be
     * a full URL, sized from the file's own proportions.
     */
    public function test_the_previewed_layout_links_the_logo_as_a_full_url(): void
    {
        $html = view('mail.templated', TemplatedMail::layoutData('<p>Hi</p>'))->render();

        $this->assertMatchesRegularExpression('#src="https?://[^"]+/images/logo/marketorr-logo-on-dark\.png"#', $html);
        $this->assertStringContainsString('height="24"', $html);
    }

    /**
     * A linked logo never loads when the site is not reachable from the
     * recipient's mail client (a local APP_URL), so a sent message carries
     * the logo inline.
     */
    public function test_a_sent_email_embeds_the_logo_in_the_message(): void
    {
        config(['mail.default' => 'array']);
        $template = EmailTemplate::forKey(EmailTemplateKey::SmtpTest);

        Mail::to('me@example.com')->send(new TemplatedMail($template, $template->key->sampleValues()));

        $email = app('mailer')->getSymfonyTransport()->messages()->last()->getOriginalMessage();

        $this->assertMatchesRegularExpression('#<img\s+src="cid:[^"]+"#', $email->getHtmlBody());
        $this->assertCount(1, $email->getAttachments());
        $this->assertSame('image/png', $email->getAttachments()[0]->getMediaType().'/'.$email->getAttachments()[0]->getMediaSubtype());
    }

    public function test_the_email_logo_set_in_settings_is_used_by_every_email(): void
    {
        $templates = collect(EmailTemplateKey::cases())->map(fn (EmailTemplateKey $key) => EmailTemplate::forKey($key));

        MailSetting::loadFromDatabase()->update(['email_logo_path' => '/images/logo/marketorr-logo-on-light.png']);
        MailSetting::forgetCurrent();

        foreach ($templates as $template) {
            $html = view('mail.templated', TemplatedMail::layoutData($template->renderBody([])))->render();

            $this->assertStringContainsString('marketorr-logo-on-light.png', $html, $template->key->value);
        }
    }

    public function test_the_preview_renders_unsaved_widgets_in_the_email_layout(): void
    {
        $template = EmailTemplate::forKey(EmailTemplateKey::AdminInvitation);
        $original = $template->subject;

        $response = $this->actingAs($this->superAdmin)
            ->postJson("/admin/email-templates/{$template->id}/preview", [
                'subject' => 'Welcome {{ name }}',
                'blocks' => [['type' => 'button', 'label' => 'Join now', 'url' => '{{ action_url }}']],
            ])
            ->assertOk()
            ->assertJsonPath('subject', 'Welcome Ayesha Rahman');

        $this->assertStringContainsString('Join now', $response->json('html'));
        $this->assertStringContainsString('marketorr-logo-on-dark.png', $response->json('html'));
        $this->assertSame($original, $template->fresh()->subject);
    }

    public function test_account_emails_are_sent_even_when_switched_off(): void
    {
        $reset = EmailTemplate::forKey(EmailTemplateKey::AdminPasswordReset);
        $reset->update(['enabled' => false]);

        $this->assertTrue($reset->isSendable());
        $this->assertFalse(EmailTemplate::forKey(EmailTemplateKey::LeadAutoResponder)->forceFill(['enabled' => false])->isSendable());
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
        $this->assertStringEndsWith("/admin/inquiries/{$submission->id}", $placeholders['admin_url']);
    }

    public function test_an_editor_cannot_reach_the_template_editor(): void
    {
        $editor = User::factory()->create(['role' => UserRole::Editor]);

        $this->actingAs($editor)->get('/admin/email-templates')->assertForbidden();
    }

    public function test_convenience_routes_redirect_to_mail_and_templates(): void
    {
        $this->actingAs($this->superAdmin)
            ->get('/admin/email-smtp')
            ->assertOk()
            ->assertInertia(fn ($inertia) => $inertia->component('Admin/Mail/Edit'));

        $this->actingAs($this->superAdmin)
            ->get('/admin/settings/email')
            ->assertRedirect('/admin/email-smtp');

        $this->actingAs($this->superAdmin)
            ->get('/admin/mail/templates')
            ->assertRedirect('/admin/email-templates');
    }
}
