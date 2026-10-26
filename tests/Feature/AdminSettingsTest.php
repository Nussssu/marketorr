<?php

namespace Tests\Feature;

use App\Enums\EmailTemplateKey;
use App\Enums\MenuLocation;
use App\Mail\TemplatedMail;
use App\Models\MailSetting;
use App\Models\Menu;
use App\Models\MenuItem;
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
                'footer_logo_visible' => false,
                'footer_motto_items' => ['THINK', 'CREATE', 'GROW'],
            ]))
            ->assertSessionHas('success');

        $settings = Setting::query()->sole();

        $this->assertSame('studio@marketorr.com', $settings->contact_email);
        $this->assertSame('+880 1234 567890', $settings->contact_phone);
        // Hero and About copy is edited under Pages now; saving Settings leaves it alone.
        $this->assertSame(Setting::defaults()['hero_heading_lines'], $settings->hero_heading_lines);
        $this->assertFalse($settings->header_sticky);
        $this->assertSame('Let us Talk', $settings->header_cta_text);
        $this->assertSame('/get-in-touch', $settings->header_cta_link);
        $this->assertFalse($settings->footer_logo_visible);
        $this->assertSame(['THINK', 'CREATE', 'GROW'], $settings->footer_motto_items);
    }

    public function test_the_email_logo_is_set_from_the_general_settings(): void
    {
        $this->actingAs($this->superAdmin)
            ->put('/admin/settings', $this->validPayload(['email_logo' => '/images/logo/marketorr-logo-on-light.png']))
            ->assertSessionHas('success');

        $this->assertSame('/images/logo/marketorr-logo-on-light.png', MailSetting::loadFromDatabase()->email_logo_path);

        $this->actingAs($this->superAdmin)
            ->get('/admin/settings')
            ->assertInertia(fn ($page) => $page->where('settings.email_logo', '/images/logo/marketorr-logo-on-light.png'));
    }

    public function test_saving_settings_without_the_email_logo_field_keeps_it(): void
    {
        MailSetting::loadFromDatabase()->update(['email_logo_path' => '/images/logo/marketorr-logo-on-light.png']);

        $this->actingAs($this->superAdmin)
            ->put('/admin/settings', $this->validPayload())
            ->assertSessionHas('success');

        $this->assertSame('/images/logo/marketorr-logo-on-light.png', MailSetting::loadFromDatabase()->email_logo_path);
    }

    public function test_saved_settings_reach_the_public_site_immediately(): void
    {
        $this->actingAs($this->superAdmin)->put('/admin/settings', $this->validPayload([
            'header_sticky' => false,
            'header_cta_text' => 'Get Started',
            'footer_motto_items' => ['IDEA', 'IMPACT'],
        ]));

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->where('settings.contactEmail', 'studio@marketorr.com')
                ->where('settings.contactPhone', '+880 1234 567890')
                ->where('settings.headerSticky', false)
                ->where('settings.headerCtaText', 'Get Started')
                ->where('settings.footerMottoItems', ['IDEA', 'IMPACT']));
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

    public function test_an_editor_cannot_save_settings(): void
    {
        $this->actingAs(User::factory()->editor()->create())
            ->put('/admin/settings', $this->validPayload())
            ->assertStatus(403);

        $this->assertSame('hello@marketorr.com', Setting::current()->contact_email);
    }

    public function test_the_settings_page_lists_the_site_wide_social_links(): void
    {
        $menu = Menu::query()->firstOrCreate(['location' => MenuLocation::FooterSocial], ['name' => 'Social']);
        $menu->items()->delete();
        MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'LinkedIn', 'url' => 'https://linkedin.com/company/acme', 'enabled' => true, 'sort_order' => 0]);
        MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Behance', 'url' => 'https://behance.net/acme', 'enabled' => false, 'sort_order' => 1]);

        $this->actingAs($this->superAdmin)
            ->get('/admin/settings')
            ->assertInertia(fn ($page) => $page
                ->has('socials', 2)
                ->where('socials.1.label', 'Behance')
                ->where('socials.1.enabled', false));

        $this->actingAs($this->superAdmin)
            ->get('/admin/menus')
            ->assertInertia(fn ($page) => $page->where('menus', fn ($menus) => ! collect($menus)->pluck('location')->contains('footer_social')));
    }

    public function test_custom_code_has_its_own_page(): void
    {
        $this->actingAs($this->superAdmin)
            ->get('/admin/custom-code')
            ->assertInertia(fn ($page) => $page->component('Admin/CustomCode/Index'));
    }
}
