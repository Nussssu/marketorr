<?php

namespace Tests\Feature;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Models\ContactSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInquiryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_the_list_shows_every_inquiry(): void
    {
        ContactSubmission::factory()->count(3)->create();

        $this->actingAs($this->admin)
            ->get('/admin/inquiries')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Inquiries/Index')
                ->has('inquiries.data', 3));
    }

    public function test_the_list_can_be_filtered_by_status(): void
    {
        ContactSubmission::factory()->create(['status' => InquiryStatus::New]);
        ContactSubmission::factory()->count(2)->create(['status' => InquiryStatus::Archived]);

        $this->actingAs($this->admin)
            ->get('/admin/inquiries?status=archived')
            ->assertInertia(fn ($page) => $page->has('inquiries.data', 2));
    }

    public function test_the_list_can_be_filtered_by_type(): void
    {
        ContactSubmission::factory()->create(['type' => InquiryType::Branding]);
        ContactSubmission::factory()->create(['type' => InquiryType::WebUiUx]);

        $this->actingAs($this->admin)
            ->get('/admin/inquiries?type='.urlencode('Web UI/UX'))
            ->assertInertia(fn ($page) => $page->has('inquiries.data', 1));
    }

    public function test_the_list_can_be_searched_by_name_or_email(): void
    {
        ContactSubmission::factory()->create(['name' => 'Jane Cooper', 'email' => 'jane@example.com']);
        ContactSubmission::factory()->create(['name' => 'Bob Stone', 'email' => 'bob@example.com']);

        $this->actingAs($this->admin)
            ->get('/admin/inquiries?search=jane')
            ->assertInertia(fn ($page) => $page
                ->has('inquiries.data', 1)
                ->where('inquiries.data.0.name', 'Jane Cooper'));
    }

    public function test_an_invalid_filter_is_rejected(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/inquiries?status=not-a-status')
            ->assertSessionHasErrors('status');
    }

    public function test_an_admin_can_view_an_inquiry(): void
    {
        $inquiry = ContactSubmission::factory()->create(['message' => 'We need a rebrand.']);

        $this->actingAs($this->admin)
            ->get("/admin/inquiries/{$inquiry->id}")
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Inquiries/Show')
                ->where('inquiry.message', 'We need a rebrand.'));
    }

    public function test_an_admin_can_change_the_status(): void
    {
        $inquiry = ContactSubmission::factory()->create(['status' => InquiryStatus::New]);

        $this->actingAs($this->admin)
            ->patch("/admin/inquiries/{$inquiry->id}/status", ['status' => 'replied'])
            ->assertSessionHas('success');

        $this->assertSame(InquiryStatus::Replied, $inquiry->refresh()->status);
    }

    public function test_an_invalid_status_is_rejected(): void
    {
        $inquiry = ContactSubmission::factory()->create(['status' => InquiryStatus::New]);

        $this->actingAs($this->admin)
            ->patch("/admin/inquiries/{$inquiry->id}/status", ['status' => 'nonsense'])
            ->assertSessionHasErrors('status');

        $this->assertSame(InquiryStatus::New, $inquiry->refresh()->status);
    }

    public function test_an_admin_can_delete_an_inquiry(): void
    {
        $inquiry = ContactSubmission::factory()->create();

        $this->actingAs($this->admin)
            ->delete("/admin/inquiries/{$inquiry->id}")
            ->assertRedirect('/admin/inquiries');

        $this->assertModelMissing($inquiry);
    }

    public function test_a_submitted_inquiry_shows_up_in_the_admin_list(): void
    {
        $this->post('/contact', [
            'name' => 'Jane Cooper',
            'email' => 'jane@example.com',
            'type' => 'Branding',
            'message' => 'Please get in touch.',
        ]);

        $this->actingAs($this->admin)
            ->get('/admin/inquiries')
            ->assertInertia(fn ($page) => $page
                ->has('inquiries.data', 1)
                ->where('inquiries.data.0.email', 'jane@example.com')
                ->where('inquiries.data.0.status', 'new'));
    }
}
