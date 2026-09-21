<?php

namespace Tests\Feature;

use App\Enums\InquiryStatus;
use App\Models\ContactSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadExportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    private function csvFrom(string $url): string
    {
        $response = $this->actingAs($this->admin)->get($url);
        $response->assertOk();

        return $response->streamedContent();
    }

    public function test_the_export_is_a_csv_download(): void
    {
        ContactSubmission::factory()->create();

        $this->actingAs($this->admin)
            ->get('/admin/inquiries/export')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertDownload();
    }

    public function test_the_export_contains_a_header_row_and_every_lead(): void
    {
        $lead = ContactSubmission::factory()->create(['name' => 'Jane Cooper', 'email' => 'jane@example.com']);

        $csv = $this->csvFrom('/admin/inquiries/export');

        $this->assertStringContainsString('ID,Received,Name,Email', $csv);
        $this->assertStringContainsString('Jane Cooper', $csv);
        $this->assertStringContainsString($lead->email, $csv);
    }

    public function test_the_export_honours_the_status_filter(): void
    {
        ContactSubmission::factory()->create(['name' => 'New Lead', 'status' => InquiryStatus::New]);
        ContactSubmission::factory()->create(['name' => 'Archived Lead', 'status' => InquiryStatus::Archived]);

        $csv = $this->csvFrom('/admin/inquiries/export?status=new');

        $this->assertStringContainsString('New Lead', $csv);
        $this->assertStringNotContainsString('Archived Lead', $csv);
    }

    /**
     * Newlines inside a message would otherwise split one lead across several
     * CSV rows and shift every column after it.
     */
    public function test_newlines_in_a_message_do_not_break_the_row(): void
    {
        ContactSubmission::factory()->create([
            'name' => 'Jane Cooper',
            'message' => "First line\nSecond line",
        ]);

        $csv = $this->csvFrom('/admin/inquiries/export');

        $this->assertSame(2, substr_count(trim($csv), "\n") + 1);
        $this->assertStringContainsString('First line Second line', $csv);
    }

    public function test_guests_cannot_export_leads(): void
    {
        $this->get('/admin/inquiries/export')->assertRedirect('/admin/login');
    }

    public function test_an_admin_can_save_internal_notes_on_a_lead(): void
    {
        $lead = ContactSubmission::factory()->create();

        $this->actingAs($this->admin)
            ->patch("/admin/inquiries/{$lead->id}/notes", ['admin_notes' => 'Called, waiting on brief.'])
            ->assertRedirect();

        $this->assertSame('Called, waiting on brief.', $lead->fresh()->admin_notes);
    }

    public function test_marking_a_lead_replied_stamps_the_response_time(): void
    {
        $lead = ContactSubmission::factory()->create(['status' => InquiryStatus::New]);

        $this->actingAs($this->admin)
            ->patch("/admin/inquiries/{$lead->id}/status", ['status' => InquiryStatus::Replied->value]);

        $this->assertNotNull($lead->fresh()->responded_at);
    }

    public function test_the_response_stamp_is_not_overwritten_on_a_later_status_change(): void
    {
        $lead = ContactSubmission::factory()->create(['status' => InquiryStatus::New]);

        $this->actingAs($this->admin)
            ->patch("/admin/inquiries/{$lead->id}/status", ['status' => InquiryStatus::Replied->value]);
        $first = $lead->fresh()->responded_at;

        $this->actingAs($this->admin)
            ->patch("/admin/inquiries/{$lead->id}/status", ['status' => InquiryStatus::Archived->value]);

        $this->assertEquals($first, $lead->fresh()->responded_at);
    }
}
