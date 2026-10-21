<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\UserRole;
use App\Models\CodeSnippet;
use App\Models\CodeSnippetAuditLog;
use App\Models\Setting;
use App\Models\User;
use App\Services\CodeInjector;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CodeSnippetTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        CodeInjector::forget();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Analytics',
            'description' => 'Site analytics',
            'type' => 'js',
            'location' => 'head',
            'code' => 'window.analyticsLoaded = true;',
            'priority' => 10,
            'target' => 'all',
            'target_paths' => [],
            'status' => 'published',
            'enabled' => true,
        ], $overrides);
    }

    public function test_a_published_snippet_runs_on_public_pages(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/admin/custom-code', $this->payload())
            ->assertSessionHasNoErrors();

        $snippet = CodeSnippet::query()->sole();
        $this->assertSame(1, $snippet->versions()->count());

        auth()->logout();
        $this->get('/')->assertSee('window.analyticsLoaded = true;', false)->assertSee('data-snippet="'.$snippet->id.'"', false);
    }

    public function test_each_placement_lands_in_its_place_in_priority_order(): void
    {
        CodeSnippet::factory()->create(['code' => 'window.second = 2;', 'priority' => 20]);
        CodeSnippet::factory()->create(['code' => 'window.first = 1;', 'priority' => 5]);
        CodeSnippet::factory()->create(['type' => 'css', 'location' => 'body_end', 'code' => '.x { color: red; }']);

        $html = $this->get('/')->getContent();

        $this->assertLessThan(strpos($html, 'window.second'), strpos($html, 'window.first'));
        $this->assertLessThan(strpos($html, '</head>'), strpos($html, 'window.second'));
        $this->assertGreaterThan(strpos($html, '<body>'), strpos($html, '.x { color: red; }'));
        $this->assertStringContainsString('<style data-snippet=', $html);
    }

    public function test_drafts_disabled_snippets_and_the_master_switch_keep_code_off_the_site(): void
    {
        CodeSnippet::factory()->draft()->create(['code' => 'window.draftCode = 1;']);
        CodeSnippet::factory()->create(['code' => 'window.offCode = 1;', 'enabled' => false]);
        CodeSnippet::factory()->create(['code' => 'window.liveCode = 1;']);

        $this->get('/')
            ->assertDontSee('window.draftCode', false)
            ->assertDontSee('window.offCode', false)
            ->assertSee('window.liveCode', false);

        $this->actingAs($this->superAdmin)->patch('/admin/custom-code/master', ['enabled' => false]);
        $this->assertFalse(Setting::current()->custom_code_enabled);

        auth()->logout();
        $this->get('/')->assertDontSee('window.liveCode', false);
    }

    public function test_custom_code_never_runs_inside_the_admin_panel(): void
    {
        CodeSnippet::factory()->create(['code' => 'window.liveCode = 1;']);

        $this->actingAs($this->superAdmin)
            ->get('/admin/dashboard')
            ->assertDontSee('window.liveCode', false);
    }

    public function test_page_specific_snippets_reach_only_their_pages(): void
    {
        $snippet = CodeSnippet::factory()->only(['/contact', '/about*'])->create(['code' => 'window.pageCode = 1;']);

        $this->get('/contact')->assertInertia(fn ($page) => $page
            ->has('codeSnippets', 1)
            ->where('codeSnippets.0.id', $snippet->id));

        $this->get('/about')->assertInertia(fn ($page) => $page->has('codeSnippets', 1));

        $this->get('/')
            ->assertInertia(fn ($page) => $page->has('codeSnippets', 0))
            ->assertDontSee('window.pageCode', false);
    }

    public function test_an_except_snippet_skips_its_listed_pages(): void
    {
        CodeSnippet::factory()->create(['target' => 'except', 'target_paths' => ['/contact']]);

        $this->get('/contact')->assertInertia(fn ($page) => $page->has('codeSnippets', 0));
        $this->get('/about')->assertInertia(fn ($page) => $page->has('codeSnippets', 1));
    }

    public function test_code_with_errors_can_be_saved_as_a_draft_but_not_published(): void
    {
        $broken = ['type' => 'js', 'code' => 'alert(1);</script><script>alert(2);'];

        $this->actingAs($this->superAdmin)
            ->post('/admin/custom-code', $this->payload($broken))
            ->assertSessionHasErrors('code');

        $this->actingAs($this->superAdmin)
            ->post('/admin/custom-code', $this->payload([...$broken, 'status' => 'draft']))
            ->assertSessionHasNoErrors();

        $this->assertSame(ContentStatus::Draft, CodeSnippet::query()->sole()->status);
    }

    public function test_page_paths_are_required_for_page_targeting(): void
    {
        $this->actingAs($this->superAdmin)
            ->post('/admin/custom-code', $this->payload(['target' => 'only', 'target_paths' => ['']]))
            ->assertSessionHasErrors('target_paths');
    }

    public function test_every_save_is_versioned_and_any_version_can_be_restored(): void
    {
        $this->actingAs($this->superAdmin)->post('/admin/custom-code', $this->payload());
        $snippet = CodeSnippet::query()->sole();

        $this->actingAs($this->superAdmin)
            ->put("/admin/custom-code/{$snippet->id}", $this->payload(['code' => 'window.changed = true;']))
            ->assertSessionHasNoErrors();

        $this->assertSame(2, $snippet->versions()->count());
        $this->get('/')->assertSee('window.changed', false);

        $first = $snippet->versions()->where('version', 1)->sole();
        $this->actingAs($this->superAdmin)->post("/admin/custom-code/{$snippet->id}/versions/{$first->id}/restore");

        $this->assertSame('window.analyticsLoaded = true;', $snippet->fresh()->code);
        $this->assertSame('Restored version 1', $snippet->versions()->first()->note);
        $this->get('/')->assertSee('window.analyticsLoaded', false)->assertDontSee('window.changed', false);
    }

    public function test_a_duplicate_starts_as_a_disabled_draft(): void
    {
        $snippet = CodeSnippet::factory()->create(['name' => 'Pixel']);

        $this->actingAs($this->superAdmin)->post("/admin/custom-code/{$snippet->id}/duplicate");

        $copy = CodeSnippet::query()->whereKeyNot($snippet->id)->sole();
        $this->assertSame('Pixel (Copy)', $copy->name);
        $this->assertSame(ContentStatus::Draft, $copy->status);
        $this->assertFalse($copy->enabled);
    }

    public function test_a_snippet_can_be_switched_off_and_deleted(): void
    {
        $snippet = CodeSnippet::factory()->create(['code' => 'window.toggleMe = 1;']);

        $this->actingAs($this->superAdmin)->patch("/admin/custom-code/{$snippet->id}/toggle", ['enabled' => false]);
        $this->assertFalse($snippet->fresh()->enabled);
        $this->get('/')->assertDontSee('window.toggleMe', false);

        $this->actingAs($this->superAdmin)->delete("/admin/custom-code/{$snippet->id}");
        $this->assertDatabaseCount('code_snippets', 0);
        $this->assertDatabaseCount('code_snippet_versions', 0);
    }

    public function test_every_custom_code_action_lands_in_the_audit_logs_without_the_code(): void
    {
        $this->actingAs($this->superAdmin)->post('/admin/custom-code', $this->payload(['status' => 'draft', 'code' => 'window.secretKey = "sk_live_123";']));
        $snippet = CodeSnippet::query()->sole();

        $this->put("/admin/custom-code/{$snippet->id}", $this->payload(['status' => 'draft', 'code' => 'window.secretKey = "sk_live_456";']));
        $this->put("/admin/custom-code/{$snippet->id}", $this->payload(['status' => 'published', 'code' => 'window.secretKey = "sk_live_456";']));
        $this->put("/admin/custom-code/{$snippet->id}", $this->payload(['location' => 'body_end', 'code' => 'window.secretKey = "sk_live_456";']));
        $this->put("/admin/custom-code/{$snippet->id}", $this->payload(['status' => 'draft', 'location' => 'body_end', 'code' => 'window.secretKey = "sk_live_456";']));
        $this->patch("/admin/custom-code/{$snippet->id}/toggle", ['enabled' => false]);
        $this->patch("/admin/custom-code/{$snippet->id}/toggle", ['enabled' => true]);
        $this->delete("/admin/custom-code/{$snippet->id}");

        $entries = CodeSnippetAuditLog::query()->orderBy('id')->get();
        $this->assertSame(
            ['created', 'updated', 'published', 'placement_changed', 'unpublished', 'disabled', 'enabled', 'deleted'],
            $entries->pluck('action')->all(),
        );
        $this->assertTrue($entries->every(fn (CodeSnippetAuditLog $entry): bool => $entry->user_id === $this->superAdmin->id
            && $entry->snippet_name === 'Analytics'
            && $entry->ip_address === '127.0.0.1'));
        $this->assertSame(['from' => 'head', 'to' => 'body_end'], $entries[3]->changes['location']);
        $this->assertStringNotContainsString('sk_live', $entries->toJson());

        $this->get('/admin/audit-logs?category=system')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('logs', fn ($logs) => collect($logs)->contains(fn (array $log): bool => $log['type'] === 'Custom Code'
                    && $log['title'] === 'Deleted: Analytics'
                    && $log['actor'] === $this->superAdmin->name
                    && $log['ip'] === '127.0.0.1')));
    }

    public function test_only_super_admins_can_manage_custom_code(): void
    {
        $editor = User::factory()->create(['role' => UserRole::Editor]);

        $this->actingAs($editor)->get('/admin/custom-code')->assertForbidden();
        $this->actingAs($editor)->post('/admin/custom-code', $this->payload())->assertForbidden();
        $this->assertDatabaseCount('code_snippets', 0);
    }

    public function test_the_live_check_reports_errors_and_warnings(): void
    {
        $this->actingAs($this->superAdmin)
            ->postJson('/admin/custom-code/check', ['type' => 'html', 'code' => '<script src="https://cdn.example.com/a.js">'])
            ->assertOk()
            ->assertJsonPath('errors.0', 'There are 1 <script> tag(s) but 0 closing </script> tag(s).')
            ->assertJsonFragment(['Loads files from: cdn.example.com. Only keep sources you trust.']);
    }
}
