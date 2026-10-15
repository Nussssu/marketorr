<?php

namespace Tests\Feature;

use App\Enums\InquiryStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class LeadImportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_an_admin_can_import_leads_from_an_exported_csv(): void
    {
        $csv = <<<'CSV'
ID,Received,Name,Email,Phone,Company,Type,Budget,Message,Source page,Status
1,"2026-10-15 09:30:00","Jane Cooper",jane@example.com,+8801700000000,Acme,Branding,"$5k - $10k","We need a rebrand.",/contact,new
2,"2026-10-15 10:00:00","Bob Stone",bob@example.com,,,Other,,"Please call me.",/services,replied
CSV;

        $this->actingAs($this->admin)
            ->post('/admin/inquiries/import', [
                'csv' => UploadedFile::fake()->createWithContent('leads.csv', $csv),
            ])
            ->assertRedirect()
            ->assertSessionHas('success', '2 leads imported.');

        $this->assertDatabaseHas('contact_submissions', [
            'name' => 'Jane Cooper',
            'email' => 'jane@example.com',
            'status' => InquiryStatus::New->value,
        ]);
        $this->assertDatabaseHas('contact_submissions', [
            'name' => 'Bob Stone',
            'status' => InquiryStatus::Replied->value,
        ]);
    }

    public function test_an_invalid_row_does_not_partially_import_the_csv(): void
    {
        $csv = <<<'CSV'
Name,Email,Type,Message
"Jane Cooper",jane@example.com,Branding,"Valid row"
"Bob Stone",not-an-email,Other,"Invalid row"
CSV;

        $this->actingAs($this->admin)
            ->post('/admin/inquiries/import', [
                'csv' => UploadedFile::fake()->createWithContent('leads.csv', $csv),
            ])
            ->assertSessionHasErrors('csv');

        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public function test_required_csv_columns_are_validated(): void
    {
        $csv = <<<'CSV'
Name,Email
"Jane Cooper",jane@example.com
CSV;

        $this->actingAs($this->admin)
            ->post('/admin/inquiries/import', [
                'csv' => UploadedFile::fake()->createWithContent('leads.csv', $csv),
            ])
            ->assertSessionHasErrors('csv');

        $this->assertDatabaseCount('contact_submissions', 0);
    }

    public function test_guests_cannot_import_leads(): void
    {
        $this->post('/admin/inquiries/import')->assertRedirect('/admin/login');
    }
}
