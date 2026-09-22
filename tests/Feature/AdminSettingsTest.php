<?php

namespace Tests\Feature;

use App\Enums\EmailTemplateKey;
use App\Mail\TemplatedMail;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->superAdmin = User::factory()->create();
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge(Setting::defaults(), [
            'contact_email' => 'studio@marketorr.com',
            'contact_phone' => '+880 1234 567890',
            'hero_heading_lines' => ['We build', 'what converts.'],
        ], $overrides);
    }

    public function test_the_settings_form_renders_for_a_super_admin(): void
    {
        $this->actingAs($this->superAdmin)
            ->get('/admin/settings')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings')
                ->where('settings.contact_email', 'hello@marketorr.com'));
    }

    public function test_a_super_admin_can_save_settings(): void
    {
        $this->actingAs($this->superAdmin)
            ->put('/admin/settings', $this->validPayload([
                'header_sticky' => false,
                'header_cta_text' => 'Let us Talk',
                'header_cta_link' => '/get-in-touch',
            ]))
            ->assertSessionHas('success');

        $settings = Setting::query()->sole();

        $this->assertSame('studio@marketorr.com', $settings->contact_email);
        $this->assertSame('+880 1234 567890', $settings->contact_phone);
        $this->assertSame(['We build', 'what converts.'], $settings->hero_heading_lines);
        $this->assertFalse($settings->header_sticky);
        $this->assertSame('Let us Talk', $settings->header_cta_text);
        $this->assertSame('/get-in-touch', $settings->header_cta_link);
    }

    public function test_saved_settings_reach_the_public_site_immediately(): void
    {
        $this->actingAs($this->superAdmin)->put('/admin/settings', $this->validPayload([
            'hero_eyebrow' => 'Studio for ambitious brands',
            'social_dribbble' => null,
            'header_sticky' => false,
            'header_cta_text' => 'Get Started',
        ]));

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->where('settings.contactEmail', 'studio@marketorr.com')
                ->where('settings.contactPhone', '+880 1234 567890')
                ->where('settings.hero.eyebrow', 'Studio for ambitious brands')
                ->where('settings.hero.headingLines', ['We build', 'what converts.'])
                ->where('settings.socials.dribbble', null)
                ->where('settings.headerSticky', false)
                ->where('settings.headerCtaText', 'Get Started'));
    }

    public function test_the_contact_email_is_where_inquiry_notifications_are_sent(): void
    {
        Mail::fake();

        $this->actingAs($this->superAdmin)->put('/admin/settings', $this->validPayload());

        $this->post('/contact', [
            'name' => 'Jane Cooper',
            'email' => 'jane@example.com',
            'type' => 'Branding',
            'message' => 'Hello there.',
        ]);

        Mail::assertSent(
            TemplatedMail::class,
            fn (TemplatedMail $mail) => $mail->hasTo('studio@marketorr.com')
                && $mail->template->key === EmailTemplateKey::AdminLeadNotification,
        );
    }

    public function test_uploading_an_og_image_replaces_the_previous_file(): void
    {
        Storage::disk('public')->put('settings/old-og.jpg', 'original');
        Setting::current()->update(['meta_default_og_image' => 'settings/old-og.jpg']);
        Setting::forgetCurrent();

        $this->actingAs($this->superAdmin)->put('/admin/settings', $this->validPayload([
            'meta_default_og_image' => UploadedFile::fake()->image('og.jpg', 1200, 630),
        ]));

        $settings = Setting::query()->sole();

        $this->assertNotSame('settings/old-og.jpg', $settings->meta_default_og_image);
        Storage::disk('public')->assertMissing('settings/old-og.jpg');
        Storage::disk('public')->assertExists($settings->meta_default_og_image);
    }

    public function test_an_invalid_contact_email_is_rejected(): void
    {
        $this->actingAs($this->superAdmin)
            ->put('/admin/settings', $this->validPayload(['contact_email' => 'not-an-email']))
            ->assertSessionHasErrors('contact_email');

        $this->assertSame('hello@marketorr.com', Setting::current()->contact_email);
    }

    public function test_an_invalid_social_url_is_rejected(): void
    {
        $this->actingAs($this->superAdmin)
            ->put('/admin/settings', $this->validPayload(['social_linkedin' => 'not a url']))
            ->assertSessionHasErrors('social_linkedin');
    }

    public function test_an_editor_cannot_save_settings(): void
    {
        $this->actingAs(User::factory()->editor()->create())
            ->put('/admin/settings', $this->validPayload())
            ->assertStatus(403);

        $this->assertSame('hello@marketorr.com', Setting::current()->contact_email);
    }
}
