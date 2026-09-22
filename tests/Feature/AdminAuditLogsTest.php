<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ContactSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuditLogsTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $this->editor = User::factory()->create(['role' => UserRole::Editor]);
    }

    public function test_guests_cannot_reach_audit_logs(): void
    {
        $this->get('/admin/audit-logs')->assertRedirect('/admin/login');
    }

    public function test_admin_can_view_audit_logs(): void
    {
        ContactSubmission::factory()->create([
            'name' => 'Alice Doe',
            'email' => 'alice@example.com',
            'company' => 'Acme Corp',
        ]);

        $this->actingAs($this->superAdmin)
            ->get('/admin/audit-logs')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AuditLogs/Index')
                ->has('logs')
                ->has('filters')
                ->has('stats'));
    }

    public function test_category_filter_works_for_leads(): void
    {
        ContactSubmission::factory()->create([
            'name' => 'Bob Smith',
            'email' => 'bob@example.com',
        ]);

        $this->actingAs($this->superAdmin)
            ->get('/admin/audit-logs?category=leads')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AuditLogs/Index')
                ->where('filters.category', 'leads'));
    }
}
