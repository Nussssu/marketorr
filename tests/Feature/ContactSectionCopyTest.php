<?php

namespace Tests\Feature;

use App\Enums\InquiryType;
use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\User;
use Database\Seeders\PageSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactSectionCopyTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_migration_fills_the_contact_copy_and_the_contact_page_sends_it(): void
    {
        $page = Page::factory()->system()->create(['slug' => 'contact']);
        PageSection::factory()
            ->ofType(SectionType::Contact, ['heading' => 'Contact', 'intro' => ''])
            ->create(['page_id' => $page->id]);

        $this->migration()->up();

        $this->get('/contact')->assertInertia(fn ($inertia) => $inertia
            ->component('ContactPage')
            ->where('page.sections.0.content.titleLines', ['Have a project?', 'Let’s make', 'it matter.'])
            ->where('page.sections.0.content.intro', PageSeeder::contactContent()['intro'])
            ->has('page.sections.0.content.faqs', 7)
            ->has('page.sections.0.content.budgets', 5)
            ->where('page.sections.0.content.closingNote', 'We reply within 24–48 hours'));
    }

    public function test_copy_an_editor_already_wrote_is_kept(): void
    {
        $section = PageSection::factory()
            ->ofType(SectionType::Contact, ['heading' => 'Say hello', 'intro' => 'Our own words'])
            ->create();

        $this->migration()->up();
        $this->migration()->up();

        $content = $section->fresh()->content;
        $this->assertSame('Say hello', $content['heading']);
        $this->assertSame('Our own words', $content['intro']);
        $this->assertSame('Send inquiry', $content['submitLabel']);
    }

    public function test_an_admin_can_edit_the_faqs_and_budget_options(): void
    {
        $page = Page::factory()->create();
        $contact = PageSection::factory()->ofType(SectionType::Contact)->create(['page_id' => $page->id]);
        $faq = PageSection::factory()->ofType(SectionType::ContactFaq)->create(['page_id' => $page->id]);
        $faqs = [['question' => 'Do you take small projects?', 'answer' => 'Yes.']];

        $this->actingAs(User::factory()->create())
            ->put("/admin/pages/{$page->id}/sections/{$contact->id}", [
                'type' => SectionType::Contact->value,
                'name' => 'Start a project',
                'content' => ['heading' => 'Contact', 'budgets' => ['Under $5k']],
                'enabled' => true,
            ])
            ->assertRedirect();

        $this->actingAs(User::factory()->create())
            ->put("/admin/pages/{$page->id}/sections/{$faq->id}", [
                'type' => SectionType::ContactFaq->value,
                'name' => 'FAQs',
                'content' => ['label' => 'FAQs', 'items' => $faqs],
                'enabled' => true,
            ])
            ->assertRedirect();

        $this->assertSame(['Under $5k'], $contact->fresh()->content['budgets']);
        $this->assertSame($faqs, $faq->fresh()->content['items']);
    }

    public function test_the_form_labels_and_project_types_are_filled_and_the_allowed_types_are_shared(): void
    {
        $page = Page::factory()->system()->create(['slug' => 'contact']);
        $section = PageSection::factory()
            ->ofType(SectionType::Contact, ['heading' => 'Contact', 'nameLabel' => 'Full name'])
            ->create(['page_id' => $page->id]);

        $migration = require database_path('migrations/2026_10_15_122915_fill_contact_form_labels_and_project_types.php');
        $migration->up();

        $content = $section->fresh()->content;
        $this->assertSame('Full name', $content['nameLabel']);
        $this->assertSame('jane@company.com', $content['emailPlaceholder']);
        $this->assertSame(['Branding', 'UI/UX'], $content['projectTypes']);

        $this->get('/contact')->assertInertia(fn ($inertia) => $inertia
            ->where('inquiryTypes', InquiryType::values()));
    }

    private function migration(): Migration
    {
        return require database_path('migrations/2026_10_15_121949_fill_contact_section_copy.php');
    }
}
